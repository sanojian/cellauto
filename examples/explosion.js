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