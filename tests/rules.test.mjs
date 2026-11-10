import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculate, parseNumber } from '../assets/js/calculadora.js';
import { createGame, submitGuess } from '../assets/js/adivinhacao.js';
import { translations as dictionary } from '../assets/js/i18n.js';
import { createCalculator, pressKey, formatEntry } from '../assets/js/tradicional.js';

function sequence(keys, initial = createCalculator()) {
  return keys.reduce((state, key) => pressKey(state, key), initial);
}

test('traditional calculator evaluates sequentially, without operator precedence', () => {
  const state = sequence(['1', '0', 'add', '5', 'multiply', '2', 'equals']);
  assert.equal(state.entry, '30');
  assert.deepEqual(state.trace, { first: 15, second: 2, operation: 'multiply' });
});

test('traditional calculator replaces a pending operator', () => {
  assert.equal(sequence(['1', '0', 'add', 'multiply', '2', 'equals']).entry, '20');
});

test('repeated equals reapplies the last operation and operand', () => {
  const first = sequence(['5', 'add', '2', 'equals']);
  assert.equal(first.entry, '7');
  assert.equal(sequence(['equals', 'equals'], first).entry, '11');
});

test('traditional decimal arithmetic hides common binary floating-point residue', () => {
  assert.equal(sequence(['0', 'decimal', '1', 'add', '0', 'decimal', '2', 'equals']).entry, '0.3');
  assert.equal(sequence(['1', 'divide', '3', 'equals']).entry, '0.333333333333333');
  assert.equal(sequence(['decimal', '5', 'decimal', 'multiply', '2', 'equals']).entry, '1');
});

test('negative numbers work as both operands', () => {
  assert.equal(sequence(['sign', '5', 'multiply', '2', 'equals']).entry, '-10');
  assert.equal(sequence(['5', 'subtract', 'sign', '2', 'equals']).entry, '7');
});

test('division errors are recoverable by clearing or entering a fresh number', () => {
  const error = sequence(['8', 'divide', '0', 'equals']);
  assert.equal(error.error, 'divideZero');
  assert.equal(formatEntry(error), '—');
  assert.deepEqual(pressKey(error, 'clear'), createCalculator());
  const recovered = sequence(['4', 'add', '2', 'equals'], error);
  assert.equal(recovered.entry, '6');
  assert.equal(recovered.error, null);
  assert.equal(sequence(['8', 'divide', '0', 'add']).error, 'divideZero');
});

test('backspace edits input, handles sign and restarts after results', () => {
  assert.equal(sequence(['1', '2', '3', 'backspace']).entry, '12');
  assert.equal(sequence(['sign', '7', 'backspace']).entry, '0');
  assert.equal(sequence(['5', 'add', '2', 'equals', 'backspace']).entry, '0');
  assert.equal(sequence(['5', 'add', 'backspace', '2', 'equals']).entry, '7');
});

test('digits start fresh after equals, whereas operators continue the result', () => {
  const state = sequence(['5', 'add', '2', 'equals']);
  assert.equal(sequence(['3'], state).entry, '3');
  assert.equal(sequence(['multiply', '3', 'equals'], state).entry, '21');
  assert.equal(sequence(['5', 'add', 'equals']).entry, '10');
});

test('entry digit limit preserves the existing value and permits recovery', () => {
  const state = sequence([...('9'.repeat(16))]);
  assert.equal(state.entry, '9'.repeat(15));
  assert.equal(state.notice, 'digitLimit');
  assert.equal(sequence(['backspace', '2'], state).entry, '9'.repeat(14) + '2');
});

test('very large chained calculations report overflow and never return Infinity', () => {
  let state = sequence([...('9'.repeat(15)), 'multiply', ...('9'.repeat(15)), 'equals']);
  for (let index = 0; index < 30 && !state.error; index += 1) state = pressKey(state, 'equals');
  assert.equal(state.error, 'overflow');
  assert.equal(formatEntry(state), '—');
});

test('scientific results remain editable without appending to an exponent', () => {
  const state = sequence([...('9'.repeat(15)), 'multiply', ...('9'.repeat(15)), 'equals']);
  assert.match(state.entry, /e/);
  assert.equal(sequence(['sign', '2'], state).entry, '2');
  assert.equal(sequence(['sign', 'backspace'], state).entry, '0');
});

test('calculator accepts signed decimals with point or comma', () => {
  assert.deepEqual(parseNumber(' -12,5 '), { value: -12.5 });
  assert.deepEqual(parseNumber('.5'), { value: 0.5 });
  assert.deepEqual(parseNumber('+3.25'), { value: 3.25 });
  assert.deepEqual(parseNumber('1e2'), { value: 100 });
});

test('calculator rejects empty, partial, grouped and non-finite input', () => {
  assert.equal(parseNumber('  ').error, 'required');
  for (const raw of ['NaN', 'Infinity', '1e999', '1,234.5', '12abc', '0x10', '1+2']) {
    assert.equal(parseNumber(raw).error, 'invalidNumber', raw);
  }
});

test('all four operations retain the two-number model', () => {
  assert.equal(calculate(5, -2, 'add').value, 3);
  assert.equal(calculate(5, -2, 'subtract').value, 7);
  assert.equal(calculate(-2.5, 4, 'multiply').value, -10);
  assert.equal(calculate(7, 2, 'divide').value, 3.5);
});

test('division by zero, invalid operands and result overflow are errors', () => {
  assert.equal(calculate(1, 0, 'divide').error, 'divideZero');
  assert.equal(calculate(1, -0, 'divide').error, 'divideZero');
  assert.equal(calculate(Infinity, 2, 'add').error, 'invalidNumber');
  assert.equal(calculate(1e308, 1e308, 'multiply').error, 'overflow');
});

test('each difficulty includes both interval endpoints and starts fresh', () => {
  for (const limit of [100, 500, 1000]) {
    assert.equal(createGame(limit, () => 0).secret, 1);
    const game = createGame(limit, () => 0.999999);
    assert.equal(game.secret, limit);
    assert.equal(game.used, 0);
    assert.equal(game.status, 'playing');
  }
});

test('invalid guesses never consume attempts or change the game', () => {
  const game = createGame(100, () => 0.49);
  for (const raw of ['', 'abc', '3.5', '4,5', '0', '-1', '101', 'Infinity', '1e2']) {
    const result = submitGuess(game, raw);
    assert.ok(result.error, raw);
    assert.equal(result.game, game);
    assert.equal(result.game.used, 0);
  }
});

test('valid repeated guesses consume attempts and hints point correctly', () => {
  let game = createGame(100, () => 0.49);
  game = submitGuess(game, '25').game;
  assert.equal(game.hint, 'tooLow');
  game = submitGuess(game, '25').game;
  assert.equal(game.used, 2);
  game = submitGuess(game, '75').game;
  assert.equal(game.hint, 'tooHigh');
});

test('a correct tenth guess is exclusively a win', () => {
  let game = createGame(100, () => 0.49);
  for (let attempt = 0; attempt < 9; attempt += 1) game = submitGuess(game, '1').game;
  assert.equal(game.status, 'playing');
  game = submitGuess(game, '50').game;
  assert.equal(game.used, 10);
  assert.equal(game.status, 'won');
  assert.equal(game.hint, null);
});

test('ten misses end the game and further submissions are ignored', () => {
  let game = createGame(100, () => 0.49);
  for (let attempt = 0; attempt < 10; attempt += 1) game = submitGuess(game, '1').game;
  assert.equal(game.status, 'lost');
  assert.equal(game.secret, 50);
  assert.equal(submitGuess(game, '50').game, game);
});

test('a first-guess win ends the game immediately', () => {
  const game = submitGuess(createGame(100, () => 0.49), '50').game;
  assert.equal(game.used, 1);
  assert.equal(game.status, 'won');
  assert.equal(submitGuess(game, '1').game, game);
});

test('both languages cover every static label and preserve translation placeholders', () => {
  assert.deepEqual(Object.keys(dictionary['pt-BR']).sort(), Object.keys(dictionary.en).sort());
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  for (const [, key] of html.matchAll(/data-i18n(?:-aria-label)?="([^"]+)"/g)) {
    assert.ok(dictionary.en[key], key);
  }
  for (const key of Object.keys(dictionary.en)) {
    const tokens = text => [...text.matchAll(/\{\w+\}/g)].map(match => match[0]).sort();
    assert.deepEqual(tokens(dictionary['pt-BR'][key]), tokens(dictionary.en[key]), key);
  }
});
