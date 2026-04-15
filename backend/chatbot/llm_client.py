from __future__ import annotations

import json
import logging
import os
import urllib.error
import urllib.request
from typing import Any, Dict, List, Optional

from helper import get_required_env

logger = logging.getLogger("medilink-chatbot")


def _deepseek_chat_completions_url() -> str:
  base = os.getenv("DEEPSEEK_API_URL", "https://api.deepseek.com/v1").rstrip("/")
  return f"{base}/chat/completions"


def deepseek_chat(
  messages: List[Dict[str, str]],
  *,
  temperature: float = 0.7,
  max_tokens: int = 2048,
  model: Optional[str] = None,
) -> str:
  """
  OpenAI-compatible chat completion; returns assistant message text.
  """
  api_key = get_required_env("DEEPSEEK_API_KEY")
  m = model or os.getenv("DEEPSEEK_CHAT_MODEL", "deepseek-chat")
  url = _deepseek_chat_completions_url()
  payload: Dict[str, Any] = {
    "model": m,
    "messages": messages,
    "temperature": temperature,
    "max_tokens": max_tokens,
  }
  req = urllib.request.Request(
    url,
    data=json.dumps(payload).encode("utf-8"),
    headers={
      "Content-Type": "application/json",
      "Authorization": f"Bearer {api_key}",
    },
    method="POST",
  )
  try:
    with urllib.request.urlopen(req, timeout=120) as resp:
      raw = resp.read().decode("utf-8")
  except urllib.error.HTTPError as e:
    err_body = e.read().decode("utf-8", errors="replace")
    logger.error("DeepSeek HTTP error: %s %s", e.code, err_body)
    raise RuntimeError(f"DeepSeek API error ({e.code}): {err_body}") from e
  except urllib.error.URLError as e:
    logger.exception("DeepSeek connection failed")
    raise RuntimeError(f"DeepSeek connection failed: {e}") from e

  data = json.loads(raw)
  err = data.get("error")
  if err:
    msg = err.get("message", str(err)) if isinstance(err, dict) else str(err)
    raise RuntimeError(f"DeepSeek API error: {msg}")

  choices = data.get("choices") or []
  if not choices:
    return ""
  msg = choices[0].get("message") or {}
  content = msg.get("content")
  return (content or "").strip()
