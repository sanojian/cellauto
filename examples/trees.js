function example_trees() {


	var world = new CAWorld({
		width: 96,
		height: 64,
		cellSize: 6
	});

	world.registerCellType('air', {
		color: '109, 194, 202, 1',
		getColor: function() {
			return this.color;
		},
		process: function(neighbors) {
		}
	});

	world.registerCellType('earth', {
		isSolid: true,
		getColor: function() {
			return this.lighted ? '109, 170, 44, 1' : '68, 36, 52, 1';
		},
		process: function(neighbors) {
			this.lighted = neighbors[world.TOP.index] && !neighbors[world.TOP.index].isSolid
				&& neighbors[world.BOTTOM.index] && neighbors[world.BOTTOM.index].isSolid;
		}
	});

	world.registerCellType('tree', {
		//potential: 16,
		direction: { x: 0, y: -1},
		getColor: function() {
			return this.hasSprouted && this.isTrunk ? '60, 78, 44, 1' : (this.hasSprouted ? '52, 101, 36, 1' : '68, 36, 52, 1');
		},
		sprout: function() {
			this.isTrunk = true;
			for (var y=-1; y<=0; y++) {
				for (var x=-1; x<=1; x++) {
					if (Math.random() < 0.5) {
						if (world.grid[this.y + y] && world.grid[this.y + y][this.x + x]) {
							if (world.grid[this.y + y][this.x + x].cellType === 'tree') {
							}
							else {
								world.grid[this.y + y][this.x + x] = new world.cellTypes.tree(this.x, this.y);
							}
						}
						world.grid[this.y + y][this.x + x].potential = 0;
						world.grid[this.y + y][this.x + x].hasSprouted = true;
					}
				}
			}
		},
		process: function() {
			if (!this.potential) {
				return;
			}

			var newX = this.x + this.direction.x;
			var newY = this.y + this.direction.y;
			var cellInDirection;
			try {
				cellInDirection = world.grid[newY][newX];
			} catch(ex) {}

			if (cellInDirection && !cellInDirection.isSolid) {
				world.grid[newY][newX] = new world.cellTypes.tree(newX, newY);
				world.grid[newY][newX].potential = this.potential - 1;
				world.grid[newY][newX].direction.x = this.direction.x;
				world.grid[newY][newX].direction.y = this.direction.y;
				if (world.grid[newY][newX].potential < 12) {
					world.grid[newY][newX].delay(10, function (cell) {
						cell.sprout();
					});
				}
				// branch?
				if (this.potential < 14 && Math.random() < 0.3) {
					this.direction.x = Math.random() > 0.5 ? 1 : -1;
					this.direction.y = Math.random() > 0.5 ? 0 : -1;
					this.potential -= Math.ceil(this.potential/4);
				}
				else {
					this.potential = 0;
				}
			}
		}
	}, function () {
		//init
		this.potential = 10 + Math.floor(Math.random() * 14);
	});

	// create ground
	var grid = [];
	for (var y=0; y<world.height; y++) {
		grid[y] = [];
		for (var x=0; x<world.width; x++) {
			grid[y][x] = y > world.height - world.height/8 ? 1 : 0;
			if (y == world.height - world.height/8 && x % 32 === 16) {
				grid[y][x] = 2;
			}
		}
	}

	// pass in our generated cave data
	world.initializeFromGrid([
		{ name: 'earth', gridValue: 1 },
		{ name: 'tree', gridValue: 2 },
		{ name: 'air', gridValue: 0 }
	], grid);

	return world;
}