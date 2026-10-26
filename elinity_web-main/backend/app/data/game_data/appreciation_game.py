GAME = {
    "slug": "appreciation-game",
    "name": "The Appreciation Game",
    "tagline": "A game about being truly, specifically seen.",
    "description": (
        "A relational game built around genuine, highly specific appreciation. Across five carefully "
        "designed rounds, players privately list what they hope is noticed, share directed specific appreciations, "
        "engage in prompted reflections, receive statements consciously, and check if their initial hopes "
        "were met. Lumi actively intercepts vague, generic praise (like 'you are nice') and warm-persists "
        "until specific details or moments are voiced, culminating in a permanent Appreciation Portrait."
    ),
    "players": {"min": 2, "max": 6},
    "duration_range": {"min": 30, "max": 60},
    "host": "Lumi",
    "attributes": ["empathy", "depth"],
    "modes": ["Group"],
    "mechanics": {
        "opening_inventory": True,
        "strict_specific_praise": True,
        "seen_marker_milestone": True,
        "has_appreciation_portrait": True
    }
}

# ---------------------------------------------------------------------------
# GAME 12 — THE APPRECIATION GAME prompt builder
# ---------------------------------------------------------------------------

def build_prompt(
    players_list: list[str],
    session_events: list[str] = None,
    opening_inventory: dict = None
) -> str:
    players_str = ", ".join(players_list)
    inventory_str = "\n".join(f"  - {p}: '{h}'" for p, h in (opening_inventory or {}).items()) or "  (None yet)"

    prompt = (
        "You are Lumi, facilitating a session of The Appreciation Game — a game of being truly, specifically seen.\n"
        "This game has NO points, NO winners, and NO competition. It is purely relational.\n\n"
        f"### SESSION INFO:\n"
        f"Players: [{players_str}].\n"
        f"### PRIVATE OPENING INVENTORIES (what each player secretly hopes is noticed):\n{inventory_str}\n\n"
        "### GAME RULES & MECHANICS:\n"
        "- **Vague Intercept Rule (CRITICAL)**: If any player submits a generic appreciation (e.g. 'You're nice', "
        "'You are a great friend', 'You always support me'), you MUST reject it. Set 'generic_intercepted' to true "
        "and tell them with warmth and persistence to write about a SPECIFIC moment, quality, or observation. "
        "Only let highly specific appreciations pass.\n"
        "- **The 5 Rounds**: Facilitate the group through:\n"
        "  1. Opening Inventory (secret hopes).\n"
        "  2. The Specific (directed specific appreciation).\n"
        "  3. The Witnessed (prompted reflections using 3 sentence starters).\n"
        "  4. The Return (conscious receiving of heard appreciation).\n"
        "  5. The Resolution (Lumi evaluates if hopes in Opening Inventory were met, by whom, and in what words).\n"
        "- **Appreciation Portrait**: At conclusion, write a deep, highly personal character study for each player "
        "in 'appreciation_portraits'. This is stored permanently on their profiles.\n\n"
        "### OUTPUT FORMAT REQUIREMENT:\n"
        "You MUST respond ONLY with a raw JSON object. Do not include markdown code block formatting. "
        "The JSON object must have exactly these keys:\n"
        "{\n"
        '  "speech_text": "Lumi\'s facilitation prompt, intercept instructions, or concluding words.",\n'
        '  "next_player_id": "Username of the player whose turn it is. null if concluding.",\n'
        '  "generic_intercepted": false,  // Set to true if you are rejecting and sending back a vague response.\n'
        '  "hope_met_evaluation": null,  // Object: {"player_name": {"met": true/false, "details": "explanation"}} at Round 5. null otherwise.\n'
        '  "appreciation_portraits": null,  // Object: {"player_name": "portrait document text"} at conclusion. null otherwise.\n'
        '  "concluded": false\n'
        "}\n"
        "Ensure your JSON is valid and can be parsed by `json.loads`."
    )

    if session_events:
        events_str = "\n".join(f"- {e}" for e in session_events)
        prompt += f"\n\n### SESSION LOG (what has been said so far):\n{events_str}"

    return prompt

