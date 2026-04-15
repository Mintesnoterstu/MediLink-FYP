from __future__ import annotations

import logging
import re

from llm_client import deepseek_chat

logger = logging.getLogger("medilink-chatbot")

_TRANSLATOR_SYSTEM = """You translate Amharic medical questions into English for search in an English-only medical encyclopedia.

Output rules:
- Return a SINGLE short English sentence (or compact phrase) a clinician would use to search a textbook.
- Include the main medical concept using standard English terms (e.g. "high blood pressure" for hypertension).
- Latin script ONLY. No Amharic, no Geʽez script, no quotes, no labels like "Translation:".
- If the input is already English, return a cleaned-up English search phrase only."""


_TRANSLATOR_STRICT = """The previous answer contained non-Latin text. Translate again.

Output: ONE line of English only (Latin letters, digits, spaces, and . , - ' ()). 
Describe the medical topic for encyclopedia search. No other scripts. No explanations."""


_KEYWORD_SYSTEM = """You help retrieve passages from an English medical encyclopedia.

Given an Amharic patient question and its English gloss, output ONE line of English search keywords:
- 6–14 comma-separated medical terms or short phrases
- Include synonyms (e.g. hypertension, high blood pressure)
- Latin script only, no Amharic, no full sentences, no punctuation except commas."""


def contains_ethiopic(s: str) -> bool:
  for ch in s:
    o = ord(ch)
    if (
      0x1200 <= o <= 0x137F
      or 0x1380 <= o <= 0x139F
      or 0x2D80 <= o <= 0x2DDF
      or 0xAB00 <= o <= 0xAB2F
    ):
      return True
  return False


def _clean_english_line(s: str) -> str:
  t = (s or "").strip()
  t = re.sub(r"^```[a-zA-Z0-9]*\s*", "", t)
  t = re.sub(r"\s*```\s*$", "", t).strip()
  for prefix in ("english:", "translation:", "answer:", "output:", "search query:"):
    low = t.lower()
    if low.startswith(prefix):
      t = t.split(":", 1)[-1].strip()
  t = re.sub(r'^[\u201c\u201d"\']|[\u201c\u201d"\']$', "", t).strip()
  return t


def translate_amharic_to_english_for_retrieval(text: str) -> str:
  """
  Translate Amharic (or mixed) user queries to English for embedding / vector search.
  Falls back to stripped original text on failure or unusable model output.
  """
  raw = text.strip()
  if not raw:
    return raw

  def call(system: str) -> str:
    return deepseek_chat(
      [
        {"role": "system", "content": system},
        {"role": "user", "content": raw},
      ],
      temperature=0.15,
      max_tokens=256,
    )

  try:
    out = call(_TRANSLATOR_SYSTEM)
  except Exception:
    logger.exception("Translation to English failed; using original query for retrieval")
    return raw

  cleaned = _clean_english_line(out)
  if contains_ethiopic(cleaned):
    try:
      cleaned = _clean_english_line(call(_TRANSLATOR_STRICT))
    except Exception:
      logger.exception("Strict English translation retry failed")

  if not cleaned or contains_ethiopic(cleaned):
    logger.warning("Translation unusable (empty or non-Latin); using original text for secondary retrieval only")
    return raw

  return cleaned


def expand_english_medical_keywords(amharic: str, english_gloss: str) -> str:
  """
  Short English keyword line to improve recall when the translated sentence alone embeds poorly.
  """
  amharic = (amharic or "").strip()
  english_gloss = (english_gloss or "").strip()
  if not amharic and not english_gloss:
    return ""

  user_block = f"Amharic question:\n{amharic}\n\nEnglish gloss:\n{english_gloss or '(none)'}"

  try:
    out = deepseek_chat(
      [
        {"role": "system", "content": _KEYWORD_SYSTEM},
        {"role": "user", "content": user_block},
      ],
      temperature=0.2,
      max_tokens=128,
    )
  except Exception:
    logger.exception("Keyword expansion for retrieval failed")
    return ""

  line = _clean_english_line(out).replace("\n", " ").strip()
  if contains_ethiopic(line):
    return ""
  # Keep a single line of keywords
  line = re.sub(r"\s+", " ", line)
  if len(line) < 3:
    return ""
  return line
