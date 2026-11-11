'use strict';

// Clues are ordered from suggestive to specific. Answers are intentionally curated.
const puzzles = [
  { answer: 'Making a model volcano', answers: ['making a model volcano', 'building a model volcano', 'making a volcano', 'building a volcano', 'volcano', 'model volcano', 'science fair volcano', 'making a science fair volcano', 'building a science fair volcano', 'school volcano', 'making a school volcano', 'volcano science project', 'making a volcano for a school project', 'building a volcano for a school project'], items: [['WHITE VINEGAR','2.49'],['BAKING SODA','1.29'],['RED FOOD COLORING','3.19'],['POSTER BOARD','1.99'],['MODELING CLAY','4.49'],['PLASTIC BOTTLE','0.99'],['BROWN PAINT','2.79'],['SCIENCE FAIR LABELS','1.49']] },
  { answer: 'Carving a jack-o’-lantern', answers: ['carving a jack o lantern', 'carving a jack o lanterns', 'carving a pumpkin', 'carving pumpkins', 'making a jack o lantern', 'making jack o lanterns', 'jack o lantern', 'pumpkin carving', 'carve a pumpkin'], items: [['LARGE PUMPKIN','6.99'],['TEALIGHT CANDLES','3.49'],['BLACK MARKER','1.79'],['SCOOPING SPOON','2.99'],['CARVING KIT','5.49'],['PUMPKIN STENCILS','2.29'],['NEWSPAPER','1.50'],['MATCHES','1.19']] },
  { answer: 'Making s’mores', answers: ['making smores', 'making s mores', 'smores', 's mores', 'roasting marshmallows for smores', 'making a smore', 'making a s more'], items: [['GRAHAM CRACKERS','3.49'],['MILK CHOCOLATE','2.99'],['MARSHMALLOWS','2.29'],['WOODEN SKEWERS','2.49'],['FIREWOOD','7.99'],['FIRE STARTERS','4.29'],['CAMPFIRE STICKS','5.99'],['NAPKINS','1.99']] },
  { answer: 'Planting a garden', answers: ['planting a garden', 'starting a garden', 'gardening', 'planting a vegetable garden', 'starting a vegetable garden', 'planting vegetables', 'growing vegetables', 'planting seeds', 'planting a vegetable patch', 'growing a garden'], items: [['POTTING SOIL','6.49'],['GARDEN GLOVES','4.99'],['TOMATO SEEDS','2.29'],['GARDEN TROWEL','5.99'],['WATERING CAN','8.49'],['PLANT LABELS','2.19'],['CARROT SEEDS','2.29'],['SEED STARTER TRAY','4.99']] },
  { answer: 'Wrapping a birthday present', answers: ['wrapping a birthday present', 'wrapping a birthday gift', 'wrapping a present', 'wrapping presents', 'wrapping gifts', 'gift wrapping', 'wrapping a gift', 'wrapping birthday presents'], items: [['WRAPPING PAPER','4.99'],['CLEAR TAPE','2.49'],['RIBBON','2.99'],['GIFT TAGS','1.99'],['BIRTHDAY CARD','3.49'],['TISSUE PAPER','2.29'],['GIFT BOX','3.99'],['BIRTHDAY GIFT BAG','4.49']] },
  { answer: 'Washing a car', answers: ['washing a car', 'washing the car', 'washing their car', 'washing a vehicle', 'cleaning a car', 'cleaning the car', 'car wash', 'car washing', 'washing car'], items: [['LARGE SPONGE','2.49'],['MICROFIBER CLOTHS','5.99'],['PLASTIC BUCKET','4.99'],['CAR WASH SOAP','7.49'],['GARDEN HOSE NOZZLE','8.99'],['TIRE BRUSH','4.29'],['CAR WAX','9.99'],['WINDSHIELD CLEANER','3.99']] },
  { answer: 'Making lemonade', answers: ['making lemonade', 'making fresh lemonade', 'making homemade lemonade', 'lemonade', 'making lemon juice', 'preparing lemonade', 'making a pitcher of lemonade'], items: [['FRESH LEMONS','4.99'],['WHITE SUGAR','3.49'],['ICE CUBES','2.49'],['PAPER CUPS','3.29'],['WATER PITCHER','7.99'],['CITRUS JUICER','5.49'],['DRINKING STRAWS','1.99'],['LEMONADE STAND SIGN','3.99']] },
  { answer: 'Making homemade pizza', answers: ['making homemade pizza', 'making pizza', 'baking homemade pizza', 'baking pizza', 'cooking pizza', 'homemade pizza', 'pizza night', 'making a pizza from scratch', 'baking a pizza from scratch'], items: [['OLIVE OIL','8.99'],['FRESH BASIL','2.49'],['PIZZA DOUGH','3.49'],['TOMATO SAUCE','2.29'],['MOZZARELLA CHEESE','4.99'],['PEPPERONI','3.79'],['CORNMEAL','2.19'],['PIZZA CUTTER','6.49']] },
];
const DAY = 86400000;
const EST_OFFSET = 5 * 60 * 60 * 1000;
const currentDay = () => Math.floor((Date.now() - EST_OFFSET) / DAY);
const epoch = Date.UTC(2026, 0, 1) / DAY;
const $ = id => document.getElementById(id);
const normalize = text => text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
let day, puzzle, state, stats;

function loadDay() {
  if (!stats) stats = loadStats();
  day = currentDay();
  const index = ((day - epoch) % puzzles.length + puzzles.length) % puzzles.length;
  puzzle = puzzles[index];
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(`receipt:${day}`)); } catch (_) { /* Storage may be unavailable. */ }
  state = saved && Array.isArray(saved.guesses) ? saved : { guesses: [], solved: false };
  $('receipt-number').textContent = `RECEIPT #${String(day - epoch + 1).padStart(3, '0')}`;
  const receiptDate = new Date(day * DAY).toISOString().slice(0, 10);
  $('receipt-date').textContent = receiptDate;
  $('welcome-date').textContent = `TODAY'S RECEIPT · ${receiptDate}`;
  $('feedback').textContent = '';
  $('guess').value = '';
  if (state.solved || state.guesses.length >= 6) recordStats();
  renderStats();
  render();
}
function save() {
  try { localStorage.setItem(`receipt:${day}`, JSON.stringify(state)); } catch (_) { /* The game remains playable without storage. */ }
}
function defaultStats() {
  return { played: 0, wins: 0, currentStreak: 0, maxStreak: 0, lastDay: null };
}
function loadStats() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem('receipt:stats')); } catch (_) { /* Storage may be unavailable. */ }
  if (!saved || !Number.isFinite(saved.played) || !Number.isFinite(saved.wins) || !Number.isFinite(saved.currentStreak) || !Number.isFinite(saved.maxStreak)) return defaultStats();
  return { played: saved.played, wins: saved.wins, currentStreak: saved.currentStreak, maxStreak: saved.maxStreak, lastDay: Number.isFinite(saved.lastDay) ? saved.lastDay : null };
}
function saveStats() {
  try { localStorage.setItem('receipt:stats', JSON.stringify(stats)); } catch (_) { /* The game remains playable without storage. */ }
}
function renderStats() {
  $('stat-played').textContent = stats.played;
  $('stat-win-rate').textContent = `${stats.played ? Math.round(stats.wins / stats.played * 100) : 0}`;
  $('stat-current-streak').textContent = stats.currentStreak;
  $('stat-max-streak').textContent = stats.maxStreak;
}
function recordStats() {
  if (state.statsRecorded) return;
  stats.played += 1;
  if (state.solved) {
    stats.wins += 1;
    stats.currentStreak = stats.lastDay === day - 1 ? stats.currentStreak + 1 : 1;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
  } else {
    stats.currentStreak = 0;
  }
  stats.lastDay = day;
  state.statsRecorded = true;
  saveStats();
  save();
  renderStats();
}
function render(revealIndex = -1) {
  const count = state.guesses.length;
  const finished = state.solved || count >= 6;
  const visible = Math.min(2 + count - (state.solved ? 1 : 0), puzzle.items.length);
  $('items').replaceChildren(...puzzle.items.map(([name, price], index) => {
    const li = document.createElement('li');
    const label = document.createElement('span');
    const amount = document.createElement('span');
    if (index < visible) {
      label.textContent = name; amount.textContent = price;
      if (index === revealIndex) li.className = 'swipe-away';
    } else {
      li.className = 'hidden-item covered-item';
      label.textContent = '••••••••••••••••';
      amount.textContent = '••••';
    }
    li.append(label, amount);
    return li;
  }));
  $('revealed').textContent = `${visible} / ${puzzle.items.length}`;
  $('counter').textContent = finished ? `${count} / 6 GUESSES` : `GUESS ${count + 1} OF 6`;
  $('guesses').replaceChildren(...state.guesses.map((guess, index) => {
    const li = document.createElement('li');
    const text = document.createElement('div'); text.textContent = guess;
    const isCorrect = state.solved && index === count - 1;
    if (isCorrect) li.className = 'correct-guess';
    const status = document.createElement('span'); status.textContent = isCorrect ? 'CORRECT' : 'NOT QUITE';
    li.append(text, status); return li;
  }));
  $('guess-form').hidden = finished;
  $('result').hidden = !finished;
  if (finished) {
    $('result-answer').textContent = puzzle.answer + '.';
    $('result-detail').textContent = state.solved ? `You figured it out in ${count} ${count === 1 ? 'guess' : 'guesses'}. Nice work.` : 'That was the story behind today’s receipt.';
  }
}
$('guess-form').addEventListener('submit', event => {
  event.preventDefault();
  if (currentDay() !== day) { loadDay(); $('feedback').textContent = 'A new receipt is here!'; return; }
  const guess = $('guess').value.trim();
  if (!normalize(guess)) { $('feedback').textContent = 'Please enter an activity.'; return; }
  if (state.solved || state.guesses.length >= 6) return;
  state.guesses.push(guess);
  state.solved = puzzle.answers.some(answer => normalize(answer) === normalize(guess));
  const revealIndex = state.solved ? -1 : Math.min(2 + state.guesses.length, puzzle.items.length) - 1;
  if (state.solved || state.guesses.length >= 6) recordStats();
  save(); render(revealIndex);
  $('guess').value = '';
  $('feedback').textContent = state.solved || state.guesses.length >= 6 ? '' : 'Not quite. Another item has been revealed.';
});
$('share').addEventListener('click', async () => {
  const count = state.guesses.length;
  const text = `RECEIPT #${String(day - epoch + 1).padStart(3, '0')}\n${state.solved ? `Solved in ${count}/6` : 'Not solved in 6/6'}\n\n${'⬜'.repeat(count - (state.solved ? 1 : 0))}${state.solved ? '🟩' : ''}\n${location.href.split(/[?#]/)[0]}`;
  try { await navigator.clipboard.writeText(text); $('share-feedback').textContent = 'Copied to clipboard.'; }
  catch (_) { $('share-feedback').textContent = 'Could not copy automatically. Select and copy your result below.'; const box = document.createElement('textarea'); box.value = text; box.readOnly = true; box.setAttribute('aria-label', 'Share result'); $('share-feedback').append(document.createElement('br'), box); box.select(); }
});
$('play-button').addEventListener('click', () => {
  $('welcome').hidden = true;
  $('game-shell').hidden = false;
  $('theme-color').setAttribute('content', '#121213');
  $('guess').focus();
});
$('help-button').addEventListener('click', () => $('help').showModal());
$('close-help').addEventListener('click', () => $('help').close());
$('got-it').addEventListener('click', () => $('help').close());
$('stats-button').addEventListener('click', () => $('stats').showModal());
$('close-stats').addEventListener('click', () => $('stats').close());
$('stats-done').addEventListener('click', () => $('stats').close());
function tick() {
  const now = Date.now();
  if (currentDay() !== day) loadDay();
  const seconds = Math.ceil(((day + 1) * DAY + EST_OFFSET - now) / 1000);
  $('countdown').textContent = [Math.floor(seconds / 3600), Math.floor(seconds % 3600 / 60), seconds % 60].map(n => String(n).padStart(2, '0')).join(':');
}
loadDay(); tick(); setInterval(tick, 1000);
