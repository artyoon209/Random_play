
let osc, reverb;
let dots = [];
let isRunning = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  noFill();
  strokeWeight(2);

  osc = new p5.Oscillator('sine');
  osc.start();
  osc.amp(0);

  reverb = new p5.Reverb();
  osc.disconnect();
  osc.connect(reverb);
  reverb.process(osc, 0.2 , 0.2);

  for (let i = 0; i < 3; i++) {
    createRandomObject();
  }
}

function scheduleNext() {
  if (!isRunning) return;
  let delay = random(200, 250);
  for (let i = 0; i < 2; i++) createRandomObject();
  setTimeout(scheduleNext, delay);
}

function draw() {
  background(0, 20);
  for (let dot of dots) {
    dot.update(dots);
    dot.display();
  }
}

function toggleRunning() {
  isRunning = !isRunning;
  if (isRunning) {
    scheduleNext();
  }
}

function mousePressed() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
  toggleRunning();
}

function createRandomObject() {
  let x, y, newDot;
  let overlapping = true;
  while (overlapping) {
    x = random(width);
    y = random(height);
    newDot = new Dot(x, y);
    overlapping = false;
    for (let dot of dots) {
      if (dist(newDot.pos.x, newDot.pos.y, dot.pos.x, dot.pos.y) < newDot.radius + dot.radius) {
        overlapping = true;
        break;
      }
    }
  }
  dots.push(newDot);

  let freq = random(150, 160);
  let dur = 0.08;
  osc.freq(freq);
  osc.amp(1, 0.01);
  setTimeout(() => {
    osc.amp(0, 0.1);
  }, dur * 200);
}

class Dot {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.baseRadius = 5;
    this.radius = this.baseRadius;
    this.targetRadius = random(20, 70);
    this.growthSpeed = 6;
    this.color = random([
    color(255, 120, 120),   // 연빨강
    color(255, 190, 110),   // 살구 주황
    color(255, 250, 150),   // 연노랑
    color(160, 230, 180),   // 민트초록
    color(150, 200, 255),   // 하늘파랑
    color(170, 140, 255),   // 연보라남색
    color(210, 160, 255)    // 연보라
]);

    this.locked = false;
    this.shapePoints = [];
  }

  update(others) {
    if (this.locked) return;

    let canGrow = true;
    for (let other of others) {
      if (other === this) continue;
      let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
      if (d < this.radius + other.radius - 6) {
        canGrow = false;
        break;
      }
    }

    if (canGrow && this.radius < this.targetRadius) {
      this.radius += this.growthSpeed;
    } else {
      this.locked = true;
      this.captureShape(others);
    }
  }

  captureShape(others) {
    this.shapePoints = [];
    for (let i = 0; i <= 36; i++) {
      let angle = TWO_PI * i / 36;
      let x = cos(angle);
      let y = sin(angle);
      let r = this.radius;

      for (let other of dots) {
        if (other === this) continue;
        let testPoint = p5.Vector.add(this.pos, createVector(x, y).mult(this.radius));
        let d = dist(testPoint.x, testPoint.y, other.pos.x, other.pos.y);
        if (d < this.radius + other.radius - 2) {
          r -= map(this.radius + other.radius - d, 0, this.radius, 0, 20);
        }
      }

      let vx = this.pos.x + x * r;
      let vy = this.pos.y + y * r;
      this.shapePoints.push(createVector(vx, vy));
    }
  }

  display() {
    stroke(this.color);
    beginShape();
    let points = this.locked && this.shapePoints.length > 0 ? this.shapePoints : this.generateShapePoints();
    for (let pt of points) {
      curveVertex(pt.x, pt.y);
    }
    endShape(CLOSE);
  }

  generateShapePoints() {
    let shape = [];
    for (let i = 0; i <= 36; i++) {
      let angle = TWO_PI * i / 36;
      let x = cos(angle);
      let y = sin(angle);
      let r = this.radius;

      for (let other of dots) {
        if (other === this) continue;
        let testPoint = p5.Vector.add(this.pos, createVector(x, y).mult(this.radius));
        let d = dist(testPoint.x, testPoint.y, other.pos.x, other.pos.y);
        if (d < this.radius + other.radius - 2) {
          r -= map(this.radius + other.radius - d, 0, this.radius, 0, 20);
        }
      }

      let vx = this.pos.x + x * r;
      let vy = this.pos.y + y * r;
      shape.push(createVector(vx, vy));
    }
    return shape;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
