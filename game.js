// Ініціалізація Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

// Хептік фідбек
function haptic(type = 'light') {
  if (tg.HapticFeedback) {
    tg.HapticFeedback.impactOccurred(type); // light, medium, heavy, rigid, soft
  }
}

// Звуки
function playSound(type) {
  const sound = document.getElementById(`sound${type}`);
  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }
}

// Ігрові дані
let gameData = {
  wins: 0,
  gold: 0,
  energy: 10,
  maxEnergy: 10,
  power: 1,
  playerHp: 100,
  playerMaxHp: 100,
  level: 1,
  exp: 0,
  expToNext: 100,
  selectedClass: null,
  skills: {},
  skillPoints: 0,
  inventory: [],
  equipped: { weapon: null, armor: null, accessory: null },
  buildings: {},
  quests: [],
  achievements: [],
  currentLocation: 'village',
  enemiesDefeated: {},
  potions: 3,
  
  // PvP
  pvpRating: 1000,
  pvpWins: 0,
  pvpLosses: 0,
  
  // Лутбокси
  lootboxesOpened: 0,
  
  // TON
  tonBalance: 0,
  tonWalletConnected: false,
  
  // Щоденні бонуси
  lastDailyBonus: null,
  dailyStreak: 0
};

// Локації
const locations = {
  village: { name: '🏘️ Село', enemies: ['bandit', 'wolf'], minLevel: 1 },
  forest: { name: '🌲 Ліс', enemies: ['orc', 'bear'], minLevel: 3 },
  mountains: { name: '⛰️ Гори', enemies: ['troll', 'dragon'], minLevel: 5 },
  dungeon: { name: '🏰 Підземелля', enemies: ['demon', 'lich'], minLevel: 8 }
};

// Вороги
const enemies = {
  bandit: { name: 'Розбійник', emoji: '🗡️', hp: 20, damage: 3, gold: 10, exp: 15 },
  wolf: { name: 'Вовк', emoji: '🐺', hp: 25, damage: 4, gold: 12, exp: 18 },
  orc: { name: 'Орк', emoji: '👹', hp: 50, damage: 8, gold: 25, exp: 35 },
  bear: { name: 'Ведмідь', emoji: '🐻', hp: 60, damage: 10, gold: 30, exp: 40 },
  troll: { name: 'Троль', emoji: '👺', hp: 100, damage: 15, gold: 50, exp: 70 },
  dragon: { name: 'Дракон', emoji: '🐉', hp: 150, damage: 25, gold: 100, exp: 120 },
  demon: { name: 'Демон', emoji: '😈', hp: 200, damage: 35, gold: 150, exp: 180 },
  lich: { name: 'Ліч', emoji: '💀', hp: 250, damage: 45, gold: 200, exp: 250 }
};

// Класи
const classes = {
  warrior: { name: '⚔️ Воїн', bonus: 'power', value: 2, desc: '+2 до атаки' },
  tank: { name: '🛡️ Захисник', bonus: 'hp', value: 50, desc: '+50 до здоров\'я' },
  rogue: { name: '🗡️ Розвідник', bonus: 'crit', value: 0.3, desc: '+30% шанс криту' },
  mage: { name: '🔮 Маг', bonus: 'energy', value: 5, desc: '+5 до енергії' }
};

// Навички
const skills = {
  damage1: { name: 'Сила удару I', cost: 1, bonus: 'power', value: 1, req: null },
  damage2: { name: 'Сила удару II', cost: 2, bonus: 'power', value: 2, req: 'damage1' },
  damage3: { name: 'Сила удару III', cost: 3, bonus: 'power', value: 3, req: 'damage2' },
  hp1: { name: 'Міцність I', cost: 1, bonus: 'hp', value: 20, req: null },
  hp2: { name: 'Міцність II', cost: 2, bonus: 'hp', value: 40, req: 'hp1' },
  energy1: { name: 'Витривалість I', cost: 1, bonus: 'energy', value: 2, req: null },
  energy2: { name: 'Витривалість II', cost: 2, bonus: 'energy', value: 3, req: 'energy1' },
  crit: { name: 'Критичний удар', cost: 3, bonus: 'crit', value: 0.2, req: 'damage2' }
};

// Предмети
const items = {
  sword1: { name: 'Меч', emoji: '⚔️', type: 'weapon', bonus: 'power', value: 2, price: 50 },
  sword2: { name: 'Великий меч', emoji: '🗡️', type: 'weapon', bonus: 'power', value: 5, price: 200 },
  armor1: { name: 'Броня', emoji: '🛡️', type: 'armor', bonus: 'hp', value: 30, price: 100 },
  armor2: { name: 'Важка броня', emoji: '🦺', type: 'armor', bonus: 'hp', value: 60, price: 300 },
  ring: { name: 'Кільце сили', emoji: '💍', type: 'accessory', bonus: 'power', value: 3, price: 150 }
};

// Будівлі
const buildings = {
  house: { name: '🏠 Хата', level: 0, maxLevel: 5, bonus: 'hp', value: 20, cost: 100 },
  forge: { name: '⚒️ Кузня', level: 0, maxLevel: 5, bonus: 'power', value: 1, cost: 150 },
  well: { name: '⛲ Колодязь', level: 0, maxLevel: 5, bonus: 'energy', value: 2, cost: 120 }
};

// Квести
const questTemplates = [
  { id: 'kill5', type: 'kill', target: 5, reward: 50, desc: 'Переможи 5 ворогів' },
  { id: 'kill10', type: 'kill', target: 10, reward: 100, desc: 'Переможи 10 ворогів' },
  { id: 'gold100', type: 'gold', target: 100, reward: 30, desc: 'Накопич 100 золота' },
  { id: 'level3', type: 'level', target: 3, reward: 80, desc: 'Досягни 3 рівня' }
];

// Досягнення
const achievementTemplates = [
  { id: 'first_win', desc: 'Перша перемога', condition: () => gameData.wins >= 1, reward: 20 },
  { id: 'win10', desc: '10 перемог', condition: () => gameData.wins >= 10, reward: 50 },
  { id: 'win50', desc: '50 перемог', condition: () => gameData.wins >= 50, reward: 150 },
  { id: 'rich', desc: 'Багатій (1000 золота)', condition: () => gameData.gold >= 1000, reward: 100 },
  { id: 'level5', desc: 'Рівень 5', condition: () => gameData.level >= 5, reward: 80 }
];

// Лутбокси
const lootboxes = [
  { 
    id: 'common', 
    name: '📦 Звичайний', 
    price: 50, 
    emoji: '📦',
    rewards: [
      { type: 'gold', min: 20, max: 50, chance: 0.5 },
      { type: 'potion', count: 1, chance: 0.3 },
      { type: 'item', items: ['sword1', 'armor1'], chance: 0.2 }
    ]
  },
  { 
    id: 'rare', 
    name: '🎁 Рідкісний', 
    price: 150, 
    emoji: '🎁',
    rewards: [
      { type: 'gold', min: 50, max: 150, chance: 0.4 },
      { type: 'potion', count: 3, chance: 0.3 },
      { type: 'item', items: ['sword2', 'armor2', 'ring'], chance: 0.3 }
    ]
  },
  { 
    id: 'epic', 
    name: '💎 Епічний', 
    price: 500, 
    emoji: '💎',
    rewards: [
      { type: 'gold', min: 200, max: 500, chance: 0.3 },
      { type: 'potion', count: 5, chance: 0.2 },
      { type: 'item', items: ['sword2', 'armor2', 'ring'], chance: 0.3 },
      { type: 'skillpoint', count: 1, chance: 0.2 }
    ]
  }
];

let currentEnemy = null;
let inBattle = false;
let currentLeaderboardTab = 'wins';

// Ініціалізація
function init() {
  loadGame();
  updateUI();
  renderLocations();
  renderClasses();
  renderSkills();
  renderInventory();
  renderBuildings();
  renderShop();
  renderQuests();
  renderAchievements();
  renderLootboxes();
  checkDailyBonus();
  
  // Енергія відновлюється кожні 5 хв
  setInterval(() => {
    if (gameData.energy < gameData.maxEnergy) {
      gameData.energy++;
      updateUI();
      saveGame();
    }
  }, 300000);
  
  // Перевірка квестів та досягнень
  setInterval(checkQuestsAndAchievements, 2000);
}

// Оновлення UI
function updateUI() {
  document.getElementById('wins').textContent = gameData.wins;
  document.getElementById('gold').textContent = gameData.gold;
  document.getElementById('energy').textContent = `${gameData.energy}/${gameData.maxEnergy}`;
  document.getElementById('power').textContent = getTotalPower();
  document.getElementById('skillPoints').textContent = gameData.skillPoints;
  document.getElementById('playerHp').textContent = gameData.playerHp;
  document.getElementById('playerMaxHp').textContent = gameData.playerMaxHp;
  document.getElementById('pvpRating').textContent = gameData.pvpRating;
  document.getElementById('pvpWins').textContent = gameData.pvpWins;
  document.getElementById('pvpLosses').textContent = gameData.pvpLosses;
  document.getElementById('lootboxesOpened').textContent = gameData.lootboxesOpened;
  
  const hpPercent = (gameData.playerHp / gameData.playerMaxHp) * 100;
  document.getElementById('playerHpBar').style.width = `${hpPercent}%`;
  
  document.getElementById('damage').textContent = getTotalPower();
  document.getElementById('potionBtn').style.display = gameData.potions > 0 ? 'block' : 'none';
  
  if (gameData.tonWalletConnected) {
    document.getElementById('walletInfo').style.display = 'block';
    document.getElementById('tonBalance').textContent = gameData.tonBalance.toFixed(2);
  }
}

// Перемикання табів
function switchTab(tab) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(tab).classList.add('active');
  event.target.classList.add('active');
  
  if (tab === 'pvp') renderPvPOpponents();
  if (tab === 'leaderboard') loadLeaderboard();
}

function switchLeaderboardTab(tab) {
  currentLeaderboardTab = tab;
  event.target.parentElement.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  loadLeaderboard();
}

// Локації
function renderLocations() {
  const container = document.getElementById('locationSelect');
  container.innerHTML = Object.entries(locations).map(([key, loc]) => `
    <button class="location-btn ${gameData.currentLocation === key ? 'active' : ''}" 
            onclick="selectLocation('${key}')"
            ${gameData.level < loc.minLevel ? 'disabled' : ''}>
      ${loc.name}
      ${gameData.level < loc.minLevel ? `<br><small>(Рівень ${loc.minLevel})</small>` : ''}
    </button>
  `).join('');
}

function selectLocation(locationKey) {
  if (inBattle) return;
  gameData.currentLocation = locationKey;
  renderLocations();
  spawnEnemy();
  haptic('light');
}

// Спавн ворога
function spawnEnemy() {
  const location = locations[gameData.currentLocation];
  const enemyKeys = location.enemies;
  const randomEnemy = enemyKeys[Math.floor(Math.random() * enemyKeys.length)];
  const enemyTemplate = enemies[randomEnemy];
  
  const levelMultiplier = 1 + (gameData.level - 1) * 0.2;
  currentEnemy = {
    ...enemyTemplate,
    hp: Math.floor(enemyTemplate.hp * levelMultiplier),
    maxHp: Math.floor(enemyTemplate.hp * levelMultiplier),
    damage: Math.floor(enemyTemplate.damage * levelMultiplier),
    gold: Math.floor(enemyTemplate.gold * levelMultiplier),
    exp: Math.floor(enemyTemplate.exp * levelMultiplier)
  };
  
  document.getElementById('enemyImage').textContent = currentEnemy.emoji;
  document.getElementById('enemyName').textContent = currentEnemy.name;
  document.getElementById('enemyLevel').textContent = `Рівень ${gameData.level}`;
  updateEnemyHP();
  inBattle = true;
}

function updateEnemyHP() {
  document.getElementById('enemyHp').textContent = currentEnemy.hp;
  document.getElementById('enemyMaxHp').textContent = currentEnemy.maxHp;
  const percent = (currentEnemy.hp / currentEnemy.maxHp) * 100;
  document.getElementById('enemyHpBar').style.width = `${percent}%`;
}

// Атака
function attack() {
  if (!inBattle || gameData.energy < 1) return;
  
  gameData.energy--;
  const damage = getTotalPower();
  currentEnemy.hp -= damage;
  
  playSound('Attack');
  haptic('medium');
  
  document.getElementById('enemyCard').style.animation = 'shake 0.3s';
  setTimeout(() => {
    document.getElementById('enemyCard').style.animation = '';
  }, 300);
  
  updateEnemyHP();
  
  if (currentEnemy.hp <= 0) {
    victory();
    return;
  }
  
  // Відповідь ворога
  setTimeout(() => {
    gameData.playerHp -= currentEnemy.damage;
    haptic('heavy');
    
    if (gameData.playerHp <= 0) {
      defeat();
    } else {
      updateUI();
    }
  }, 500);
  
  updateUI();
}

function specialAttack() {
  if (!inBattle || gameData.energy < 3) return;
  
  gameData.energy -= 3;
  const damage = getTotalPower() * 3;
  currentEnemy.hp -= damage;
  
  playSound('Attack');
  haptic('heavy');
  
  document.getElementById('enemyCard').style.animation = 'shake 0.5s';
  setTimeout(() => {
    document.getElementById('enemyCard').style.animation = '';
  }, 500);
  
  updateEnemyHP();
  
  if (currentEnemy.hp <= 0) {
    victory();
    return;
  }
  
  setTimeout(() => {
    gameData.playerHp -= currentEnemy.damage;
    haptic('heavy');
    
    if (gameData.playerHp <= 0) {
      defeat();
    } else {
      updateUI();
    }
  }, 500);
  
  updateUI();
}

function usePotion() {
  if (gameData.potions <= 0) return;
  
  gameData.potions--;
  gameData.playerHp = Math.min(gameData.playerHp + 50, gameData.playerMaxHp);
  haptic('light');
  updateUI();
}

function victory() {
  inBattle = false;
  gameData.wins++;
  gameData.gold += currentEnemy.gold;
  gameData.exp += currentEnemy.exp;
  
  playSound('Victory');
  haptic('heavy');
  
  if (!gameData.enemiesDefeated[currentEnemy.name]) {
    gameData.enemiesDefeated[currentEnemy.name] = 0;
  }
  gameData.enemiesDefeated[currentEnemy.name]++;
  
  checkLevelUp();
  saveGame();
  updateUI();
  
  setTimeout(spawnEnemy, 1500);
}

function defeat() {
  inBattle = false;
  gameData.playerHp = gameData.playerMaxHp;
  gameData.gold = Math.floor(gameData.gold * 0.9);
  
  playSound('Defeat');
  haptic('heavy');
  
  saveGame();
  updateUI();
  spawnEnemy();
}

function checkLevelUp() {
  while (gameData.exp >= gameData.expToNext) {
    gameData.level++;
    gameData.exp -= gameData.expToNext;
    gameData.expToNext = Math.floor(gameData.expToNext * 1.5);
    gameData.skillPoints += 2;
    gameData.playerMaxHp += 20;
    gameData.playerHp = gameData.playerMaxHp;
    
    haptic('heavy');
    renderLocations();
  }
}

// Загальна сила
function getTotalPower() {
  let power = gameData.power;
  
  if (gameData.selectedClass) {
    const cls = classes[gameData.selectedClass];
    if (cls.bonus === 'power') power += cls.value;
  }
  
  Object.entries(gameData.skills).forEach(([key, unlocked]) => {
    if (unlocked && skills[key].bonus === 'power') {
      power += skills[key].value;
    }
  });
  
  Object.values(gameData.equipped).forEach(itemKey => {
    if (itemKey) {
      const item = items[itemKey];
      if (item && item.bonus === 'power') power += item.value;
    }
  });
  
  Object.entries(gameData.buildings).forEach(([key, level]) => {
    if (buildings[key].bonus === 'power') {
      power += buildings[key].value * level;
    }
  });
  
  return power;
}

// Класи
function renderClasses() {
  const container = document.getElementById('classSelect');
  container.innerHTML = Object.entries(classes).map(([key, cls]) => `
    <button class="class-card ${gameData.selectedClass === key ? 'selected' : ''}" 
            onclick="selectClass('${key}')">
      <div class="class-emoji">${cls.name.split(' ')[0]}</div>
      <div class="class-name">${cls.name}</div>
      <div class="class-bonus">${cls.desc}</div>
    </button>
  `).join('');
}

function selectClass(classKey) {
  if (gameData.selectedClass) return;
  
  gameData.selectedClass = classKey;
  const cls = classes[classKey];
  
  if (cls.bonus === 'hp') {
    gameData.playerMaxHp += cls.value;
    gameData.playerHp = gameData.playerMaxHp;
  } else if (cls.bonus === 'energy') {
    gameData.maxEnergy += cls.value;
    gameData.energy = gameData.maxEnergy;
  }
  
  haptic('medium');
  renderClasses();
  updateUI();
  saveGame();
  
  document.getElementById('classInfo').innerHTML = `
    <strong>Обрано:</strong> ${cls.name}<br>
    <strong>Бонус:</strong> ${cls.desc}
  `;
}

// Навички
function renderSkills() {
  const container = document.getElementById('skillTree');
  container.innerHTML = Object.entries(skills).map(([key, skill]) => {
    const unlocked = gameData.skills[key];
    const canUnlock = !unlocked && gameData.skillPoints >= skill.cost && 
                      (!skill.req || gameData.skills[skill.req]);
    
    return `
      <div class="skill-card ${unlocked ? 'unlocked' : ''} ${canUnlock ? 'available' : ''}">
        <div class="skill-name">${skill.name}</div>
        <div class="skill-desc">
          ${skill.bonus === 'power' ? `+${skill.value} до атаки` :
            skill.bonus === 'hp' ? `+${skill.value} до здоров'я` :
            skill.bonus === 'energy' ? `+${skill.value} до енергії` :
            `+${(skill.value * 100).toFixed(0)}% шанс криту`}
        </div>
        <div class="skill-cost">Вартість: ${skill.cost} 💎</div>
        ${!unlocked && canUnlock ? 
          `<button class="btn btn-primary btn-sm" onclick="unlockSkill('${key}')">Відкрити</button>` : 
          unlocked ? '<div style="color:#4CAF50;font-weight:bold;">✓ Відкрито</div>' : 
          '<div style="color:#999;">Заблоковано</div>'}
      </div>
    `;
  }).join('');
}

function unlockSkill(skillKey) {
  const skill = skills[skillKey];
  if (gameData.skillPoints < skill.cost) return;
  if (skill.req && !gameData.skills[skill.req]) return;
  
  gameData.skillPoints -= skill.cost;
  gameData.skills[skillKey] = true;
  
  if (skill.bonus === 'hp') {
    gameData.playerMaxHp += skill.value;
    gameData.playerHp = gameData.playerMaxHp;
  } else if (skill.bonus === 'energy') {
    gameData.maxEnergy += skill.value;
  }
  
  haptic('medium');
  renderSkills();
  updateUI();
  saveGame();
}

// Інвентар
function renderInventory() {
  const container = document.getElementById('inventoryGrid');
  
  if (gameData.inventory.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:#666;padding:20px;">Інвентар порожній</div>';
    return;
  }
  
  container.innerHTML = gameData.inventory.map((itemKey, idx) => {
    const item = items[itemKey];
    return `
      <div class="inventory-item">
        <div class="item-emoji">${item.emoji}</div>
        <div class="item-name">${item.name}</div>
        <button class="btn btn-sm btn-primary" onclick="equipItem(${idx})">Одягнути</button>
      </div>
    `;
  }).join('');
  
  updateEquipmentSlots();
}

function equipItem(idx) {
  const itemKey = gameData.inventory[idx];
  const item = items[itemKey];
  
  gameData.equipped[item.type] = itemKey;
  gameData.inventory.splice(idx, 1);
  
  if (item.bonus === 'hp') {
    gameData.playerMaxHp += item.value;
    gameData.playerHp = gameData.playerMaxHp;
  }
  
  haptic('light');
  renderInventory();
  updateUI();
  saveGame();
}

function updateEquipmentSlots() {
  Object.entries(gameData.equipped).forEach(([slot, itemKey]) => {
    const slotElement = document.getElementById(`${slot}Slot`);
    if (itemKey) {
      const item = items[itemKey];
      slotElement.textContent = item.emoji;
      slotElement.style.background = '#4CAF50';
    }
  });
}

// Будівлі
function renderBuildings() {
  const container = document.getElementById('buildingsList');
  container.innerHTML = Object.entries(buildings).map(([key, building]) => {
    const level = gameData.buildings[key] || 0;
    const cost = Math.floor(building.cost * Math.pow(1.5, level));
    const canUpgrade = level < building.maxLevel && gameData.gold >= cost;
    
    return `
      <div class="building-card">
        <div class="building-header">
          <span class="building-emoji">${building.name.split(' ')[0]}</span>
          <span class="building-name">${building.name.split(' ').slice(1).join(' ')}</span>
        </div>
        <div class="building-level">Рівень: ${level}/${building.maxLevel}</div>
        <div class="building-bonus">
          ${building.bonus === 'power' ? `+${building.value * level} до атаки` :
            building.bonus === 'hp' ? `+${building.value * level} до здоров'я` :
            `+${building.value * level} до енергії`}
        </div>
        ${level < building.maxLevel ? `
          <button class="btn ${canUpgrade ? 'btn-primary' : 'btn-disabled'}" 
                  onclick="upgradeBuilding('${key}')" 
                  ${!canUpgrade ? 'disabled' : ''}>
            Покращити (${cost}💰)
          </button>
        ` : '<div style="color:#4CAF50;font-weight:bold;">Максимальний рівень</div>'}
      </div>
    `;
  }).join('');
}

function upgradeBuilding(key) {
  const building = buildings[key];
  const level = gameData.buildings[key] || 0;
  const cost = Math.floor(building.cost * Math.pow(1.5, level));
  
  if (gameData.gold < cost || level >= building.maxLevel) return;
  
  gameData.gold -= cost;
  gameData.buildings[key] = level + 1;
  
  if (building.bonus === 'hp') {
    gameData.playerMaxHp += building.value;
    gameData.playerHp = gameData.playerMaxHp;
  } else if (building.bonus === 'energy') {
    gameData.maxEnergy += building.value;
  }
  
  haptic('medium');
  renderBuildings();
  updateUI();
  saveGame();
}

// Магазин
function renderShop() {
  const container = document.getElementById('shopItems');
  container.innerHTML = Object.entries(items).map(([key, item]) => `
    <div class="shop-item">
      <div class="item-emoji">${item.emoji}</div>
      <div>
        <div class="item-name">${item.name}</div>
        <div class="item-stats">
          ${item.bonus === 'power' ? `+${item.value} атака` :
            `+${item.value} здоров'я`}
        </div>
      </div>
      <button class="btn btn-primary" onclick="buyItem('${key}')" 
              ${gameData.gold < item.price ? 'disabled' : ''}>
        ${item.price}💰
      </button>
    </div>
  `).join('');
}

function buyItem(itemKey) {
  const item = items[itemKey];
  if (gameData.gold < item.price)