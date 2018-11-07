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
  game.load.image('ball', 'sprites/ball.png');

  game.load.spritesheet('crazyPatker', 'sprites/sheets/sheet_crazyPatker.png', 32, 64, 2);
}

let map;
let layer;
let cursors;
let player;
let keys = {};
let dialogueText;

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

  ball = game.add.sprite(500, 350, 'ball');
  game.physics.p2.enable(ball);

  furryPatker = game.add.sprite(300, 300, 'furryPatker');
  player.furryPatkerD = 0;

  ogrePatker = game.add.sprite(600, 300, 'ogrePatker');
  player.ogrePatkerD = 0;

  fancyPatker = game.add.sprite(450, 100, 'fancyPatker');
  player.fancyPatkerD = 0;

  crazyPatker = game.add.sprite(900, 200, 'crazyPatker');
  let idle = crazyPatker.animations.add('idle');
  crazyPatker.animations.play('idle', 2, true);
  player.crazyPatkerD = 0;

  staticColliders = [furryPatker, ogrePatker, fancyPatker, crazyPatker];
  staticColliders.forEach(i => {
    game.physics.p2.enable(i);
    i.body.static = true;
    player.body.createBodyCallback(i, function(){
      player.collisions = [];
      player.collisions.push(i)
     }, this);
  });

  crazyPatker.body.createBodyCallback(ball, function(){
    player.crazyPatkerD = 1;
    crazyPatker.animations.stop('idle');
    crazyPatker.loadTexture('crazyPatkerRestored');
  }, this);

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
  crazyPatker.body.width = 20;
  player.body.setZeroVelocity();
  player.body.angle = 0;
  player.vel = 200
  if(keys.cd > 0) keys.cd--;
  if(!player.cutscene){
    if(keys.X.isDown) player.vel = 400;
    if(cursors.left.isDown) player.body.moveLeft(player.vel);
    if(cursors.right.isDown) player.body.moveRight(player.vel);
    if(cursors.up.isDown) player.body.moveUp(player.vel);
    if(cursors.down.isDown) player.body.moveDown(player.vel);
  }
  if(!player.cutscene && keys.cd == 0){
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
        if(player.fancyPatkerD == 0){
          dialogueString(["It is I, Fancy Patker!", "Talk to me again, I have different dialogue!"], () => {
            player.cutscene = false;
            player.collisions = [];
            player.fancyPatkerD = 1;
          });
        }
        else if(player.fancyPatkerD == 1){
          say("Huzzah!", () => {
            player.cutscene = false;
            player.collisions = [];
          });
        }
      }
      else if(player.collisions.indexOf(crazyPatker) != -1){
        player.cutscene = true;
        if(player.crazyPatkerD == 0){
          dialogueString(['Hit...', 'With...', 'Ball...'], () => {
            player.cutscene = false;
            player.collisiions = [];
          });
        }
        else if(player.crazyPatkerD == 1){
          dialogueString(['Oh! Thank Patker!', 'You have rescued me from the sp00ky ball curse!', 'How can I ever repay you!'], () => {
            player.cutscene = false;
            player.collisiions = [];
          });
        }
      }
    }
    keys.cd = 10;
  }
  else if(keys.cd == 0){
    if(keys.X.isDown) player.endTyping = true;
    if(keys.Z.isDown) player.typing = false;
    keys.cd = 10;
  }
}

function render(){
  // game.debug.spriteInfo(player, 32, 32);
}
