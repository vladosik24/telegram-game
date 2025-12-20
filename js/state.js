GameState.getTotalDamage = function () {
  let dmg = this.level * 10;
  if (this.isVIP) dmg *= 1.2;
  return Math.floor(dmg);
};

GameState.getGoldBonus = function () {
  return this.isVIP ? 2 : 1;
};

GameState.getSpecialCost = function () {
  return 3;
};