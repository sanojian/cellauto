function example_caves() {

	var world = new CAWorld({
		width: 96,
		height: 64,
		cellSize: 6
	});

	world.registerCellType('living', {
		getColor: function () {
			return this.open ? '255, 255, 255, 1' : '68, 36, 52, 1';
		},
		process: function (neighbors) {
			var surrounding = 0;
			for (var i = 0; i < neighbors.length; i++) {
				if (neighbors[i] !== null && neighbors[i].wasOpen) {
					surrounding++;
				}
			}
			this.open = (this.wasOpen && surrounding >= 4) || surrounding >= 6;
		},
		reset: function () {
			this.wasOpen = this.open;
		}
	}, function () {
		this.open = Math.random() > 0.40;
	});

	world.initialize([
		{ name: 'living', distribution: 100 }
	]);

	return world;
};
