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
 
    init: function() {
        this.mapDisplay = new ROT.Display({width:this.mapWidth, height:this.mapHeight, fontSize:6});
        this.playerDisplay = new ROT.Display({width:this.screenWidth, height:this.screenHeight, fontSize:14});
        $("#map_screen").append(this.mapDisplay.getContainer());
        $("#game_screen").append(this.playerDisplay.getContainer());

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

        this.generateMap();

        this.initPlayer();

        this.redrawMap();
        this.drawPlayerScreen();
    },

    initPlayer: function() {
    	
    	var playerPlaced = false;
    	while (!playerPlaced) {
    		var x = Util.rint(5,this.mapWidth-5);
    		var y = Util.rint(5,this.mapHeight-5);
    		if (this.mapData[x][y]==0) {
    			playerPlaced=true;
    			this.player = Player;
    			this.player.init(x,y);
    		}
    	}
    },

    initMap: function() {
		for (var x = 0; x < this.mapWidth; x++) {
    		for (var y = 0; y < this.mapHeight; y++) {
    			if (this.mapData[x] == undefined) { this.mapData[x] = []; }
    			this.mapData[x][y]=0;
    		}
    	}
    },

    generateMap: function() {
    	this.initMap();
    	// pass 1: stone walls
    	var map = new ROT.Map.Cellular(this.mapWidth, this.mapHeight, { connected: true });

    	map.randomize(0.45);
    	for (var i=0; i<5; i++) map.create();

    	map.create(function(x,y,wall) {
    		if (wall) { Game.mapData[x][y]=1; }
    	});

    	// pass 2: trees
    	var map = new ROT.Map.Cellular(this.mapWidth, this.mapHeight, { connected: true });

    	map.randomize(0.4);
    	for (var i=0; i<5; i++) map.create();

    	map.create(function(x,y,wall) {
    		if (Game.mapData[x][y]==0 && wall) {
    			Game.mapData[x][y]=2;
    		}
    	});

    	// pass 3: ore
    	var map = new ROT.Map.Cellular(this.mapWidth, this.mapHeight, { connected: true });

    	map.randomize(0.22);
    	map.create();

    	map.create(function(x,y,wall) {
    		if (wall) { Game.mapData[x][y]=3; }
    	});

    },

    drawPlayerScreen: function() {
    	var screenTopX = Math.min(this.mapWidth - this.screenWidth,Math.max(0,this.player.x - Math.floor(this.screenWidth/2)));
    	var screenTopY = Math.min(this.mapHeight - this.screenHeight,Math.max(0,this.player.y - Math.floor(this.screenHeight/2)));

		for (var x = 0; x < this.screenWidth; x++) {
    		for (var y = 0; y < this.screenHeight; y++) {
    			var mapX = x + screenTopX;
    			var mapY = y + screenTopY;

    			if (this.mapData[mapX][mapY] == 0) {
    				this.playerDisplay.draw(x,y,".", "#63c64d", "#000");
    			} else if (this.mapData[mapX][mapY] == 1) {
    				this.playerDisplay.draw(x,y,"#", "#ffffff", "#afbfd2");
    			} else if (this.mapData[mapX][mapY] == 2) {
    				this.playerDisplay.draw(x,y,"^", "#327345", "#63c64d");
    			} else if (this.mapData[mapX][mapY] == 3) {
    				this.playerDisplay.draw(x,y,":", "#ffffff", "#743f39");
    			}
    		}
    	}

    	var playerRelX = this.player.x - screenTopX;
    	var playerRelY = this.player.y - screenTopY;
    	this.playerDisplay.draw(playerRelX, playerRelY, "@", "#fff", "#000");
    },

    drawPlayerTile: function(x,y) {

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

    playerMove: function(x,y) {
    	if (this.mapData[this.player.x + x][this.player.y + y]==0) {
    		this.mScrDirtyQueue.push([this.player.x,this.player.y]);

    		this.player.x += x;
    		this.player.y += y;
    	}
    	this.pScreenRedraw = true;
    },

    tick: function() {
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

    }
}

Game.init();

setInterval(function() {
	Game.tick();
}, 100);