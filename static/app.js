const app = document.getElementById("app");
const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const vid = localStorage.vzv || (localStorage.vzv = crypto.randomUUID());
const api = (p, body) =>
  fetch("/api" + p, body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {})
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); });

let quiz = null, answers = [], quip = "";

async function home() {
  quiz = null; answers = [];
  const [list, prof] = await Promise.all([api("/quizzes"), api("/profile/" + vid)]);
  const done = new Set(prof.quizzes_taken);
  app.innerHTML = `
    <header class="hero">
      <h1>Let Vizzy get to know your taste</h1>
      <p>Pick a quiz. Answer on instinct. Each one teaches your personal curator a little more about you.</p>
    </header>
    ${prof.top_signals.length ? `<section class="known"><b>So far Vizzy has noticed</b><div class="tags">${prof.top_signals.map((s) => `<span>${esc(s)}</span>`).join("")}</div></section>` : ""}
    <div class="grid">${list.map((q, i) => `
      <button class="card c${i % 4}" data-id="${q.id}">
        <span class="emo">${q.emoji}</span><b>${esc(q.title)}</b><span>${esc(q.blurb)}</span>
        ${done.has(q.id) ? `<em>Taken. Take it again for a fresh result</em>` : ""}
      </button>`).join("")}</div>`;
  app.querySelectorAll(".card").forEach((b) => (b.onclick = () => start(list.find((q) => q.id === b.dataset.id))));
}

function start(q) { quiz = q; answers = []; quip = ""; ask(); }

async function ask() {
  app.innerHTML = `<div class="stage"><p class="think">${answers.length ? "Vizzy is reading your answer" : "Vizzy is thinking of a first question"}<i></i><i></i><i></i></p></div>`;
  try {
    const d = await api("/next", { quiz_id: quiz.id, visitor_id: vid, answers });
    d.done ? result(d) : question(d);
  } catch {
    app.innerHTML = `<div class="stage"><p>Vizzy lost the thread for a moment.</p><button class="btn" id="retry">Try again</button> <button class="link" id="back">Back to quizzes</button></div>`;
    document.getElementById("retry").onclick = ask;
    document.getElementById("back").onclick = home;
  }
}

function question(d) {
  const n = answers.length + 1;
  app.innerHTML = `
    <div class="stage">
      <button class="link" id="back">Leave quiz</button>
      <div class="meter" aria-hidden="true"><i style="width:${Math.min(n / 11, 0.95) * 100}%"></i></div>
      ${d.quip ? `<p class="quip">${esc(d.quip)}</p>` : ""}
      <h2>${esc(d.question.text)}</h2>
      <div class="opts">${d.question.options.map((o) => `<button class="opt">${esc(o)}</button>`).join("")}</div>
    </div>`;
  document.getElementById("back").onclick = home;
  app.querySelectorAll(".opt").forEach((b) => (b.onclick = () => { answers.push({ q: d.question.text, picked: b.textContent }); ask(); }));
}

function result({ result: r, profile }) {
  app.innerHTML = `
    <div class="stage result">
      <div class="mat"><div class="sheet">
        <h2>${esc(r.title)}</h2>
        <p class="tag">${esc(r.tagline)}</p>
        <p>${esc(r.body)}</p>
        <div class="tags">${(r.tags || []).map((t) => `<span>${esc(t)}</span>`).join("")}</div>
        <div class="sw">${(r.palette || []).map((c) => `<i style="background:${esc(c)}" title="${esc(c)}"></i>`).join("")}</div>
        <h3>Made for you</h3>
        <ul>${(r.picks || []).map((p) => `<li><b>${esc(p.name)}</b> ${esc(p.why)}</li>`).join("")}</ul>
      </div></div>
      <div class="actions"><button class="btn" id="share">Share my result</button><button class="link" id="more">Take another quiz</button></div>
      <section class="known"><b>Your curator now knows</b><div class="tags">${profile.top_signals.map((s) => `<span>${esc(s)}</span>`).join("")}</div>
        <p>${profile.quizzes_taken.length} of 14 quizzes taken. Every one sharpens what Deckoviz shows you.</p></section>
      <form id="lead"><label for="em">Want a daily curation built from your taste?</label>
        <div><input id="em" type="email" required placeholder="you@email.com"><button class="btn">Send me my curations</button></div></form>
    </div>`;
  document.getElementById("more").onclick = home;
  document.getElementById("share").onclick = async (e) => {
    const text = `${r.title}: ${r.tagline} Find yours with Vizzy at ${location.origin}`;
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else { await navigator.clipboard.writeText(text); e.target.textContent = "Copied"; }
  };
  document.getElementById("lead").onsubmit = async (e) => {
    e.preventDefault();
    await api("/lead", { visitor_id: vid, email: document.getElementById("em").value }).catch(() => {});
    e.target.innerHTML = "<label>Done. Your first curation is on its way.</label>";
  };
}

home().catch(() => (app.innerHTML = `<div class="stage"><p>Could not reach Vizzy. Check that the backend is running.</p></div>`));
