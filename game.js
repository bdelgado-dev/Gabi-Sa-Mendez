
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
        icon: "🔪", asset: "balisong.ico"
    },

    palakol: {
        name: "Palakol",
        type: "melee",
        damage: 25,
        icon: "🪓", asset: "palakol.ico"
    },

    itak: {
        name: "Itak",
        type: "melee",
        damage: 15,
        icon: "🗡️", asset: "itak.ico"
    },

    kawali: {
        name: "Kawali",
        type: "melee",
        damage: 12,
        icon: "🍳", asset: "kawali.ico"
    },

    revolver: {
        name: "Revolver",
        type: "gun",
        damage: 25,
        magazine: 6,
        reloadTime: 2.5,
        icon: "🔫", asset: "revolver.ico"
    },

    ak47: {
        name: "AK-47",
        type: "gun",
        damage: 50,
        magazine: 50,
        reloadTime: 2,
        icon: "🎯", asset: "ak-47.ico"
    },

    bandage: {
        name: "Bandage",
        type: "heal",
        amount: 20,
        icon: "🩹", asset: "bandage.ico"
    },

    medkit: {
        name: "Medkit",
        type: "heal",
        amount: 60,
        icon: "🧰", asset: "medkit.ico"
    },

    drink: {
        name: "Sports Drink",
        type: "energy",
        amount: 80,
        icon: "🥤", asset: "sports-drink.ico"
    },

    armor: {
        name: "Armor",
        type: "armor",
        amount: 20,
        icon: "🛡️", asset: "armor.ico"
    },

    ammo: {
        name: "Bullets",
        type: "ammo",
        amount: 30,
        icon: "📦", asset: "bullets.ico"
    },

    anting: {
        name: "Anting-anting",
        type: "special",
        price: 80,
        description: "A mysterious protective charm worn around the neck. Activating it casts a force field around you, protecting you from incoming attacks for 5 seconds. Use only when necessary.",
        icon: "📿",
        asset: "anting-anting.ico"
    },

    bawang: {
        name: "Bawang",
        type: "throwable",
        damage: 50,
        price: 60,
        icon: "🧄",
        asset: "bawang.ico"
    },

    unliAmmo: {
        name: "Unlimited Ammo",
        type: "perk",
        perk: "ammo",
        price: 150,
        icon: "♾️",
        asset: "unli-ammo.ico"
    },

    unliEnergy: {
        name: "Unlimited Energy",
        type: "perk",
        perk: "energy",
        price: 120,
        icon: "⚡",
        asset: "unli-energy.ico"
    },

    gold: {
        name: "Gold Coin",
        type: "currency",
        icon: "🪙"
    }
};

// Item icons are loaded from the filenames supplied by the developer.
// Keep these files in: assets/items/
const itemImages = {};

Object.entries(itemTypes).forEach(([key, item]) => {

    if (!item.asset) return;

    const image = new Image();

    image.src = "assets/items/" + item.asset;

    itemImages[key] = image;

});

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
let effects = [];

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

let mapWidth = 1500;
let mapHeight = 900;

let buildings = [];
let trees = [];
let obstacles = [];

let reviveProgress = 0;

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
        coins: 0,

        forceFieldTime: 0,
        unlimitedAmmoTime: 0,
        unlimitedEnergyTime: 0,

        meleeAnimation: 0,
        throwAnimation: 0,
        muzzleFlash: 0,
        garlicCooldown: 0,

        speed: 210,

        // PLAYER FACING DIRECTION
        facing: -1,
        facingX: -1,
        facingY: 0,

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

        inventoryOpen: false,

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
        [90, 90], [300, 145], [520, 75],
        [760, 115], [1010, 80], [1280, 140],
        [1080, 300], [120, 330], [355, 285],
        [590, 335], [825, 300], [1390, 470],
        [230, 520], [520, 560], [780, 510],
        [1080, 620], [1320, 730]
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

    for (let i = 0; i < 58; i++) {

        trees.push({
            x: 30 + Math.random() * (mapWidth - 60),
            y: 50 + Math.random() * (mapHeight - 100),
            size: 13 + Math.random() * 12
        });

    }

    for (let i = 0; i < 34; i++) {

        obstacles.push({
            x: 60 + Math.random() * (mapWidth - 120),
            y: 60 + Math.random() * (mapHeight - 120),
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
    "settings-screen",
    "player-screen",
    "pause-screen",
    "rest-screen",
    "win-screen",
    "death-screen"
];

function showScreen(id) {

    screenIds.forEach(screenId => {

        const screen = document.getElementById(screenId);

        if (screen) {
            screen.classList.remove("active");
        }

    });

    const gameScreen = document.getElementById("game-screen");

    if (gameScreen) {

        gameScreen.classList.add("hidden");
        gameScreen.classList.remove("visible");
        gameScreen.style.display = "";

    }

    if (id === "game-screen" || id === null) {

        if (gameScreen) {

            gameScreen.classList.remove("hidden");
            gameScreen.classList.add("visible");
            gameScreen.style.display = "block";

        }

    } else {

        const selectedScreen = document.getElementById(id);

        if (selectedScreen) {

            selectedScreen.classList.remove("hidden");
            selectedScreen.classList.add("active");

        } else {

            console.error("Screen not found:", id);

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

    keys = {};

    clearInterval(restInterval);
    clearTimeout(notificationTimer);

    players = [];
    enemies = [];
    bullets = [];
    pickups = [];
    effects = [];

    reloadTimers.forEach(timer => clearTimeout(timer));
    reloadTimers = [];

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
    effects = [];

    players = [];

    keys = {};

    reviveProgress = 0;

    clearInterval(restInterval);

    reloadTimers.forEach(timer => clearTimeout(timer));
    reloadTimers = [];

    players.push(
        createPlayer(1, mapWidth / 2 - 45, "#416f91")
    );

    if (mode === "coop") {

        players.push(
            createPlayer(2, mapWidth / 2 + 45, "#b47a48")
        );

    }

    createMap();

    spawnInterval = 2.35;
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

    reviveProgress = 0;

    players.forEach(player => {

        if (player.unlimitedAmmoTime > 0) {
            player.unlimitedAmmoTime = 999;
        }

        if (player.unlimitedEnergyTime > 0) {
            player.unlimitedEnergyTime = 999;
        }

    });

    document.getElementById("game-message").textContent = "";

    if (night === 1) {
        reviveTokens = 0;
    } else {
        reviveTokens = 1;
    }

    spawnInterval = [2.35, 1.95, 1.55, 1.15, 0.78][night - 1];

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
            "ak47",
            "bawang",
            "anting"
        ];

        const type = list[Math.floor(Math.random() * list.length)];

        spawnPickup(type);

    }

}

function spawnPickup(type) {

    let x = 50 + Math.random() * (mapWidth - 100);
    let y = 60 + Math.random() * (mapHeight - 120);

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
        y = Math.random() * (mapHeight - 40);

    } else {

        x = mapWidth - 20;
        y = Math.random() * (mapHeight - 40);

    }

    enemies.push({

        type: type,

        x: x,
        y: y,

        health: data.health,
        maxHealth: data.health,

        damage: data.damage,
        speed: data.speed * [0.72, 0.82, 0.94, 1.08, 1.22][currentNight - 1],

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

    player.forceFieldTime = Math.max(0, player.forceFieldTime - deltaTime);
    player.unlimitedAmmoTime = Math.max(0, player.unlimitedAmmoTime - deltaTime);
    player.unlimitedEnergyTime = Math.max(0, player.unlimitedEnergyTime - deltaTime);
    player.meleeAnimation = Math.max(0, player.meleeAnimation - deltaTime);
    player.throwAnimation = Math.max(0, player.throwAnimation - deltaTime);
    player.muzzleFlash = Math.max(0, player.muzzleFlash - deltaTime);
    player.garlicCooldown = Math.max(0, player.garlicCooldown - deltaTime);

    let dx = 0;
    let dy = 0;

    // PLAYER 1 MOVEMENT
    if (player.id === 1) {

        if (keys["KeyA"]) dx -= 1;
        if (keys["KeyD"]) dx += 1;
        if (keys["KeyW"]) dy -= 1;
        if (keys["KeyS"]) dy += 1;

    }

    // PLAYER 2 MOVEMENT
    else {

        if (keys["ArrowLeft"]) dx -= 1;
        if (keys["ArrowRight"]) dx += 1;
        if (keys["ArrowUp"]) dy -= 1;
        if (keys["ArrowDown"]) dy += 1;

    }

    // UPDATE FACING DIRECTION
    if (dx !== 0 || dy !== 0) {

        const length = Math.sqrt(dx * dx + dy * dy);

        player.facingX = dx / length;
        player.facingY = dy / length;

        if (dx !== 0) {
            player.facing = dx > 0 ? 1 : -1;
        }

        // NORMALIZE MOVEMENT
        dx /= length;
        dy /= length;

        const movementSpeed = (player.energy <= 0 && player.unlimitedEnergyTime <= 0)
            ? player.speed * 0.55
            : player.speed;

        player.x += dx * movementSpeed * deltaTime;
        player.y += dy * movementSpeed * deltaTime;

        if (player.unlimitedEnergyTime <= 0) {
            player.energy = Math.max(0, player.energy - 5 * deltaTime);
        } else {
            player.energy = player.maxEnergy;
        }

    }

    // KEEP PLAYER INSIDE THE MAP
    player.x = Math.max(20, Math.min(mapWidth - 20, player.x));
    player.y = Math.max(20, Math.min(mapHeight - 20, player.y));

    player.attackCooldown = Math.max(0, player.attackCooldown - deltaTime);
    player.meleeCooldown = Math.max(0, player.meleeCooldown - deltaTime);

    if (player.reloading) {

        player.reloadTime -= deltaTime;

        if (player.reloadTime <= 0) {
            finishReload(player);
        }

    }

}


// ============================================
// PLAYER MOVEMENT
// ============================================

function movePlayer(player, deltaTime) {

    if (player.downed) return;

    // UPDATE TIMERS
    player.forceFieldTime = Math.max(0, player.forceFieldTime - deltaTime);
    player.unlimitedAmmoTime = Math.max(0, player.unlimitedAmmoTime - deltaTime);
    player.unlimitedEnergyTime = Math.max(0, player.unlimitedEnergyTime - deltaTime);
    player.meleeAnimation = Math.max(0, player.meleeAnimation - deltaTime);
    player.throwAnimation = Math.max(0, player.throwAnimation - deltaTime);
    player.muzzleFlash = Math.max(0, player.muzzleFlash - deltaTime);
    player.garlicCooldown = Math.max(0, player.garlicCooldown - deltaTime);

    let dx = 0;
    let dy = 0;

    // PLAYER 1 MOVEMENT
    if (player.id === 1) {

        if (keys["KeyA"]) dx -= 1;
        if (keys["KeyD"]) dx += 1;
        if (keys["KeyW"]) dy -= 1;
        if (keys["KeyS"]) dy += 1;

    }

    // PLAYER 2 MOVEMENT
    else {

        if (keys["ArrowLeft"]) dx -= 1;
        if (keys["ArrowRight"]) dx += 1;
        if (keys["ArrowUp"]) dy -= 1;
        if (keys["ArrowDown"]) dy += 1;

    }

    // MOVEMENT
    if (dx !== 0 || dy !== 0) {

        const length = Math.sqrt(dx * dx + dy * dy);

        // UPDATE FACING DIRECTION
        player.facingX = dx / length;
        player.facingY = dy / length;

        if (dx !== 0) {
            player.facing = dx > 0 ? 1 : -1;
        }

        // NORMALIZE MOVEMENT
        dx /= length;
        dy /= length;

        // MOVEMENT SPEED
        const movementSpeed =
            (player.energy <= 0 && player.unlimitedEnergyTime <= 0)
                ? player.speed * 0.55
                : player.speed;

        player.x += dx * movementSpeed * deltaTime;
        player.y += dy * movementSpeed * deltaTime;

        // ENERGY CONSUMPTION
        if (player.unlimitedEnergyTime <= 0) {

            player.energy = Math.max(
                0,
                player.energy - 5 * deltaTime
            );

        } else {

            player.energy = player.maxEnergy;

        }

    }

    // ENERGY RECOVERY WHEN NOT MOVING
    else {

        player.energy = Math.min(
            player.maxEnergy,
            player.energy + 8 * deltaTime
        );

    }

    // UNLIMITED ENERGY
    if (player.unlimitedEnergyTime > 0) {
        player.energy = player.maxEnergy;
    }

    // MAP BOUNDARIES
    player.x = Math.max(
        20,
        Math.min(mapWidth - 20, player.x)
    );

    player.y = Math.max(
        20,
        Math.min(mapHeight - 20, player.y)
    );

    // COOLDOWNS
    player.attackCooldown = Math.max(
        0,
        player.attackCooldown - deltaTime
    );

    player.meleeCooldown = Math.max(
        0,
        player.meleeCooldown - deltaTime
    );

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

    if (player.unlimitedAmmoTime <= 0 && player.magazine[player.weapon] <= 0) {
        showNotification("OUT OF BULLETS! PRESS YOUR RELOAD KEY.");
        return;
    }

    if (player.attackCooldown > 0) return;

    player.attackCooldown = 0.35;

    if (player.unlimitedAmmoTime <= 0) {
        player.magazine[player.weapon]--;
    }

    player.muzzleFlash = 0.09;
    player.stats.shotsFired++;

    // GET THE PLAYER'S FACING DIRECTION
    const directionX = player.facingX;
    const directionY = player.facingY;

    // CREATE BULLET IN THE FACING DIRECTION
    bullets.push({

        x: player.x + directionX * 25 + directionY * 8,
        y: player.y - 10 + directionY * 25 - directionX * 8,

        directionX: directionX,
        directionY: directionY,

        speed: 550,

        damage: weapon.damage,

        owner: player.id,

        weapon: player.weapon,

        hit: false

    });

    updateHUD();

}

// ============================================
// FIND NEAREST ENEMY
// ============================================

function throwGarlic(player) {

    if (!gameRunning || gamePaused || player.downed || player.garlicCooldown > 0) return;

    let source = player.inventory;
    let index = source.indexOf("bawang");

    if (index < 0) {
        source = player.backpack;
        index = source.indexOf("bawang");
    }

    if (index < 0) {
        showNotification("NO BAWANG AVAILABLE!");
        return;
    }

    source.splice(index, 1);

    player.garlicCooldown = 0.7;
    player.throwAnimation = 0.22;

    bullets.push({
        kind: "garlic",
        x: player.x + player.facingX * 20,
        y: player.y - 8 + player.facingY * 18,
        directionX: player.facingX,
        directionY: player.facingY,
        speed: 300,
        fuse: 0.65,
        owner: player.id,
        hit: false
    });

    updateHUD();

}

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
    player.meleeAnimation = 0.24;

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

        const towardX = (enemy.x - player.x) / Math.max(1, distance);
        const towardY = (enemy.y - player.y) / Math.max(1, distance);

        const facingDot =
            towardX * player.facingX +
            towardY * player.facingY;

        if (distance < closestDistance && facingDot > 0.05) {
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

        // Every defeated creature may leave coins for the next-night shop.
        const coinDrop = 5 + Math.floor(Math.random() * 11);

        pickups.push({
            type: "gold",
            x: enemy.x,
            y: enemy.y,
            size: 13,
            amount: coinDrop
        });

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

    bullets.forEach(bullet => {

        if (bullet.kind === "garlic") {

            bullet.x += bullet.directionX * bullet.speed * deltaTime;
            bullet.y += bullet.directionY * bullet.speed * deltaTime;

            bullet.fuse -= deltaTime;

            if (
                bullet.fuse <= 0 ||
                bullet.x < 0 ||
                bullet.x > mapWidth ||
                bullet.y < 0 ||
                bullet.y > mapHeight
            ) {

                enemies.forEach(enemy => {

                    if (
                        Math.hypot(
                            enemy.x - bullet.x,
                            enemy.y - bullet.y
                        ) < 95
                    ) {
                        damageEnemy(enemy, 50, bullet.owner, "garlic");
                    }

                });

                bullet.hit = true;

                effects.push({
                    x: bullet.x,
                    y: bullet.y,
                    time: 0.35
                });

            }

            return;

        }

        // MOVE BULLET IN ITS FIRING DIRECTION
        bullet.x += bullet.directionX * bullet.speed * deltaTime;
        bullet.y += bullet.directionY * bullet.speed * deltaTime;

        // CHECK ENEMY COLLISION
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

        // REMOVE BULLETS OUTSIDE THE MAP
        if (
            bullet.x < 0 ||
            bullet.x > mapWidth ||
            bullet.y < 0 ||
            bullet.y > mapHeight
        ) {
            bullet.hit = true;
        }

    });

    bullets = bullets.filter(bullet => !bullet.hit);

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

            target = distanceOne < distanceTwo
                ? targets[0]
                : targets[1];

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
    if (player.forceFieldTime > 0) return;

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

function updateRevival(deltaTime) {

    if (gameMode !== "coop") return;

    if (!keys["KeyE"]) {

        reviveProgress = 0;

        document.getElementById("game-message").textContent = "";

        return;

    }

    if (reviveTokens <= 0) {

        reviveProgress = 0;

        document.getElementById("game-message").textContent = "";

        return;

    }

    const helper = players.find(p => !p.downed);
    const downed = players.find(p => p.downed);

    if (!helper || !downed) {

        reviveProgress = 0;

        document.getElementById("game-message").textContent = "";

        return;

    }

    const distance = Math.hypot(
        helper.x - downed.x,
        helper.y - downed.y
    );

    if (distance > 65) {

        reviveProgress = 0;

        document.getElementById("game-message").textContent = "";

        return;

    }

    // REVIVE TAKES 3 SECONDS
    reviveProgress += deltaTime;

    const percentage = Math.min(
        100,
        Math.floor(reviveProgress / 3 * 100)
    );

    document.getElementById("game-message").textContent =
        "REVIVING: " + percentage + "%";

    if (reviveProgress >= 3) {

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

        if (player.downed) {

            player.reloading = false;
            player.reloadTime = 0;

            return;

        }

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

    let index = player.inventory.findIndex(item =>
        itemTypes[item] && (
            itemTypes[item].type === "heal" ||
            itemTypes[item].type === "special" ||
            itemTypes[item].type === "perk"
        )
    );

    let source = player.inventory;

    if (index === -1) {

        source = player.backpack;

        index = source.findIndex(item =>
            itemTypes[item] && (
                itemTypes[item].type === "heal" ||
                itemTypes[item].type === "special" ||
                itemTypes[item].type === "perk"
            )
        );

    }

    if (index === -1) {

        showNotification("NO HEALING OR SPECIAL ITEMS AVAILABLE.");
        return;

    }

    if (
        player.health >= player.maxHealth &&
        itemTypes[source[index]].type === "heal"
    ) {

        showNotification("YOUR HEALTH IS ALREADY FULL.");
        return;

    }

    const item = source.splice(index, 1)[0];

    const data = itemTypes[item];

    if (data.type === "heal") {

        player.health = Math.min(
            player.maxHealth,
            player.health + data.amount
        );

        player.stats.heals++;

    } else if (item === "anting") {

        player.forceFieldTime = 5;

    } else if (item === "unliAmmo") {

        player.unlimitedAmmoTime = 999;

    } else if (item === "unliEnergy") {

        player.unlimitedEnergyTime = 999;

    }

    showNotification(data.name + " ACTIVATED!");

    updateHUD();

}

// ============================================
// PICKUP SYSTEM
// ============================================

function updatePickups() {

    players.forEach(player => {

        if (player.downed) return;

        // LOOP BACKWARDS SO REMOVED ITEMS DO NOT SKIP THE NEXT PICKUP
        for (let index = pickups.length - 1; index >= 0; index--) {

            const pickup = pickups[index];

            const distance = Math.hypot(
                player.x - pickup.x,
                player.y - pickup.y
            );

            if (distance < 35) {
                collectItem(player, index);
            }

        }

    });

}

function collectItem(player, index) {

    const pickup = pickups[index];

    if (!pickup) return;

    const type = pickup.type;
    const item = itemTypes[type];

    if (!item) return;

    if (type === "gold") {

        player.coins += pickup.amount || 5;

    } else if (type === "ammo") {

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

    showNotification(
        type === "gold"
            ? "+" + (pickup.amount || 5) + " GOLD COINS!"
            : item.name + " COLLECTED!"
    );

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

    if (
        itemTypes[item].type === "gun" ||
        itemTypes[item].type === "melee"
    ) {

        player.weapon = item;

        player.selectedSlot = index;

        showNotification(itemTypes[item].name + " EQUIPPED!");

    }

    updateHUD();

}

// ============================================

// ============================================
// INVENTORY DISPLAY
// ============================================

function renderInventory(player) {

    const prefix = "p" + player.id;

    const slots = document.getElementById(prefix + "-slots");
    const backpack = document.getElementById(prefix + "-backpack");

    if (!slots || !backpack) return;

    slots.innerHTML = "";
    backpack.innerHTML = "";

    const makeSlot = (item, index, isBag) => {

        const slot = document.createElement("button");

        slot.type = "button";

        slot.className =
            "inventory-slot" +
            (!isBag && player.selectedSlot === index ? " selected" : "");

        slot.title =
            item && itemTypes[item]
                ? itemTypes[item].name
                : "Empty slot";

        if (item && itemTypes[item]) {

            const data = itemTypes[item];

            if (data.asset) {

                const img = document.createElement("img");

                img.src = "assets/items/" + data.asset;
                img.alt = data.name;

                img.onerror = () => {
                    img.remove();
                    slot.insertAdjacentText("afterbegin", data.icon);
                };

                slot.appendChild(img);

            } else {

                const icon = document.createElement("b");

                icon.textContent = data.icon;

                slot.appendChild(icon);

            }

            const name = document.createElement("small");

            name.textContent = data.name;

            slot.appendChild(name);

        } else {

            slot.textContent = "EMPTY";

        }

        slot.addEventListener("click", () => {

            if (!item) return;

            if (itemTypes[item].type === "throwable") {

                throwGarlic(player);

            } else if (isBag) {

                if (["heal", "special", "perk"].includes(itemTypes[item].type)) {

                    const idx = player.backpack.indexOf(item);

                    const chosen = player.backpack.splice(idx, 1)[0];

                    activateInventoryItem(player, chosen);

                } else if (["gun", "melee"].includes(itemTypes[item].type)) {

                    if (player.inventory.length < 5) {
                        player.inventory.push(item);
                    }

                    player.backpack.splice(
                        player.backpack.indexOf(item),
                        1
                    );

                    player.weapon = item;

                }

            } else {

                if (["gun", "melee"].includes(itemTypes[item].type)) {

                    selectSlot(player, index + 1);

                } else if (["heal", "special", "perk"].includes(itemTypes[item].type)) {

                    const chosen = player.inventory.splice(index, 1)[0];

                    activateInventoryItem(player, chosen);

                }

            }

            updateHUD();

        });

        return slot;

    };

    for (let i = 0; i < 5; i++) {
        slots.appendChild(makeSlot(player.inventory[i], i, false));
    }

    for (let i = 0; i < 10; i++) {
        backpack.appendChild(makeSlot(player.backpack[i], i, true));
    }

    backpack.style.display = player.inventoryOpen ? "grid" : "none";

    const label = document.querySelector(
        "#player-" +
        (player.id === 1 ? "one" : "two") +
        "-hud .backpack-label"
    );

    if (label) {
        label.style.display = player.inventoryOpen ? "flex" : "none";
    }

    const bagCount = document.getElementById(prefix + "-bag-count");

    if (bagCount) {
        bagCount.textContent = player.backpack.length + " / 10";
    }

}

function activateInventoryItem(player, item) {

    const data = itemTypes[item];

    if (!data) return;

    if (data.type === "heal") {

        player.health = Math.min(
            player.maxHealth,
            player.health + data.amount
        );

        player.stats.heals++;

    } else if (item === "anting") {

        player.forceFieldTime = 5;

    } else if (item === "unliAmmo") {

        player.unlimitedAmmoTime = 999;

    } else if (item === "unliEnergy") {

        player.unlimitedEnergyTime = 999;

    }

    showNotification(data.name + " ACTIVATED!");

}

// ============================================
// INVENTORY POP-UP POSITION
// ============================================

function getInventoryPopupBounds(player) {

    const popupWidth = 210;

    const padding = 8;

    const backpackCount = Math.max(1, player.backpack.length);

    const popupHeight =
        30 +
        (5 * 19) +
        25 +
        (backpackCount * 19) +
        15;

    let popupX = player.x - popupWidth / 2;

    let popupY = player.y - popupHeight - 35;

    popupX = Math.max(
        padding,
        Math.min(mapWidth - popupWidth - padding, popupX)
    );

    if (popupY < padding) {
        popupY = player.y + 45;
    }

    return {
        x: popupX,
        y: popupY,
        width: popupWidth,
        height: popupHeight
    };

}

// ============================================
// DRAW INVENTORY POP-UP
// ============================================

function drawInventoryPopup(player) {

    if (!player.inventoryOpen) return;

    const bounds = getInventoryPopupBounds(player);

    const popupX = bounds.x;
    const popupY = bounds.y;
    const popupWidth = bounds.width;
    const popupHeight = bounds.height;

    ctx.save();

    // POP-UP SHADOW
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";

    ctx.fillRect(
        popupX + 5,
        popupY + 5,
        popupWidth,
        popupHeight
    );

    // POP-UP BACKGROUND
    ctx.fillStyle = "#20251f";

    ctx.fillRect(
        popupX,
        popupY,
        popupWidth,
        popupHeight
    );

    // POP-UP BORDER
    ctx.strokeStyle = "#d6b56d";
    ctx.lineWidth = 3;

    ctx.strokeRect(
        popupX,
        popupY,
        popupWidth,
        popupHeight
    );

    // HEADER
    ctx.fillStyle = "#493b2b";

    ctx.fillRect(
        popupX + 2,
        popupY + 2,
        popupWidth - 4,
        27
    );

    ctx.fillStyle = "#f5d58a";

    ctx.font = "bold 13px Arial";
    ctx.textAlign = "left";

    ctx.fillText(
        "PLAYER " + player.id + " INVENTORY",
        popupX + 10,
        popupY + 19
    );

    // CLOSE BUTTON
    const closeX = popupX + popupWidth - 25;
    const closeY = popupY + 6;

    ctx.fillStyle = "#a83232";

    ctx.fillRect(
        closeX,
        closeY,
        18,
        17
    );

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(closeX + 4, closeY + 4);
    ctx.lineTo(closeX + 14, closeY + 13);

    ctx.moveTo(closeX + 14, closeY + 4);
    ctx.lineTo(closeX + 4, closeY + 13);

    ctx.stroke();

    // QUICK INVENTORY
    let currentY = popupY + 46;

    ctx.fillStyle = "#f5d58a";
    ctx.font = "bold 11px Arial";

    ctx.fillText(
        "QUICK INVENTORY",
        popupX + 10,
        currentY
    );

    currentY += 18;

    for (let i = 0; i < 5; i++) {

        const item = player.inventory[i];

        const rowY = currentY;

        if (player.selectedSlot === i) {

            ctx.fillStyle = "rgba(214, 181, 109, 0.25)";

            ctx.fillRect(
                popupX + 7,
                rowY - 12,
                popupWidth - 14,
                17
            );

        }

        ctx.fillStyle = "#ffffff";
        ctx.font = "11px Arial";

        let itemName = "EMPTY";

        if (item && itemTypes[item]) {
            itemName = itemTypes[item].icon + " " + itemTypes[item].name;
        }

        ctx.fillText(
            (i + 1) + ". " + itemName,
            popupX + 12,
            rowY
        );

        currentY += 19;

    }

    // BACKPACK SECTION
    currentY += 5;

    ctx.fillStyle = "#f5d58a";
    ctx.font = "bold 11px Arial";

    ctx.fillText(
        "BACKPACK (" + player.backpack.length + "/10)",
        popupX + 10,
        currentY
    );

    currentY += 19;

    if (player.backpack.length === 0) {

        ctx.fillStyle = "#aaaaaa";
        ctx.font = "11px Arial";

        ctx.fillText(
            "No items stored.",
            popupX + 12,
            currentY
        );

    } else {

        player.backpack.forEach(item => {

            ctx.fillStyle = "#ffffff";
            ctx.font = "11px Arial";

            const itemName = itemTypes[item]
                ? itemTypes[item].icon + " " + itemTypes[item].name
                : "Unknown Item";

            ctx.fillText(
                "- " + itemName,
                popupX + 12,
                currentY
            );

            currentY += 19;

        });

    }

    ctx.restore();

}

// ============================================
// CLOSE INVENTORY POP-UP
// ============================================

canvas.addEventListener("click", function(event) {

    if (!gameRunning || gamePaused) return;

    const rect = canvas.getBoundingClientRect();

    const scale = Math.min(
        rect.width / mapWidth,
        rect.height / mapHeight
    );

    const offsetX = (rect.width - mapWidth * scale) / 2;
    const offsetY = (rect.height - mapHeight * scale) / 2;

    const mouseX =
        (event.clientX - rect.left - offsetX) / scale;

    const mouseY =
        (event.clientY - rect.top - offsetY) / scale;

    players.forEach(player => {

        if (!player.inventoryOpen) return;

        const bounds = getInventoryPopupBounds(player);

        const closeX = bounds.x + bounds.width - 25;
        const closeY = bounds.y + 6;

        if (
            mouseX >= closeX &&
            mouseX <= closeX + 18 &&
            mouseY >= closeY &&
            mouseY <= closeY + 17
        ) {
            player.inventoryOpen = false;
        }

    });

});

// ============================================
// UPDATE HUD
// ============================================

function updateHUD() {

    players.forEach(player => {

        const prefix = "p" + player.id;

        const healthBar = document.getElementById(prefix + "-health-bar");
        const healthText = document.getElementById(prefix + "-health-text");

        const energyBar = document.getElementById(prefix + "-energy-bar");
        const energyText = document.getElementById(prefix + "-energy-text");

        const weaponText = document.getElementById(prefix + "-weapon");
        const statusText = document.getElementById(prefix + "-status");

        if (healthBar) {
            healthBar.style.width = player.health + "%";
        }

        if (healthText) {
            healthText.textContent = Math.ceil(player.health);
        }

        if (energyBar) {

            energyBar.style.width =
                (player.energy / player.maxEnergy * 100) + "%";

        }

        if (energyText) {
            energyText.textContent = Math.ceil(player.energy);
        }

        if (weaponText) {

            weaponText.textContent =
                itemTypes[player.weapon].name +
                " · " +
                player.coins +
                " GOLD";

        }

        if (statusText) {
            statusText.textContent = player.downed ? "DOWNED" : "ALIVE";
        }

        renderInventory(player);

    });

    const reviveCount = document.getElementById("revive-count");
    const enemyCount = document.getElementById("enemy-count");

    if (reviveCount) {
        reviveCount.textContent = reviveTokens;
    }

    if (enemyCount) {
        enemyCount.textContent = enemies.length;
    }

    const playerOneHUD = document.getElementById("player-one-hud");
    const playerTwoHUD = document.getElementById("player-two-hud");

    if (gameMode === "solo") {

        if (playerTwoHUD) {
            playerTwoHUD.style.display = "none";
        }

        if (playerOneHUD) {
            playerOneHUD.style.margin = "auto";
        }

    } else {

        if (playerTwoHUD) {
            playerTwoHUD.style.display = "block";
        }

        if (playerOneHUD) {
            playerOneHUD.style.margin = "0";
        }

    }

}

// ============================================
// NIGHT COMPLETION
// ============================================

function completeNight() {

    if (!gameRunning) return;

    gameRunning = false;

    players.forEach(player => {
        player.unlimitedAmmoTime = 0;
        player.unlimitedEnergyTime = 0;
    });

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

    buildShop();

    document.getElementById("rest-timer").textContent = restTimer;

    clearInterval(restInterval);

    restInterval = setInterval(() => {

        restTimer--;

        document.getElementById("rest-timer").textContent = restTimer;

        if (restTimer <= 0) {

            clearInterval(restInterval);

            nextNight();

        }

    }, 1000);

}

function buildShop() {

    let shop = document.getElementById("night-shop");

    if (!shop) {

        shop = document.createElement("div");

        shop.id = "night-shop";

        const panel = document.querySelector("#rest-screen .panel");

        if (panel) {
            panel.appendChild(shop);
        }

    }

    if (!shop) return;

    shop.innerHTML =
        "<h3>VILLAGE SUPPLY SHOP</h3>" +
        "<p>Spend your collected gold before the next night.</p>";

    const products = [
        ["anting", "Anting-anting", 80, "5-second protective force field"],
        ["bawang", "Bawang", 60, "Throwable garlic bomb · 50 damage"],
        ["unliAmmo", "Unlimited Ammo", 150, "Unlimited bullets for the next night"],
        ["unliEnergy", "Unlimited Energy", 120, "Unlimited energy for the next night"],
        ["medkit", "Medkit", 35, "Restore 60 health"],
        ["ammo", "Bullets", 25, "Add 30 reserve bullets"]
    ];

    players.forEach(player => {

        const section = document.createElement("div");

        section.className = "shop-player";

        const title = document.createElement("h4");

        title.textContent =
            "PLAYER " + player.id + " · " + player.coins + " GOLD";

        section.appendChild(title);

        products.forEach(([key, name, price, description]) => {

            const row = document.createElement("div");

            row.className = "shop-item";

            const info = document.createElement("span");

            info.textContent = name + " — " + description;

            const buy = document.createElement("button");

            buy.type = "button";
            buy.textContent = price + " GOLD";

            buy.addEventListener("click", () => {

                if (player.coins < price) {

                    showNotification("NOT ENOUGH GOLD!");

                    return;

                }

                player.coins -= price;

                if (key === "ammo") {

                    player.reserveAmmo += 30;

                } else if (key === "medkit") {

                    player.backpack.push("medkit");

                } else if (
                    key === "anting" ||
                    key === "bawang" ||
                    key === "unliAmmo" ||
                    key === "unliEnergy"
                ) {

                    const target =
                        player.inventory.length < 5
                            ? player.inventory
                            : player.backpack;

                    if (
                        target === player.backpack &&
                        target.length >= 10
                    ) {

                        player.coins += price;

                        showNotification("INVENTORY FULL!");

                        return;

                    }

                    target.push(key);

                }

                title.textContent =
                    "PLAYER " + player.id + " · " + player.coins + " GOLD";

                showNotification(name + " PURCHASED!");

                updateHUD();

            });

            row.append(info, buy);

            section.appendChild(row);

        });

        shop.appendChild(section);

    });

}

function nextNight() {

    clearInterval(restInterval);

    currentNight++;

    players.forEach(player => {

        player.health = Math.min(100, player.health + 20);
        player.energy = 200;

        player.downed = false;

        player.inventoryOpen = false;

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

    if (gameOver) return;

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

    keys = {};

    reviveProgress = 0;

    reloadTimers.forEach(timer => clearTimeout(timer));

    reloadTimers = [];

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
        player.reloadTime = 0;

        player.inventoryOpen = false;

    });

    startNight(currentNight);

    showScreen(null);

    gameRunning = true;
    gamePaused = false;
    gameOver = false;

    updateHUD();

}

// ============================================
// NOTIFICATIONS
// ============================================

function showNotification(message) {

    const notification = document.getElementById("notification");

    if (!notification) return;

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

    ctx.fillRect(
        0,
        0,
        mapWidth,
        mapHeight
    );

    // GROUND DETAILS
    for (let i = 0; i < 300; i++) {

        const x = (i * 83) % mapWidth;
        const y = (i * 47) % mapHeight;

        ctx.fillStyle = i % 2 === 0 ? "#40503b" : "#303e33";

        ctx.fillRect(x, y, 3, 3);

    }

    // VILLAGE ROAD
    ctx.fillStyle = "#776b56";

    ctx.fillRect(
        0,
        650,
        mapWidth,
        100
    );

    ctx.fillStyle = "#b4a27b";

    for (let x = 0; x < mapWidth; x += 75) {
        ctx.fillRect(x, 697, 35, 3);
    }

// HOUSES
    buildings.forEach(house => {

        ctx.fillStyle = house.color;

        ctx.fillRect(
            house.x,
            house.y,
            house.width,
            house.height
        );

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

        ctx.fillRect(
            house.x + 12,
            house.y + 15,
            18,
            15
        );

    });

    // TREES
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

    // OBSTACLES
    obstacles.forEach(obstacle => {

        ctx.fillStyle = "#5d5a4d";

        ctx.fillRect(
            obstacle.x,
            obstacle.y,
            obstacle.width,
            obstacle.height
        );

    });

}

// ============================================
// DRAW PLAYERS
// ============================================

function drawPlayers() {

    players.forEach(player => {

        ctx.save();

        if (player.downed) {
            ctx.globalAlpha = 0.35;
        }

        // SHADOW
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

        // BODY
        ctx.fillStyle = player.color;

        ctx.fillRect(
            player.x - 12,
            player.y - 15,
            24,
            29
        );

        // HEAD
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

        // FACE DIRECTION
        ctx.fillStyle = "#171717";

        ctx.beginPath();

        ctx.arc(
            player.x + player.facingX * 5,
            player.y - 22 + player.facingY * 5,
            2,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // EQUIPPED WEAPON SPRITE + ATTACK ANIMATION
        const equipped = itemTypes[player.weapon];
        const weaponImage = itemImages[player.weapon];
        const angle = Math.atan2(player.facingY, player.facingX);

        if (weaponImage && weaponImage.complete && weaponImage.naturalWidth) {

            ctx.save();

            ctx.translate(
                player.x + player.facingX * 13,
                player.y - 7 + player.facingY * 9
            );

            ctx.rotate(angle);

            if (player.meleeAnimation > 0) {
                ctx.rotate(-0.9 + (0.9 - player.meleeAnimation) * 7.5);
            }

            ctx.drawImage(
                weaponImage,
                0,
                -8,
                equipped.type === "gun" ? 30 : 25,
                16
            );

            ctx.restore();

        }

        if (player.throwAnimation > 0) {

            ctx.strokeStyle = "#c28d6a";
            ctx.lineWidth = 5;
            ctx.lineCap = "square";

            ctx.beginPath();

            ctx.moveTo(
                player.x + player.facingX * 7,
                player.y - 7
            );

            ctx.lineTo(
                player.x + player.facingX * 24,
                player.y - 7 + player.facingY * 18
            );

            ctx.stroke();

        }

        if (player.muzzleFlash > 0) {

            ctx.fillStyle = "#ffd36a";

            ctx.beginPath();

            ctx.arc(
                player.x + player.facingX * 38,
                player.y - 9 + player.facingY * 26,
                7,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }

        if (player.forceFieldTime > 0) {

            ctx.strokeStyle = "rgba(90,190,255,.85)";
            ctx.lineWidth = 3;

            ctx.beginPath();

            ctx.arc(
                player.x,
                player.y - 5,
                30,
                0,
                Math.PI * 2
            );

            ctx.stroke();

        }

        // PLAYER NUMBER
        ctx.fillStyle = "white";
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            "P" + player.id,
            player.x,
            player.y + 38
        );

        // INVENTORY POP-UP
        drawInventoryPopup(player);

        ctx.restore();

    });

}

// ============================================
// DRAW ENEMIES
// ============================================

function drawEnemies() {

    enemies.forEach(enemy => {

        // BODY
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

        // EYES
        ctx.fillStyle = "#ff2b24";

        ctx.fillRect(enemy.x - 7, enemy.y - 5, 4, 4);
        ctx.fillRect(enemy.x + 3, enemy.y - 5, 4, 4);

        // HEALTH BAR BACKGROUND
        const barWidth = enemy.size * 2;

        ctx.fillStyle = "#211c1b";

        ctx.fillRect(
            enemy.x - barWidth / 2,
            enemy.y - enemy.size - 14,
            barWidth,
            5
        );

        // HEALTH BAR
        ctx.fillStyle = "#c93632";

        ctx.fillRect(
            enemy.x - barWidth / 2,
            enemy.y - enemy.size - 14,
            barWidth * Math.max(0, enemy.health / enemy.maxHealth),
            5
        );

        // ENEMY NAME
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

        const iconImage = itemImages[pickup.type];

        if (iconImage && iconImage.complete && iconImage.naturalWidth) {

            ctx.drawImage(
                iconImage,
                pickup.x - 10,
                pickup.y - 10,
                20,
                20
            );

        } else {

            ctx.fillStyle = "#161616";
            ctx.font = "15px Arial";
            ctx.textAlign = "center";

            ctx.fillText(
                item.icon || "?",
                pickup.x,
                pickup.y + 5
            );

        }

    });

}

// ============================================
// DRAW BULLETS
// ============================================

function drawBullets() {

    bullets.forEach(bullet => {

        if (bullet.kind === "garlic") {

            const img = itemImages.bawang;

            if (img && img.complete && img.naturalWidth) {

                ctx.drawImage(
                    img,
                    bullet.x - 10,
                    bullet.y - 10,
                    20,
                    20
                );

            } else {

                ctx.fillStyle = "#e9e3d2";

                ctx.beginPath();

                ctx.arc(
                    bullet.x,
                    bullet.y,
                    8,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

            }

            return;

        }

        const angle = Math.atan2(
            bullet.directionY,
            bullet.directionX
        );

        ctx.save();

        ctx.translate(bullet.x, bullet.y);

        ctx.rotate(angle);

        // BULLET BODY
        ctx.fillStyle = "#ffe19a";

        ctx.fillRect(
            -8,
            -2,
            16,
            4
        );

        // BULLET TIP
        ctx.fillStyle = "#ffffff";

        ctx.fillRect(
            5,
            -1,
            4,
            2
        );

        ctx.restore();

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

    effects.forEach(effect => {
        effect.time -= deltaTime;
    });

    effects = effects.filter(effect => effect.time > 0);

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

    // SCALE THE GAME MAP TO FIT THE SCREEN
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

    effects.forEach(effect => {

        ctx.strokeStyle =
            "rgba(230,210,150," +
            Math.max(0, effect.time / .35) +
            ")";

        ctx.lineWidth = 5;

        ctx.beginPath();

        ctx.arc(
            effect.x,
            effect.y,
            95 * (1 - effect.time / .35),
            0,
            Math.PI * 2
        );

        ctx.stroke();

    });

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
        [
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "Space"
        ].includes(event.code)
    ) {

        event.preventDefault();

    }

    if (event.repeat) return;

    if (!gameRunning || gamePaused) return;

    const playerOne = players[0];
    const playerTwo = players[1];

    // PLAYER 1 CONTROLS
    if (event.code === "KeyT" && playerOne) {
        shoot(playerOne);
    }

    if (event.code === "KeyY" && playerOne) {
        meleeAttack(playerOne);
    }

    if (event.code === "KeyU" && playerOne) {
        reload(playerOne);
    }

    if (event.code === "KeyI" && playerOne) {
        useHeal(playerOne);
    }

    if (event.code === "KeyB" && playerOne) {
        throwGarlic(playerOne);
    }

    // PLAYER 2 CONTROLS
    if (event.code === "Numpad1" && playerTwo) {
        shoot(playerTwo);
    }

    if (event.code === "Numpad2" && playerTwo) {
        meleeAttack(playerTwo);
    }

    if (event.code === "Numpad4" && playerTwo) {
        reload(playerTwo);
    }

    if (event.code === "Numpad5" && playerTwo) {
        useHeal(playerTwo);
    }

    if (event.code === "Numpad7" && playerTwo) {
        throwGarlic(playerTwo);
    }

    // INVENTORY POP-UP
    if (event.code === "KeyO" && playerOne) {

        playerOne.inventoryOpen = !playerOne.inventoryOpen;

        updateHUD();

    }

    if (event.code === "Numpad6" && playerTwo) {

        playerTwo.inventoryOpen = !playerTwo.inventoryOpen;

        updateHUD();

    }

    // INVENTORY SELECTION - PLAYER 1
    if (event.code.startsWith("Digit")) {

        const number = Number(
            event.code.replace("Digit", "")
        );

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

    keys = {};

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

        localStorage.setItem(
            "gsm-sfx",
            event.target.value
        );

    });

}

if (musicVolume) {

    musicVolume.addEventListener("input", event => {

        localStorage.setItem(
            "gsm-music",
            event.target.value
        );

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
