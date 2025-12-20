# 🎮 ПОВНИЙ js/game.js — ОСТАТОЧНА ВЕРСІЯ

```javascript
// ============================================
// ІНІЦІАЛІЗАЦІЯ TELEGRAM
// ============================================
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// ============================================
// ДАНІ ГРИ
// ============================================

// ЛОКАЦІЇ
const locations = [
  { name: "Ліс", icon: "🌲", minLevel: 0, emoji: "🌲" },
  { name: "Гори", icon: "⛰️", minLevel: 2, emoji: "⛰️" },
  { name: "Замок", icon: "🏰", minLevel: 4, emoji: "🏰" },
  { name: "Пекло", icon: "🔥", minLevel: 6, emoji: "🔥" }
];

// ВОРОГИ
const enemies = [
  { name: "Загарбник", hp: 20, gold: 10, level: 1, damage: 2, emoji: "🧟" },
  { name: "Вояк", hp: 35, gold: 20, level: 2, damage: 4, emoji: "⚔️" },
  { name: "Опричник", hp: 60, gold: 35, level: 3, damage: 6, emoji: "🗡️" },
  { name: "Шляхтич", hp: 100, gold: 60, level: 4, damage: 8, emoji: "🤺" },
  { name: "Боярин", hp: 150, gold: 100, level: 5, damage: 12, emoji: "👑" },
  { name: "Воєвода", hp: 250, gold: 180, level: 6, damage: 16, emoji: "🛡️" },
  { name: "Генерал", hp: 400, gold: 300, level: 7, damage: 20, emoji: "⚜️" }
];

// БОСИ
const bosses = [
  { 
    name: "Дракон Смауг", 
    hp: 1000, 
    gold: 1000, 
    level: 10, 
    damage: 30, 
    emoji: "🐉",
    phases: [
      { hp: 66, message: "Дракон розлютився!", damageMultiplier: 1.5 },
      { hp: 33, message: "Останнє дихання дракона!", damageMultiplier: 2 }
    ]
  },
  { 
    name: "Темний Лорд", 
    hp: 2000, 
    gold: 2500, 
    level: 15, 
    damage: 50, 
    emoji: "👹",
    phases: [
      { hp: 50, message: "Темна магія активована!", damageMultiplier: 1.8 }
    ]
  }
];

// КЛАСИ ПЕРСОНАЖІВ
const classes = [
  {
    id: "warrior",
    name: "⚔️ Воїн",
    emoji: "⚔️",
    description: "Сильний ближній бій",
    bonuses: {
      damage: 3,
      hp: 50,
      critChance: 0.05
    }
  },
  {
    id: "mage",
    name: "🔮 Маг",
    emoji: "🔮",
    description: "Магічні атаки",
    bonuses: {
      damage: 5,
      hp: -20,
      critChance: 0.15,
      specialCost: -1
    }
  },
  {
    id: "archer",
    name: "🏹 Лучник",
    emoji: "🏹",
    description: "Швидкі атаки",
    bonuses: {
      damage: 2,
      hp: 20,
      critChance: 0.25,
      energyRegen: 2
    }
  }
];

// НАВИЧКИ
const skills = [
  { 
    id: 1, 
    name: "Сила", 
    icon: "💪", 
    cost: 1, 
    maxLevel: 5, 
    effect: (level) => ({ damage: level * 2 }),
    requires: null
  },
  { 
    id: 2, 
    name: "Витривалість", 
    icon: "❤️", 
    cost: 1, 
    maxLevel: 5, 
    effect: (level) => ({ hp: level * 30 }),
    requires: null
  },
  { 
    id: 3, 
    name: "Удача", 
    icon: "🍀", 
    cost: 2, 
    maxLevel: 3, 
    effect: (level) => ({ critChance: level * 0.05, goldBonus: level * 0.1 }),
    requires: null
  },
  { 
    id: 4, 
    name: "Берсерк", 
    icon: "😤", 
    cost: 3, 
    maxLevel: 3, 
    effect: (level) => ({ damage: level * 5, hp: -level * 10 }),
    requires: 1
  },
  { 
    id: 5, 
    name: "Регенерація", 
    icon: "💚", 
    cost: 2, 
    maxLevel: 3, 
    effect: (level) => ({ hpRegen: level * 5 }),
    requires: 2
  },
  { 
    id: 6, 
    name: "Критмайстер", 
    icon: "⚡", 
    cost: 3, 
    maxLevel: 2, 
    effect: (level) => ({ critDamage: level * 0.5 }),
    requires: 3
  },
  { 
    id: 7, 
    name: "Жадібність", 
    icon: "💰", 
    cost: 2, 
    maxLevel: 5, 
    effect: (level) => ({ goldBonus: level * 0.2 }),
    requires: 3
  },
  { 
    id: 8, 
    name: "Енергія", 
    icon: "⚡", 
    cost: 2, 
    maxLevel: 3, 
    effect: (level) => ({ maxEnergy: level * 3 }),
    requires: null
  },
  { 
    id: 9, 
    name: "Майстер", 
    icon: "🎯", 
    cost: 5, 
    maxLevel: 1, 
    effect: (level) => ({ damage: 20, critChance: 0.2, hp: 100 }),
    requires: [4, 5, 6]
  }
];

// ПРЕДМЕТИ
const items = [
  // Зброя
  { id: "sword1", name: "Залізний меч", emoji: "🗡️", type: "weapon", damage: 5, cost: 200 },
  { id: "sword2", name: "Сталевий меч", emoji: "⚔️", type: "weapon", damage: 10, cost: 500 },
  { id: "sword3", name: "Легендарний меч", emoji: "🗡️✨", type: "weapon", damage: 20, cost: 1500 },
  { id: "bow1", name: "Простий лук", emoji: "🏹", type: "weapon", damage: 7, critChance: 0.1, cost: 300 },
  { id: "staff1", name: "Магічний посох", emoji: "🔮", type: "weapon", damage: 12, specialCost: -1, cost: 600 },
  
  // Броня
  { id: "armor1", name: "Шкіряна броня", emoji: "🦺", type: "armor", hp: 50, cost: 250 },
  { id: "armor2", name: "Кольчуга", emoji: "🛡️", type: "armor", hp: 100, defense: 5, cost: 600 },
  { id: "armor3", name: "Лицарські обладунки", emoji: "🛡️✨", type: "armor", hp: 200, defense: 15, cost: 2000 },
  
  // Аксесуари
  { id: "ring1", name: "Кільце сили", emoji: "💍", type: "accessory", damage: 5, cost: 400 },
  { id: "ring2", name: "Кільце удачі", emoji: "💎", type: "accessory", critChance: 0.15, goldBonus: 0.2, cost: 800 },
  { id: "amulet1", name: "Амулет життя", emoji: "📿", type: "accessory", hp: 150, hpRegen: 10, cost: 1000 },
  
  // Витратні
  { id: "potion", name: "Зілля здоров'я", emoji: "🧪", type: "consumable", healAmount: 50, cost: 50, stackable: true },
  { id: "energyDrink", name: "Енергетик", emoji: "⚡", type: "consumable", energyAmount: 5, cost: 100, stackable: true },
  { id: "bombHP", name: "Бомба відновлення", emoji: "💊", type: "consumable", healAmount: 200, cost: 200, stackable: true }
];

// КВЕСТИ
const quests = [
  { id: 1, title: "Перша кров", desc: "Переможи 10 ворогів", target: 10, reward: 100, type: "wins" },
  { id: 2, title: "Багатій", desc: "Заробіть 500 золота", target: 500, reward: 200, type: "gold" },
  { id: 3, title: "Майстер бою", desc: "Переможи 50 ворогів", target: 50, reward: 500, type: "wins" },
  { id: 4, title: "Покращувач", desc: "Покращ будівлю до 5 рівня", target: 5, reward: 300, type: "building" },
  { id: 5, title: "Скарби", desc: "Збери 2000 золота", target: 2000, reward: 1000, type: "gold" },
  { id: 6, title: "Легенда", desc: "Переможи 100 ворогів", target: 100, reward: 2000, type: "wins" },
  { id: 7, title: "Вбивця босів", desc: "Переможи першого боса", target: 1, reward: 1500, type: "boss" },
  { id: 8, title: "Колекціонер", desc: "Збери 5 предметів", target: 5, reward: 800, type: "items" }
];

// ДОСЯГНЕННЯ
const achievements = [
  { id: 1, name: "Початківець", desc: "10 перемог", icon: "🥉", check: s => s.wins >= 10, reward: 100 },
  { id: 2, name: "Ветеран", desc: "50 перемог", icon: "🥈", check: s => s.wins >= 50, reward: 500 },
  { id: 3, name: "Легенда", desc: "100 перемог", icon: "🥇", check: s => s.wins >= 100, reward: 1000 },
  { id: 4, name: "Скарби", desc: "1000 золота", icon: "💰", check: s => s.totalGold >= 1000, reward: 200 },
  { id: 5, name: "Сила", desc: "20 сили", icon: "💪", check: s => s.getTotalDamage() >= 20, reward: 300 },
  { id: 6, name: "Невмирущий", desc: "300 макс HP", icon: "❤️", check: s => s.getTotalMaxHP() >= 300, reward: 500 },
  { id: 7, name: "Майстер", desc: "Всі будівлі 10 рівня", icon: "🏗️", check: s => Math.min(...Object.values(s.buildings)) >= 10, reward: 2000 },
  { id: 8, name: "Вбивця босів", desc: "Переможи 3 босів", icon: "🐉", check: s => s.bossesDefeated >= 3, reward: 3000 },
  { id: 9, name: "Колекціонер", desc: "10 предметів", icon: "🎒", check: s => s.inventory.length >= 10, reward: 1000 },
  { id: 10, name: "Майстер класу", desc: "Всі навички прокачані", icon: "🌟", check: s => s.getTotalSkillLevel() >= 30, reward: 5000 }
];

// ============================================
// СТАН ГРИ
// ============================================
let gameState = {
  // Основне
  wins: 0,
  gold: 0,
  totalGold: 0,
  
  // Бій
  power: 1,
  currentEnemy: 0,
  enemyHp: 20,
  enemyMaxHp: 20,
  isBoss: false,
  currentBoss: null,
  bossPhase: 0,
  bossesDefeated: 0,
  
  // Гравець
  playerHp: 100,
  playerMaxHp: 100,
  energy: 10,
  maxEnergy: 10,
  
  // Прогрес
  location: 0,
  playerClass: null,
  level: 1,
  exp: 0,
  expToNext: 100,
  skillPoints: 0,
  
  // Будівлі
  buildings: { 
    forge: 1, 
    treasury: 1, 
    fortress: 1, 
    hospital: 1, 
    generator: 1 
  },
  
  // Навички
  skills: {},
  
  // Інвентар
  inventory: [],
  equipped: {
    weapon: null,
    armor: null,
    accessory: null
  },
  
  // Квести та досягнення
  completedQuests: [],
  unlockedAchievements: [],
  
  // Система
  lastDaily: 0,
  bonusDamage: 0,
  lastEnergyRegen: Date.now(),
  
  // Реферальна система
  referralCode: null,
  referredBy: null,
  referrals: 0,
  referralRewards: 0
};

// ============================================
// МЕТОДИ GAMESTATE
// ============================================

// Загальний урон
gameState.getTotalDamage = function() {
  let damage = this.power + this.bonusDamage;
  
  // Клас
  if (this.playerClass) {
    damage += getClassBonus('damage');
  }
  
  // Навички
  damage += getSkillBonus('damage');
  
  // Екіпірування
  if (this.equipped.weapon) {
    const weapon = items.find(i => i.id === this.equipped.weapon);
    damage += weapon.damage || 0;
  }
  if (this.equipped.accessory) {
    const acc = items.find(i => i.id === this.equipped.accessory);
    damage += acc.damage || 0;
  }
  
  return damage;
};

// Максимальне HP
gameState.getTotalMaxHP = function() {
  let hp = this.playerMaxHp;
  
  // Клас
  if (this.playerClass) {
    hp += getClassBonus('hp');
  }
  
  // Навички
  hp += getSkillBonus('hp');
  
  // Екіпірування
  if (this.equipped.armor) {
    const armor = items.find(i => i.id === this.equipped.armor);
    hp += armor.hp || 0;
  }
  if (this.equipped.accessory) {
    const acc = items.find(i => i.id === this.equipped.accessory);
    hp += acc.hp || 0;
  }
  
  return Math.max(hp, 10);
};

// Шанс криту
gameState.getCritChance = function() {
  let chance = 0.15;
  
  if (this.playerClass) {
    chance += getClassBonus('critChance');
  }
  
  chance += getSkillBonus('critChance');
  
  if (this.equipped.weapon) {
    const weapon = items.find(i => i.id === this.equipped.weapon);
    chance += weapon.critChance || 0;
  }
  if (this.equipped.accessory) {
    const acc = items.find(i => i.id === this.equipped.accessory);
    chance += acc.critChance || 0;
  }
  
  return Math.min(chance, 0.9);
};

// Бонус золота
gameState.getGoldBonus = function() {
  let bonus = 1;
  
  bonus += getSkillBonus('goldBonus');
  
  if (this.equipped.accessory) {
    const acc = items.find(i => i.id === this.equipped.accessory);
    bonus += acc.goldBonus || 0;
  }
  
  return bonus;
};

// Вартість спецатаки
gameState.getSpecialCost = function() {
  let cost = 3;
  
  if (this.playerClass) {
    cost += getClassBonus('specialCost') || 0;
  }
  
  if (this.equipped.weapon) {
    const weapon = items.find(i => i.id === this.equipped.weapon);
    cost += weapon.specialCost || 0;
  }
  
  return Math.max(cost, 1);
};

// Загальний рівень навичок
gameState.getTotalSkillLevel = function() {
  return Object.values(this.skills).reduce((sum, level) => sum + level, 0);
};

// ============================================
// БОНУСИ
// ============================================

// Бонуси класу
function getClassBonus(type) {
  if (!gameState.playerClass) return 0;
  const classData = classes.find(c => c.id === gameState.playerClass);
  return classData?.bonuses[type] || 0;
}

// Бонуси навичок
function getSkillBonus(type) {
  let bonus = 0;
  
  Object.keys(gameState.skills).forEach(skillId => {
    const skill = skills.find(s => s.id === parseInt(skillId));
    const level = gameState.skills[skillId];
    const effect = skill.effect(level);
    
    if (effect[type]) {
      bonus += effect[type];
    }
  });
  
  return bonus;
}

// ============================================
// ЗАВАНТАЖЕННЯ ТА ЗБЕРЕЖЕННЯ
// ============================================
function loadGame() {
  if (tg.CloudStorage) {
    tg.CloudStorage.getItem('gameState', (err, data) => {
      if (data) {
        const loaded = JSON.parse(data);
        Object.assign(gameState, loaded);
        initGame();
      } else {
        generateReferralCode();
        initGame();
      }
    });
  } else {
    const saved = localStorage.getItem('kozakGame');
    if (saved) {
      const loaded = JSON.parse(saved);
      Object.assign(gameState, loaded);
    } else {
      generateReferralCode();
    }
    initGame();
  }
}

function saveGame() {
  const data = JSON.stringify(gameState);
  if (tg.CloudStorage) {
    tg.CloudStorage.setItem('gameState', data);
    
    // Рейтинг
    const userId = tg.initDataUnsafe?.user?.id || 'guest_' + Math.random();
    tg.CloudStorage.setItem('lb_' + userId, JSON.stringify({
      name: tg.initDataUnsafe?.user?.first_name || 'Гравець',
      score: gameState.wins,
      gold: gameState.totalGold,
      level: gameState.level
    }));
  } else {
    localStorage.setItem('kozakGame', data);
  }
}

function initGame() {
  checkDailyReward();
  regenerateEnergy();
  spawnEnemy();
  renderLocations();
  renderClasses();
  renderSkills();
  renderInventory();
  renderBuildings();
  renderShop();
  updateUI();
  updateQuests();
  updateAchievements();
  
  // Регенерація енергії
  setInterval(regenerateEnergy, 60000);
  
  // Авторегенерація HP
  setInterval(autoHeal, 30000);
}

// ============================================
// СИСТЕМИ
// ============================================

// Щоденна нагорода
function checkDailyReward() {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  if (now - gameState.lastDaily > day) {
    gameState.lastDaily = now;
    const reward = 100 + gameState.level * 50;
    gameState.gold += reward;
    gameState.energy = gameState.maxEnergy;
    showMessage(`🎁 Щоденна нагорода: ${reward}💰 + повна енергія!`);
    saveGame();
  }
}

// Регенерація енергії
function regenerateEnergy() {
  const now = Date.now();
  const minutesPassed = Math.floor((now - gameState.lastEnergyRegen) / 60000);
  
  if (minutesPassed > 0 && gameState.energy < gameState.maxEnergy) {
    const regen = minutesPassed * (1 + getClassBonus('energyRegen'));
    gameState.energy = Math.min(gameState.energy + regen, gameState.maxEnergy);
    gameState.lastEnergyRegen = now;
    updateUI();
    saveGame();
  }
}

// Авторегенерація HP
function autoHeal() {
  const healAmount = getSkillBonus('hpRegen');
  if (healAmount > 0 && gameState.playerHp < gameState.getTotalMaxHP()) {
    gameState.playerHp = Math.min(gameState.playerHp + healAmount, gameState.getTotalMaxHP());
    updateUI();
  }
}

// Додавання досвіду
function addExp(amount) {
  gameState.exp += amount;
  
  while (gameState.exp >= gameState.expToNext) {
    gameState.exp -= gameState.expToNext;
    gameState.level++;
    gameState.skillPoints++;
    gameState.expToNext = Math.floor(gameState.expToNext * 1.5);
    
    showMessage(`🌟 Новий рівень ${gameState.level}! +1 очко навичок`);
    tg.HapticFeedback.notificationOccurred("success");
  }
  
  updateUI();
}

// Реферальна система
function generateReferralCode() {
  const userId = tg.initDataUnsafe?.user?.id || Date.now();
  gameState.referralCode = 'REF_' + userId.toString(36).toUpperCase();
}

// ============================================
// БІЙ
// ============================================

// Створення ворога
function spawnEnemy() {
  // 5% шанс боса
  if (Math.random() < 0.05 && gameState.level >= 10) {
    spawnBoss();
    return;
  }
  
  gameState.isBoss = false;
  const maxLevel = Math.min(gameState.buildings.fortress + gameState.location * 2, enemies.length - 1);
  const minLevel = gameState.location * 2;
  gameState.currentEnemy = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
  const enemy = enemies[gameState.currentEnemy];
  gameState.enemyHp = enemy.hp;
  gameState.enemyMaxHp = enemy.hp;
  
  document.getElementById('enemyImage').textContent = enemy.emoji;
}

// Створення боса
function spawnBoss() {
  gameState.isBoss = true;
  const availableBosses = bosses.filter(b => gameState.level >= b.level);
  if (availableBosses.length === 0) {
    spawnEnemy();
    return;
  }
  
  gameState.currentBoss = availableBosses[Math.floor(Math.random() * availableBosses.length)];
  gameState.bossPhase = 0;
  gameState.enemyHp = gameState.currentBoss.hp;
  gameState.enemyMaxHp = gameState.currentBoss.hp;
  
  document.getElementById('enemyImage').textContent = gameState.currentBoss.emoji;
  document.getElementById('enemyCard').style.background = 'linear-gradient(135deg, #9C27B0, #7B1FA2)';
  showMessage(`⚠️ БОС ПОЯВИВСЯ: ${gameState.currentBoss.name}!`);
}

// Атака
function attack() {
  if (gameState.energy <= 0) {
    showMessage('❌ Немає енергії! Зачекай 1 хв.');
    return;
  }

  gameState.energy--;
  const enemy = gameState.isBoss ? gameState.currentBoss : enemies[gameState.currentEnemy];
  
  const isCrit = Math.random() < gameState.getCritChance();
  let damage = gameState.getTotalDamage();
  
  if (isCrit) {
    const critMultiplier = 2 + getSkillBonus('critDamage');
    damage = Math.floor(damage * critMultiplier);
  }
  
  gameState.enemyHp -= damage;
  showDamage(damage, isCrit);
  
  document.getElementById('enemyCard').classList.add('shake');
  setTimeout(() => document.getElementById('enemyCard').classList.remove('shake'), 300);

  // Перевірка фаз боса
  if (gameState.isBoss) {
    checkBossPhase();
  }

  if (gameState.enemyHp <= 0) {
    handleVictory(enemy);
  } else {
    // Ворог атакує
    setTimeout(() => enemyAttack(enemy), 500);
  }

  updateUI();
  saveGame();
  tg.HapticFeedback.impactOccurred("medium");
}

// Спеціальна атака
function specialAttack() {
  const cost = gameState.getSpecialCost();
  
  if (gameState.energy < cost) {
    showMessage(`❌ Потрібно ${cost} енергії!`);
    return;
  }

  gameState.energy -= cost;
  const enemy = gameState.isBoss ? gameState.currentBoss : enemies[gameState.currentEnemy];
  const damage = gameState.getTotalDamage() * 3;
  
  gameState.enemyHp -= damage;
  showDamage(damage, true);
  
  document.getElementById('enemyCard').classList.add('shake');
  setTimeout(() => document.getElementById('enemyCard').classList.remove('shake'), 300);

  if (gameState.isBoss) {
    checkBossPhase();
  }

  if (gameState.enemyHp <= 0) {
    handleVictory(enemy);
  }

  updateUI();
  saveGame();
  tg.HapticFeedback.impactOccurred("heavy");
}

// Атака ворога
function enemyAttack(enemy) {
  if (gameState.enemyHp <= 0) return;
  
  let enemyDamage = enemy.damage;
  
  // Фаза боса
  if (gameState.isBoss && gameState.bossPhase > 0) {
    const phase = gameState.currentBoss.phases[gameState.bossPhase - 1];
    enemyDamage = Math.floor(enemyDamage * phase.damageMultiplier);
  }
  
  // Зменшення урону від захисту
  const defense = Math.floor(gameState.buildings.hospital / 2);
  if (gameState.equipped.armor) {
    const armor = items.find(i => i.id === gameState.equipped.armor);
    enemyDamage -= (armor.defense || 0);
  }
  
  enemyDamage = Math.max(1, enemyDamage - defense);
  
  gameState.playerHp = Math.max(0, gameState.playerHp - enemyDamage);
  showMessage(`💔 Ворог атакував: -${enemyDamage} HP`);
  
  if (gameState.playerHp <= 0) {
    showMessage('☠️ Ви програли! HP відновлено.');
    gameState.playerHp = gameState.getTotalMaxHP();
    spawnEnemy();
  }
  
  updateUI();
  saveGame();
}

// Перевірка фази боса
function checkBossPhase() {
  if (!gameState.currentBoss || !gameState.currentBoss.phases) return;
  
  const hpPercent = (gameState.enemyHp / gameState.enemyMaxHp) * 100;
  
  gameState.currentBoss.phases.forEach((phase, index) => {
    if (hpPercent <= phase.hp && gameState.bossPhase === index) {
      gameState.bossPhase = index + 1;
      showMessage(`⚠️ ${phase.message}`);
      tg.HapticFeedback.notificationOccurred("warning");
    }
  });
}

// Перемога
function handleVictory(enemy) {
  let goldReward = enemy.gold + (gameState.buildings.treasury - 1) * 10;
  goldReward = Math.floor(goldReward * gameState.getGoldBonus());
  
  gameState.wins++;
  gameState.gold += goldReward;
  gameState.totalGold += goldReward;
  
  // Досвід
  const expReward = gameState.isBoss ? enemy.level * 50 : enemy.level * 10;
  addExp(expReward);
  
  if (gameState.isBoss) {
    gameState.bossesDefeated++;
    showMessage(`🏆 БОС ПЕРЕМОЖЕНИЙ! +${goldReward}💰 +${expReward}⭐`);
    document.getElementById('enemyCard').style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a6f)';
  } else {
    showMessage(`🏆 Перемога! +${goldReward}💰 +${expReward}⭐`);
  }
  
  tg.HapticFeedback.notificationOccurred("success");
  spawnEnemy();
  checkQuests();
  checkAchievements();
  updateUI();
  saveGame();
}

// Показати урон
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

// Використати зілля
function usePotion() {
  const potion = gameState.inventory.find(item => {
    const itemData = items.find(i => i.id === item.id);
    return itemData.type === 'consumable' && itemData.healAmount;
  });
  
  if (!potion) {
    showMessage('❌ Немає зілля!');
    return;
  }
  
  const itemData = items.find(i => i.id === potion.id);
  gameState.playerHp = Math.min(gameState.playerHp + itemData.healAmount, gameState.getTotalMaxHP());
  
  // Видалити зілля
  if (potion.count > 1) {
    potion.count--;
  } else {
    gameState.inventory = gameState.inventory.filter(i => i !== potion);
  }
  
  showMessage(`❤️ +${itemData.healAmount} HP`);
  tg.HapticFeedback.notificationOccurred("success");
  renderInventory();
  updateUI();
  saveGame();
}

// ============================================
// БУДІВЛІ
// ============================================
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
      gameState.power = gameState.buildings.forge;
    } else if (type === 'hospital') {
      gameState.playerMaxHp = 100 + (gameState.buildings.hospital - 1) * 20;
      gameState.playerHp = Math.min(gameState.playerHp + 20, gameState.getTotalMaxHP());
    } else if (type === 'generator') {
      gameState.maxEnergy = 10 + (gameState.buildings.generator - 1) * 2;
    }

    showMessage(`✅ Покращено!`);
    tg.HapticFeedback.notificationOccurred("success");
    checkQuests();
    checkAchievements();
    renderBuildings();
    updateUI();
    saveGame();
  } else {
    showMessage(`❌ Не вистачає золота`);
    tg.HapticFeedback.notificationOccurred("error");
  }
}

function renderBuildings() {
  const list = document.getElementById('buildingsList');
  list.innerHTML = '';
  
  const buildingsData = [
    { id: 'forge', name: '⚔️ Кузня', desc: '+1 до сили атаки' },
    { id: 'treasury', name: '💰 Скарбниця', desc: '+10 золота за перемогу' },
    { id: 'fortress', name: '🏰 Фортеця', desc: 'Відкриває нових ворогів' },
    { id: 'hospital', name: '❤️ Госпіталь', desc: '+20 макс. здоров\'я' },
    { id: 'generator', name: '⚡ Генератор', desc: '+2 макс. енергії' }
  ];
  
  const costs = {
    forge: 50,
    treasury: 100,
    fortress: 200,
    hospital: 150,
    generator: 250
  };
  
  buildingsData.forEach(building => {
    const level = gameState.buildings[building.id];
    const cost = costs[building.id] * level;
    
    const div = document.createElement('div');
    div.className = 'building';
    div.innerHTML = `
      <div class="building-header">
        <div class="building-title">${building.name}</div>
        <div class="building-level">Рівень ${level}</div>
      </div>
      <div class="building-desc">${building.desc}</div>
      <div class="building-cost">💰 ${cost}</div>
      <button class="btn btn-upgrade" onclick="upgradeBuilding('${building.id}')" ${gameState.gold < cost ? 'disabled' : ''}>Покращити</button>
    `;
    list.appendChild(div);
  });
}

// ============================================
// МАГАЗИН
// ============================================
function renderShop() {
  const list = document.getElementById('shopItems');
  list.innerHTML = '';
  
  const shopItems = items.filter(item => {
    // Показуємо тільки якщо немає в інвентарі (крім витратних)
    if (item.stackable) return true;
    return !gameState.inventory.some(inv => inv.id === item.id) && 
           !Object.values(gameState.equipped).includes(item.id);
  });
  
  shopItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'shop-item';
    div.onclick = () => buyItem(item.id);
    div.innerHTML = `
      <div class="shop-info">
        <div class="shop-name">${item.emoji} ${item.name}</div>
        <div class="shop-desc">${getItemDescription(item)}</div>
      </div>
      <div class="shop-price">${item.cost}💰</div>
    `;
    list.appendChild(div);
  });
}

function getItemDescription(item) {
  const parts = [];
  if (item.damage) parts.push(`+${item.damage} урону`);
  if (item.hp) parts.push(`+${item.hp} HP`);
  if (item.critChance) parts.push(`+${Math.floor(item.critChance * 100)}% крит`);
  if (item.defense) parts.push(`+${item.defense} захисту`);
  if (item.healAmount) parts.push(`+${item.healAmount} HP (витратне)`);
  if (item.energyAmount) parts.push(`+${item.energyAmount} енергії`);
  if (item.goldBonus) parts.push(`+${Math.floor(item.goldBonus * 100)}% золота`);
  if (item.hpRegen) parts.push(`+${item.hpRegen} регенерації`);
  if (item.specialCost) parts.push(`${item.specialCost} вартість спецатаки`);
  return parts.join(', ') || 'Предмет';
}

function buyItem(itemId) {
  const item = items.find(i => i.id === itemId);
  
  if (gameState.gold < item.cost) {
    showMessage('❌ Не вистачає золота');
    tg.HapticFeedback.notificationOccurred("error");
    return;
  }
  
  // Перевірка місця (макс 20 предметів)
  if (gameState.inventory.length >= 20 && !item.stackable) {
    showMessage('❌ Інвентар переповнений!');
    return;
  }
  
  gameState.gold -= item.cost;
  
  // Додати в інвентар
  if (item.stackable) {
    const existing = gameState.inventory.find(i => i.id === itemId);
    if (existing) {
      existing.count++;
    } else {
      gameState.inventory.push({ id: itemId, count: 1 });
    }
  } else {
    gameState.inventory.push({ id: itemId, count: 1 });
  }
  
  showMessage(`✅ Куплено: ${item.emoji} ${item.name}`);
  tg.HapticFeedback.notificationOccurred("success");
  checkQuests();
  checkAchievements();
  renderShop();
  renderInventory();
  updateUI();
  saveGame();
}

// ============================================
// ІНВЕНТАР
// ============================================
function renderInventory() {
  const grid = document.getElementById('inventoryGrid');
  grid.innerHTML = '';
  
  // 20 слотів
  for (let i = 0; i < 20; i++) {
    const slot = document.createElement('div');
    slot.className = 'inventory-slot';
    
    if (i < gameState.inventory.length) {
      const invItem = gameState.inventory[i];
      const item = items.find(it => it.id === invItem.id);
      slot.classList.add('filled');
      slot.innerHTML = item.emoji + (invItem.count > 1 ? `<div style="position:absolute;bottom:2px;right:2px;font-size:10px;background:rgba(0,0,0,0.7);padding:2px 4px;border-radius:3px;color:#fff;">${invItem.count}</div>` : '');
      slot.onclick = () => useItem(invItem.id);
    }
    
    grid.appendChild(slot);
  }
  
  // Показати кнопку зілля якщо є
  const hasPotion = gameState.inventory.some(item => {
    const itemData = items.find(i => i.id === item.id);
    return itemData.type === 'consumable' && itemData.healAmount;
  });
  const potionBtn = document.getElementById('potionBtn');
  if (potionBtn) {
    potionBtn.style.display = hasPotion ? 'block' : 'none';
  }
}

function useItem(itemId) {
  const item = items.find(i => i.id === itemId);
  
  if (item.type === 'consumable') {
    if (item.healAmount) {
      gameState.playerHp = Math.min(gameState.playerHp + item.healAmount, gameState.getTotalMaxHP());
      showMessage(`❤️ +${item.healAmount} HP`);
    }
    if (item.energyAmount) {
      gameState.energy = Math.min(gameState.energy + item.energyAmount, gameState.maxEnergy);
      showMessage(`⚡ +${item.energyAmount} енергії`);
    }
    
    // Видалити
    const invItem = gameState.inventory.find(i => i.id === itemId);
    if (invItem.count > 1) {
      invItem.count--;
    } else {
      gameState.inventory = gameState.inventory.filter(i => i.id !== itemId);
    }
    
    tg.HapticFeedback.notificationOccurred("success");
    renderInventory();
    updateUI();
    saveGame();
  } else {
    // Екіпірувати
    equipItem(itemId);
  }
}

function equipItem(itemId) {
  const item = items.find(i => i.id === itemId);
  const slot = item.type;
  
  // Зняти старий предмет
  if (gameState.equipped[slot]) {
    const oldItem = gameState.equipped[slot];
    gameState.inventory.push({ id: oldItem, count: 1 });
  }
  
  // Екіпірувати новий
  gameState.equipped[slot] = itemId;
  gameState.inventory = gameState.inventory.filter(i => i.id !== itemId);
  
  showMessage(`✅ Екіпіровано: ${item.emoji} ${item.name}`);
  tg.HapticFeedback.notificationOccurred("success");
  renderInventory();
  updateEquipment();
  updateUI();
  saveGame();
}

function updateEquipment() {
  // Оновити слоти екіпірування
  ['weapon', 'armor', 'accessory'].forEach(slot => {
    const slotEl = document.getElementById(slot + 'Slot');
    if (!slotEl) return;
    
    if (gameState.equipped[slot]) {
      const item = items.find(i => i.id === gameState.equipped[slot]);
      slotEl.textContent = item.emoji;
      slotEl.style.background = 'linear-gradient(135deg, #FFD700, #FFA000)';
      slotEl.onclick = () => unequipItem(slot);
      slotEl.style.cursor = 'pointer';
    } else {
      slotEl.textContent = slot === 'weapon' ? '⚔️' : slot === 'armor' ? '🛡️' : '💍';
      slotEl.style.background = '#e0e0e0';
      slotEl.onclick = null;
      slotEl.style.cursor = 'default';
    }
  });
}

function unequipItem(slot) {
  if (!gameState.equipped[slot]) return;
  
  if (gameState.inventory.length >= 20) {
    showMessage('❌ Інвентар переповнений!');
    return;
  }
  
  const itemId = gameState.equipped[slot];
  gameState.inventory.push({ id: itemId, count: 1 });
  gameState.equipped[slot] = null;
  
  showMessage('✅ Предмет знято');
  renderInventory();
  updateEquipment();
  updateUI();
  saveGame();
}

// ============================================
// КЛАСИ
// ============================================
function renderClasses() {
  const container = document.getElementById('classSelect');
  if (!container) return;
  
  container.innerHTML = '';
  
  classes.forEach(cls => {
    const div = document.createElement('div');
    div.className = 'class-card';
    if (gameState.playerClass === cls.id) {
      div.classList.add('selected');
    }
    div.onclick = () => selectClass(cls.id);
    div.innerHTML = `
      <div class="class-icon">${cls.emoji}</div>
      <div class="class-name">${cls.name}</div>
    `;
    container.appendChild(div);
  });
  
  updateClassInfo();
}

function selectClass(classId) {
  if (gameState.playerClass && gameState.level > 5) {
    showMessage('❌ Неможливо змінити клас після 5 рівня');
    return;
  }
  
  gameState.playerClass = classId;
  const cls = classes.find(c => c.id === classId);
  showMessage(`✅ Обрано клас: ${cls.name}`);
  tg.HapticFeedback.notificationOccurred("success");
  renderClasses();
  updateUI();
  saveGame();
}

function updateClassInfo() {
  const info = document.getElementById('classInfo');
  if (!info) return;
  
  if (!gameState.playerClass) {
    info.textContent = 'Обери клас щоб побачити бонуси';
    return;
  }
  
  const cls = classes.find(c => c.id === gameState.playerClass);
  const bonuses = [];
  if (cls.bonuses.damage) bonuses.push(`+${cls.bonuses.damage} урону`);
  if (cls.bonuses.hp) bonuses.push(`${cls.bonuses.hp > 0 ? '+' : ''}${cls.bonuses.hp} HP`);
  if (cls.bonuses.critChance) bonuses.push(`+${Math.floor(cls.bonuses.critChance * 100)}% крит`);
  if (cls.bonuses.specialCost) bonuses.push(`${cls.bonuses.specialCost} вартість спецатаки`);
  if (cls.bonuses.energyRegen) bonuses.push(`+${cls.bonuses.energyRegen} регенерація енергії`);
  
  info.innerHTML = `<strong>${cls.name}</strong><br>${cls.description}<br>Бонуси: ${bonuses.join(', ')}`;
}

// ============================================
// НАВИЧКИ
// ============================================
function renderSkills() {
  const tree = document.getElementById('skillTree');
  if (!tree) return;
  
  tree.innerHTML = '';
  
  skills.forEach(skill => {
    const level = gameState.skills[skill.id] || 0;
    const maxed = level >= skill.maxLevel;
    const canUnlock = canUnlockSkill(skill);
    
    const div = document.createElement('div');
    div.className = 'skill-card';
    if (level > 0) div.classList.add('unlocked');
    if (!canUnlock && level === 0) div.classList.add('locked');
    
    div.onclick = () => unlockSkill(skill.id);
    div.innerHTML = `
      <div class="skill-icon">${skill.icon}</div>
      <div class="skill-name">${skill.name}</div>
      <div style="font-size:10px;margin-top:2px;">${level}/${skill.maxLevel}</div>
      ${level === 0 ? `<div style="font-size:10px;color:#FFD700;">💎 ${skill.cost}</div>` : ''}
    `;
    tree.appendChild(div);
  });
  
  const skillPointsEl = document.getElementById('skillPoints');
  if (skillPointsEl) {
    skillPointsEl.textContent = gameState.skillPoints;
  }
}

function canUnlockSkill(skill) {
  // Перевірити вимоги
  if (skill.requires === null) return true;
  
  if (Array.isArray(skill.requires)) {
    return skill.requires.every(reqId => (gameState.skills[reqId] || 0) > 0);
  }
  
  return (gameState.skills[skill.requires] || 0) > 0;
}

function unlockSkill(skillId) {
  const skill = skills.find(s => s.id === skillId);
  const currentLevel = gameState.skills[skillId] || 0;
  
  if (currentLevel >= skill.maxLevel) {
    showMessage('❌ Навичка вже максимального рівня');
    return;
  }
  
  if (!canUnlockSkill(skill)) {
    showMessage('❌ Потрібно спочатку відкрити інші навички');
    return;
  }
  
  if (gameState.skillPoints < skill.cost) {
    showMessage('❌ Недостатньо очок навичок');
    return;
  }
  
  gameState.skillPoints -= skill.cost;
  gameState.skills[skillId] = currentLevel + 1;
  
  showMessage(`✅ Навичка покращена: ${skill.name}`);
  tg.HapticFeedback.notificationOccurred("success");
  checkAchievements();
  renderSkills();
  updateUI();
  saveGame();
}

// ============================================
// ЛОКАЦІЇ
// ============================================
function renderLocations() {
  const container = document.getElementById('locationSelect');
  if (!container) return;
  
  container.innerHTML = '';
  
  locations.forEach((loc, index) => {
    const div = document.createElement('div');
    div.className = 'location-card';
    
    const unlocked = gameState.buildings.fortress >= loc.minLevel;
    if (gameState.location === index) div.classList.add('active');
    if (!unlocked) div.classList.add('locked');
    
    div.onclick = () => unlocked && changeLocation(index);
    div.innerHTML = `
      <div class="location-icon">${loc.emoji}</div>
      <div class="location-name">${loc.name}</div>
      ${!unlocked ? `<div style="font-size:10px;color:#999;">🔒 ${loc.minLevel} рівень</div>` : ''}
    `;
    container.appendChild(div);
  });
}

function changeLocation(loc) {
  const location = locations[loc];
  if (gameState.buildings.fortress < location.minLevel) {
    showMessage(`❌ Потрібен ${location.minLevel} рівень Фортеці`);
    return;
  }

  gameState.location = loc;
  spawnEnemy();
  renderLocations();
  updateUI();
  saveGame();
}

// ============================================
// КВЕСТИ
// ============================================
function checkQuests() {
  quests.forEach(quest => {
    if (gameState.completedQuests.includes(quest.id)) return;

    let progress = 0;
    if (quest.type === 'wins') progress = gameState.wins;
    else if (quest.type === 'gold') progress = gameState.totalGold;
    else if (quest.type === 'building') {
      progress = Math.max(...Object.values(gameState.buildings));
    }
    else if (quest.type === 'boss') progress = gameState.bossesDefeated;
    else if (quest.type === 'items') progress = gameState.inventory.length;

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

function updateQuests() {
  const list = document.getElementById('questsList');
  if (!list) return;
  
  list.innerHTML = '';

  quests.forEach(quest => {
    const completed = gameState.completedQuests.includes(quest.id);
    
    let progress = 0;
    if (quest.type === 'wins') progress = gameState.wins;
    else if (quest.type === 'gold') progress = gameState.totalGold;
    else if (quest.type === 'building') {
      progress = Math.max(...Object.values(gameState.buildings));
    }
    else if (quest.type === 'boss') progress = gameState.bossesDefeated;
    else if (quest.type === 'items') progress = gameState.inventory.length;

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

// ============================================
// ДОСЯГНЕННЯ
// ============================================
function checkAchievements() {
  achievements.forEach(ach => {
    if (gameState.unlockedAchievements.includes(ach.id)) return;
    
    if (ach.check(gameState)) {
      gameState.unlockedAchievements.push(ach.id);
      gameState.gold += ach.reward;
      showMessage(`🏅 Досягнення: ${ach.name}! +${ach.reward}💰`);
      tg.HapticFeedback.notificationOccurred("success");
      saveGame();
    }
  });
  updateAchievements();
}

function updateAchievements() {
  const list = document.getElementById('achievementsList');
  if (!list) return;
  
  list.innerHTML = '';

  achievements.forEach(ach => {
    const unlocked = gameState.unlockedAchievements.includes(ach.id);
    
    const div = document.createElement('div');
    div.className = 'achievement' + (unlocked ? ' unlocked' : '');
    div.innerHTML = `
      <div class="achievement-icon">${unlocked ? ach.icon : '🔒'}</div>
      <div class="achievement-info">
        <div class="achievement-name">${ach.name}</div>
        <div class="achievement-desc">${ach.desc}${unlocked ? ` | Нагорода: ${ach.reward}💰` : ''}</div>
      </div>
    `;
    list.appendChild(div);
  });
}

// ============================================
// РЕЙТИНГ
// ============================================
function loadLeaderboard() {
  const list = document.getElementById('leaderboardList');
  if (!list) return;
  
  list.innerHTML = '<div style="text-align:center;padding:20px;color:#666;">Завантаження...</div>';

  setTimeout(() => {
    const leaderboard = [
      { 
        rank: 1, 
        name: tg.initDataUnsafe?.user?.first_name || 'Гравець', 
        score: gameState.wins,
        level: gameState.level
      }
    ];

    list.innerHTML = '';
    leaderboard.forEach(entry => {
      const div = document.createElement('div');
      div.className = 'leaderboard-item';
      div.innerHTML = `
        <div class="leaderboard-rank">#${entry.rank}</div>
        <div class="leaderboard-name">${entry.name} (${entry.level}ур)</div>
        <div class="leaderboard-score">${entry.score} 🏆</div>
      `;
      list.appendChild(div);
    });
    
    // Додати реферальний код
    const refDiv = document.createElement('div');
    refDiv.style.cssText = 'margin-top:15px;padding:15px;background:#FFF8DC;border-radius:10px;text-align:center;';
    refDiv.innerHTML = `
      <div style="font-weight:bold;margin-bottom:8px;color:#000;">🎁 Запроси друзів</div>
      <div style="font-size:12px;color:#666;margin-bottom:8px;">Твій реферальний код:</div>
      <div style="background:#FFD700;padding:8px;border-radius:8px;font-weight:bold;color:#000;margin-bottom:8px;">${gameState.referralCode}</div>
      <div style="font-size:12px;color:#666;">Запрошено: ${gameState.referrals} | Отримано: ${gameState.referralRewards}💰</div>
    `;
    list.appendChild(refDiv);
  }, 500);
}

// ============================================
// ОНОВЛЕННЯ UI
// ============================================
function updateUI() {
  const enemy = gameState.isBoss ? gameState.currentBoss : enemies[gameState.currentEnemy];

  // Ресурси
  const winsEl = document.getElementById('wins');
  const goldEl = document.getElementById('gold');
  const energyEl = document.getElementById('energy');
  const powerEl = document.getElementById('power');
  const damageEl = document.getElementById('damage');
  
  if (winsEl) winsEl.textContent = gameState.wins;
  if (goldEl) goldEl.textContent = gameState.gold;
  if (energyEl) energyEl.textContent = `${gameState.energy}/${gameState.maxEnergy}`;
  if (powerEl) powerEl.textContent = gameState.getTotalDamage();
  if (damageEl) damageEl.textContent = gameState.getTotalDamage();

  // Гравець
  const playerHpPercent = (gameState.playerHp / gameState.getTotalMaxHP()) * 100;
  const playerHpEl = document.getElementById('playerHp');
  const playerMaxHpEl = document.getElementById('playerMaxHp');
  const playerHpBarEl = document.getElementById('playerHpBar');
  
  if (playerHpEl) playerHpEl.textContent = Math.floor(gameState.playerHp);
  if (playerMaxHpEl) playerMaxHpEl.textContent = gameState.getTotalMaxHP();
  if (playerHpBarEl) playerHpBarEl.style.width = Math.max(0, playerHpPercent) + '%';

  // Ворог
  const enemyNameEl = document.getElementById('enemyName');
  const enemyLevelEl = document.getElementById('enemyLevel');
  const enemyHpEl = document.getElementById('enemyHp');
  const enemyMaxHpEl = document.getElementById('enemyMaxHp');
  const enemyHpBarEl = document.getElementById('enemyHpBar');
  
  if (enemyNameEl) enemyNameEl.textContent = enemy.name;
  if (enemyLevelEl) enemyLevelEl.textContent = `Рівень ${enemy.level}${gameState.isBoss ? ' 👑 БОС' : ''}`;
  if (enemyHpEl) enemyHpEl.textContent = Math.max(0, Math.floor(gameState.enemyHp));
  if (enemyMaxHpEl) enemyMaxHpEl.textContent = gameState.enemyMaxHp;
  
  const enemyHpPercent = (gameState.enemyHp / gameState.enemyMaxHp) * 100;
  if (enemyHpBarEl) enemyHpBarEl.style.width = Math.max(0, enemyHpPercent) + '%';

  // Кнопки
  const attackBtn = document.getElementById('attackBtn');
  const specialBtn = document.getElementById('specialBtn');
  
  if (attackBtn) attackBtn.disabled = gameState.energy <= 0;
  if (specialBtn) {
    specialBtn.disabled = gameState.energy < gameState.getSpecialCost();
    specialBtn.innerHTML = `💥 Критудар (${gameState.getSpecialCost()}⚡, x3 урон)`;
  }
}

// ============================================
// ПЕРЕМИКАННЯ ТАБІВ
// ============================================
function switchTab(tab) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  
  const screen = document.getElementById(tab);
  if (screen) screen.classList.add('active');
  
  if (event && event.target) {
    event.target.classList.add('active');
  }

  if (tab === 'leaderboard') loadLeaderboard();
  if (tab === 'inventory') updateEquipment();
}

// ============================================
// ПОВІДОМЛЕННЯ
// ============================================
function showMessage(text) {
  const msg = document.createElement('div');
  msg.className = 'message';
  msg.textContent = text;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 2500);
}

// ============================================
// СТАРТ ГРИ
// ============================================
loadGame();