// ===== ZONES DATA =====
// Each zone has a `type` that drives its renderer in app.js

const ZONES = [

  // ── 1. VOCAB ──────────────────────────────────────────────
  {
    id: "z1", act: 1, locked: false,
    title: "Word Wall",
    type: "vocab",
    subtitle: "Chapters 1–5",
    teacherNote: "Students tap each card to reveal the definition. Encourage them to use the word in a sentence before flipping.",
    words: [
      { word: "melancholy",   hint: "an adjective", def: "A deep, quiet sadness — the kind that settles in and stays a while." },
      { word: "peculiar",     hint: "an adjective", def: "Strange or unusual in a way that makes you stop and stare." },
      { word: "recalled",     hint: "a verb",       def: "Brought a memory back to mind; remembered." },
      { word: "stray",        hint: "a noun/adj",   def: "An animal (or person) with no home, wandering on its own." },
      { word: "congregation", hint: "a noun",       def: "A group of people gathered together, often for a shared purpose." },
      { word: "prideful",     hint: "an adjective", def: "Too proud — feeling better than others in a way that can hurt." },
      { word: "tolerate",     hint: "a verb",       def: "To put up with something even when it's hard or uncomfortable." },
      { word: "impact",       hint: "a noun",       def: "The strong effect one thing has on another." }
    ]
  },

  // ── 2. QUIZ ───────────────────────────────────────────────
  {
    id: "z2", act: 1, locked: false,
    title: "Check-In",
    type: "quiz",
    subtitle: "Chapters 1–10",
    teacherNote: "Self-marking comprehension check. Students get immediate feedback. Review any question with a low class score.",
    questions: [
      {
        q: "Where does Opal find Winn-Dixie at the beginning of the story?",
        opts: ["At the park", "In a Winn-Dixie supermarket", "Outside the church", "In her garden"],
        correct: 1,
        explain: "Opal finds the big, ugly dog causing chaos inside the Winn-Dixie grocery store — and names him after it."
      },
      {
        q: "Why doesn't Opal know much about her mother?",
        opts: ["Her mother is very private", "Her mother left when Opal was three", "Her mother lives far away", "Her mother has lost her memory"],
        correct: 1,
        explain: "Opal's mother left the family when Opal was only three years old. The preacher rarely talks about her."
      },
      {
        q: "What unusual thing can Winn-Dixie do that makes people smile?",
        opts: ["He can dance on his hind legs", "He fetches the newspaper", "He smiles — showing all his teeth", "He can open doors"],
        correct: 2,
        explain: "Winn-Dixie's enormous grin, teeth and all, is one of his most endearing (and slightly alarming) features."
      },
      {
        q: "What is Opal's father's job in Naomi?",
        opts: ["He is a teacher", "He is a librarian", "He is a preacher", "He is a shopkeeper"],
        correct: 2,
        explain: "Opal's father is the preacher at the Open Arms Baptist Church of Naomi, Florida."
      },
      {
        q: "What does the preacher tell Opal about her mother when she asks?",
        opts: ["He refuses to say anything", "He tells her ten things about her mother", "He shows her old photographs", "He says he will tell her when she is older"],
        correct: 1,
        explain: "The preacher agrees to tell Opal ten things about her mother — one for each year of Opal's life. It's a tender, important moment."
      }
    ]
  },

  // ── 3. CHARACTER MAP ──────────────────────────────────────
  {
    id: "z3", act: 1, locked: false,
    title: "Who's Who",
    type: "charmap",
    subtitle: "Characters",
    teacherNote: "Students explore each character before writing. The open question at the bottom can be used as a discussion starter.",
    prompt: "Which character surprises you most, and why?",
    characters: [
      {
        name: "Opal",        initial: "O",
        role: "Our narrator",
        traits: ["Lonely but brave", "Asks big questions", "Collects people like treasures"],
        think: "Opal talks to strangers, animals, and the sky. What does that tell us about her?"
      },
      {
        name: "Winn-Dixie",  initial: "W",
        role: "The dog",
        traits: ["Smiles with all his teeth", "Afraid of thunder", "Brings people together"],
        think: "Winn-Dixie can't speak — but how does DiCamillo make him feel like a character with feelings?"
      },
      {
        name: "The Preacher", initial: "P",
        role: "Opal's father",
        traits: ["Quiet and careful", "Loves Opal deeply", "Carries sadness he doesn't show"],
        think: "Why do you think the preacher finds it so hard to talk about Opal's mother?"
      },
      {
        name: "Miss Franny", initial: "F",
        role: "The librarian",
        traits: ["Old and small", "Full of big stories", "Afraid but open"],
        think: "Miss Franny tells Opal about a bear. What do stories do for lonely people?"
      },
      {
        name: "Gloria Dump",  initial: "G",
        role: "The neighbour",
        traits: ["Near-blind but sees deeply", "Wise without being preachy", "Lives with her ghosts"],
        think: "Gloria Dump's mistake tree is full of bottles. What does it mean to carry your past without hiding it?"
      },
      {
        name: "Otis",        initial: "O",
        role: "Pet shop worker",
        traits: ["Shy and gentle", "Plays guitar for animals", "Has a secret past"],
        think: "Otis has done something wrong in his past. Does that make him a bad person? What does Opal decide — and why does it matter?"
      }
    ]
  },

  // ── 4. CRAFT ──────────────────────────────────────────────
  {
    id: "z4", act: 2, locked: true,
    title: "Writer's Craft",
    type: "craft",
    subtitle: "Simile & Imagery",
    teacherNote: "Work through each quote together or independently. The 'What DiCamillo means' reveal is for after students have had a go.",
    similes: [
      {
        quote: "The preacher sat there looking like a turtle that had pulled its head back inside its shell.",
        highlight: "like a turtle that had pulled its head back inside its shell",
        question: "What feeling does this simile create? What can't the preacher do right now?",
        answer: "The simile shows the preacher withdrawing — he can't or won't come out and face Opal's question. Turtles hide when they feel unsafe. DiCamillo uses this to show that grief can make us retreat from the people who need us most."
      },
      {
        quote: "She had the kind of laugh that made you want to be there with her in the sunlight.",
        highlight: "the kind of laugh that made you want to be there with her in the sunlight",
        question: "What does DiCamillo achieve by linking the laugh to sunlight? Try writing your own version about a different character.",
        answer: "Sunlight here stands for warmth, openness, and belonging. DiCamillo links sound (the laugh) to a physical sensation — warmth and light. This makes Gloria Dump's laugh feel like an invitation rather than just a noise."
      },
      {
        quote: "Winn-Dixie looked up at me and wagged his tail and smiled his big smile, and I could see he was going to be trouble.",
        highlight: "I could see he was going to be trouble",
        question: "This isn't a simile — it's understatement. Why is saying less sometimes more powerful?",
        answer: "By saying it quietly ('I could see'), Opal sounds like she already loves the dog and doesn't mind the trouble at all. Understatement lets readers feel the warmth without being told how to feel. It trusts us."
      }
    ]
  },

  // ── 4b. GUIDED REWRITE ────────────────────────────────────
  {
    id: "z4b", act: 2, locked: true,
    title: "Rewrite It",
    type: "rewrite",
    subtitle: "Craft in practice",
    teacherNote: "Students rewrite the same plain sentence three ways. The goal is not a 'correct' version — it's to feel how each technique changes what the sentence does. Read versions aloud; compare what each one makes the reader feel.",
    sourceLine: "Opal walked home. She felt sad.",
    sourceNote: "This is flat. It tells us what happened and how she felt. Nothing more.",
    tasks: [
      {
        id: "rw0",
        label: "Add a simile",
        instruction: "Rewrite the sentence using a comparison — 'like' or 'as'. What does the sadness remind you of? What does it feel like, physically?",
        placeholder: "Opal walked home, feeling like…",
        example: "Opal walked home feeling like a jar with the lid screwed on too tight."
      },
      {
        id: "rw1",
        label: "Add sensory detail",
        instruction: "Rewrite it using something Opal can hear, smell, or feel on her skin. Don't name the emotion at all — let the detail carry it.",
        placeholder: "The gravel was…  /  The air smelled of…",
        example: "The gravel was loud under her feet. Everything else was quiet."
      },
      {
        id: "rw2",
        label: "Shift the tone",
        instruction: "Rewrite it so Opal sounds angry instead of sad — or numb instead of angry. Same moment, different emotional temperature.",
        placeholder: "Try: angry, numb, or strangely calm…",
        example: "Opal walked home. She didn't feel anything. That was probably worse."
      }
    ]
  },

  // ── 5. CREATIVE WRITING ───────────────────────────────────
  {
    id: "z5", act: 2, locked: true,
    title: "Your Turn",
    type: "creative",
    subtitle: "Writing",
    teacherNote: "Free writing zone. Prompt chips give reluctant writers a way in. Encourage students to read their opening sentence aloud.",
    mainPrompt: "Write a short scene (8–12 sentences) from the point of view of Winn-Dixie. What does he notice? What does he want? What does he understand that Opal doesn't?",
    chips: [
      "Start with what Winn-Dixie can smell",
      "Describe Opal through his eyes",
      "Begin with a sound that worries him",
      "Start the moment before a storm",
      "Write the scene at Gloria Dump's garden",
      "Begin with: 'The girl didn't know, but I did…'"
    ],
    placeholder: "Winn-Dixie narrates here…"
  },

  // ── 6. EXTENSION ──────────────────────────────────────────
  {
    id: "z6", act: 3, locked: true,
    title: "Go Deeper",
    type: "extension",
    subtitle: "Discussion & Thinking",
    teacherNote: "Start with the evidence task — students need a moment in the text before the discussion can go anywhere. Use the reveals to extend thinking, not close it.",
    questions: [
      {
        q: "Find one moment in the novel where a character is clearly alone — and one moment where two characters genuinely connect. Write one sentence for each. What's different between them?",
        reveal: "This question has no single answer — the evidence matters more than the conclusion. Loneliness in this novel often looks like silence, avoidance, or a character facing away. Connection tends to arrive sideways: through a story, a laugh, a dog that won't leave. Push students to be specific: which moment, which page, which word."
      },
      {
        q: "Several characters in the novel carry something they can't fix — a person who left, a mistake they made, a grief that won't close. What do people do with things they can't fix?",
        reveal: "This is the novel's spine. The preacher can't fix Opal's mother leaving — he tells ten things instead. Gloria can't undo her past — she hangs the bottles on a tree so she can see them. Miss Franny can't stop being afraid — but she tells the story anyway. DiCamillo's answer seems to be: you don't fix it. You find a way to carry it with company."
      },
      {
        q: "Winn-Dixie doesn't cause the friendships in the novel — he just makes them possible. Why does it sometimes take a third thing to bring two people together?",
        reveal: "The dog functions as a social catalyst — he gives strangers a reason to speak. Without him, Opal has no way into Miss Franny's library, no excuse to linger at Gertrude's Pets, no reason to knock on Gloria's gate. DiCamillo understands that people who are lonely often need something to talk about before they can talk about themselves."
      }
    ]
  }

];

const zones = ZONES;
