// ─── Wildstar Home Gym app: state, routing, views ────────────────────────────

const STORE_KEY = "wildstar-gym-v1";

function defaultEquipment() {
  const on = {};
  EQUIPMENT.forEach(e => (on[e.id] = true));
  return on;
}

function loadStore() {
  try {
    // Migrate data saved under the app's original name.
    const raw = localStorage.getItem(STORE_KEY) || localStorage.getItem("crowhurst-gym-v1");
    if (raw) {
      const s = JSON.parse(raw);
      s.equipment = { ...defaultEquipment(), ...(s.equipment || {}) };
      s.people = s.people || [];
      s.deletedIds = s.deletedIds || [];
      return s;
    }
  } catch (e) { /* fall through to fresh store */ }
  return { people: [], equipment: defaultEquipment(), deletedIds: [] };
}

let store = loadStore();
function save() {
  store.updatedAt = Date.now();
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
  scheduleSyncPush();
}

// ── Cross-device sync (Vercel /api/store + family passcode) ──────────────────

const SYNC_KEY_LS = "wildstar-sync-key";
function getSyncKey() { return localStorage.getItem(SYNC_KEY_LS) || ""; }

// Merge two stores: newer store wins overall, but check-off ticks from BOTH
// devices are kept, people missing from one side are added, deletions stick.
function mergeStores(a, b) {
  if (!a) return b;
  if (!b) return a;
  const winner = (a.updatedAt || 0) >= (b.updatedAt || 0) ? a : b;
  const loser = winner === a ? b : a;
  const deletedIds = [...new Set([...(a.deletedIds || []), ...(b.deletedIds || [])])];
  const people = (winner.people || []).filter(p => !deletedIds.includes(p.id)).map(p => ({ ...p, log: { ...(p.log || {}) } }));
  for (const lp of (loser.people || [])) {
    if (deletedIds.includes(lp.id)) continue;
    const wp = people.find(x => x.id === lp.id);
    if (!wp) { people.push({ ...lp }); continue; }
    for (const [iso, arr] of Object.entries(lp.log || {})) {
      const cur = wp.log[iso] || [];
      wp.log[iso] = Array.from({ length: Math.max(cur.length, arr.length) }, (_, i) => !!(cur[i] || arr[i]));
    }
    // Food entries union by id so meals logged on different devices all survive.
    wp.food = wp.food || {};
    for (const [iso, arr] of Object.entries(lp.food || {})) {
      const cur = wp.food[iso] || [];
      const ids = new Set(cur.map(e => e.id));
      wp.food[iso] = [...cur, ...arr.filter(e => !ids.has(e.id))];
    }
  }
  return { ...winner, people, deletedIds, equipment: { ...defaultEquipment(), ...(winner.equipment || {}) } };
}

async function syncPull() {
  const key = getSyncKey();
  if (!key) return false;
  try {
    const r = await fetch("api/store", { headers: { "X-Family-Key": key } });
    if (!r.ok) return false;
    const remote = await r.json();
    if (!remote) { scheduleSyncPush(); return true; }
    store = mergeStores(store, remote);
    // Persist without bumping updatedAt (this isn't a local edit).
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
    return true;
  } catch (e) { return false; }
}

let syncPushTimer = null;
function scheduleSyncPush() {
  if (!getSyncKey()) return;
  clearTimeout(syncPushTimer);
  syncPushTimer = setTimeout(async () => {
    try {
      await fetch("api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Family-Key": getSyncKey() },
        body: JSON.stringify(store),
      });
    } catch (e) { /* offline is fine — next save retries */ }
  }, 800);
}

// Re-pull whenever the app comes back into view (e.g. reopening on your phone).
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") syncPull().then(ok => { if (ok) route(); });
});

// Is a configured sync server reachable from here?
async function syncAvailable() {
  try {
    const r = await fetch("api/store");
    return r.status === 401 || r.ok;
  } catch (e) { return false; }
}

// Validate a passcode, store it, and merge the shared data in.
async function tryLogin(key) {
  try {
    const r = await fetch("api/store", { headers: { "X-Family-Key": key } });
    if (r.status === 401) return "wrong";
    if (!r.ok) return "unavailable";
    localStorage.setItem(SYNC_KEY_LS, key);
    const remote = await r.json();
    if (remote) {
      store = mergeStores(store, remote);
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
    }
    scheduleSyncPush(); // first device seeds the shared store
    return "ok";
  } catch (e) { return "unavailable"; }
}

function showLogin(prefillError) {
  const old = document.getElementById("login-modal");
  if (old) old.remove();
  const wrap = document.createElement("div");
  wrap.id = "login-modal";
  wrap.className = "modal-overlay";
  wrap.innerHTML = `
    <div class="modal login-modal" role="dialog" aria-modal="true" aria-label="Log in">
      <p class="eyebrow">Wildstar home gym</p>
      <h3>Log in</h3>
      <p class="login-sub">Enter the family passcode to load everyone's plans and keep this device in sync.</p>
      <input id="login-key" type="password" placeholder="Family passcode" autocomplete="current-password">
      <p class="form-error" id="login-error" ${prefillError ? "" : "hidden"}>${esc(prefillError || "")}</p>
      <div class="form-actions">
        <button class="btn ghost" id="login-skip">Not now</button>
        <button class="btn primary" id="login-go">Log in</button>
      </div>
    </div>`;
  document.body.appendChild(wrap);
  const input = wrap.querySelector("#login-key");
  input.focus();

  const submit = async () => {
    const key = input.value.trim();
    if (!key) return;
    const go = wrap.querySelector("#login-go");
    go.textContent = "Checking…";
    const res = await tryLogin(key);
    if (res === "ok") { wrap.remove(); route(); return; }
    localStorage.removeItem(SYNC_KEY_LS);
    go.textContent = "Log in";
    const err = wrap.querySelector("#login-error");
    err.hidden = false;
    err.textContent = res === "wrong"
      ? "That's not the passcode — try again."
      : "Can't reach the sync server right now — try again later.";
  };
  wrap.querySelector("#login-go").addEventListener("click", submit);
  input.addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
  wrap.querySelector("#login-skip").addEventListener("click", () => {
    sessionStorage.setItem("wildstar-login-skip", "1");
    wrap.remove();
  });
}

// Keep multiple open tabs in sync: when another tab saves, reload and re-render
// (unless mid-onboarding here, where a re-render would eat unsaved typing).
window.addEventListener("storage", ev => {
  if (ev.key !== STORE_KEY) return;
  store = loadStore();
  if (!/^#\/(add|edit)/.test(location.hash)) route();
});

// Attach coached programs to their people (by name, once).
(function attachPrograms() {
  const a = store.people.find(x => (x.name || "").trim().toLowerCase() === "amelia");
  if (a && !a.program) { a.program = "amelia30"; save(); }
})();

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function personById(id) { return store.people.find(p => p.id === id); }

// Height/weight are stored metric (the nutrition math needs them);
// shown as feet + inches and pounds.
function ftIn(cm) {
  if (!cm) return { ft: "", in: "" };
  const total = Math.round(Number(cm) / 2.54);
  return { ft: Math.floor(total / 12), in: total % 12 };
}
function kgToLb(kg) { return kg ? Math.round(Number(kg) * 2.20462) : ""; }

// ── Calendar scheduling ──────────────────────────────────────────────────────
// Which days of each 7-day cycle are training days, per days-per-week.
const WEEK_OFFSETS = { 2: [0, 3], 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 4, 5], 6: [0, 1, 2, 3, 4, 5] };

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return d; }
function isoOf(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function fmtDate(date) {
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

// Maps the plan onto real dates for the current week.
function schedule(p) {
  const nDays = p.plan.days.length;
  const offsets = WEEK_OFFSETS[nDays] || WEEK_OFFSETS[3];
  const start = new Date((p.startDate || todayISO()) + "T00:00:00");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today - start) / 86400000);

  const weekIndex = diff < 0 ? 0 : Math.floor(diff / 7);
  const anchor = addDays(start, weekIndex * 7);
  const dates = offsets.map(o => addDays(anchor, o));

  let todayIdx = -1;
  if (diff >= 0 && offsets.includes(diff % 7)) todayIdx = offsets.indexOf(diff % 7);

  let next = dates.find(d => d > today);
  if (!next) next = addDays(anchor, 7 + offsets[0]);
  const nextIdx = dates.indexOf(next) >= 0 ? dates.indexOf(next) : 0;

  return { dates, todayIdx, futureStart: diff < 0, start, next, nextIdx, weekIndex };
}

function dayLog(p, iso, nBlocks) {
  p.log = p.log || {};
  if (!Array.isArray(p.log[iso]) || p.log[iso].length !== nBlocks) {
    p.log[iso] = Array.from({ length: nBlocks }, (_, i) => (p.log[iso] || [])[i] || false);
  }
  return p.log[iso];
}

function regeneratePerson(p) {
  p.plan = buildPlan(p, store.equipment);
  p.diet = buildDiet(p);
}

function regenerateAll() { store.people.forEach(regeneratePerson); save(); }

// ── Router ───────────────────────────────────────────────────────────────────

const app = document.getElementById("app");

function route() {
  const hash = location.hash || "#/";
  const parts = hash.slice(2).split("/").filter(Boolean);
  window.scrollTo(0, 0);

  if (parts[0] === "add") return renderOnboard(null);
  if (parts[0] === "edit" && personById(parts[1])) return renderOnboard(personById(parts[1]));
  if (parts[0] === "gym") return renderEquipmentPage();
  if (parts[0] === "p" && personById(parts[1])) return renderDashboard(personById(parts[1]), parts[2] || "training");
  return renderLocker();
}
window.addEventListener("hashchange", route);

// ── Locker (home) ────────────────────────────────────────────────────────────

function renderLocker() {
  document.body.dataset.theme = "dark";
  const plates = store.people.map(p => `
    <a class="nameplate" href="#/p/${p.id}">
      <span class="nameplate-screw" aria-hidden="true"></span>
      <span class="nameplate-name">${esc(p.name)}</span>
      <span class="nameplate-screw right" aria-hidden="true"></span>
    </a>`).join("");

  app.innerHTML = `
    <div class="locker">
      <header class="locker-head">
        <img class="locker-logo" src="assets/logo.svg" alt="Wildstar logo">
        <p class="eyebrow">Wildstar home gym</p>
        <h1 class="locker-title">Who's<br>training?</h1>
      </header>
      <div class="nameplates">
        ${plates}
        <a class="nameplate nameplate-add" href="#/add">
          <span class="nameplate-name">+ Add someone</span>
          <span class="nameplate-goal">Set up a profile and get a plan</span>
        </a>
      </div>
      <footer class="locker-foot">
        <a class="equip-btn" href="#/gym">Gym equipment <span class="equip-count">${EQUIPMENT.filter(e => store.equipment[e.id]).length}</span></a>
        ${getSyncKey()
          ? `<button class="quiet-link as-btn" id="sync-out">Sign out</button>`
          : `<button class="quiet-link as-btn" id="sync-in">Log in</button>`}
      </footer>
    </div>`;

  const signOut = document.getElementById("sync-out");
  if (signOut) signOut.addEventListener("click", () => {
    if (confirm("Sign out of sync on this device? Your data stays here, it just stops sharing.")) {
      localStorage.removeItem(SYNC_KEY_LS);
      renderLocker();
    }
  });
  const signIn = document.getElementById("sync-in");
  if (signIn) signIn.addEventListener("click", () => {
    sessionStorage.removeItem("wildstar-login-skip");
    showLogin();
  });
}

// ── Onboarding wizard ────────────────────────────────────────────────────────

let wizard = null;

function renderOnboard(existing) {
  document.body.dataset.theme = "light";
  if (!wizard || wizard.forId !== (existing ? existing.id : "new")) {
    wizard = {
      forId: existing ? existing.id : "new",
      step: 1,
      data: existing ? { ...existing } : { sex: "m", level: 1, goal: "fitness", goalText: "" },
    };
  }
  const d = wizard.data;
  const stepTitles = ["About you", "Your goals"];

  const stepDots = [1, 2].map(n =>
    `<span class="dot ${n === wizard.step ? "on" : n < wizard.step ? "done" : ""}">${n}</span>`).join('<span class="dot-line"></span>');

  let body = "";
  if (wizard.step === 1) {
    body = `
      <label class="field">Name
        <input id="f-name" type="text" value="${esc(d.name || "")}" placeholder="e.g. Greyson" autocomplete="off">
      </label>
      <div class="field-row">
        <label class="field">Age
          <input id="f-age" type="number" min="10" max="100" value="${esc(d.age || "")}" placeholder="34">
        </label>
        <label class="field">Sex
          <select id="f-sex">
            <option value="m" ${d.sex === "m" ? "selected" : ""}>Male</option>
            <option value="f" ${d.sex === "f" ? "selected" : ""}>Female</option>
            <option value="x" ${d.sex === "x" ? "selected" : ""}>Prefer not to say</option>
          </select>
        </label>
      </div>
      <div class="field-row three">
        <label class="field">Height (ft)
          <input id="f-hft" type="number" min="4" max="7" value="${esc(d.heightFt ?? ftIn(d.height).ft ?? "")}" placeholder="5">
        </label>
        <label class="field">Height (in)
          <input id="f-hin" type="number" min="0" max="11" value="${esc(d.heightIn ?? ftIn(d.height).in ?? "")}" placeholder="10">
        </label>
        <label class="field">Weight (lb)
          <input id="f-weight" type="number" min="66" max="550" value="${esc(d.weightLb ?? kgToLb(d.weight))}" placeholder="170">
        </label>
      </div>
      <p class="field-label">How experienced are you with training?</p>
      <div class="choice-row" id="f-level">
        ${[[1, "New to it", "Little or no gym history"], [2, "Some experience", "Trained on and off, knows the basics"], [3, "Experienced", "Comfortable with barbells and hard sessions"]]
          .map(([v, t, s]) => `
          <button class="choice ${d.level == v ? "on" : ""}" data-v="${v}">
            <strong>${t}</strong><span>${s}</span>
          </button>`).join("")}
      </div>`;
  } else {
    body = `
      <label class="field">What do you want out of training? In your own words. <span class="hint">The whole plan is built from what you write here — mention anything that matters (losing weight, growing glutes, boxing, running, pull-ups…).</span>
        <textarea id="f-goaltext" rows="5" placeholder="e.g. I want to drop 15 lb, feel fitter, and finally do a proper pull-up.">${esc(d.goalText || "")}</textarea>
      </label>
      <p class="field-label prompt-label">Stuck? Tap to borrow a phrase — totally optional.</p>
      <div class="prompt-chips" id="f-prompts">
        ${["lose some weight", "build muscle", "get stronger on the big lifts", "grow my glutes", "improve my cardio", "train like an athlete", "just feel healthier day to day"]
          .map(t => `<button class="prompt-chip" data-t="${t}">${t}</button>`).join("")}
      </div>
      <label class="field" style="margin-top:18px">Start date <span class="hint">Day 1 lands here — the app works out how many days a week your goal needs and prompts you with each day's session.</span>
        <input id="f-startdate" type="date" value="${esc(d.startDate || todayISO())}">
      </label>`;
  }

  app.innerHTML = `
    <div class="page narrow">
      <nav class="topnav">
        <a class="quiet-link" href="#/">&larr; Locker room</a>
      </nav>
      <header class="page-head">
        <p class="eyebrow">${existing ? "Edit profile" : "New profile"} · Step ${wizard.step} of 2</p>
        <h1>${stepTitles[wizard.step - 1]}</h1>
        <div class="dots">${stepDots}</div>
      </header>
      <div class="card form-card">
        ${body}
        <p class="form-error" id="form-error" hidden></p>
        <div class="form-actions">
          ${wizard.step > 1 ? `<button class="btn ghost" id="btn-back">Back</button>` : `<span></span>`}
          <button class="btn primary" id="btn-next">${wizard.step < 2 ? "Continue" : existing ? "Save & rebuild plan" : "Build my plan"}</button>
        </div>
      </div>
    </div>`;

  wireOnboard(existing);
}

function wireOnboard(existing) {
  const d = wizard.data;

  const levelRow = document.getElementById("f-level");
  if (levelRow) levelRow.addEventListener("click", ev => {
    const btn = ev.target.closest(".choice");
    if (!btn) return;
    d.level = btn.dataset.v;
    levelRow.querySelectorAll(".choice").forEach(c => c.classList.toggle("on", c === btn));
  });

  const prompts = document.getElementById("f-prompts");
  if (prompts) prompts.addEventListener("click", ev => {
    const chip = ev.target.closest(".prompt-chip");
    if (!chip) return;
    const box = document.getElementById("f-goaltext");
    const cur = box.value.trim();
    box.value = cur ? cur.replace(/[.\s]+$/, "") + ", " + chip.dataset.t : "I want to " + chip.dataset.t;
    box.focus();
  });

  const back = document.getElementById("btn-back");
  if (back) back.addEventListener("click", () => { captureStep(); wizard.step--; renderOnboard(existing); });

  document.getElementById("btn-next").addEventListener("click", () => {
    const err = captureStep();
    const errEl = document.getElementById("form-error");
    if (err) { errEl.textContent = err; errEl.hidden = false; return; }
    if (wizard.step < 2) { wizard.step++; renderOnboard(existing); return; }

    // Finish: save person + generate plan.
    let p;
    if (existing) {
      p = existing;
      Object.assign(p, d);
      p.planVersion = (p.planVersion || 0);
    } else {
      p = { ...d, id: "p" + Date.now().toString(36), planVersion: 0, created: new Date().toISOString() };
      store.people.push(p);
    }
    regeneratePerson(p);
    save();
    wizard = null;
    location.hash = "#/p/" + p.id;
  });
}

function captureStep() {
  const d = wizard.data;
  if (wizard.step === 1) {
    d.name = document.getElementById("f-name").value.trim();
    d.age = document.getElementById("f-age").value;
    d.sex = document.getElementById("f-sex").value;
    d.heightFt = document.getElementById("f-hft").value;
    d.heightIn = document.getElementById("f-hin").value;
    d.height = Math.round((Number(d.heightFt) * 12 + Number(d.heightIn || 0)) * 2.54);
    d.weightLb = document.getElementById("f-weight").value;
    d.weight = Math.round(Number(d.weightLb) / 2.20462 * 10) / 10;
    if (!d.name) return "Add a name so we know whose plan this is.";
    if (!(d.age > 9 && d.age < 101)) return "Age needs to be between 10 and 100.";
    if (!(d.heightFt >= 4 && d.heightFt <= 7) || d.heightIn < 0 || d.heightIn > 11)
      return "Height needs feet (4–7) and inches (0–11).";
    if (!(d.weightLb >= 66 && d.weightLb <= 550)) return "Weight needs to be in pounds (66–550).";
  }
  if (wizard.step === 2) {
    const t = document.getElementById("f-goaltext");
    if (t) d.goalText = t.value.trim();
    if (!d.goalText) return "Write a sentence about what you're after — the plan is built from it.";
    const sd = document.getElementById("f-startdate");
    d.startDate = (sd && sd.value) || todayISO();
    d.goal = inferGoal(d.goalText);
    // The app prescribes the training week from the goal (their words can override).
    const rx = prescribe(d.goal, d.level, d.goalText);
    d.days = rx.days;
    d.session = rx.session;
  }
  return null;
}

// ── Dashboard ────────────────────────────────────────────────────────────────

function renderDashboard(p, tab) {
  document.body.dataset.theme = "light";
  if (!p.startDate) { p.startDate = todayISO(); save(); }
  const g = GOALS[p.goal] || GOALS.fitness;

  const tabs = [["training", "Training week"], ["nutrition", "Nutrition"]]
    .map(([k, t]) => `<a class="tab ${tab === k ? "on" : ""}" href="#/p/${p.id}/${k}">${t}</a>`).join("");

  app.innerHTML = `
    <div class="page">
      <nav class="topnav">
        <a class="quiet-link" href="#/">&larr; Locker room</a>
        <span class="topnav-spacer"></span>
        <a class="quiet-link" href="#/edit/${p.id}">Edit profile</a>
        <button class="quiet-link as-btn" id="btn-delete">Remove</button>
      </nav>
      <header class="page-head person-head">
        <h1>${esc(p.name)}</h1>
        <p class="person-meta">
          <span class="goal-chip">Focus · ${esc(g.label)}</span>
          ${p.days} days/week · ~${p.session} min sessions — set by your goal
        </p>
        ${p.goalText ? `<blockquote class="own-words">&ldquo;${esc(p.goalText)}&rdquo;</blockquote>` : ""}
      </header>
      <div class="tabs">${tabs}</div>
      <div id="tab-body">${tab === "nutrition" ? nutritionTab(p) : trainingTab(p)}</div>
    </div>`;

  document.getElementById("btn-delete").addEventListener("click", () => {
    if (confirm(`Remove ${p.name}'s profile and plan? This can't be undone.`)) {
      store.people = store.people.filter(x => x.id !== p.id);
      store.deletedIds.push(p.id);
      save();
      location.hash = "#/";
    }
  });

  const reshuffle = document.getElementById("btn-reshuffle");
  if (reshuffle) reshuffle.addEventListener("click", () => {
    p.planVersion = (p.planVersion || 0) + 1;
    regeneratePerson(p);
    save();
    renderDashboard(p, "training");
  });

  document.getElementById("tab-body").addEventListener("click", ev => {
    const link = ev.target.closest(".ex-link");
    if (link) { openHowto(link.dataset.ex); return; }
    if (ev.target.closest("#food-add")) { addFoodEntry(p); return; }
    const del = ev.target.closest(".food-del");
    if (del) {
      const iso = todayISO();
      p.food[iso] = foodEntries(p, iso).filter(e => e.id !== del.dataset.id);
      save();
      renderDashboard(p, "nutrition");
    }
  });

  document.getElementById("tab-body").addEventListener("keydown", ev => {
    if (ev.key === "Enter" && (ev.target.id === "food-text" || ev.target.id === "food-kcal")) {
      ev.preventDefault();
      addFoodEntry(p);
    }
  });

  document.getElementById("tab-body").addEventListener("change", ev => {
    const cb = ev.target.closest(".ex-done");
    if (!cb) return;
    const iso = cb.dataset.iso;
    const dayIdx = Number(cb.dataset.day), blockIdx = Number(cb.dataset.i), n = Number(cb.dataset.n);
    const log = dayLog(p, iso, n);
    log[blockIdx] = cb.checked;
    save();

    // Update every copy of this item in place (day card + carried-over row).
    document.querySelectorAll(`[data-row="${dayIdx}-${blockIdx}"]`).forEach(row =>
      row.classList.toggle("ex-checked", cb.checked));
    document.querySelectorAll(`.ex-done[data-day="${dayIdx}"][data-i="${blockIdx}"]`).forEach(other => {
      other.checked = cb.checked;
    });
    const done = log.filter(Boolean).length;
    const complete = done === n;
    const counter = document.querySelector(`[data-count="${dayIdx}"]`);
    if (counter && !counter.closest(".day-missed")) counter.textContent = complete ? "✓ done" : `${done}/${n} done`;
    else if (counter) counter.textContent = complete ? "✓ done" : `${n - done} left over`;
    const card = document.querySelector(`.day-card[data-day="${dayIdx}"]`);
    if (card) card.classList.toggle("day-complete", complete);
  });
}

// ── Exercise how-to modal ────────────────────────────────────────────────────

function openHowto(name) {
  const ex = EXERCISES.find(e => e.name === name);
  const steps = HOWTO[name];
  const equipNames = ex && ex.equip.length
    ? ex.equip.map(id => EQUIPMENT.find(q => q.id === id)?.name).filter(Boolean).join(" · ")
    : "No equipment — just you";

  const old = document.getElementById("howto-modal");
  if (old) old.remove();

  const photos = ex && ex.equip.length
    ? `<div class="modal-photos">${ex.equip.map(id =>
        `<img class="modal-photo" src="assets/img/${id}.jpg" alt="${esc(EQUIPMENT.find(q => q.id === id)?.name || "")}" loading="lazy" onerror="this.remove()">`).join("")}</div>`
    : "";

  const wrap = document.createElement("div");
  wrap.id = "howto-modal";
  wrap.className = "modal-overlay";
  wrap.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="How to: ${esc(name)}">
      <button class="modal-close" aria-label="Close">&times;</button>
      <p class="eyebrow">How to</p>
      <h3>${esc(name)}</h3>
      <p class="modal-equip">${esc(equipNames)}</p>
      ${photos}
      ${steps
        ? `<ol class="howto-steps">${steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol>`
        : `<p>${esc(ex?.cue || "Move with control, full range of motion, and stop the set while your form is still good.")}</p>`}
    </div>`;

  wrap.addEventListener("click", ev => {
    if (ev.target === wrap || ev.target.closest(".modal-close")) wrap.remove();
  });
  document.addEventListener("keydown", function onEsc(ev) {
    if (ev.key === "Escape") { wrap.remove(); document.removeEventListener("keydown", onEsc); }
  });
  document.body.appendChild(wrap);
  wrap.querySelector(".modal-close").focus();
}

function plateStripe(blocks) {
  const counts = { strength: 0, cardio: 0, core: 0, condition: 0 };
  blocks.forEach(b => counts[b.modality]++);
  const total = blocks.length || 1;
  return Object.entries(counts).filter(([, n]) => n > 0).map(([m, n]) =>
    `<span class="stripe-seg" style="flex:${n / total};background:${MODALITY_COLORS[m]}"></span>`).join("");
}

function trainingTab(p) {
  const prog = p.program && typeof PROGRAMS !== "undefined" && PROGRAMS[p.program];
  if (prog) return programTab(p, prog);
  if (!p.plan) regeneratePerson(p);
  const plan = p.plan;
  const sched = schedule(p);

  // Today banner: what's on, or when the next session is.
  let banner;
  if (sched.futureStart) {
    banner = `<div class="card today-card"><p class="today-eyebrow">Plan starts</p>
      <p class="today-line">${fmtDate(sched.start)} — Day 1 · ${esc(plan.days[0].title)}</p></div>`;
  } else if (sched.todayIdx >= 0) {
    const day = plan.days[sched.todayIdx];
    const iso = isoOf(sched.dates[sched.todayIdx]);
    const log = dayLog(p, iso, day.blocks.length);
    const done = log.filter(Boolean).length;
    banner = `<div class="card today-card is-training">
      <p class="today-eyebrow">Today · ${fmtDate(sched.dates[sched.todayIdx])}</p>
      <p class="today-line">${esc(day.title)} — ${done === day.blocks.length ? "all done, nice work" : `${done}/${day.blocks.length} exercises done`}</p>
    </div>`;
  } else {
    banner = `<div class="card today-card"><p class="today-eyebrow">Today · rest day</p>
      <p class="today-line">Next up: ${esc(plan.days[sched.nextIdx].title)} on ${fmtDate(sched.next)}</p></div>`;
  }

  // Unfinished exercises from earlier this week roll onto the current day.
  const today0 = new Date(); today0.setHours(0, 0, 0, 0);
  const carry = [];
  if (!sched.futureStart) plan.days.forEach((day, i) => {
    if (sched.dates[i] >= today0) return;
    const iso = isoOf(sched.dates[i]);
    const log = dayLog(p, iso, day.blocks.length);
    day.blocks.forEach((b, bi) => {
      if (!log[bi]) carry.push({ dayIdx: i, iso, bi, n: day.blocks.length, b, date: sched.dates[i] });
    });
  });
  const carryTarget = sched.todayIdx >= 0 ? sched.todayIdx : sched.nextIdx;
  const carrySection = carry.length ? `
    <div class="carryover">
      <p class="carryover-head">Carried over — not finished on the day</p>
      <table class="ex-table">
        ${carry.map(c => `
          <tr class="ex-missed" data-row="${c.dayIdx}-${c.bi}">
            <td class="ex-check-cell">
              <input type="checkbox" class="ex-done" aria-label="Mark ${esc(c.b.name)} done" data-iso="${c.iso}" data-day="${c.dayIdx}" data-i="${c.bi}" data-n="${c.n}">
            </td>
            <td class="ex-name">
              <span class="modality-dot" style="background:${MODALITY_COLORS[c.b.modality]}"></span>
              <button class="ex-link" data-ex="${esc(c.b.ref || c.b.name)}">${esc(c.b.name)}</button>
              <span class="carry-tag">${fmtDate(c.date)}</span>
            </td>
          </tr>`).join("")}
      </table>
    </div>` : "";

  const dayCards = plan.days.map((day, i) => {
    const date = sched.dates[i];
    const iso = isoOf(date);
    const log = dayLog(p, iso, day.blocks.length);
    const done = log.filter(Boolean).length;
    const complete = done === day.blocks.length && day.blocks.length > 0;
    const isToday = i === sched.todayIdx;
    const isPast = !sched.futureStart && date < today0;

    return `
    <details class="day-card ${complete ? "day-complete" : ""} ${isToday ? "day-today" : ""} ${isPast && !complete ? "day-missed" : ""}" data-day="${i}" ${isToday || (sched.todayIdx < 0 && i === sched.nextIdx && !sched.futureStart) || (sched.futureStart && i === 0) ? "open" : ""}>
      <summary>
        <span class="stripe" aria-hidden="true">${plateStripe(day.blocks)}</span>
        <span class="day-label">${fmtDate(date)}${isToday ? " · today" : ""}</span>
        <span class="day-title">${esc(day.title)}</span>
        <span class="day-count" data-count="${i}">${complete ? "✓ done" : isPast ? `${day.blocks.length - done} left over` : `${done}/${day.blocks.length} done`}</span>
      </summary>
      <div class="day-body">
        ${i === carryTarget ? carrySection : ""}
        <p class="warmup">Warm-up: ${esc(plan.warmup)}</p>
        <table class="ex-table">
          ${day.blocks.map((b, bi) => `
            <tr class="${b.main ? "main-lift" : ""} ${log[bi] ? "ex-checked" : ""} ${isPast && !log[bi] ? "ex-missed" : ""}" data-row="${i}-${bi}">
              <td class="ex-check-cell">
                <input type="checkbox" class="ex-done" aria-label="Mark ${esc(b.name)} done" data-iso="${iso}" data-day="${i}" data-i="${bi}" data-n="${day.blocks.length}" ${log[bi] ? "checked" : ""}>
              </td>
              <td class="ex-name">
                <span class="modality-dot" style="background:${MODALITY_COLORS[b.modality]}" title="${b.modality}"></span>
                <button class="ex-link" data-ex="${esc(b.ref || b.name)}">${esc(b.name)}</button>${b.main ? ' <span class="main-tag">main lift</span>' : ""}
              </td>
              <td class="ex-scheme">${esc(b.scheme)}</td>
            </tr>
            ${b.cue ? `<tr class="cue-row"><td></td><td colspan="2">${esc(b.cue)}</td></tr>` : ""}`).join("")}
        </table>
      </div>
    </details>`;
  }).join("");

  return `
    ${banner}
    <div class="legend">
      ${Object.entries(MODALITY_COLORS).map(([m, c]) =>
        `<span class="legend-item"><span class="modality-dot" style="background:${c}"></span>${{ strength: "Strength", cardio: "Cardio", core: "Core", condition: "Conditioning" }[m]}</span>`).join("")}
      <span class="legend-spacer"></span>
      <button class="btn ghost small" id="btn-reshuffle">Reshuffle exercises</button>
    </div>
    ${dayCards}
    <div class="card notes-card">
      <h3>Coach's notes</h3>
      <ul>${plan.notes.map(n => `<li>${esc(n)}</li>`).join("")}<li>Rest between sets: ${esc(plan.rest)}.</li></ul>
    </div>`;
}

// ── Daily food log ───────────────────────────────────────────────────────────

// Estimate calories from free text using the FOOD_KCAL table.
// "2 eggs and toast" → 2×75 + 80. Returns null if nothing matches.
function estimateKcal(text) {
  let t = " " + text.toLowerCase() + " ";
  let total = 0, matched = false;
  const keys = Object.keys(FOOD_KCAL).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    const rx = new RegExp(`(\\d+)?\\s*\\b${key.replace(/ /g, "\\s+")}s?\\b`);
    const m = t.match(rx);
    if (!m) continue;
    matched = true;
    const count = Math.min(10, Number(m[1]) || 1);
    total += count * FOOD_KCAL[key];
    t = t.replace(rx, " ");
  }
  return matched ? total : null;
}

// Today's calorie target: the program day's target if on a program, else the diet plan.
function kcalTargetFor(p) {
  const prog = p.program && typeof PROGRAMS !== "undefined" && PROGRAMS[p.program];
  if (prog) {
    const start = new Date((p.startDate || todayISO()) + "T00:00:00");
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const diff = Math.floor((today - start) / 86400000);
    if (diff >= 0 && diff < prog.days.length) return prog.days[diff].cal;
    return 1700;
  }
  return (p.diet && p.diet.calories) || 2000;
}

function foodEntries(p, iso) {
  p.food = p.food || {};
  p.food[iso] = p.food[iso] || [];
  return p.food[iso];
}

function foodCard(p) {
  const iso = todayISO();
  const entries = foodEntries(p, iso);
  const target = kcalTargetFor(p);

  const known = entries.filter(e => e.kcal != null);
  const unknown = entries.filter(e => e.kcal == null);
  const total = known.reduce((s, e) => s + e.kcal, 0);
  const anyEst = known.some(e => e.est);
  const pct = Math.min(100, Math.round((total / target) * 100));
  const over = total > target;

  const rows = entries.map(e => `
    <tr class="food-row">
      <td class="food-name">${esc(e.t)}</td>
      <td class="food-kcal">${e.kcal == null ? "—" : `${e.est ? "~" : ""}${e.kcal.toLocaleString()}`}</td>
      <td class="food-del-cell"><button class="food-del" data-id="${e.id}" aria-label="Remove ${esc(e.t)}">&times;</button></td>
    </tr>`).join("");

  const weekRows = [];
  for (let i = 1; i <= 3; i++) {
    const d = addDays(new Date(), -i);
    const dayEntries = (p.food[isoOf(d)] || []).filter(e => e.kcal != null);
    if (dayEntries.length) weekRows.push(`${fmtDate(d)}: ${dayEntries.reduce((s, e) => s + e.kcal, 0).toLocaleString()} kcal`);
  }

  return `
    <div class="card food-card">
      <h3>Today's food</h3>
      <div class="food-input-row">
        <input id="food-text" type="text" placeholder="What did you eat? e.g. 2 eggs and toast" autocomplete="off">
        <input id="food-kcal" type="number" min="0" max="5000" placeholder="kcal (optional)">
        <button class="btn primary small" id="food-add">Add</button>
      </div>
      ${entries.length ? `<table class="ex-table food-table">${rows}</table>` : `<p class="food-empty">Nothing logged yet today. Type what you ate — if you skip the calories, the app makes a rough guess (shown with a ~).</p>`}
      <div class="food-total-bar" role="img" aria-label="${total} of ${target} kcal">
        <span style="width:${pct}%;background:${over ? "var(--plate-red)" : "var(--plate-green)"}"></span>
      </div>
      <p class="food-total">
        <strong>${anyEst ? "≈ " : ""}${total.toLocaleString()}</strong> / ${target.toLocaleString()} kcal
        ${unknown.length ? ` · ${unknown.length} item${unknown.length > 1 ? "s" : ""} not counted` : ""}
        ${over ? " · over target" : ""}
      </p>
      ${weekRows.length ? `<p class="food-week">${weekRows.join(" · ")}</p>` : ""}
    </div>`;
}

// ── Coached program view (fixed day-by-day calendar) ─────────────────────────

const KIND_COLORS = {
  lift: MODALITY_COLORS.strength,
  cardio: MODALITY_COLORS.cardio,
  core: MODALITY_COLORS.core,
  food: MODALITY_COLORS.condition,
  habit: MODALITY_COLORS.condition,
};

function progStripe(items) {
  const counts = {};
  items.forEach(it => { counts[it.k] = (counts[it.k] || 0) + 1; });
  const total = items.length || 1;
  return Object.entries(counts).map(([k, n]) =>
    `<span class="stripe-seg" style="flex:${n / total};background:${KIND_COLORS[k]}"></span>`).join("");
}

function programTab(p, prog) {
  const start = new Date((p.startDate || todayISO()) + "T00:00:00");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today - start) / 86400000);
  const dayNum = diff + 1;

  let banner;
  if (diff < 0) {
    banner = `<div class="card today-card"><p class="today-eyebrow">Program starts</p>
      <p class="today-line">${fmtDate(start)} — Day 1 · ${esc(prog.days[0].title)}</p></div>`;
  } else if (dayNum > prog.days.length) {
    banner = `<div class="card today-card"><p class="today-eyebrow">Program finished</p>
      <p class="today-line">All ${prog.days.length} days done — time to reassess</p></div>`;
  } else {
    const day = prog.days[diff];
    const iso = isoOf(addDays(start, diff));
    const log = dayLog(p, iso, day.items.length);
    const done = log.filter(Boolean).length;
    banner = `<div class="card today-card is-training">
      <p class="today-eyebrow">Today · Day ${dayNum} of ${prog.days.length} · ${fmtDate(today)}</p>
      <p class="today-line">${esc(day.title)} — ${done === day.items.length ? "all done, nice work" : `${done}/${day.items.length} ticked off`}</p>
    </div>`;
  }

  // Unfinished items from the past 7 days roll forward onto today's card.
  const carry = [];
  prog.days.forEach((day, i) => {
    const date = addDays(start, i);
    if (date >= today || (today - date) > 7 * 86400000) return;
    const iso = isoOf(date);
    const log = dayLog(p, iso, day.items.length);
    day.items.forEach((it, bi) => {
      if (!log[bi]) carry.push({ dayIdx: i, iso, bi, n: day.items.length, it, date });
    });
  });

  const carrySection = carry.length ? `
    <div class="carryover">
      <p class="carryover-head">Carried over — not finished on the day</p>
      <table class="ex-table">
        ${carry.map(c => `
          <tr class="ex-missed" data-row="${c.dayIdx}-${c.bi}">
            <td class="ex-check-cell">
              <input type="checkbox" class="ex-done" aria-label="Mark ${esc(c.it.t)} done" data-iso="${c.iso}" data-day="${c.dayIdx}" data-i="${c.bi}" data-n="${c.n}">
            </td>
            <td class="ex-name">
              <span class="modality-dot" style="background:${KIND_COLORS[c.it.k]}"></span>
              ${c.it.ref ? `<button class="ex-link" data-ex="${esc(c.it.ref)}">${esc(c.it.t)}</button>` : esc(c.it.t)}
              <span class="carry-tag">Day ${c.dayIdx + 1} · ${fmtDate(c.date)}</span>
            </td>
          </tr>`).join("")}
      </table>
    </div>` : "";

  const weekOf = i => (i < 28 ? Math.floor(i / 7) : 4);
  let lastWeek = -1;
  const cards = prog.days.map((day, i) => {
    const date = addDays(start, i);
    const iso = isoOf(date);
    const log = dayLog(p, iso, day.items.length);
    const done = log.filter(Boolean).length;
    const complete = done === day.items.length;
    const isToday = i === diff;
    const isPast = date < today;

    let weekHead = "";
    if (weekOf(i) !== lastWeek) {
      lastWeek = weekOf(i);
      weekHead = `<h3 class="week-head">${esc(prog.weeks[lastWeek] || "")}</h3>`;
    }

    return `${weekHead}
    <details class="day-card ${complete ? "day-complete" : ""} ${isToday ? "day-today" : ""} ${isPast && !complete ? "day-missed" : ""}" data-day="${i}" ${isToday ? "open" : ""}>
      <summary>
        <span class="stripe" aria-hidden="true">${progStripe(day.items)}</span>
        <span class="day-label">Day ${i + 1} · ${fmtDate(date)}${isToday ? " · today" : ""}</span>
        <span class="day-title">${esc(day.title)}</span>
        <span class="day-count" data-count="${i}">${complete ? "✓ done" : isPast ? `${day.items.length - done} left over` : `${done}/${day.items.length} done`}</span>
      </summary>
      <div class="day-body">
        ${isToday ? carrySection : ""}
        ${day.note ? `<p class="warmup">${esc(day.note)}</p>` : ""}
        <table class="ex-table">
          ${day.items.map((it, bi) => `
            <tr class="${log[bi] ? "ex-checked" : ""} ${isPast && !log[bi] ? "ex-missed" : ""}" data-row="${i}-${bi}">
              <td class="ex-check-cell">
                <input type="checkbox" class="ex-done" aria-label="Mark ${esc(it.t)} done" data-iso="${iso}" data-day="${i}" data-i="${bi}" data-n="${day.items.length}" ${log[bi] ? "checked" : ""}>
              </td>
              <td class="ex-name">
                <span class="modality-dot" style="background:${KIND_COLORS[it.k]}"></span>
                ${it.ref ? `<button class="ex-link" data-ex="${esc(it.ref)}">${esc(it.t)}</button>` : esc(it.t)}
              </td>
            </tr>`).join("")}
        </table>
        ${day.food ? `<p class="prog-food">${esc(day.food)}</p>` : ""}
      </div>
    </details>`;
  }).join("");

  return `
    ${banner}
    <div class="card prog-head">
      <h3>${esc(prog.title)}</h3>
      <p class="page-sub">${esc(prog.subtitle)} · started ${fmtDate(start)}</p>
    </div>
    ${cards}
    <div class="card notes-card">
      <h3>How to progress</h3>
      <ul>${prog.rules.map(r => `<li>${esc(r)}</li>`).join("")}</ul>
    </div>`;
}

function nutritionTab(p) {
  const prog = p.program && typeof PROGRAMS !== "undefined" && PROGRAMS[p.program];
  if (prog && prog.nutrition) return foodCard(p) + programNutritionTab(prog.nutrition);
  return foodCard(p) + standardNutritionTab(p);
}

function addFoodEntry(p) {
  const textEl = document.getElementById("food-text");
  const kcalEl = document.getElementById("food-kcal");
  const t = textEl.value.trim();
  if (!t) { textEl.focus(); return; }
  let kcal = kcalEl.value !== "" ? Math.max(0, Math.round(Number(kcalEl.value))) : null;
  let est = false;
  if (kcal == null) {
    const guess = estimateKcal(t);
    if (guess != null) { kcal = guess; est = true; }
  }
  foodEntries(p, todayISO()).push({
    id: "f" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    t, kcal, est,
  });
  save();
  renderDashboard(p, "nutrition");
}

function programNutritionTab(n) {
  return `
    <div class="card macro-card">
      <p class="macro-headline">${esc(n.headline)}</p>
      <table class="meal-table targets-table">
        ${n.targets.map(([k, v]) => `<tr><td class="meal-name">${esc(k)}</td><td class="ex-scheme" style="text-align:left">${esc(v)}</td></tr>`).join("")}
      </table>
    </div>
    <div class="card">
      <h3>A day of eating</h3>
      <table class="meal-table">
        ${n.meals.map(m => `<tr><td class="meal-name">${esc(m.name)}</td><td>${esc(m.items)}</td></tr>`).join("")}
      </table>
    </div>
    <div class="card notes-card">
      <h3>Guidelines</h3>
      <ul>${n.guidelines.map(g => `<li>${esc(g)}</li>`).join("")}</ul>
    </div>`;
}

function standardNutritionTab(p) {
  if (!p.diet) regeneratePerson(p);
  const d = p.diet;
  const pCal = d.protein * 4, cCal = d.carbs * 4, fCal = d.fat * 9;
  const total = pCal + cCal + fCal;

  return `
    <div class="card macro-card">
      <p class="macro-headline">${esc(d.headline)}</p>
      <div class="macro-big"><span class="macro-num">${d.calories.toLocaleString()}</span> kcal / day</div>
      <div class="macro-bar" role="img" aria-label="Macro split: protein ${d.protein} g, carbs ${d.carbs} g, fat ${d.fat} g">
        <span style="flex:${pCal / total};background:var(--plate-red)"></span>
        <span style="flex:${cCal / total};background:var(--plate-blue)"></span>
        <span style="flex:${fCal / total};background:var(--plate-yellow)"></span>
      </div>
      <div class="macro-row">
        <span><span class="modality-dot" style="background:var(--plate-red)"></span><strong>${d.protein} g</strong> protein</span>
        <span><span class="modality-dot" style="background:var(--plate-blue)"></span><strong>${d.carbs} g</strong> carbs</span>
        <span><span class="modality-dot" style="background:var(--plate-yellow)"></span><strong>${d.fat} g</strong> fat</span>
      </div>
    </div>
    <div class="card">
      <h3>A day of eating</h3>
      <table class="meal-table">
        ${d.meals.map(m => `<tr><td class="meal-name">${esc(m.name)}</td><td>${esc(m.items)}</td></tr>`).join("")}
      </table>
    </div>
    <div class="card notes-card">
      <h3>Guidelines</h3>
      <ul>${d.guidelines.map(gl => `<li>${esc(gl)}</li>`).join("")}</ul>
    </div>`;
}

// ── Equipment page ───────────────────────────────────────────────────────────

function renderEquipmentPage() {
  document.body.dataset.theme = "light";
  app.innerHTML = `
    <div class="page narrow">
      <nav class="topnav"><a class="quiet-link" href="#/">&larr; Locker room</a></nav>
      <header class="page-head">
        <p class="eyebrow">The gym</p>
        <h1>Equipment</h1>
        <p class="page-sub">Turn things off if they're out of action — everyone's plans rebuild automatically to use what's available.</p>
      </header>
      <div class="equip-list">
        ${EQUIPMENT.map(e => `
          <label class="equip-item">
            <input type="checkbox" data-id="${e.id}" ${store.equipment[e.id] ? "checked" : ""}>
            <img class="equip-photo" src="assets/img/${e.id}.jpg" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
            <span class="equip-name">${esc(e.name)}</span>
            <span class="equip-tag">${e.tag}</span>
          </label>`).join("")}
      </div>
    </div>`;

  app.querySelectorAll(".equip-item input").forEach(cb => {
    cb.addEventListener("change", () => {
      store.equipment[cb.dataset.id] = cb.checked;
      regenerateAll();
    });
  });
}

route();
(async () => {
  if (getSyncKey()) {
    const ok = await syncPull();
    if (ok) route();
    return;
  }
  // No passcode on this device yet: if a sync server is out there, ask to log in.
  if (sessionStorage.getItem("wildstar-login-skip")) return;
  if (await syncAvailable()) showLogin();
})();
