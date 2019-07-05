var Util = {
	rint: function(min,max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}
}

var Control = {
	up: false,
	down: false,
	left: false,
	right: false,

	clear: function() {
		this.up=false;
		this.down=false;
		this.left=false;
		this.right=false;
	}
}

var Player = {
	x: 0,
	y: 0,

	init: function(x,y) {
		this.x = x;
		this.y = y;

		console.log("Player coords: ",x,y);
	}
}

var Game = {
	mapWidth: 150,
	mapHeight: 80,

	screenWidth: 40,
	screenHeight: 30,

    mapDisplay: null,
    playerDisplay: null,

    mapData: [],

    player: null,
    pScreenRedraw: false,
    pScrDirtyQueue: [],

    mScreenRedraw: false,
    mScrDirtyQueue: [],

    chunkManager: null,
 
    init: function() {
        this.mapDisplay = new ROT.Display({width:this.mapWidth, height:this.mapHeight, fontSize:6});
        this.playerDisplay = new ROT.Display({width:this.screenWidth, height:this.screenHeight, fontSize:14});
        $("#map_screen").append(this.mapDisplay.getContainer());
        $("#game_screen").append(this.playerDisplay.getContainer());

        this.chunkManager = Object.assign({}, ChunkManager);

        $("#focus_input").keypress(function(event) {
        	if (event.key=="w") {
        		Control.up = true;
        	} else if (event.key=="a") {
        		Control.left = true;
        	} else if (event.key=="s") {
        		Control.down = true;
        	} else if (event.key=="d") {
        		Control.right = true;
        	}
        	$("#focus_input").val("");
        });

        this.chunkManager.start(5,12);

        this.initPlayer();

        //this.redrawMap();
        this.drawPlayerScreen();
    },

    initPlayer: function() {
    	
    	var playerPlaced = false;
    	while (!playerPlaced) {
    		var x = Util.rint(5,this.chunkManager.chunkHeight-5);
    		var y = Util.rint(5,this.chunkManager.chunkWidth-5);
    		if (this.chunkManager.mapGrid[1][1].mapData[x][y]==0) {
    			playerPlaced=true;
    			this.player = Player;
    			this.player.init(x+this.chunkManager.globalXoffset(),y+this.chunkManager.globalYoffset());
    		}
    	}
    },

    drawPlayerScreen: function() {
    	var screenTopX = (this.player.x) -  Math.floor(this.screenWidth/2);
    	var screenTopY = (this.player.y) - Math.floor(this.screenHeight/2);

		for (var x = 0; x < this.screenWidth; x++) {
    		for (var y = 0; y < this.screenHeight; y++) {
    			var mapX = x + screenTopX - this.chunkManager.globalXoffset();
    			var mapY = y + screenTopY - this.chunkManager.globalYoffset();

    			var tile = -1;

    			var chunkX = 1;
    			var chunkY = 1;

    			if (mapY >= this.chunkManager.chunkHeight) { 
    				// i like em
					chunkY++;
					mapY -= this.chunkManager.chunkHeight;
    			} else if (mapY < 0) { 
    				chunkY--;
    				mapY = this.chunkManager.chunkHeight + (mapY);
    			}

    			if (mapX >= this.chunkManager.chunkWidth) { 
					chunkX++;
					mapX -= this.chunkManager.chunkWidth;
    			} else if (mapX < 0) { 
    				chunkX--;
    				mapX = this.chunkManager.chunkWidth + (mapX);
    			}

   				tile = this.chunkManager.mapGrid[chunkX][chunkY].mapData[mapX][mapY];

   				if (tile == 0) {
					this.playerDisplay.draw(x,y,".", "#63c64d", "#000");
				} else if (tile == 1) {
					this.playerDisplay.draw(x,y,"#", "#ffffff", "#afbfd2");
				} else if (tile == 2) {
					this.playerDisplay.draw(x,y,"^", "#327345", "#63c64d");
				} else if (tile == 3) {
					this.playerDisplay.draw(x,y,":", "#ffffff", "#743f39");
				}
    		}
    	}

    	var playerRelX = (this.player.x) - screenTopX;
    	var playerRelY = (this.player.y) - screenTopY;
    	this.playerDisplay.draw(playerRelX, playerRelY, "@", "#fff", "#000");
    },

    drawPlayerTile: function(x,y) {

    },

    globalToChunk: function(x,y) {
    	var globalChunkX = Math.floor(x / this.chunkManager.chunkWidth);
    	var globalChunkY = Math.floor(y / this.chunkManager.chunkHeight);

		var chunkX = globalChunkX - this.chunkManager.currentCentreX + 1;
    	var chunkY = globalChunkY - this.chunkManager.currentCentreY + 1;    	

    	var localX = x - (this.chunkManager.chunkWidth * Math.floor(x / this.chunkManager.chunkWidth));
    	var localY = y - (this.chunkManager.chunkHeight * Math.floor(y / this.chunkManager.chunkHeight));

    	return [chunkX,chunkY,localX,localY,globalChunkX,globalChunkY];
    },

    redrawMap: function() {
    	for (var x = 0; x < this.mapWidth; x++) {
    		for (var y = 0; y < this.mapHeight; y++) {
    			this.redrawMapTile(x,y);
    		}
    	}

    	this.redrawMapPlayer();
    },

    redrawMapTile: function(x,y) {
    	if (this.mapData[x][y] == 0) {
			this.mapDisplay.draw(x,y,".", "#63c64d", "#000");
		} else if (this.mapData[x][y] == 1) {
			this.mapDisplay.draw(x,y,"#", "#ffffff", "#afbfd2");
		} else if (this.mapData[x][y] == 2) {
			this.mapDisplay.draw(x,y,"^", "#327345", "#63c64d");
		} else if (this.mapData[x][y] == 3) {
			this.mapDisplay.draw(x,y,":", "#ffffff", "#743f39");
		}
    },

    redrawMapPlayer: function() {
    	this.mapDisplay.draw(this.player.x, this.player.y, "@", "#fff", "#f00");
    },

    getWorldspaceTile: function(x,y) {
    	var locData = this.globalToChunk(x,y);

    	var chunkX = locData[0];
    	var chunkY = locData[1];
    	var localX = locData[2];
    	var localY = locData[3];
    	if (!this.chunkManager.isLoaded(locData[4],locData[5])) { return -1; }

    	return this.chunkManager.mapGrid[chunkX][chunkY].mapData[localX][localY];
    },

    playerMove: function(x,y) {
    	var pre_move = this.globalToChunk(this.player.x,this.player.y);
    	if (this.getWorldspaceTile(this.player.x + x,this.player.y + y)==0) {
    		//this.mScrDirtyQueue.push([this.player.x,this.player.y]);

    		this.player.x += x;
    		this.player.y += y;
    		this.pScreenRedraw = true;

    		var post_move = this.globalToChunk(this.player.x,this.player.y);

    		if (pre_move[0] != post_move[1] || pre_move[0] != post_move[1]) { // if the player chunk has changed..
    			if (pre_move[0] > post_move[0]) {
    				// west
    			} else if (pre_move[0] < post_move[0]) {
    				// east
    			}

				if (pre_move[1] > post_move[1]) {
    				// north
    				this.chunkManager.shiftGrid(1);
    				console.log('grid shift north');
    			} else if (pre_move[1] < post_move[1]) {
    				// south
    			}    			
    		}
    	}
    },

    tick: function() {
    	var t0 = performance.now();

    	if (Control.up) {
    		this.playerMove(0,-1);
    	} else if (Control.left) {
    		this.playerMove(-1,0);
    	} else if (Control.down) {
    		this.playerMove(0,1);
    	} else if (Control.right) {
    		this.playerMove(1,0);
    	}
    	Control.clear();

    	if (this.pScreenRedraw) {
    		this.drawPlayerScreen();
    		this.pScreenRedraw=false;
    	}

    	if (this.mScrDirtyQueue.length) {
    		for (var i = this.mScrDirtyQueue.length - 1; i >= 0; i--) {
    			this.redrawMapTile(this.mScrDirtyQueue[i][0],this.mScrDirtyQueue[i][1]);
    		}
    		this.redrawMapPlayer();
    		this.mScrDirtyQueue=[];
    	}

    	var t1 = performance.now();
		//console.log("tick: " + (t1 - t0) + " ms");
    }
}

Game.init();

setInterval(function() {
	Game.tick();
}, 100);