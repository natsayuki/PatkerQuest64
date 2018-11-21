const game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-test', {
  preload: preload,
  create: create,
  update: update,
  render: render
});

function preload(){
  game.load.tilemap('map', 'maps/csv/tester.csv', null, Phaser.Tilemap.CSV);
  game.load.image('tiles', 'maps/tiles/catastrophi_tiles_16.png');
  game.load.image('player', 'sprites/player.png');
  game.load.image('furryPatker', 'sprites/furryPatker.png');
  game.load.image('ogrePatker', 'sprites/ogrePatker.png');
  game.load.image('fancyPatker', 'sprites/fancyPatker.png');
  game.load.image('crazyPatkerRestored', 'sprites/crazyPatkerRestored.png');
  game.load.image('babyPatker', 'sprites/babyPatker.png');
  game.load.image('ball', 'sprites/ball.png');

  game.load.image('menuBackground', 'sprites/menu/background.png');
  game.load.image('menuCursor', 'sprites/menu/cursor.png');

  game.load.spritesheet('crazyPatker', 'sprites/sheets/sheet_crazyPatker.png', 32, 64, 2);
}

let map;
let layer;
let cursors;
let player;
let keys = {};
let dialogueText;

let quests = {
  'Destroy Da Sp00ky Ball': 0
}

class Character{
  constructor(name, sprite, pos){
    this.dialogue = 0;
    this.sprite = game.add.sprite(pos[0], pos[1], sprite);
    game.physics.p2.enable(this.sprite);
    this.sprite.body.static = true;
    player.body.createBodyCallback(this.sprite, function(){
      player.collisions = [];
      player.collisions.push(this);
     }, this);
  }

}

class Menu{
  constructor(items){
      this.sel = 0;
      this.items = items;

      this.background = game.add.sprite(0, 0, 'menuBackground');
      this.background.fixedToCamera = true;
      this.background.cameraOffset.setTo(0, 0);

      this.cursor = game.add.sprite(0, 0, 'menuCursor');

      this.text0 = game.add.text(0, 0, "", {fill: "#ffffff"});
      this.text0.alignIn(this.background, Phaser.LEFT_CENTER, -50);

      this.text1 = game.add.text(0, 0, "", {fill: '#ffffffff'});
      this.text1.alignIn(this.background, Phaser.TOP_CENTER, -50);

      this.text2 = game.add.text(0, 0, "", {fill: '#ffffffff'});
      this.text2.alignIn(this.background, Phaser.RIGHT_CENTER, -100);

      this.text3 = game.add.text(0, 0, "", {fill: '#ffffffff'});
      this.text3.alignIn(this.background, Phaser.BOTTOM_CENTER, -50);

      this.cursor.alignTo(this.text0, Phaser.LEFT_CENTER);

      this.elements = [this.background, this.cursor, this.text0, this.text1, this.text2, this.text3];

      this.elements.forEach(element => {
        element.alpha = 0;
        element.fixedToCamera = true;
      });
      this.cursor.fixedToCamera = false;

      let index = 0;
      Object.keys(this.items).forEach(item => {
        if(index == 0) this.text0.setText(item);
        else if(index == 1) this.text1.setText(item);
        else if(index == 2) this.text2.setText(item);
        else if(index == 3) this.text3.setText(item);
        index++;
      });
  }
  show(){
    this.elements.forEach(element => {
      element.alpha = 1;
    });
    player.menuOpen = true;
  }
  hide(){
    this.elements.forEach(element => {
      element.alpha = 0;
    });
    player.menuOpen = false;
  }
  move(dir){
    if(dir == 'left' && this.text0.text != ''){
      this.sel = 0;
      this.cursor.alignTo(this.text0, Phaser.LEFT_CENTER);
    }
    if(dir == 'up' && this.text1.text != ''){
      this.sel = 1;
      this.cursor.alignTo(this.text1, Phaser.LEFT_CENTER);
    }
    if(dir == 'right' && this.text2.text != ''){
      this.sel = 2;
      this.cursor.alignTo(this.text2, Phaser.LEFT_CENTER);
    }
    if(dir == 'down' && this.text3.text != ''){
      this.sel = 3;
      this.cursor.alignTo(this.text3, Phaser.LEFT_CENTER);
    }
  }
  select(){
    this.items[Object.keys(this.items)[this.sel]]();
  }
}

class List{
  constructor(list){
    this.list = list;
    this.length = Object.keys(this.list).length;
    this.page = 0;
    this.pages = {}
    let curr = 0;
    let page = 0
    Object.keys(this.list).forEach(quest => {
      if(curr == 5){
        curr = 0;
        page++;
      }
      if(curr == 0) this.pages[curr] = [];
      this.pages[curr].push(this.list[curr])
    });
  }
  showPage(num){

  }
  show(){

  }
}

function say(text, callback, start){
  start = start || '';
  if(text.length > start.length + 1) player.typing = true;
  if(!player.typing) callback()
  if(player.endTyping){
    dialogueText.setText(text);
    player.endTyping = false;
    say(text, callback, text)
  }
  else{
    if(text.length > start.length) dialogueText.setText(start + text[start.length]);
    setTimeout(() => {
      if(text.length > start.length){
        say(text, callback, start + text[start.length]);
      }
      else if(player.typing) say(text, callback, start);
      else{
        callback();
        dialogueText.setText('');
      }
    }, 75);
  }
}

function dialogueString(array, callback){
  if(array.length == 0) callback();
  else{
    say(array[0], () => {
      dialogueString(array.splice(1), callback);
    });
  }
}

function startQuest(quest){
  player.cutscene = true;
  say("Started " + quest, () => {
    player.cutscene = false;
    player.collisions = [];
  });
  dialogueText.addColor('#ffff00', 8);
  player.quests[quest] = 1;
}

function openMenu(){
  player.cutscene = true;
  menuBackground.alpha = 1;
  menuCursor.alpha = 1;
  itemsText.alpha = 1;
  questsText.alpha = 1;
}

function closeMenu(){
  player.cutscene = false;
  menuBackground.alpha = 0;
  menuCursor.alpha = 0;
  itemsText.alpha = 0;
  questsText.alpha = 0;
}

function create(){
  game.physics.startSystem(Phaser.Physics.P2JS);
  map = game.add.tilemap('map', 16, 16);
  map.addTilesetImage('tiles');
  layer = map.createLayer(0);
  layer.resizeWorld();
  map.setCollisionBetween(54, 83);
  game.physics.p2.convertTilemap(map, layer);

  player = game.add.sprite(48, 48, 'player');
  game.physics.p2.enable(player);
  player.collisions = [];
  player.cutscene = false;
  player.quests = {
    'Destroy Da Sp00ky Ball': 0
  }
  player.questGuides = {
    'Destroy Da Sp00ky Ball': [
      'Start the quest by speaking to Baby Patker after freeing Crazy Patker from the sp00ky ball curse',
      'Find Wizard Patker and talk to him about the best way to destroy the sp00ky ball.',
      'Go to the grave of Gladiator Patker and read the instructions to destroy the sp00ky ball.',
      'Get a Patker Flower',
      'Get a Patker Shroom',
      'Get a Patker Root',
      'Take the ingrediants back to Wizard Patker',
      'Talk to Baker Patker to see if he has a spoon',
      'Take the spoon to Wizard Patker',
      'Take the sp00ky ball to Wizard Patker'
    ]
  }
  player.questGuide = (quest) => {
    return player.questGuides[quest][player.quests[quest]];
  }

  ball = game.add.sprite(500, 350, 'ball');
  game.physics.p2.enable(ball);
  ball.body.damping = .4;


  furryPatker = new Character('Furry Patker', 'furryPatker', [300, 300]);
  ogrePatker = new Character("Ogre Patker", 'ogrePatker', [600, 300]);
  fancyPatker = new Character('Fancy Patker', 'fancyPatker', [450, 100]);
  babyPatker = new Character('Baby Patker', 'babyPatker', [800, 50]);

  crazyPatker = new Character('Crazy Patker', 'crazyPatker', [900, 200]);
  let idle = crazyPatker.sprite.animations.add('idle');
  crazyPatker.sprite.animations.play('idle', 2, true);
  //
  // staticColliders = [furryPatker, ogrePatker, fancyPatker, crazyPatker, babyPatker];


  player.body.onBeginContact.add((body) => {
    player.collisions.push(body);
  }, this);

  player.body.onEndContact.add((body) => {
    player.collisions.splice(player.collisions.indexOf(body));
  }, this);

  crazyPatker.sprite.body.createBodyCallback(ball, function(){
    crazyPatker.dialogue = 1;
    crazyPatker.sprite.animations.stop('idle');
    crazyPatker.sprite.loadTexture('crazyPatkerRestored');
  }, this);

  function tester(){
    console.log('menu submitted');
  }

  function listQuests(){
    let quests = {};
    Object.keys(player.quests).forEach(quest => {
      quests[quest] = player.questGuide(quest);
    });
    const menuList = new List(quests);
  }

  mainMenu = new Menu({"Items": tester, "Quests": listQuests, "Stats": tester, "Nice": tester});

  dialogueText = game.add.text(10, 500, "", {fill: "#ffffff", align: "center"});
  dialogueText.fixedToCamera = true;
  dialogueText.cameraOffset.setTo(10, 500);


  game.physics.p2.setBoundsToWorld(true, true, true, true, false);
  game.camera.follow(player);
  game.physics.p2.setImpactEvents(true);

  cursors = game.input.keyboard.createCursorKeys();
  keys.X = game.input.keyboard.addKey(Phaser.Keyboard.X);
  keys.Z = game.input.keyboard.addKey(Phaser.Keyboard.Z);
  keys.C = game.input.keyboard.addKey(Phaser.Keyboard.C);
  keys.cd = 0;
}

function update(){
  player.body.setZeroVelocity();
  player.body.angle = 0;
  player.vel = 200;
  if(keys.cd > 0) keys.cd--;
  if(!player.cutscene && !player.menuOpen){
    if(keys.X.isDown) player.vel = 400;
    if(cursors.left.isDown) player.body.moveLeft(player.vel);
    if(cursors.right.isDown) player.body.moveRight(player.vel);
    if(cursors.up.isDown) player.body.moveUp(player.vel);
    if(cursors.down.isDown) player.body.moveDown(player.vel);
  }
  if(player.menuOpen){
    if(keys.C.isDown && keys.cd == 0){
      mainMenu.hide();
      keys.cd = 10;
    }
    if(cursors.left.isDown){
      mainMenu.move('left');
      keys.cd = 10;
    }
    if(cursors.up.isDown){
      mainMenu.move('up');
      keys.cd = 10;
    }
    if(cursors.right.isDown){
      mainMenu.move('right');
      keys.cd = 10;
    }
    if(cursors.down.isDown){
      mainMenu.move('down');
      keys.cd = 10;
    }
    if(keys.Z.isDown && keys.cd == 0){
      mainMenu.select();
      keys.cd = 10;
    }
  }
  if(!player.cutscene && keys.cd == 0){
    if(keys.C.isDown){
      if(!player.menuOpen) mainMenu.show();
      else mainMenu.hide();
    }
    if(keys.Z.isDown){
      if(player.collisions.indexOf(furryPatker) != -1){
        player.cutscene = true;
        dialogueString(["Rawr! It's me Furry Patker xD.", "*Snuggles against you* Hewwo senpai uwu."], () => {
          player.cutscene = false;
          player.collisions = [];
        });
      }
      else if(player.collisions.indexOf(ogrePatker) != -1){
        player.cutscene = true;
        dialogueString(['Hello! It is I, Ogre Patker!', 'Clubs are for ogres.'], () => {
          player.cutscene = false;
          player.collisions = [];
        });
      }
      else if(player.collisions.indexOf(fancyPatker) != -1){
        player.cutscene = true;
        if(fancyPatker.dialogue == 0){
          dialogueString(["It is I, Fancy Patker!", "Talk to me again, I have different dialogue!"], () => {
            player.cutscene = false;
            player.collisions = [];
            fancyPatker.dialogue = 1;
          });
        }
        else if(fancyPatker.dialogue == 1){
          say("Huzzah!", () => {
            player.cutscene = false;
            player.collisions = [];
          });
        }
      }
      else if(player.collisions.indexOf(crazyPatker) != -1){
        player.cutscene = true;
        if(crazyPatker.dialogue == 0){
          dialogueString(['Hit...', 'With...', 'Ball...'], () => {
            player.cutscene = false;
            player.collisiions = [];
          });
        }
        else if(crazyPatker.dialogue == 1){
          dialogueString(['Oh! Thank Patker!', 'You have rescued me from the sp00ky ball curse!', 'How can I ever repay you!'], () => {
            player.cutscene = false;
            player.collisiions = [];
          });
        }
      }
      else if(player.collisions.indexOf(babyPatker) != -1){
        player.cutscene = true;
        if(crazyPatker.dialogue == 0){
          dialogueString(["WAAAAAAAH!", "It is me, Baby Patker!", "You've got to help Crazy Patker over there!", "He's gone mega crazy!"], () => {
            player.cutscene = false;
            player.collisions = [];
          });
        }
        else if(crazyPatker.dialogue > 0){
          dialogueString(["Oh! Thank you for saving Crazy Patker!", "I can't believe he was under the sp00ky ball curse!", "That sp00ky ball needs to be very destroyed.", "It cannot be allowed to sp00k other people!"], () => {
            player.cutscene = false;
            player.collisions = [];
            startQuest("Destroy Da Sp00ky Ball");
          });
        }
      }
    }
    keys.cd = 10;
  }
  else if(keys.cd == 0){
    if(keys.X.isDown) player.endTyping = true;
    if(keys.Z.isDown) player.typing = false;
    if(keys.C.isDown) mainMenu.hide();
    keys.cd = 10;
  }
}

function render(){
  // game.debug.spriteInfo(player, 32, 32);
}
