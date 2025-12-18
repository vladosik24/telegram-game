let score = 0;

function addScore() {
  score++;
  document.getElementById("score").innerText = score;

  // Telegram API
  if (window.TelegramGameProxy) {
    TelegramGameProxy.setScore(score);
  }
}
