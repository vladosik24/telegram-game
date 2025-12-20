// Цей файл містить ВЕСЬ код для js/game.js
// Скопіюй цей код ПОВНІСТЮ і вставь у файл js/game.js

// ПРИМІТКА: Цей код занадто великий для одного артефакту
// Використовуй попередню версію з твого репозиторію
// і додай тільки ці нові функції в кінець файлу:

// ============================================
// ДОДАТКОВІ ФІЧІ - ДОДАЙ В КІНЕЦЬ game.js
// ============================================

// ЗВУКИ
function playSound(type) {
  try {
    const sound = document.getElementById('sound' + type.charAt(0).toUpperCase() + type.slice(1));
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(e => console.log('Sound play failed:', e));
    }
  } catch (e) {
    console.log('Sound error:', e);
  }
}

// PVP СИСТЕМА
const pvpOpponents = [
  { id: 1, name: "Воїн Іван", level: 1, rating: 950, power: 2, hp: 80 },
  { id: 2, name: "Маг Ольга", level: 2, rating: 1050, power: 3, hp: 70 },
  { id: 3, name: "Лучник Петро", level: 3, rating: 1150, power: 4, hp: 90 },
  { id: 4, name: "Боярин Андрій", level: 5, rating: 1300, power: 6, hp: 120 }
];

function renderPvPOpponents() {
  const list = document.getElementById('pvpOpponentsList');
  if (!list) return;
  
  list.innerHTML = '';
  
  pvpOpponents.forEach(opp => {
    const canFight = gameState.level >= opp.level - 1;
    
    const div = document.createElement('div');
    div.style.cssText = 'background:rgba(255,255,255,0.9);padding:12px;border-radius:10px;margin-bottom:10px;border:2px solid #ddd;';
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-weight:bold;color:#000;margin-bottom:4px;">${opp.name} (${opp.level}ур)</div>
          <div style="font-size:12px;color:#666;">⚡${opp.power} урону | ❤️${opp.hp} HP | 🏆${opp.rating}</div>
        </div>
        <button class="btn btn-attack" style="width:auto;padding:8px 16px;margin:0;" 
                onclick="startPvPBattle(${opp.id}); return false;" 
                ${!canFight ? 'disabled' : ''}>
          ${canFight ? '⚔️ Бій' : '🔒'}
        </button>
      </div>
    `;
    list.appendChild(div);
  });
}

function startPvPBattle(oppId) {
  const opp = pvpOpponents.find(o => o.id === oppId);
  if (!opp) return;
  
  const playerPower = gameState.getTotalDamage();
  const playerHP = gameState.getTotalMaxHP();
  
  // Проста симуляція бою
  const playerWins = (playerPower * playerHP) > (opp.power * opp.hp);
  
  if (playerWins) {
    gameState.gold += 50;
    if (!gameState.pvpRating) gameState.pvpRating = 1000;
    gameState.pvpRating += 10;
    if (!gameState.pvpWins) gameState.pvpWins = 0;
    gameState.pvpWins++;
    
    showMessage(`🏆 Перемога над ${opp.name}! +50💰, +10 рейтингу`);
    playSound('victory');
    tg.HapticFeedback.notificationOccurred("success");
  } else {
    if (!gameState.pvpRating) gameState.pvpRating = 1000;
    gameState.pvpRating = Math.max(0, gameState.pvpRating - 5);
    if (!gameState.pvpLosses) gameState.pvpLosses = 0;
    gameState.pvpLosses++;
    
    showMessage(`💔 Програш ${opp.name}. -5 рейтингу`);
    playSound('defeat');
    tg.HapticFeedback.notificationOccurred("error");
  }
  
  updatePvPUI();
  saveGame();
}

function updatePvPUI() {
  const ratingEl = document.getElementById('pvpRating');
  const winsEl = document.getElementById('pvpWins');
  const lossesEl = document.getElementById('pvpLosses');
  
  if (ratingEl) ratingEl.textContent = gameState.pvpRating || 1000;
  if (winsEl) winsEl.textContent = gameState.pvpWins || 0;
  if (lossesEl) lossesEl.textContent = gameState.pvpLosses || 0;
}

// ЛУТБОКСИ
const lootboxTypes = [
  {
    id: 'basic',
    name: '📦 Базовий лутбокс',
    cost: 100,
    emoji: '📦',
    rewards: [
      { type: 'gold', min: 50, max: 150 },
      { type: 'item', chance: 0.3 }
    ]
  },
  {
    id: 'rare',
    name: '🎁 Рідкісний лутбокс',
    cost: 500,
    emoji: '🎁',
    rewards: [
      { type: 'gold', min: 200, max: 500 },
      { type: 'item', chance: 0.6 }
    ]
  },
  {
    id: 'epic',
    name: '💎 Епічний лутбокс',
    cost: 2000,
    emoji: '💎',
    rewards: [
      { type: 'gold', min: 1000, max: 3000 },
      { type: 'item', chance: 0.9 }
    ]
  }
];

function renderLootboxes() {
  const list = document.getElementById('lootboxList');
  if (!list) return;
  
  list.innerHTML = '';
  
  lootboxTypes.forEach(box => {
    const div = document.createElement('div');
    div.style.cssText = 'background:rgba(255,255,255,0.9);padding:15px;border-radius:10px;margin-bottom:12px;border:2px solid #ddd;';
    div.innerHTML = `
      <div style="text-align:center;">
        <div style="font-size:48px;margin-bottom:8px;">${box.emoji}</div>
        <div style="font-weight:bold;color:#000;margin-bottom:8px;">${box.name}</div>
        <div style="font-size:12px;color:#666;margin-bottom:12px;">
          💰 ${box.rewards[0].min}-${box.rewards[0].max} золота<br>
          🎲 ${Math.floor(box.rewards[1].chance * 100)}% шанс предмета
        </div>
        <button class="btn btn-primary" style="width:auto;padding:10px 20px;" 
                onclick="openLootbox('${box.id}'); return false;" 
                ${gameState.gold < box.cost ? 'disabled' : ''}>
          Відкрити (${box.cost}💰)
        </button>
      </div>
    `;
    list.appendChild(div);
  });
  
  const openedEl = document.getElementById('lootboxesOpened');
  if (openedEl) openedEl.textContent = gameState.lootboxesOpened || 0;
}

function openLootbox(boxId) {
  const box = lootboxTypes.find(b => b.id === boxId);
  if (!box || gameState.gold < box.cost) {
    showMessage('❌ Недостатньо золота');
    return;
  }
  
  gameState.gold -= box.cost;
  
  // Нараховуємо золото
  const goldReward = Math.floor(Math.random() * (box.rewards[0].max - box.rewards[0].min + 1)) + box.rewards[0].min;
  gameState.gold += goldReward;
  
  let message = `${box.emoji} Отримано: ${goldReward}💰`;
  
  // Шанс предмета
  if (Math.random() < box.rewards[1].chance) {
    const randomItem = items[Math.floor(Math.random() * items.length)];
    if (randomItem.stackable) {
      const existing = gameState.inventory.find(i => i.id === randomItem.id);
      if (existing) {
        existing.count++;
      } else {
        gameState.inventory.push({ id: randomItem.id, count: 1 });
      }
    } else if (gameState.inventory.length < 20) {
      gameState.inventory.push({ id: randomItem.id, count: 1 });
    }
    message += ` + ${randomItem.emoji} ${randomItem.name}!`;
  }
  
  if (!gameState.lootboxesOpened) gameState.lootboxesOpened = 0;
  gameState.lootboxesOpened++;
  
  showMessage(message);
  tg.HapticFeedback.notificationOccurred("success");
  
  renderLootboxes();
  renderInventory();
  updateUI();
  saveGame();
}

// TON ГАМАНЕЦЬ (заглушка для майбутньої інтеграції)
function initTonWallet() {
  // Тут буде інтеграція з TON Connect
  // Поки що просто показуємо UI
  const walletInfo = document.getElementById('walletInfo');
  if (walletInfo && gameState.level >= 5) {
    walletInfo.style.display = 'block';
    document.getElementById('tonBalance').textContent = gameState.tonBalance || 0;
  }
}

// РОЗШИРЕНИЙ РЕЙТИНГ
let leaderboardTab = 'wins';

function switchLeaderboardTab(tab) {
  leaderboardTab = tab;
  loadLeaderboard();
}

// ОНОВЛЕНА ФУНКЦІЯ switchTab
const originalSwitchTab = switchTab;
switchTab = function(tab) {
  originalSwitchTab(tab);
  
  // Додаткові дії при перемиканні
  if (tab === 'pvp') {
    renderPvPOpponents();
    updatePvPUI();
  } else if (tab === 'lootbox') {
    renderLootboxes();
  }
  
  initTonWallet();
};

// ОНОВЛЕНА ФУНКЦІЯ attack з звуками
const originalAttack = attack;
attack = function() {
  playSound('attack');
  originalAttack();
};

// ІНІЦІАЛІЗАЦІЯ НОВИХ ФІЧ
document.addEventListener('DOMContentLoaded', function() {
  renderPvPOpponents();
  renderLootboxes();
  initTonWallet();
});