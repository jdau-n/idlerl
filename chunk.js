var Chunk = {
	mapData: [],
	xLocation: 0,
	yLocation: 0,
	entities: []
}

var ChunkManager = {

	mapGrid: [],

	chunkWidth: 50,
	chunkHeight: 50,

	currentCentreX: 0,
	currentCentreY: 0,

	entityMaker: null,

	start: function(startX,startY) {
		localStorage.clear();

		for (var x = 0; x < 3; x++) {
    		for (var y = 0; y < 3; y++) {
    			if (this.mapGrid[x] == undefined) { this.mapGrid[x] = []; }
    			this.mapGrid[x][y]=this.loadChunk(startX-1+x,startY-1+y);
    		}
    	}
    	this.currentCentreX = startX;
    	this.currentCentreY = startY;

    	this.entityMaker = EntityMaker;
    	this.entityMaker.load();
	},

	shiftGrid: function(direction) { // never eat soggy weetbix
		var newMapGrid=[[],[],[]];

		if (direction == 1) {
			this.currentCentreY -= 1;
			newMapGrid[0][0] = this.loadChunk(this.currentCentreX - 1, this.currentCentreY - 1);
			newMapGrid[1][0] = this.loadChunk(this.currentCentreX, this.currentCentreY - 1);
			newMapGrid[2][0] = this.loadChunk(this.currentCentreX + 1, this.currentCentreY - 1);

			newMapGrid[0][1] = this.mapGrid[0][0];
			newMapGrid[1][1] = this.mapGrid[1][0];
			newMapGrid[2][1] = this.mapGrid[2][0];

			newMapGrid[0][2] = this.mapGrid[0][1];
			newMapGrid[1][2] = this.mapGrid[1][1];
			newMapGrid[2][2] = this.mapGrid[2][1];

			// Unload southmost chunks
			this.unloadChunk(0,2);
			this.unloadChunk(1,2);
			this.unloadChunk(2,2);

		} else if (direction == 2) {
			this.currentCentreX += 1;
			newMapGrid[0][0] = this.mapGrid[1][0];
			newMapGrid[0][1] = this.mapGrid[1][1];
			newMapGrid[0][2] = this.mapGrid[1][2];

			newMapGrid[1][0] = this.mapGrid[2][0];
			newMapGrid[1][1] = this.mapGrid[2][1];
			newMapGrid[1][2] = this.mapGrid[2][2];

			newMapGrid[2][0] = this.loadChunk(this.currentCentreX + 1, this.currentCentreY - 1);
			newMapGrid[2][1] = this.loadChunk(this.currentCentreX + 1, this.currentCentreY);
			newMapGrid[2][2] = this.loadChunk(this.currentCentreX + 1, this.currentCentreY + 1);

			this.unloadChunk(0,0);
			this.unloadChunk(0,1);
			this.unloadChunk(0,2);
			
		} else if (direction == 3) {
			this.currentCentreY += 1;
			newMapGrid[0][0] = this.mapGrid[0][1];
			newMapGrid[1][0] = this.mapGrid[1][1];
			newMapGrid[2][0] = this.mapGrid[2][1];

			newMapGrid[0][1] = this.mapGrid[0][2];
			newMapGrid[1][1] = this.mapGrid[1][2];
			newMapGrid[2][1] = this.mapGrid[2][2];

			newMapGrid[0][2] = this.loadChunk(this.currentCentreX - 1, this.currentCentreY + 1);
			newMapGrid[1][2] = this.loadChunk(this.currentCentreX, this.currentCentreY + 1);
			newMapGrid[2][2] = this.loadChunk(this.currentCentreX + 1, this.currentCentreY + 1);

			this.unloadChunk(0,0);
			this.unloadChunk(1,0);
			this.unloadChunk(2,0);

		} else if (direction == 4) {
			this.currentCentreX -= 1;
			newMapGrid[0][0] = this.loadChunk(this.currentCentreX - 1, this.currentCentreY - 1);
			newMapGrid[0][1] = this.loadChunk(this.currentCentreX - 1, this.currentCentreY);
			newMapGrid[0][2] = this.loadChunk(this.currentCentreX - 1, this.currentCentreY + 1);

			newMapGrid[1][0] = this.mapGrid[0][0];
			newMapGrid[1][1] = this.mapGrid[0][1];
			newMapGrid[1][2] = this.mapGrid[0][2];

			newMapGrid[2][0] = this.mapGrid[1][0];
			newMapGrid[2][1] = this.mapGrid[1][1];
			newMapGrid[2][2] = this.mapGrid[1][2];

			this.unloadChunk(2,0);
			this.unloadChunk(2,1);
			this.unloadChunk(2,2);
		}

		this.mapGrid = newMapGrid;
	},

	isLoaded: function(x,y) {
		if (x < this.currentCentreX - 1 || x > this.currentCentreX + 1 || y < this.currentCentreY - 1 || y > this.currentCentreY + 1) { return false; }
		return true;
	},

	globalXoffset: function() {
		return (this.chunkWidth * this.currentCentreX);
	},

	globalYoffset: function() {
		return (this.chunkHeight * this.currentCentreY);
	},

	loadChunk: function(x,y) {
		var level_data = localStorage.getItem(x.toString() + "-" + y.toString());
		//var level_data = null;
		if (null == level_data) {
			level_data = this.generateChunk(x,y);
			console.log("new chunk gen");
		} else {
			level_data = JSON.parse(level_data);
			console.log("chunk loaded from ls", level_data);
		}

		return level_data;
	},

	unloadChunk: function(x,y) {
		var globX = this.mapGrid[x][y].locationX;
		var globY = this.mapGrid[x][y].locationY;
		console.log(globX.toString() + "-" + globY.toString(), this.mapGrid[x][y]);
		localStorage.setItem(globX.toString() + "-" + globY.toString(), JSON.stringify(this.mapGrid[x][y]));
	},

	generateBlankMap(w,h) {
		var map = [];

		for (var x = 0; x < w; x++) {
    		for (var y = 0; y < h; y++) {
    			if (map[x] == undefined) { map[x] = []; }
    			map[x][y]=0;
    		}
    	}

    	return map;
	},

	generateChunk: function(chunkX,chunkY) {

		var mapData = this.generateBlankMap(this.chunkWidth, this.chunkHeight);

    	// pass 1: stone walls
    	var map = new ROT.Map.Cellular(this.chunkWidth, this.chunkHeight, { connected: true });

    	map.randomize(0.4);
    	for (var i=0; i<5; i++) map.create();

    	map.create(function(x,y,wall) {
    		if (wall) { mapData[x][y]=1; }
    	});

        // pass 2: trees
    	var map = new ROT.Map.Cellular(this.chunkWidth, this.chunkHeight, { connected: true });

    	map.randomize(0.4);
    	for (var i=0; i<5; i++) map.create();

    	map.create(function(x,y,wall) {
    		if (mapData[x][y]==0 && wall) {
    			mapData[x][y]=2;
    		}
    	});

    	// pass 3: ore
    	var map = new ROT.Map.Cellular(this.chunkWidth, this.chunkHeight, { connected: true });

    	map.randomize(0.22);
    	map.create();

    	map.create(function(x,y,wall) {
    		if (wall) { mapData[x][y]=3; }
    	});

    	var retChunk = Object.assign({}, Chunk);
    	retChunk.mapData = mapData;
    	retChunk.locationX = chunkX;
    	retChunk.locationY = chunkY;
    	return retChunk;
	}

}