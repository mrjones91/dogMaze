if (Meteor.isClient) {

var blockWidth = 32, blockHeight = 32;

var mazeX, mazeY, gameX, gameY;
mazeX = 10;
mazeY = 10;
gameX = ((mazeY - 1) * 4 + 7) * blockWidth - (2 * blockWidth);
gameY = ((mazeX - 1) * 2 + 3 ) * blockHeight + blockHeight;

var cursors;
var player;
var wallGroup;

function preload() {
  game.load.image('wall', '/brick3.png');
  game.load.image('butt', '/dog_butt.png');
  game.load.image('head', '/dog_head.png');
    /*game.load.atlas('breakout', '/assets/games/breakout/breakout.png', 'assets/games/breakout/breakout.json');
    game.load.image('starfield', '/assets/misc/starfield.jpg');*/

}


function maze(x,y) {
  var n=x*y-1;
  if (n<0) {alert("illegal maze dimensions");return;}
  var horiz =[]; for (var j= 0; j<x+1; j++) horiz[j]= [],
      verti =[]; for (var j= 0; j<x+1; j++) verti[j]= [],
      here = [Math.floor(Math.random()*x), Math.floor(Math.random()*y)],
      path = [here],
      unvisited = [];
  for (var j = 0; j<x+2; j++) {
    unvisited[j] = [];
    for (var k= 0; k<y+1; k++)
      unvisited[j].push(j>0 && j<x+1 && k>0 && (j != here[0]+1 || k != here[1]+1));
  }
  while (0<n) {
    var potential = [[here[0]+1, here[1]], [here[0],here[1]+1],
        [here[0]-1, here[1]], [here[0],here[1]-1]];
    var neighbors = [];
    for (var j = 0; j < 4; j++)
      if (unvisited[potential[j][0]+1][potential[j][1]+1])
        neighbors.push(potential[j]);
    if (neighbors.length) {
      n = n-1;
      next= neighbors[Math.floor(Math.random()*neighbors.length)];
      unvisited[next[0]+1][next[1]+1]= false;
      if (next[0] == here[0])
        horiz[next[0]][(next[1]+here[1]-1)/2]= true;
      else 
        verti[(next[0]+here[0]-1)/2][next[1]]= true;
      path.push(here = next);
    } else 
      here = path.pop();
  }
  return {x: x, y: y, horiz: horiz, verti: verti};
}
 
function display(m) {
  var text= [];
  for (var j= 0; j<m.x*2+1; j++) {
    var line= [];
    if (0 == j%2)
      for (var k=0; k<m.y*4+1; k++)
        if (0 == k%4) 
          line[k]= '+';
        else
          if (j>0 && m.verti[j/2-1][Math.floor(k/4)])
            line[k]= ' ';
          else
            line[k]= '-';
    else
      for (var k=0; k<m.y*4+1; k++)
        if (0 == k%4)
          if (k>0 && m.horiz[(j-1)/2][k/4-1])
            line[k]= ' ';
          else
            line[k]= '|';
        else
          line[k]= ' ';
    if (0 == j) line[1]= line[2]= line[3]= ' ';
    if (m.x*2-1 == j) line[4*m.y]= ' ';
    text.push(line.join('')+'\r\n');
  }
  return text.join('');
}

function collisionHandler() {
  return true;
}

function processHandler() {
  return true;
}

function create() {
  /*game.add examples */
  //
  //scoreText = game.add.text(32, 550, 'score: 0', { font: "20px Arial", fill: "#ffffff", align: "left" });
  //ball = game.add.sprite(game.world.centerX, paddle.y - 16, 'breakout', 'ball_1.png');
  //

  //1 - 7, ... 9 - 39, 10 - 43, 11 - 47
  //x.length = 7 + 4y
  //1 - 3, ... 8 - 17, 9 - 19, 10 - 21
  //y.length = 3 + 2x

  //width = 32, height = 16
  var mazeString = display(maze(mazeX, mazeY));

  game.physics.startSystem(Phaser.Physics.ARCADE);

  var butt = game.add.sprite(0, 0, 'butt');
  butt.scale.setTo(.05);

  player = game.add.sprite(32, 0, 'head');
  player.scale.setTo(.05);
  player.anchor.setTo(.5, .5);

  game.physics.arcade.enable(player);

  wallGroup = game.add.physicsGroup();

  cursors = game.input.keyboard.createCursorKeys();

  var wallX, wallY;

  var arr = [];
  var rowR = [];
  var row = 0;

  var rowLength = 7 + (4 * (mazeY - 1));
  var currentBlock = 0;
  var nextBlock = currentBlock + rowLength;

  console.log(mazeString.length);

  
  for (var scroll = 0; scroll < mazeString.length; scroll += rowLength) {
    
    console.log('scroll ' + scroll);
    console.log(currentBlock);
    console.log(nextBlock);

    rowR.push(mazeString.slice(currentBlock, nextBlock));
    currentBlock = nextBlock;
    nextBlock = currentBlock + rowLength;
  }
  console.log(rowR);

  var previousSlot, nextSlot;
  
  for (var i = 0; i < rowR.length; i++) {
    for(var j = 0; j < rowR[i].length; j++) {
      if (rowR[i][j] !== ' ') {
        sX = blockWidth * j;
        sY = blockHeight * i + blockHeight;
        //game.add.sprite(sX, sY, 'wall', '/brick3.png');
        var wall = wallGroup.create(sX, sY, 'wall', '/brick3.png');
        wall.body.immovable = true;
      }

      else if (rowR[i][j] == ' ') {
        previousSlot = rowR[i][j - 1];
        nextSlot = rowR[i][j + 1];
        console.log('previous slot: ' + previousSlot);
        console.log('current slot: ' + rowR[i][j]);
        console.log('next slot: ' + nextSlot);

        if (previousSlot == ' '  && nextSlot == ' ') {
          //Fill in previous
          rowR[i][j-1] = '+';
          sX = blockWidth * (j - 1);
          sY = blockHeight * i + blockHeight;
          //game.add.sprite(sX, sY, 'wall', '/brick3.png');
          // var wall = wallGroup.create(sX, sY, 'wall', '/brick3.png');
          // wall.body.immovable = true;
          //Fill in next
          rowR[i][j+1] = '+';
          // sX = blockWidth * (j + 1);
          // sY = blockHeight * i + blockHeight;
          // //game.add.sprite(sX, sY, 'wall', '/brick3.png');
          // var wall = wallGroup.create(sX, sY, 'wall', '/brick3.png');
          // wall.body.immovable = true;
        }
      }

    }
  }

}

function update () {
    if (game.physics.arcade.collide(player, wallGroup, collisionHandler, processHandler, this))
    {
        console.log('boom');
    }

    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    if (cursors.left.isDown)
    {
        player.body.velocity.x = -200;
        player.angle = 180;
        player.scale.y = -Math.abs(player.scale.y);

    }
    else if (cursors.right.isDown)
    {
        player.body.velocity.x = 200;
        player.angle = 0;
        player.scale.y = Math.abs(player.scale.y);
    }

    if (cursors.up.isDown)
    {
        player.body.velocity.y = -200;
        player.angle = 270;
        // player.scale.y = Math.abs(player.scale.y);

    }
    else if (cursors.down.isDown)
    {
        player.body.velocity.y = 200;
        player.angle = 90;
        // player.scale.y = Math.abs(player.scale.y);
    }


}

var game = new Phaser.Game(gameX, gameY, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update });


  Template.game.helpers({
    // game: function() {
    //   return game;
    // }
  });
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
