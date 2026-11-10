import { t, formatNumber } from './i18n.js';

export const symbols = Object.freeze({ add: '+', subtract: '−', multiply: '×', divide: '÷' });

// Accept a decimal point or comma, but never grouping separators or partial input.
export function parseNumber(raw) {
  const text = raw.trim();
  if (!text) return { error: 'required' };
  if (!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:[eE][+-]?\d+)?$/.test(text)) {
    return { error: 'invalidNumber' };
  }
  const value = Number(text.replace(',', '.'));
  return Number.isFinite(value) ? { value } : { error: 'invalidNumber' };
}

export function calculate(first, second, operation) {
  if (!Number.isFinite(first) || !Number.isFinite(second)) return { error: 'invalidNumber' };
  if (operation === 'divide' && second === 0) return { error: 'divideZero' };
  let value;
  switch (operation) {
    case 'add': value = first + second; break;
    case 'subtract': value = first - second; break;
    case 'multiply': value = first * second; break;
    case 'divide': value = first / second; break;
    default: throw new Error('Unknown operation');
  }
  if (!Number.isFinite(value)) return { error: 'overflow' };
  return { value: Object.is(value, -0) ? 0 : value };
}

export function initCalculator() {
  const form = document.querySelector('#calc-form');
  const fields = [document.querySelector('#first-number'), document.querySelector('#second-number')];
  const errors = [document.querySelector('#first-error'), document.querySelector('#second-error')];
  const screen = document.querySelector('.result-screen');
  const output = document.querySelector('#calc-result');
  const expression = document.querySelector('#calc-expression');
  const status = document.querySelector('#calc-status');
  let state = { message: 'calcReady', errors: [], result: null, calculation: null };

  function render() {
    errors.forEach((element, index) => {
      element.textContent = state.errors[index] ? t(state.errors[index]) : '';
      fields[index].setAttribute('aria-invalid', String(Boolean(state.errors[index])));
    });
    screen.classList.toggle('is-error', state.errors.some(Boolean) || state.message === 'overflow');
    output.textContent = state.result === null ? '—' : formatNumber(state.result);
    if (state.message === 'calcReady') output.textContent = '0';
    output.dataset.long = String(output.textContent.length > 13);
    expression.textContent = state.calculation
      ? `${formatNumber(state.calculation.first)} ${symbols[state.calculation.operation]} ${formatNumber(state.calculation.second)} =`
      : '';
    status.textContent = t(state.message);
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const parsed = fields.map(field => parseNumber(field.value));
    state = { message: 'calcFix', errors: parsed.map(item => item.error), result: null, calculation: null };
    if (state.errors.some(Boolean)) {
      render();
      fields[state.errors.findIndex(Boolean)].focus();
      return;
    }
    const operation = form.elements.operation.value;
    const [first, second] = parsed.map(item => item.value);
    const result = calculate(first, second, operation);
    if (result.error) {
      state.message = result.error;
      if (result.error === 'divideZero') state.errors[1] = result.error;
    } else {
      state.message = 'calcDone';
      state.result = result.value;
      state.calculation = { first, second, operation };
    }
    render();
    if (state.errors[1]) fields[1].focus();
  });

  form.addEventListener('change', event => {
    if (event.target.name === 'operation') document.querySelector('#operation-preview').textContent = symbols[event.target.value];
  });

  document.querySelector('#clear-calc').addEventListener('click', () => {
    form.reset();
    state = { message: 'calcReady', errors: [], result: null, calculation: null };
    document.querySelector('#operation-preview').textContent = symbols.add;
    render();
    fields[0].focus();
  });

  document.addEventListener('languagechange', render);
  render();
}
