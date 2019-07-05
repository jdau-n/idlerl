var Entity = {
	// global coords
	x: 0,
	y: 0,

	tile: '?',
	color: '#f00',
	name: 'missingNo',
	movementType: 1,
	speed: 1,

	move: null,

	tick: function(globalCycle) {
		this.move = null;
		if (globalCycle % (20-this.speed) == 0) {
			//console.log(this.name,"speed tick",globalCycle);

			if (this.movementType == 1) {
				var dir = Util.rint(1,4);
				if (dir == 1) {
					this.move=[0,-1];
				} else if (dir == 2) {
					this.move=[0,1];
				} else if (dir == 3) {
					this.move=[1,0];
				} else if (dir == 4) {
					this.move=[-1,0];
				}
			}
		}
	}
}

var EntityMaker = {
	entityData: null,

	load: function() {
		this.entityData = {};
		for (var i = EntityDefs.length - 1; i >= 0; i--) {
			this.entityData[EntityDefs[i].name]=EntityDefs[i];
		}
	},

	create: function(name,x,y) {
		var eData = this.entityData[name];

		var entity = Object.assign({}, Entity);
		entity.name = eData.name;
		entity.x = x;
		entity.y = y;
		entity.color = eData.color;
		entity.movementType = eData.movementType;
		entity.tile = eData.tile;
		entity.speed = eData.speed;

		return entity;
	}
}

// static data
var EntityDefs = [
	{
		name: 'Mushroom',
		color: Palette.cyan,
		movementType: 2,
		tile: '*',
		speed: 2
	},
	{
		name: 'Goblin',
		color: Palette.green,
		movementType: 1,
		tile: 'g',
		speed: 10
	}
];