window.currentEnemy = null;

window.spawnEnemy = function () {
  const loc = window.locations[GameState.location];
  const pool = loc.enemies;
  const enemyTemplate = window.enemies[pool[Math.floor(Math.random() * pool.length)]];

  currentEnemy = JSON.parse(JSON.stringify(enemyTemplate));
  currentEnemy.maxHp = currentEnemy.hp;

  updateUI();
};

window.attackEnemy = function () {
  if (!currentEnemy) return;

  const dmg = GameState.getTotalDamage();
  currentEnemy.hp -= dmg;

  showDamage(dmg, "player");

  if (currentEnemy.hp <= 0) {
    handleVictory();
  } else {
    enemyAttack();
  }

  updateUI();
};

window.specialAttack = function () {
  const cost = GameState.getSpecialCost();
  if (GameState.energy < cost) return showMessage("❌ Недостатньо енергії");

  GameState.energy -= cost;
  const dmg = GameState.getTotalDamage() * 2;
  currentEnemy.hp -= dmg;

  showDamage(dmg, "special");

  if (currentEnemy.hp <= 0) {
    handleVictory();
  } else {
    enemyAttack();
  }

  updateUI();
};

function enemyAttack() {
  const dmg = currentEnemy.damage;
  GameState.hp -= dmg;

  showDamage(dmg, "enemy");

  if (GameState.hp <= 0) {
    GameState.hp = GameState.maxHp;
    showMessage("💀 Ти програв бій");
  }
}

function handleVictory() {
  GameState.wins++;
  GameState.gold += Math.floor(currentEnemy.gold * GameState.getGoldBonus());
  GameState.exp += currentEnemy.exp;

  showMessage("🏆 Перемога!");
  spawnEnemy();
}