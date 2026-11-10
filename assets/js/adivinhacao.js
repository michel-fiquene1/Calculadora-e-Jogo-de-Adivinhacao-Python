import { t, formatNumber } from './i18n.js';

const difficulties = Object.freeze({ 100: 'easy', 500: 'medium', 1000: 'hard' });
export const MAX_ATTEMPTS = 10;

export function createGame(limit, random = Math.random) {
  if (!Object.hasOwn(difficulties, limit)) throw new Error('Unknown difficulty');
  return { limit, secret: Math.floor(random() * limit) + 1, used: 0, status: 'playing', lastGuess: null, hint: null };
}

export function submitGuess(game, raw) {
  if (game.status !== 'playing') return { game };
  const text = raw.trim();
  if (!text) return { game, error: 'required' };
  if (!/^[+-]?\d+$/.test(text)) return { game, error: 'invalidInteger' };
  const guess = Number(text);
  if (!Number.isSafeInteger(guess) || guess < 1 || guess > game.limit) return { game, error: 'outOfRange' };
  const used = game.used + 1;
  const won = guess === game.secret;
  // A correct tenth guess wins; the attempt limit is checked only after the win.
  return { game: {
    ...game, used, lastGuess: guess,
    status: won ? 'won' : used === MAX_ATTEMPTS ? 'lost' : 'playing',
    hint: won ? null : guess < game.secret ? 'tooLow' : 'tooHigh',
  } };
}

export function initGame() {
  const setup = document.querySelector('#setup-form');
  const active = document.querySelector('#active-game');
  const form = document.querySelector('#guess-form');
  const input = document.querySelector('#guess');
  const error = document.querySelector('#guess-error');
  const feedback = document.querySelector('#game-feedback');
  const feedbackText = document.querySelector('#feedback-text');
  const feedbackIcon = document.querySelector('#feedback-icon');
  const replay = document.querySelector('#play-again');
  const progress = document.querySelector('#attempt-progress');
  const secret = document.querySelector('#secret-display');
  let game = null;
  let errorKey = null;
  for (let index = 0; index < MAX_ATTEMPTS; index += 1) {
    const segment = document.createElement('span');
    segment.setAttribute('aria-hidden', 'true');
    progress.append(segment);
  }

  function render() {
    setup.hidden = game !== null;
    active.hidden = game === null;
    const finished = game !== null && game.status !== 'playing';
    replay.hidden = !finished;
    input.disabled = finished;
    document.querySelector('#guess-submit').disabled = finished;
    error.textContent = errorKey ? t(errorKey, { limit: formatNumber(game.limit) }) : '';
    input.setAttribute('aria-invalid', String(Boolean(errorKey)));
    feedback.dataset.state = game?.status ?? 'ready';
    feedback.dataset.hint = game?.hint ?? '';
    secret.textContent = finished ? formatNumber(game.secret) : '?';
    document.querySelector('#game-range').textContent = game
      ? t('gameRange', { difficulty: t(difficulties[game.limit]), limit: formatNumber(game.limit) })
      : t('gameRangeReady');

    if (!game) {
      feedbackText.textContent = t('gameReady');
      feedbackIcon.textContent = '↗';
      return;
    }

    const values = { limit: formatNumber(game.limit), secret: formatNumber(game.secret), used: formatNumber(game.used), guess: formatNumber(game.lastGuess ?? 0) };
    document.querySelector('#attempt-count').textContent = `${MAX_ATTEMPTS - game.used} / ${MAX_ATTEMPTS}`;
    progress.setAttribute('aria-valuenow', String(game.used));
    progress.setAttribute('aria-valuetext', t('progressText', values));
    [...progress.children].forEach((segment, index) => segment.classList.toggle('used', index < game.used));
    document.querySelector('#guess-help').textContent = t('guessHelp', values);
    if (game.status === 'won') {
      feedbackText.textContent = t(game.used === 1 ? 'gameWonOne' : 'gameWon', values);
      feedbackIcon.textContent = '✓';
    } else if (game.status === 'lost') {
      feedbackText.textContent = t('gameLost', values);
      feedbackIcon.textContent = '×';
    } else {
      feedbackText.textContent = t(game.hint ?? 'gameStarted', values);
      feedbackIcon.textContent = game.hint === 'tooLow' ? '↑' : game.hint === 'tooHigh' ? '↓' : '↗';
    }
  }

  setup.addEventListener('submit', event => {
    event.preventDefault();
    game = createGame(Number(setup.elements.difficulty.value));
    errorKey = null;
    input.value = '';
    render();
    input.focus();
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!game || game.status !== 'playing') return;
    const result = submitGuess(game, input.value);
    errorKey = result.error ?? null;
    game = result.game;
    render();
    if (game.status !== 'playing') {
      feedback.classList.add('finish');
      replay.focus();
    } else {
      input.focus();
      if (!errorKey) input.select();
    }
  });

  replay.addEventListener('click', () => {
    game = null;
    errorKey = null;
    feedback.classList.remove('finish');
    render();
    setup.querySelector('input:checked').focus();
  });
  document.addEventListener('languagechange', render);
  render();
}
