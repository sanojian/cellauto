function example_forestFire() {

	var world = new CAWorld({
		width: 96,
		height: 64,
		cellSize: 6
	});

	world.palette = [
		'208, 70, 72, 0',
		'208, 70, 72, ' + 1/9,
		'208, 70, 72, ' + 2/9,
		'208, 70, 72, ' + 3/9,
		'208, 70, 72, ' + 4/9,
		'208, 70, 72, ' + 5/9,
		'208, 70, 72, ' + 6/9,
		'208, 70, 72, ' + 7/9,
		'208, 70, 72, ' + 8/9,
		'208, 70, 72, 1',
		'52, 101, 36, 1',
		'255, 255, 255, 1'
	];

	var CHANCE_TO_IGNITE = 0.0001;
	var CHANCE_TO_GROW = 0.01;

	world.registerCellType('tree', {
		getColor: function () {
			return this.burning ? this.burning : (this.alive ? 10 : 11);
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
