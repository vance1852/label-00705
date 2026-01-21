import { Game } from "./game/Game.js";

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  const game = new Game(canvas);

  // UI Elements
  const scoreEl = document.getElementById("score");
  const streakEl = document.getElementById("streak");
  const bestStreakEl = document.getElementById("best-streak");
  const resetBtn = document.getElementById("reset-btn");

  // Update UI callback
  game.onScoreUpdate = (score, streak, bestStreak) => {
    scoreEl.textContent = score;
    streakEl.textContent = streak;
    bestStreakEl.textContent = bestStreak;
  };

  // Reset button
  resetBtn.addEventListener("click", () => {
    game.reset();
  });

  // Start game
  game.start();
});
