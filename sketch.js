let objects = [];
let env, osc, reverb;
let maxAttempts = 10;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noFill();
  env = new p5.Envelope();
  env.setADSR(0.01, 0.1, 0.1, 0.3);  // 짧은 소리

  osc = new p5.Oscillator('sine');  // 원래대로 sine파
  osc.start();
  osc.amp(0);

  reverb = new p5.Reverb();
  reverb.process(osc, 3, 2); // 리버브 적용

  frameRate(60);
}

function draw() {
  background(0, 20);

  // 매 프레임마다 여러 개 생성 시도
  for (let i = 0; i < 2; i++) {
    let attempts = 0;
    let success = false;

    while (attempts < maxAttempts && !success) {
      let x = random(width);
      let y = random(height);
      let size = 10;
      let col = color(random(100,255), random(100,255), random(100,255));
      let freq = map(x, 0, width, 100, 1000);

      let overlapping = false;
      for (let obj of objects) {
        let d = dist(x, y, obj.x, obj.y);
        if (d < (obj.size + size) / 2 + 10) {
          overlapping = true;
          break;
        }
      }

      if (!overlapping) {
        objects.push(new Circle(x, y, size, col, freq));
        success = true;
      }
      attempts++;
    }
  }

  for (let obj of objects) {
    obj.update();
    obj.display();
  }
}

class Circle {
  constructor(x, y, size, col, freq) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.maxSize = random(60, 120);
    this.growth = 3.0;
    this.col = col;
    this.freq = freq;
    this.played = false;
  }

  update() {
    if (this.size < this.maxSize) {
      this.size += this.growth;
    } else {
      this.size = this.maxSize;
    }

    for (let other of objects) {
      if (other !== this) {
        let d = dist(this.x, this.y, other.x, other.y);
        if (d < (this.size + other.size) / 2) {
          this.size -= 0.5;  // 겹치면 일그러짐 효과
        }
      }
    }

    if (!this.played && this.size > 10) {
      osc.freq(this.freq);
      env.play(osc);
      this.played = true;
    }
  }

  display() {
    stroke(this.col);
    strokeWeight(2);
    ellipse(this.x, this.y, this.size);
  }
}
