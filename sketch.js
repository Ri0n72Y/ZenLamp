// color schemes
const SCHEMES = {
  red: ['#ff867c', '#ef5350', '#b61827'],
  pink: ['#ffc1e3', '#f48fb1', '#bf5f82'],
  purple: ['#ffc4ff', '#ce93d8', '#9c64a6'],
  skyblue: ['#72e7ff', '#28b5f4', '#0085c1'],
  cyan: ['#b4ffff', '#80deea', '#4bacb8'],
  teal: ['#b2fef7', '#80cbc4', '#4f9a94'],
  green: ['#98ee99', '#66bb6a', '#338a3e'],
  lime: ['#ffffce', '#e6ee9c', '#b3bc6d'],
  yellow: ['#ffffcf', '#fff59d', '#cbc26d'],
  orange: ['#ffffb0', '#ffcc80', '#ca9b52'],
  blue: ['#302F7A', '#ABAAFA', '#625FFA', '#54537A', '#4E4CC7'],
  custom: [],
  grave: '#e0e0e0',
};

const initialState = {
  mean: 4, dev: 1, speed: 5, rise: 16, 
}
var state = {

}
var currentScheme, currentBottle;
var THEME = 'light'; // 'dark'|'light'
var MODE = 'zen'; //'zen'|'regular'
// physics
const RESISTANCE = 0.02, SMOKE_RESISTANCE = 0.01;
const SMOOTH_FACTOR = 0.2;
var MIN_SPEED = 2, SPEED = 5;
var RISE = 16;
// limit for performance opimization
const SKIP = 2;
const FR = 60;
// object consts
const MIN_SMOKE_SIZE = 0.5 + 0.1;
const MIN_SMOKER_SPEED = 0.05;
const SMOKE_SIZE_REGULAR = 5;
const SMOKER_SIZE = { rMean: 6, rDev: 2, lMean: 12, lDev: 2 };
const DENSITY = { mean: 4, dev: 1 };
const LIFE = { mean: 60, dev: 20 }; // in seconds
const CORPSE_DISAPPEAR_RATE = 10; // divider of living time
const SENESCENSE = 0.05; // possible to death at the final 20% of life
// public variables
var BORDER, BOTTLE;
const BOTTOM = 0.76;
const PADDING = 40;
var STARTPOINT;
var SPAWNER;
var smokers, floaters;

const w = (a) => a ? windowWidth * a : windowWidth;
const h = (a) => a ? windowHeight * a : windowHeight;
const floatUp = (a) => RISE / Math.sqrt(a);
const decrease = (a) => Math.exp(-0.002 * a);
const colorDec = (a) => Math.exp(1 - a * 0.005);
const randAcc = () => {
  const v = createVector(random(-1, 1), random(-1, 1)).normalize();
  v.x *= random(MIN_SPEED, SPEED);
  v.y *= random(0, 1)
  return v;
};
const randSize = () => {
  return {
    r: intND(SMOKER_SIZE.rMean, SMOKER_SIZE.rDev),
    l: intND(SMOKER_SIZE.lMean, SMOKER_SIZE.lDev),
  }
}
const randLife = () => intND(LIFE.mean, LIFE.dev) * FR + Math.round(Math.random() * FR);


function setup() {
  createCanvas(windowWidth, windowHeight);
  // put setup code here
  background(30);
  frameRate(FR);
  angleMode(DEGREES)

  // constant initialization
  BORDER = { xmin: 0, ymin: 0, xmax: w(), ymax: h() };
  const isSlim = windowWidth < 900
  BOTTLE = {
    xmin: w(isSlim ? 0.12 : 0.3),
    ymin: h(BOTTOM - 0.03),
    xmax: w(isSlim ? 0.88 : 0.7),
    ymax: h(BOTTOM + 0.1)
  };
  STARTPOINT = { x: windowWidth * 0.5, y: windowHeight * (BOTTOM + 0.08) }
  currentScheme = 'green';
  currentBottle = 'square';
  SPAWNER = new Spawner();
  smokers = new Array(); floaters = new Array();
  loadState();
  window.onbeforeunload = () => saveState();
}

function draw() {
  // put drawing code here
  background(THEME === 'dark' ? 20 : 240);

  smokers.forEach(e => {
    e.draw();
    e.update();
  });
  smokers = smokers.filter(e => !e.destroy);

  if (frameCount % (10) === 0) {
    const newComing = SPAWNER.spawn();
    if (newComing !== undefined) smokers.push(newComing);
  }
  if (smokers.length > (DENSITY.mean + DENSITY.dev * 3)) {
    smokers = smokers.slice(0, DENSITY.mean + DENSITY.dev * 3)
  }

  Bottle(currentBottle);
  checkMouseMenu();
}


// Statics 
function Bottle(shape) {
  const c = color(
    SCHEMES[currentScheme][
    THEME === 'dark' ? 0
      : (THEME === 'light' ? 2 : 0)]);
  const b = BOTTLE, p = PADDING;
  const weight = 2;
  switch (shape) {
    case 'square':
      push()
      noFill()
      //c.setAlpha(158)
      stroke(c)
      strokeWeight(weight + 0.2)

      const lx = b.xmin, rx = b.xmax;
      const ty = h(0.1), by = h(BOTTOM + 0.1);
      // left
      curve(
        lx + p * 8, ty + p,
        lx, ty,
        lx - p, by - p * 1.5,
        lx, h()
      );
      // right
      curve(
        rx - p * 8, ty + p,
        rx, ty,
        rx + p, by - p * 1.5,
        rx, h()
      );
      // bottom
      curve(
        lx - p, by - p * 1.5,
        lx + p, by + p * 0.5,
        rx - p, by + p * 0.5,
        rx + p, by - p * 1.5
      );
      // bottom left corner
      curve(lx + p * 0.5, by - p * 6.5,
        lx - p, by - p * 1.5,
        lx + p, by + p * 0.5,
        lx + p * 6.5, by + p * 0.5
      )
      // bottom right corner
      curve(rx - p * 0.5, by - p * 6.5,
        rx + p, by - p * 1.5,
        rx - p, by + p * 0.5,
        rx - p * 6.5, by + p * 0.5
      )

      /*
      strokeWeight(1)
      for (let i = 1; i < 50; i++) {
        const aby = by - i
        c.setAlpha(100 - i * 2)
        stroke(c);
        // bottom
        curve(
          lx - p, aby - p * 1.5,
          lx + p, aby + p * 0.5,
          rx - p, aby + p * 0.5,
          rx + p, aby - p * 1.5
        );
        // bottom left corner
        curve(lx + p * 0.5, by - p * 6.5,
          lx - p, aby - p * 1.5,
          lx + p, aby + p * 0.5,
          lx + p * 6.5, by + p * 0.5
        )
        // bottom right corner
        curve(rx - p * 0.5, aby - p * 6.5,
          rx + p, aby - p * 1.5,
          rx - p, aby + p * 0.5,
          rx - p * 6.5, aby + p * 0.5
        )
      }*/

      pop()
      return;

    default:
      return;
  }
}

// Dynamics
function Spawner() {
  this.regularIndex = 0;
  this.spawn = () => {
    const factor = intND(DENSITY.mean, DENSITY.dev);
    if (factor > smokers.length) {
      return MODE === 'zen'
        ? this.spawnSmoker()
        : this.spawnSmokerRegular();
    } else {
      return undefined;
    }
  }
  this.spawnSmokerRegular = () => {
    const color = SCHEMES[currentScheme][this.regularIndex % SCHEMES[currentScheme].length];
    this.regularIndex++;
    const s = STARTPOINT;
    return new Smoker(color, createVector(s.x, s.y),
      createVector(SPEED, 0),
      { r: SMOKE_SIZE_REGULAR, l: SMOKE_SIZE_REGULAR },
      0);
  }
  this.spawnSmoker = () => {
    /*
    const randI = random(0, 100) % currentScheme.length;
    const color = currentScheme[Math.floor(randI)];
    */
    const color = SCHEMES[currentScheme][this.regularIndex % SCHEMES[currentScheme].length];;
    this.regularIndex++;
    const s = STARTPOINT;
    return new Smoker(color, createVector(s.x, s.y),
      randAcc(), randSize(), randLife());
  }
}

/**
 * 
 * @param {p5.Color} scheme 
 */
function Smoker(scheme, pos, acc, size, life) {
  this.pos = pos;
  this.scheme = scheme;
  this.alpha = 255;
  this.smokes = [];
  this.speed = createVector();
  this.age = 0;
  this.size = size;
  this.life = life;
  this.alive = true;
  this.isHidden = false;
  this.destroy = false;
  this.acc = MODE === 'zen' ? acc : createVector(SPEED);
  this._growth = () => {
    this.age++;
    const v = (this.life - this.age) / this.life
    this.alive = v >= SENESCENSE || (Math.random() * SENESCENSE) > v;
  }
  this._smoke = () => new Smoke(
    createVector(this.pos.x, this.pos.y),
    this.size.l,
    this.scheme,
    this.speed);
  this._lifeCycle = () => {
    this._growth();
    this.speed = p5.Vector.add(this.speed, this.acc); // update speed
    const nextPos = p5.Vector.add(this.pos, this.speed); // update position
    if (nextPos.x > BOTTLE.xmax
      || nextPos.x < BOTTLE.xmin
      || nextPos.y > BOTTLE.ymax
      || nextPos.y < BOTTLE.ymin) {
      this.speed = createVector();
    } else {
      this.pos = nextPos
    }
    if (this.speed.mag() > MIN_SMOKER_SPEED) { // update acc by resistance
      const resist = this.speed.normalize().mult(-RESISTANCE);
      // console.log(`resist x:${resist.x} y:${resist.y} speed x:${this.speed.x} y:${this.speed.y} acc x:${this.acc.x} y:${this.acc.y}`);
      this.acc = p5.Vector.add(resist, this.acc);
    } else {
      this.acc = randAcc();
    }
    if (frameCount % SKIP === 0)
      this.smokes.push(this._smoke());
  }
  this._deathCycle = () => {
    this.life = 0; // max(this.life - CORPSE_DISAPPEAR_RATE, 0);
    if (this.life === 0) this.isHidden = true;
    const alpha = Math.round((this.life / this.age) * 255);
    this.alpha = alpha;
  }

  this._regular = () => { // behavior on regular mode
    const next = this.pos.x + this.acc.x;
    if (next < BOTTLE.xmin || next > BOTTLE.xmax)
      this.acc.x = - this.acc.x;
    this.pos.x = next;
    if (frameCount % SKIP === 0)
      this.smokes.push(this._smoke());
  }
  this._zen = () => { // behavior on zen mode
    if (this.isHidden) { // life here start at 0
      if (this.smokes.length === 0) this.destroy = true;
    } else if (this.alive) {
      this._lifeCycle();
    } else if (this.life > 0) {
      this._deathCycle();
    } else if (!this.isHidden) {
      this.isHidden = true;
    } else { // logically we should not reach this place
      console.log('error', this.debug);
    }
  }
  this.update = () => {
    this.smokes = this.smokes.filter(e => e.alive); // remove dead smokes
    // update smokes
    //this.smokes[0]?.update()
    const l = this.smokes.length;
    for (let i = 0; i < l; i++) { // draw smokes
      const smoke = this.smokes[i];
      smoke.update();
      if (MODE === 'zen')
        if (i > 0 && i < l - 1) {
          const prev = this.smokes[i - 1];
          const next = this.smokes[i + 1];
          const a = p5.Vector.sub(prev.pos, smoke.pos).mult(SMOOTH_FACTOR);
          const b = p5.Vector.sub(next.pos, smoke.pos).mult(SMOOTH_FACTOR);
          const drag = a.add(b);
          smoke.pos.add(drag);
        } else if (l > 1 && i === 0) {
          const next = this.smokes[i + 1];
          const drag = p5.Vector.sub(next.pos, smoke.pos).mult(SMOOTH_FACTOR);
          smoke.pos.add(drag);
        } else if (!this.alive && l > 1 && i === l - 1) {
          const prev = this.smokes[i - 1];
          const drag = p5.Vector.sub(prev.pos, smoke.pos);//.mult(SMOOTH_FACTOR);
          smoke.pos.add(drag);
        }
    }


    switch (MODE) {
      case 'zen': this._zen(); break;
      case 'regular': this._regular(); break;
      default: this._zen(); break;
    }
  }
  this.draw = () => {
    const p = this.pos; const s = this.size;
    if (this.alive && this.smokes.length > 0) { // draw line from body to last smoke
      push();
      stroke(this.scheme);
      strokeWeight(Math.max(this.smokes[this.smokes.length - 1].size, 1));
      line(p.x, p.y, this.smokes[this.smokes.length - 1].pos.x, this.smokes[this.smokes.length - 1].pos.y);
      pop();
    }
    for (let i = 0; i < this.smokes.length - 1; i++) { // draw smokes
      const smoke = this.smokes[i];
      const next = this.smokes[i + 1];
      //if (p5.Vector.sub(smoke.pos,next.pos).magSq() > 100) return;
      push();
      const c = color(this.scheme);
      c.setAlpha(smoke.alpha);
      stroke(c);
      strokeWeight(smoke.size)//(Math.max(smoke.size, 1));
      line(smoke.pos.x, smoke.pos.y, next?.pos.x, next?.pos.y);
      pop();
    }
    if (!this.isHidden) { // draw body
      push();
      noStroke();
      if (!this.alive) {
        const c = color(SCHEMES.grave);
        c.setAlpha(this.alpha);
        fill(c);
        ellipse(p.x, p.y, s.l, s.l);
      }
      const c = color(this.scheme);
      c.setAlpha(this.alpha);
      fill(c);
      ellipse(p.x, p.y, s.l, s.l);
      pop();
    }
  }
  this.debug = () => {
    return [this.smokes.length].concat(this.smokes[0]?.console());
  }
}

/**
 * 
 * @param {p5.Vector} pos start position
 * @param {number} size initial size
 * @param {p5.Color} scheme 
 * @param {p5.Vector} xSpeed initial speed
 */
function Smoke(pos, size, scheme, speed) {
  this.pos = pos;
  this.size = size;
  this.speed = speed;
  this.age = 1;
  this.alpha = 255;
  this.scheme = scheme;
  this.alive = true;
  this.update = () => {
    if (!this.alive) return;
    this.age++;
    this.alpha = 255 * colorDec(this.age);
    const bymin = h(BOTTOM + 0.1) + PADDING * 0.3;
    this.pos.y = Math.min(bymin, this.pos.y - floatUp(this.age));

    if (this.speed.mag() > 0) {
      //this.pos.x += this.speed.x;
      this.pos = p5.Vector.add(this.pos, this.speed);
      const scalar = Math.max(this.speed.mag() - SMOKE_RESISTANCE, 0);
      this.speed.setMag(scalar);
    }

    this.size = this.size * decrease(this.age) + 0.5;
    if (this.size < MIN_SMOKE_SIZE || this.outBorder()) {
      this.alive = false;
    }
  }

  this.debug = () => {
    return [this.pos.y, this.alive, -floatUp(this.age), this.age, this.size];
  }
  this.outBorder = () => {
    const x = this.pos.x, y = this.pos.y; const b = BORDER;
    return x < b.xmin || x > b.xmax || y < b.ymin || y > b.ymax;
  }
}


