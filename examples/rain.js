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

	world.palette = [
		'89, 125, 206, 0',
		'89, 125, 206, ' + 1/9,
		'89, 125, 206, ' + 2/9,
		'89, 125, 206, ' + 3/9,
		'89, 125, 206, ' + 4/9,
		'89, 125, 206, ' + 5/9,
		'89, 125, 206, ' + 6/9,
		'89, 125, 206, ' + 7/9,
		'89, 125, 206, ' + 8/9,
		'89, 125, 206, 1',
		'109, 170, 44, 1',
		'68, 36, 52, 1'
	];

	world.registerCellType('air', {
		getColor: function() {
			//return '89, 125, 206, ' + (this.water ? Math.max(0.3, this.water/9) : 0);
			return this.water;
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
			return this.lighted ? 10 : 11;
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