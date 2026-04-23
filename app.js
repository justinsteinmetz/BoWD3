// ===== STATE =====
let studentName    = "";
const zoneState    = {};   // { zoneId: { text, choice, answers, crafts, texts } }
let focusMode      = false;
let currentZoneIndex = 0;

// Derive act count from data — never hardcode
const maxAct = () => Math.max(...zones.map(z => z.act));

// ===== PERSISTENCE =====
const STORE_KEY = () => `bowd_${studentName}`;

function saveToStorage() {
  if (!studentName) return;
  try {
    localStorage.setItem(STORE_KEY(), JSON.stringify(zoneState));
  } catch (e) { /* storage full or unavailable */ }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORE_KEY());
    if (raw) Object.assign(zoneState, JSON.parse(raw));
  } catch (e) { /* corrupt or unavailable */ }
}

// ===== LOCK STATE =====
// Separate from zone data — never mutate source
const unlockedActs = new Set([1]);

function isZoneLocked(zone) {
  return !unlockedActs.has(zone.act);
}

// ===== LOGIN =====
function startSession() {
  const input = document.getElementById("nameInput");
  const name  = input.value.trim();
  if (!name) { input.placeholder = "Please enter your name"; return; }
  studentName = name;
  loadFromStorage();
  document.getElementById("login-screen").style.display = "none";
  document.body.classList.remove("locked");
  initApp();
}

// ===== INIT =====
function initApp() {
  if (typeof zones === "undefined") { console.error("zones.js not loaded"); return; }
  renderNav();
  renderZone(0);
}

// ===== NAV =====
function renderNav() {
  const nav = document.getElementById("nav");
  nav.innerHTML = "";
  let lastAct = null;
  zones.forEach((zone, i) => {
    if (zone.act !== lastAct) {
      const divider = document.createElement("div");
      divider.className = "nav-act-divider";
      divider.textContent = `Act ${zone.act}`;
      nav.appendChild(divider);
      lastAct = zone.act;
    }
    const btn = document.createElement("button");
    btn.innerHTML = `<span class="nav-num">${i + 1}</span>${zone.title}`;
    if (i === currentZoneIndex) btn.classList.add("active");
    const locked = isZoneLocked(zone);
    if (locked) {
      btn.classList.add("locked");
      btn.disabled = true;
    }
    btn.onclick = () => {
      if (isZoneLocked(zone)) return;
      document.querySelectorAll(".zone-nav button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      switchZone(i);
    };
    nav.appendChild(btn);
  });
}

// ===== ZONE SWITCH =====
function switchZone(index) {
  if (isZoneLocked(zones[index])) return;
  const app     = document.getElementById("app");
  const current = app.querySelector(".zone.active");
  if (current) {
    current.style.transition = "opacity 140ms ease";
    current.style.opacity    = "0";
    setTimeout(() => renderZone(index), 150);
  } else {
    renderZone(index);
  }
}

// ===== ZONE ROUTER =====
function renderZone(index) {
  currentZoneIndex = index;
  const zone = zones[index];
  const app  = document.getElementById("app");

  let inner = "";
  switch (zone.type) {
    case "vocab":     inner = renderVocab(zone);    break;
    case "quiz":      inner = renderQuiz(zone);      break;
    case "charmap":   inner = renderCharmap(zone);   break;
    case "craft":     inner = renderCraft(zone);     break;
    case "creative":  inner = renderCreative(zone);  break;
    case "extension": inner = renderExtension(zone); break;
    default:          inner = renderGeneric(zone);   break;
  }

  app.innerHTML = `
    <section class="zone" style="opacity:0">
      <div class="zone-header">
        <div class="zone-subtitle">${zone.subtitle || ""}</div>
        <h2>${zone.title}</h2>
        ${zone.teacherNote ? `<div class="zone-teacher-note">${zone.teacherNote}</div>` : ""}
      </div>
      ${inner}
    </section>`;

  const section = app.querySelector(".zone");
  wireZone(section, zone);

  requestAnimationFrame(() => requestAnimationFrame(() => {
    section.classList.add("active");
    section.style.transition = "opacity 180ms ease";
    section.style.opacity    = "1";
  }));
}

// ═══════════════════════════════════════════════════════
// RENDERERS
// ═══════════════════════════════════════════════════════

// ── VOCAB ────────────────────────────────────────────
function renderVocab(zone) {
  const cards = zone.words.map((w, i) => `
    <div class="vocab-card" data-index="${i}">
      <div class="vocab-front">
        <div class="vocab-word">${w.word}</div>
        <div class="vocab-hint">${w.hint} — tap to reveal</div>
      </div>
      <div class="vocab-back">
        <div class="vocab-word">${w.word}</div>
        <div class="vocab-def">${w.def}</div>
      </div>
    </div>`).join("");

  const saved = (zoneState[zone.id] || {}).text || "";
  return `
    <div class="vocab-grid">${cards}</div>
    <div class="surface-divider"></div>
    <div class="open-write-label">Use one of these words in a sentence of your own:</div>
    <textarea id="ta-${zone.id}" class="thinking-area" placeholder="e.g. The congregation gathered despite the rain…">${saved}</textarea>
    <div class="word-count">0 words</div>`;
}

// ── QUIZ ─────────────────────────────────────────────
function renderQuiz(zone) {
  const saved = (zoneState[zone.id] || {}).answers || {};
  const qs = zone.questions.map((q, qi) => {
    const answered = saved[qi] !== undefined ? saved[qi] : undefined;
    const opts = q.opts.map((o, oi) => {
      let cls = "opt-btn";
      if (answered !== undefined) {
        if (oi === q.correct)                      cls += " correct";
        else if (oi === answered)                  cls += " wrong";
        else                                       cls += " spent";
      }
      return `<button class="${cls}" data-qi="${qi}" data-oi="${oi}" ${answered !== undefined ? "disabled" : ""}>${o}</button>`;
    }).join("");

    const feedback = answered !== undefined
      ? `<div class="feedback ${answered === q.correct ? "fb-correct" : "fb-wrong"}">
           ${answered === q.correct ? "✓ Correct — " : "✗ Not quite — "}${q.explain}
         </div>`
      : `<div class="feedback" id="fb-${qi}"></div>`;

    return `
      <div class="quiz-q" id="qq-${qi}">
        <p><span class="q-num">${qi + 1}.</span> ${q.q}</p>
        <div class="options">${opts}</div>
        ${feedback}
      </div>`;
  }).join("");

  // Unified score calculation using entries (correct fix)
  const answers = (zoneState[zone.id] || {}).answers || {};
  const allAnswered = Object.keys(answers).length === zone.questions.length;
  const score = allAnswered
    ? Object.entries(answers).filter(([qi, oi]) => oi === zone.questions[+qi].correct).length
    : 0;
  const scoreBadge = allAnswered
    ? `<div class="score-line">Score: <strong>${score} / ${zone.questions.length}</strong></div>` : "";

  return `<div class="quiz-wrap">${qs}${scoreBadge}</div>`;
}

// ── CHARACTER MAP ────────────────────────────────────
function renderCharmap(zone) {
  const nodes = zone.characters.map((c, i) => `
    <div class="char-node" data-ci="${i}">
      <div class="char-emoji">${c.emoji}</div>
      <div class="char-name">${c.name}</div>
      <div class="char-role">${c.role}</div>
    </div>`).join("");

  const saved = (zoneState[zone.id] || {}).text || "";
  return `
    <div class="char-grid">${nodes}</div>
    <div class="char-expand-panel" id="char-panel"></div>
    <div class="surface-divider"></div>
    <div class="open-write-label">${zone.prompt}</div>
    <textarea id="ta-${zone.id}" class="thinking-area" placeholder="Write your thoughts here…">${saved}</textarea>
    <div class="word-count">0 words</div>`;
}

// ── CRAFT ────────────────────────────────────────────
function renderCraft(zone) {
  const blocks = zone.similes.map((s, si) => {
    const quoted = s.quote.replace(
      s.highlight,
      `<span class="craft-highlight">${s.highlight}</span>`
    );
    const savedText = ((zoneState[zone.id] || {}).crafts || {})[si] || "";
    return `
      <div class="craft-block surface-dense">
        <div class="craft-quote">"${quoted}"</div>
        <div class="craft-question">${s.question}</div>
        <textarea id="ta-${zone.id}-${si}" class="thinking-area craft-ta" placeholder="Your analysis…" data-si="${si}">${savedText}</textarea>
        <button class="reveal-btn" data-si="${si}">What DiCamillo means ↓</button>
        <div class="craft-answer" id="craft-ans-${si}">${s.answer}</div>
      </div>`;
  }).join("");
  return `<div class="craft-wrap">${blocks}</div>`;
}

// ── CREATIVE ─────────────────────────────────────────
function renderCreative(zone) {
  const chips = zone.chips.map(c =>
    `<button class="prompt-chip" data-prompt="${c}">${c}</button>`).join("");
  const saved = (zoneState[zone.id] || {}).text || "";
  return `
    <div class="surface-light">
      <div class="entry-prompt">${zone.mainPrompt}</div>
      <div class="chip-row">${chips}</div>
      <textarea id="ta-${zone.id}" class="thinking-area creative-ta" placeholder="${zone.placeholder}">${saved}</textarea>
      <div class="word-count">0 words</div>
    </div>`;
}

// ── EXTENSION ────────────────────────────────────────
function renderExtension(zone) {
  const qs = zone.questions.map((q, qi) => {
    const saved = ((zoneState[zone.id] || {}).texts || {})[qi] || "";
    return `
      <div class="ext-block surface-dense">
        <div class="ext-q-text">${q.q}</div>
        <textarea id="ta-${zone.id}-${qi}" class="thinking-area ext-ta" placeholder="Your thinking…" data-qi="${qi}">${saved}</textarea>
        <button class="reveal-btn ext-reveal" data-qi="${qi}">One way to think about it ↓</button>
        <div class="ext-answer" id="ext-ans-${qi}">${q.reveal}</div>
      </div>`;
  }).join("");
  return `<div class="ext-wrap">${qs}</div>`;
}

// ── GENERIC (fallback) ───────────────────────────────
function renderGeneric(zone) {
  const saved = zoneState[zone.id] || {};
  const choiceHtml = zone.choices ? `
    <div class="choice-row">
      ${zone.choices.map(c => `<button class="${saved.choice === c ? "selected" : ""}" data-choice="${c}">${c}</button>`).join("")}
    </div>` : "";
  const savedText = saved.text || "";
  return `
    <div class="zone-prompt">${zone.prompt || ""}</div>
    ${choiceHtml}
    <div class="open-write-label">Your thoughts</div>
    <textarea id="ta-${zone.id}" class="thinking-area" placeholder="Write a short thought…">${savedText}</textarea>
    <div class="word-count">0 words</div>`;
}

// ═══════════════════════════════════════════════════════
// WIRE-UP (events after render)
// ═══════════════════════════════════════════════════════
function wireZone(section, zone) {

  // Word count on all textareas
  section.querySelectorAll("textarea").forEach(ta => {
    const counter = ta.nextElementSibling;
    const update  = () => {
      const words = ta.value.trim().split(/\s+/).filter(Boolean).length;
      if (counter && counter.classList.contains("word-count"))
        counter.textContent = words + (words === 1 ? " word" : " words");
    };
    ta.addEventListener("input", update);
    update();
  });

  // ── VOCAB flip ──
  section.querySelectorAll(".vocab-card").forEach(card => {
    card.addEventListener("click", () => card.classList.toggle("revealed"));
  });

  // ── VOCAB textarea — explicit by id ──
  if (zone.type === "vocab") {
    const ta = document.getElementById(`ta-${zone.id}`);
    if (ta) ta.addEventListener("input", () => {
      if (!zoneState[zone.id]) zoneState[zone.id] = {};
      zoneState[zone.id].text = ta.value;
      saveToStorage();
    });
  }

  // ── QUIZ options ──
  section.querySelectorAll(".opt-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const qi  = +btn.dataset.qi;
      const oi  = +btn.dataset.oi;
      const q   = zone.questions[qi];
      const row = section.querySelector(`#qq-${qi}`);

      row.querySelectorAll(".opt-btn").forEach(b => {
        b.disabled = true;
        const boi = +b.dataset.oi;
        if (boi === q.correct)    b.classList.add("correct");
        else if (boi === oi)      b.classList.add("wrong");
        else                      b.classList.add("spent");
      });

      const fb = row.querySelector(".feedback");
      const correct = oi === q.correct;
      fb.className   = "feedback " + (correct ? "fb-correct" : "fb-wrong");
      fb.textContent = (correct ? "✓ Correct — " : "✗ Not quite — ") + q.explain;

      if (!zoneState[zone.id])         zoneState[zone.id] = {};
      if (!zoneState[zone.id].answers) zoneState[zone.id].answers = {};
      zoneState[zone.id].answers[qi] = oi;
      saveToStorage();

      // Unified score — entries, not values
      const answers = zoneState[zone.id].answers;
      if (Object.keys(answers).length === zone.questions.length) {
        const score = Object.entries(answers)
          .filter(([i, v]) => v === zone.questions[+i].correct).length;
        const wrap  = section.querySelector(".quiz-wrap");
        let badge   = wrap.querySelector(".score-line");
        if (!badge) { badge = document.createElement("div"); badge.className = "score-line"; wrap.appendChild(badge); }
        badge.innerHTML = `Score: <strong>${score} / ${zone.questions.length}</strong>`;
      }
    });
  });

  // ── CHARMAP expand ──
  section.querySelectorAll(".char-node").forEach(node => {
    node.addEventListener("click", () => {
      const ci    = +node.dataset.ci;
      const c     = zone.characters[ci];
      const panel = section.querySelector("#char-panel");

      if (panel.dataset.open === String(ci)) {
        panel.dataset.open = "";
        panel.innerHTML    = "";
        section.querySelectorAll(".char-node").forEach(n => n.classList.remove("selected"));
        return;
      }

      section.querySelectorAll(".char-node").forEach(n => n.classList.remove("selected"));
      node.classList.add("selected");
      panel.dataset.open = ci;

      const traits = c.traits.map(t => `<span class="trait-tag">${t}</span>`).join("");
      panel.innerHTML = `
        <div class="char-expand-inner">
          <div class="char-expand-name">${c.emoji} ${c.name} <span class="char-expand-role">${c.role}</span></div>
          <div class="trait-row">${traits}</div>
          <div class="char-think">${c.think}</div>
        </div>`;
    });
  });

  // ── CHARMAP textarea — explicit by id ──
  if (zone.type === "charmap") {
    const ta = document.getElementById(`ta-${zone.id}`);
    if (ta) ta.addEventListener("input", () => {
      if (!zoneState[zone.id]) zoneState[zone.id] = {};
      zoneState[zone.id].text = ta.value;
      saveToStorage();
    });
  }

  // ── CRAFT reveal + save — explicit by id ──
  if (zone.type === "craft") {
    zone.similes.forEach((_, si) => {
      const ta = document.getElementById(`ta-${zone.id}-${si}`);
      if (ta) ta.addEventListener("input", () => {
        if (!zoneState[zone.id])        zoneState[zone.id] = {};
        if (!zoneState[zone.id].crafts) zoneState[zone.id].crafts = {};
        zoneState[zone.id].crafts[si] = ta.value;
        saveToStorage();
      });
    });
    section.querySelectorAll(".reveal-btn").forEach(btn => {
      if (btn.dataset.si !== undefined) {
        btn.addEventListener("click", () => {
          const ans  = section.querySelector(`#craft-ans-${btn.dataset.si}`);
          const open = ans.classList.toggle("visible");
          btn.textContent = open ? "Hide ↑" : "What DiCamillo means ↓";
        });
      }
    });
  }

  // ── CREATIVE chips + save — explicit by id ──
  if (zone.type === "creative") {
    const ta = document.getElementById(`ta-${zone.id}`);
    if (ta) {
      section.querySelectorAll(".prompt-chip").forEach(chip => {
        chip.addEventListener("click", () => {
          ta.value += (ta.value ? "\n" : "") + chip.dataset.prompt + " ";
          ta.focus();
          ta.dispatchEvent(new Event("input"));
        });
      });
      ta.addEventListener("input", () => {
        if (!zoneState[zone.id]) zoneState[zone.id] = {};
        zoneState[zone.id].text = ta.value;
        saveToStorage();
      });
    }
  }

  // ── EXTENSION reveal + save — explicit by id ──
  if (zone.type === "extension") {
    zone.questions.forEach((_, qi) => {
      const ta = document.getElementById(`ta-${zone.id}-${qi}`);
      if (ta) ta.addEventListener("input", () => {
        if (!zoneState[zone.id])       zoneState[zone.id] = {};
        if (!zoneState[zone.id].texts) zoneState[zone.id].texts = {};
        zoneState[zone.id].texts[qi] = ta.value;
        saveToStorage();
      });
    });
    section.querySelectorAll(".ext-reveal").forEach(btn => {
      btn.addEventListener("click", () => {
        const ans  = section.querySelector(`#ext-ans-${btn.dataset.qi}`);
        const open = ans.classList.toggle("visible");
        btn.textContent = open ? "Hide ↑" : "One way to think about it ↓";
      });
    });
  }

  // ── GENERIC choice buttons ──
  section.querySelectorAll(".choice-row button").forEach(btn => {
    btn.addEventListener("click", () => {
      section.querySelectorAll(".choice-row button").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      if (!zoneState[zone.id]) zoneState[zone.id] = {};
      zoneState[zone.id].choice = btn.dataset.choice;
      saveToStorage();
    });
  });
}

// ═══════════════════════════════════════════════════════
// TEACHER CONTROLS
// ═══════════════════════════════════════════════════════
function toggleFocusMode() {
  focusMode = !focusMode;
  document.body.classList.toggle("focus-mode", focusMode);
}

// ── Keyboard shortcuts ──
document.addEventListener("keydown", e => {
  if (e.shiftKey && e.key === "U") {
    const next = Math.max(...[...unlockedActs]) + 1;
    if (next <= maxAct()) {
      unlockedActs.add(next);
      renderNav();
    }
  }
  if (e.shiftKey && e.key === "T") document.getElementById("teacher-panel").classList.toggle("visible");
  if (e.shiftKey && e.key === "F") toggleFocusMode();
});
