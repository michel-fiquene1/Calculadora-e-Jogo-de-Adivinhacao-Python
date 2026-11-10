import { calculate, symbols } from './calculadora.js';
import { t, getLanguage, formatNumber } from './i18n.js';

export function createCalculator() {
  return { entry: '0', accumulator: null, operator: null, waiting: false, result: false, repeat: null, trace: null, error: null, notice: null };
}

function compute(first, second, operation) {
  const answer = calculate(first, second, operation);
  // Keep arithmetic and the displayed precision in agreement, including 0.1 + 0.2.
  if (answer.error) return answer;
  const value = Number(answer.value.toPrecision(15));
  return Number.isFinite(value) ? { value } : { error: 'overflow' };
}

export function pressKey(previous, key) {
  if (key === 'clear') return createCalculator();
  const editing = /^\d$/.test(key) || ['decimal', 'sign', 'backspace'].includes(key);
  if (previous.error && !editing) return previous;
  const state = { ...(previous.error ? createCalculator() : previous), notice: null };
  if (/^\d$/.test(key) || key === 'decimal') {
    const reset = state.waiting || state.result || /e/i.test(state.entry);
    const entry = reset ? '0' : state.entry;
    if (key === 'decimal') {
      if (entry.includes('.')) return state;
      return { ...state, entry: entry + '.', waiting: false, result: false, trace: null, repeat: null };
    }
    if (entry.replace(/[^\d]/g, '').length >= 15 && !['0', '-0'].includes(entry)) return { ...state, notice: 'digitLimit' };
    const next = entry === '0' ? key : entry === '-0' ? (key === '0' ? '-0' : '-' + key) : entry + key;
    return { ...state, entry: next, waiting: false, result: false, trace: null, repeat: null };
  }
  if (key === 'sign') {
    const entry = state.waiting ? '0' : state.entry;
    return { ...state, entry: entry.startsWith('-') ? entry.slice(1) : '-' + entry, waiting: false, result: false, repeat: null, trace: null };
  }
  if (key === 'backspace') {
    const entry = state.waiting || state.result || /e/i.test(state.entry) ? '0' : state.entry.slice(0, -1);
    return { ...state, entry: !entry || entry === '-' ? '0' : entry, waiting: false, result: false, repeat: null, trace: null };
  }
  if (Object.hasOwn(symbols, key)) {
    if (state.operator && state.waiting) return { ...state, operator: key };
    let value = Number(state.entry);
    if (state.operator) {
      const answer = compute(state.accumulator, value, state.operator);
      if (answer.error) return { ...createCalculator(), error: answer.error };
      value = answer.value;
    }
    return { ...state, entry: String(value), accumulator: value, operator: key, waiting: true, result: false, trace: null, repeat: null };
  }
  if (key === 'equals') {
    const operation = state.operator ?? (state.result ? state.repeat?.operation : null);
    if (!operation) return { ...state, result: true, waiting: false };
    const first = state.operator ? state.accumulator : Number(state.entry);
    const second = state.operator ? Number(state.entry) : state.repeat.operand;
    const answer = compute(first, second, operation);
    if (answer.error) return { ...createCalculator(), error: answer.error };
    return { ...createCalculator(), entry: String(answer.value), result: true, trace: { first, second, operation }, repeat: { operation, operand: second } };
  }
  return previous;
}

export function formatEntry(state) {
  if (state.error) return '—';
  if (state.result || state.waiting || /e/i.test(state.entry)) return formatNumber(Number(state.entry));
  return getLanguage() === 'pt-BR' ? state.entry.replace('.', ',') : state.entry;
}

export function initTraditionalCalculator() {
  const panel = document.querySelector('#traditional-panel');
  const output = document.querySelector('#traditional-result');
  const expression = document.querySelector('#traditional-expression');
  const status = document.querySelector('#traditional-status');
  const buttons = [...panel.querySelectorAll('[data-key]')];
  let state = createCalculator();
  let feedbackTimer;

  function render() {
    output.textContent = formatEntry(state);
    output.dataset.long = String(output.textContent.length > 13);
    document.querySelector('#traditional-screen').classList.toggle('is-error', Boolean(state.error));
    document.querySelector('#decimal-key').textContent = getLanguage() === 'pt-BR' ? ',' : '.';
    expression.textContent = state.trace
      ? `${formatNumber(state.trace.first)} ${symbols[state.trace.operation]} ${formatNumber(state.trace.second)} =`
      : state.operator ? `${formatNumber(state.accumulator)} ${symbols[state.operator]}` : '';
    status.textContent = t(state.error ?? state.notice ?? (state.result ? 'calcDone' : 'traditionalReady'));
    buttons.filter(button => Object.hasOwn(symbols, button.dataset.key)).forEach(button => {
      button.setAttribute('aria-pressed', String(state.waiting && state.operator === button.dataset.key));
    });
  }
  function activate(key, fromKeyboard = false) {
    state = pressKey(state, key);
    render();
    if (fromKeyboard) {
      clearTimeout(feedbackTimer);
      buttons.forEach(button => button.classList.toggle('key-feedback', button.dataset.key === key));
      feedbackTimer = setTimeout(() => buttons.forEach(button => button.classList.remove('key-feedback')), 130);
    }
  }
  panel.addEventListener('click', event => {
    const button = event.target.closest('[data-key]');
    if (button) activate(button.dataset.key);
  });
  panel.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
    // Preserve native Enter/Space activation on focused buttons for keyboard access.
    if (event.key === 'Enter' && event.target.closest('button')) return;
    const keys = { '+': 'add', '-': 'subtract', '*': 'multiply', '/': 'divide', '.': 'decimal', ',': 'decimal', Enter: 'equals', '=': 'equals', Escape: 'clear', c: 'clear', C: 'clear', Backspace: 'backspace', Delete: 'backspace', F9: 'sign' };
    const key = /^\d$/.test(event.key) ? event.key : keys[event.key];
    if (!key) return;
    event.preventDefault();
    activate(key, true);
  });
  document.addEventListener('languagechange', render);
  render();
}

export function initCalculatorModes() {
  const tabs = [...document.querySelectorAll('[data-calc-mode]')];
  function select(tab, focus = false) {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      select(tab);
      if (tab.dataset.calcMode === 'classic') document.querySelector('#traditional-panel').focus({ preventScroll: true });
    });
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      select(tabs[event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + 1) % tabs.length], true);
    });
  });
}
