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