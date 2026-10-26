GAME_OF_GAMES_PROFILE_FIELDS = (
    "cooperation_tendency",
    "risk_tolerance",
    "reciprocity",
    "strategic_sophistication",
    "consistency",
)

GAME_OF_GAMES_SCENARIO_PACKS = {
    "foundations": {
        "label": "Foundations",
        "description": "The three classic entry points: trust, coordination, and brinkmanship.",
        "scenario_slugs": ["prisoners-dilemma", "stag-hunt", "chicken"],
    },
    "commons_bargains": {
        "label": "Commons & Bargains",
        "description": "Shared resources, fairness, generosity, and collective contribution.",
        "scenario_slugs": ["tragedy-of-commons", "ultimatum-game", "dictator-game", "public-goods-game"],
    },
    "deep_strategy": {
        "label": "Deep Strategy",
        "description": "Sequential reasoning, mixed motives, voluntary sacrifice, and repeated play.",
        "scenario_slugs": ["centipede-game", "battle-of-the-sexes", "volunteers-dilemma"],
    },
    "paradoxes": {
        "label": "Paradoxes",
        "description": "Prediction, crowded expectations, pirates, repeated trust, and focal points.",
        "scenario_slugs": [
            "newcombs-problem",
            "el-farol-bar-problem",
            "pirate-game",
            "repeated-prisoners-dilemma",
            "schelling-point",
        ],
    },
    "mixed": {
        "label": "Mixed Canon",
        "description": "A rotating sample from the full canon.",
        "scenario_slugs": ["prisoners-dilemma", "ultimatum-game", "newcombs-problem"],
    },
}

GAME_OF_GAMES_SCENARIOS = [
    {
        "slug": "prisoners-dilemma",
        "name": "Prisoner's Dilemma",
        "format": "simultaneous_choice",
        "players": {"min": 2, "max": 6},
        "choices": [
            {"key": "cooperate", "label": "Cooperate", "description": "Protect the other player and hope they protect you."},
            {"key": "defect", "label": "Defect", "description": "Take the safer selfish payoff if the other player trusts you."},
        ],
        "discovery_prompt": "You and another player are questioned separately. If you both stay quiet, both do well. If one betrays while the other stays quiet, the betrayer walks away best. If both betray, both lose ground.",
        "academy_prompt": "Prisoner's Dilemma tests whether individually rational defection can defeat mutually beneficial cooperation.",
        "payoff_note": "Mutual cooperation is collectively best. Defection is individually tempting when trust is uncertain.",
        "theory": "The one-shot Nash Equilibrium is mutual defection, even though mutual cooperation gives the pair a better combined outcome.",
        "nash_equilibrium": "Defect / Defect in a one-shot game.",
    },
    {
        "slug": "stag-hunt",
        "name": "Stag Hunt",
        "format": "simultaneous_choice",
        "players": {"min": 2, "max": 6},
        "choices": [
            {"key": "stag", "label": "Hunt Stag", "description": "Coordinate for a bigger shared reward."},
            {"key": "hare", "label": "Catch Hare", "description": "Take a smaller but reliable solo reward."},
        ],
        "discovery_prompt": "A group can catch a great stag only if enough people commit together. Anyone can abandon the hunt and catch a hare alone.",
        "academy_prompt": "Stag Hunt tests trust, payoff dominance, and risk dominance.",
        "payoff_note": "The high reward requires enough shared commitment. The safe option never collapses.",
        "theory": "There are two pure Nash equilibria: everyone commits to the stag, or everyone retreats to the safer hare.",
        "nash_equilibrium": "Stag / Stag and Hare / Hare.",
    },
    {
        "slug": "chicken",
        "name": "Chicken",
        "format": "simultaneous_choice",
        "players": {"min": 2, "max": 6},
        "choices": [
            {"key": "swerve", "label": "Swerve", "description": "Avoid disaster, but concede nerve."},
            {"key": "straight", "label": "Stay Straight", "description": "Demand the win and risk mutual crash."},
        ],
        "discovery_prompt": "Two drivers speed toward each other. Swerving avoids the crash. Staying straight wins if the other backs down.",
        "academy_prompt": "Chicken studies escalation, brinkmanship, and anti-coordination under catastrophic risk.",
        "payoff_note": "One bold player can win big, but mutual boldness is disastrous.",
        "theory": "Chicken has two asymmetric Nash equilibria: one player stays straight while the other swerves.",
        "nash_equilibrium": "Straight / Swerve or Swerve / Straight.",
    },
    {
        "slug": "tragedy-of-commons",
        "name": "Tragedy of the Commons",
        "format": "simultaneous_choice",
        "players": {"min": 2, "max": 6},
        "choices": [
            {"key": "conserve", "label": "Conserve", "description": "Protect the shared resource."},
            {"key": "exploit", "label": "Exploit", "description": "Take more from the commons now."},
        ],
        "discovery_prompt": "Everyone draws from one shared resource. Taking less keeps it alive. Taking more helps you now, unless too many people do it.",
        "academy_prompt": "Tragedy of the Commons shows how private incentives can destroy public goods.",
        "payoff_note": "Exploiters profit when rare. When exploitation spreads, everyone suffers.",
        "theory": "Without enforcement or repeated trust, the incentive to exploit can overpower collective survival.",
        "nash_equilibrium": "Often overuse/exploitation under weak governance.",
    },
    {
        "slug": "ultimatum-game",
        "name": "Ultimatum Game",
        "format": "sequential_choice",
        "players": {"min": 2, "max": 6},
        "roles": {"first": "proposer", "second": "responder"},
        "choices": [
            {"key": "generous_offer", "label": "Offer 70/30", "description": "Give the responder more than the minimum."},
            {"key": "fair_offer", "label": "Offer 50/50", "description": "Split the pot evenly."},
            {"key": "low_offer", "label": "Offer 80/20", "description": "Keep most of the pot and test their tolerance."},
            {"key": "accept", "label": "Accept", "description": "Take the offered split."},
            {"key": "reject", "label": "Reject", "description": "Destroy the pot to punish an unfair offer."},
        ],
        "discovery_prompt": "One player proposes how to split a reward. The next player sees the offer and can accept it or reject it. If rejected, no one gets anything.",
        "academy_prompt": "Ultimatum Game tests rational payoff maximization against fairness and punishment.",
        "payoff_note": "Low offers maximize proposer gain only if the responder accepts.",
        "theory": "A narrow rational model accepts any non-zero offer, but humans often reject unfairness.",
        "nash_equilibrium": "Subgame-perfect prediction: proposer offers the smallest positive amount, responder accepts.",
    },
    {
        "slug": "dictator-game",
        "name": "Dictator Game",
        "format": "solo_decision",
        "players": {"min": 1, "max": 6},
        "choices": [
            {"key": "keep_all", "label": "Keep All", "description": "Maximize your own payoff."},
            {"key": "split_evenly", "label": "Split Evenly", "description": "Choose visible fairness."},
            {"key": "give_more", "label": "Give More", "description": "Sacrifice payoff for generosity."},
        ],
        "discovery_prompt": "You control a reward. No one can reject your decision. You decide how much to keep and how much to give away.",
        "academy_prompt": "Dictator Game separates pure self-interest from fairness preferences when there is no strategic punishment.",
        "payoff_note": "Your material payoff is highest when you keep all, but generosity reveals other-regarding preference.",
        "theory": "Classical self-interest predicts keeping everything; observed play often includes giving.",
        "nash_equilibrium": "Keep all under narrow self-interest.",
    },
    {
        "slug": "public-goods-game",
        "name": "Public Goods Game",
        "format": "simultaneous_choice",
        "players": {"min": 2, "max": 6},
        "choices": [
            {"key": "contribute", "label": "Contribute", "description": "Put resources into the shared pool."},
            {"key": "free_ride", "label": "Free Ride", "description": "Keep your resources and benefit from others."},
        ],
        "discovery_prompt": "Everyone can contribute to a shared pool. Contributions multiply for the group. But anyone can keep their own share and still benefit from others.",
        "academy_prompt": "Public Goods Game studies cooperation, free-riding, and institutional trust.",
        "payoff_note": "The group does best with broad contribution. Free-riders gain when others carry the public good.",
        "theory": "In a one-shot public goods game, free-riding is individually dominant under narrow incentives.",
        "nash_equilibrium": "Free ride / Free ride without punishment or repetition.",
    },
    {
        "slug": "centipede-game",
        "name": "Centipede Game",
        "format": "sequential_choice",
        "players": {"min": 2, "max": 6},
        "roles": {"first": "opener", "second": "closer"},
        "choices": [
            {"key": "continue", "label": "Continue", "description": "Let the pot grow and pass control forward."},
            {"key": "take", "label": "Take", "description": "Stop now and claim the larger current share."},
        ],
        "discovery_prompt": "A growing pot moves from one player to another. Each player can take now or let the next person decide with a larger pot.",
        "academy_prompt": "Centipede Game tests backward induction against trust and social expectations.",
        "payoff_note": "Continuing can grow the total, but taking guarantees control.",
        "theory": "Backward induction predicts taking early, while real players often continue for several moves.",
        "nash_equilibrium": "Take immediately by backward induction.",
    },
    {
        "slug": "battle-of-the-sexes",
        "name": "Battle of the Sexes",
        "format": "simultaneous_choice",
        "players": {"min": 2, "max": 6},
        "choices": [
            {"key": "option_a", "label": "Option A", "description": "Coordinate around your preferred plan."},
            {"key": "option_b", "label": "Option B", "description": "Coordinate around the other plan."},
        ],
        "discovery_prompt": "Two people want to be together but prefer different plans. Matching matters most; personal preference matters second.",
        "academy_prompt": "Battle of the Sexes studies coordination when preferences conflict.",
        "payoff_note": "Coordinating beats missing each other. The disagreement is over whose preference wins.",
        "theory": "There are two pure Nash equilibria, one for each coordinated plan, plus a mixed equilibrium.",
        "nash_equilibrium": "Option A / Option A or Option B / Option B.",
    },
    {
        "slug": "volunteers-dilemma",
        "name": "Volunteer's Dilemma",
        "format": "simultaneous_choice",
        "players": {"min": 2, "max": 6},
        "choices": [
            {"key": "volunteer", "label": "Volunteer", "description": "Pay the cost so everyone benefits."},
            {"key": "wait", "label": "Wait", "description": "Hope someone else carries the cost."},
        ],
        "discovery_prompt": "The group needs one person to take on an annoying cost. If someone volunteers, everyone benefits. If no one does, everyone loses.",
        "academy_prompt": "Volunteer's Dilemma explores bystander effects and costly public action.",
        "payoff_note": "Waiting is attractive if someone else volunteers. If everyone waits, the group fails.",
        "theory": "The game has multiple asymmetric equilibria where exactly one player volunteers.",
        "nash_equilibrium": "Exactly one volunteer in pure strategies.",
    },
    {
        "slug": "newcombs-problem",
        "name": "Newcomb's Problem",
        "format": "solo_decision",
        "players": {"min": 1, "max": 6},
        "choices": [
            {"key": "one_box", "label": "Take One Box", "description": "Trust the predictor and leave the visible box."},
            {"key": "two_box", "label": "Take Both Boxes", "description": "Take what is visible because the prediction is already made."},
        ],
        "discovery_prompt": "A predictor has already filled or emptied a hidden box based on what it expected you to do. You may take only that box, or take it plus a smaller visible box.",
        "academy_prompt": "Newcomb's Problem contrasts evidential and causal decision theory.",
        "payoff_note": "One-boxing rewards alignment with prediction. Two-boxing argues the past is fixed.",
        "theory": "There is no single settled answer. The scenario exposes what kind of decision theory a player implicitly trusts.",
        "nash_equilibrium": "Not a standard Nash game; no single correct equilibrium.",
    },
    {
        "slug": "el-farol-bar-problem",
        "name": "El Farol Bar Problem",
        "format": "simultaneous_choice",
        "players": {"min": 2, "max": 6},
        "choices": [
            {"key": "go", "label": "Go", "description": "Attend if you expect the crowd to stay low."},
            {"key": "stay_home", "label": "Stay Home", "description": "Avoid the crowd and accept a quieter payoff."},
        ],
        "discovery_prompt": "A bar is fun only if it is not too crowded. Everyone decides at the same time whether to go.",
        "academy_prompt": "El Farol studies bounded rationality, prediction, and minority-game dynamics.",
        "payoff_note": "Going is best when few go. Staying home is better than joining an overcrowded night.",
        "theory": "No simple deterministic strategy dominates because everyone is forecasting everyone else's forecast.",
        "nash_equilibrium": "Mixed and expectation-dependent; the useful lesson is adaptive forecasting.",
    },
    {
        "slug": "pirate-game",
        "name": "Pirate Game",
        "format": "negotiation",
        "players": {"min": 2, "max": 6},
        "roles": {"first": "captain", "second": "crew"},
        "choices": [
            {"key": "generous_plan", "label": "Generous Plan", "description": "Offer the crew a meaningful share."},
            {"key": "minimal_plan", "label": "Minimal Plan", "description": "Buy just enough support."},
            {"key": "greedy_plan", "label": "Greedy Plan", "description": "Keep nearly everything and dare them to reject."},
            {"key": "accept", "label": "Accept", "description": "Vote for the proposal."},
            {"key": "reject", "label": "Reject", "description": "Vote against the proposal."},
            {"key": "counter", "label": "Counter", "description": "Signal that the split needs revision."},
        ],
        "discovery_prompt": "A captain proposes how to divide treasure. The crew votes. A plan needs support, and rejected plans leave everyone worse off for this round.",
        "academy_prompt": "Pirate Game uses backward induction, voting power, and coalition logic.",
        "payoff_note": "Minimal winning coalitions can beat intuitive fairness if voters are purely strategic.",
        "theory": "The canonical puzzle is solved by backward induction from the last pirate upward.",
        "nash_equilibrium": "A minimal winning coalition under strict rationality.",
    },
    {
        "slug": "repeated-prisoners-dilemma",
        "name": "Repeated Prisoner's Dilemma",
        "format": "multi_round",
        "players": {"min": 2, "max": 6},
        "rounds": 5,
        "choices": [
            {"key": "cooperate", "label": "Cooperate", "description": "Build or maintain trust this round."},
            {"key": "defect", "label": "Defect", "description": "Take the immediate advantage."},
        ],
        "discovery_prompt": "You face the same trust problem for five rounds. Every choice changes what the next round means.",
        "academy_prompt": "Repeated Prisoner's Dilemma shows how reputation, retaliation, and forgiveness can transform incentives.",
        "payoff_note": "Short-term defection can pay, but repeated play rewards stable trust and credible reciprocity.",
        "theory": "With repetition, strategies like tit-for-tat can sustain cooperation where one-shot logic predicts defection.",
        "nash_equilibrium": "Depends on horizon and discounting; cooperative equilibria can emerge when future value matters.",
    },
    {
        "slug": "schelling-point",
        "name": "Schelling Point",
        "format": "simultaneous_choice",
        "players": {"min": 2, "max": 6},
        "choices": [
            {"key": "obvious", "label": "Obvious Signal", "description": "Pick the most focal shared answer."},
            {"key": "clever", "label": "Clever Signal", "description": "Pick the answer you think smart players will overthink toward."},
            {"key": "personal", "label": "Personal Signal", "description": "Pick what feels meaningful to you."},
        ],
        "discovery_prompt": "You cannot talk. You must choose the point you think others will also choose, using only shared expectations.",
        "academy_prompt": "Schelling Points are focal solutions people coordinate on without communication.",
        "payoff_note": "Payoff comes from matching the room's focal expectation, not from private preference.",
        "theory": "Focal points arise from salience, culture, symmetry, and common knowledge.",
        "nash_equilibrium": "Any mutually expected focal choice can be an equilibrium.",
    },
]

GAME_OF_GAMES_SCENARIOS_BY_SLUG = {
    scenario["slug"]: scenario for scenario in GAME_OF_GAMES_SCENARIOS
}

GAME = {
    "slug": "game-of-games",
    "name": "The Game of Games",
    "tagline": "The theory of everything strategic.",
    "description": (
        "A strategic simulation game covering the core ideas of game theory and decision theory. "
        "Discovery mode lets players choose on instinct before the theory is revealed; Academy mode "
        "teaches the framework first and then tests the room against it."
    ),
    "players": {"min": 1, "max": 6},
    "duration_range": {"min": 25, "max": 60},
    "host": "Lumi",
    "attributes": ["wit", "wisdom"],
    "modes": ["Discovery", "Academy"],
    "scenario_packs": GAME_OF_GAMES_SCENARIO_PACKS,
    "scenarios": [scenario["name"] for scenario in GAME_OF_GAMES_SCENARIOS],
    "scenario_formats": ["Simultaneous Choice", "Sequential Choice", "Multi-Round", "Negotiation", "Solo Decision"],
    "mechanics": {
        "decision_profile": True,
        "profile_updates_every_3_scenarios": True,
        "strategic_architect_cross_game_ability": True,
        "feeds_avatar_wit_wisdom": True,
        "default_timer_seconds": 180,
        "default_session_scenarios": 3,
    },
}


def get_game_of_games_scenarios(pack: str = "foundations", limit: int = 3) -> list[dict]:
    selected_pack = GAME_OF_GAMES_SCENARIO_PACKS.get(pack, GAME_OF_GAMES_SCENARIO_PACKS["foundations"])
    slugs = selected_pack["scenario_slugs"]
    scenarios = [GAME_OF_GAMES_SCENARIOS_BY_SLUG[slug] for slug in slugs if slug in GAME_OF_GAMES_SCENARIOS_BY_SLUG]
    return scenarios[: max(1, min(limit, len(scenarios)))]


def build_prompt(
    mode: str,
    scenario_index: int,
    current_scenario: dict,
    choices: dict,
    scores: dict,
    decision_profile: dict,
    players_list: list[str],
    session_events: list[str] = None,
) -> str:
    players_str = ", ".join(players_list)
    mode_note = (
        "DISCOVERY MODE: Do not name the theory before choices. Narrate the situation first. "
        "Reveal the theory only after payoff evaluation."
        if mode == "discovery"
        else
        "ACADEMY MODE: Name the strategic framework first, explain payoffs and equilibrium logic, "
        "then ask players to test themselves against it."
    )

    scenario_str = str(current_scenario) if current_scenario else "(no active scenario)"
    profile_str = str(decision_profile) or "(no profile data built yet)"

    prompt = (
        "You are Lumi, hosting The Game of Games: a simulation of game theory and strategic decision-making.\n\n"
        "### SESSION INFO\n"
        f"Players: [{players_str}]\n"
        f"Mode: {mode.upper()}\n"
        f"Current Scenario Index: {scenario_index + 1}\n"
        f"Active Scenario Details: {scenario_str}\n"
        f"Choices Submitted: {choices}\n"
        f"Scores: {scores}\n"
        f"Decision Profiles: {profile_str}\n\n"
        f"### MODE GUIDANCE\n{mode_note}\n\n"
        "### MECHANICS\n"
        "- The server owns scenario selection, payoffs, private choice handling, and profile updates.\n"
        "- Use your response for narration, theory framing, and concise strategic debriefs.\n"
        "- Newcomb's Problem must not be treated as having one settled correct answer.\n\n"
        "### OUTPUT\n"
        "Return only a raw JSON object with this shape:\n"
        "{\n"
        '  "speech_text": "Concise Lumi narration or strategic debrief.",\n'
        '  "concluded": false\n'
        "}\n"
    )

    if session_events:
        events_str = "\n".join(f"- {event}" for event in session_events[-20:])
        prompt += f"\n### SESSION LOG\n{events_str}"

    return prompt
