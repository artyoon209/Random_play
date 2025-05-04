let noise, osc, reverb;
let dots = [];
let isRunning = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(2, 5, 40); // 어두운 바다 느낌 배경
  noFill();
  strokeWeight(1.5);

  // 노이즈와 오실레이터 초기화
  noise = new p5.Noise('white');
  noise.amp(0);
  noise.start();

  osc = new p5.Oscillator('sine');
  osc.amp(0);
  osc.start();

  reverb = new p5.Reverb();
  noise.disconnect();
  noise.connect(reverb);
  osc.disconnect();
  osc.connect(reverb);
  reverb.process(noise, 0.5, 0.5);
  reverb.process(osc, 1, 1);

  for (let i = 0; i < 3; i++) {
    createRandomObject();
  }
}

function scheduleNext() {
  if (!isRunning) return;

  let delay = random(1000, 1400); // 전체 묶음 간격
  for (let i = 0; i < 4; i++) {
    let offset = random(0, 1200); // 각 점의 생성 시점은 0~400ms 랜덤 오프셋
    setTimeout(() => {
      if (isRunning) createRandomObject();
    }, offset);
  }

  setTimeout(scheduleNext, delay);
}

function draw() {
  background(2, 5, 40, 20); // 잔상 남기는 효과
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

function triggerPopSound() {
  // 노이즈 팝
  noise.amp(0.08, 0.02);
  setTimeout(() => noise.amp(0.005, 0.04), 10);

  // 사인파 클릭
  osc.freq(random(400, 435));
  osc.amp(0.03, 0.03);
  setTimeout(() => osc.amp(0, 0.1), 20);
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
  triggerPopSound();
}

class Dot {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.baseRadius = 6;
    this.radius = this.baseRadius;
    this.targetRadius = random(60, 90);
    this.growthSpeed = 1;
    this.color = random([
      color(173, 216, 230), // 연하늘
      color(135, 206, 235), // 하늘
      color(100, 149, 237), // 코발트
      color(70, 130, 180),  // 강한 파랑
      color(220, 220, 255)  // 푸른빛 흰색
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
