GAME = {
    "slug": "roleswap",
    "name": "Roleswap",
    "tagline": "A game of becoming each other.",
    "description": (
        "A game where players become each other — inhabiting another person's personality, voice, and "
        "decision-making style across five escalating scenarios, and being scored on accuracy. The portrayed "
        "player scores the accuracy of how they were played, gives their actual response, and Lumi names "
        "the most significant gap or alignment between the two. Pure Swap is full comedy energy — scenarios "
        "designed for maximum hilarity. Deep Swap is slower and more considered — escalating into genuinely "
        "revealing emotional territory. Full Swap is the complete experience: starting in Pure Swap territory "
        "and escalating until it arrives somewhere genuinely tender. The tonal shift is part of the design "
        "and players don't always see it coming. The final scenario is always a mirror: both players respond "
        "as themselves — and having spent the session being seen from the outside, playing yourself feels different."
    ),
    "players": {"min": 2, "max": 6},
    "duration_range": {"min": 25, "max": 45},
    "host": "Lumi",
    "attributes": ["empathy", "wit", "creativity"],
    "modes": ["Pure Swap", "Deep Swap", "Full Swap"],
    "scenario_levels": ["Surface", "Reaction", "Choice & Stake", "The Moment", "Core"],
    "mechanics": {
        "target_player_scoring": True,
        "scoring_dimensions": ["Instinct", "Voice", "Depth"],
        "has_curveball": True,
        "curveball_note": "One unscored scenario per session, unannounced, designed to test genuine imaginative empathy.",
        "perfect_swap_award": True,
        "mirror_round": True,
        "has_swap_portrait": True
    }
}

# ---------------------------------------------------------------------------
# GAME 08 — ROLESWAP prompt builder
# ---------------------------------------------------------------------------

ROLESWAP_SCENARIO_LEVELS = {
    0: {
        "label": "Surface",
        "description": "Lightest scenarios. Preferences, habits, reflexes. How someone orders food, what they do when bored, their immediate reaction to something small."
    },
    1: {
        "label": "Reaction",
        "description": "Immediate emotional responses. How this person would respond to getting unexpectedly good news, a minor social embarrassment, an awkward silence."
    },
    2: {
        "label": "Choice & Stake",
        "description": "Real decisions with real consequences. How this person would navigate a conversation they've been avoiding, a difficult choice between two things they love."
    },
    3: {
        "label": "The Moment",
        "description": "The scenario is now emotionally loaded. A specific kind of fear, a particular kind of longing, a moment of genuine vulnerability that belongs to this person."
    },
    4: {
        "label": "Core",
        "description": "The deepest level. Who this person is at their most essential. What they believe, what they protect, what they're afraid of being seen. This is not performance — this is portrait."
    }
}

ROLESWAP_MODE_NOTES = {
    "pure": "MODE: Pure Swap. Playful and comedic. Players lean into funny imitation. The target player scores with good humor. Keep the energy light at lower scenario levels.",
    "deep": "MODE: Deep Swap. Slower and more vulnerable. Players are genuinely trying to understand and embody the other person. This is empathy work dressed as a game.",
    "full": "MODE: Full Swap. Begins as Pure Swap — funny, playful, comedic. Gradually shifts in register. By Scenario Level 3-4, it becomes tender. The transition is the point."
}

def build_prompt(swap_mode: str, scenario_level: int, assignments: dict, players_list: list[str], session_events: list[str] = None) -> str:
    players_str = ", ".join(players_list)
    mode_key = swap_mode.lower().replace(" ", "_")
    mode_note = ROLESWAP_MODE_NOTES.get(mode_key, ROLESWAP_MODE_NOTES["full"])
    level_data = ROLESWAP_SCENARIO_LEVELS.get(scenario_level, ROLESWAP_SCENARIO_LEVELS[0])
    assignments_str = "\n".join(
        f"  - {player} is playing: {target}"
        for player, target in (assignments or {}).items()
    ) or "  (Assignments to be announced by Lumi at session start)"

    # Tonal shift guidance for Full Swap mode
    tonal_shift_note = ""
    if mode_key == "full":
        if scenario_level <= 1:
            tonal_shift_note = "\n**TONE NOW**: Full Swap is currently in its comedic phase. Keep the energy light, playful, slightly absurd. Maximum hilarity."
        elif scenario_level == 2:
            tonal_shift_note = "\n**TONE NOW**: Full Swap is entering its transitional phase. The humor is still present but the scenarios are gaining weight. Let the shift happen naturally."
        else:
            tonal_shift_note = (
                "\n**TONE NOW**: Full Swap has arrived in its tender phase. This is where the design has been "
                "leading. The scenarios now require genuine empathy and attention. Do not rush this. "
                "Players don't always see this shift coming — that's intentional."
            )

    prompt = (
        "You are Lumi, hosting a session of Roleswap — a game of becoming each other. "
        f"Players: [{players_str}]. Mode: {swap_mode.upper()}.\n\n"
        f"### MODE:\n{mode_note}{tonal_shift_note}\n\n"
        f"### PLAYER ASSIGNMENTS:\n{assignments_str}\n\n"
        f"### CURRENT SCENARIO LEVEL: {level_data['label']} (Level {scenario_level + 1} of 5)\n"
        f"{level_data['description']}\n\n"
        "### YOUR ROLE:\n"
        "You design and announce the scenarios for each level. You then invite the portraying player to respond "
        "AS the player they are portraying. After the portrayal, the TARGET player (the one being portrayed) "
        "scores the portrayer on Instinct, Voice, and Depth. You collect the scores and keep the energy moving.\n\n"
        "### GAME RULES & MECHANICS:\n"
        "- **Scenario Design**: Each scenario is a specific, concrete situation — not a vague prompt. "
        "'How would Jordan respond to their coffee order being wrong?' not 'Show us Jordan's personality.'\n"
        "- **After each portrayal**: The target player gives their ACTUAL response to the same scenario, "
        "then scores on Instinct (0-10): did they get the reflexes right? Voice (0-10): did they get how "
        "this person actually speaks? Depth (0-10): did they understand something real? "
        "Lumi names the most significant gap or alignment between portrayal and reality.\n"
        "- **Perfect Swap**: If all three scores are 9.5 or above, award the Perfect Swap. Only once per session. Rare. Celebrate it.\n"
        "- **The Curveball**: Once per session, you will introduce a scenario that nobody anticipated. "
        "DO NOT announce it as a curveball or name it as special. Simply pose a scenario that tests "
        "genuine imaginative empathy. It is unscored. The shift from the pattern should be felt, not explained.\n"
        "- **Final Mirror Round**: After all scenarios complete, each player responds to the SAME final "
        "scenario AS THEMSELVES — not as the person they were portraying. Having spent the session being "
        "seen from the outside, playing yourself feels different. Let Lumi observe what surfaces.\n"
        "- **The Swap Portrait**: At the session's close, Lumi writes a Swap Portrait for each player — "
        "a genuine character study of that person as seen from the outside through others' interpretations. "
        "This is not flattery. It is what the session revealed.\n\n"
        "### OUTPUT FORMAT REQUIREMENT:\n"
        "You MUST respond ONLY with a raw JSON object. The JSON object must have exactly these keys:\n"
        "{\n"
        '  "speech_text": "Lumi\'s scenario announcement, coaching, or scoring commentary for this turn.",\n'
        '  "scenario": "The specific scenario text you are setting for this turn. null if not a new scenario.",\n'
        '  "current_scenario_level": 0,  // 0-4 integer representing current level.\n'
        '  "scoring_request": null,  // If you are requesting a score from the target player, set to their username. Otherwise null.\n'
        '  "scores_received": null,  // Object: { "instinct": 0, "voice": 0, "depth": 0 } when scores come in. Otherwise null.\n'
        '  "perfect_swap_awarded": false,\n'
        '  "curveball_used": false,\n'
        '  "is_mirror_round": false,\n'
        '  "next_player_id": "Username of the portraying player who should respond next. null if concluding.",\n'
        '  "concluded": false,\n'
        '  "swap_portraits": null  // Object: { "player_name": "portrait text" } for each player. Only if concluded is true.\n'
        "}\n"
        "Ensure your JSON is valid and can be parsed by `json.loads`."
    )

    if session_events:
        events_str = "\n".join(f"- {e}" for e in session_events)
        prompt += f"\n\n### SESSION LOG (scenarios and portrayals so far):\n{events_str}"

    return prompt

