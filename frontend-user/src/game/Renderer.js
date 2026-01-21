export class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
  }

  clear(width, height) {
    this.ctx.clearRect(0, 0, width, height);
  }

  drawBackground(width, height) {
    const ctx = this.ctx;

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#1e3a5f");
    gradient.addColorStop(1, "#0f172a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Court floor
    ctx.fillStyle = "#8b5a2b";
    ctx.fillRect(0, height - 40, width, 40);

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height - 40);
    ctx.lineTo(width, height - 40);
    ctx.stroke();

    // Three point arc
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.arc(width * 0.78, height - 40, 120, Math.PI, 0, true);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  drawFlash(width, height, intensity) {
    const ctx = this.ctx;
    ctx.fillStyle = `rgba(255, 220, 100, ${intensity * 0.4})`;
    ctx.fillRect(0, 0, width, height);
  }

  drawBall(ball) {
    const ctx = this.ctx;

    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.rotate(ball.rotation);

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.beginPath();
    ctx.ellipse(3, 3, ball.radius, ball.radius * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ball
    const gradient = ctx.createRadialGradient(
      -ball.radius * 0.3,
      -ball.radius * 0.3,
      0,
      0,
      0,
      ball.radius,
    );
    gradient.addColorStop(0, "#ff8c42");
    gradient.addColorStop(0.5, "#f97316");
    gradient.addColorStop(1, "#c2410c");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Lines
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(-ball.radius, 0);
    ctx.lineTo(ball.radius, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -ball.radius);
    ctx.lineTo(0, ball.radius);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, ball.radius * 0.6, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, ball.radius * 0.6, Math.PI * 0.5, Math.PI * 1.5);
    ctx.stroke();

    ctx.restore();
  }

  drawHoop(hoop) {
    const ctx = this.ctx;

    // Backboard
    const bb = hoop.backboard;
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fillRect(bb.x, bb.y, bb.width, bb.height);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.strokeRect(bb.x, bb.y, bb.width, bb.height);

    // Target square
    ctx.strokeStyle = "#e11d48";
    ctx.lineWidth = 3;
    ctx.strokeRect(bb.x - 32, hoop.y - 22, 32, 28);

    // Pole
    ctx.fillStyle = "#4a5568";
    ctx.fillRect(bb.x + bb.width, bb.y + bb.height - 15, 6, 180);

    // Net
    this.drawNet(hoop);

    // Rim
    ctx.strokeStyle = "#e11d48";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(hoop.leftRim.x, hoop.leftRim.y);
    ctx.lineTo(hoop.rightRim.x, hoop.rightRim.y);
    ctx.stroke();

    ctx.fillStyle = "#e11d48";
    ctx.beginPath();
    ctx.arc(hoop.leftRim.x, hoop.leftRim.y, hoop.rimRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(hoop.rightRim.x, hoop.rightRim.y, hoop.rimRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  drawNet(hoop) {
    const ctx = this.ctx;
    const netDepth = hoop.height;
    const segments = hoop.netSegments;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.lineWidth = 1.5;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const topX = hoop.leftRim.x + (hoop.rightRim.x - hoop.leftRim.x) * t;
      const bottomX = hoop.x + (t - 0.5) * hoop.width * 0.4;

      ctx.beginPath();
      ctx.moveTo(topX, hoop.y);
      ctx.quadraticCurveTo(
        (topX + bottomX) / 2,
        hoop.y + netDepth * 0.6,
        bottomX,
        hoop.y + netDepth,
      );
      ctx.stroke();
    }

    for (let j = 1; j <= 4; j++) {
      const y = hoop.y + (netDepth * j) / 5;
      const shrink = (j / 5) * 0.3;

      ctx.beginPath();
      ctx.moveTo(hoop.leftRim.x + hoop.width * shrink, y);
      ctx.lineTo(hoop.rightRim.x - hoop.width * shrink, y);
      ctx.stroke();
    }
  }

  drawTrajectory(start, end, ballRadius) {
    const ctx = this.ctx;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.setLineDash([]);

    const dx = start.x - end.x;
    const dy = start.y - end.y;
    const power = Math.min(Math.hypot(dx, dy) * 0.15, 22);
    const angle = Math.atan2(dy, dx);

    let vx = Math.cos(angle) * power;
    let vy = Math.sin(angle) * power;
    let x = start.x;
    let y = start.y;

    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    for (let i = 0; i < 25; i++) {
      vy += 0.5;
      x += vx;
      y += vy;

      if (y > ctx.canvas.height - 40 - ballRadius) break;

      const size = Math.max(2, 5 - i * 0.15);
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Power bar
    const powerPercent = Math.min(power / 22, 1);
    const barW = 80,
      barH = 8;
    const barX = start.x - barW / 2;
    const barY = start.y + 45;

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(barX, barY, barW, barH);

    const powerGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    powerGrad.addColorStop(0, "#22c55e");
    powerGrad.addColorStop(0.5, "#eab308");
    powerGrad.addColorStop(1, "#ef4444");

    ctx.fillStyle = powerGrad;
    ctx.fillRect(barX, barY, barW * powerPercent, barH);

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);
  }

  drawParticles(particles) {
    const ctx = this.ctx;

    for (const p of particles) {
      ctx.globalAlpha = Math.min(p.life, 1);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * Math.min(p.life, 1), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  drawScoreTexts(scoreTexts) {
    const ctx = this.ctx;

    for (const t of scoreTexts) {
      ctx.save();
      ctx.globalAlpha = Math.min(t.life, 1);
      ctx.font = "bold 32px Arial";
      ctx.textAlign = "center";
      ctx.fillStyle = "#22c55e";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 3;
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    }
  }
}
