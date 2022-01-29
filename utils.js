
function loadState() {
  const s = window.localStorage.getItem('state');
  if (s) {
    const state = JSON.parse(s);
    THEME = state.theme;
    MODE = state.mode;
    DENSITY.mean = state.mean;
    DENSITY.dev = state.dev;
    SPEED = state.speed; RISE = state.rise;

    currentScheme = state.scheme;
    document.getElementById('scheme-sel').value = currentScheme;

    document.getElementById("theme").innerText = THEME === 'dark' ? 'Dark' : 'Light';
    const t = document.getElementsByClassName('tools').item(0);
    if (THEME === 'dark') t.classList.toggle('dark');
    document.getElementById("mode").innerText = MODE === 'zen' ? 'Zen' : 'Order';
    document.getElementById('mean').innerText = DENSITY.mean;
    document.getElementById('dev').innerText = DENSITY.dev;
    document.getElementById('speed').innerText = SPEED;
    document.getElementById('rise').innerText = RISE;
  }
}

function resetState() {
  const state = initialState
  DENSITY.mean = state.mean;
  DENSITY.dev = state.dev;
  SPEED = state.speed; RISE = state.rise;
  document.getElementById('mean').innerText = DENSITY.mean;
  document.getElementById('dev').innerText = DENSITY.dev;
  document.getElementById('speed').innerText = SPEED;
  document.getElementById('rise').innerText = RISE;
}

function saveState() {
  const state = {
    scheme: currentScheme,
    theme: THEME,
    mode: MODE,
    mean: DENSITY.mean,
    dev: DENSITY.dev,
    speed: SPEED,
    rise: RISE,
  }
  window.localStorage.removeItem('state');
  window.localStorage.setItem('state', JSON.stringify(state));
}

function checkMouseMenu() {
  if (mouseY > h(windowWidth < 900 ? 0.6 : 0.9)) {
    const d = document.getElementsByClassName('tools').item(0);
    if (d.classList.contains('hide'))
      d.classList.remove('hide');
  } else {
    const d = document.getElementsByClassName('tools').item(0);
    if (!d.classList.contains('hide'))
      d.classList.add('hide');
  }
}

function switchTheme() {
  const d = document.getElementById("theme");
  if (d.innerText === 'Light') {
    THEME = 'dark';
    d.innerText = 'Dark';
  } else if (d.innerText === 'Dark') {
    THEME = 'light';
    d.innerText = 'Light';
  }
  const t = document.getElementsByClassName('tools').item(0);
  t.classList.toggle('dark');

}

function switchMode() {
  const d = document.getElementById("mode");
  if (d.innerText === 'Zen') {
    MODE = 'regular';
    d.innerText = 'Order';
  } else if (d.innerText === 'Order') {
    MODE = 'zen';
    d.innerText = 'Zen';
  }
}

function clearSmokers() {
  smokers = [];
}

function selectColorScheme(c) {
  console.log(c)
  currentScheme = c;
  clearSmokers();
}

function onClickDigitChange(mode, name) {
  const a = mode === '+' ? 1 : -1;
  var res = 0;
  switch (name) {
    case 'mean': DENSITY.mean += a; res = DENSITY.mean; break;
    case 'dev': DENSITY.dev += a; res = DENSITY.dev; break;
    case 'speed': SPEED += a; res = SPEED; break;
    case 'rise': RISE += a; res = RISE; break;
    default: return;
  }
  const d = document.getElementById(name);
  d.innerText = res;
}

/**
 * Box-Muller Transform in Polar form
 * @returns a number follows the normal distribution
 */
function randomND() {
  var u = 0.0, v = 0.0, w = 0.0;
  do {
    u = Math.random() * 2 - 1;
    v = Math.random() * 2 - 1;
    w = u * u + v * v;
  } while (w === 0 || w >= 1)
  const c = Math.sqrt((-2 * Math.log(w)) / w);
  return u * c; // v * c;
}

/**
 * 
 * @param {number} mean 
 * @param {number} stdDev 
 * @returns random number 
 */
const getND = (mean, stdDev) => mean + stdDev * randomND();
const intND = (m, d) => Math.round(getND(m, d));