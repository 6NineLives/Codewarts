"""Tagalog display labels for the 15-sign FSL model (internal keys stay English)."""

from __future__ import annotations

# Model / training keys (order matches action_labels_15.npy)
ENGLISH_KEYS = (
    "GOOD_AFTERNOON",
    "NICE_TO_MEET_YOU",
    "YES",
    "NO",
    "THANK_YOU",
    "HOW_ARE_YOU",
    "ONE",
    "TWO",
    "THREE",
    "SIX",
    "SEVEN",
    "CORRECT",
    "WRONG",
    "IM_FINE",
    "UNDERSTAND",
)

TAGALOG_BY_KEY: dict[str, str] = {
    "HELLO": "Hello",
    "GOOD_AFTERNOON": "Magandang hapon",
    "NICE_TO_MEET_YOU": "Ikinagagalak kitang makilala",
    "YES": "Oo",
    "NO": "Hindi",
    "THANK_YOU": "Salamat",
    "HOW_ARE_YOU": "Kumusta ka?",
    "ONE": "Isa",
    "TWO": "Dalawa",
    "THREE": "Tatlo",
    "SIX": "Anim",
    "SEVEN": "Pito",
    "CORRECT": "Tama",
    "WRONG": "Mali",
    "IM_FINE": "Okay lang ako",
    "UNDERSTAND": "Naiintindihan ko",
}


def to_tagalog(key: str) -> str:
    """Map internal sign key to Tagalog label for display."""
    if not key:
        return "—"
    normalized = key.strip().upper()
    return TAGALOG_BY_KEY.get(normalized, key.replace("_", " "))


def to_tagalog_list(keys: list[str]) -> list[str]:
    return [to_tagalog(k) for k in keys if k]
