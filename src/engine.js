/* ===== Shared game engine (Training Camp + Game Day) ===== */
const TIERS = {
  camp: { label: "Fundamentals", diff: 1, name: "Basics", gain: [2, 5],   desc: "Three-point stance work. A miss costs nothing but the down." },
  run:  { label: "Run",          diff: 1, name: "Easy",   gain: [3, 7],   desc: "Steady yards, low risk. A miss gets stuffed at the line." },
  pass: { label: "Short Pass",   diff: 2, name: "Medium", gain: [8, 15],  desc: "Moves the chains. A miss falls incomplete." },
  deep: { label: "Deep Shot",    diff: 3, name: "Hard",   gain: [22, 38], desc: "Chunk play. A miss can get picked off." }
};
const DRIVES_PER_GAME = 8;
const BYID = Object.fromEntries(CH.map(c => [c.id, c]));
const ORDER = CH.map(c => c.id);
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

/* ---------- persistence (per-viewer convenience only) ---------- */
const STORE_KEY = "playbook." + GAME.key + ".v1";
let P = { solved: {}, best: 0, drafts: {}, campIdx: 0, mode: "camp" };
try { const raw = localStorage.getItem(STORE_KEY); if (raw) P = Object.assign(P, JSON.parse(raw)); } catch (e) {}
function persist() { try { localStorage.setItem(STORE_KEY, JSON.stringify(P)); } catch (e) {} }

/* ---------- state ---------- */
let S;
function freshGame() {
  return { yl: 25, down: 1, toGo: 10, score: 0, drive: 1, snaps: 0, hits: 0, tds: 0, fgs: 0, timeouts: 3, trivRight: 0, trivTotal: 0,
    log: [], phase: "kickoff", trivia: null, trivAnswered: null, cur: null, tier: null, kind: null, snapped: false, hintShown: false,
    seen: [], over: false, returnTo: null };
}
function ddText(down, toGo, yl) { return ["", "1st", "2nd", "3rd", "4th"][down] + " & " + (yl + toGo >= 100 ? "Goal" : toGo); }
function ballText(yl) { return yl < 50 ? "OWN " + yl : yl === 50 ? "50" : "OPP " + (100 - yl); }
const inCamp = () => P.mode === "camp";

/* ---------- field ---------- */
function buildField() {
  const f = $("field");
  let h = '<div class="ez l"><span>HOME</span></div><div class="ez r"><span>END ZONE</span></div>';
  for (let y = 0; y <= 100; y += 10) {
    const left = (10 + y) / 120 * 100;
    h += '<div class="yl" style="left:' + left + '%"></div>';
    if (y > 0 && y < 100) h += '<div class="yn" style="left:' + left + '%">' + (y <= 50 ? y : 100 - y) + '</div>';
  }
  h += '<div class="mark los" id="mLos"></div><div class="mark fd" id="mFd"></div><div class="ball" id="mBall"></div>';
  f.innerHTML = h;
}
const pct = yl => (10 + yl) / 120 * 100 + "%";
function renderField() {
  const fdY = Math.min(100, S.yl + S.toGo);
  $("mLos").style.left = pct(S.yl); $("mBall").style.left = pct(S.yl); $("mFd").style.left = pct(fdY);
  $("mFd").hidden = fdY >= 100;
}

/* ---------- scoreboard + camp strip ---------- */
function renderBoard() {
  const camp = inCamp();
  $("gameBar").hidden = camp; $("campBar").hidden = !camp; $("logPanel").hidden = camp; $("btnNew").hidden = camp;
  document.querySelectorAll(".modes button").forEach(b => b.classList.toggle("on", b.dataset.mode === P.mode));
  if (camp) {
    const done = CH.filter(c => P.solved[c.id]).length;
    $("campBar").innerHTML = '<div><div class="big">Training Camp</div><div class="sub">Drill ' + (P.campIdx + 1) + ' of ' + CH.length + ' · ' + esc(BYID[ORDER[P.campIdx]].concept) + '</div></div>' +
      '<div class="prog"><div class="sub">' + done + ' of ' + CH.length + ' drills complete</div><div class="bar"><i style="width:' + (done / CH.length * 100) + '%"></i></div></div>';
    return;
  }
  $("sbScore").textContent = S.score;
  $("sbDrive").textContent = Math.min(S.drive, DRIVES_PER_GAME) + " / " + DRIVES_PER_GAME;
  $("sbDown").textContent = S.over ? "Final" : S.phase === "kickoff" ? "Kickoff" : ddText(S.down, S.toGo, S.yl);
  $("sbBall").textContent = S.over ? "--" : ballText(S.yl);
  $("sbComp").textContent = S.hits + "/" + S.snaps;
  $("sbTO").innerHTML = [0, 1, 2].map(i => '<i class="' + (i < S.timeouts ? "" : "used") + '"></i>').join("");
  renderField();
}

/* ---------- log ---------- */
function addLog(tag, cls, text) {
  S.log.unshift({ tag, cls, text, sit: (S.phase === "kickoff" ? "Kickoff" : ddText(S.down, S.toGo, S.yl) + " · " + ballText(S.yl)) + " · Poss " + Math.min(S.drive, DRIVES_PER_GAME) });
  S.log = S.log.slice(0, 60);
}
function renderLog() {
  const el = $("log");
  if (!S.log.length) { el.innerHTML = '<p class="empty">No snaps yet. Answer the kickoff trivia, then pick a play in the huddle.</p>'; return; }
  el.innerHTML = S.log.map(l => '<li><span class="tag ' + l.cls + '">' + esc(l.tag) + '</span><div>' + esc(l.text) + '<div class="sit">' + esc(l.sit) + '</div></div></li>').join("");
}

/* ---------- playbook list ---------- */
function renderPlaybook() {
  const total = CH.length, done = CH.filter(c => P.solved[c.id]).length;
  $("pbCount").textContent = done + "/" + total;
  $("pbBar").style.width = (done / total * 100) + "%";
  const curId = inCamp() ? ORDER[P.campIdx] : (S.phase === "play" || S.phase === "practice") ? S.cur : null;
  $("pbList").innerHTML = Object.keys(TIERS).map(t =>
    '<div class="pb-group"><div class="eyebrow">' + TIERS[t].label + ' · ' + TIERS[t].name + '</div>' +
    CH.filter(c => c.tier === t).map(c =>
      '<button class="pb-item' + (c.id === curId ? " cur" : "") + '" type="button" data-open="' + c.id + '"><span class="t2">' + esc(c.title) + '</span><span class="cpt">' + esc(c.concept) + '</span><span class="ck ' + (P.solved[c.id] ? "done" : "") + '">' + (P.solved[c.id] ? "✓" : "") + '</span></button>'
    ).join("") + '</div>').join("");
}

/* ---------- huddle ---------- */
function diffDots(n) { return '<span class="diff" aria-label="difficulty ' + n + ' of 3">' + [1,2,3].map(i => '<i class="' + (i <= n ? "on" : "") + '"></i>').join("") + '</span>'; }
function renderHuddle() {
  const fgDist = 100 - S.yl + 17;
  const canFG = S.down === 4 && fgDist <= 55;
  const campDone = CH.filter(c => c.tier === "camp" && P.solved[c.id]).length, campTotal = CH.filter(c => c.tier === "camp").length;
  const tips = [
    campDone < campTotal ? "You've finished " + campDone + " of " + campTotal + " fundamentals. Run Fundamentals plays or switch to Training Camp to knock them out in order." : "Fundamentals are all checked off. Nice. Run and Pass plays build on them.",
    "Every play has a Chalk talk button. Read it before you write a line, same as a walkthrough before a live rep.",
    "Burn a timeout to get a hint. You get 3 per possession.",
    "Miss a play? Read the film room, then rewrite it without looking. That second rep is where it sticks.",
    GAME.consoleTip
  ];
  let h = '<div class="huddle-head"><div><div class="eyebrow">Huddle · Possession ' + S.drive + ' of ' + DRIVES_PER_GAME + '</div><h2>' + ddText(S.down, S.toGo, S.yl) + ' at ' + ballText(S.yl) + '</h2></div></div>';
  h += '<div class="plays">' + Object.keys(TIERS).map(t => {
    const T = TIERS[t];
    return '<button class="play" type="button" data-call="' + t + '"><span class="pn">' + T.label + '</span><span class="meta"><span>' + diffDots(T.diff) + ' ' + T.name + '</span><span class="yds">+' + T.gain[0] + ' to ' + T.gain[1] + ' yds</span></span><span class="desc">' + T.desc + '</span></button>';
  }).join("") + '</div>';
  if (S.down === 4) {
    h += '<div class="special"><div class="eyebrow">4th down: go for it above, or bring out special teams</div><div class="plays">';
    if (canFG) h += '<button class="play" type="button" data-call="fg"><span class="pn">' + fgDist + '-yd Field Goal</span><span class="meta"><span>' + diffDots(1) + ' Easy</span><span class="yds">3 pts</span></span><span class="desc">An easy drill. Hit it for 3, miss and the possession ends.</span></button>';
    h += '<button class="play" type="button" data-call="punt"><span class="pn">Punt</span><span class="meta"><span>No drill</span><span class="yds">0 pts</span></span><span class="desc">Give it up and start the next possession.</span></button>';
    h += '</div></div>';
  }
  h += '<p class="coach-tip"><b>Coach:</b> ' + tips[(S.drive + S.down + S.snaps) % tips.length] + '</p>';
  $("stage").innerHTML = h;
}

function pickChallenge(tier) {
  const pool = CH.filter(c => c.tier === tier);
  const list = [pool.filter(c => !P.solved[c.id] && !S.seen.includes(c.id)), pool.filter(c => !S.seen.includes(c.id)), pool].find(l => l.length);
  const c = list[Math.floor(Math.random() * list.length)];
  S.seen.push(c.id); if (S.seen.length > 24) S.seen = S.seen.slice(-24);
  return c;
}
function callPlay(call) {
  if (call === "punt") { addLog("PUNT", "info", "Punted from " + ballText(S.yl) + "."); endPossession(); return render(); }
  const tier = call === "fg" ? "run" : call;
  const c = pickChallenge(tier);
  Object.assign(S, { phase: "play", cur: c.id, tier, kind: call === "fg" ? "fg" : "play", snapped: false, hintShown: false });
  render();
}

/* ---------- kickoff trivia ---------- */
function renderKickoff() {
  if (!S.trivia) S.trivia = makeTrivia();
  const t = S.trivia, a = S.trivAnswered;
  let h = '<div class="kick"><div><div class="eyebrow">Kickoff · Possession ' + S.drive + ' of ' + DRIVES_PER_GAME + '</div><h2>Spin a team, answer the question, set your field position</h2></div>';
  h += '<div class="spin"><div class="helmet">' + esc(t.team.abbr) + '</div><div><div class="tl">Your spin</div><div class="tn">' + esc(t.team.location + " " + t.team.name) + '</div></div></div>';
  h += '<div class="q">' + esc(t.q) + '</div>';
  h += '<div class="opts">' + t.options.map(o => {
    let cls = "opt";
    if (a) { if (o === t.answer) cls += " right"; else if (o === a) cls += " wrong"; }
    return '<button class="' + cls + '" type="button" data-ans="' + esc(o) + '"' + (a ? " disabled" : "") + '>' + esc(o) + '</button>';
  }).join("") + '</div>';
  if (a) {
    const right = a === t.answer;
    h += '<div class="banner ' + (right ? "good" : "bad") + '" style="margin-top:0"><span class="call">' + (right ? "Big return · ball at the 40" : "Tackled at the 20") + '</span><span class="sub">' + (right ? "Correct." : "Answer: " + esc(t.answer) + ".") + '</span></div>';
    h += '<p class="fact"><b>Scouting report:</b> ' + esc(t.fact) + (GAME.triviaExtra ? GAME.triviaExtra(t) : "") + '</p>';
    h += '<div class="actions"><button class="btn gold" type="button" id="btnHuddle">Break the huddle</button></div>';
  } else {
    h += '<p class="fact">Right answer starts the drive at your own 40. Wrong answer, the 20. <button class="btn" type="button" id="btnFair" style="margin-left:6px">Fair catch (skip, start at the 25)</button></p>';
  }
  h += '</div>';
  $("stage").innerHTML = h;
}
function answerTrivia(ans) {
  if (S.trivAnswered) return;
  S.trivAnswered = ans; S.trivTotal++;
  const right = ans === S.trivia.answer;
  if (right) S.trivRight++;
  S.yl = right ? 40 : 20;
  addLog(right ? "+15" : "KO", right ? "gain" : "info", (right ? "Trivia correct. Return out to the 40." : "Trivia miss. Tackled at the 20.") + " (" + S.trivia.team.name + ")");
  render();
}
function breakHuddle() { S.phase = "huddle"; S.trivia = null; S.trivAnswered = null; render(); window.scrollTo({ top: 0, behavior: "smooth" }); }

/* ---------- practice from the playbook list ---------- */
function openFromList(id) {
  if (inCamp()) { P.campIdx = ORDER.indexOf(id); persist(); render(); scrollStage(); return; }
  if (S.phase !== "practice") S.returnTo = { phase: S.phase, cur: S.cur, tier: S.tier, kind: S.kind, snapped: S.snapped, hintShown: S.hintShown };
  Object.assign(S, { phase: "practice", cur: id, tier: BYID[id].tier, kind: "practice", snapped: false, hintShown: false });
  render(); scrollStage();
}
function leavePractice() {
  const r = S.returnTo || { phase: "huddle" }; S.returnTo = null;
  Object.assign(S, r); if (S.over) S.phase = "final"; render();
}
function scrollStage() { window.scrollTo({ top: $("stage").offsetTop - 12, behavior: "smooth" }); }

/* ---------- challenge frame (camp, game, practice) ---------- */
function curKind() { return inCamp() ? "camp" : S.kind; }
function curId() { return inCamp() ? ORDER[P.campIdx] : S.cur; }

function talkHtml(c, open) {
  const t = c.teach;
  return '<div class="talk" id="talk"' + (open ? "" : " hidden") + '><div class="eyebrow">Chalk talk · ' + esc(c.concept) + '</div>' +
    '<div class="talk-row"><div><h4>What it is</h4><p>' + t.what + '</p></div><div><h4>Football translation</h4><p>' + t.football + '</p></div></div>' +
    (t.example ? '<div><h4>On the board</h4><pre>' + esc(t.example) + '</pre></div>' : '') + '</div>';
}
function filmHtml(c) {
  return '<div class="film" id="film" hidden><div class="eyebrow">Film room</div><p class="note">' + c.note + '</p><pre class="sol">' + esc(c.sol) + '</pre>' +
    (c.walk ? '<ul class="walk">' + c.walk.map(w => '<li><code>' + esc(w[0]) + '</code><span>' + w[1] + '</span></li>').join("") + '</ul>' : '') + '</div>';
}
function renderChallenge() {
  const kind = curKind(), c = BYID[curId()], T = TIERS[c.tier];
  const practice = kind === "practice", camp = kind === "camp", game = kind === "play" || kind === "fg";
  const label = camp ? "Drill " + (P.campIdx + 1) + " of " + CH.length + " · " + T.label : practice ? "Practice · " + T.name : kind === "fg" ? "Field goal · " + (100 - S.yl + 17) + " yds" : T.label + " · " + T.name;
  const code = P.drafts[c.id] ?? GAME.starter(c);
  const talkOpen = camp || c.tier === "camp" || !P.solved[c.id];
  const hintFree = !game || S.snapped;
  let h = '<div class="ch-head"><div><span class="pill' + (practice ? " blue" : "") + '">' + esc(label) + '</span><h2>' + esc(c.title) + '</h2><div class="eyebrow" style="margin-top:4px">' + esc(c.concept) + '</div></div>' +
    (practice ? '<button class="btn" type="button" id="btnLeave">' + (S.over ? "Back to final" : "Back to game") + '</button>' : game ? '<span class="eyebrow">' + ddText(S.down, S.toGo, S.yl) + ' · ' + ballText(S.yl) + '</span>' : '') + '</div>';
  h += talkHtml(c, talkOpen);
  h += '<p class="prompt">' + c.prompt + '</p>';
  h += GAME.examplesHtml(c);
  h += '<div class="editor"><div class="ed-bar"><span class="mono">' + GAME.fileName + '</span><span>' + GAME.editorHelp + '</span></div><textarea id="code" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Code editor">' + esc(code) + '</textarea></div>';
  h += '<div class="actions">' +
    '<button class="btn" type="button" id="btnEx">' + GAME.exampleLabel + '</button>' +
    '<button class="btn primary" type="button" id="btnSnap">' + (camp ? "Check drill" : practice ? "Run all tests" : S.snapped ? "Re-run all tests" : "Snap the ball") + '</button>' +
    '<button class="btn" type="button" id="btnTalk">' + (talkOpen ? "Hide chalk talk" : "Chalk talk") + '</button>' +
    '<button class="btn" type="button" id="btnHint"' + (S.hintShown || (!hintFree && S.timeouts === 0) ? " disabled" : "") + '>' + (S.hintShown ? "Hint shown" : hintFree ? "Hint" : "Timeout: hint (" + S.timeouts + " left)") + '</button>' +
    (!game || S.snapped ? '<button class="btn" type="button" id="btnFilm">Film room' + (camp ? ": see the answer" : "") + '</button>' : '') +
    '<button class="btn" type="button" id="btnReset">Reset code</button>' +
    '</div>';
  h += '<div class="hint" id="hintBox"' + (S.hintShown ? "" : " hidden") + '><b>Hint:</b> ' + c.hint + '</div>';
  h += '<div id="result"></div>';
  h += filmHtml(c);
  if (camp) h += '<div class="camp-nav"><button class="btn" type="button" id="btnPrev"' + (P.campIdx === 0 ? " disabled" : "") + '>← Previous drill</button><span class="side-note" style="margin:0;align-self:center">' + (P.solved[c.id] ? "Checked off. " : "") + 'Drills build on each other, so go in order the first time through.</span><button class="btn" type="button" id="btnNext"' + (P.campIdx >= CH.length - 1 ? " disabled" : "") + '>Next drill →</button></div>';
  $("stage").innerHTML = h;
  wireEditor();
}
function wireEditor() {
  const ta = $("code"), c = BYID[curId()];
  ta.addEventListener("input", () => { P.drafts[c.id] = ta.value; persist(); });
  ta.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); runExamples(); return; }
    if (e.key === "Escape") { ta.blur(); return; }
    if (e.key === "Tab" && !e.shiftKey) { e.preventDefault(); insertAt(ta, GAME.indent); }
    else if (e.key === "Enter" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const line = ta.value.slice(0, ta.selectionStart).split("\n").pop();
      let indent = line.match(/^\s*/)[0];
      if (GAME.indentAfter.test(line)) indent += GAME.indent;
      insertAt(ta, "\n" + indent);
    }
  });
}
function insertAt(ta, text) { ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, "end"); ta.dispatchEvent(new Event("input")); }

/* ---------- running + grading ---------- */
let busy = false;
async function runExamples() {
  if (busy) return; busy = true;
  const c = BYID[curId()];
  try {
    const res = await GAME.run($("code").value, c, true);
    $("result").innerHTML = '<div class="eyebrow" style="margin-top:14px">' + GAME.exampleHeading + '</div>' + GAME.resultHtml(c, res, true);
  } finally { busy = false; }
}
async function snap() {
  if (busy) return; busy = true;
  const kind = curKind(), c = BYID[curId()];
  P.drafts[c.id] = $("code").value; persist();
  try {
    const res = await GAME.run($("code").value, c, false);
    const passed = !!res.passed;
    if (passed && !P.solved[c.id]) { P.solved[c.id] = true; persist(); renderPlaybook(); renderBoard(); }
    if (kind === "camp") {
      const last = P.campIdx >= CH.length - 1;
      const b = passed ? '<div class="banner good"><span class="call">Drill complete</span><span class="sub">' + (last ? "That's the whole camp. Switch to Game Day and run it live." : "Checked off. Read the film room if anything felt shaky, then move on.") + '</span></div>' + (last ? "" : '<div class="actions"><button class="btn gold" type="button" id="btnNext2">Next drill →</button></div>')
                       : '<div class="banner bad"><span class="call">Not yet</span><span class="sub">Check the failing tests below. The chalk talk and hint are free in camp.</span></div>';
      $("result").innerHTML = b + GAME.resultHtml(c, res, false);
      const n = $("btnNext2"); if (n) n.onclick = () => campStep(1);
      return;
    }
    if (kind === "practice" || S.snapped) {
      const b = passed ? '<div class="banner good"><span class="call">All tests pass</span><span class="sub">' + (kind === "practice" ? "Checked off in your playbook." : "That's the rep. Back to the huddle when you're ready.") + '</span></div>'
                       : '<div class="banner bad"><span class="call">Not yet</span><span class="sub">Check the failing tests below.</span></div>';
      $("result").innerHTML = b + (kind !== "practice" ? nextBtn() : "") + GAME.resultHtml(c, res, false);
      wireNext(); return;
    }
    S.snapped = true; S.snaps++; if (passed) S.hits++;
    const out = resolvePlay(passed, c);
    renderBoard(); renderLog();
    renderChallenge();
    $("result").innerHTML = '<div class="banner ' + out.cls + '"><span class="call">' + esc(out.call) + '</span><span class="sub">' + esc(out.sub) + '</span></div>' + nextBtn() + GAME.resultHtml(c, res, false);
    if (!passed) { $("film").hidden = false; }
    wireNext();
  } finally { busy = false; }
}
function nextBtn() { return '<div class="actions"><button class="btn gold" type="button" id="btnNextPlay">' + (S.over ? "See final score" : S.pendingKick ? "Next possession" : "Back to the huddle") + '</button></div>'; }
function wireNext() { const b = $("btnNextPlay"); if (b) b.onclick = () => { S.phase = S.over ? "final" : S.pendingKick ? "kickoff" : "huddle"; S.pendingKick = false; render(); window.scrollTo({ top: 0, behavior: "smooth" }); }; }
function campStep(d) { P.campIdx = Math.max(0, Math.min(CH.length - 1, P.campIdx + d)); persist(); render(); window.scrollTo({ top: 0, behavior: "smooth" }); }

function endPossession() {
  S.drive++;
  Object.assign(S, { yl: 25, down: 1, toGo: 10, timeouts: 3 });
  if (S.drive > DRIVES_PER_GAME) { S.over = true; if (S.score > P.best) { P.best = S.score; persist(); } }
  else S.pendingKick = true;
}
function resolvePlay(passed, c) {
  const T = TIERS[S.tier];
  if (S.kind === "fg") {
    const dist = 100 - S.yl + 17;
    if (passed) { S.score += 3; S.fgs++; addLog("+3", "score", dist + "-yd field goal is GOOD. (" + c.title + ")"); endPossession(); return { cls: "score", call: "It's good! +3", sub: "Field goal from " + dist + " yards." }; }
    addLog("NO", "turnover", dist + "-yd field goal missed. (" + c.title + ")"); endPossession();
    return { cls: "bad", call: "Wide right", sub: "Missed field goal. Study the film, then rewrite it." };
  }
  let gain;
  if (passed) gain = rand(T.gain[0], T.gain[1]);
  else if (S.tier === "camp") gain = 0;
  else if (S.tier === "run") gain = rand(-2, 1);
  else if (S.tier === "deep" && Math.random() < 0.3) {
    addLog("INT", "turnover", T.label + " intercepted. (" + c.title + ")"); endPossession();
    return { cls: "bad", call: "Intercepted", sub: "Possession over. The film room is open below." };
  } else gain = 0;
  const newYl = S.yl + gain;
  const label = T.label + (passed ? "" : S.tier === "run" ? " stuffed" : S.tier === "camp" ? " busted" : " incomplete") + ". (" + c.title + ")";
  if (newYl >= 100) {
    S.score += 7; S.tds++;
    addLog("TD", "score", T.label + " for a " + (100 - S.yl) + "-yd touchdown! (" + c.title + ")");
    const d = 100 - S.yl; endPossession();
    return { cls: "score", call: "Touchdown! +7", sub: d + "-yard score. Extra point is good." };
  }
  if (newYl <= 0) { S.score -= 2; addLog("SAF", "turnover", "Tackled in the end zone for a safety. (" + c.title + ")"); endPossession(); return { cls: "bad", call: "Safety, -2", sub: "Tackled in your own end zone." }; }
  addLog((gain > 0 ? "+" : "") + gain, gain > 0 ? "gain" : gain < 0 ? "loss" : "info", label);
  S.yl = newYl;
  if (gain >= S.toGo) { S.down = 1; S.toGo = 10; return { cls: "good", call: "+" + gain + " · First down", sub: "Chains move. " + ddText(1, 10, S.yl) + " at " + ballText(S.yl) + "." }; }
  S.toGo -= gain; S.down++;
  if (S.down > 4) { addLog("TOD", "turnover", "Turnover on downs at " + ballText(S.yl) + "."); endPossession(); return { cls: "bad", call: "Turnover on downs", sub: (passed ? "Gained " + gain + ", " : "") + "came up short on 4th down." }; }
  const call = passed ? "+" + gain + " yards" : S.tier === "run" ? (gain < 0 ? "Stuffed, " + gain : "Stuffed, no gain") : S.tier === "camp" ? "Busted play, no gain" : "Incomplete";
  return { cls: passed ? "good" : "bad", call, sub: ddText(S.down, S.toGo, S.yl) + " coming up." + (passed ? "" : " Check the film room below.") };
}

/* ---------- final ---------- */
function renderFinal() {
  const pctC = S.snaps ? Math.round(S.hits / S.snaps * 100) : 0;
  $("stage").innerHTML = '<div class="final"><div class="eyebrow">Final · ' + DRIVES_PER_GAME + ' possessions</div><div class="big">' + S.score + '</div><h2>' + (S.score >= P.best && S.score > 0 ? "New personal best" : "Best: " + P.best + " pts") + '</h2>' +
    '<div class="stats"><div><b>' + S.tds + '</b><span>Touchdowns</span></div><div><b>' + S.fgs + '</b><span>Field goals</span></div><div><b>' + S.hits + '/' + S.snaps + '</b><span>Plays completed (' + pctC + '%)</span></div><div><b>' + S.trivRight + '/' + S.trivTotal + '</b><span>Trivia kickoffs</span></div></div>' +
    '<p class="coach-tip">Any play you missed is still in your playbook on the right. Practice it until it checks off, then run it back.</p>' +
    '<div class="actions"><button class="btn gold" type="button" id="btnAgain">Run it back</button></div></div>';
  $("btnAgain").onclick = newGame;
}

/* ---------- render + events ---------- */
function render() {
  renderBoard(); renderPlaybook();
  if (inCamp()) { renderChallenge(); return; }
  renderLog();
  if (S.phase === "kickoff") renderKickoff();
  else if (S.phase === "huddle") renderHuddle();
  else if (S.phase === "final") renderFinal();
  else renderChallenge();
}
function newGame() { S = freshGame(); render(); }
function setMode(m) { P.mode = m; persist(); render(); window.scrollTo({ top: 0, behavior: "smooth" }); }

document.addEventListener("click", e => {
  const t = e.target.closest("button"); if (!t) return;
  if (t.dataset.mode) return setMode(t.dataset.mode);
  if (t.dataset.call) return callPlay(t.dataset.call);
  if (t.dataset.open) return openFromList(t.dataset.open);
  if (t.dataset.ans !== undefined) return answerTrivia(t.dataset.ans);
  switch (t.id) {
    case "btnNew": newGame(); break;
    case "btnHuddle": breakHuddle(); break;
    case "btnFair": S.trivAnswered = "(fair catch)"; S.yl = 25; addLog("FC", "info", "Fair catch at the 25."); render(); break;
    case "btnEx": runExamples(); break;
    case "btnSnap": snap(); break;
    case "btnLeave": leavePractice(); break;
    case "btnPrev": campStep(-1); break;
    case "btnNext": campStep(1); break;
    case "btnFilm": $("film").hidden = !$("film").hidden; break;
    case "btnTalk": { const tk = $("talk"); tk.hidden = !tk.hidden; t.textContent = tk.hidden ? "Chalk talk" : "Hide chalk talk"; break; }
    case "btnReset": { const c = BYID[curId()]; $("code").value = GAME.starter(c); delete P.drafts[c.id]; persist(); break; }
    case "btnHint": {
      const game = curKind() === "play" || curKind() === "fg";
      if (game && !S.snapped) { if (S.timeouts <= 0) return; S.timeouts--; addLog("TO", "info", "Timeout called for a hint."); renderBoard(); renderLog(); }
      S.hintShown = true; $("hintBox").hidden = false; t.disabled = true; t.textContent = "Hint shown"; break;
    }
  }
});

function start(data) {
  S = (data && data.S) ? data.S : freshGame();
  buildField();
  render();
  if (GAME.ready) GAME.ready.then(() => { $("loading").hidden = true; }, err => { $("loading").textContent = "The " + GAME.langName + " engine didn't load. Reload the page to try again."; });
  else $("loading").hidden = true;
}
try { window.claude?.hot?.snapshot?.(() => ({ S })); } catch (e) {}
window.claude?.hot?.ready ? window.claude.hot.ready(start) : start(window.claude?.hot?.data ?? {});
