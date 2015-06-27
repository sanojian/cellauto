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
			var surrounding = 0;
			for (var i = 0; i < neighbors.length; i++) {
				if (neighbors[i] !== null && neighbors[i].wasAlive) {
					surrounding++;
				}
			}
			this.alive = surrounding === 3 || surrounding === 2 && this.alive;
		},
		reset: function () {
			this.wasAlive = this.alive;
		}
	}, function () {
		this.alive = Math.random() > 0.5;
	});

	world.initialize([
		{ name: 'living', distribution: 100 }
	]);

	return world;
};
