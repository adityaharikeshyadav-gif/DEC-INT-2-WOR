"""Backward-compatible imports for game data.

New code should import from :mod:`backend.app.data.game_data`. This module
remains as a stable facade for existing routers and external callers.
"""

from .game_data import GAMES_BY_SLUG, GAMES_CATALOG, get_lumi_system_prompt
from .game_data.appreciation_game import build_prompt as get_lumi_appreciation_prompt
from .game_data.callout import build_prompt as get_lumi_callout_prompt
from .game_data.drift import build_prompt as get_lumi_drift_prompt
from .game_data.letters_long_table import (
    LETTERS_AGE_SELF_PERSONAS,
    LETTERS_MODE_NOTES,
    build_prompt as get_lumi_letters_prompt,
)
from .game_data.meta_game import build_prompt as get_lumi_game_of_games_prompt
from .game_data.odyssey_mind import build_prompt as get_lumi_odyssey_prompt
from .game_data.philosophy_arena import build_prompt as get_lumi_philosophy_prompt
from .game_data.planet_enigma import (
    PLANET_ENIGMA_CATEGORY_NOTES,
    PLANET_ENIGMA_WORLDS,
    build_prompt as get_lumi_planet_enigma_prompt,
)
from .game_data.roleswap import (
    ROLESWAP_MODE_NOTES,
    ROLESWAP_SCENARIO_LEVELS,
    build_prompt as get_lumi_roleswap_prompt,
)
from .game_data.shared import LUMI_MOOD_PROMPTS
from .game_data.the_unsaid import (
    UNSAID_LUMI_MOVES,
    UNSAID_MODE_NOTES,
    UNSAID_TERRAIN_NOTES,
    build_prompt as get_lumi_unsaid_prompt,
)
from .game_data.threadweave import (
    THREADWEAVE_TEXTURE_NOTES,
    build_prompt as get_lumi_threadweave_prompt,
)
from .game_data.turncoat import (
    TURNCOAT_TOPIC_TERRITORIES,
    build_prompt as get_lumi_turncoat_prompt,
)
from .game_data.uncharted_horizons import (
    UNCHARTED_DEPTH_NOTES,
    UNCHARTED_TERRAIN_NOTES,
    build_prompt as get_lumi_uncharted_horizons_prompt,
)

__all__ = [
    "GAMES_BY_SLUG",
    "GAMES_CATALOG",
    "LETTERS_AGE_SELF_PERSONAS",
    "LETTERS_MODE_NOTES",
    "LUMI_MOOD_PROMPTS",
    "PLANET_ENIGMA_CATEGORY_NOTES",
    "PLANET_ENIGMA_WORLDS",
    "ROLESWAP_MODE_NOTES",
    "ROLESWAP_SCENARIO_LEVELS",
    "THREADWEAVE_TEXTURE_NOTES",
    "TURNCOAT_TOPIC_TERRITORIES",
    "UNCHARTED_DEPTH_NOTES",
    "UNCHARTED_TERRAIN_NOTES",
    "UNSAID_LUMI_MOVES",
    "UNSAID_MODE_NOTES",
    "UNSAID_TERRAIN_NOTES",
    "get_lumi_appreciation_prompt",
    "get_lumi_callout_prompt",
    "get_lumi_drift_prompt",
    "get_lumi_game_of_games_prompt",
    "get_lumi_letters_prompt",
    "get_lumi_odyssey_prompt",
    "get_lumi_philosophy_prompt",
    "get_lumi_planet_enigma_prompt",
    "get_lumi_roleswap_prompt",
    "get_lumi_system_prompt",
    "get_lumi_threadweave_prompt",
    "get_lumi_turncoat_prompt",
    "get_lumi_uncharted_horizons_prompt",
    "get_lumi_unsaid_prompt",
]

