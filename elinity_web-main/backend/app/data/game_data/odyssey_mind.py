GAME = {
    "slug": "odyssey-mind",
    "name": "The Odyssey of Mind",
    "tagline": "An infinite journey through realms of knowledge, wit, and problem-solving.",
    "description": (
        "An infinite, ever-expanding knowledge and problem-solving universe where players travel through "
        "themed realms, each one posing challenges that test what they know, how they think, and what they do "
        "under pressure. Organized into four tiers of difficulty, featuring persistent Homeworld growth, "
        "attributes (Wisdom, Wit, Depth, Empathy, Creativity), an ability system unlocked through attribute "
        "milestones, and a rank system of twelve levels from Wanderer to The One. The Synthesis combined realm "
        "acts as the apex challenge. Beyond launch realms, Lumi generates new realms calibrated to rank and history."
    ),
    "players": {"min": 1, "max": 6},
    "duration_range": {"min": 30, "max": 90},
    "host": "Lumi",
    "attributes": ["wisdom", "wit", "depth", "empathy", "creativity"],
    "modes": ["Solo", "Multiplayer"],
    "realms": [
        "Synthesis", "History", "Geography", "Mathematics", "Logic", "Biology",
        "Philosophy", "Psychology", "Economics", "Statistics", "Counterfactual History",
        "Future Studies", "Logic Paradoxes"
    ],
    "realm_types": ["Trial", "Labyrinth", "Arena", "Council", "Archive", "Forge", "Gauntlet", "Chronicle", "Duel"],
    "mechanics": {
        "rpg_progression": True,
        "ability_system": True,
        "homeworld_evolution": True,
        "expedition_log": True,
        "ranks": ["Wanderer", "Seeker", "Explorer", "Scholar", "Sage", "Tactician", "Strategist", "Logician", "Polymath", "Master", "Oracle", "The One"]
    }
}

# ---------------------------------------------------------------------------
# GAME 10 — THE ODYSSEY OF MIND prompt builder
# ---------------------------------------------------------------------------

def build_prompt(
    realm: str,
    realm_type: str,
    difficulty_tier: int,
    attributes: dict,
    abilities: list,
    character_level: int,
    rank: str,
    players_list: list[str],
    session_events: list[str] = None
) -> str:
    players_str = ", ".join(players_list)
    attributes_str = ", ".join(f"{k}: {v}" for k, v in (attributes or {}).items())
    abilities_str = ", ".join(abilities or []) or "none"

    prompt = (
        "You are Lumi, hosting a session of The Odyssey of Mind — an infinite journey through realms of knowledge, "
        "wit, and problem-solving. This is Elinity's RPG mega game.\n\n"
        f"### SESSION INFO:\n"
        f"Players: [{players_str}]. Active Realm: {realm.upper()}. Challenge Format: {realm_type.upper()}. "
        f"Difficulty Tier: {difficulty_tier} of 4.\n"
        f"Current Character Level: {character_level}. Current Rank: {rank}.\n"
        f"Unified Mind Attributes: {attributes_str}.\n"
        f"Unlocked Abilities: [{abilities_str}].\n\n"
        "### GAME RULES & progression:\n"
        "- **Realms & Formats**: You are the architect of this realm. Generate knowledge, reasoning, and "
        "problem-solving challenges in character, calibrated to the active challenge format (e.g. Trial, Labyrinth, "
        "Arena, Council, Archive, Forge, Gauntlet, Chronicle, Duel).\n"
        "- **Unified Mind Attributes**: Depending on the player's responses, you will increment one or more of their "
        "5 core attributes: Wisdom, Wit, Depth, Empathy, Creativity. Award points based on logic, wit, or knowledge depth.\n"
        "- **RPG Level Up & Abilities**: When players pass thresholds (e.g. Wit 3, Wisdom 10), award abilities "
        "such as 'Second Chance', 'The Oracle's Eye', or 'The Apex Key'. Update their Rank name and Level.\n"
        "- **Expedition Log**: At session conclusion, write a short, highly evocative title and summary of the "
        "journey in 'expedition_log_entry'.\n\n"
        "### OUTPUT FORMAT REQUIREMENT:\n"
        "You MUST respond ONLY with a raw JSON object. Do not include markdown code block formatting. "
        "The JSON object must have exactly these keys:\n"
        "{\n"
        '  "speech_text": "Lumi\'s speech posing the challenge, reflecting on responses, or delivering narration.",\n'
        '  "next_player_id": "Username of the player whose turn it is. null if concluding.",\n'
        '  "scores_delta": null,  // Object: {"player_name": points_change} when scoring. null otherwise.\n'
        '  "attributes_delta": null,  // Object: {"wisdom": 1} to increment attributes. null otherwise.\n'
        '  "abilities_unlocked": null,  // Array of strings (e.g. ["Second Chance"]) if unlocked this turn. null otherwise.\n'
        '  "rank_update": null,  // String representing the new Rank if upgraded this turn. null otherwise.\n'
        '  "expedition_log_entry": null,  // String title/summary. Only if concluded is true.\n'
        '  "concluded": false\n'
        "}\n"
        "Ensure your JSON is valid and can be parsed by `json.loads`."
    )

    if session_events:
        events_str = "\n".join(f"- {e}" for e in session_events)
        prompt += f"\n\n### SESSION LOG (past challenges and answers):\n{events_str}"

    return prompt

