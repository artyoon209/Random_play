
let objects = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noFill();
  strokeWeight(2);
  frameRate(60);

  osc = new p5.Oscillator('sine');
  osc.amp(0);
  osc.start();

  env = new p5.Envelope();
  env.setADSR(0.01, 0.1, 0.1, 0.5);
  env.setRange(0.3, 0);

  reverb = new p5.Reverb();
  reverb.process(osc, 3, 2);

  // resume AudioContext after a short timeout
  userStartAudio();

  // Generate first set
  for (let i = 0; i < 5; i++) {
    createObject();
  }
}

function draw() {
  background(0);
  for (let obj of objects) {
    obj.update();
    obj.display();
  }

  if (frameCount % 10 === 0) {
    for (let i = 0; i < 2; i++) {
      createObject();
    }
  }
}

function createObject() {
  let tries = 0;
  let placed = false;
  while (!placed && tries < 100) {
    let x = random(width);
    let y = random(height);
    let size = 10;
    let col = color(random(255), random(255), random(255));
    let newObj = new InteractiveObject(x, y, size, col);
    let overlaps = false;
    for (let obj of objects) {
      let d = dist(x, y, obj.x, obj.y);
      if (d < (obj.size + newObj.size) / 2) {
        overlaps = true;
        break;
      }
    }
    if (!overlaps) {
      objects.push(newObj);
      soundPlay();
      placed = true;
    }
    tries++;
  }
}

function soundPlay() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
  osc.start();
  env.play(osc, 0, 0.05);
}

class InteractiveObject {
  constructor(x, y, size, col) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.col = col;
    this.growth = 1;
  }

  update() {
    if (this.size < 60) {
      this.size += this.growth * 3;
    }
  }

  display() {
    stroke(this.col);
    ellipse(this.x, this.y, this.size);
  }
}
