import os
from pathlib import Path
from typing import List, Tuple

from dotenv import load_dotenv
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer


ROOT_DIR = Path(__file__).resolve().parents[2]
ENV_PATH = ROOT_DIR / ".env"


def load_env() -> None:
  """
  Load environment variables from the project root .env file.
  """
  if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH)


def load_pdf_text(pdf_path: Path) -> str:
  """
  Load text content from a PDF file.
  """
  if not pdf_path.exists():
    raise FileNotFoundError(f"PDF file not found at {pdf_path}")

  reader = PdfReader(str(pdf_path))
  pages_text: List[str] = []

  for page in reader.pages:
    try:
      text = page.extract_text() or ""
    except Exception:
      text = ""
    pages_text.append(text)

  full_text = "\n\n".join(pages_text).strip()

  if not full_text:
    raise ValueError(f"No text could be extracted from {pdf_path}")

  return full_text


def split_text_into_chunks(text: str, chunk_size: int = 1200, chunk_overlap: int = 200) -> List[str]:
  """
  Split long text into overlapping chunks suitable for embedding and retrieval,
  without relying on external libraries.
  """
  if not text:
    return []

  # First split on paragraph boundaries to keep sections somewhat intact
  paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
  chunks: List[str] = []
  current = ""

  for para in paragraphs:
    # If a single paragraph is longer than chunk_size, hard-split it
    while len(para) > chunk_size:
      piece = para[:chunk_size]
      para = para[chunk_size:]
      if current:
        chunks.append(current)
        current = ""
      chunks.append(piece)

    candidate = (current + "\n\n" + para).strip() if current else para
    if len(candidate) <= chunk_size:
      current = candidate
    else:
      if current:
        chunks.append(current)
      current = para

  if current:
    chunks.append(current)

  # Add simple overlap between chunks
  if chunk_overlap > 0 and len(chunks) > 1:
    overlapped: List[str] = []
    for i, ch in enumerate(chunks):
      if i == 0:
        overlapped.append(ch)
      else:
        prev = overlapped[-1]
        tail = prev[-chunk_overlap:]
        overlapped.append((tail + "\n\n" + ch).strip())
    chunks = overlapped

  return chunks


_embedding_model: SentenceTransformer | None = None


def get_embedding_model() -> SentenceTransformer:
  """
  Lazily load and cache the sentence-transformers embedding model.
  """
  global _embedding_model
  if _embedding_model is None:
    model_name = "sentence-transformers/all-MiniLM-L6-v2"
    _embedding_model = SentenceTransformer(model_name)
  return _embedding_model


def embed_chunks(chunks: List[str]) -> List[List[float]]:
  """
  Compute embeddings for a list of text chunks.
  """
  model = get_embedding_model()
  embeddings = model.encode(chunks, show_progress_bar=True, convert_to_numpy=False)
  # Ensure we always return plain Python lists for JSON/pinecone compatibility
  return [emb.tolist() if hasattr(emb, "tolist") else list(emb) for emb in embeddings]


def detect_language(text: str) -> str:
  """
  If the text contains Geʽez / Ethiopic script (Amharic, etc.), return 'am'; else 'en'.
  Covers main Unicode blocks used for Amharic.
  """
  for ch in text:
    o = ord(ch)
    if (
      0x1200 <= o <= 0x137F  # Ethiopic
      or 0x1380 <= o <= 0x139F  # Ethiopic Supplement
      or 0x2D80 <= o <= 0x2DDF  # Ethiopic Extended
      or 0xAB00 <= o <= 0xAB2F  # Ethiopic Extended-A
    ):
      return "am"
  return "en"


def build_context_from_matches(matches: List[Tuple[str, float]], max_chars: int = 2000) -> str:
  """
  Build a single context string from Pinecone matches.

  Each match is expected to be (text, score). We concatenate the best chunks
  up to max_chars characters.
  """
  context_parts: List[str] = []
  total_len = 0

  for text, _score in matches:
    if not text:
      continue
    if total_len + len(text) > max_chars:
      remaining = max_chars - total_len
      if remaining <= 0:
        break
      context_parts.append(text[:remaining])
      total_len += remaining
      break
    context_parts.append(text)
    total_len += len(text)

  return "\n\n".join(context_parts).strip()


def get_required_env(name: str) -> str:
  """
  Read a required environment variable and raise a clear error if missing.
  """
  value = os.getenv(name)
  if not value:
    raise RuntimeError(f"Environment variable {name} is required but not set.")
  return value

