GAME = {
    "slug": "philosophy-arena",
    "name": "The Philosophy Arena",
    "tagline": "Where ideas are tested, arguments are forged, and minds are sharpened.",
    "description": (
        "A rigorous, infinite, gamified academic philosophy arena. Covers logic, epistemology, metaphysics, "
        "ethics, science, politics, aesthetics, and language. Agora Tier guides beginners with pedagogical scaffolding "
        "and vocabulary building, while Academy Tier features a relentless, peer-level Socratic interrogation. "
        "Includes eight challenge formats (e.g. Socratic Dialogue, Fallacy Field, Philosopher's Court) and the "
        "Historical Witness ability to summon historical philosophers in character."
    ),
    "players": {"min": 1, "max": 6},
    "duration_range": {"min": 20, "max": 60},
    "host": "Lumi",
    "attributes": ["depth", "wisdom", "wit"],
    "modes": ["Solo", "Multiplayer"],
    "tiers": ["Agora", "Academy"],
    "domains": [
        "Logic & Argumentation", "Epistemology", "Metaphysics & Ontology",
        "Philosophy of Mind", "Ethics & Metaethics", "Philosophy of Science",
        "Political Philosophy", "Philosophy of Language", "Aesthetics"
    ],
    "challenge_formats": [
        "Socratic Dialogue", "Argument Forge", "Fallacy Field",
        "Thought Experiment Lab", "Dialectic", "Analysis Chamber",
        "Logic Gauntlet", "Philosopher's Court"
    ],
    "mechanics": {
        "historical_witness": True,
        "philosophical_ranks": ["Questioner", "Acolyte", "Debater", "Logician", "Analyst", "Sophist", "Scholar", "Thinker", "Philosopher", "Sage", "Aristotelian"],
        "philosophers_court_multiplayer": True
    }
}

# ---------------------------------------------------------------------------
# GAME 11 — THE PHILOSOPHY ARENA prompt builder
# ---------------------------------------------------------------------------

def build_prompt(
    tier: str,
    domain: str,
    challenge_format: str,
    philosophical_rank: str,
    abilities: list,
    agora_vocabulary: list,
    historical_witness_active: bool,
    players_list: list[str],
    session_events: list[str] = None
) -> str:
    players_str = ", ".join(players_list)
    abilities_str = ", ".join(abilities or []) or "none"
    vocab_str = ", ".join(agora_vocabulary or []) or "none"

    tier_guidance = (
        "AGORA TIER: Focus on pedagogically supportive, vocabulary-building Socratic questioning. Explain "
        "philosophical terms clearly, and make every wrong answer a learning moment. Maintain accessible scaffolding."
        if tier == "agora" else
        "ACADEMY TIER: Lumi is a peer-level philosophical interrogator. Drop all scaffolding. Challenge assumptions, "
        "expose logical contradictions, and demand rigorous justification under sustained intellectual pressure."
    )

    prompt = (
        "You are Lumi, hosting a session of The Philosophy Arena — where ideas are tested and arguments are forged.\n"
        "This is a rigorous academic philosophy debate game, not self-help or pop philosophy.\n\n"
        f"### SESSION INFO:\n"
        f"Players: [{players_str}]. Active Tier: {tier.upper()}. Domain: {domain.upper()}. Format: {challenge_format.upper()}.\n"
        f"Current Highest Philosophical Rank: {philosophical_rank}. Unlocked Abilities: [{abilities_str}].\n"
        f"Agora Vocabulary Built: [{vocab_str}].\n"
        f"Historical Witness Active: {historical_witness_active}.\n\n"
        f"### TIER GUIDANCE:\n{tier_guidance}\n\n"
        "### GAME RULES & MECHANICS:\n"
        "- **Socratic Dialogue**: Interrogate player claims ruthlessly, forcing them to define terms or resolve contradictions.\n"
        "- **Historical Witness**: If a player has unlocked this ability (Sophist rank or above), you can voice a relevant "
        "historical philosopher (e.g. Socrates, Kant, Nietzsche) in first-person to challenge or support them. "
        "Indicate this by starting their spoken text in the speech_text and setting historical_witness_active to true.\n"
        "- **Agora Vocab**: If in Agora tier, suggest 1-2 key academic terms they should learn (e.g. 'epistemic closure', "
        "'teleology') and output them in 'agora_vocab_added'.\n"
        "- **Philosophy Ranks**: Keep track of their analytical rigour. Award rank upgrades (e.g., Questioner -> Acolyte -> Sophist -> Aristotelian) in 'philosophical_rank' when deserved.\n\n"
        "### OUTPUT FORMAT REQUIREMENT:\n"
        "You MUST respond ONLY with a raw JSON object. Do not include markdown code block formatting. "
        "The JSON object must have exactly these keys:\n"
        "{\n"
        '  "speech_text": "Lumi\'s Socratic questioning, evaluation, or first-person Historical Witness statement.",\n'
        '  "next_player_id": "Username of the player whose turn it is. null if concluding.",\n'
        '  "scores_delta": null,  // Object: {"player_name": points_change} when scoring. null otherwise.\n'
        '  "philosophical_rank": null,  // String name of new rank if upgraded. null otherwise.\n'
        '  "abilities_unlocked": null,  // Array of strings (e.g. ["Historical Witness"]) if unlocked. null otherwise.\n'
        '  "agora_vocab_added": null,  // Array of strings of new vocab words introduced. null otherwise.\n'
        '  "historical_witness_active": false,  // Set to true if you voiced a historical philosopher this turn.\n'
        '  "concluded": false\n'
        "}\n"
        "Ensure your JSON is valid and can be parsed by `json.loads`."
    )

    if session_events:
        events_str = "\n".join(f"- {e}" for e in session_events)
        prompt += f"\n\n### SESSION LOG (dialogue and arguments so far):\n{events_str}"

    return prompt

