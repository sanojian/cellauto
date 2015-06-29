function example_trees() {


	// NOW USE OUR CAVES TO CREATE A NEW WORLD CONTAINING WATER
	var world = new CAWorld({
		width: 96,
		height: 64,
		cellSize: 6
	});

	// create ground
	var grid = [];
	for (var y=0; y<world.height; y++) {
		grid[y] = [];
		for (var x=0; x<world.width; x++) {
			grid[y][x] = y > world.height - world.height/8 ? 1 : 0;
			if (y == world.height - world.height/8 && x == Math.floor(world.width/2)) {
				grid[y][x] = 2;
			}
		}
	}


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
			this.lighted = neighbors[world.TOP] && !neighbors[world.TOP].isSolid && neighbors[world.BOTTOM] && neighbors[world.BOTTOM].isSolid;
		}
	});

	world.registerCellType('tree', {
		color: '68, 36, 52, 1',
		potential: 8,
		direction: { x: 0, y: -1},
		getColor: function() {
			return this.color;
		},
		process: function(neighbors) {
			if (this.potential && neighbors[world.TOP] && !neighbors[world.TOP].isSolid) {
				var newX = this.x + this.direction.x;
				var newY = this.y + this.direction.y;
				world.grid[newY][newX] = new world.cellTypes.tree(newX, newY);
				world.grid[newY][newX].potential = this.potential - 1;
				this.potential = 0;
			}
		}
	});

	// pass in our generated cave data
	world.initializeFromGrid([
		{ name: 'earth', gridValue: 1 },
		{ name: 'tree', gridValue: 2 },
		{ name: 'air', gridValue: 0 }
	], grid);

	return world;
}