
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// ==========================================
// GABI SA MENDEZ - 3D SURVIVAL HORROR GAME
// ==========================================

const $ = (id) => document.getElementById(id);

const screens = [
    'menu-screen',
    'instructions-screen',
    'settings-screen',
    'pause-screen',
    'victory-screen',
    'died-screen'
];

function showScreen(id) {
    screens.forEach(s => $(s).classList.remove('active'));

    if (id) {
        $(id).classList.add('active');
    }
}

// ==========================================
// NIGHT OBJECTIVES
// ==========================================

const targets = [50, 75, 100, 150, 300];

// ==========================================
// ENEMY STATISTICS
// ==========================================

const enemyData = {

    tiyanak: {
        name: 'Tiyanak',
        hp: 10,
        damage: 1,
        speed: 3.2,
        color: 0x9d3434,
        score: 10,
        size: .65
    },

    tiktik: {
        name: 'Tik-Tik',
        hp: 20,
        damage: 5,
        speed: 2.7,
        color: 0x6b426e,
        score: 20,
        size: .85
    },

    kapre: {
        name: 'Kapre',
        hp: 100,
        damage: 25,
        speed: 1.15,
        color: 0x4a3529,
        score: 100,
        size: 1.55
    },

    sigbin: {
        name: 'Sigbin',
        hp: 50,
        damage: 15,
        speed: 3.8,
        color: 0x6d7650,
        score: 50,
        size: .9
    },

    manananggal: {
        name: 'Manananggal',
        hp: 70,
        damage: 30,
        speed: 2.3,
        color: 0x8a273e,
        score: 70,
        size: 1.15
    },

    bampira: {
        name: 'Bampira',
        hp: 110,
        damage: 50,
        speed: 2.0,
        color: 0x292c38,
        score: 120,
        size: 1.2
    }

};

// ==========================================
// ENEMY APPEARANCE PER NIGHT
// ==========================================

const nightPools = [

    ['tiyanak', 'tiktik'],

    ['tiyanak', 'tiktik', 'kapre'],

    ['tiyanak', 'tiktik', 'kapre', 'sigbin'],

    ['tiyanak', 'tiktik', 'kapre', 'sigbin', 'manananggal'],

    ['tiyanak', 'tiktik', 'kapre', 'sigbin', 'manananggal', 'bampira']

];

// ==========================================
// WEAPONS AND ITEMS
// ==========================================

const itemData = {

    balisong: {
        name: 'Balisong',
        type: 'melee',
        damage: 10,
        icon: '🔪'
    },

    palakol: {
        name: 'Palakol',
        type: 'melee',
        damage: 25,
        icon: '🪓'
    },

    itak: {
        name: 'Itak',
        type: 'melee',
        damage: 15,
        icon: '🗡️'
    },

    kawali: {
        name: 'Kawali',
        type: 'melee',
        damage: 12,
        icon: '🍳'
    },

    revolver: {
        name: 'Revolver',
        type: 'gun',
        damage: 25,
        mag: 6,
        ammo: 6,
        icon: '🔫'
    },

    ak47: {
        name: 'AK-47',
        type: 'gun',
        damage: 50,
        mag: 50,
        ammo: 50,
        icon: '🎯'
    },

    ammo: {
        name: 'Ammo',
        type: 'ammo',
        icon: '📦'
    },

    bandage: {
        name: 'Bandage',
        type: 'heal',
        heal: 20,
        icon: '🩹'
    },

    medkit: {
        name: 'Medkit',
        type: 'heal',
        heal: 60,
        icon: '🧰'
    },

    drink: {
        name: 'Sports Drink',
        type: 'stamina',
        icon: '🥤'
    },

    armor: {
        name: 'Body Armor',
        type: 'armor',
        icon: '🛡️'
    }

};

// ==========================================
// GLOBAL GAME VARIABLES
// ==========================================

let scene;
let camera;
let renderer;
let clock;

let players = [];
let enemies = [];
let pickups = [];
let bullets = [];
let decor = [];

let running = false;
let paused = false;
let coop = false;

let night = 1;
let kills = 0;
let score = 0;

let spawnClock = 0;
let spawned = 0;

let reviveTokens = 0;
let reviveProgress = 0;

let toastTimer = 0;

let keys = {};

let mouseDown = false;
let aiming = false;

let highScore = Number(
    localStorage.getItem('gsm-highscore') || 0
);

let levelComplete = false;

const worldSize = 34;


// ==========================================
// INITIALIZE 3D ENVIRONMENT
// ==========================================

function init3D() {

    scene = new THREE.Scene();

    scene.background = new THREE.Color(0x101a1c);

    scene.fog = new THREE.Fog(
        0x101a1c,
        25,
        75
    );

    camera = new THREE.PerspectiveCamera(
        58,
        innerWidth / innerHeight,
        .1,
        150
    );

    camera.position.set(0, 25, 29);

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setPixelRatio(
        Math.min(devicePixelRatio, 2)
    );

    renderer.setSize(
        innerWidth,
        innerHeight
    );

    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;

    document.body.appendChild(renderer.domElement);


    // Lighting

    const hemi = new THREE.HemisphereLight(
        0x9ab4c2,
        0x1b211c,
        1.7
    );

    scene.add(hemi);

    const moon = new THREE.DirectionalLight(
        0xb8c9d8,
        2.2
    );

    moon.position.set(-15, 28, 12);
    moon.castShadow = true;

    scene.add(moon);


    // Ground

    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(90, 90),

        new THREE.MeshStandardMaterial({
            color: 0x303b32,
            roughness: 1
        })
    );

    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;

    scene.add(ground);


    // Road

    const road = new THREE.Mesh(
        new THREE.PlaneGeometry(9, 90),

        new THREE.MeshStandardMaterial({
            color: 0x343737,
            roughness: 1
        })
    );

    road.rotation.x = -Math.PI / 2;
    road.position.y = .015;

    scene.add(road);


    // Road markings

    for (let i = -40; i <= 40; i += 4) {

        const dash = new THREE.Mesh(
            new THREE.BoxGeometry(.12, .025, 1.5),

            new THREE.MeshBasicMaterial({
                color: 0xb9aa76
            })
        );

        dash.position.set(0, .04, i);

        scene.add(dash);

    }


    // Houses around the town

    for (let i = 0; i < 18; i++) {

        const side = i % 2 === 0 ? -1 : 1;

        const z =
            -38 + Math.floor(i / 2) * 9 + Math.random() * 2;

        const house = new THREE.Group();

        const w = 4 + Math.random() * 2;
        const h = 2.5 + Math.random() * 1.2;

        const body = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, 4),

            new THREE.MeshStandardMaterial({
                color: [
                    0x756451,
                    0x8a7862,
                    0x59635a,
                    0x786f60
                ][i % 4]
            })
        );

        body.position.y = h / 2;
        body.castShadow = true;

        house.add(body);


        // Roof

        const roof = new THREE.Mesh(
            new THREE.ConeGeometry(w * .78, 1.6, 4),

            new THREE.MeshStandardMaterial({
                color: 0x493a32
            })
        );

        roof.position.y = h + .75;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;

        house.add(roof);

        house.position.set(
            side * (9 + Math.random() * 4),
            0,
            z
        );

        scene.add(house);

        decor.push(house);

    }


    // Trees

    for (let i = 0; i < 34; i++) {

        const x = (Math.random() - .5) * 70;
        const z = (Math.random() - .5) * 80;

        if (Math.abs(x) < 7) continue;

        const tree = new THREE.Group();

        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(.18, .28, 2, 6),

            new THREE.MeshStandardMaterial({
                color: 0x493528
            })
        );

        trunk.position.y = 1;

        tree.add(trunk);


        const leaves = new THREE.Mesh(
            new THREE.ConeGeometry(1.5, 4, 7),

            new THREE.MeshStandardMaterial({
                color: 0x233d30
            })
        );

        leaves.position.y = 3.3;

        tree.add(leaves);

        tree.position.set(x, 0, z);

        scene.add(tree);

        decor.push(tree);

    }


    // Streetlights

    for (let z = -30; z <= 30; z += 15) {

        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(.08, .12, 6, 8),

            new THREE.MeshStandardMaterial({
                color: 0x292e2d
            })
        );

        pole.position.set(5, 3, z);

        scene.add(pole);


        const bulb = new THREE.PointLight(
            0xffc879,
            1.1,
            13
        );

        bulb.position.set(5, 5.7, z);

        scene.add(bulb);

    }

    window.addEventListener('resize', onResize);

    clock = new THREE.Clock();

    $('loading-note').style.display = 'none';

}


// ==========================================
// WINDOW RESIZE
// ==========================================

function onResize() {

    if (!camera || !renderer) return;

    camera.aspect = innerWidth / innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        innerWidth,
        innerHeight
    );

}


// ==========================================
// CREATE PLAYER CHARACTER
// ==========================================

function makePlayer(id, x, z) {

    const group = new THREE.Group();


    // Body

    const coat = new THREE.Mesh(
        new THREE.CapsuleGeometry(.42, .8, 4, 8),

        new THREE.MeshStandardMaterial({
            color: id === 1 ? 0x31566b : 0x73503c
        })
    );

    coat.position.y = 1.05;
    coat.castShadow = true;

    group.add(coat);


    // Head

    const head = new THREE.Mesh(
        new THREE.SphereGeometry(.3, 12, 10),

        new THREE.MeshStandardMaterial({
            color: 0xb98262
        })
    );

    head.position.y = 1.85;
    head.castShadow = true;

    group.add(head);


    // Backpack model

    const pack = new THREE.Mesh(
        new THREE.BoxGeometry(.48, .55, .25),

        new THREE.MeshStandardMaterial({
            color: 0x252b27
        })
    );

    pack.position.set(0, 1.1, -.42);

    group.add(pack);

    group.position.set(x, 0, z);

    scene.add(group);


    return {

        id,
        group,

        health: 100,
        stamina: 100,

        downed: false,
        downTimer: 0,

        weapon: 'balisong',

        inventory: [
            'balisong',
            'revolver',
            'bandage',
            'bandage',
            'medkit'
        ],

        backpack: [
            'bandage',
            'bandage',
            'bandage'
        ],

        jumpVelocity: 0,

        ammo: {
            revolver: 6,
            ak47: 50
        },

        armor: 0,

        crouch: false,

        fireCooldown: 0,
        meleeCooldown: 0,

        reviveUses: 0,
        score: 0

    };

}


// ==========================================
// START GAME
// ==========================================

function startGame(twoPlayer) {

    coop = twoPlayer;

    night = 1;
    kills = 0;
    score = 0;

    spawned = 0;
    spawnClock = 0;

    reviveTokens = 0;
    levelComplete = false;

    enemies.forEach(e => scene.remove(e.group));

    pickups.forEach(p => scene.remove(p.mesh));

    bullets.forEach(b => scene.remove(b.mesh));

    enemies = [];
    pickups = [];
    bullets = [];


    // Remove previous players

    players.forEach(p => scene.remove(p.group));

    players = [
        makePlayer(1, -2, 8)
    ];

    if (coop) {
        players.push(
            makePlayer(2, 2, 8)
        );
    }


    $('game-screen').classList.add('visible');

    showScreen(null);

    paused = false;
    running = true;

    $('pause-screen').classList.remove('active');

    setNight(1);

    spawnInitialLoot();

    updateHUD();

    toast('Find supplies. The first night is beginning.');

}


// ==========================================
// SET NIGHT
// ==========================================

function setNight(n) {

    night = n;

    enemies.forEach(e => scene.remove(e.group));

    enemies = [];

    kills = 0;
    spawned = 0;
    spawnClock = 0;

    levelComplete = false;

    reviveTokens = n === 1 ? 0 : 1;

    $('night-label').textContent = `${night} / 5`;

    $('target-label').textContent = targets[night - 1];

    $('kills-label').textContent = '0';

    $('revive-label').textContent = reviveTokens;

    toast(
        `NIGHT ${night}: Eliminate ${targets[night - 1]} creatures.`
    );

}


// ==========================================
// LOOT SYSTEM
// ==========================================

function spawnInitialLoot() {

    for (let i = 0; i < 18; i++) {

        spawnPickup(
            randomItem(),
            (Math.random() - .5) * 26,
            (Math.random() - .5) * 60
        );

    }

}


function randomItem() {

    const pool = [
        'ammo',
        'bandage',
        'bandage',
        'drink',
        'armor',
        'medkit',
        'itak',
        'palakol',
        'kawali',
        'revolver',
        'ak47'
    ];

    return pool[
        Math.floor(Math.random() * pool.length)
    ];

}


function spawnPickup(type, x, z) {

    const data = itemData[type];

    const color =
        type === 'armor'
            ? 0x7a9db3
            : type === 'ammo'
                ? 0xd1b15c
                : 0x8eaa72;

    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(.55, .55, .55),

        new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: .12
        })
    );

    mesh.position.set(x, .45, z);

    mesh.castShadow = true;

    scene.add(mesh);

    pickups.push({

        type,
        mesh,

        baseY: .45,

        phase: Math.random() * 6

    });

}


// ==========================================
// SPAWN ENEMIES
// ==========================================

function spawnEnemy() {

    const type =
        nightPools[night - 1][
            Math.floor(
                Math.random() * nightPools[night - 1].length
            )
        ];

    const d = enemyData[type];

    const angle = Math.random() * Math.PI * 2;

    const r = 19 + Math.random() * 8;

    const group = new THREE.Group();


    // Enemy body

    const body = new THREE.Mesh(
        new THREE.SphereGeometry(d.size * .48, 12, 10),

        new THREE.MeshStandardMaterial({
            color: d.color,
            roughness: .85
        })
    );

    body.position.y = d.size * .65;

    body.castShadow = true;

    group.add(body);


    // Enemy head

    const head = new THREE.Mesh(
        new THREE.SphereGeometry(d.size * .25, 10, 8),

        new THREE.MeshStandardMaterial({
            color: 0xb48a78
        })
    );

    head.position.y = d.size * 1.12;

    group.add(head);


    // Glowing eyes

    const eyeMat = new THREE.MeshBasicMaterial({
        color: 0xff3428
    });

    for (const x of [-.1, .1]) {

        const eye = new THREE.Mesh(
            new THREE.SphereGeometry(.045, 6, 6),
            eyeMat
        );

        eye.position.set(
            x * d.size,
            d.size * 1.14,
            d.size * .22
        );

        group.add(eye);

    }


    group.position.set(
        Math.cos(angle) * r,
        0,
        Math.sin(angle) * r
    );

    scene.add(group);


    enemies.push({

        type,
        group,

        hp: d.hp,
        maxHp: d.hp,

        damage: d.damage,
        speed: d.speed,

        size: d.size,

        attack: 0,
        hitFlash: 0

    });

}


// ==========================================
// SHOOTING SYSTEM
// ==========================================

function spawnBullet(player, targetDir) {

    const origin = player.group.position.clone();

    origin.y = 1.2;

    const dir = targetDir || new THREE.Vector3(0, 0, -1);

    const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(.09, 6, 6),

        new THREE.MeshBasicMaterial({
            color: 0xffd17a
        })
    );

    mesh.position.copy(origin).add(
        dir.clone().multiplyScalar(.7)
    );

    scene.add(mesh);


    bullets.push({

        mesh,

        dir: dir.clone().normalize(),

        life: 1.1,

        damage: itemData[player.weapon]?.damage || 25,

        owner: player

    });

}


function playerShoot(p) {

    if (p.downed || p.fireCooldown > 0) return;

    const item = itemData[p.weapon];


    if (item?.type === 'gun') {

        if (p.ammo[p.weapon] <= 0) {

            toast('Out of ammunition. Press R to reload.');

            p.fireCooldown = .35;

            return;

        }

        p.ammo[p.weapon]--;

        p.fireCooldown =
            p.weapon === 'ak47' ? .12 : .45;


        const dir = new THREE.Vector3(0, 0, -1)
            .applyAxisAngle(
                new THREE.Vector3(0, 1, 0),
                p.group.rotation.y
            );

        spawnBullet(p, dir);

    } else {

        playerMelee(p);

    }

}


// ==========================================
// MELEE ATTACK
// ==========================================

function playerMelee(p) {

    if (p.downed || p.meleeCooldown > 0) return;

    p.meleeCooldown = .55;

    const dir = new THREE.Vector3(0, 0, -1)
        .applyAxisAngle(
            new THREE.Vector3(0, 1, 0),
            p.group.rotation.y
        );

    let hit = false;


    for (const e of enemies) {

        const delta = e.group.position.clone()
            .sub(p.group.position);

        if (
            delta.length() < 2.3 &&
            delta.normalize().dot(dir) > .15
        ) {

            damageEnemy(
                e,
                itemData[p.weapon]?.damage || 10,
                p
            );

            hit = true;

        }

    }

    if (hit) {
        toast('Melee hit!');
    }

}


// ==========================================
// RELOAD
// ==========================================

function reload(p) {

    if (itemData[p.weapon]?.type !== 'gun') return;

    const mag = itemData[p.weapon].mag;

    p.ammo[p.weapon] = mag;

    toast(`${itemData[p.weapon].name} reloaded.`);

}


// ==========================================
// DAMAGE ENEMIES
// ==========================================

function damageEnemy(e, damage, owner) {

    if (!enemies.includes(e)) return;

    e.hp -= damage;


    if (e.hp <= 0) {

        scene.remove(e.group);

        enemies.splice(
            enemies.indexOf(e),
            1
        );

        kills++;

        score += enemyData[e.type].score;

        owner.score += enemyData[e.type].score;

        $('kills-label').textContent = kills;


        // Save high score

        if (score > highScore) {

            highScore = score;

            localStorage.setItem(
                'gsm-highscore',
                String(highScore)
            );

        }


        // Chance to drop loot

        if (Math.random() < .18) {

            spawnPickup(
                randomItem(),
                e.group.position.x,
                e.group.position.z
            );

        }


        // Check objective

        if (kills >= targets[night - 1]) {

            completeNight();

        }

    }

}


// ==========================================
// PLAYER DAMAGE
// ==========================================

function hurtPlayer(p, amount) {

    if (p.downed) return;

    const reduced = Math.max(
        1,
        amount - p.armor
    );

    p.health -= reduced;


    if (p.health <= 0) {

        p.health = 0;

        downPlayer(p);

    }

}


// ==========================================
// PLAYER DOWNED STATE AND REVIVAL
// ==========================================

function downPlayer(p) {

    p.downed = true;

    p.downTimer = 0;

    p.group.rotation.z = Math.PI / 2;

    toast(`PLAYER ${p.id} IS DOWN!`);


    // SINGLE PLAYER REVIVAL

    if (!coop) {

        if (reviveTokens > 0) {

            reviveTokens--;

            p.reviveUses++;

            $('revive-label').textContent = reviveTokens;


            // Automatic revival

            setTimeout(() => {

                if (running && p.downed) {

                    p.downed = false;

                    p.health = 50;

                    p.group.rotation.z = 0;

                    toast(
                        'You used your revive token. Keep moving!'
                    );

                    updateHUD();

                }

            }, 1200);

        } else {

            setTimeout(() => {

                if (running && p.downed) {

                    gameOver();

                }

            }, 900);

        }

    }


    // TWO PLAYER REVIVAL

    else if (players.every(x => x.downed)) {

        gameOver();

    }

}


// ==========================================
// TEAMMATE REVIVAL
// ==========================================

function reviveTeammate(dt) {

    if (!coop || reviveTokens <= 0) return;

    const alive = players.find(p => !p.downed);

    const down = players.find(p => p.downed);

    if (!alive || !down) return;


    const dist = alive.group.position.distanceTo(
        down.group.position
    );


    // Player must be near teammate

    if (dist < 2.6) {

        reviveProgress += dt;

        $('center-message').textContent =
            `REVIVING PLAYER ${down.id} ${
                (Math.min(100, reviveProgress / 5 * 100)).toFixed(0)
            }%`;


        // Five seconds required

        if (reviveProgress >= 5) {

            reviveTokens--;

            down.downed = false;

            down.health = 50;

            down.group.rotation.z = 0;

            reviveProgress = 0;

            $('center-message').textContent = '';

            $('revive-label').textContent = reviveTokens;

            toast(`PLAYER ${down.id} REVIVED!`);

            updateHUD();

        }

    } else {

        reviveProgress = 0;

        $('center-message').textContent = '';

    }

}


// ==========================================
// NIGHT COMPLETION
// ==========================================

function completeNight() {

    if (levelComplete) return;

    levelComplete = true;

    running = false;

    const final = night === 5;


    $('victory-title').textContent =
        final ? 'MENDEZ SURVIVED' : 'NIGHT CLEARED';


    $('victory-description').textContent =
        final
            ? `You survived all five nights. Final score: ${score}.`
            : `You eliminated ${kills} creatures. Prepare for Night ${night + 1}.`;


    $('continue-btn').textContent =
        final ? 'PLAY AGAIN' : 'CONTINUE';

    $('continue-btn').dataset.final =
        final ? 'yes' : 'no';


    showScreen('victory-screen');

}


// ==========================================
// GAME OVER
// ==========================================

function gameOver() {

    running = false;

    $('died-description').textContent =
        `You reached Night ${night}. Score: ${score}. Best score: ${highScore}.`;

    $('game-screen').classList.remove('visible');

    showScreen('died-screen');

}


// ==========================================
// RETRY NIGHT
// ==========================================

function retryNight() {

    enemies.forEach(e => scene.remove(e.group));

    enemies = [];


    players.forEach(p => {

        p.health = 100;

        p.stamina = 100;

        p.downed = false;

        p.group.rotation.z = 0;

        p.group.position.set(
            p.id === 1 ? -2 : 2,
            0,
            8
        );

    });


    setNight(night);

    $('game-screen').classList.add('visible');

    showScreen(null);

    running = true;

    spawnInitialLoot();

    updateHUD();

}


// ==========================================
// UPDATE HUD
// ==========================================

function updateHUD() {

    players.forEach(p => {

        const n = `p${p.id}`;


        $(n + '-health').style.width =
            p.health + '%';

        $(n + '-health-text').textContent =
            Math.ceil(p.health);


        $(n + '-stamina').style.width =
            p.stamina + '%';

        $(n + '-stamina-text').textContent =
            Math.ceil(p.stamina);


        $(n + '-status').textContent =
            p.downed ? 'DOWNED' : 'ALIVE';

        $(n + '-status').classList.toggle(
            'down',
            p.downed
        );


        $(n + '-weapon').textContent =
            itemData[p.weapon]?.name || p.weapon;


        $(n + '-ammo').textContent =
            itemData[p.weapon]?.type === 'gun'
                ? `${p.ammo[p.weapon]}/${itemData[p.weapon].mag}`
                : 'MELEE';

    });


    if (!coop) {

        $('p2-card').style.opacity = '.35';

        $('p2-status').textContent = 'NOT PLAYING';

    } else {

        $('p2-card').style.opacity = '1';

    }


    renderInventory();

    $('enemy-count').textContent = enemies.length;

    $('score-label').textContent = score;

    $('revive-label').textContent = reviveTokens;

}


// ==========================================
// INVENTORY DISPLAY
// ==========================================

function renderInventory() {

    const p = players[0];

    if (!p) return;


    const quick = p.inventory.slice(0, 5);


    $('quick-slots').innerHTML =
        Array.from({ length: 5 }, (_, i) => {

            const key = quick[i];

            const d = itemData[key];

            return `
                <div class="slot">
                    <b>${d?.icon || '＋'}</b>
                    <small>${d?.name || 'EMPTY'}</small>
                </div>
            `;

        }).join('');


    $('backpack-slots').innerHTML =
        Array.from({ length: 10 }, (_, i) => {

            const key = p.backpack[i];

            const d = itemData[key];

            return `
                <div class="slot">
                    <b>${d?.icon || '·'}</b>
                </div>
            `;

        }).join('');


    $('backpack-count').textContent =
        `${p.backpack.length}/10`;

}


// ==========================================
// PICKUP SYSTEM
// ==========================================

function collectPickup(p, index) {

    const item = pickups[index];

    if (!item) return;

    const d = itemData[item.type];


    // Ammunition

    if (item.type === 'ammo') {

        p.ammo.revolver += 6;

        p.ammo.ak47 += 25;

        toast('Ammunition collected.');

    }


    // Healing items

    else if (item.type === 'heal') {

        if (p.backpack.length < 10) {

            p.backpack.push(item.type);

        } else {

            toast('Backpack is full!');

            return;

        }

        toast(`${d.name} collected.`);

    }


    // Armor

    else if (item.type === 'armor') {

        p.armor = 10;

        toast('Body armor equipped. Damage reduced by 10.');

    }


    // Sports drink

    else if (item.type === 'stamina') {

        p.stamina = 100;

        toast('Stamina restored.');

    }


    // Weapons

    else {

        if (p.inventory.length < 5) {

            p.inventory.push(item.type);

        } else if (p.backpack.length < 10) {

            p.backpack.push(item.type);

        } else {

            toast('Inventory is full!');

            return;

        }

        toast(`${d.name} collected.`);

    }


    scene.remove(item.mesh);

    pickups.splice(index, 1);

    updateHUD();

}


// ==========================================
// HEALING SYSTEM
// ==========================================

function useHeal(p) {

    let idx = p.inventory.findIndex(
        x => x === 'medkit' || x === 'bandage'
    );

    let type;


    if (idx >= 0) {

        type = p.inventory.splice(idx, 1)[0];

    } else {

        idx = p.backpack.findIndex(
            x => x === 'medkit' || x === 'bandage'
        );

        if (idx >= 0) {

            type = p.backpack.splice(idx, 1)[0];

        }

    }


    if (!type) {

        toast('No healing item available.');

        return;

    }


    p.health = Math.min(
        100,
        p.health + itemData[type].heal
    );

    toast(`${itemData[type].name} used.`);

    updateHUD();

}


// ==========================================
// PLAYER MOVEMENT
// ==========================================

function movePlayer(p, dt) {

    if (p.downed) return;

    let x = 0;
    let z = 0;


    // Player 1 WASD

    if (p.id === 1) {

        if (keys.KeyA) x--;

        if (keys.KeyD) x++;

        if (keys.KeyW) z--;

        if (keys.KeyS) z++;

    }


    // Player 2 Arrow Keys

    else {

        if (keys.ArrowLeft) x--;

        if (keys.ArrowRight) x++;

        if (keys.ArrowUp) z--;

        if (keys.ArrowDown) z++;

    }


    const moving = x !== 0 || z !== 0;


    if (moving) {

        const v = new THREE.Vector3(x, 0, z).normalize();

        p.group.position.addScaledVector(
            v,
            dt * (p.crouch ? 3 : 5)
        );

        p.group.rotation.y =
            Math.atan2(v.x, v.z) + Math.PI;

    }


    // Jumping physics

    if (
        p.jumpVelocity !== 0 ||
        p.group.position.y > 0
    ) {

        p.group.position.y += p.jumpVelocity * dt;

        p.jumpVelocity -= 18 * dt;


        if (p.group.position.y <= 0) {

            p.group.position.y = 0;

            p.jumpVelocity = 0;

        }

    }


    // Map boundaries

    p.group.position.x =
        THREE.MathUtils.clamp(
            p.group.position.x,
            -32,
            32
        );

    p.group.position.z =
        THREE.MathUtils.clamp(
            p.group.position.z,
            -39,
            39
        );


    // Stamina regeneration

    p.stamina = Math.min(
        100,
        p.stamina + dt * (moving ? 2 : 8)
    );


    p.fireCooldown = Math.max(
        0,
        p.fireCooldown - dt
    );

    p.meleeCooldown = Math.max(
        0,
        p.meleeCooldown - dt
    );

}


// ==========================================
// ENEMY AI
// ==========================================

function updateEnemies(dt) {

    for (const e of [...enemies]) {

        const target = players
            .filter(p => !p.downed)
            .sort(
                (a, b) =>
                    e.group.position.distanceTo(a.group.position) -
                    e.group.position.distanceTo(b.group.position)
            )[0];


        if (!target) continue;


        const dir = target.group.position.clone()
            .sub(e.group.position);

        const dist = dir.length();


        // Chase player

        if (dist > 1.25) {

            dir.normalize();

            e.group.position.addScaledVector(
                dir,
                e.speed * dt
            );

            e.group.rotation.y =
                Math.atan2(dir.x, dir.z);

        }


        // Attack player

        else {

            e.attack -= dt;

            if (e.attack <= 0) {

                hurtPlayer(target, e.damage);

                e.attack = 1.15;

            }

        }

    }

}


// ==========================================
// UPDATE PICKUPS
// ==========================================

function updatePickups(dt) {

    for (const item of pickups) {

        item.phase += dt * 2;

        item.mesh.position.y =
            item.baseY + Math.sin(item.phase) * .12;

        item.mesh.rotation.y += dt * .8;

    }


    for (let i = pickups.length - 1; i >= 0; i--) {

        const item = pickups[i];

        const p = players.find(pl =>
            !pl.downed &&
            pl.group.position.distanceTo(item.mesh.position) < 1.25
        );


        if (p) {

            collectPickup(p, i);

        }

    }

}


// ==========================================
// UPDATE BULLETS
// ==========================================

function updateBullets(dt) {

    for (let i = bullets.length - 1; i >= 0; i--) {

        const b = bullets[i];

        b.mesh.position.addScaledVector(
            b.dir,
            dt * 28
        );

        b.life -= dt;

        let hit = null;


        for (const e of enemies) {

            if (
                e.group.position.distanceTo(b.mesh.position) <
                e.size * .7 + .25
            ) {

                hit = e;

                break;

            }

        }


        if (hit) {

            damageEnemy(
                hit,
                b.damage,
                b.owner
            );

            scene.remove(b.mesh);

            bullets.splice(i, 1);

        }

        else if (b.life <= 0) {

            scene.remove(b.mesh);

            bullets.splice(i, 1);

        }

    }

}


// ==========================================
// CAMERA
// ==========================================

function updateCamera() {

    const center = new THREE.Vector3();

    players.forEach(p =>
        center.add(p.group.position)
    );

    center.multiplyScalar(1 / players.length);


    camera.position.lerp(
        new THREE.Vector3(
            center.x,
            24,
            center.z + 27
        ),
        .045
    );

    camera.lookAt(
        center.x,
        0,
        center.z
    );

}


// ==========================================
// MAIN GAME LOOP
// ==========================================

function gameLoop() {

    requestAnimationFrame(gameLoop);

    if (!renderer) return;

    const dt = Math.min(
        clock.getDelta(),
        .05
    );


    if (running && !paused) {

        players.forEach(p =>
            movePlayer(p, dt)
        );


        // Revive teammate

        if (coop && keys.KeyE) {

            reviveTeammate(dt);

        }

        else if (coop) {

            reviveProgress = 0;

            $('center-message').textContent = '';

        }


        updateEnemies(dt);

        updatePickups(dt);

        updateBullets(dt);


        // Enemy spawning

        spawnClock += dt;

        const maxAlive = night === 5 ? 24 : 18;

        const spawnInterval = Math.max(
            .38,
            1.25 - (night - 1) * .14
        );


        if (
            kills < targets[night - 1] &&
            enemies.length < maxAlive &&
            spawnClock > spawnInterval
        ) {

            spawnEnemy();

            spawnClock = 0;

            spawned++;

        }


        updateCamera();

        updateHUD();

    }


    renderer.render(scene, camera);

}


// ==========================================
// NOTIFICATION SYSTEM
// ==========================================

function toast(msg) {

    $('toast').textContent = msg;

    $('toast').classList.add('show');

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

        $('toast').classList.remove('show');

    }, 1900);

}


// ==========================================
// PLAYER ACTIONS
// ==========================================

function handleAction(p, action) {

    if (!running || paused || !p) return;


    if (action === 'shoot') {

        playerShoot(p);

    }


    if (action === 'aim') {

        aiming = !aiming;

        if (itemData[p.weapon]?.type === 'melee') {

            playerMelee(p);

        } else {

            $('crosshair').style.transform =
                aiming
                    ? 'translate(-50%,-50%) scale(1.6)'
                    : 'translate(-50%,-50%)';

        }

    }


    if (action === 'reload') {

        reload(p);

    }


    if (action === 'heal') {

        useHeal(p);

    }

}


// ==========================================
// KEYBOARD CONTROLS
// ==========================================

window.addEventListener('keydown', e => {

    keys[e.code] = true;


    if (
        [
            'ArrowUp',
            'ArrowDown',
            'ArrowLeft',
            'ArrowRight',
            'Space'
        ].includes(e.code)
    ) {

        e.preventDefault();

    }


    if (e.repeat) return;


    // Player 1 jump

    if (
        e.code === 'Space' &&
        players[0] &&
        !players[0].downed &&
        players[0].group.position.y === 0
    ) {

        players[0].jumpVelocity = 7;

    }


    // Player 2 jump

    if (
        e.code === 'Numpad0' &&
        players[1] &&
        !players[1].downed &&
        players[1].group.position.y === 0
    ) {

        players[1].jumpVelocity = 7;

    }


    // Player 1 inventory selection

    if (
        e.code >= 'Digit1' &&
        e.code <= 'Digit5' &&
        players[0]
    ) {

        const item =
            players[0].inventory[
                Number(e.code.slice(5)) - 1
            ];

        if (
            item &&
            itemData[item] &&
            (
                itemData[item].type === 'gun' ||
                itemData[item].type === 'melee'
            )
        ) {

            players[0].weapon = item;

        }

    }


    // Player 1 attacks

    if (e.code === 'KeyU') {

        handleAction(players[0], 'shoot');

    }

    if (e.code === 'KeyI') {

        handleAction(players[0], 'aim');

    }


    // Player 2 attacks

    if (e.code === 'NumpadDelete') {

        handleAction(players[1], 'shoot');

    }

    if (e.code === 'NumpadEnter') {

        handleAction(players[1], 'aim');

    }


    // Reload

    if (e.code === 'KeyR') {

        players.forEach(p => reload(p));

    }


    // Crouch

    if (e.code === 'KeyC') {

        players.forEach(p => {

            p.crouch = !p.crouch;

        });

    }


    // Healing

    if (e.code === 'KeyH') {

        players.forEach(p => useHeal(p));

    }


    // Pause

    if (e.code === 'Escape' && running) {

        paused = !paused;

        showScreen(
            paused ? 'pause-screen' : null
        );

    }

});


// ==========================================
// KEY RELEASE
// ==========================================

window.addEventListener('keyup', e => {

    keys[e.code] = false;

});


// ==========================================
// MOUSE CONTROLS
// ==========================================

window.addEventListener('mousedown', e => {

    if (!running || coop) return;


    if (e.button === 0) {

        handleAction(players[0], 'shoot');

    }


    if (e.button === 2) {

        handleAction(players[0], 'aim');

    }

});


window.addEventListener('contextmenu', e => {

    e.preventDefault();

});


// ==========================================
// MENU BUTTONS
// ==========================================

$('single-btn').onclick = () => {

    startGame(false);

};


$('coop-btn').onclick = () => {

    startGame(true);

};


$('instructions-btn').onclick = () => {

    showScreen('instructions-screen');

};


$('settings-btn').onclick = () => {

    showScreen('settings-screen');

};


document.querySelectorAll('.back-menu').forEach(b => {

    b.onclick = () => {

        showScreen('menu-screen');

    };

});


// ==========================================
// PAUSE BUTTONS
// ==========================================

$('pause-btn').onclick = () => {

    running = false;

    paused = true;

    showScreen('pause-screen');

};


$('resume-btn').onclick = () => {

    paused = false;

    running = true;

    showScreen(null);

};


$('pause-menu-btn').onclick = () => {

    running = false;

    paused = false;

    $('game-screen').classList.remove('visible');

    showScreen('menu-screen');

};


// ==========================================
// EXIT TO MAIN MENU
// ==========================================

document.querySelectorAll('.to-menu').forEach(b => {

    b.onclick = () => {

        running = false;

        $('game-screen').classList.remove('visible');

        showScreen('menu-screen');

    };

});


// ==========================================
// RETRY BUTTON
// ==========================================

$('retry-btn').onclick = retryNight;


// ==========================================
// CONTINUE BUTTON
// ==========================================

$('continue-btn').onclick = () => {

    if ($('continue-btn').dataset.final === 'yes') {

        startGame(coop);

    }

    else {

        setNight(night + 1);


        players.forEach(p => {

            p.health = 100;

            p.stamina = 100;

            p.downed = false;

            p.group.rotation.z = 0;

            p.group.position.set(
                p.id === 1 ? -2 : 2,
                0,
                8
            );

        });


        spawnInitialLoot();

        $('game-screen').classList.add('visible');

        showScreen(null);

        running = true;

        updateHUD();

    }

};


// ==========================================
// SAVE SETTINGS
// ==========================================

$('sfx-volume').oninput = e => {

    localStorage.setItem(
        'gsm-sfx',
        e.target.value
    );

};


$('music-volume').oninput = e => {

    localStorage.setItem(
        'gsm-music',
        e.target.value
    );

};


// ==========================================
// START EVERYTHING
// ==========================================

init3D();

gameLoop();
