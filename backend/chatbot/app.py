from __future__ import annotations

import logging
import os
from typing import Any, Dict, List

from flask import Flask, jsonify, request
from flask_cors import CORS
from pinecone import Pinecone

from cross_lingual_retrieval import (
  best_match_score,
  merge_pinecone_matches,
  pinecone_match_list,
)
from helper import (
  load_env,
  detect_language,
  get_embedding_model,
  build_context_from_matches,
  get_required_env,
)
from llm_client import deepseek_chat
from prompt import get_cross_lingual_amharic_system_prompt, get_system_prompt
from translation import expand_english_medical_keywords, translate_amharic_to_english_for_retrieval


INDEX_NAME = "medilink-medical-chatbot"

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

load_env()

logging.basicConfig(
  level=logging.INFO,
  format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
)
logger = logging.getLogger("medilink-chatbot")


def get_pinecone_client() -> Pinecone:
  api_key = get_required_env("PINECONE_API_KEY")
  return Pinecone(api_key=api_key)


def get_pinecone_index(pc: Pinecone):
  return pc.Index(INDEX_NAME)


pc_client: Pinecone | None = None
pc_index = None
embedding_model = None


def ensure_clients() -> None:
  global pc_client, pc_index, embedding_model
  if pc_client is None:
    pc_client = get_pinecone_client()
    pc_index = get_pinecone_index(pc_client)
  if embedding_model is None:
    embedding_model = get_embedding_model()
  get_required_env("DEEPSEEK_API_KEY")


def _embed_text(text: str) -> List[float]:
  te = (text or "").strip()
  if not te:
    te = "."
  query_emb = embedding_model.encode([te[:8000]], convert_to_numpy=False)
  if isinstance(query_emb, list):
    query_vector = query_emb[0]
  else:
    query_vector = query_emb[0]
  if hasattr(query_vector, "tolist"):
    query_vector = query_vector.tolist()
  return query_vector


def _pinecone_query(vector: List[float], top_k: int) -> Any:
  return pc_index.query(vector=vector, top_k=top_k, include_metadata=True)


@app.route("/api/health", methods=["GET"])
def health() -> Any:
  return jsonify({"status": "ok"}), 200


@app.route("/api/chat", methods=["POST"])
def chat() -> Any:
  """
  Cross-lingual RAG: Amharic → English for retrieval; answer in Amharic when the question is Amharic.
  Amharic path uses merged Pinecone results (translated sentence + keyword expansion) for better recall.
  """
  try:
    ensure_clients()
  except Exception as e:
    logger.exception("Failed to initialize clients")
    return jsonify({"error": "Server configuration error", "details": str(e)}), 500

  data: Dict[str, Any] = request.get_json(silent=True) or {}
  query: str = (data.get("query") or "").strip()

  if not query:
    return jsonify({"error": "Missing 'query' field in request body"}), 400

  language = detect_language(query)
  keywords_en = ""

  if language == "am":
    retrieval_query = translate_amharic_to_english_for_retrieval(query)
    keywords_en = expand_english_medical_keywords(query, retrieval_query)
    top_k = int(os.getenv("CHATBOT_AMHARIC_TOP_K", "14"))
    merge_cap = int(os.getenv("CHATBOT_AM_MERGE_TOP_K", "10"))
    logger.info(
      "Cross-lingual retrieval: translated_en=%r keywords_en=%r",
      retrieval_query[:220],
      keywords_en[:220],
    )
  else:
    retrieval_query = query
    top_k = int(os.getenv("CHATBOT_TOP_K", "5"))
    merge_cap = top_k

  try:
    matches: List[Any] = []
    seen_queries: List[str] = []

    def run_query(qtext: str) -> None:
      nonlocal matches
      qn = (qtext or "").strip()
      if len(qn) < 2 or qn in seen_queries:
        return
      seen_queries.append(qn)
      vec = _embed_text(qn)
      res = _pinecone_query(vec, top_k)
      chunk = pinecone_match_list(res)
      matches = merge_pinecone_matches(matches, chunk, merge_cap)

    run_query(retrieval_query)

    if language == "am" and keywords_en:
      combined = f"{retrieval_query}. {keywords_en}".strip()
      if combined != retrieval_query.strip():
        run_query(combined)
      run_query(keywords_en)

    if not matches:
      unknown_msg_en = "I don't know based on this medical book."
      unknown_msg_am = "በዚህ የሕክምና መጽሐፍ መሠረት አላወቅም።"
      return (
        jsonify(
          {
            "answer": unknown_msg_am if language == "am" else unknown_msg_en,
            "language": language,
            "source_count": 0,
          }
        ),
        200,
      )

    logger.info(
      "Retrieval: n_matches=%s best_score=%.4f",
      len(matches),
      best_match_score(matches),
    )

  except Exception as e:
    logger.exception("Retrieval failed")
    return jsonify({"error": "Vector index query failed", "details": str(e)}), 500

  text_and_scores: List[tuple[str, float]] = []
  for m in matches:
    md = getattr(m, "metadata", None) or m.get("metadata", {})  # type: ignore[union-attr]
    text = md.get("text") if isinstance(md, dict) else None
    sc = float(getattr(m, "score", md.get("score", 0.0))) if md is not None else 0.0  # type: ignore[union-attr]
    if text:
      text_and_scores.append((text, sc))

  context = build_context_from_matches(text_and_scores)

  if not context:
    unknown_msg_en = "I don't know based on this medical book."
    unknown_msg_am = "በዚህ የሕክምና መጽሐፍ መሠረት አላወቅም።"
    return (
      jsonify(
        {
          "answer": unknown_msg_am if language == "am" else unknown_msg_en,
          "language": language,
          "source_count": 0,
        }
      ),
      200,
    )

  if language == "am":
    system_prompt = get_cross_lingual_amharic_system_prompt(context=context)
    user_message = query
  else:
    system_prompt = get_system_prompt("en", context=context)
    user_message = query

  try:
    answer = deepseek_chat(
      [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message},
      ],
      temperature=0.7,
      max_tokens=2048,
    )
  except Exception as e:
    logger.exception("DeepSeek chat completion failed")
    return jsonify({"error": "Language model request failed", "details": str(e)}), 500

  if not answer.strip():
    unknown_msg_en = "I don't know based on this medical book."
    unknown_msg_am = "በዚህ የሕክምና መጽሐፍ መሠረት አላወቅም።"
    answer = unknown_msg_am if language == "am" else unknown_msg_en

  payload: Dict[str, Any] = {
    "answer": answer.strip(),
    "language": language,
    "source_count": len(text_and_scores),
  }
  if os.getenv("CHATBOT_DEBUG_RETRIEVAL", "").lower() in ("1", "true", "yes"):
    payload["retrieval_query_en"] = retrieval_query
    payload["retrieval_keywords_en"] = keywords_en
    payload["retrieval_subqueries"] = seen_queries

  return jsonify(payload), 200


if __name__ == "__main__":
  port = int(os.getenv("CHATBOT_PORT", "5001"))
  app.run(host="0.0.0.0", port=port, debug=True)
