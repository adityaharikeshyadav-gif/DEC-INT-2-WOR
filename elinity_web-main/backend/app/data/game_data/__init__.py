"""Game metadata and Lumi prompt builders, split by game."""

from .registry import GAMES_BY_SLUG, GAMES_CATALOG, PROMPT_BUILDERS, get_lumi_system_prompt

__all__ = [
    "GAMES_BY_SLUG",
    "GAMES_CATALOG",
    "PROMPT_BUILDERS",
    "get_lumi_system_prompt",
]

