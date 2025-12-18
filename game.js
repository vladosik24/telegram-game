let score = 0;

function addScore() {
  score++;
  document.getElementById("score").innerText = score;

  // Передаємо очки в Telegram
  if (window.TelegramGameProxy) {
    TelegramGameProxy.setScore(score);
  }
}
