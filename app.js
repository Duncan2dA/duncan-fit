(() => {
  "use strict";
  const PROGRAM = window.DUNCAN_FIT_PROGRAM;
  const STORAGE_KEY = "duncan-fit-v2";
  const LEGACY_KEY = "duncanFitDataV1";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const defaultState = () => ({ version: 2, currentWeek: 1, sessions: {}, activeSession: null });
  let state = loadState();
  let activeWorkoutId = null;
  let timerInterval = null;
  let timerEnd = 0;
  let timerTotal = 0;
  let installPrompt = null;
  let toastTimeout = null;

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (parsed?.version === 2 && parsed.sessions) return parsed;
    } catch (_) {}
    const fresh = defaultState();
    try {
      const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY));
      if (legacy?.week) fresh.currentWeek = Math.min(12, Math.max(1, Number(legacy.week)));
    } catch (_) {}
    return fresh;
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function phaseForWeek(week) {
    if (week <= 3) return PROGRAM.phases[0];
    if (week === 4) return PROGRAM.phases[1];
    if (week <= 7) return PROGRAM.phases[2];
    if (week === 8) return PROGRAM.phases[3];
    if (week <= 11) return PROGRAM.phases[4];
    return PROGRAM.phases[5];
  }

  function sessionKey(week, workoutId) {
    return `${week}:${workoutId}`;
  }

  function getSession(week, workoutId, create = false) {
    const key = sessionKey(week, workoutId);
    if (!state.sessions[key] && create) {
      state.sessions[key] = { week, workoutId, startedAt: new Date().toISOString(), completedAt: null, sets: {} };
    }
    return state.sessions[key];
  }

  function prescribedSets(exercise, week) {
    if (exercise.sets === 1) return 1;
    const delta = phaseForWeek(week).setDelta;
    return Math.max(2, exercise.sets + delta);
  }

  function setArray(session, exercise, create = false) {
    if (!session.sets[exercise.id] && create) session.sets[exercise.id] = [];
    return session.sets[exercise.id] || [];
  }

  function countWorkoutSets(workout, week) {
    return workout.exercises.reduce((sum, exercise) => sum + prescribedSets(exercise, week), 0);
  }

  function completedSets(session) {
    if (!session) return 0;
    return Object.values(session.sets).flat().filter(set => set?.done).length;
  }

  function completedWorkouts(week) {
    return PROGRAM.workouts.filter(workout => getSession(week, workout.id)?.completedAt).length;
  }

  function renderHome() {
    const week = state.currentWeek;
    const phase = phaseForWeek(week);
    const completed = completedWorkouts(week);
    const percentage = Math.round((completed / PROGRAM.workouts.length) * 100);
    $("#weekNumber").textContent = week;
    $("#weekCounter").textContent = `${week} van 12`;
    $("#phaseLabel").textContent = `${phase.title} Â· ${phase.rir}`;
    $("#phaseDescription").textContent = phase.description;
    $("#weekProgress").textContent = `${percentage}%`;
    $("#weekProgressOrb").style.setProperty("--progress", `${percentage}%`);
    $("#completedCount").textContent = `${completed} van 4 afgerond`;
    $("#previousWeek").disabled = week === 1;
    $("#nextWeek").disabled = week === 12;

    $("#workoutGrid").innerHTML = PROGRAM.workouts.map((workout, index) => {
      const session = getSession(week, workout.id);
      const isDone = Boolean(session?.completedAt);
      const doneSets = completedSets(session);
      const totalSets = countWorkoutSets(workout, week);
      return `
        <button class="workout-card ${isDone ? "completed" : ""}" data-workout="${workout.id}" data-index="0${index + 1}">
          <span class="card-top"><span class="eyebrow">${workout.day}</span><span class="status-dot"></span></span>
          <h3>${escapeHtml(workout.title)}</h3>
          <p>${escapeHtml(workout.subtitle)}</p>
          <small>${isDone ? "Afgerond" : doneSets ? `${doneSets}/${totalSets} sets Â· doorgaan` : `${workout.duration} Â· ${workout.exercises.length} oefeningen`}</small>
        </button>`;
    }).join("");
    $$(".workout-card").forEach(card => card.addEventListener("click", () => openWorkout(card.dataset.workout)));
    renderResume();
  }

  function renderResume() {
    const active = state.activeSession;
    const card = $("#resumeCard");
    if (!active || active.week !== state.currentWeek) {
      card.classList.add("hidden");
      return;
    }
    const workout = PROGRAM.workouts.find(item => item.id === active.workoutId);
    const session = getSession(active.week, active.workoutId);
    if (!workout || session?.completedAt) {
      state.activeSession = null;
      saveState();
      card.classList.add("hidden");
      return;
    }
    card.innerHTML = `<button><strong>Ga verder met ${escapeHtml(workout.title)} â†’</strong><span>${completedSets(session)} sets gelogd in week ${active.week}</span></button>`;
    $("button", card).addEventListener("click", () => openWorkout(workout.id));
    card.classList.remove("hidden");
  }

  function openWorkout(workoutId) {
    activeWorkoutId = workoutId;
    const workout = PROGRAM.workouts.find(item => item.id === workoutId);
    if (!workout) return;
    const session = getSession(state.currentWeek, workoutId, true);
    if (!session.completedAt) state.activeSession = { week: state.currentWeek, workoutId };
    saveState();
    $("#workoutMeta").textContent = `Week ${state.currentWeek} Â· ${workout.day} Â· ${workout.duration}`;
    $("#workoutTitle").textContent = workout.title;
    $("#workoutSubtitle").textContent = workout.subtitle;
    const phase = phaseForWeek(state.currentWeek);
    $("#workoutNotice").textContent = `${phase.title}: ${phase.description} Richtpunt: ${phase.rir}. Rust na een werkset met de ingebouwde timer.`;
    $("#exerciseList").innerHTML = workout.exercises.map((exercise, index) => exerciseMarkup(exercise, index, session)).join("");
    bindWorkoutEvents();
    updateWorkoutProgress();
    showView("workout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function exerciseMarkup(exercise, index, session) {
    const sets = prescribedSets(exercise, state.currentWeek);
    const saved = setArray(session, exercise);
    const previous = findPrevious(exercise.id, state.currentWeek);
    const rows = Array.from({ length: sets }, (_, setIndex) => {
      const value = saved[setIndex] || {};
      return `
        <div class="set-row ${value.done ? "done" : ""}">
          <span class="set-number">${setIndex + 1}</span>
          <input type="text" inputmode="decimal" autocomplete="off" aria-label="Gewicht set ${setIndex + 1}" placeholder="${exercise.type === "time" ? "â€”" : "kg"}" value="${escapeAttr(value.weight || "")}" data-exercise="${exercise.id}" data-set="${setIndex}" data-field="weight" ${exercise.type === "time" ? "disabled" : ""}>
          <input type="text" inputmode="numeric" autocomplete="off" aria-label="Herhalingen of tijd set ${setIndex + 1}" placeholder="${escapeAttr(exercise.reps)}" value="${escapeAttr(value.reps || "")}" data-exercise="${exercise.id}" data-set="${setIndex}" data-field="reps">
          <button class="check-button ${value.done ? "done" : ""}" aria-label="Set ${setIndex + 1} afvinken" aria-pressed="${Boolean(value.done)}" data-check="${exercise.id}" data-set="${setIndex}">${value.done ? "âœ“" : "â—‹"}</button>
        </div>`;
    }).join("");
    return `
      <article class="exercise-card" data-exercise-card="${exercise.id}">
        <div class="exercise-title-row">
          <div><span class="exercise-index">OEFENING ${String(index + 1).padStart(2, "0")}${exercise.ankle ? " Â· ENKELBEWUST" : ""}</span><h2>${escapeHtml(exercise.name)}</h2></div>
          ${previous ? `<span class="previous-value">Vorige: ${escapeHtml(previous)}</span>` : ""}
        </div>
        <p class="exercise-meta">${escapeHtml(exercise.equipment)} Â· ${sets} sets Â· ${escapeHtml(exercise.reps)}${exercise.rest ? ` Â· ${exercise.rest} sec rust` : ""}</p>
        <p class="exercise-tip">${escapeHtml(exercise.tip)}</p>
        <div class="set-labels"><span>Set</span><span>${exercise.type === "time" ? "Gewicht" : "Kg"}</span><span>${exercise.type === "time" ? "Tijd" : "Reps"}</span><span>Klaar</span></div>
        ${rows}
      </article>`;
  }

  function bindWorkoutEvents() {
    $$("input[data-exercise]").forEach(input => input.addEventListener("change", () => {
      const session = getSession(state.currentWeek, activeWorkoutId, true);
      const workout = PROGRAM.workouts.find(item => item.id === activeWorkoutId);
      const exercise = workout.exercises.find(item => item.id === input.dataset.exercise);
      const sets = setArray(session, exercise, true);
      const index = Number(input.dataset.set);
      sets[index] = sets[index] || {};
      sets[index][input.dataset.field] = input.value.trim().replace(",", ".");
      saveState();
    }));
    $$("button[data-check]").forEach(button => button.addEventListener("click", () => toggleSet(button)));
  }

  function toggleSet(button) {
    const session = getSession(state.currentWeek, activeWorkoutId, true);
    const workout = PROGRAM.workouts.find(item => item.id === activeWorkoutId);
    const exercise = workout.exercises.find(item => item.id === button.dataset.check);
    const sets = setArray(session, exercise, true);
    const index = Number(button.dataset.set);
    sets[index] = sets[index] || {};
    sets[index].done = !sets[index].done;
    sets[index].loggedAt = new Date().toISOString();
    button.classList.toggle("done", sets[index].done);
    button.closest(".set-row").classList.toggle("done", sets[index].done);
    button.textContent = sets[index].done ? "âœ“" : "â—‹";
    button.setAttribute("aria-pressed", String(sets[index].done));
    saveState();
    updateWorkoutProgress();
    if (sets[index].done && exercise.rest) startTimer(exercise.rest);
  }

  function updateWorkoutProgress() {
    const workout = PROGRAM.workouts.find(item => item.id === activeWorkoutId);
    const session = getSession(state.currentWeek, activeWorkoutId);
    const done = completedSets(session);
    const total = countWorkoutSets(workout, state.currentWeek);
    $("#workoutCompletion").textContent = `${done}/${total} sets`;
    $("#finishSummary").textContent = done ? `${done} van ${total} werksets afgevinkt.` : "Vink je uitgevoerde sets af.";
    $("#finishWorkout").textContent = session?.completedAt ? "Training opnieuw afronden" : "Training afronden";
  }

  function finishWorkout() {
    const session = getSession(state.currentWeek, activeWorkoutId, true);
    if (!completedSets(session) && !confirm("Je hebt nog geen sets afgevinkt. Toch afronden?")) return;
    session.completedAt = new Date().toISOString();
    session.volume = sessionVolume(session);
    state.activeSession = null;
    saveState();
    toast("Training opgeslagen. Goed werk!");
    showView("home");
    renderHome();
  }

  function findPrevious(exerciseId, beforeWeek) {
    for (let week = beforeWeek - 1; week >= 1; week--) {
      for (const workout of PROGRAM.workouts) {
        const session = getSession(week, workout.id);
        const values = session?.sets?.[exerciseId]?.filter(set => set.done && (set.weight || set.reps));
        if (values?.length) {
          const best = [...values].reverse().find(set => set.weight) || values[values.length - 1];
          return best.weight ? `${best.weight} kg Ã— ${best.reps || "â€”"}` : best.reps || "";
        }
      }
    }
    return "";
  }

  function sessionVolume(session) {
    return Object.values(session.sets || {}).flat().reduce((sum, set) => {
      if (!set?.done) return sum;
      const weight = Number.parseFloat(set.weight) || 0;
      const reps = Number.parseFloat(set.reps) || 0;
      return sum + weight * reps;
    }, 0);
  }

  function renderProgress() {
    const sessions = Object.values(state.sessions).filter(session => session.completedAt);
    const totalSets = Object.values(state.sessions).reduce((sum, session) => sum + completedSets(session), 0);
    const totalVolume = Object.values(state.sessions).reduce((sum, session) => sum + sessionVolume(session), 0);
    $("#sessionStat").textContent = sessions.length;
    $("#setStat").textContent = totalSets;
    $("#volumeStat").textContent = compactNumber(totalVolume);
    const volumes = Array.from({ length: 12 }, (_, index) =>
      Object.values(state.sessions).filter(session => session.week === index + 1).reduce((sum, session) => sum + sessionVolume(session), 0)
    );
    const max = Math.max(...volumes, 1);
    $("#volumeChart").innerHTML = volumes.map((volume, index) =>
      `<div class="volume-bar" title="Week ${index + 1}: ${Math.round(volume)} kg" style="height:${Math.max(3, volume / max * 100)}%"><span>${index + 1}</span></div>`
    ).join("");
    const ordered = sessions.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    $("#historyList").innerHTML = ordered.length ? ordered.slice(0, 12).map(session => {
      const workout = PROGRAM.workouts.find(item => item.id === session.workoutId);
      return `<article class="history-item"><div><strong>${escapeHtml(workout?.title || "Training")}</strong><small>Week ${session.week} Â· ${formatDate(session.completedAt)} Â· ${completedSets(session)} sets</small></div><span class="history-volume">${compactNumber(sessionVolume(session))} kg</span></article>`;
    }).join("") : `<div class="empty-state">Rond je eerste training af; dan verschijnt hier je logboek.</div>`;
  }

  function renderInfo() {
    $("#phaseCards").innerHTML = PROGRAM.phases.map(phase => `
      <article class="phase-card ${phase === phaseForWeek(state.currentWeek) ? "current" : ""}">
        <p class="eyebrow">${phase.weeks} Â· ${phase.rir}</p>
        <strong>${phase.title}</strong><span>${phase.description}</span>
      </article>`).join("");
  }

  function startTimer(seconds) {
    timerTotal = seconds;
    timerEnd = Date.now() + seconds * 1000;
    $("#timerSheet").classList.remove("hidden");
    updateTimer();
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 250);
  }

  function updateTimer() {
    const remaining = Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000));
    $("#timerDisplay").textContent = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
    $("#timerBar").style.width = `${Math.min(100, remaining / timerTotal * 100)}%`;
    if (remaining <= 0) {
      clearInterval(timerInterval);
      if (navigator.vibrate) navigator.vibrate([180, 100, 180]);
      $("#timerTitle").textContent = "Tijd voor je volgende set";
    } else {
      $("#timerTitle").textContent = "Rusttimer";
    }
  }

  function adjustTimer(seconds) {
    timerEnd = Math.max(Date.now(), timerEnd + seconds * 1000);
    timerTotal = Math.max(15, timerTotal + seconds);
    updateTimer();
  }

  function stopTimer() {
    clearInterval(timerInterval);
    $("#timerSheet").classList.add("hidden");
  }

  function showView(name) {
    $$(".view").forEach(view => view.classList.toggle("active", view.id === `${name}View`));
    $$(".nav-button").forEach(button => button.classList.toggle("active", button.dataset.view === name));
    if (name === "home") renderHome();
    if (name === "progress") renderProgress();
    if (name === "info") renderInfo();
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `duncan-fit-reservekopie-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast("Reservekopie gemaakt");
  }

  async function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (parsed?.version !== 2 || !parsed.sessions) throw new Error("Ongeldig bestand");
      if (!confirm("Huidige gegevens vervangen door deze reservekopie?")) return;
      state = parsed;
      saveState();
      showView("progress");
      toast("Reservekopie teruggezet");
    } catch (_) {
      alert("Dit lijkt geen geldige Duncan Fit-reservekopie.");
    } finally {
      event.target.value = "";
    }
  }

  function resetData() {
    if (!confirm("Alle trainingsgegevens op dit apparaat definitief wissen?")) return;
    state = defaultState();
    localStorage.removeItem(STORAGE_KEY);
    saveState();
    showView("home");
    toast("Gegevens gewist");
  }

  function compactNumber(value) {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}m`;
    if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
    return String(Math.round(value));
  }

  function formatDate(value) {
    return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function toast(message) {
    const element = $("#toast");
    element.textContent = message;
    element.classList.remove("hidden");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => element.classList.add("hidden"), 2600);
  }

  $("#previousWeek").addEventListener("click", () => { state.currentWeek = Math.max(1, state.currentWeek - 1); saveState(); renderHome(); });
  $("#nextWeek").addEventListener("click", () => { state.currentWeek = Math.min(12, state.currentWeek + 1); saveState(); renderHome(); });
  $("#finishWorkout").addEventListener("click", finishWorkout);
  $("#timerMinus").addEventListener("click", () => adjustTimer(-15));
  $("#timerPlus").addEventListener("click", () => adjustTimer(15));
  $("#timerStop").addEventListener("click", stopTimer);
  $("#timerSheet").addEventListener("click", event => { if (event.target === $("#timerSheet")) stopTimer(); });
  $("#exportButton").addEventListener("click", exportData);
  $("#importInput").addEventListener("change", importData);
  $("#resetButton").addEventListener("click", resetData);
  $$("[data-go='home']").forEach(button => button.addEventListener("click", () => showView("home")));
  $$(".nav-button").forEach(button => button.addEventListener("click", () => showView(button.dataset.view)));
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
    $("#installButton").classList.remove("hidden");
  });
  $("#installButton").addEventListener("click", async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    $("#installButton").classList.add("hidden");
  });
  window.addEventListener("appinstalled", () => toast("Duncan Fit is geÃ¯nstalleerd"));
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  }
  renderHome();
})();

