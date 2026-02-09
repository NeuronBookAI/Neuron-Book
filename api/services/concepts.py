"""
Concept extraction from text (placeholder logic; can be replaced with NLP/LLM later).
"""
import re


def extract_concepts(text: str, limit: int = 5) -> list[str]:
    """Extract likely concept keywords from text."""
    if not text or not text.strip():
        return ["learning", "concept"]
    words = re.findall(r"\b[a-zA-Z]{4,}\b", text)
    stop = {"that", "this", "with", "from", "have", "what", "when"}
    seen: set[str] = set()
    out: list[str] = []
    for w in words[: limit * 2]:
        wl = w.lower()
        if wl not in seen and wl not in stop:
            seen.add(wl)
            out.append(wl)
            if len(out) >= limit:
                break
    return out if out else ["concept"]
