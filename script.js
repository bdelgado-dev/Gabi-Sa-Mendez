// ============================================
// GABI SA MENDEZ
// 2D PHILIPPINE FOLKLORE SURVIVAL GAME
// ============================================

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// ============================================
// GAME SETTINGS
// ============================================

const nightTargets = [50, 75, 100, 150, 300];

const enemyTypes = {
    tiyanak: {
        name: "Tiyanak",
        health: 10,
        damage: 1,
        speed: 65,
        color: "#b34b43",
        size: 18
    },

    tiktik: {
        name: "Tik-Tik",
        health: 20,
        damage: 5,
        speed: 55,
        color: "#875b9a",
        size: 22
    },

    kapre: {
        name: "Kapre",
        health: 100,
        damage: 25,
        speed: 28,
        color: "#574333",
        size: 32
    },

    sigbin: {
        name: "Sigbin",
        health: 50,
        damage: 15,
        speed: 90,
        color: "#6f8652",
        size: 23
    },

    manananggal: {
        name: "Manananggal",
        health: 70,
        damage: 30,
        speed: 65,
        color: "#873c55",
        size: 27
    },

    bampira: {
        name: "Bampira",
        health: 110,
        damage: 50,
        speed: 60,
        color: "#333746",
        size: 29
    }
};

const nightEnemies = [
    ["tiyanak", "tiktik"],
    ["tiyanak", "tiktik", "kapre"],
    ["tiyanak", "tiktik", "kapre", "sigbin"],
    ["tiyanak", "tiktik", "kapre", "sigbin", "manananggal"],
    ["tiyanak", "tiktik", "kapre", "sigbin", "manananggal", "bampira"]
];

const itemTypes = {
    balisong: {
        name: "Balisong",
        type: "melee",
        damage: 10,
        icon: "🔪"
    },

    palakol: {
        name: "Palakol",
        type: "melee",
        damage: 25,
        icon: "🪓"
    },

    itak: {
        name: "Itak",
        type: "melee",
        damage: 15,
        icon: "🗡️"
    },

    kawali: {
        name: "Kawali",
        type: "melee",
        damage: 12,
        icon: "🍳"
    },

    revolver: {
        name: "Revolver",
        type: "gun",
        damage: 25,
        magazine: 6,
        reloadTime: 2.5,
        icon: "🔫"
    },

    ak47: {
        name: "AK-47",
        type: "gun",
        damage: 50,
        magazine: 50,
        reloadTime: 2,
        icon: "🎯"
    },

    bandage: {
        name: "Bandage",
        type: "heal",
        amount: 20,
        icon: "🩹"
    },

    medkit: {
        name: "Medkit",
        type: "heal",
        amount: 60,
        icon: "🧰"
    },

    drink: {
        name: "Sports Drink",
        type: "energy",
        amount: 80,
        icon: "🥤"
    },

    armor: {
        name: "Armor",
        type: "armor",
        amount: 20,
        icon: "🛡️"
    },

    ammo: {
        name: "Bullets",
        type: "ammo",
        amount: 30,
        icon: "📦"
    }
};

// ============================================
// GAME VARIABLES
// ============================================

let gameMode = "solo";
let currentNight = 1;
let totalKills = 0;
let reviveTokens = 0;

let players = [];
let enemies = [];
let bullets = [];
let pickups = [];

let keys = {};

let gameRunning = false;
let gamePaused = false;
let gameOver = false;

let spawnTimer = 0;
let spawnInterval = 1.5;
let restTimer = 30;

let lastTime = 0;
let notificationTimer = null;
let restInterval = null;
let reloadTimers = [];

let mapWidth = 1200;
let mapHeight = 700;

let buildings = [];
let trees = [];
let obstacles = [];

// ============================================
// PLAYER CREATION
// ============================================

function createPlayer(id, x, color) {

    return {
        id: id,

        x: x,
        y: mapHeight - 125,

        width: 30,
        height: 38,

        color: color,

        health: 100,
        maxHealth: 100,

        energy: 200,
        maxEnergy: 200,

        armor: 0,

        speed: 210,

        velocityY: 0,
        jumping: false,

        facing: -1,

        downed: false,

        weapon: "balisong",

        magazine: {
            revolver: 6,
            ak47: 50
        },

        reserveAmmo: 120,

        inventory: [
            "balisong",
            "revolver",
            "bandage",
            "bandage",
            "medkit"
        ],

        backpack: [
            "bandage",
            "bandage",
            "bandage",
            "drink"
        ],

        selectedSlot: 0,

        attackCooldown: 0,
        meleeCooldown: 0,

        reloadTime: 0,
        reloading: false,

        reviveCount: 0,

        stats: {
            shotsFired: 0,
            meleeKills: 0,
            gunKills: 0,
            totalKills: 0,
            heals: 0,
            revives: 0
        }
    };
}

// ============================================
// MAP CREATION
// ============================================

function createMap() {

    buildings = [];
    trees = [];
    obstacles = [];

    const housePositions = [
        [120, 120], [330, 180], [550, 100],
        [850, 140], [1020, 280], [170, 360],
        [440, 330], [750, 300], [970, 460]
    ];

    housePositions.forEach((position, index) => {

        buildings.push({
            x: position[0],
            y: position[1],
            width: 95 + (index % 3) * 15,
            height: 65 + (index % 2) * 15,
            color: ["#77644b", "#66513e", "#82705b"][index % 3]
        });

    });

    for (let i = 0; i < 32; i++) {

        trees.push({
            x: 30 + Math.random() * (mapWidth - 60),
            y: 50 + Math.random() * 430,
            size: 13 + Math.random() * 12
        });

    }

    for (let i = 0; i < 22; i++) {

        obstacles.push({
            x: 60 + Math.random() * (mapWidth - 120),
            y: 60 + Math.random() * 450,
            width: 18 + Math.random() * 25,
            height: 18 + Math.random() * 25
        });

    }
}

// ============================================
// CANVAS SIZE
// ============================================

function resizeCanvas() {

    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(
        devicePixelRatio,
        0,
        0,
        devicePixelRatio,
        0,
        0
    );
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ============================================
// SCREEN MANAGEMENT
// ============================================

const screenIds = [
    "menu-screen",
    "instructions-screen",
    "settings-screen",
    "pause-screen",
    "victory-screen",
    "died-screen"
];

function showScreen(id) {

    // Hide all menu and overlay screens
    screenIds.forEach(screenId => {

        const screen = document.getElementById(screenId);

        if (screen) {
            screen.classList.remove("active");
        }

    });

    // Hide the game screen first
    const gameScreen = document.getElementById("game-screen");

    if (gameScreen) {
        gameScreen.classList.remove("visible");
        gameScreen.style.display = "none";
    }

    // Display the selected screen
    if (id === "game-screen" || id === null) {

        if (gameScreen) {
            gameScreen.classList.add("visible");
            gameScreen.style.display = "block";
        }

    } else {

        const selectedScreen = document.getElementById(id);

        if (selectedScreen) {
            selectedScreen.classList.add("active");
        }

    }
}

function openGame() {
    showScreen("game-screen");
}

function returnToMenu() {

    gameRunning = false;
    gamePaused = false;
    gameOver = false;

    clearInterval(restInterval);

    showScreen("menu-screen");
}

// ============================================
// START GAME
// ============================================

function startGame(mode) {

    gameMode = mode;

    currentNight = 1;
    totalKills = 0;
    reviveTokens = 0;

    enemies = [];
    bullets = [];
    pickups = [];

    players = [];

    players.push(
        createPlayer(1, mapWidth / 2 - 45, "#416f91")
    );

    if (mode === "coop") {

        players.push(
            createPlayer(2, mapWidth / 2 + 45, "#b47a48")
        );

    }

    createMap();

    spawnInterval = 1.5;
    spawnTimer = 0;

    gameRunning = true;
    gamePaused = false;
    gameOver = false;

    openGame();

    spawnInitialLoot();

    startNight(1);

    updateHUD();
}

// ============================================
// NIGHT SYSTEM
// ============================================

function startNight(night) {

    currentNight = night;

    totalKills = 0;
    spawnTimer = 0;

    enemies = [];
    bullets = [];

    if (night === 1) {
        reviveTokens = 0;
    } else {
        reviveTokens = 1;
    }

    spawnInterval = Math.max(0.35, 1.5 - (night - 1) * 0.2);

    document.getElementById("night-text").textContent =
        currentNight + " / 5";

    document.getElementById("kill-count").textContent = "0";

    document.getElementById("kill-target").textContent =
        nightTargets[night - 1];

    showNotification("NIGHT " + night + " HAS BEGUN!");

    updateHUD();
}

// ============================================
// RANDOM ITEM SPAWNING
// ============================================

function spawnInitialLoot() {

    for (let i = 0; i < 24; i++) {

        const list = [
            "bandage",
            "bandage",
            "medkit",
            "drink",
            "armor",
            "ammo",
            "palakol",
            "itak",
            "kawali",
            "revolver",
            "ak47"
        ];

        const type = list[Math.floor(Math.random() * list.length)];

        spawnPickup(type);
    }
}

function spawnPickup(type) {

    let x = 50 + Math.random() * (mapWidth - 100);
    let y = 60 + Math.random() * 460;

    pickups.push({
        type: type,
        x: x,
        y: y,
        size: 16
    });
}

// ============================================
// ENEMY SPAWNING
// ============================================

function spawnEnemy() {

    const availableEnemies = nightEnemies[currentNight - 1];

    const type = availableEnemies[
        Math.floor(Math.random() * availableEnemies.length)
    ];

    const data = enemyTypes[type];

    const side = Math.floor(Math.random() * 3);

    let x;
    let y;

    if (side === 0) {
        x = Math.random() * mapWidth;
        y = 20;
    } else if (side === 1) {
        x = 20;
        y = Math.random() * 450;
    } else {
        x = mapWidth - 20;
        y = Math.random() * 450;
    }

    enemies.push({

        type: type,

        x: x,
        y: y,

        health: data.health,
        maxHealth: data.health,

        damage: data.damage,
        speed: data.speed,

        size: data.size,
        color: data.color,

        attackCooldown: 0,

        alive: true
    });
}

// ============================================
// PLAYER MOVEMENT
// ============================================

function movePlayer(player, deltaTime) {

    if (player.downed) return;

    let dx = 0;
    let dy = 0;

    if (player.id === 1) {

        if (keys["KeyA"]) dx -= 1;
        if (keys["KeyD"]) dx += 1;
        if (keys["KeyS"]) dy += 1;

        if (keys["KeyW"] && !player.jumping) {
            jumpPlayer(player);
        }

    } else {

        if (keys["ArrowLeft"]) dx -= 1;
        if (keys["ArrowRight"]) dx += 1;
        if (keys["ArrowDown"]) dy += 1;

        if (keys["ArrowUp"] && !player.jumping) {
            jumpPlayer(player);
        }

    }

    if (dx !== 0) {
        player.facing = dx > 0 ? 1 : -1;
    }

    if (dx !== 0 || dy !== 0) {

        const length = Math.sqrt(dx * dx + dy * dy);

        dx /= length;
        dy /= length;

        player.x += dx * player.speed * deltaTime;
        player.y += dy * player.speed * deltaTime;

        player.energy = Math.max(0, player.energy - 5 * deltaTime);

    } else {

        player.energy = Math.min(200, player.energy + 8 * deltaTime);

    }

    player.x = Math.max(20, Math.min(mapWidth - 20, player.x));
    player.y = Math.max(20, Math.min(mapHeight - 20, player.y));

    player.attackCooldown = Math.max(0, player.attackCooldown - deltaTime);
    player.meleeCooldown = Math.max(0, player.meleeCooldown - deltaTime);
}

// ============================================
// JUMPING
// ============================================

function jumpPlayer(player) {

    if (player.downed) return;

    if (player.energy < 10) return;

    player.jumping = true;
    player.velocityY = -12;

    player.energy -= 10;
}

// ============================================
// PLAYER SHOOTING
// ============================================

function shoot(player) {

    if (!gameRunning || gamePaused || player.downed) return;

    const weapon = itemTypes[player.weapon];

    if (!weapon || weapon.type !== "gun") {
        showNotification("Equip a gun first!");
        return;
    }

    if (player.reloading) return;

    if (player.magazine[player.weapon] <= 0) {
        showNotification("OUT OF BULLETS! PRESS R TO RELOAD.");
        return;
    }

    if (player.attackCooldown > 0) return;

    player.attackCooldown = 0.35;

    player.magazine[player.weapon]--;

    player.stats.shotsFired++;

    let target = findNearestEnemy(player);

    let direction = player.facing;

    if (target) {
        direction = target.x >= player.x ? 1 : -1;
    }

    bullets.push({

        x: player.x + direction * 20,
        y: player.y - 8,

        direction: direction,

        speed: 550,

        damage: weapon.damage,

        owner: player.id,

        weapon: player.weapon
    });

    updateHUD();
}

// ============================================
// FIND NEAREST ENEMY
// ============================================

function findNearestEnemy(player) {

    let nearest = null;
    let nearestDistance = Infinity;

    enemies.forEach(enemy => {

        const distance = Math.hypot(
            enemy.x - player.x,
            enemy.y - player.y
        );

        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearest = enemy;
        }

    });

    return nearest;
}

// ============================================
// MELEE ATTACK
// ============================================

function meleeAttack(player) {

    if (!gameRunning || gamePaused || player.downed) return;

    if (player.meleeCooldown > 0) return;

    player.meleeCooldown = 0.55;

    const weapon = itemTypes[player.weapon];

    if (!weapon || weapon.type !== "melee") {
        showNotification("Equip a melee weapon first!");
        return;
    }

    let target = null;
    let closestDistance = 85;

    enemies.forEach(enemy => {

        const distance = Math.hypot(
            enemy.x - player.x,
            enemy.y - player.y
        );

        if (distance < closestDistance) {
            closestDistance = distance;
            target = enemy;
        }

    });

    if (target) {

        damageEnemy(
            target,
            weapon.damage,
            player.id,
            "melee"
        );

    } else {

        showNotification("No enemy within melee range.");

    }
}

// ============================================
// DAMAGE ENEMY
// ============================================

function damageEnemy(enemy, damage, playerId, attackType) {

    if (!enemy.alive) return;

    enemy.health -= damage;

    if (enemy.health <= 0) {

        enemy.alive = false;

        totalKills++;

        const player = players.find(p => p.id === playerId);

        if (player) {

            player.stats.totalKills++;

            if (attackType === "melee") {
                player.stats.meleeKills++;
            } else {
                player.stats.gunKills++;
            }

        }

        enemies = enemies.filter(e => e.alive);

        document.getElementById("kill-count").textContent = totalKills;

        if (totalKills >= nightTargets[currentNight - 1]) {
            completeNight();
        }
    }
}

// ============================================
// BULLET MOVEMENT
// ============================================

function updateBullets(deltaTime) {

    bullets.forEach((bullet, index) => {

        bullet.x += bullet.direction * bullet.speed * deltaTime;

        const target = enemies.find(enemy => {

            const distance = Math.hypot(
                enemy.x - bullet.x,
                enemy.y - bullet.y
            );

            return distance < enemy.size + 8;
        });

        if (target) {

            damageEnemy(
                target,
                bullet.damage,
                bullet.owner,
                "gun"
            );

            bullet.hit = true;

        }

        if (bullet.x < 0 || bullet.x > mapWidth) {
            bullet.hit = true;
        }

    });

    bullets = bullets.filter(b => !b.hit);
}

// ============================================
// ENEMY MOVEMENT
// ============================================

function updateEnemies(deltaTime) {

    enemies.forEach(enemy => {

        if (!enemy.alive) return;

        const targets = players.filter(p => !p.downed);

        if (targets.length === 0) return;

        let target = targets[0];

        if (targets.length > 1) {

            const distanceOne = Math.hypot(
                targets[0].x - enemy.x,
                targets[0].y - enemy.y
            );

            const distanceTwo = Math.hypot(
                targets[1].x - enemy.x,
                targets[1].y - enemy.y
            );

            target = distanceOne < distanceTwo ? targets[0] : targets[1];
        }

        const dx = target.x - enemy.x;
        const dy = target.y - enemy.y;

        const distance = Math.hypot(dx, dy);

        if (distance > 35) {

            enemy.x += (dx / distance) * enemy.speed * deltaTime;
            enemy.y += (dy / distance) * enemy.speed * deltaTime;

        } else {

            enemy.attackCooldown -= deltaTime;

            if (enemy.attackCooldown <= 0) {

                hurtPlayer(target, enemy.damage);

                enemy.attackCooldown = 1.1;

            }
        }

    });
}

// ============================================
// PLAYER DAMAGE
// ============================================

function hurtPlayer(player, damage) {

    if (player.downed) return;

    let finalDamage = Math.max(1, damage - player.armor);

    player.health -= finalDamage;

    if (player.health <= 0) {

        player.health = 0;

        if (gameMode === "coop") {

            player.downed = true;

            showNotification("PLAYER " + player.id + " IS DOWN!");

            checkGameOver();

        } else if (reviveTokens > 0) {

            reviveTokens--;

            player.health = 50;

            player.downed = false;

            showNotification("YOU USED YOUR REVIVE!");

        } else {

            endGame();

        }
    }

    updateHUD();
}

// ============================================
// CO-OP REVIVAL
// ============================================

let reviveProgress = 0;

function updateRevival(deltaTime) {

    if (gameMode !== "coop") return;

    if (!keys["KeyE"]) {
        reviveProgress = 0;
        return;
    }

    if (reviveTokens <= 0) return;

    const helper = players.find(p => !p.downed);
    const downed = players.find(p => p.downed);

    if (!helper || !downed) return;

    const distance = Math.hypot(
        helper.x - downed.x,
        helper.y - downed.y
    );

    if (distance > 65) {
        reviveProgress = 0;
        showNotification("MOVE CLOSER TO REVIVE!");
        return;
    }

    reviveProgress += deltaTime;

    document.getElementById("game-message").textContent =
        "REVIVING: " + Math.floor(reviveProgress / 5 * 100) + "%";

    if (reviveProgress >= 5) {

        downed.downed = false;
        downed.health = 50;

        reviveTokens--;

        helper.stats.revives++;

        reviveProgress = 0;

        document.getElementById("game-message").textContent = "";

        showNotification("PLAYER " + downed.id + " HAS BEEN REVIVED!");

        updateHUD();
    }
}

// ============================================
// CHECK GAME OVER
// ============================================

function checkGameOver() {

    if (players.every(p => p.downed)) {
        endGame();
    }
}

// ============================================
// RELOAD SYSTEM
// ============================================

function reload(player) {

    if (player.downed) return;

    const weapon = itemTypes[player.weapon];

    if (!weapon || weapon.type !== "gun") return;

    if (player.reloading) return;

    if (player.magazine[player.weapon] >= weapon.magazine) return;

    if (player.reserveAmmo <= 0) {
        showNotification("NO EXTRA BULLETS!");
        return;
    }

    player.reloading = true;
    player.reloadTime = weapon.reloadTime;

    showNotification("RELOADING " + weapon.name + "...");

    const timer = setTimeout(() => {

        if (!players.includes(player)) return;

        const needed = weapon.magazine - player.magazine[player.weapon];

        const loaded = Math.min(needed, player.reserveAmmo);

        player.magazine[player.weapon] += loaded;
        player.reserveAmmo -= loaded;

        player.reloading = false;
        player.reloadTime = 0;

        showNotification("RELOAD COMPLETE!");

        updateHUD();

    }, weapon.reloadTime * 1000);

    reloadTimers.push(timer);
}

// ============================================
// HEALING SYSTEM
// ============================================

function useHeal(player) {

    if (player.downed) return;

    if (player.health >= player.maxHealth) {
        showNotification("YOUR HEALTH IS ALREADY FULL.");
        return;
    }

    let index = player.inventory.findIndex(item =>
        itemTypes[item] && itemTypes[item].type === "heal"
    );

    let source = player.inventory;

    if (index === -1) {

        source = player.backpack;

        index = source.findIndex(item =>
            itemTypes[item] && itemTypes[item].type === "heal"
        );

    }

    if (index === -1) {
        showNotification("NO HEALING ITEMS AVAILABLE.");
        return;
    }

    const item = source.splice(index, 1)[0];

    player.health = Math.min(
        player.maxHealth,
        player.health + itemTypes[item].amount
    );

    player.stats.heals++;

    showNotification(itemTypes[item].name + " USED!");

    updateHUD();
}

// ============================================
// PICKUP SYSTEM
// ============================================

function updatePickups() {

    players.forEach(player => {

        if (player.downed) return;

        pickups.forEach((pickup, index) => {

            const distance = Math.hypot(
                player.x - pickup.x,
                player.y - pickup.y
            );

            if (distance < 35) {

                collectItem(player, index);

            }

        });

    });

}

function collectItem(player, index) {

    const pickup = pickups[index];

    if (!pickup) return;

    const type = pickup.type;
    const item = itemTypes[type];

    if (type === "ammo") {

        player.reserveAmmo += item.amount;

    } else if (type === "armor") {

        player.armor = Math.min(20, player.armor + item.amount);

    } else if (type === "drink") {

        player.energy = Math.min(
            player.maxEnergy,
            player.energy + item.amount
        );

    } else {

        if (player.inventory.length < 5) {

            player.inventory.push(type);

        } else if (player.backpack.length < 10) {

            player.backpack.push(type);

        } else {

            showNotification("YOUR INVENTORY IS FULL!");
            return;
        }
    }

    pickups.splice(index, 1);

    showNotification(item.name + " COLLECTED!");

    updateHUD();
}

// ============================================
// INVENTORY SELECTION
// ============================================

function selectSlot(player, number) {

    const index = number - 1;

    if (index < 0 || index >= 5) return;

    if (!player.inventory[index]) return;

    const item = player.inventory[index];

    if (itemTypes[item].type === "gun" ||
        itemTypes[item].type === "melee") {

        player.weapon = item;

        player.selectedSlot = index;

        showNotification(itemTypes[item].name + " EQUIPPED!");

    }

    updateHUD();
}

// ============================================
// INVENTORY DISPLAY
// ============================================

function renderInventory(player) {

    const prefix = "p" + player.id;

    const slots = document.getElementById(prefix + "-slots");
    const backpack = document.getElementById(prefix + "-backpack");

    slots.innerHTML = "";
    backpack.innerHTML = "";

    for (let i = 0; i < 5; i++) {

        const item = player.inventory[i];

        const slot = document.createElement("div");

        slot.className = "inventory-slot";

        if (player.selectedSlot === i) {
            slot.classList.add("selected");
        }

        if (item) {

            slot.innerHTML =
                "<b>" + itemTypes[item].icon + "</b>" +
                itemTypes[item].name;

        } else {

            slot.innerHTML = "<b>+</b>EMPTY";

        }

        slots.appendChild(slot);
    }

    for (let i = 0; i < 10; i++) {

        const item = player.backpack[i];

        const slot = document.createElement("div");

        slot.className = "inventory-slot";

        slot.innerHTML = item
            ? "<b>" + itemTypes[item].icon + "</b>" + itemTypes[item].name
            : "<b>·</b>EMPTY";

        backpack.appendChild(slot);
    }

    document.getElementById(prefix + "-bag-count").textContent =
        player.backpack.length + " / 10";
}

// ============================================
// UPDATE HUD
// ============================================

function updateHUD() {

    players.forEach(player => {

        const prefix = "p" + player.id;

        document.getElementById(prefix + "-health-bar").style.width =
            player.health + "%";

        document.getElementById(prefix + "-health-text").textContent =
            Math.ceil(player.health);

        document.getElementById(prefix + "-energy-bar").style.width =
            (player.energy / player.maxEnergy * 100) + "%";

        document.getElementById(prefix + "-energy-text").textContent =
            Math.ceil(player.energy);

        document.getElementById(prefix + "-weapon").textContent =
            itemTypes[player.weapon].name;

        document.getElementById(prefix + "-status").textContent =
            player.downed ? "DOWNED" : "ALIVE";

        renderInventory(player);

    });

    document.getElementById("revive-count").textContent = reviveTokens;

    document.getElementById("enemy-count").textContent = enemies.length;

    if (gameMode === "solo") {

        document.getElementById("player-two-hud").style.display = "none";

        document.getElementById("player-one-hud").style.margin = "auto";

    } else {

        document.getElementById("player-two-hud").style.display = "block";

        document.getElementById("player-one-hud").style.margin = "0";

    }
}

// ============================================
// NIGHT COMPLETION
// ============================================

function completeNight() {

    if (!gameRunning) return;

    gameRunning = false;

    if (currentNight === 5) {

        showWinScreen();

    } else {

        startRestPeriod();

    }
}

// ============================================
// REST PERIOD
// ============================================

function startRestPeriod() {

    restTimer = 30;

    showScreen("rest-screen");

    document.getElementById("rest-timer").textContent = restTimer;

    restInterval = setInterval(() => {

        restTimer--;

        document.getElementById("rest-timer").textContent = restTimer;

        if (restTimer <= 0) {

            clearInterval(restInterval);

            nextNight();

        }

    }, 1000);
}

function nextNight() {

    clearInterval(restInterval);

    currentNight++;

    players.forEach(player => {

        player.health = Math.min(100, player.health + 20);
        player.energy = 200;

        player.downed = false;

    });

    startNight(currentNight);

    showScreen(null);

    gameRunning = true;

    updateHUD();
}

// ============================================
// WIN SCREEN AND STATISTICS
// ============================================

function showWinScreen() {

    gameRunning = false;

    const statsContainer = document.getElementById("final-stats");

    statsContainer.innerHTML = "";

    players.forEach(player => {

        const card = document.createElement("div");

        card.className = "stats-card";

        card.innerHTML = `
            <h3>PLAYER ${player.id}</h3>
            <p><span>Shots Fired</span><b>${player.stats.shotsFired}</b></p>
            <p><span>Melee Kills</span><b>${player.stats.meleeKills}</b></p>
            <p><span>Gun Kills</span><b>${player.stats.gunKills}</b></p>
            <p><span>Total Kills</span><b>${player.stats.totalKills}</b></p>
            <p><span>Heals Used</span><b>${player.stats.heals}</b></p>
            <p><span>Revives</span><b>${player.stats.revives}</b></p>
        `;

        statsContainer.appendChild(card);

    });

    showScreen("win-screen");
}

// ============================================
// DEATH SCREEN
// ============================================

function endGame() {

    gameRunning = false;
    gameOver = true;

    clearInterval(restInterval);

    document.getElementById("death-description").textContent =
        "You survived until Night " + currentNight +
        ". Your total kills: " + totalKills + ".";

    showScreen("death-screen");
}

// ============================================
// RETRY NIGHT
// ============================================

function retryNight() {

    enemies = [];
    bullets = [];

    players.forEach(player => {

        player.health = 100;
        player.energy = 200;

        player.downed = false;

        player.x = player.id === 1
            ? mapWidth / 2 - 45
            : mapWidth / 2 + 45;

        player.y = mapHeight - 125;

        player.magazine = {
            revolver: 6,
            ak47: 50
        };

        player.reloading = false;

    });

    startNight(currentNight);

    showScreen(null);

    gameRunning = true;

    updateHUD();
}

// ============================================
// NOTIFICATIONS
// ============================================

function showNotification(message) {

    const notification = document.getElementById("notification");

    notification.textContent = message;

    notification.classList.add("show");

    clearTimeout(notificationTimer);

    notificationTimer = setTimeout(() => {

        notification.classList.remove("show");

    }, 1800);
}

// ============================================
// DRAW MAP
// ============================================

function drawMap() {

    ctx.fillStyle = "#354437";
    ctx.fillRect(0, 0, mapWidth, mapHeight);

    // Ground details

    for (let i = 0; i < 160; i++) {

        const x = (i * 83) % mapWidth;
        const y = (i * 47) % mapHeight;

        ctx.fillStyle = i % 2 === 0 ? "#40503b" : "#303e33";

        ctx.fillRect(x, y, 3, 3);

    }

    // Village road

    ctx.fillStyle = "#776b56";
    ctx.fillRect(0, 470, mapWidth, 90);

    ctx.fillStyle = "#b4a27b";

    for (let x = 0; x < mapWidth; x += 75) {
        ctx.fillRect(x, 512, 35, 3);
    }

    // Houses

    buildings.forEach(house => {

        ctx.fillStyle = house.color;
        ctx.fillRect(house.x, house.y, house.width, house.height);

        ctx.fillStyle = "#45352d";

        ctx.beginPath();
        ctx.moveTo(house.x - 8, house.y);
        ctx.lineTo(house.x + house.width / 2, house.y - 30);
        ctx.lineTo(house.x + house.width + 8, house.y);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#332c24";
        ctx.fillRect(
            house.x + house.width / 2 - 10,
            house.y + house.height - 28,
            20,
            28
        );

        ctx.fillStyle = "#c3a36b";
        ctx.fillRect(house.x + 12, house.y + 15, 18, 15);

    });

    // Trees

    trees.forEach(tree => {

        ctx.fillStyle = "#49372b";

        ctx.fillRect(
            tree.x - 4,
            tree.y,
            8,
            tree.size + 10
        );

        ctx.fillStyle = "#1e3929";

        ctx.beginPath();
        ctx.arc(
            tree.x,
            tree.y,
            tree.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

    });

    // Obstacles

    obstacles.forEach(obstacle => {

        ctx.fillStyle = "#5d5a4d";

        ctx.fillRect(
            obstacle.x,
            obstacle.y,
            obstacle.width,
            obstacle.height
        );

    });

    // Player starting area

    ctx.fillStyle = "rgba(190, 150, 75, .15)";

    ctx.fillRect(
        mapWidth / 2 - 140,
        mapHeight - 175,
        280,
        145
    );

    ctx.strokeStyle = "#d1ad62";
    ctx.strokeRect(
        mapWidth / 2 - 140,
        mapHeight - 175,
        280,
        145
    );

    ctx.fillStyle = "#e7d5a7";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        "DEFENSE AREA",
        mapWidth / 2,
        mapHeight - 155
    );
}

// ============================================
// DRAW PLAYERS
// ============================================

function drawPlayers() {

    players.forEach(player => {

        ctx.save();

        if (player.downed) {
            ctx.globalAlpha = .35;
        }

        // Shadow

        ctx.fillStyle = "#111";

        ctx.beginPath();
        ctx.ellipse(
            player.x,
            player.y + 18,
            18,
            8,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // Body

        ctx.fillStyle = player.color;

        ctx.fillRect(
            player.x - 12,
            player.y - 15,
            24,
            29
        );

        // Head

        ctx.fillStyle = "#c28d6a";

        ctx.beginPath();
        ctx.arc(
            player.x,
            player.y - 22,
            10,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // Face direction

        ctx.fillStyle = "#171717";

        ctx.fillRect(
            player.x + player.facing * 4,
            player.y - 24,
            3,
            3
        );

        // Player number

        ctx.fillStyle = "white";
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            "P" + player.id,
            player.x,
            player.y + 38
        );

        ctx.restore();

    });
}

// ============================================
// DRAW ENEMIES
// ============================================

function drawEnemies() {

    enemies.forEach(enemy => {

        // Body

        ctx.fillStyle = enemy.color;

        ctx.beginPath();

        ctx.arc(
            enemy.x,
            enemy.y,
            enemy.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // Eyes

        ctx.fillStyle = "#ff2b24";

        ctx.fillRect(enemy.x - 7, enemy.y - 5, 4, 4);
        ctx.fillRect(enemy.x + 3, enemy.y - 5, 4, 4);

        // Health bar background

        const barWidth = enemy.size * 2;

        ctx.fillStyle = "#211c1b";

        ctx.fillRect(
            enemy.x - barWidth / 2,
            enemy.y - enemy.size - 14,
            barWidth,
            5
        );

        // Health bar

        ctx.fillStyle = "#c93632";

        ctx.fillRect(
            enemy.x - barWidth / 2,
            enemy.y - enemy.size - 14,
            barWidth * Math.max(0, enemy.health / enemy.maxHealth),
            5
        );

        // Enemy name

        ctx.fillStyle = "#fff";
        ctx.font = "9px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            enemyTypes[enemy.type].name,
            enemy.x,
            enemy.y - enemy.size - 19
        );

    });
}

// ============================================
// DRAW PICKUPS
// ============================================

function drawPickups() {

    pickups.forEach(pickup => {

        const item = itemTypes[pickup.type];

        ctx.fillStyle = "#d5ae61";

        ctx.fillRect(
            pickup.x - 12,
            pickup.y - 12,
            24,
            24
        );

        ctx.fillStyle = "#161616";
        ctx.font = "15px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            item.icon,
            pickup.x,
            pickup.y + 5
        );

    });
}

// ============================================
// DRAW BULLETS
// ============================================

function drawBullets() {

    bullets.forEach(bullet => {

        ctx.fillStyle = "#ffe19a";

        ctx.beginPath();

        ctx.arc(
            bullet.x,
            bullet.y,
            5,
            0,
            Math.PI * 2
        );

        ctx.fill();

    });
}

// ============================================
// GAME UPDATE
// ============================================

function update(deltaTime) {

    if (!gameRunning || gamePaused) return;

    players.forEach(player => {
        movePlayer(player, deltaTime);
    });

    updateBullets(deltaTime);

    updateEnemies(deltaTime);

    updatePickups();

    updateRevival(deltaTime);

    spawnTimer += deltaTime;

    if (totalKills < nightTargets[currentNight - 1]) {

        if (spawnTimer >= spawnInterval && enemies.length < 45) {

            spawnEnemy();

            spawnTimer = 0;

        }

    }

    updateHUD();

    checkGameOver();
}

// ============================================
// DRAW GAME
// ============================================

function draw() {

    const width = window.innerWidth;
    const height = window.innerHeight;

    ctx.clearRect(0, 0, width, height);

    // Scale the game map to fit the screen.

    const scale = Math.min(
        width / mapWidth,
        height / mapHeight
    );

    const offsetX = (width - mapWidth * scale) / 2;
    const offsetY = (height - mapHeight * scale) / 2;

    ctx.save();

    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    drawMap();
    drawPickups();
    drawBullets();
    drawEnemies();
    drawPlayers();

    ctx.restore();
}

// ============================================
// MAIN GAME LOOP
// ============================================

function gameLoop(timestamp) {

    const deltaTime = lastTime
        ? Math.min((timestamp - lastTime) / 1000, 0.05)
        : 0;

    lastTime = timestamp;

    update(deltaTime);

    draw();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

// ============================================
// KEYBOARD CONTROLS
// ============================================

window.addEventListener("keydown", event => {

    keys[event.code] = true;

    if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)
    ) {
        event.preventDefault();
    }

    if (event.repeat) return;

    if (!gameRunning || gamePaused) return;

    const playerOne = players[0];
    const playerTwo = players[1];

    // Player 1 controls

    if (event.code === "KeyT" && playerOne) {
        shoot(playerOne);
    }

    if (event.code === "KeyY" && playerOne) {
        meleeAttack(playerOne);
    }

    // Player 2 controls

    if (event.code === "Numpad1" && playerTwo) {
        shoot(playerTwo);
    }

    if (event.code === "Numpad2" && playerTwo) {
        meleeAttack(playerTwo);
    }

    // Reload

    if (event.code === "KeyR") {
        players.forEach(player => reload(player));
    }

    // Healing

    if (event.code === "KeyH") {
        players.forEach(player => useHeal(player));
    }

    // Inventory selection

    if (event.code.startsWith("Digit")) {

        const number = Number(event.code.replace("Digit", ""));

        if (number >= 1 && number <= 5 && playerOne) {
            selectSlot(playerOne, number);
        }

    }

});

window.addEventListener("keyup", event => {

    keys[event.code] = false;

});


// ============================================
// BUTTON EVENTS
// ============================================

// Helper function for connecting buttons safely

function bindButton(id, callback) {

    const button = document.getElementById(id);

    if (button) {
        button.addEventListener("click", callback);
    } else {
        console.warn("Button not found in HTML:", id);
    }

}

// ============================================
// MAIN MENU
// ============================================

bindButton("start-btn", () => {
    showScreen("player-screen");
});

bindButton("menu-btn", () => {
    showScreen("settings-screen");
});

bindButton("exit-btn", () => {

    const confirmExit = confirm(
        "Do you want to leave Gabi sa Mendez?"
    );

    if (confirmExit) {
        window.close();

        alert("You may now close this browser tab.");
    }

});

// ============================================
// SETTINGS AND INSTRUCTIONS
// ============================================

document.querySelectorAll(".back-menu").forEach(button => {

    button.addEventListener("click", () => {
        showScreen("menu-screen");
    });

});

bindButton("instructions-btn", () => {
    showScreen("instructions-screen");
});

bindButton("settings-btn", () => {
    showScreen("settings-screen");
});

// ============================================
// PLAYER SELECTION
// ============================================

bindButton("solo-btn", () => {
    startGame("solo");
});

bindButton("coop-btn", () => {
    startGame("coop");
});

// ============================================
// PAUSE MENU
// ============================================

bindButton("pause-btn", () => {

    if (!gameRunning) return;

    gamePaused = true;

    showScreen("pause-screen");

});

bindButton("resume-btn", () => {

    gamePaused = false;

    showScreen("game-screen");

});

bindButton("pause-menu-btn", () => {
    returnToMenu();
});

// ============================================
// REST PERIOD
// ============================================

bindButton("rest-continue-btn", () => {

    if (currentNight < 5) {
        nextNight();
    }

});

// ============================================
// WIN SCREEN
// ============================================

bindButton("win-menu-btn", () => {
    returnToMenu();
});

// ============================================
// DEATH SCREEN
// ============================================

bindButton("retry-btn", () => {
    retryNight();
});

bindButton("death-menu-btn", () => {
    returnToMenu();
});

// ============================================
// AUDIO SETTINGS
// ============================================

const sfxVolume = document.getElementById("sfx-volume");
const musicVolume = document.getElementById("music-volume");

if (sfxVolume) {

    sfxVolume.addEventListener("input", event => {
        localStorage.setItem("gsm-sfx", event.target.value);
    });

}

if (musicVolume) {

    musicVolume.addEventListener("input", event => {
        localStorage.setItem("gsm-music", event.target.value);
    });

}


// ============================================
// INITIAL SETTINGS
// ============================================

const playerTwoHUD = document.getElementById("player-two-hud");

if (playerTwoHUD) {
    playerTwoHUD.style.display = "none";
}

if (localStorage.getItem("gsm-sfx") && sfxVolume) {
    sfxVolume.value = localStorage.getItem("gsm-sfx");
}

if (localStorage.getItem("gsm-music") && musicVolume) {
    musicVolume.value = localStorage.getItem("gsm-music");
}