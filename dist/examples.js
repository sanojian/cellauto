function example_caves() {

	var world = new CAWorld({
		width: 96,
		height: 64,
		cellSize: 6
	});

	world.registerCellType('wall', {
		getColor: function () {
			return this.open ? '255, 255, 255, 1' : '68, 36, 52, 1';
		},
		process: function (neighbors) {
			var surrounding = this.countSurroundingCellsWithValue(neighbors, 'wasOpen');
			this.open = (this.wasOpen && surrounding >= 4) || surrounding >= 6;
		},
		reset: function () {
			this.wasOpen = this.open;
		}
	}, function () {
		//init
		this.open = Math.random() > 0.40;
	});

	world.initialize([
		{ name: 'wall', distribution: 100 }
	]);

	return world;
};

function example_cavesWithWater() {

	// FIRST CREATE CAVES
	var world = new CAWorld({
		width: 96,
		height: 64,
		cellSize: 6
	});

	world.registerCellType('wall', {
		process: function (neighbors) {
			var surrounding = this.countSurroundingCellsWithValue(neighbors, 'wasOpen');
			this.open = (this.wasOpen && surrounding >= 4) || surrounding >= 6;
		},
		reset: function () {
			this.wasOpen = this.open;
		}
	}, function () {
		//init
		this.open = Math.random() > 0.40;
	});

	world.initialize([
		{ name: 'wall', distribution: 100 }
	]);

	// generate our cave, 10 steps aught to do it
	for (var i=0; i<10; i++) {
		world.step();
	}

	var grid = world.createGridFromValues([
		{ cellType: 'wall', hasProperty: 'open', value: 0 }
	], 1);

	// NOW USE OUR CAVES TO CREATE A NEW WORLD CONTAINING WATER
	world = new CAWorld({
		width: 96,
		height: 64,
		cellSize: 6,
		clearRect: true
	});

	world.registerCellType('water', {
		getColor: function() {
			return '89, 125, 206, ' + (this.water ? Math.max(0.3, this.water/9) : 0);
		},
		process: function(neighbors) {
			if (this.water === 0) {
				// already empty
				return;
			}
			// push my water out to my available neighbors

			// cell below me will take all it can
			if (neighbors[world.BOTTOM.index] !== null && this.water && neighbors[world.BOTTOM.index].water < 9) {
				var amt = Math.min(this.water, 9 - neighbors[world.BOTTOM.index].water);
				this.water-= amt;
				neighbors[world.BOTTOM.index].water += amt;
				return;
			}

			// bottom two corners take half of what I have
			for (var i=5; i<=7; i++) {
				if (i!=world.BOTTOM.index && neighbors[i] !== null && this.water && neighbors[i].water < 9) {
					var amt = Math.min(this.water, Math.ceil((9 - neighbors[i].water)/2));
					this.water-= amt;
					neighbors[i].water += amt;
					return;
				}
			}
			// sides take a third of what I have
			for (i=3; i<=4; i++) {
				if (neighbors[i] !== null && neighbors[i].water < this.water) {
					var amt = Math.min(this.water, Math.ceil((9 - neighbors[i].water)/3));
					this.water-= amt;
					neighbors[i].water += amt;
					return;
				}
			}
		}
	}, function() {
		//init
		this.water = Math.floor(Math.random() * 9);
	});

	world.registerCellType('rock', {
		isSolid: true,
		getColor: function() {
			return this.lighted ? '109, 170, 44, 1' : '68, 36, 52, 1';
		},
		process: function(neighbors) {
			this.lighted = neighbors[world.TOP.index] && !(neighbors[world.TOP.index].water === 9) && !neighbors[world.TOP.index].isSolid
				&& neighbors[world.BOTTOM.index] && neighbors[world.BOTTOM.index].isSolid;
		}
	});

	// pass in our generated cave data
	world.initializeFromGrid([
		{ name: 'rock', gridValue: 1 },
		{ name: 'water', gridValue: 0 }
	], grid);

	return world;
}
function example_cyclic() {
	var world = new CAWorld({
		width: 96,
		height: 64,
		cellSize: 6
	});

	world.registerCellType('cyclic', {
		colors: [
			'255,0,0,1', '255,96,0,1', '255,191,0,1', '223,255,0,1',
			'128,255,0,1', '32,255,0,1', '0,255,64,1', '0,255,159,1',
			'0,255,255,1', '0,159,255,1', '0,64,255,1', '32,0,255,1',
			'127,0,255,1', '223,0,255,1', '255,0,191,1', '255,0,96,1'
		],
		getColor: function () {
			return this.colors[this.state];
		},
		process: function (neighbors) {
			var next = (this.state + Math.floor(Math.random()*2)) % 16;

			var changing = false;
			for (var i = 0; i < neighbors.length; i++) {
				if (neighbors[i] !== null) {
					changing = changing || neighbors[i].state === next;
				}
			}
			if (changing) this.state = next;
			return true;
		}
	}, function () {
		//init
		this.state = Math.floor(Math.random() * 16);
	});

	world.initialize([
		{ name: 'cyclic', distribution: 100 }
	]);

	return world;
}
function example_explosion() {

	world = new CAWorld({
		width: 96,
		height: 64,
		cellSize: 6
	});

	world.registerCellType('water', {
		getColor: function () {
			var v = (Math.max(2 * this.value + 0.02, 0) - 0.02) + 0.5;
			var r = Math.floor(v * 300);
			var g = Math.floor(v * 100);
			var b = Math.floor(v * 100);

			return r + ', ' + g + ', ' + b + ', ' + (this.value * 10);
		},
		process: function (neighbors) {
			var avg = this.getSurroundingCellsAverageValue(neighbors, 'value');
			this.next = 0.99 * (2 * avg - this.prev);

			return true;
		},
		reset: function () {
			this.prev = this.value;
			this.value = this.next;

			return true;
		}
	}, function (x, y) {
		//init
		this.value = x === world.width/2 && y === world.height/2 ? 10 : 0.0;
		this.prev = this.value;
		this.next = this.value;
	});

	world.initialize([
		{ name: 'water', distribution: 100 }
	]);

	return world;
};
function example_forestFire() {

	var world = new CAWorld({
		width: 96,
		height: 64,
		cellSize: 6
	});


	var CHANCE_TO_IGNITE = 0.0001;
	var CHANCE_TO_GROW = 0.01;

	world.registerCellType('tree', {
		getColor: function () {
			return this.burning ? '208, 70, 72, ' + Math.max(0.3, this.burning/9) : (this.alive ? '52, 101, 36, 1' : '255, 255, 255, 1');
		},
		burning: 0,
		process: function (neighbors) {
			if (this.wasBurning) {
				this.burning-=3;
			}
			else if (this.alive) {
				var surrounding = this.countSurroundingCellsWithValue(neighbors, 'wasBurning');
				if (surrounding) {
					this.burning = 9;
					this.alive = false;
				}
				else if (Math.random() < CHANCE_TO_IGNITE ) {
					this.burning = 9;
					this.alive = false;
				}
			}
			else if (Math.random() < CHANCE_TO_GROW ) {
				this.alive = true;
			}
		},
		reset: function () {
			this.wasBurning = this.burning !== 0;
		}
	});

	world.initialize([
		{ name: 'tree', distribution: 100 }
	]);

	return world;
};

function example_gameOfLife() {

	var world = new CAWorld({
		width: 96,
		height: 64,
		cellSize: 6
	});

	world.registerCellType('living', {
		getColor: function () {
			return this.alive ? '68, 36, 52, 1' : '255, 255, 255, 1';
		},
		process: function (neighbors) {
			var surrounding = this.countSurroundingCellsWithValue(neighbors, 'wasAlive');
			this.alive = surrounding === 3 || surrounding === 2 && this.alive;
		},
		reset: function () {
			this.wasAlive = this.alive;
		}
	}, function () {
		//init
		this.alive = Math.random() > 0.5;
	});

	world.initialize([
		{ name: 'living', distribution: 100 }
	]);

	return world;
};

function example_islands() {
	// thanks to lithander on TIGSource

	// FIRST CREATE ISLANDS
	var world = new CAWorld({
		width: 96,
		height: 64,
		cellSize: 6
	});

	world.registerCellType('wall', {
		process: function (neighbors) {
			var surrounding = this.countSurroundingCellsWithValue(neighbors, 'wasOpen');
			this.open = (this.wasOpen && surrounding >= 4) || surrounding >= 5;
		},
		reset: function () {
			this.wasOpen = this.open;
		}
	}, function () {
		//init
		this.open = Math.random() > 0.535;
	});

	world.initialize([
		{ name: 'wall', distribution: 100 }
	]);

	// generate our cave, 10 steps aught to do it
	for (var i=0; i<10; i++) {
		world.step();
	}

	var grid = world.createGridFromValues([
		{ cellType: 'wall', hasProperty: 'open', value: 1 }
	], 0);

	//WATER + ISLANDS
	world = new CAWorld({
		width: 96,
		height: 64,
		cellSize: 6
	});

	world.registerCellType('water', {
		getColor: function () {
			return '89, 125, 206, 1';
		}
	});

	world.registerCellType('island', {
		isSolid: true,
		getColor: function()
		{
			if(this.beach)
			{
				var v = Math.min(1, Math.max(0, (50 * this.floodedness)+0.2));
				var r = (Math.floor(250 - 100 * v)).toString();
				var g = (Math.floor(250 - 60 * v)).toString();
				var b = (Math.floor(150 + v * 105)).toString();
				return r+', '+g+', '+b+', 1';
			}
			else
				var v = this.foliage;
			var r = (Math.floor(109 - 55 * v)).toString();
			var g = (Math.floor(180 + 55 * v)).toString();
			var b = (Math.floor(84 + 55 * v)).toString();
			return r+', '+g+', '+b+', 1';
			//return '109, 200, 84, 1';
		},
		process: function(neighbors) {
			this.beach = this.beach || this.countSurroundingCellsWithValue(neighbors, 'water') > 0;
			this.floodedness = this.getSurroundingCellsAverageValue(neighbors, 'value');
		}
	}, function () {
		//init
		this.beach = Math.random() > 0.6;
		this.foliage = -0.5 + Math.random();
	});

	world.initializeFromGrid([
		{ name: 'island', gridValue: 1 },
		{ name: 'water', gridValue: 0 }
	], grid);

	return world;
};
function example_lava() {
	// thanks to TheLastBanana on TIGSource

	world = new CAWorld({
		width: 144*2,
		height: 96*2,
		cellSize: 4/2,
		wrap: true
	});

	var palette = [
		'34,10,21,1', '68,17,26,1', '123,16,16,1',
		'190,45,16,1', '244,102,20,1', '254,212,97,1'
	];

	var colors = [];
	var index = 0;
	for (; index < 18; ++index) { colors[index] = palette[1]; }
	for (; index < 22; ++index) { colors[index] = palette[0]; }
	for (; index < 25; ++index) { colors[index] = palette[1]; }
	for (; index < 27; ++index) { colors[index] = palette[2]; }
	for (; index < 29; ++index) { colors[index] = palette[3]; }
	for (; index < 32; ++index) { colors[index] = palette[2]; }
	for (; index < 35; ++index) { colors[index] = palette[0]; }
	for (; index < 36; ++index) { colors[index] = palette[2]; }
	for (; index < 38; ++index) { colors[index] = palette[4]; }
	for (; index < 42; ++index) { colors[index] = palette[5]; }
	for (; index < 44; ++index) { colors[index] = palette[4]; }
	for (; index < 46; ++index) { colors[index] = palette[2]; }
	for (; index < 56; ++index) { colors[index] = palette[1]; }
	for (; index < 64; ++index) { colors[index] = palette[0]; }

	world.registerCellType('lava', {
		getColor: function () {
			var v = this.value + 0.5
				+ Math.sin(this.x / world.width * Math.PI) * 0.04
				+ Math.sin(this.y / world.height * Math.PI) * 0.04
				- 0.05;
			v = Math.min(1.0, Math.max(0.0, v));

			return colors[Math.floor(colors.length * v)];
		},
		process: function (neighbors) {
			if(this.droplet === true) {
				for (var i = 0; i < neighbors.length; i++) {
					if (neighbors[i] !== null && neighbors[i].value) {
						neighbors[i].value = 0.5 *this.value;
						neighbors[i].prev = 0.5 *this.prev;
					}
				}
				this.droplet = false;
				return true;
			}
			var avg = this.getSurroundingCellsAverageValue(neighbors, 'value');
			this.next = 0.998 * (2 * avg - this.prev);

			return true;
		},
		reset: function () {
			if(Math.random() > 0.99993) {
				this.value = -0.25 + 0.3*Math.random();
				this.prev = this.value;
				this.droplet = true;
			}
			else {
				this.prev = this.value;
				this.value = this.next;
			}
			this.value = Math.min(0.5, Math.max(-0.5, this.value));
			return true;
		}
	}, function () {
		//init
		this.value = 0.0;
		this.prev = this.value;
		this.next = this.value;
	});

	world.initialize([
		{ name: 'lava', distribution: 100 }
	]);

	return world;
};
function example_maze() {

	// thanks to SuperDisk on TIGSource forums!

	var world = new CAWorld({
		width: 96,
		height: 64,
		cellSize: 6
	});

	world.registerCellType('living', {
		getColor: function () {
			return this.alive ? '68, 36, 52, 1' : '255, 255, 255, 1';
		},
		process: function (neighbors) {
			var surrounding = this.countSurroundingCellsWithValue(neighbors, 'wasAlive');

			if (this.simulated < 20) {
				this.alive = surrounding === 1 || surrounding === 2 && this.alive;
			}
			if (this.simulated > 20 && surrounding == 2) {
				this.alive = true;
			}
			this.simulated += 1;
		},
		reset: function () {
			this.wasAlive = this.alive;
		}
	}, function () {
		//init
		this.alive = Math.random() > 0.5;
		this.simulated = 0;
	});

	world.initialize([
		{ name: 'living', distribution: 100 }
	]);

	return world;
};

function example_paradise() {
	// thanks to lithander on TIGSource

	// FIRST CREATE ISLANDS
	var world = new CAWorld({
		width: 96,
		height: 64,
		cellSize: 6
	});

	world.registerCellType('wall', {
		process: function (neighbors) {
			var surrounding = this.countSurroundingCellsWithValue(neighbors, 'wasOpen');
			this.open = (this.wasOpen && surrounding >= 4) || surrounding >= 5;
		},
		reset: function () {
			this.wasOpen = this.open;
		}
	}, function () {
		//init
		this.open = Math.random() > 0.535;
	});

	world.initialize([
		{ name: 'wall', distribution: 100 }
	]);

	// generate our cave, 10 steps aught to do it
	for (var i=0; i<10; i++) {
		world.step();
	}

	var grid = world.createGridFromValues([
		{ cellType: 'wall', hasProperty: 'open', value: 1 }
	], 0);

	//WATER + ISLANDS
	world = new CAWorld({
		width: 96,
		height: 64,
		cellSize: 6
	});

	world.registerCellType('water', {
		getColor: function () {
			var v = (Math.max(2 * this.value + 0.02, 0) - 0.02) + 0.5;
			var r = (Math.floor(v * 250)).toString();
			var g = (Math.floor(-80 + v * 500)).toString();
			var b = (Math.floor(100 + v * 350)).toString();
			return r+', '+g+', '+b+', 1';
		},
		process: function (neighbors) {
			if(this.droplet == true)
			{
				for (var i = 0; i < neighbors.length; i++) {
					if (neighbors[i] !== null && neighbors[i].value) {
						neighbors[i].value = 0.5 *this.value;
						neighbors[i].prev = 0.5 *this.prev;
					}
				}
				this.droplet = false;
				return true;
			}
			var avg = this.getSurroundingCellsAverageValue(neighbors, 'value');
			this.next = 0.99 * (2 * avg - this.prev);
			return true;
		},
		reset: function () {
			if(Math.random() > 0.9999)
			{
				this.value = -0.2 + 0.25*Math.random();
				this.prev = this.value;
				this.droplet = true;
			}
			else
			{
				this.prev = this.value;
				this.value = this.next;
			}
			return true;
		}
	}, function () {
		//init
		this.water = true;
		this.value = 0.0;
		this.prev = this.value;
		this.next = this.value;
	});

	world.registerCellType('island', {
		isSolid: true,
		getColor: function()
		{
			if(this.beach)
			{
				var v = Math.min(1, Math.max(0, (50 * this.floodedness)+0.2));
				var r = (Math.floor(250 - 100 * v)).toString();
				var g = (Math.floor(250 - 60 * v)).toString();
				var b = (Math.floor(150 + v * 105)).toString();
				return r+', '+g+', '+b+', 1';
			}
			else
				var v = this.foliage;
			var r = (Math.floor(109 - 55 * v)).toString();
			var g = (Math.floor(180 + 55 * v)).toString();
			var b = (Math.floor(84 + 55 * v)).toString();
			return r+', '+g+', '+b+', 1';
			//return '109, 200, 84, 1';
		},
		process: function(neighbors) {
			this.beach = this.beach || this.countSurroundingCellsWithValue(neighbors, 'water') > 0;
			this.floodedness = this.getSurroundingCellsAverageValue(neighbors, 'value');
		}
	}, function () {
		//init
		this.beach = Math.random() > 0.6;
		this.foliage = -0.5 + Math.random();
	});

	world.initializeFromGrid([
		{ name: 'island', gridValue: 1 },
		{ name: 'water', gridValue: 0 }
	], grid);

	return world;
};
function example_rain() {

	// FIRST CREATE CAVES
	var world = new CAWorld({
		width: 96,
		height: 64,
		cellSize: 6
	});

	world.registerCellType('wall', {
		process: function (neighbors) {
			var surrounding = this.countSurroundingCellsWithValue(neighbors, 'wasOpen');
			this.open = (this.wasOpen && surrounding >= 4) || surrounding >= 6;
		},
		reset: function () {
			this.wasOpen = this.open;
		}
	}, function () {
		//init
		this.open = Math.random() > 0.40;
	});

	world.initialize([
		{ name: 'wall', distribution: 100 }
	]);

	// generate our cave, 10 steps aught to do it
	for (var i=0; i<10; i++) {
		world.step();
	}

	var grid = world.createGridFromValues([
		{ cellType: 'wall', hasProperty: 'open', value: 0 }
	], 1);

	// cut the top half of the caves off
	for (var y=0; y<Math.floor(world.height/2); y++) {
		for (var x=0; x<world.width; x++) {
			grid[y][x] = 0;
		}
	}

	// NOW USE OUR CAVES TO CREATE A NEW WORLD CONTAINING WATER
	world = new CAWorld({
		width: 96,
		height: 64,
		cellSize: 6,
		clearRect: true
	});

	world.registerCellType('air', {
		getColor: function() {
			return '89, 125, 206, ' + (this.water ? Math.max(0.3, this.water/9) : 0);
		},
		process: function(neighbors) {
			// rain on the top row
			if (neighbors[world.TOP.index] === null && Math.random() < 0.02) {
				this.water = 5;
			}
			else if (this.water === 0) {
				// already empty
				return;
			}

			// push my water out to my available neighbors

			// cell below me will take all it can
			if (neighbors[world.BOTTOM.index] !== null && this.water && neighbors[world.BOTTOM.index].water < 9) {
				var amt = Math.min(this.water, 9 - neighbors[world.BOTTOM.index].water);
				this.water-= amt;
				neighbors[world.BOTTOM.index].water += amt;
				return;
			}

			// bottom two corners take half of what I have
			for (var i=5; i<=7; i++) {
				if (i!=world.BOTTOM.index && neighbors[i] !== null && this.water && neighbors[i].water < 9) {
					var amt = Math.min(this.water, Math.ceil((9 - neighbors[i].water)/2));
					this.water-= amt;
					neighbors[i].water += amt;
					return;
				}
			}
			// sides take a third of what I have
			for (i=3; i<=4; i++) {
				if (neighbors[i] !== null && neighbors[i].water < this.water) {
					var amt = Math.min(this.water, Math.ceil((9 - neighbors[i].water)/3));
					this.water-= amt;
					neighbors[i].water += amt;
					return;
				}
			}
		}
	}, function() {
		//init
		this.water = 0;
	});

	world.registerCellType('rock', {
		isSolid: true,
		getColor: function() {
			return this.lighted ? '109, 170, 44, 1' : '68, 36, 52, 1';
		},
		process: function(neighbors) {
			this.lighted = neighbors[world.TOP.index] && !(neighbors[world.TOP.index].water === 9) && !neighbors[world.TOP.index].isSolid
				&& neighbors[world.BOTTOM.index] && neighbors[world.BOTTOM.index].isSolid;
		}
	});

	// pass in our generated cave data
	world.initializeFromGrid([
		{ name: 'rock', gridValue: 1 },
		{ name: 'air', gridValue: 0 }
	], grid);

	return world;
}
function example_splashes() {
	// thanks to lithander on TIGSource

	world = new CAWorld({
		width: 96,
		height: 64,
		cellSize: 6
	});

	world.registerCellType('water', {
		getColor: function () {
			var v = (Math.max(2 * this.value + 0.02, 0) - 0.02) + 0.5;
			var r = Math.floor(v * 250);
			var g = Math.floor(-80 + v * 500);
			var b = Math.floor(100 + v * 350);
			return r+', '+g+', '+b+', 1';
		},
		process: function (neighbors) {
			if(this.droplet == true) {
				for (var i = 0; i < neighbors.length; i++) {
					if (neighbors[i] !== null && neighbors[i].value) {
						neighbors[i].value = 0.5 *this.value;
						neighbors[i].prev = 0.5 *this.prev;
					}
				}
				this.droplet = false;
				return true;
			}
			var avg = this.getSurroundingCellsAverageValue(neighbors, 'value');
			this.next = 0.99 * (2 * avg - this.prev);
			return true;
		},
		reset: function () {
			if(Math.random() > 0.9999) {
				this.value = -0.2 + 0.25*Math.random();
				this.prev = this.value;
				this.droplet = true;
			}
			else {
				this.prev = this.value;
				this.value = this.next;
			}
			return true;
		}
	}, function () {
		//init
		this.water = true;
		this.value = 0.0;
		this.prev = this.value;
		this.next = this.value;
	});

	world.initialize([
		{ name: 'water', distribution: 100 }
	]);

	return world;
};
function example_trees() {


	var world = new CAWorld({
		width: 96,
		height: 64,
		cellSize: 6
	});

	world.registerCellType('air', {
		color: '109, 194, 202, 1',
		getColor: function() {
			return this.color;
		},
		process: function(neighbors) {
		}
	});

	world.registerCellType('earth', {
		isSolid: true,
		getColor: function() {
			return this.lighted ? '109, 170, 44, 1' : '68, 36, 52, 1';
		},
		process: function(neighbors) {
			this.lighted = neighbors[world.TOP.index] && !neighbors[world.TOP.index].isSolid
				&& neighbors[world.BOTTOM.index] && neighbors[world.BOTTOM.index].isSolid;
		}
	});

	world.registerCellType('tree', {
		//potential: 16,
		direction: { x: 0, y: -1},
		getColor: function() {
			return this.hasSprouted && this.isTrunk ? '60, 78, 44, 1' : (this.hasSprouted ? '52, 101, 36, 1' : '68, 36, 52, 1');
		},
		sprout: function() {
			this.isTrunk = true;
			for (var y=-1; y<=0; y++) {
				for (var x=-1; x<=1; x++) {
					if (Math.random() < 0.5) {
						if (world.grid[this.y + y] && world.grid[this.y + y][this.x + x]) {
							if (world.grid[this.y + y][this.x + x].cellType === 'tree') {
							}
							else {
								world.grid[this.y + y][this.x + x] = new world.cellTypes.tree(this.x, this.y);
							}
						}
						world.grid[this.y + y][this.x + x].potential = 0;
						world.grid[this.y + y][this.x + x].hasSprouted = true;
					}
				}
			}
		},
		process: function() {
			if (!this.potential) {
				return;
			}

			var newX = this.x + this.direction.x;
			var newY = this.y + this.direction.y;
			var cellInDirection;
			try {
				cellInDirection = world.grid[newY][newX];
			} catch(ex) {}

			if (cellInDirection && !cellInDirection.isSolid) {
				world.grid[newY][newX] = new world.cellTypes.tree(newX, newY);
				world.grid[newY][newX].potential = this.potential - 1;
				world.grid[newY][newX].direction.x = this.direction.x;
				world.grid[newY][newX].direction.y = this.direction.y;
				if (world.grid[newY][newX].potential < 12) {
					world.grid[newY][newX].delay(10, function (cell) {
						cell.sprout();
					});
				}
				// branch?
				if (this.potential < 14 && Math.random() < 0.3) {
					this.direction.x = Math.random() > 0.5 ? 1 : -1;
					this.direction.y = Math.random() > 0.5 ? 0 : -1;
					this.potential -= Math.ceil(this.potential/4);
				}
				else {
					this.potential = 0;
				}
			}
		}
	}, function () {
		//init
		this.potential = 10 + Math.floor(Math.random() * 14);
	});

	// create ground
	var grid = [];
	for (var y=0; y<world.height; y++) {
		grid[y] = [];
		for (var x=0; x<world.width; x++) {
			grid[y][x] = y > world.height - world.height/8 ? 1 : 0;
			if (y == world.height - world.height/8 && x % 32 === 16) {
				grid[y][x] = 2;
			}
		}
	}

	// pass in our generated cave data
	world.initializeFromGrid([
		{ name: 'earth', gridValue: 1 },
		{ name: 'tree', gridValue: 2 },
		{ name: 'air', gridValue: 0 }
	], grid);

	return world;
}