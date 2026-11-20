"""Rule-based gear recommendations from intel text (no LLM)."""

import re
from typing import Dict, List

DEFAULT_RECOMMENDATION = ["doomspike-emf", "necro-sweep-spiritbox"]
MAX_RECOMMENDATIONS = 3

GEAR_KEYWORDS: Dict[str, List[str]] = {
    "black-tape-parabolic-evp": ["voice", "whisper", "evp", "scream", "choir", "singing", "moan", "footstep", "knock", "bang", "sound"],
    "necro-sweep-spiritbox": ["spirit box", "communicat", "seance", "séance", "talk", "radio", "respond", "answer", "spirit"],
    "abyssal-thermal-sls": ["cold", "chill", "temperature", "freez", "mist", "fog", "breath"],
    "pentagrid-laser-matrix": ["shadow", "apparition", "figure", "silhouette", "orb", "glimpse", "full-body", "sighting", "light"],
    "doomspike-emf": ["electric", "flicker", "emf", "battery", "drain", "energy", "power"],
    "iron-maiden-rempod": ["touch", "push", "grab", "poltergeist", "moving", "moved", "object", "door", "movement"],
}

_PATTERNS = {slug: [re.compile(r"\b" + re.escape(kw)) for kw in kws] for slug, kws in GEAR_KEYWORDS.items()}


def recommend_gear(text: str) -> List[str]:
    lowered = text.lower()
    scores = {slug: sum(len(p.findall(lowered)) for p in patterns) for slug, patterns in _PATTERNS.items()}
    ranked = [slug for slug, score in sorted(scores.items(), key=lambda kv: kv[1], reverse=True) if score > 0]
    return ranked[:MAX_RECOMMENDATIONS] or list(DEFAULT_RECOMMENDATION)
