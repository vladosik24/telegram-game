window.buyVIP = function () {
  if (!window.Telegram?.WebApp) return;

  Telegram.WebApp.openInvoice({
    title: "VIP статус",
    description: "x2 золото, +енергія",
    payload: "vip_purchase",
    provider_token: "TON_PROVIDER_TOKEN",
    currency: "TON",
    prices: [{ label: "VIP", amount: 1_000_000_000 }]
  });
};

window.onTONSuccess = function () {
  GameState.isVIP = true;
  GameState.maxEnergy += 5;
  showMessage("💎 VIP активовано!");
  saveGame();
  updateUI();
};