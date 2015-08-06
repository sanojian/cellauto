function example_splashes() {
	// thanks to lithander on TIGSource

	world = new CAWorld({
		width: 96*2,
		height: 64*2,
		cellSize: 6/2
	});

	world.palette = [];
	var colors = [];
	for (var index=0; index<64; index++) {
		world.palette.push('89, 125, 206, ' + index/64);
		colors[index] = 63 - index;
	}

	world.registerCellType('water', {
		getColor: function () {
			var v = (Math.max(2 * this.value + 0.02, 0) - 0.02) + 0.5;
			return colors[Math.floor(colors.length * v)];
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