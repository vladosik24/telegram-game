window.startPvP = function () {
  if (!window.Telegram?.WebApp) return;

  Telegram.WebApp.sendData(JSON.stringify({
    action: "pvp_request",
    level: GameState.level,
    power: GameState.getTotalDamage()
  }));

  showMessage("⚔️ Запит на PvP надіслано");
};

window.handlePvPResult = function (result) {
  if (result === "win") {
    GameState.gold += 200;
    showMessage("🏆 Ти виграв PvP!");
  } else {
    showMessage("💀 Ти програв PvP");
  }

  saveGame();
  updateUI();
};