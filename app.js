// ===== STATE =====
let studentName = "";
const zoneState   = {};   // { zoneId: { text, choice, ... } }
const aggCounts   = {};
let aggVisible    = true;
let aggFrozen     = false;
let focusMode     = false;
let currentAct    = 1;
let currentZoneIndex = 0;

// ===== LOGIN =====
function startSession() {
  const input = document.getElementById("nameInput");
  const name  = input.value.trim();
  if (!name) { input.placeholder = "Please enter your name"; return; }
  studentName = name;
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
    if (zone.locked) {
      btn.classList.add("locked");
      btn.disabled = true;
    }
    btn.onclick = () => {
      if (zone.locked) return;
      document.querySelectorAll(".zone-nav button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      switchZone(i);
    };
    nav.appendChild(btn);
  });
}

// ===== ZONE SWITCH =====
function switchZone(index) {
  if (zones[index].locked) return;
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
    <div class="vocab-card" data-index="${i}" data-revealed="false">
      <div class="vocab-front">
        <div class="vocab-word">${w.word}</div>
        <div class="vocab-hint">${w.hint} — tap to reveal</div>
      </div>
      <div class="vocab-back">
        <div class="vocab-word">${w.word}</div>
        <div class="vocab-def">${w.def}</div>
      </div>
    </div>`).join("");

  return `
    <div class="vocab-grid">${cards}</div>
    <div class="surface-divider"></div>
    <div class="open-write-label">Use one of these words in a sentence of your own:</div>
    <textarea class="thinking-area" placeholder="e.g. The congregation gathered despite the rain…">${(zoneState[zone.id] || {}).text || ""}</textarea>
    <div class="word-count">0 words</div>`;
}

// ── QUIZ ─────────────────────────────────────────────
function renderQuiz(zone) {
  const saved = (zoneState[zone.id] || {}).answers || {};
  const qs = zone.questions.map((q, qi) => {
    const answered = saved[qi];
    const opts = q.opts.map((o, oi) => {
      let cls = "opt-btn";
      if (answered !== undefined) {
        if (oi === q.correct) cls += " correct";
        else if (oi === answered && oi !== q.correct) cls += " wrong";
        else cls += " spent";
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

  const score = Object.values(saved).filter((v, i) => v === zone.questions[i].correct).length;
  const scoreBadge = Object.keys(saved).length === zone.questions.length
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
    <textarea class="thinking-area" placeholder="Write your thoughts here…">${saved}</textarea>
    <div class="word-count">0 words</div>`;
}

// ── CRAFT ────────────────────────────────────────────
function renderCraft(zone) {
  const blocks = zone.similes.map((s, si) => {
    const quoted = s.quote.replace(
      s.highlight,
      `<span class="craft-highlight">${s.highlight}</span>`
    );
    return `
      <div class="craft-block surface-dense">
        <div class="craft-quote">"${quoted}"</div>
        <div class="craft-question">${s.question}</div>
        <textarea class="thinking-area craft-ta" placeholder="Your analysis…" data-si="${si}">${((zoneState[zone.id] || {}).crafts || {})[si] || ""}</textarea>
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
      <textarea class="thinking-area creative-ta" placeholder="${zone.placeholder}">${saved}</textarea>
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
        <textarea class="thinking-area ext-ta" placeholder="Your thinking…" data-qi="${qi}">${saved}</textarea>
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
  return `
    <div class="zone-prompt">${zone.prompt || ""}</div>
    ${choiceHtml}
    <div class="open-write-label">Your thoughts</div>
    <textarea class="thinking-area" placeholder="Write a short thought…">${saved.text || ""}</textarea>
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
    card.addEventListener("click", () => {
      card.classList.toggle("revealed");
    });
  });

  // Vocab textarea save
  const vocabTa = section.querySelector(".thinking-area:not(.craft-ta):not(.creative-ta):not(.ext-ta)");
  if (vocabTa && zone.type === "vocab") {
    vocabTa.addEventListener("input", () => {
      if (!zoneState[zone.id]) zoneState[zone.id] = {};
      zoneState[zone.id].text = vocabTa.value;
    });
  }

  // ── QUIZ options ──
  section.querySelectorAll(".opt-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const qi  = +btn.dataset.qi;
      const oi  = +btn.dataset.oi;
      const q   = zone.questions[qi];
      const row = section.querySelector(`#qq-${qi}`);

      // disable all options in this question
      row.querySelectorAll(".opt-btn").forEach(b => {
        b.disabled = true;
        const boi = +b.dataset.oi;
        if (boi === q.correct) b.classList.add("correct");
        else if (boi === oi)   b.classList.add("wrong");
        else                   b.classList.add("spent");
      });

      // feedback
      const fb = row.querySelector(".feedback");
      const correct = oi === q.correct;
      fb.className = "feedback " + (correct ? "fb-correct" : "fb-wrong");
      fb.textContent = (correct ? "✓ Correct — " : "✗ Not quite — ") + q.explain;

      // save answer
      if (!zoneState[zone.id])          zoneState[zone.id] = {};
      if (!zoneState[zone.id].answers)  zoneState[zone.id].answers = {};
      zoneState[zone.id].answers[qi] = oi;

      // score badge
      const answered = zoneState[zone.id].answers;
      if (Object.keys(answered).length === zone.questions.length) {
        const score = Object.entries(answered).filter(([i, v]) => +v === zone.questions[+i].correct).length;
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
      const ci   = +node.dataset.ci;
      const c    = zone.characters[ci];
      const panel = section.querySelector("#char-panel");

      // toggle off if same
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

  // Charmap textarea save
  const charmapTa = zone.type === "charmap" ? section.querySelector(".thinking-area") : null;
  if (charmapTa) {
    charmapTa.addEventListener("input", () => {
      if (!zoneState[zone.id]) zoneState[zone.id] = {};
      zoneState[zone.id].text = charmapTa.value;
    });
  }

  // ── CRAFT reveal + save ──
  section.querySelectorAll(".craft-ta").forEach(ta => {
    ta.addEventListener("input", () => {
      const si = ta.dataset.si;
      if (!zoneState[zone.id])         zoneState[zone.id] = {};
      if (!zoneState[zone.id].crafts)  zoneState[zone.id].crafts = {};
      zoneState[zone.id].crafts[si] = ta.value;
    });
  });
  section.querySelectorAll(".reveal-btn").forEach(btn => {
    if (btn.dataset.si !== undefined) {
      btn.addEventListener("click", () => {
        const ans = section.querySelector(`#craft-ans-${btn.dataset.si}`);
        const open = ans.classList.toggle("visible");
        btn.textContent = open ? "Hide ↑" : "What DiCamillo means ↓";
      });
    }
  });

  // ── CREATIVE chips + save ──
  const creativeTa = section.querySelector(".creative-ta");
  if (creativeTa) {
    section.querySelectorAll(".prompt-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        creativeTa.value += (creativeTa.value ? "\n" : "") + chip.dataset.prompt + " ";
        creativeTa.focus();
        creativeTa.dispatchEvent(new Event("input"));
      });
    });
    creativeTa.addEventListener("input", () => {
      if (!zoneState[zone.id]) zoneState[zone.id] = {};
      zoneState[zone.id].text = creativeTa.value;
    });
  }

  // ── EXTENSION reveal + save ──
  section.querySelectorAll(".ext-ta").forEach(ta => {
    ta.addEventListener("input", () => {
      const qi = ta.dataset.qi;
      if (!zoneState[zone.id])        zoneState[zone.id] = {};
      if (!zoneState[zone.id].texts)  zoneState[zone.id].texts = {};
      zoneState[zone.id].texts[qi] = ta.value;
    });
  });
  section.querySelectorAll(".ext-reveal").forEach(btn => {
    btn.addEventListener("click", () => {
      const ans  = section.querySelector(`#ext-ans-${btn.dataset.qi}`);
      const open = ans.classList.toggle("visible");
      btn.textContent = open ? "Hide ↑" : "One way to think about it ↓";
    });
  });

  // ── GENERIC choice buttons ──
  section.querySelectorAll(".choice-row button").forEach(btn => {
    btn.addEventListener("click", () => {
      section.querySelectorAll(".choice-row button").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      if (!zoneState[zone.id]) zoneState[zone.id] = {};
      zoneState[zone.id].choice = btn.dataset.choice;
    });
  });
}

// ═══════════════════════════════════════════════════════
// TEACHER CONTROLS
// ═══════════════════════════════════════════════════════
function toggleAggregation() {
  aggVisible = !aggVisible;
  const btn = document.getElementById("btn-agg");
  btn.textContent = aggVisible ? "Hide responses" : "Show responses";
  btn.classList.toggle("on", !aggVisible);
}
function freezeAggregation() {
  aggFrozen = !aggFrozen;
  const btn = document.getElementById("btn-freeze");
  btn.textContent = aggFrozen ? "Unfreeze" : "Freeze";
  btn.classList.toggle("on", aggFrozen);
}
function resetAggregation() {
  Object.keys(aggCounts).forEach(id => {
    const zone = zones.find(z => z.id === id);
    if (zone && zone.choices) zone.choices.forEach(c => { aggCounts[id][c] = 0; });
  });
}
function toggleResponsePanel() {
  const panel  = document.getElementById("response-panel");
  const btn    = document.getElementById("btn-responses");
  const visible = panel.classList.toggle("visible");
  panel.style.display = visible ? "block" : "none";
  btn.textContent     = visible ? "Hide thoughts" : "Show thoughts";
  btn.classList.toggle("on", visible);
}
function toggleFocusMode() {
  focusMode = !focusMode;
  document.body.classList.toggle("focus-mode", focusMode);
}

// ── Keyboard shortcuts ──
document.addEventListener("keydown", e => {
  if (e.shiftKey && e.key === "U") {
    if (currentAct < 3) currentAct++;
    zones.forEach(z => { if (z.act <= currentAct) z.locked = false; });
    renderNav();
  }
  if (e.shiftKey && e.key === "T") document.getElementById("teacher-panel").classList.toggle("visible");
  if (e.shiftKey && e.key === "F") toggleFocusMode();
});
