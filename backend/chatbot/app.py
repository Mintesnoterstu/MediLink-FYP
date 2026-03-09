from __future__ import annotations

import logging
import os
from typing import Any, Dict, List

from flask import Flask, jsonify, request
from flask_cors import CORS
from pinecone import Pinecone
import google.generativeai as genai

from helper import (
  ROOT_DIR,
  load_env,
  detect_language,
  get_embedding_model,
  build_context_from_matches,
  get_required_env,
)
from prompt import get_system_prompt


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


def get_gemini_model():
  """
  Configure and return a Gemini model for chat completion.
  """
  api_key = get_required_env("GOOGLE_API_KEY")
  genai.configure(api_key=api_key)
  # You can change the model name if needed
  return genai.GenerativeModel("gemini-1.5-pro")


pc_client: Pinecone | None = None
pc_index = None
gemini_model = None
embedding_model = None


def ensure_clients() -> None:
  global pc_client, pc_index, gemini_model, embedding_model
  if pc_client is None:
    pc_client = get_pinecone_client()
    pc_index = get_pinecone_index(pc_client)
  if gemini_model is None:
    gemini_model = get_gemini_model()
  if embedding_model is None:
    embedding_model = get_embedding_model()


@app.route("/api/health", methods=["GET"])
def health() -> Any:
  return jsonify({"status": "ok"}), 200


@app.route("/api/chat", methods=["POST"])
def chat() -> Any:
  """
  Chat endpoint for the MediLink medical chatbot.

  Request JSON:
    {
      "query": "What is malaria?"
    }
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

  # Detect language based on query characters (very simple heuristic)
  language = detect_language(query)

  # Compute embedding for the query
  try:
    query_emb = embedding_model.encode([query], convert_to_numpy=False)
    if isinstance(query_emb, list):
      query_vector = query_emb[0]
    else:
      query_vector = query_emb[0]
    if hasattr(query_vector, "tolist"):
      query_vector = query_vector.tolist()
  except Exception as e:
    logger.exception("Failed to embed query")
    return jsonify({"error": "Failed to embed query", "details": str(e)}), 500

  # Retrieve top-k similar chunks from Pinecone
  try:
    res = pc_index.query(
      vector=query_vector,
      top_k=5,
      include_metadata=True,
    )
  except Exception as e:
    logger.exception("Failed to query Pinecone")
    return jsonify({"error": "Vector index query failed", "details": str(e)}), 500

  matches: List[Any] = getattr(res, "matches", []) or res.get("matches", [])  # type: ignore[assignment]
  if not matches:
    # If we cannot find any relevant context, answer with "I don't know"
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

  # Build context string from metadata.text
  text_and_scores: List[tuple[str, float]] = []
  for m in matches:
    md = getattr(m, "metadata", None) or m.get("metadata", {})  # type: ignore[union-attr]
    text = md.get("text") if isinstance(md, dict) else None
    score = float(getattr(m, "score", md.get("score", 0.0))) if md is not None else 0.0  # type: ignore[union-attr]
    if text:
      text_and_scores.append((text, score))

  context = build_context_from_matches(text_and_scores)

  # If context is empty, return "I don't know"
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

  # Build system prompt for the detected language
  system_prompt = get_system_prompt(language, context=context)

  try:
    # Gemini expects a list of "parts". We pass the whole instruction as one part.
    response = gemini_model.generate_content(system_prompt + "\n\nUser question:\n" + query)
    answer = response.text or ""
  except Exception as e:
    logger.exception("Gemini chat completion failed")
    return jsonify({"error": "Language model request failed", "details": str(e)}), 500

  if not answer.strip():
    unknown_msg_en = "I don't know based on this medical book."
    unknown_msg_am = "በዚህ የሕክምና መጽሐፍ መሠረት አላወቅም።"
    answer = unknown_msg_am if language == "am" else unknown_msg_en

  return (
    jsonify(
      {
        "answer": answer.strip(),
        "language": language,
        "source_count": len(text_and_scores),
      }
    ),
    200,
  )


if __name__ == "__main__":
  port = int(os.getenv("CHATBOT_PORT", "5001"))
  app.run(host="0.0.0.0", port=port, debug=True)

