function example_forestFire() {

	var world = new CAWorld({
		width: 96,
		height: 64,
		cellSize: 6
	});


	var CHANCE_TO_IGNITE = 0.001;
	var CHANCE_TO_GROW = 0.01;

	world.registerCellType('tree', {
		getColor: function () {
			return this.burning ? '208, 70, 72, ' + Math.max(0.3, this.burning/9) : (this.alive ? '52, 101, 36, 1' : '255, 255, 255, 1');
		},
		burning: 0,
		process: function (neighbors) {
			if (this.wasBurning) {
				this.burning--;
			}
			else if (this.alive) {
				var surrounding = this.countSurroundingCellsWithValue(neighbors, 'wasBurning');
				//this.burning = surrounding === 3 || surrounding === 2 && this.burning;
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
