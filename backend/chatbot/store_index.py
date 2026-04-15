"""
One-time script to:
- Load the medical PDF from ../data/
- Split into chunks
- Generate sentence-transformer embeddings
- Store them in a Pinecone index

Run:
  cd backend/chatbot
  python store_index.py
"""

from __future__ import annotations

from pathlib import Path
from typing import List

import pinecone

from helper import (
  ROOT_DIR,
  load_env,
  load_pdf_text,
  split_text_into_chunks,
  embed_chunks,
  get_required_env,
)


INDEX_NAME = "medilink-medical-chatbot"
DIMENSION = 384
METRIC = "cosine"


def init_pinecone() -> None:
  api_key = get_required_env("PINECONE_API_KEY")
  # For older pinecone-client, environment is required but ignored for serverless
  pinecone.init(api_key=api_key, environment="us-east-1-aws")


def ensure_index() -> None:
  existing = pinecone.list_indexes()
  if INDEX_NAME not in existing:
    pinecone.create_index(
      name=INDEX_NAME,
      metric=METRIC,
      dimension=DIMENSION,
    )


def main() -> None:
  load_env()

  pdf_path = ROOT_DIR / "data" / "medical-book.pdf"
  print(f"[store_index] Loading PDF from: {pdf_path}")
  text = load_pdf_text(pdf_path)
  print(f"[store_index] Loaded {len(text)} characters of text.")

  print("[store_index] Splitting text into chunks ...")
  chunks: List[str] = split_text_into_chunks(text)
  print(f"[store_index] Created {len(chunks)} chunks.")

  print("[store_index] Computing embeddings with sentence-transformers/all-MiniLM-L6-v2 ...")
  vectors = embed_chunks(chunks)
  print("[store_index] Embeddings computed.")

  print("[store_index] Connecting to Pinecone ...")
  init_pinecone()
  ensure_index()
  index = pinecone.Index(INDEX_NAME)

  print(f"[store_index] Upserting {len(chunks)} vectors into index '{INDEX_NAME}' ...")
  # Prepare records: (id, vector, metadata)
  to_upsert = []
  for i, (chunk, embedding) in enumerate(zip(chunks, vectors)):
    vector_id = f"med-{i}"
    metadata = {"text": chunk}
    to_upsert.append(
      {
        "id": vector_id,
        "values": embedding,
        "metadata": metadata,
      }
    )

  # Upsert in reasonably-sized batches to avoid payload limits
  batch_size = 100
  for start in range(0, len(to_upsert), batch_size):
    end = start + batch_size
    batch = to_upsert[start:end]
    index.upsert(vectors=batch)
    print(f"[store_index] Upserted {end} / {len(to_upsert)}")

  print("[store_index] Done. You can now start the Flask app and query the chatbot.")


if __name__ == "__main__":
  main()

