export class Hoop {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.rimRadius = 8;
    this.backboardWidth = 10;
    this.backboardHeight = 80;
    this.netSegments = 6;
    this.scored = false;
    this.lastBallY = 9999;
  }

  get leftRim() {
    return { x: this.x - this.width / 2, y: this.y };
  }

  get rightRim() {
    return { x: this.x + this.width / 2, y: this.y };
  }

  get backboard() {
    return {
      x: this.x + this.width / 2 + 15,
      y: this.y - this.backboardHeight / 2 + 10,
      width: this.backboardWidth,
      height: this.backboardHeight,
    };
  }

  checkScore(ball) {
    const hoopLeft = this.x - this.width / 2;
    const hoopRight = this.x + this.width / 2;
    const inHoopX = ball.x > hoopLeft && ball.x < hoopRight;

    // Score if ball crosses rim line while in hoop area and moving down
    const wasAbove = this.lastBallY < this.y;
    const nowBelow = ball.y >= this.y;

    if (wasAbove && nowBelow && inHoopX && ball.vy > 0 && !this.scored) {
      this.scored = true;
      this.lastBallY = ball.y;
      return true;
    }

    this.lastBallY = ball.y;
    return false;
  }

  checkRimCollision(ball) {
    const hoopLeft = this.x - this.width / 2 + 3;
    const hoopRight = this.x + this.width / 2 - 3;
    const inHoopX = ball.x > hoopLeft && ball.x < hoopRight;

    // Don't collide if ball is passing through the hoop
    if (
      inHoopX &&
      ball.vy > 0 &&
      ball.y > this.y - ball.radius &&
      ball.y < this.y + 30
    ) {
      return;
    }

    const rims = [this.leftRim, this.rightRim];

    for (const rim of rims) {
      const dx = ball.x - rim.x;
      const dy = ball.y - rim.y;
      const dist = Math.hypot(dx, dy);
      const minDist = ball.radius + this.rimRadius;

      if (dist < minDist && dist > 0) {
        const overlap = minDist - dist;
        const nx = dx / dist;
        const ny = dy / dist;

        ball.x += nx * overlap;
        ball.y += ny * overlap;

        const dotProduct = ball.vx * nx + ball.vy * ny;
        ball.vx -= 1.5 * dotProduct * nx;
        ball.vy -= 1.5 * dotProduct * ny;

        ball.vx *= 0.7;
        ball.vy *= 0.7;
      }
    }
  }

  checkBackboardCollision(ball) {
    const bb = this.backboard;

    if (
      ball.x + ball.radius > bb.x &&
      ball.x - ball.radius < bb.x + bb.width &&
      ball.y + ball.radius > bb.y &&
      ball.y - ball.radius < bb.y + bb.height
    ) {
      if (ball.vx > 0) {
        ball.x = bb.x - ball.radius;
        ball.vx *= -0.6;
        ball.angularVelocity = -ball.vy * 0.03;
      }
    }
  }

  reset() {
    this.scored = false;
    this.lastBallY = 9999;
  }
}
