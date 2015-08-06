function example_maze() {

	// thanks to SuperDisk on TIGSource forums!

	var world = new CAWorld({
		width: 96,
		height: 64,
		cellSize: 6
	});

	world.palette = [
		'68, 36, 52, 1',
		'255, 255, 255, 1'
	];

	world.registerCellType('living', {
		getColor: function () {
			return this.alive ? 0 : 1;
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
