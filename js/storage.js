window.saveGame = function () {
  localStorage.setItem("gra_state", JSON.stringify(GameState));
};

window.loadGame = function () {
  const data = localStorage.getItem("gra_state");
  if (!data) return;

  try {
    const parsed = JSON.parse(data);
    Object.assign(GameState, parsed);
  } catch (e) {
    console.error("Save corrupted", e);
  }
};