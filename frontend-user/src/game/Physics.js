export class Physics {
  constructor() {
    this.gravity = 0.5;
    this.airResistance = 0.995;
  }

  applyGravity(ball) {
    ball.vy += this.gravity;
    ball.vx += this.gravity * 0.1;
  }

  applyAirResistance(ball) {
    ball.vx *= this.airResistance;
    ball.vy *= this.airResistance;
  }
}
