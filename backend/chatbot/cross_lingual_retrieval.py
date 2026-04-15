from __future__ import annotations

from typing import Any, Dict, List, Tuple


def pinecone_match_list(res: Any) -> List[Any]:
  return getattr(res, "matches", None) or res.get("matches", []) or []


def match_score(m: Any) -> float:
  if isinstance(m, dict):
    return float(m.get("score", 0) or 0)
  return float(getattr(m, "score", 0) or 0)


def best_match_score(matches: List[Any]) -> float:
  if not matches:
    return 0.0
  return max(match_score(m) for m in matches)


def merge_pinecone_matches(a: List[Any], b: List[Any], top_k: int) -> List[Any]:
  """Merge two Pinecone match lists by vector id, keeping the higher score."""
  by_id: Dict[str, Tuple[float, Any]] = {}
  for group in (a, b):
    for m in group:
      if isinstance(m, dict):
        mid = str(m.get("id", "") or "")
        obj = m
      else:
        mid = str(getattr(m, "id", "") or "")
        obj = m
      if not mid:
        continue
      sc = match_score(obj)
      if mid not in by_id or sc > by_id[mid][0]:
        by_id[mid] = (sc, obj)
  ranked = sorted(by_id.values(), key=lambda x: -x[0])
  return [pair[1] for pair in ranked[:top_k]]
