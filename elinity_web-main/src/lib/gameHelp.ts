export interface GameHelpGuide {
  title: string;
  mission: string;
  steps: string[];
  winCondition: string;
  quickTips: string[];
}

export const GAME_HELP_GUIDES: Record<string, GameHelpGuide> = {
  drift: {
    title: 'Drift',
    mission: 'Follow Lumi through a warm conversation that starts light and slowly gets real.',
    steps: [
      'Gather 2–8 players, choose the room mood, and ready up.',
      'Lumi runs five rounds, moving from light prompts toward deeper ones.',
      'When it is your turn, answer honestly in your own style.',
      'Around the middle, Lumi may add a twist; pass or veto if the room needs it.',
      'Finish by naming one real thing you noticed, learned, or felt.',
    ],
    winCondition: 'There is no scoreboard. You win by leaving with one real discovery about another person.',
    quickTips: ['Short honest answers beat speeches.', 'Build on what others reveal.', 'Pass is part of good play, not failure.'],
  },
  callout: {
    title: 'Callout',
    mission: 'Prove you know the room better than anyone else.',
    steps: [
      'Gather 3–10 players and ready up. This one is competitive.',
      'Round 1 warms up the room with no-pressure answers.',
      'In the middle rounds, guess the hot seat, race in rapid callouts, and spot bluffs.',
      'Use your one veto carefully; there is no pass button in Callout.',
      'Round 5 is the final callout. Watch the reveal and scoreboard.',
    ],
    winCondition: 'Highest score at the end wins. You score by knowing people, spotting bluffs, and reading the room.',
    quickTips: ['Specific guesses beat safe guesses.', 'Bluff like the target would answer.', 'Tiny habits are points waiting to happen.'],
  },
  threadweave: {
    title: 'Threadweave',
    mission: 'Build a story together, one turn at a time.',
    steps: [
      'Gather 2–6 players, then choose Loom for smoother play or Spindle for more twists.',
      'Pick the story texture: warm, weird, dark, sci-fi, thriller, or hybrid.',
      'Lumi opens the scene; on your turn, add one clear beat: action, detail, choice, or twist.',
      'Use redirect or pass if a thread stalls; Spindle may throw curveballs.',
      'Land the final scene together and let Lumi reflect what the story became.',
    ],
    winCondition: 'You win when the group creates a story nobody could have made alone.',
    quickTips: ['Leave hooks for the next player.', 'Make bold choices, not random noise.', 'Protect continuity: add, do not erase.'],
  },
  'uncharted-horizons': {
    title: 'Uncharted Horizons',
    mission: 'Explore dreams, motivation, legacy, and what you actually want.',
    steps: [
      'Play solo or with up to 6 people in Shared Horizons.',
      'Choose or answer into a terrain: Dream, Bucket List, Motivation, Legacy, Creation, or Frontier.',
      'Lumi moves through Surface, Current, and Bedrock depth as the room is ready.',
      'Answer with concrete wants, blockers, memories, and next steps; pass when needed.',
      'End with a Horizon Map that names the clearest direction discovered.',
    ],
    winCondition: 'You win by naming one desire, direction, or next step more clearly than before.',
    quickTips: ['Concrete examples unlock better prompts.', 'Do not perform ambition.', 'If it feels too big, it may be the real answer.'],
  },
  'the-unsaid': {
    title: 'The Unsaid',
    mission: 'Give shape to something that has been held back.',
    steps: [
      'Choose Solo Release, Face to Face, or Group Room, then pick the terrain.',
      'Terrains include appreciation, regret, apology, admission, the hard thing, or wander.',
      'Lumi starts gently, then moves through Surface, Current, and Bedrock only as safety allows.',
      'Use Pass, Pause, or Stop at any time. Safety controls are real game moves.',
      'Close with the Release sentence and an Unsaid Map of what shifted.',
    ],
    winCondition: 'You win by saying, releasing, or understanding one thing that had weight.',
    quickTips: ['Say the clean truth, not the dramatic version.', 'Safety controls are part of the game.', 'Do not force another player’s reveal.'],
  },
  turncoat: {
    title: 'Turncoat: The Other Side',
    mission: 'Argue the side you do not believe and make it strong.',
    steps: [
      'Gather 2–6 players and choose Classic or Full Circle.',
      'Write a position you actually hold; Lumi gives you the opposite side.',
      'Make the strongest opening argument you can for that side.',
      'Handle rebuttals and curveballs without turning the other side into a joke.',
      'Score peers, reveal totals, and crown the strongest turncoat argument.',
    ],
    winCondition: 'Highest score wins. You score on conviction, logic, originality, adaptability, and sometimes how much your mind moved.',
    quickTips: ['Classic is 3 rounds; Full Circle is 5.', 'Steelman, do not parody.', 'A mind changed honestly can earn extra weight.'],
  },
  'letters-long-table': {
    title: 'The Letters at the Long Table',
    mission: 'Meet past, future, or inner versions of yourself at one table.',
    steps: [
      'Enter solo. This is a private one-player game.',
      'Choose The Letter, The Conversation, or The Council.',
      'Set the compass and occasion: what are you bringing to the table today?',
      'Build the voices of your age-selves, then write, speak, or listen across the table.',
      'Close with a Table Log you can save, return to, or export.',
    ],
    winCondition: 'You win by leaving with one clearer relationship to your own past, present, or future.',
    quickTips: ['Let each age-self sound different.', 'The future self should not be magically perfect.', 'Use Return when a voice matters.'],
  },
  roleswap: {
    title: 'Roleswap',
    mission: 'Become another player and see how accurately you can play them.',
    steps: [
      'Gather 2–6 players and choose Pure Swap, Deep Swap, or Full Swap.',
      'Lumi assigns each player someone else to portray.',
      'Answer the scenario as that person, not as yourself.',
      'The real person reveals what they would actually do and scores the portrayal.',
      'Finish with the mirror round and a Swap Portrait.',
    ],
    winCondition: 'Highest accuracy wins. You score by capturing instinct, voice, and emotional depth.',
    quickTips: ['Notice rhythm, not just opinions.', 'Comedy is welcome; cruelty is not.', 'Score the portrayal, not whether you liked it.'],
  },
  'planet-enigma': {
    title: 'Planet Enigma',
    mission: 'Solve puzzles across strange worlds before hints drain your score.',
    steps: [
      'Play solo or multiplayer, then enter a world like Haunted Mansion, Space Station, or The Void.',
      'Lumi gives 3–7 puzzles from riddles, logic, math, lateral thinking, or trick questions.',
      'Type your answer clearly. In multiplayer, fast correct answers can earn a bonus.',
      'Use hints only when available and worth the point cost.',
      'Clear the set to raise your Enigma rank.',
    ],
    winCondition: 'Win by solving the most puzzles with the highest score. Hints help, but they cost points.',
    quickTips: ['Read the wording twice.', 'Use hints only after a real attempt.', 'Wrong assumptions are the trap.'],
  },
  'odyssey-mind': {
    title: 'The Odyssey of Mind',
    mission: 'Travel through knowledge realms and grow your rank.',
    steps: [
      'Play solo or multiplayer and enter a knowledge realm.',
      'Face that realm’s challenge format: trial, labyrinth, arena, council, archive, forge, or gauntlet.',
      'Answer with reasoning, not just a final guess.',
      'Lumi scores your response and updates attributes, abilities, and rank.',
      'Keep clearing expeditions to evolve your mind-world.',
    ],
    winCondition: 'You win each expedition by clearing challenges; long-term victory is ranking up your mind-world.',
    quickTips: ['Explain your thinking.', 'Use strengths from past realms.', 'A partial answer with logic beats a lucky guess.'],
  },
  'philosophy-arena': {
    title: 'The Philosophy Arena',
    mission: 'Test ideas in a sharp but playable argument arena.',
    steps: [
      'Play solo or multiplayer, then choose Agora for guided play or Academy for harder debate.',
      'Enter a domain like ethics, logic, politics, mind, language, or aesthetics.',
      'Respond to Lumi’s challenge: dialogue, fallacy field, argument forge, thought experiment, or court.',
      'Defend, revise, or rebuild your argument when pressure arrives.',
      'Finish with scores, rank progress, and sometimes a historical witness unlock.',
    ],
    winCondition: 'You win by making the strongest argument: clear, consistent, and hard to knock down.',
    quickTips: ['Define your terms.', 'Admit weak points fast.', 'Changing your mind can be a power move.'],
  },
  'appreciation-game': {
    title: 'The Appreciation Game',
    mission: 'Make people feel specifically seen.',
    steps: [
      'Gather 2–6 players. This is group-only and non-competitive.',
      'Round 1: privately name what you hope someone notices.',
      'Rounds 2–3: give and receive specific appreciations with real details.',
      'Round 4: return to what landed, what surprised you, and what still feels unseen.',
      'Round 5: close with the Seen Marker and an Appreciation Portrait.',
    ],
    winCondition: 'The room wins when appreciations become specific enough to actually land.',
    quickTips: ['“You are nice” is too vague.', 'Name moments, habits, and choices.', 'Let praise land before joking it away.'],
  },
};

export function getGameHelpGuide(gameSlug?: string | null): GameHelpGuide | null {
  if (!gameSlug) return null;
  return GAME_HELP_GUIDES[gameSlug] || null;
}
