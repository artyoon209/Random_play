
let isSoundOn = false;
let objects = [];
let osc, env, reverb;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noFill();
  frameRate(60);

  // Oscillator and sound setup
  osc = new p5.Oscillator('sine');
  env = new p5.Envelope();
  env.setADSR(0.01, 0.1, 0.3, 1.0);
  env.setRange(0.25, 0);
  osc.amp(env);
  osc.start();
  osc.freq(220);  // 기본 낮은음
  osc.stop(); // 시작 시에는 멈춤

  reverb = new p5.Reverb();
  reverb.process(osc, 4, 2); // 공간감 있게

  // 초기 몇 개 생성
  for (let i = 0; i < 10; i++) {
    createObject();
  }
}

function draw() {
  background(0, 20);

  // 자동 생성
  if (frameCount % 10 === 0) {
    for (let i = 0; i < 2; i++) {
      createObject();
    }
  }

  // 점들 업데이트 및 표시
  for (let obj of objects) {
    obj.update();
    obj.display();
  }
}

function createObject() {
  let x = random(width);
  let y = random(height);
  let size = 10;
  let col = color(random(100,255), random(100,255), random(100,255));
  let freq = map(x, 0, width, 100, 800);
  let obj = new Dot(x, y, size, col, freq);
  objects.push(obj);

  if (isSoundOn) {
    osc.freq(freq);
    env.play(osc);
  }
}

function mousePressed() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }

  isSoundOn = !isSoundOn;

  if (isSoundOn) {
    osc.start();
  } else {
    osc.stop();
  }
}

class Dot {
  constructor(x, y, size, col, freq) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.maxSize = random(40, 100);
    this.growth = random(2, 4);
    this.col = col;
    this.freq = freq;
  }

  update() {
    if (this.size < this.maxSize) {
      this.size += this.growth;
    } else {
      this.size = this.maxSize;
    }

    // 간단한 일그러짐
    for (let other of objects) {
      if (other !== this) {
        let d = dist(this.x, this.y, other.x, other.y);
        if (d < (this.size + other.size) / 2) {
          this.size -= 0.3;
        }
      }
    }
  }

  display() {
    stroke(this.col);
    ellipse(this.x, this.y, this.size);
  }
}
