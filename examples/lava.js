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