var Entity = {
	// global coords
	x: 0,
	y: 0,

	tile: '?',
	color: '#f00',
	name: 'missingNo',
	movementType: 1,
	speed: 1
}

var EntityMaker = {
	entityData: null,

	load: function() {
		this.entityData = {};
		for (var i = EntityDefs.length - 1; i >= 0; i--) {
			this.entityData[EntityDefs[i].name]=EntityDefs[i];
		}
	},

	create: function(name) {
		var eData = this.entityData[name];

		var entity = Object.assign({}, Entity);
		entity.name = eData.name;
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