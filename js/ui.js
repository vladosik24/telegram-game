window.updateUI = function () {
  document.getElementById("gold").innerText = GameState.gold;
  document.getElementById("energy").innerText =
    GameState.energy + "/" + GameState.maxEnergy;
};