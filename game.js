// ІНІЦІАЛІЗАЦІЯ
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// ДАНІ ГРИ
const locations = [
  { name: "Ліс", icon: "🌲", minLevel: 0 },
  { name: "Гори", icon: "⛰️", minLevel: 2 },
  { name: "Замок", icon: "🏰", minLevel: 4 },
  { name: "Пекло", icon: "🔥", minLevel: 6 }
];

const enemies = [
  { name: "Загарбник", hp: 20, gold: 10, level: 1, damage: 2 },
  { name: "Вояк", hp: 35, gold: 20, level: 2, damage: 4 },
  { name: "Опричник", hp: 60, gold: 35, level: 3, damage: 6 },
  { name: "Шляхтич", hp: 100, gold: 60, level: 4, damage: 8 },
  { name: "Боярин", hp: 150, gold: 100, level: 5, damage: 12 },
  { name: "Воєвода", hp: 250, gold: 180, level: 6, damage: 16 },
  { name: "Генерал", hp: 400, gold: 300, level: 7, damage: 20 }
];

const quests = [
  { id: 1, title: "Перша кров", desc: "Переможіть 10 ворогів", target: 10, reward: 100, type: "wins" },
  { id: 2, title: "Багатій", desc: "Заробіть 500 золота", target: 500, reward: 200, type: "gold" },
  { id: 3, title: "Майстер бою", desc: "Переможіть 50 ворогів", target: 50, reward: 500, type: "wins" },
  { id: 4, title: "Покращувач", desc: "Покращте будівлю до 5 рівня", target: 5, reward: 300, type: "building" },
  { id: 5, title: "Скарби", desc: "Зберіть 2000 золота", target: 2000, reward: 1000, type: "gold" }
];

const achievements = [
  { id: 1, name: "Початківець", desc: "10 перемог", icon: "🥉", check: s => s.wins >= 10 },
  { id: 2, name: "Ветеран", desc: "50 перемог", icon: "🥈", check: s => s.wins >= 50 },
  { id: 3, name: "Легенда", desc: "100 перемог", icon: "🥇", check: s => s.wins >= 100 },
  { id: 4, name: "Скарби", desc: "1000 золота", icon: "💰", check: s => s.totalGold >= 1000 },
  { id: 5, name: "Сила", desc: "20 сили", icon: "💪", check: s => s.power >= 20 },
  { id: 6, name: "Невмирущий", desc: "300 макс HP", icon: "❤️", check: s => s.playerMaxHp >= 300 },
  { id: 7, name: "Майстер", desc: "Всі будівлі 10 рівня", icon: "🏗️", check: s => Math.min(...Object.values(s.buildings)) >= 10 }
];

// СТАН ГРИ
let gameState = {
  wins: 0,
  gold: 0,
  totalGold: 0,
  power: 1,
  currentEnemy: 0,
  enemyHp: 20,
  enemyMaxHp: 20,
  playerHp: 100,
  playerMaxHp: 100,
  energy: 10,
  maxEnergy: 10,
  location: 0,
  buildings: { 
    forge: 1, 
    treasury: 1, 
    fortress: 1, 
    hospital: 1, 
    generator: 1 
  },
  completedQuests: [],
  unlockedAchievements: [],
  lastDaily: 0,
  bonusDamage: 0,
  lastEnergyRegen: Date.now()
};

// ЗАВАНТАЖЕННЯ
function loadGame() {
  if (tg.CloudStorage) {
    tg.CloudStorage.getItem('gameState', (err, data) => {
      if (data) {
        const loaded = JSON.parse(data);
        gameState = { ...gameState, ...loaded };
        checkDailyReward();
        regenerateEnergy();
        spawnEnemy();
        updateUI();
        updateQuests();
        updateAchievements();
      } else {
        spawnEnemy();
        checkDailyReward();
      }
    });
  } else {
    const saved = localStorage.getItem('kozakGame');
    if (saved) {
      const loaded = JSON.parse(saved);
      gameState = { ...gameState, ...loaded };
      checkDailyReward();
      regenerateEnergy();
      spawnEnemy();
    }
    updateUI();
    updateQuests();
    updateAchievements();
  }

  // Регенерація енергії кожну хвилину
  setInterval(regenerateEnergy, 60000);
}

// ЗБЕРЕЖЕННЯ
function saveGame() {
  const data = JSON.stringify(gameState);
  if (tg.CloudStorage) {
    tg.CloudStorage.setItem('gameState', data);
    // Зберігаємо в рейтинг
    const userId = tg.initDataUnsafe?.user?.id || 'guest_' + Math.random();
    tg.CloudStorage.setItem('lb_' + userId, JSON.stringify({
      name: tg.initDataUnsafe?.user?.first_name || 'Гравець',
      score: gameState.wins,
      gold: gameState.totalGold
    }));
  } else {
    localStorage.setItem('kozakGame', data);
  }
}

// ЩОДЕННА НАГОРОДА
function checkDailyReward() {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  if (now - gameState.lastDaily > day) {
    gameState.lastDaily = now;
    gameState.gold += 100;
    gameState.energy = gameState.maxEnergy;
    showMessage('🎁 Щоденна нагорода: 100💰 + повна енергія!');
    saveGame();
  }
}

// РЕГЕНЕРАЦІЯ ЕНЕРГІЇ
function regenerateEnergy() {
  const now = Date.now();
  const minutesPassed = Math.floor((now - gameState.lastEnergyRegen) / 60000);
  
  if (minutesPassed > 0 && gameState.energy < gameState.maxEnergy) {
    gameState.energy = Math.min(gameState.energy + minutesPassed, gameState.maxEnergy);
    gameState.lastEnergyRegen = now;
    updateUI();
    saveGame();
  }
}

// СТВОРЕННЯ ВОРОГА
function spawnEnemy() {
  const maxLevel = Math.min(gameState.buildings.fortress + gameState.location * 2, enemies.length - 1);
  const minLevel = gameState.location * 2;
  gameState.currentEnemy = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
  const enemy = enemies[gameState.currentEnemy];
  gameState.enemyHp = enemy.hp;
  gameState.enemyMaxHp = enemy.hp;
}

// АТАКА
function attack() {
  if (gameState.energy <= 0) {
    showMessage('❌ Немає енергії! Зачекайте 1 хв.');
    return;
  }

  gameState.energy--;
  const enemy = enemies[gameState.currentEnemy];
  const isCrit = Math.random() < 0.15;
  const damage = isCrit ? gameState.power *
2 : gameState.power;
  
  gameState.enemyHp -= damage;
  showDamage(damage, isCrit);
  
  document.getElementById('enemyCard').classList.add('shake');
  setTimeout(() => document.getElementById('enemyCard').classList.remove('shake'), 300);

  if (gameState.enemyHp <= 0) {
    const goldReward = enemy.gold + (gameState.buildings.treasury - 1) * 10;
    gameState.wins++;
    gameState.gold += goldReward;
    gameState.totalGold += goldReward;
    showMessage(`🏆 Перемога! +${goldReward}💰`);
    tg.HapticFeedback.notificationOccurred("success");
    spawnEnemy();
    checkQuests();
    checkAchievements();
  } else {
    // Ворог атакує назад
    setTimeout(() => {
      if (gameState.enemyHp > 0) {
        const enemyDamage = Math.max(1, enemy.damage - Math.floor(gameState.buildings.hospital / 2));
        gameState.playerHp = Math.max(0, gameState.playerHp - enemyDamage);
        showMessage(`💔 Ворог атакував: -${enemyDamage} HP`);
        
        if (gameState.playerHp <= 0) {
          showMessage('☠️ Ви програли! HP відновлено.');
          gameState.playerHp = gameState.playerMaxHp;
          spawnEnemy();
        }
      }
      updateUI();
      saveGame();
    }, 500);
  }

  updateUI();
  saveGame();
  tg.HapticFeedback.impactOccurred("medium");
}

// СПЕЦІАЛЬНА АТАКА
function specialAttack() {
  if (gameState.energy < 3) {
    showMessage('❌ Потрібно 3 енергії!');
    return;
  }

  gameState.energy -= 3;
  const enemy = enemies[gameState.currentEnemy];
  const damage = gameState.power * 3;
  gameState.enemyHp -= damage;
  showDamage(damage, true);
  
  document.getElementById('enemyCard').classList.add('shake');
  setTimeout(() => document.getElementById('enemyCard').classList.remove('shake'), 300);

  if (gameState.enemyHp <= 0) {
    const goldReward = enemy.gold + (gameState.buildings.treasury - 1) * 10;
    gameState.wins++;
    gameState.gold += goldReward;
    gameState.totalGold += goldReward;
    showMessage(`🏆 Критична перемога! +${goldReward}💰`);
    tg.HapticFeedback.notificationOccurred("success");
    spawnEnemy();
    checkQuests();
    checkAchievements();
  }

  updateUI();
  saveGame();
  tg.HapticFeedback.impactOccurred("heavy");
}

// ПОКАЗАТИ УРОН
function showDamage(damage, isCrit) {
  const card = document.getElementById('enemyCard');
  const dmg = document.createElement('div');
  dmg.className = 'damage-number' + (isCrit ? ' crit' : '');
  dmg.textContent = '-' + damage + (isCrit ? ' КРИТ!' : '');
  dmg.style.left = (Math.random() * 60 + 20) + '%';
  dmg.style.top = '50%';
  card.appendChild(dmg);
  setTimeout(() => dmg.remove(), 1000);
}

// ПОКРАЩЕННЯ БУДІВЛІ
function upgradeBuilding(type) {
  const costs = {
    forge: 50 * gameState.buildings.forge,
    treasury: 100 * gameState.buildings.treasury,
    fortress: 200 * gameState.buildings.fortress,
    hospital: 150 * gameState.buildings.hospital,
    generator: 250 * gameState.buildings.generator
  };

  const cost = costs[type];

  if (gameState.gold >= cost) {
    gameState.gold -= cost;
    gameState.buildings[type]++;

    if (type === 'forge') {
      gameState.power = gameState.buildings.forge + gameState.bonusDamage;
    } else if (type === 'hospital') {
      gameState.playerMaxHp = 100 + (gameState.buildings.hospital - 1) * 20;
      gameState.playerHp = Math.min(gameState.playerHp + 20, gameState.playerMaxHp);
    } else if (type === 'generator') {
      gameState.maxEnergy = 10 + (gameState.buildings.generator - 1) * 2;
    }

    showMessage(`✅ Покращено!`);
    tg.HapticFeedback.notificationOccurred("success");
    checkQuests();
    checkAchievements();
    updateUI();
    saveGame();
  } else {
    showMessage(`❌ Не вистачає золота`);
    tg.HapticFeedback.notificationOccurred("error");
  }
}

// КУПИТИ ПРЕДМЕТ
function buyItem(type) {
  const items = {
    health: { 
      cost: 50, 
      effect: () => {
        gameState.playerHp = Math.min(gameState.playerHp + 50, gameState.playerMaxHp);
        showMessage('❤️ +50 HP');
      }
    },
    energy: { 
      cost: 100, 
      effect: () => {
        gameState.energy = Math.min(gameState.energy + 5, gameState.maxEnergy);
        showMessage('⚡ +5 енергії');
      }
    },
    damage: { 
      cost: 500, 
      effect: () => {
        gameState.bonusDamage += 5;
        gameState.power += 5;
        showMessage('⚔️ +5 сили назавжди!');
      }
    },
    armor: { 
      cost: 800, 
      effect: () => {
        gameState.playerMaxHp += 50;
        gameState.playerHp += 50;
        showMessage('🛡️ +50 макс. HP назавжди!');
      }
    }
  };

  const item = items[type];
  if (gameState.gold >= item.cost) {
    gameState.gold -= item.cost;
    item.effect();
    tg.HapticFeedback.notificationOccurred("success");
    checkAchievements();
    updateUI();
    saveGame();
  } else {
    showMessage('❌ Не вистачає золота');
    tg.HapticFeedback.notificationOccurred("error");
  }
}

// ЗМІНА ЛОКАЦІЇ
function changeLocation(loc) {
  const location = locations[loc];
  if (gameState.buildings.fortress < location.minLevel) {
    showMessage(`❌ Потрібен ${location.minLevel} рівень Фортеці`);
    return;
  }

  gameState.location = loc;
  spawnEnemy();
  updateUI();
  saveGame();

  document.querySelectorAll('.location-card').forEach((card, i) => {
    card.classList.toggle('active', i === loc);
  });
}

// ПЕРЕВІРКА КВЕСТІВ
function checkQuests() {
  quests.forEach(quest => {
    if (gameState.completedQuests.includes(quest.id)) return;

    let progress = 0;
    if (quest.type === 'wins') progress = gameState.wins;
    else if (quest.type === 'gold') progress = gameState.totalGold;
    else if (quest.type === 'building') {
      progress = Math.max(...Object.values(gameState.buildings));
    }

    if (progress >= quest.target) {
      gameState.completedQuests.push(quest.id);
      gameState.gold += quest.reward;
      showMessage(`📜 Квест виконано! +${quest.reward}💰`);
      tg.HapticFeedback.notificationOccurred("success");
      saveGame();
    }
  });
  updateQuests();
}

// ПЕРЕВІРКА ДОСЯГНЕНЬ
function checkAchievements() {
  achievements.forEach(ach => {
    if (gameState.unlockedAchievements.includes(ach.id)) return;
    
    if (ach.check(gameState)) {
      gameState.unlockedAchievements.push(ach.id);
      showMessage(`🏅 Досягнення: ${ach.name}!`);
      tg.HapticFeedback.notificationOccurred("success");
      saveGame();
    }
  });
  updateAchievements();
}

// ОНОВЛЕННЯ КВЕСТІВ
function updateQuests() {
  const list = document.getElementById('questsList');
  list.innerHTML = '';

  quests.forEach(quest => {
    const completed = gameState.completedQuests.includes(quest.id);
    
    let progress = 0;
    if (quest.type === 'wins') progress = gameState.wins;
    else if (quest.type === 'gold') progress = gameState.totalGold;
    else if (quest.type === 'building') {
      progress = Math.max(...Object.values(gameState.buildings));
    }

    const div = document.createElement('div');
    div.className = 'quest-item';
    div.style.opacity = completed ? '0.5' : '1';
    div.innerHTML = `
      <div class="quest-title">${completed ? '✅' : '📜'} ${quest.title}</div>
      <div class="quest-progress">${quest.desc}: ${Math.min(progress, quest.target)}/${quest.target}</div>
      <div class="quest-reward">🎁 Нагорода: ${quest.reward}💰</div>
    `;
    list.appendChild(div);
  });
}

// ОНОВЛЕННЯ ДОСЯГНЕНЬ
function updateAchievements() {
  const list = document.getElementById('achievementsList');
  list.innerHTML = '';

  achievements.forEach(ach => {
    const unlocked = gameState.unlockedAchievements.includes(ach.id);
    
    const div = document.createElement('div');
    div.className = 'achievement' + (unlocked ? ' unlocked' : '');
    div.innerHTML = `
      <div class="achievement-icon">${unlocked ? ach.icon : '🔒'}</div>
      <div class="achievement-info">
        <div class="achievement-name">${ach.name}</div>
        <div class="achievement-desc">${ach.desc}</div>
      </div>
    `;
    list.appendChild(div);
  });
}

// ЗАВАНТАЖЕННЯ РЕЙТИНГУ
function loadLeaderboard() {
  const list = document.getElementById('leaderboardList');
  list.innerHTML = '<div style="text-align:center;padding:20px;color:#666;">Завантаження...</div>';

  if (tg.CloudStorage) {
    // Отримуємо топ гравців (спрощена версія)
    const leaderboard = [
      { rank: 1, name: tg.initDataUnsafe?.user?.first_name || 'Гравець', score: gameState.wins }
    ];

    list.innerHTML = '';
    leaderboard.forEach(entry => {
      const div = document.createElement('div');
      div.className = 'leaderboard-item';
      div.innerHTML = `
        <div class="leaderboard-rank">#${entry.rank}</div>
        <div class="leaderboard-name">${entry.name}</div>
        <div class="leaderboard-score">${entry.score} 🏆</div>
      `;
      list.appendChild(div);
    });
  } else {
    list.innerHTML = '<div style="text-align:center;padding:20px;color:#666;">Рейтинг доступний тільки в Telegram</div>';
  }
}

// ОНОВЛЕННЯ UI
function updateUI() {
  const enemy = enemies[gameState.currentEnemy];

  // Ресурси
  document.getElementById('wins').textContent = gameState.wins;
  document.getElementById('gold').textContent = gameState.gold;
  document.getElementById('energy').textContent = `${gameState.energy}/${gameState.maxEnergy}`;
  document.getElementById('power').textContent = gameState.power;
  document.getElementById('damage').textContent = gameState.power;

  // Гравець
  const playerHpPercent = (gameState.playerHp / gameState.playerMaxHp) * 100;
  document.getElementById('playerHp').textContent = gameState.playerHp;
  document.getElementById('playerHpBar').style.width = playerHpPercent + '%';

  // Ворог
  document.getElementById('enemyName').textContent = enemy.name;
  document.getElementById('enemyLevel').textContent = `Рівень ${enemy.level}`;
  document.getElementById('enemyHp').textContent = Math.max(0, gameState.enemyHp);
  document.getElementById('enemyMaxHp').textContent = gameState.enemyMaxHp;
  
  const enemyHpPercent = (gameState.enemyHp / gameState.enemyMaxHp) * 100;
  document.getElementById('enemyHpBar').style.width = Math.max(0, enemyHpPercent) + '%';

  // Кнопки атаки
  document.getElementById('attackBtn').disabled = gameState.energy <= 0;
  document.getElementById('specialBtn').disabled = gameState.energy < 3;

  // Будівлі
  const buildings = ['forge', 'treasury', 'fortress', 'hospital', 'generator'];
  const costs = {
    forge: 50,
    treasury: 100,
    fortress: 200,
    hospital: 150,
    generator: 250
  };

  buildings.forEach(b => {
    const level = gameState.buildings[b];
    const cost = costs[b] * level;
    
    document.getElementById(b + 'Level').textContent = level;
    document.getElementById(b + 'Cost').textContent = cost;
    
    const btn = document.getElementById(b + 'Btn');
    btn.disabled = gameState.gold < cost;
    
    if (b === 'fortress' && level >= enemies.length) {
      btn.disabled = true;
      btn.textContent = 'Макс. рівень';
    }
  });
}

// ПЕРЕМИКАННЯ ТАБІВ
function switchTab(tab) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  
  document.getElementById(tab).classList.add('active');
  event.target.classList.add('active');

  if (tab === 'leaderboard') {
    loadLeaderboard();
  }
}

// ПОКАЗАТИ ПОВІДОМЛЕННЯ
function showMessage(text) {
  const msg = document.createElement('div');
  msg.className = 'message';
  msg.textContent = text;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 2000);
}

// СТАРТ ГРИ
loadGame();