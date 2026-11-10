import { initLanguage, t, formatNumber } from './i18n.js';
import { initCalculator, calculate, symbols } from './calculadora.js';
import { initGame } from './adivinhacao.js';
import { initTraditionalCalculator, initCalculatorModes } from './tradicional.js';

const routes = new Set(['inicio', 'calculadora', 'adivinhacao']);

let navigationVersion = 0;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

async function navigate(moveFocus = false) {
  const requested = window.location.hash.slice(1);
  const route = routes.has(requested) ? requested : 'inicio';
  // Keep the native skip link functional, without treating it as a new view.
  if (requested === 'main') {
    document.querySelector('#main').focus();
    return;
  }
  const version = ++navigationVersion;
  const previous = document.querySelector('.page:not([hidden])');
  document.querySelectorAll('.page').forEach(section => {
    section.classList.remove('is-entering', 'is-leaving');
    section.inert = false;
  });
  if (moveFocus && previous?.id !== route && !reducedMotion.matches) {
    previous?.classList.add('is-leaving');
    if (previous) previous.inert = true;
    await new Promise(resolve => setTimeout(resolve, 140));
    if (version !== navigationVersion) return;
  }
  document.querySelectorAll('.page').forEach(section => { section.hidden = section.id !== route; });
  const current = document.getElementById(route);
  current.inert = false;
  if (moveFocus && !reducedMotion.matches) current.classList.add('is-entering');
  document.querySelectorAll('[data-route]').forEach(link => {
    if (link.dataset.route === route) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  if (moveFocus) {
    document.querySelector(`#${route} h1`).focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}

initLanguage();
initCalculator();
initGame();
initTraditionalCalculator();
initCalculatorModes();
initHero();
const compactLayout = window.matchMedia('(max-width: 640px)');
function adaptInstructions() {
  document.querySelectorAll('details.instructions').forEach(details => { details.open = !compactLayout.matches; });
}
adaptInstructions();
compactLayout.addEventListener('change', adaptInstructions);
navigate();
window.addEventListener('hashchange', () => navigate(true));
document.querySelector('.skip-link').addEventListener('click', event => {
  event.preventDefault();
  document.querySelector('#main').focus();
  window.scrollTo({ top: 0, behavior: 'instant' });
});

const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
document.querySelectorAll('[data-spotlight]').forEach(card => {
  let frame;
  card.addEventListener('pointermove', event => {
    if (!finePointer.matches || reducedMotion.matches) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const bounds = card.getBoundingClientRect();
      card.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`);
      card.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`);
    });
  });
  card.addEventListener('pointerleave', () => { cancelAnimationFrame(frame); });
});

function initHero() {
  const scene = document.querySelector('.experience-scene');
  const tabs = [...scene.querySelectorAll('[data-preview]')];
  const operations = [...scene.querySelectorAll('[data-demo-operation]')];
  const levels = [...scene.querySelectorAll('[data-demo-limit]')];
  const effects = document.querySelector('#effects-toggle');
  let operation = 'multiply';
  let limit = 100;
  let paused = false;
  let visible = true;
  let frame;

  function render() {
    document.querySelector('#preview-equation').textContent = `24 ${symbols[operation]} 8`;
    document.querySelector('#preview-result').textContent = formatNumber(calculate(24, 8, operation).value);
    document.querySelector('#preview-range').textContent = t('previewInterval', { limit: formatNumber(limit) });
    operations.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.demoOperation === operation)));
    levels.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.demoLimit) === limit)));
    document.querySelector('#effects-label').textContent = t(reducedMotion.matches ? 'reducedEffects' : paused ? 'resumeEffects' : 'pauseEffects');
    document.querySelector('#effects-symbol').textContent = paused ? '▷' : 'Ⅱ';
    effects.setAttribute('aria-pressed', String(paused || reducedMotion.matches));
    effects.disabled = reducedMotion.matches;
    scene.dataset.motion = paused || reducedMotion.matches || !visible ? 'paused' : 'active';
    if (scene.dataset.motion === 'paused') resetDepth();
  }
  function resetDepth() {
    cancelAnimationFrame(frame);
    scene.style.setProperty('--scene-x', '0px');
    scene.style.setProperty('--scene-y', '0px');
  }
  function select(tab, moveFocus = false) {
    tabs.forEach(button => {
      const selected = button === tab;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      document.getElementById(button.getAttribute('aria-controls')).hidden = !selected;
    });
    scene.dataset.experience = tab.dataset.preview;
    if (moveFocus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      select(tabs[event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + 1) % tabs.length], true);
    });
  });
  operations.forEach(button => button.addEventListener('click', () => { operation = button.dataset.demoOperation; render(); }));
  levels.forEach(button => button.addEventListener('click', () => { limit = Number(button.dataset.demoLimit); render(); }));
  effects.addEventListener('click', () => { paused = !paused; render(); });
  scene.addEventListener('pointermove', event => {
    if (paused || reducedMotion.matches || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const bounds = scene.getBoundingClientRect();
      scene.style.setProperty('--scene-x', `${((event.clientX - bounds.left) / bounds.width - .5) * 20}px`);
      scene.style.setProperty('--scene-y', `${((event.clientY - bounds.top) / bounds.height - .5) * 16}px`);
    });
  });
  scene.addEventListener('pointerleave', resetDepth);
  reducedMotion.addEventListener('change', render);
  document.addEventListener('languagechange', render);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; render(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; render(); }, { threshold: 0 }).observe(scene);
  }
  render();
}
