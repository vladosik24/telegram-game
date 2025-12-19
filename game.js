// ІНІЦІАЛІЗАЦІЯ TELEGRAM
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// ВОРОГИ
const enemies = [
  { name: "Загарбник", hp: 20, gold: 10, level: 1 },
  { name: "Вояк", hp: 35, gold: 20, level: 2 },
  { name: "Опричник", hp: 60, gold: 35, level: 3 },
  { name: "Шляхтич", hp: 100, gold: 60, level: 4 },
  { name: "Боярин", hp: 150, gold: 100, level: 5 },
  { name: "Воєвода", hp: 250, gold: 180, level: 6 },
  { name: "Генерал", hp: 400, gold: 300, level: 7 }
];

// СТАН ГРИ
let gameState = {
  wins: 0,
  gold: 0,
  totalGold: 0,
  power: 1,
  currentEnemy: 0,
  enemyHp: 20,
  buildings: {
    forge: 1,
    treasury: 1,
    fortress: 1
  }
};

// ЗАВАНТАЖЕННЯ ГРИ
function loadGame() {
  if (tg.CloudStorage) {
    tg.CloudStorage.getItem('gameState', (err, data) => {
      if (data) {
        gameState = JSON.parse(data);
        spawnEnemy();
        updateUI();
      } else {
        spawnEnemy();
      }
    });
  } else {
    const saved = localStorage.getItem('kozakGame');
    if (saved) {
      gameState = JSON.parse(saved);
      spawnEnemy();
    }
    updateUI();
  }
}

// ЗБЕРЕЖЕННЯ ГРИ
function saveGame() {
  const data = JSON.stringify(gameState);
  if (tg.CloudStorage) {
    tg.CloudStorage.setItem('gameState', data);
  } else {
    localStorage.setItem('kozakGame', data);
  }
}

// СТВОРЕННЯ ВОРОГА
function spawnEnemy() {
  const maxLevel = Math.min(gameState.buildings.fortress, enemies.length - 1);
  gameState.currentEnemy = Math.floor(Math.random() * (maxLevel + 1));
  const enemy = enemies[gameState.currentEnemy];
  gameState.enemyHp = enemy.hp;
}

// АТАКА
function attack() {
  gameState.enemyHp -= gameState.power;
  tg.HapticFeedback.impactOccurred("medium");

  if (gameState.enemyHp <= 0) {
    const enemy = enemies[gameState.currentEnemy];
    const goldReward = enemy.gold + (gameState.buildings.treasury - 1) * 10;
    
    gameState.wins++;
    gameState.gold += goldReward;
    gameState.totalGold += goldReward;

    showMessage(`🏆 Перемога! +${goldReward} 💰`);
    tg.HapticFeedback.notificationOccurred("success");

    spawnEnemy();
  }

  updateUI();
  saveGame();
}

// ПОКРАЩЕННЯ БУДІВЛІ
function upgradeBuilding(type) {
  const costs = {
    forge: 50 * gameState.buildings.forge,
    treasury: 100 * gameState.buildings.treasury,
    fortress: 200 * gameState.buildings.fortress
  };

  const cost = costs[type];

  if (gameState.gold >= cost) {
    gameState.gold -= cost;
    gameState.buildings[type]++;

    if (type === 'forge') {
      gameState.power = gameState.buildings.forge;
    }

    showMessage(`✅ Покращено!`);
    tg.HapticFeedback.notificationOccurred("success");
    updateUI();
    saveGame();
  } else {
    showMessage(`❌ Не вистачає золота`);
    tg.HapticFeedback.notificationOccurred("error");
  }
}

// ОНОВЛЕННЯ UI
function updateUI() {
  const enemy = enemies[gameState.currentEnemy];

  // Шапка
  document.getElementById('wins').textContent = gameState.wins;
  document.getElementById('gold').textContent = gameState.gold;
  document.getElementById('power').textContent = gameState.power;
  document.getElementById('damage').textContent = gameState.power;

  // Ворог
  document.getElementById('enemyName').textContent = enemy.name;
  document.getElementById('enemyLevel').textContent = `Рівень ${enemy.level}`;
  document.getElementById('enemyHp').textContent = gameState.enemyHp;

  // Будівлі
  document.getElementById('forgeLevel').textContent = gameState.buildings.forge;
  document.getElementById('forgeCost').textContent = 50 * gameState.buildings.forge;
  document.getElementById('forgeBtn').disabled = gameState.gold < 50 * gameState.buildings.forge;

  document.getElementById('treasuryLevel').textContent = gameState.buildings.treasury;
  document.getElementById('treasuryCost').textContent = 100 * gameState.buildings.treasury;
  document.getElementById('treasuryBtn').disabled = gameState.gold < 100 * gameState.buildings.treasury;

  document.getElementById('fortressLevel').textContent = gameState.buildings.fortress;
  document.getElementById('fortressCost').textContent = 200 * gameState.buildings.fortress;
  document.getElementById('fortressBtn').disabled = gameState.gold < 200 * gameState.buildings.fortress || gameState.buildings.fortress >= enemies.length;

  // Статистика
  document.getElementById('totalWins').textContent = gameState.wins;
  document.getElementById('totalGold').textContent = gameState.totalGold;
  document.getElementById('totalPower').textContent = gameState.power;
  document.getElementById('maxEnemy').textContent = Math.max(gameState.currentEnemy + 1, 1);
}

// ПЕРЕМИКАННЯ ТАБІВ
function switchTab(tab) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  
  document.getElementById(tab).classList.add('active');
  event.target.classList.add('active');
}

// ПОВІДОМЛЕННЯ
function showMessage(text) {
  const msg = document.createElement('div');
  msg.className = 'message';
  msg.textContent = text;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 2000);
}

// СКИДАННЯ ПРОГРЕСУ
function resetProgress() {
  if (confirm('Ви впевнені? Весь прогрес буде втрачено!')) {
    gameState = {
      wins: 0,
      gold: 0,
      totalGold: 0,
      power: 1,
      currentEnemy: 0,
      enemyHp: 20,
      buildings: { forge: 1, treasury: 1, fortress: 1 }
    };
    spawnEnemy();
    updateUI();
    saveGame();
    showMessage('🔄 Прогрес скинуто');
  }
}

// СТАРТ ГРИ
loadGame();