
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

    // ✨ 밝은 파스텔톤 계열로 수정
    this.color = random([
      color(255, 230, 230),  // 밝은 핑크
      color(255, 255, 200),  // 아이보리 옐로우
      color(220, 250, 255),  // 연한 하늘
      color(230, 220, 255),  // 연보라
      color(240, 255, 250),  // 민트화이트
      color(255, 255, 255)   // 흰색
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
    let points = this.locked && this.shapePoints.length > 0
      ? this.shapePoints
      : this.generateShapePoints();

    // ✨ 글로우 효과용 외곽선 (투명도 낮은 굵은 선 여러 겹)
    for (let g = 10; g > 0; g--) {
      let glow = color(this.color);
      glow.setAlpha(5 * g); // 투명도 단계적으로 낮게
      strokeWeight(g);
      stroke(glow);
      beginShape();
      for (let pt of points) {
        curveVertex(pt.x, pt.y);
      }
      endShape(CLOSE);
    }

    // ✨ 중앙 라인
    strokeWeight(1.5);
    stroke(this.color);
    beginShape();
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
