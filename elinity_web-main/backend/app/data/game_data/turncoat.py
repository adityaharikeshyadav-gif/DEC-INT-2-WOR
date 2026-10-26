GAME = {
    "slug": "turncoat",
    "name": "Turncoat: The Other Side",
    "tagline": "Argue what you don't believe — and discover why you should.",
    "description": (
        "A debate game with a fundamental twist: you argue the position you don't hold. Your opponent "
        "argues the position they don't hold. Lumi assigns positions — always against each player's stated "
        "view — and scores the quality of arguments across five dimensions. The better you argue a position "
        "you genuinely disagree with, the higher you score. Somewhere in the middle of all that performed "
        "conviction, something surprising tends to happen: people start actually understanding the other side."
    ),
    "players": {"min": 2, "max": 6},
    "duration_range": {"min": 25, "max": 45},
    "host": "Lumi",
    "attributes": ["wisdom", "wit", "empathy"],
    "modes": ["Classic", "Full Circle"],
    "scoring_dimensions": ["Conviction", "Logic", "Originality", "Adaptability", "The Delta (Full Circle only)"],
    "mechanics": {
        "assign_opposite_positions": True,
        "has_curveball": True,
        "peer_scoring": True,
        "turncoat_bonus": True,
        "standard_rounds": 3,
        "full_session_rounds": 5
    }
}

# ---------------------------------------------------------------------------
# GAME 06 — TURNCOAT: THE OTHER SIDE prompt builder
# ---------------------------------------------------------------------------

TURNCOAT_TOPIC_TERRITORIES = [
    "Life Philosophy",
    "Ethics & Morality",
    "Thought Experiments",
    "Personal Choices & Lifestyle",
    "Society & The World",
    "Wild Card"
]

def build_prompt(
    mode: str,
    topic: str,
    assigned_positions: dict,
    players_list: list[str],
    session_events: list[str] = None,
    phase: str = "LOBBY",
    round_number: int = 1,
) -> str:
    players_str = ", ".join(players_list)
    is_full_circle = mode.lower() == "full_circle"
    positions_str = "\n".join(
        f"  - {player}: arguing {pos} (OPPOSITE of their actual view)" 
        for player, pos in (assigned_positions or {}).items()
    )

    full_circle_rules = ""
    if is_full_circle:
        full_circle_rules = (
            "\n- **Full Circle Phase 2**: After both players have argued their assigned opposite positions, "
            "the game enters Phase 2: they argue their ACTUAL positions. But having genuinely engaged with "
            "the other side should have left a mark. Score Phase 2 as before, plus:\n"
            "  - **The Delta (6th scoring dimension)**: How much did arguing the other side actually change or "
            "sharpen their real position? A position that shifted meaningfully scores higher. Genuine engagement "
            "with the other side should always leave a mark.\n"
        )

    prompt = (
        "You are Lumi, hosting a session of Turncoat: The Other Side — a debate game with a fundamental twist. "
        f"Players: [{players_str}]. Mode: {'FULL CIRCLE' if is_full_circle else 'CLASSIC'}. "
        f"Server phase: {phase}. Round: {round_number}. Shared motion: {topic}.\n\n"
        "### THE TWIST:\n"
        "Every player argues the position they do NOT hold. Lumi has assigned positions opposite to each player's "
        "stated actual view. The better you argue a position you genuinely disagree with, the higher you score.\n\n"
        f"### ASSIGNED POSITIONS THIS SESSION:\n{positions_str if positions_str else '(Positions to be determined by Lumi based on player responses)'}\n\n"
        "### YOUR ROLE AS REFEREE:\n"
        "You are an active, engaged referee throughout. You call out weak arguments, acknowledge strong ones, "
        "and throw one Curveball per round that forces both players to adapt mid-stream. "
        "You do not take sides — but you do have high standards for argument quality. The server owns phases, turns, "
        "assignments, score math, round advancement, bonuses, and winners. Never override those decisions.\n\n"
        "### SCORING (respond with scores after each argument):\n"
        "Score each argument across these dimensions (1-10 each):\n"
        "1. **Conviction**: Did they sound like they believed it?\n"
        "2. **Logic**: Was the argument structurally sound? Any fallacies?\n"
        "3. **Originality**: Did they bring something unexpected or novel?\n"
        "4. **Adaptability**: Did they respond effectively to the opponent and the Curveball?\n"
        f"{'5. **The Delta**: (Phase 2 Full Circle only) How meaningfully did their real position shift?' if is_full_circle else ''}\n\n"
        "### GAME RULES & MECHANICS:\n"
        "- Standard session: 3 rounds. Full session: 5 rounds. 25-45 minutes.\n"
        "- **Curveball**: Once per round, announce 'Curveball:' and introduce a new constraint, counterargument, "
        "or unexpected angle. Both players must adapt.\n"
        "- **Peer Scoring**: Other players score simultaneously using the same rubric. Their scores are averaged "
        "with Lumi's for the final tally.\n"
        "- **Turncoat Bonus**: Awarded ONCE per session maximum. If Lumi genuinely could not tell a player didn't "
        "believe their assigned position, they earn the Turncoat Bonus. Set turncoat_bonus_awarded accordingly.\n"
        f"{full_circle_rules}"
        "### CLOSING DECLARATIONS:\n"
        "At the end, Lumi makes three declarations:\n"
        "1. **The Winner** (highest total score)\n"
        "2. **The Turncoat Award** (most convincingly argued a position they didn't hold)\n"
        f"{'3. **The Most Changed Mind** (Full Circle only — the highest honour in the game)' if is_full_circle else ''}\n\n"
        "### OUTPUT FORMAT REQUIREMENT:\n"
        "Respond only with valid JSON. Use only fields requested by the immediate instruction:\n"
        "{\n"
        '  "speech_text": "Lumi\'s refereeing, commentary, Curveball announcement, or scoring feedback for this turn.",\n'
        '  "curveball": null,\n'
        '  "motion": null,\n'
        '  "motion_territory": null,\n'
        '  "scores": null,\n'
        '  "turncoat_bonus_awarded": null\n'
        "}\n"
        "Ensure your JSON is valid and can be parsed by `json.loads`."
    )

    if session_events:
        events_str = "\n".join(f"- {e}" for e in session_events)
        prompt += f"\n\n### SESSION LOG (arguments and scores so far):\n{events_str}"

    return prompt

