export class Ball {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.vx = 0;
    this.vy = 0;
    this.rotation = 0;
    this.angularVelocity = 0;
    this.isResting = true;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.angularVelocity;
    this.angularVelocity *= 0.98;
  }

  get speed() {
    return Math.hypot(this.vx, this.vy);
  }
}
