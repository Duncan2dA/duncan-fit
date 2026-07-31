import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = file => fs.readFileSync(new URL(file, root), "utf8");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(read("program.js"), context);
const program = context.window.DUNCAN_FIT_PROGRAM;

assert.equal(program.workouts.length, 4, "Het programma moet vier trainingen hebben");
assert.equal(program.phases.length, 6, "Alle zes trainingsfasen moeten aanwezig zijn");
assert.ok(program.workouts.every(workout => workout.exercises.length >= 7), "Elke training moet compleet zijn");
assert.ok(program.workouts.some(workout => workout.exercises.some(exercise => exercise.ankle)), "Enkelbewuste oefeningen ontbreken");

const ids = program.workouts.flatMap(workout => workout.exercises.map(exercise => exercise.id));
assert.equal(new Set(ids).size, ids.length, "Oefening-ID's moeten uniek zijn");

const manifest = JSON.parse(read("manifest.webmanifest"));
assert.equal(manifest.display, "standalone");
assert.ok(manifest.icons.some(icon => icon.type === "image/svg+xml" && icon.purpose.includes("maskable")));

const serviceWorker = read("sw.js");
for (const asset of ["index.html", "styles.css", "program.js", "app.js", "manifest.webmanifest", "icon.svg"]) {
  assert.ok(serviceWorker.includes(asset), `${asset} ontbreekt in de offline cache`);
}

const html = read("index.html");
for (const id of ["homeView", "workoutView", "progressView", "infoView", "timerSheet"]) {
  assert.ok(html.includes(`id="${id}"`), `${id} ontbreekt`);
}

console.log("Duncan Fit validatie geslaagd.");

