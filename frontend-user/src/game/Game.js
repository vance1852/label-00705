import { Ball } from "./Ball.js";
import { Hoop } from "./Hoop.js";
import { Physics } from "./Physics.js";
import { Renderer } from "./Renderer.js";

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.resize();

    this.physics = new Physics();
    this.renderer = new Renderer(this.ctx);

    this.score = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.onScoreUpdate = null;

    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.dragEnd = { x: 0, y: 0 };

    this.particles = [];
    this.scoreTexts = [];
    this.flashIntensity = 0;

    this.init();
    this.bindEvents();
  }

  resize() {
    const maxWidth = Math.min(window.innerWidth - 40, 800);
    const maxHeight = Math.min(window.innerHeight - 200, 500);
    this.canvas.width = maxWidth;
    this.canvas.height = maxHeight;
  }

  init() {
    const ballX = this.canvas.width * 0.15;
    const ballY = this.canvas.height * 0.7;
    this.ball = new Ball(ballX, ballY, 22);
    this.ballStartPos = { x: ballX, y: ballY };

    const hoopX = this.canvas.width * 0.78;
    const hoopY = this.canvas.height * 0.32;
    this.hoop = new Hoop(hoopX, hoopY, 55, 40);
  }

  bindEvents() {
    window.addEventListener("resize", () => {
      this.resize();
      this.init();
    });

    this.canvas.addEventListener("mousedown", (e) => this.onPointerDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.onPointerMove(e));
    this.canvas.addEventListener("mouseup", (e) => this.onPointerUp(e));
    this.canvas.addEventListener("mouseleave", (e) => this.onPointerUp(e));

    this.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.onPointerDown(e.touches[0]);
    });
    this.canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      this.onPointerMove(e.touches[0]);
    });
    this.canvas.addEventListener("touchend", (e) => {
      e.preventDefault();
      if (e.changedTouches.length > 0) {
        this.onPointerUp(e.changedTouches[0]);
      }
    });
  }

  getPointerPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  onPointerDown(e) {
    if (!this.ball.isResting) return;

    const pos = this.getPointerPos(e);
    const dist = Math.hypot(pos.x - this.ball.x, pos.y - this.ball.y);

    if (dist < this.ball.radius * 3) {
      this.isDragging = true;
      this.dragStart = { x: this.ball.x, y: this.ball.y };
      this.dragEnd = pos;
    }
  }

  onPointerMove(e) {
    if (!this.isDragging) return;
    this.dragEnd = this.getPointerPos(e);
  }

  onPointerUp(e) {
    if (!this.isDragging) return;

    this.isDragging = false;

    const dx = this.dragStart.x - this.dragEnd.x;
    const dy = this.dragStart.y - this.dragEnd.y;
    const power = Math.min(Math.hypot(dx, dy) * 0.15, 22);

    if (power > 2) {
      const angle = Math.atan2(dy, dx);
      this.ball.vx = Math.cos(angle) * power;
      this.ball.vy = Math.sin(angle) * power;
      this.ball.isResting = false;
      this.shotFired = true;
    }
  }

  update(deltaTime) {
    if (!this.ball.isResting) {
      this.physics.applyGravity(this.ball);
      this.physics.applyAirResistance(this.ball);
      this.ball.update();

      // Check score
      if (this.hoop.checkScore(this.ball)) {
        this.onScore();
      }

      this.hoop.checkRimCollision(this.ball);
      this.hoop.checkBackboardCollision(this.ball);
      this.checkBoundaries();
    }

    // Update effects
    this.updateParticles(deltaTime);
    this.updateScoreTexts(deltaTime);
    if (this.flashIntensity > 0) {
      this.flashIntensity -= deltaTime * 0.08;
    }
  }

  onScore() {
    this.streak++;
    const points = 10 * this.streak;
    this.score += points;

    if (this.streak > this.bestStreak) {
      this.bestStreak = this.streak;
    }

    // Visual effects
    this.flashIntensity = 1;
    this.createParticles(this.hoop.x, this.hoop.y + 20, 50);
    this.scoreTexts.push({
      x: this.hoop.x,
      y: this.hoop.y - 20,
      text: `+${points}`,
      life: 1.5,
    });

    this.updateUI();
  }

  createParticles(x, y, count) {
    const colors = ["#f97316", "#fbbf24", "#22c55e", "#3b82f6", "#ef4444"];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15 - 5,
        life: 1 + Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 4,
      });
    }
  }

  updateParticles(deltaTime) {
    this.particles = this.particles.filter((p) => {
      p.life -= deltaTime * 0.025;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3;
      p.vx *= 0.98;
      return p.life > 0;
    });
  }

  updateScoreTexts(deltaTime) {
    this.scoreTexts = this.scoreTexts.filter((t) => {
      t.life -= deltaTime * 0.02;
      t.y -= 1.5;
      return t.life > 0;
    });
  }

  checkBoundaries() {
    const ball = this.ball;

    if (ball.y + ball.radius > this.canvas.height - 40) {
      ball.y = this.canvas.height - 40 - ball.radius;
      ball.vy *= -0.6;
      ball.vx *= 0.8;

      if (Math.abs(ball.vy) < 1.5 && Math.abs(ball.vx) < 1) {
        this.resetBall();
      }
    }

    if (ball.x - ball.radius < 0) {
      ball.x = ball.radius;
      ball.vx *= -0.7;
    }
    if (ball.x + ball.radius > this.canvas.width) {
      ball.x = this.canvas.width - ball.radius;
      ball.vx *= -0.7;
    }

    if (ball.y - ball.radius < 0) {
      ball.y = ball.radius;
      ball.vy *= -0.7;
    }
  }

  resetBall() {
    this.ball.x = this.ballStartPos.x;
    this.ball.y = this.ballStartPos.y;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.isResting = true;
    this.ball.rotation = 0;
    this.ball.angularVelocity = 0;

    // Reset streak if this shot missed
    if (this.shotFired && !this.hoop.scored) {
      this.streak = 0;
      this.updateUI();
    }
    this.shotFired = false;
    this.hoop.reset();
  }

  updateUI() {
    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score, this.streak, this.bestStreak);
    }
  }

  render() {
    this.renderer.clear(this.canvas.width, this.canvas.height);
    this.renderer.drawBackground(this.canvas.width, this.canvas.height);

    if (this.flashIntensity > 0) {
      this.renderer.drawFlash(
        this.canvas.width,
        this.canvas.height,
        this.flashIntensity,
      );
    }

    this.renderer.drawHoop(this.hoop);
    this.renderer.drawBall(this.ball);
    this.renderer.drawParticles(this.particles);
    this.renderer.drawScoreTexts(this.scoreTexts);

    if (this.isDragging) {
      this.renderer.drawTrajectory(
        this.dragStart,
        this.dragEnd,
        this.ball.radius,
      );
    }
  }

  gameLoop(timestamp) {
    const deltaTime = Math.min((timestamp - this.lastTime) / 16.67, 2);
    this.lastTime = timestamp;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  start() {
    this.lastTime = performance.now();
    this.updateUI();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  reset() {
    this.score = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.particles = [];
    this.scoreTexts = [];
    this.flashIntensity = 0;
    this.shotFired = false;
    this.hoop.reset();
    this.ball.x = this.ballStartPos.x;
    this.ball.y = this.ballStartPos.y;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.isResting = true;
    this.updateUI();
  }
}
