"""Ordered game catalog and prompt dispatch registry."""

from collections.abc import Callable
from typing import Any

from . import (
    appreciation_game,
    callout,
    drift,
    letters_long_table,
    meta_game,
    odyssey_mind,
    philosophy_arena,
    planet_enigma,
    roleswap,
    the_unsaid,
    threadweave,
    turncoat,
    uncharted_horizons,
)

PUBLIC_GAME_MODULES = (
    drift,
    callout,
    threadweave,
    uncharted_horizons,
    the_unsaid,
    turncoat,
    letters_long_table,
    roleswap,
    planet_enigma,
    odyssey_mind,
    philosophy_arena,
    appreciation_game,
    # meta_game,
)

ALL_GAME_MODULES = PUBLIC_GAME_MODULES
GAMES_CATALOG = [module.GAME for module in PUBLIC_GAME_MODULES]
GAMES_BY_SLUG = {module.GAME["slug"]: module.GAME for module in ALL_GAME_MODULES}

PromptOptions = dict[str, Any]
PromptDispatcher = Callable[[str, list[str], list[str] | None, PromptOptions], str]


def _drift(mood: str, players: list[str], events: list[str] | None, options: PromptOptions) -> str:
    return drift.build_prompt(
        mood, players, events, options.get("phase", "ROUND_1"),
        options.get("players_state", {}), options.get("collective_answers", {}),
    )


def _callout(mood: str, players: list[str], events: list[str] | None, options: PromptOptions) -> str:
    return callout.build_prompt(
        mood, players, events, options.get("current_round", 1),
        options.get("phase", "ROUND_1_PROMPT"), options.get("scores", {}),
        options.get("round_data", {}),
    )


def _threadweave(_mood: str, players: list[str], events: list[str] | None, options: PromptOptions) -> str:
    return threadweave.build_prompt(
        options.get("mode", "loom"), options.get("texture", "hybrid"), players, events,
    )


def _uncharted(_mood: str, players: list[str], events: list[str] | None, options: PromptOptions) -> str:
    return uncharted_horizons.build_prompt(
        options.get("mode", "solo"), options.get("terrain", "dream"),
        options.get("depth_level", "surface"), players, events,
    )


def _unsaid(_mood: str, players: list[str], events: list[str] | None, options: PromptOptions) -> str:
    return the_unsaid.build_prompt(
        options.get("mode", "solo"), options.get("terrain", "hard_thing"),
        players, events, options.get("depth_level", "surface"),
        options.get("phase", "LOBBY"),
    )


def _turncoat(_mood: str, players: list[str], events: list[str] | None, options: PromptOptions) -> str:
    return turncoat.build_prompt(
        options.get("mode", "classic"), options.get("topic", "an open topic"),
        options.get("assigned_positions", {}), players, events,
        options.get("phase", "LOBBY"), options.get("round_number", 1),
    )


def _letters(_mood: str, players: list[str], events: list[str] | None, options: PromptOptions) -> str:
    return letters_long_table.build_prompt(
        options.get("mode", "conversation"), options.get("selected_ages", []),
        players, events, options.get("compass"), options.get("voice_material", []),
        options.get("phase", "LOBBY"), options.get("history", []),
    )


def _roleswap(_mood: str, players: list[str], events: list[str] | None, options: PromptOptions) -> str:
    return roleswap.build_prompt(
        options.get("swap_mode", "full"), options.get("scenario_level", 0),
        options.get("assignments", {}), players, events,
    )


def _planet(_mood: str, players: list[str], events: list[str] | None, options: PromptOptions) -> str:
    return planet_enigma.build_prompt(
        options.get("world", "desert_island"), options.get("mode", "solo"),
        players, options.get("puzzle_index", 0), options.get("vault", []), events,
    )


def _odyssey(_mood: str, players: list[str], events: list[str] | None, options: PromptOptions) -> str:
    return odyssey_mind.build_prompt(
        options.get("realm", "synthesis"), options.get("realm_type", "trial"),
        options.get("difficulty_tier", 1), options.get("attributes", {}),
        options.get("abilities", []), options.get("character_level", 1),
        options.get("rank", "Wanderer"), players, events,
    )


def _philosophy(_mood: str, players: list[str], events: list[str] | None, options: PromptOptions) -> str:
    return philosophy_arena.build_prompt(
        options.get("tier", "agora"), options.get("domain", "ethics"),
        options.get("challenge_format", "socratic_dialogue"),
        options.get("philosophical_rank", "Questioner"), options.get("abilities", []),
        options.get("agora_vocabulary", []),
        options.get("historical_witness_active", False), players, events,
    )


def _appreciation(_mood: str, players: list[str], events: list[str] | None, options: PromptOptions) -> str:
    return appreciation_game.build_prompt(players, events, options.get("opening_inventory", {}))


def _meta_game(_mood: str, players: list[str], events: list[str] | None, options: PromptOptions) -> str:
    return meta_game.build_prompt(
        options.get("mode", "discovery"), options.get("scenario_index", 0),
        options.get("current_scenario", {}), options.get("choices", {}),
        options.get("scores", {}), options.get("decision_profile", {}), players, events,
    )


PROMPT_BUILDERS: dict[str, PromptDispatcher] = {
    "drift": _drift,
    "callout": _callout,
    "threadweave": _threadweave,
    "uncharted-horizons": _uncharted,
    "the-unsaid": _unsaid,
    "turncoat": _turncoat,
    "letters-long-table": _letters,
    "roleswap": _roleswap,
    "planet-enigma": _planet,
    "odyssey-mind": _odyssey,
    "philosophy-arena": _philosophy,
    "appreciation-game": _appreciation,
    "game-of-games": _meta_game,
}


def get_lumi_system_prompt(
    game_slug: str,
    mood: str,
    players_list: list[str],
    session_events: list[str] | None = None,
    **kwargs: Any,
) -> str:
    """Build a game prompt, retaining Drift as the fallback for unknown slugs."""
    builder = PROMPT_BUILDERS.get(game_slug, PROMPT_BUILDERS["drift"])
    return builder(mood, players_list, session_events, kwargs)
