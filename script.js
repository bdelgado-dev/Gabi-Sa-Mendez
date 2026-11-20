import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const $ = id => document.getElementById(id);
const requiredIds = ['menu-screen','instructions-screen','settings-screen','game-screen','pause-screen','victory-screen','died-screen','single-btn','coop-btn','instructions-btn','settings-btn','pause-btn','resume-btn','pause-menu-btn','retry-btn','continue-btn','toast'];
for (const id of requiredIds) if (!$(id)) throw new Error(`Missing HTML element: #${id}`);

const screenIds = ['menu-screen','instructions-screen','settings-screen','pause-screen','victory-screen','died-screen'];
const showScreen = id => { screenIds.forEach(s => $(s).classList.toggle('active', s === id)); };
const targets = [50,75,100,150,300];

const enemyData = {
  tiyanak:{name:'Tiyanak',hp:10,damage:1,speed:3.2,color:0x9d3434,score:10,size:.65},
  tiktik:{name:'Tik-Tik',hp:20,damage:5,speed:2.7,color:0x6b426e,score:20,size:.85},
  kapre:{name:'Kapre',hp:100,damage:25,speed:1.15,color:0x4a3529,score:100,size:1.55},
  sigbin:{name:'Sigbin',hp:50,damage:15,speed:3.8,color:0x6d7650,score:50,size:.9},
  manananggal:{name:'Manananggal',hp:70,damage:30,speed:2.3,color:0x8a273e,score:70,size:1.15},
  bampira:{name:'Bampira',hp:110,damage:50,speed:2,color:0x292c38,score:120,size:1.2}
};

const nightPools = [
  ['tiyanak','tiktik'],
  ['tiyanak','tiktik','kapre'],
  ['tiyanak','tiktik','kapre','sigbin'],
  ['tiyanak','tiktik','kapre','sigbin','manananggal'],
  ['tiyanak','tiktik','kapre','sigbin','manananggal','bampira']
];

const items = {
  balisong:{name:'Balisong',type:'melee',damage:10,icon:'🔪'},
  palakol:{name:'Palakol',type:'melee',damage:25,icon:'🪓'},
  itak:{name:'Itak',type:'melee',damage:15,icon:'🗡️'},
  kawali:{name:'Kawali',type:'melee',damage:12,icon:'🍳'},
  revolver:{name:'Revolver',type:'gun',damage:25,mag:6,icon:'🔫'},
  ak47:{name:'AK-47',type:'gun',damage:50,mag:50,icon:'🎯'},
  ammo:{name:'Ammo',type:'ammo',icon:'📦'},
  bandage:{name:'Bandage',type:'heal',heal:20,icon:'🩹'},
  medkit:{name:'Medkit',type:'heal',heal:60,icon:'🧰'},
  drink:{name:'Sports Drink',type:'stamina',icon:'🥤'},
  armor:{name:'Body Armor',type:'armor',icon:'🛡️'}
};

let scene,camera,renderer,clock;
let players=[],enemies=[],pickups=[],bullets=[];
let running=false,paused=false,coop=false,night=1,kills=0,score=0,spawnClock=0,reviveTokens=0,reviveProgress=0,levelComplete=false;
let keys={},aiming=false,toastTimeout=null;
let highScore=Number(safeGet('gsm-highscore',0));

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

function safeGet(k,fallback){
  try{return localStorage.getItem(k) ?? fallback;}
  catch{return fallback;}
}

function safeSet(k,v){
  try{localStorage.setItem(k,String(v));}
  catch{}
}

function init3D(){
  scene=new THREE.Scene();
  scene.background=new THREE.Color(0x101a1c);
  scene.fog=new THREE.Fog(0x101a1c,28,78);

  camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,150);
  camera.position.set(0,25,29);

  renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setSize(innerWidth,innerHeight);
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;

  $('game-root').prepend(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0x9ab4c2,0x1b211c,1.6));

  const moon=new THREE.DirectionalLight(0xb8c9d8,2);
  moon.position.set(-15,28,12);
  moon.castShadow=true;
  scene.add(moon);

  const ground=new THREE.Mesh(
    new THREE.PlaneGeometry(90,90),
    new THREE.MeshStandardMaterial({color:0x303b32,roughness:1})
  );
  ground.rotation.x=-Math.PI/2;
  ground.receiveShadow=true;
  scene.add(ground);

  const road=new THREE.Mesh(
    new THREE.PlaneGeometry(9,90),
    new THREE.MeshStandardMaterial({color:0x343737})
  );
  road.rotation.x=-Math.PI/2;
  road.position.y=.02;
  scene.add(road);

  for(let z=-40;z<=40;z+=4){
    const dash=new THREE.Mesh(
      new THREE.BoxGeometry(.12,.025,1.5),
      new THREE.MeshBasicMaterial({color:0xb9aa76})
    );
    dash.position.set(0,.04,z);
    scene.add(dash);
  }

  for(let i=0;i<18;i++){
    const side=i%2===0?-1:1;
    const z=-38+Math.floor(i/2)*9+Math.random()*2;
    const w=4+Math.random()*2;
    const h=2.5+Math.random()*1.2;
    const g=new THREE.Group();

    const body=new THREE.Mesh(
      new THREE.BoxGeometry(w,h,4),
      new THREE.MeshStandardMaterial({
        color:[0x756451,0x8a7862,0x59635a,0x786f60][i%4]
      })
    );

    body.position.y=h/2;
    body.castShadow=true;
    g.add(body);

    const roof=new THREE.Mesh(
      new THREE.ConeGeometry(w*.78,1.6,4),
      new THREE.MeshStandardMaterial({color:0x493a32})
    );

    roof.position.y=h+.75;
    roof.rotation.y=Math.PI/4;
    g.add(roof);
    g.position.set(side*(9+Math.random()*4),0,z);
    scene.add(g);
  }

  for(let i=0;i<34;i++){
    const x=(Math.random()-.5)*70;
    const z=(Math.random()-.5)*80;

    if(Math.abs(x)<7)continue;

    const g=new THREE.Group();

    const trunk=new THREE.Mesh(
      new THREE.CylinderGeometry(.18,.28,2,6),
      new THREE.MeshStandardMaterial({color:0x493528})
    );

    const leaves=new THREE.Mesh(
      new THREE.ConeGeometry(1.5,4,7),
      new THREE.MeshStandardMaterial({color:0x233d30})
    );

    trunk.position.y=1;
    leaves.position.y=3.3;
    g.add(trunk,leaves);
    g.position.set(x,0,z);
    scene.add(g);
  }

  for(let z=-30;z<=30;z+=15){
    const pole=new THREE.Mesh(
      new THREE.CylinderGeometry(.08,.12,6,8),
      new THREE.MeshStandardMaterial({color:0x292e2d})
    );

    pole.position.set(5,3,z);
    scene.add(pole);

    const light=new THREE.PointLight(0xffc879,1.1,13);
    light.position.set(5,5.7,z);
    scene.add(light);
  }

  clock=new THREE.Clock();
  addEventListener('resize',onResize);

  $('loading-note').style.display='none';
}

function onResize(){
  if(!camera||!renderer)return;
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
}

function makePlayer(id,x,z){
  const g=new THREE.Group();

  const coat=new THREE.Mesh(
    new THREE.CapsuleGeometry(.42,.8,4,8),
    new THREE.MeshStandardMaterial({color:id===1?0x31566b:0x73503c})
  );

  const head=new THREE.Mesh(
    new THREE.SphereGeometry(.3,12,10),
    new THREE.MeshStandardMaterial({color:0xb98262})
  );

  const pack=new THREE.Mesh(
    new THREE.BoxGeometry(.48,.55,.25),
    new THREE.MeshStandardMaterial({color:0x252b27})
  );

  coat.position.y=1.05;
  head.position.y=1.85;
  pack.position.set(0,1.1,-.42);

  g.add(coat,head,pack);
  g.position.set(x,0,z);
  scene.add(g);

  return {
    id,
    group:g,
    health:100,
    stamina:100,
    downed:false,
    weapon:'balisong',
    inventory:['balisong','revolver','bandage','bandage','medkit'],
    backpack:['bandage','bandage','bandage'],
    jumpVelocity:0,
    ammo:{revolver:6,ak47:50},
    armor:0,
    crouch:false,
    fireCooldown:0,
    meleeCooldown:0,
    score:0
  };
}

function clearDynamic(){
  for(const a of [...enemies,...pickups,...bullets]){
    scene.remove(a.group||a.mesh);
  }

  enemies=[];
  pickups=[];
  bullets=[];
}

function startGame(twoPlayer){
  coop=twoPlayer;
  night=1;
  kills=0;
  score=0;
  reviveTokens=0;
  reviveProgress=0;
  levelComplete=false;

  clearDynamic();
  players.forEach(p=>scene.remove(p.group));

  players=[makePlayer(1,-2,8)];

  if(coop)players.push(makePlayer(2,2,8));

  $('game-screen').classList.remove('hidden');
  $('game-screen').classList.add('visible');

  paused=false;
  running=true;

  showScreen(null);
  setNight(1);
  spawnInitialLoot();
  updateHUD();

  toast('Find supplies. The first night is beginning.');
}

function setNight(n){
  night=n;
  kills=0;
  reviveTokens=n===1?0:1;
  reviveProgress=0;

  enemies.forEach(e=>scene.remove(e.group));
  enemies=[];

  $('night-label').textContent=`${night} / 5`;
  $('target-label').textContent=targets[night-1];
  $('kills-label').textContent='0';
  $('revive-label').textContent=reviveTokens;

  toast(`NIGHT ${night}: Eliminate ${targets[night-1]} creatures.`);
}

function randomItem(){
  const list=['bandage','bandage','medkit','ammo','drink','armor','palakol','itak','kawali','revolver','ak47'];
  return list[Math.floor(Math.random()*list.length)];
}

function spawnPickup(type,x,z){
  const d=items[type];

  const mesh=new THREE.Mesh(
    new THREE.BoxGeometry(.55,.55,.55),
    new THREE.MeshStandardMaterial({
      color:type==='medkit'?0xd9d5c9:type==='ammo'?0xc5a34b:type==='armor'?0x668b9b:0x9b6a46,
      emissive:0x17100a
    })
  );

  mesh.position.set(x,.5,z);
  mesh.castShadow=true;
  scene.add(mesh);

  pickups.push({type,mesh,phase:Math.random()*6,baseY:.5});
}

function spawnInitialLoot(){
  for(let i=0;i<18;i++){
    spawnPickup(randomItem(),(Math.random()-.5)*48,(Math.random()-.5)*65);
  }
}

function spawnEnemy(){
  const pool=nightPools[night-1];
  const type=pool[Math.floor(Math.random()*pool.length)];
  const data=enemyData[type];

  const group=new THREE.Group();

  const body=new THREE.Mesh(
    new THREE.SphereGeometry(data.size*.55,12,10),
    new THREE.MeshStandardMaterial({
      color:data.color,
      roughness:.9
    })
  );

  body.position.y=data.size*.65;
  body.castShadow=true;
  group.add(body);

  const head=new THREE.Mesh(
    new THREE.SphereGeometry(data.size*.25,10,8),
    new THREE.MeshStandardMaterial({color:0x9b776a})
  );

  head.position.y=data.size*1.25;
  group.add(head);

  const eyeMaterial=new THREE.MeshBasicMaterial({color:0xff2525});

  for(const x of [-.12,.12]){
    const eye=new THREE.Mesh(new THREE.SphereGeometry(.045,6,6),eyeMaterial);
    eye.position.set(x*data.size,data.size*1.28,data.size*.22);
    group.add(eye);
  }

  const angle=Math.random()*Math.PI*2;
  const distance=18+Math.random()*13;

  group.position.set(
    Math.cos(angle)*distance,
    0,
    Math.sin(angle)*distance
  );

  scene.add(group);

  enemies.push({
    type,
    group,
    hp:data.hp,
    maxHp:data.hp,
    damage:data.damage,
    speed:data.speed,
    size:data.size,
    attack:1+Math.random()
  });
}

function damageEnemy(enemy,damage,owner){
  enemy.hp-=damage;

  if(enemy.hp<=0){
    const index=enemies.indexOf(enemy);

    if(index>=0){
      scene.remove(enemy.group);
      enemies.splice(index,1);

      kills++;
      score+=enemyData[enemy.type].score;

      if(score>highScore){
        highScore=score;
        safeSet('gsm-highscore',highScore);
      }

      $('kills-label').textContent=kills;

      if(kills>=targets[night-1]&&!levelComplete){
        completeNight();
      }
    }
  }
}

function playerShoot(p){
  if(!p||p.downed)return;

  const weapon=items[p.weapon];

  if(weapon.type==='melee'){
    playerMelee(p);
    return;
  }

  if(p.ammo[p.weapon]<=0){
    toast('No ammunition. Press R to reload.');
    return;
  }

  if(p.fireCooldown>0)return;

  p.fireCooldown=p.weapon==='ak47'?.12:.45;
  p.ammo[p.weapon]--;

  const direction=new THREE.Vector3(
    Math.sin(p.group.rotation.y),
    0,
    Math.cos(p.group.rotation.y)
  ).normalize();

  const mesh=new THREE.Mesh(
    new THREE.SphereGeometry(.12,8,8),
    new THREE.MeshBasicMaterial({color:0xffd27a})
  );

  mesh.position.copy(p.group.position);
  mesh.position.y=1.2;
  mesh.position.addScaledVector(direction,1);

  scene.add(mesh);

  bullets.push({
    mesh,
    dir:direction,
    damage:weapon.damage,
    owner:p.id,
    life:1.5
  });

  updateHUD();
}

function playerMelee(p){
  if(!p||p.downed||p.meleeCooldown>0)return;

  p.meleeCooldown=.55;

  const weapon=items[p.weapon];

  let target=null;
  let closest=2.8;

  for(const enemy of enemies){
    const distance=p.group.position.distanceTo(enemy.group.position);

    if(distance<closest){
      closest=distance;
      target=enemy;
    }
  }

  if(target){
    damageEnemy(target,weapon.damage,p.id);
    toast(`Hit ${enemyData[target.type].name}!`);
  }
}

function reload(p){
  if(!p)return;

  const weapon=items[p.weapon];

  if(weapon.type!=='gun')return;

  p.ammo[p.weapon]=weapon.mag;
  toast(`${weapon.name} reloaded.`);
  updateHUD();
}

function hurtPlayer(p,damage){
  if(!p||p.downed)return;

  const reduced=Math.max(1,damage-p.armor);
  p.health=Math.max(0,p.health-reduced);

  if(p.health<=0){
    if(coop){
      p.downed=true;
      toast(`Player ${p.id} is down!`);
    }else if(reviveTokens>0){
      reviveTokens--;
      p.health=50;
      toast('You were revived!');
    }else{
      gameOver();
    }
  }

  if(coop&&players.every(pl=>pl.downed)){
    gameOver();
  }

  updateHUD();
}

function reviveTeammate(dt){
  if(!coop)return;

  const downed=players.find(p=>p.downed);
  const helper=players.find(p=>!p.downed);

  if(!downed||!helper||reviveTokens<=0){
    reviveProgress=0;
    return;
  }

  if(helper.group.position.distanceTo(downed.group.position)>2.5){
    reviveProgress=0;
    $('center-message').textContent='Move closer to revive!';
    return;
  }

  reviveProgress+=dt;
  $('center-message').textContent=`REVIVING... ${Math.min(100,Math.floor(reviveProgress/5*100))}%`;

  if(reviveProgress>=5){
    downed.downed=false;
    downed.health=50;
    reviveTokens--;
    reviveProgress=0;

    $('center-message').textContent='';
    toast(`Player ${downed.id} has been revived!`);
    updateHUD();
  }
}

function completeNight(){
  levelComplete=true;
  running=false;

  const final=night===5;

  $('victory-title').textContent=final?'MENDEZ SURVIVED':'NIGHT CLEARED';

  $('victory-description').textContent=final
    ?`You survived all five nights. Final score: ${score}.`
    :`You eliminated ${kills} creatures. Prepare for Night ${night+1}.`;

  $('continue-btn').textContent=final?'PLAY AGAIN':'CONTINUE';
  $('continue-btn').dataset.final=final?'yes':'no';

  $('game-screen').classList.remove('visible');
  showScreen('victory-screen');
}

function gameOver(){
  running=false;

  $('died-description').textContent=
    `You reached Night ${night}. Score: ${score}. Best score: ${highScore}.`;

  $('game-screen').classList.remove('visible');
  showScreen('died-screen');
}

function retryNight(){
  clearDynamic();

  players.forEach(p=>{
    p.health=100;
    p.stamina=100;
    p.downed=false;
    p.group.rotation.set(0,0,0);
    p.group.position.set(p.id===1?-2:2,0,8);
    p.ammo={revolver:6,ak47:50};
  });

  setNight(night);

  $('game-screen').classList.add('visible');
  showScreen(null);

  running=true;
  paused=false;

  spawnInitialLoot();
  updateHUD();
}

function renderInventory(){
  const p=players[0];
  if(!p)return;

  const draw=(arr,count,empty)=>Array.from({length:count},(_,i)=>{
    const d=items[arr[i]];

    return `<div class="slot">
      <b>${d?.icon||empty}</b>
      <small>${d?.name||'EMPTY'}</small>
    </div>`;
  }).join('');

  $('quick-slots').innerHTML=draw(p.inventory,5,'＋');
  $('backpack-slots').innerHTML=draw(p.backpack,10,'·');
  $('backpack-count').textContent=`${p.backpack.length}/10`;
}

function updateHUD(){
  for(const p of players){
    const n=`p${p.id}`;

    $(n+'-health').style.width=`${p.health}%`;
    $(n+'-health-text').textContent=Math.ceil(p.health);

    $(n+'-stamina').style.width=`${p.stamina}%`;
    $(n+'-stamina-text').textContent=Math.ceil(p.stamina);

    $(n+'-status').textContent=p.downed?'DOWNED':'ALIVE';
    $(n+'-status').classList.toggle('down',p.downed);

    $(n+'-weapon').textContent=items[p.weapon].name;

    $(n+'-ammo').textContent=items[p.weapon].type==='gun'
      ?`${p.ammo[p.weapon]}/${items[p.weapon].mag}`
      :'MELEE';
  }

  if(!coop){
    $('p2-card').style.opacity='.35';
    $('p2-status').textContent='NOT PLAYING';
    $('p2-health-text').textContent='—';
    $('p2-stamina-text').textContent='—';
    $('p2-weapon').textContent='—';
    $('p2-ammo').textContent='—';
  }else{
    $('p2-card').style.opacity='1';
  }

  renderInventory();

  $('enemy-count').textContent=enemies.length;
  $('score-label').textContent=score;
  $('revive-label').textContent=reviveTokens;
}

function collectPickup(p,index){
  const item=pickups[index];
  if(!item)return;

  const type=item.type;
  const d=items[type];

  if(type==='ammo'){
    p.ammo.revolver+=6;
    p.ammo.ak47+=25;
  }else if(d.type==='heal'){
    if(p.backpack.length>=10){
      toast('Backpack is full!');
      return;
    }

    p.backpack.push(type);
  }else if(type==='armor'){
    p.armor=10;
  }else if(type==='drink'){
    p.stamina=100;
  }else{
    if(p.inventory.length<5){
      p.inventory.push(type);
    }else if(p.backpack.length<10){
      p.backpack.push(type);
    }else{
      toast('Inventory is full!');
      return;
    }
  }

  scene.remove(item.mesh);
  pickups.splice(index,1);

  toast(`${d.name} collected.`);
  updateHUD();
}

function useHeal(p){
  if(!p||p.downed)return;

  let index=p.inventory.findIndex(x=>items[x]?.type==='heal');
  let source=p.inventory;

  if(index<0){
    source=p.backpack;
    index=source.findIndex(x=>items[x]?.type==='heal');
  }

  if(index<0){
    toast('No healing item available.');
    return;
  }

  const type=source.splice(index,1)[0];

  p.health=Math.min(100,p.health+items[type].heal);

  toast(`${items[type].name} used.`);
  updateHUD();
}

function movePlayer(p,dt){
  if(p.downed)return;

  let x=0,z=0;

  if(p.id===1){
    if(keys.KeyA)x--;
    if(keys.KeyD)x++;
    if(keys.KeyW)z--;
    if(keys.KeyS)z++;
  }else{
    if(keys.ArrowLeft)x--;
    if(keys.ArrowRight)x++;
    if(keys.ArrowUp)z--;
    if(keys.ArrowDown)z++;
  }

  const moving=!!(x||z);

  if(moving){
    const v=new THREE.Vector3(x,0,z).normalize();

    p.group.position.addScaledVector(v,dt*(p.crouch?3:5));
    p.group.rotation.y=Math.atan2(v.x,v.z)+Math.PI;
  }

  if(p.jumpVelocity!==0||p.group.position.y>0){
    p.group.position.y+=p.jumpVelocity*dt;
    p.jumpVelocity-=18*dt;

    if(p.group.position.y<=0){
      p.group.position.y=0;
      p.jumpVelocity=0;
    }
  }

  p.group.position.x=clamp(p.group.position.x,-32,32);
  p.group.position.z=clamp(p.group.position.z,-39,39);

  p.stamina=Math.min(100,p.stamina+dt*(moving?2:8));

  p.fireCooldown=Math.max(0,p.fireCooldown-dt);
  p.meleeCooldown=Math.max(0,p.meleeCooldown-dt);
}

function updateEnemies(dt){
  for(const e of [...enemies]){
    const target=players
      .filter(p=>!p.downed)
      .sort((a,b)=>
        e.group.position.distanceTo(a.group.position)-
        e.group.position.distanceTo(b.group.position)
      )[0];

    if(!target)continue;

    const dir=target.group.position.clone().sub(e.group.position);
    const dist=dir.length();

    if(dist>1.25){
      dir.normalize();
      e.group.position.addScaledVector(dir,e.speed*dt);
      e.group.rotation.y=Math.atan2(dir.x,dir.z);
    }else{
      e.attack-=dt;

      if(e.attack<=0){
        hurtPlayer(target,e.damage);
        e.attack=1.15;
      }
    }
  }
}

function updatePickups(dt){
  for(const item of pickups){
    item.phase+=dt*2;
    item.mesh.position.y=item.baseY+Math.sin(item.phase)*.12;
    item.mesh.rotation.y+=dt*.8;
  }

  for(let i=pickups.length-1;i>=0;i--){
    const item=pickups[i];

    const p=players.find(pl=>
      !pl.downed&&pl.group.position.distanceTo(item.mesh.position)<1.25
    );

    if(p)collectPickup(p,i);
  }
}

function updateBullets(dt){
  for(let i=bullets.length-1;i>=0;i--){
    const b=bullets[i];

    b.mesh.position.addScaledVector(b.dir,dt*28);
    b.life-=dt;

    const hit=enemies.find(e=>
      e.group.position.distanceTo(b.mesh.position)<e.size*.7+.25
    );

    if(hit){
      damageEnemy(hit,b.damage,b.owner);
      scene.remove(b.mesh);
      bullets.splice(i,1);
    }else if(b.life<=0){
      scene.remove(b.mesh);
      bullets.splice(i,1);
    }
  }
}

function updateCamera(){
  if(!players.length)return;

  const center=new THREE.Vector3();

  players.forEach(p=>center.add(p.group.position));
  center.multiplyScalar(1/players.length);

  camera.position.lerp(
    new THREE.Vector3(center.x,24,center.z+27),
    .045
  );

  camera.lookAt(center.x,0,center.z);
}

function toast(message){
  $('toast').textContent=message;
  $('toast').classList.add('show');

  clearTimeout(toastTimeout);

  toastTimeout=setTimeout(
    ()=>$('toast').classList.remove('show'),
    1900
  );
}

function action(p,kind){
  if(!running||paused||!p)return;

  if(kind==='shoot')playerShoot(p);

  if(kind==='aim'){
    aiming=!aiming;

    if(items[p.weapon].type==='melee'){
      playerMelee(p);
    }

    $('crosshair').style.transform=aiming
      ?'translate(-50%,-50%) scale(1.6)'
      :'translate(-50%,-50%)';
  }

  if(kind==='reload')reload(p);
  if(kind==='heal')useHeal(p);
}

function selectWeapon(p,index){
  const key=p?.inventory[index];

  if(key&&['gun','melee'].includes(items[key]?.type)){
    p.weapon=key;
    updateHUD();
  }
}

function gameLoop(){
  requestAnimationFrame(gameLoop);

  if(!renderer)return;

  const dt=Math.min(clock.getDelta(),.05);

  if(running&&!paused){
    players.forEach(p=>movePlayer(p,dt));

    if(coop&&keys.KeyE){
      reviveTeammate(dt);
    }else if(coop){
      reviveProgress=0;
      $('center-message').textContent='';
    }

    updateEnemies(dt);
    updatePickups(dt);
    updateBullets(dt);

    spawnClock+=dt;

    const maxAlive=night===5?24:18;
    const interval=Math.max(.38,1.25-(night-1)*.14);

    if(kills<targets[night-1]&&enemies.length<maxAlive&&spawnClock>interval){
      spawnEnemy();
      spawnClock=0;
    }

    updateCamera();
    updateHUD();
  }

  renderer.render(scene,camera);
}

$('single-btn').addEventListener('click',()=>startGame(false));
$('coop-btn').addEventListener('click',()=>startGame(true));

$('instructions-btn').addEventListener('click',()=>showScreen('instructions-screen'));
$('settings-btn').addEventListener('click',()=>showScreen('settings-screen'));

document.querySelectorAll('.back-menu').forEach(b=>
  b.addEventListener('click',()=>showScreen('menu-screen'))
);

$('pause-btn').addEventListener('click',()=>{
  if(!running)return;

  running=false;
  paused=true;
  showScreen('pause-screen');
});

$('resume-btn').addEventListener('click',()=>{
  paused=false;
  running=true;
  showScreen(null);
});

function returnToMenu(){
  running=false;
  paused=false;

  $('game-screen').classList.remove('visible');
  showScreen('menu-screen');
}

$('pause-menu-btn').addEventListener('click',returnToMenu);

document.querySelectorAll('.to-menu').forEach(b=>
  b.addEventListener('click',returnToMenu)
);

$('retry-btn').addEventListener('click',retryNight);

$('continue-btn').addEventListener('click',()=>{
  if($('continue-btn').dataset.final==='yes'){
    startGame(coop);
    return;
  }

  clearDynamic();
  setNight(night+1);

  players.forEach(p=>{
    p.health=100;
    p.stamina=100;
    p.downed=false;
    p.group.rotation.set(0,0,0);
    p.group.position.set(p.id===1?-2:2,0,8);
  });

  spawnInitialLoot();

  $('game-screen').classList.add('visible');
  showScreen(null);

  running=true;
  updateHUD();
});

$('sfx-volume').value=safeGet('gsm-sfx',60);
$('music-volume').value=safeGet('gsm-music',35);

$('sfx-volume').addEventListener('input',e=>
  safeSet('gsm-sfx',e.target.value)
);

$('music-volume').addEventListener('input',e=>
  safeSet('gsm-music',e.target.value)
);

addEventListener('keydown',e=>{
  keys[e.code]=true;

  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)){
    e.preventDefault();
  }

  if(e.repeat)return;

  if(e.code==='Escape'&&running){
    running=false;
    paused=true;
    showScreen('pause-screen');
    return;
  }

  if(!running||paused)return;

  if(e.code==='Space'&&players[0]&&!players[0].downed&&players[0].group.position.y===0){
    players[0].jumpVelocity=7;
  }

  if(e.code==='Numpad0'&&players[1]&&!players[1].downed&&players[1].group.position.y===0){
    players[1].jumpVelocity=7;
  }

  if(e.code.startsWith('Digit')&&e.code.length===6){
    selectWeapon(players[0],Number(e.code.slice(-1))-1);
  }

  if(e.code==='KeyU')action(players[0],'shoot');
  if(e.code==='KeyI')action(players[0],'aim');

  if(e.code==='NumpadDelete')action(players[1],'shoot');
  if(e.code==='NumpadEnter')action(players[1],'aim');

  if(e.code==='KeyR')players.forEach(reload);
  if(e.code==='KeyC')players.forEach(p=>p.crouch=!p.crouch);
  if(e.code==='KeyH')players.forEach(useHeal);
});

addEventListener('keyup',e=>{
  keys[e.code]=false;
});

addEventListener('mousedown',e=>{
  if(!running||paused||coop)return;

  if(e.button===0)action(players[0],'shoot');
  if(e.button===2)action(players[0],'aim');
});

addEventListener('contextmenu',e=>e.preventDefault());

try{
  init3D();
  gameLoop();
}catch(error){
  console.error('Gabi sa Mendez failed to initialize:',error);

  $('loading-note').style.display='flex';

  $('loading-note').innerHTML=
    '<h2>GAME COULD NOT START</h2><p>Check your internet connection and browser console. Run this project using VS Code Live Server.</p>';
}