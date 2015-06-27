function CAWorld(options) {

	this.width = 24;
	this.height = 24;

	this.TOPLEFT = 0; this.TOP = 1; this.TOPRIGHT = 2;
	this.LEFT = 3; this.RIGHT = 4;
	this.BOTTOMLEFT = 5; this.BOTTOM = 6; this.BOTTOMRIGHT = 7;

	var neighborhood = [null, null, null, null, null, null, null, null];
	this.step = function() {
		var y, x;
		for (y=0; y<this.height; y++) {
			for (x=0; x<this.width; x++) {
				this.grid[y][x].reset();
			}
		}

		//for (y=0; y<this.height; y++) {
		//	for (x=0; x<this.width; x++) {
		for (y=this.height-1; y>=0; y--) {
			for (x=this.width-1; x>=0; x--) {
				this.fillNeighbors(neighborhood, x, y);
				this.grid[y][x].process(neighborhood);
			}
		}
	};

	var NEIGHBORLOCS = [{x:-1, y:-1}, {x:0, y:-1}, {x:1, y:-1}, {x:-1, y:0}, {x:1, y:0},{x:-1, y:1}, {x:0, y:1}, {x:1, y:1}];
	this.fillNeighbors = function(neighbors, x, y) {
		for (var i=0; i<NEIGHBORLOCS.length; i++) {
			var neighborX = x + NEIGHBORLOCS[i].x;
			var neighborY = y + NEIGHBORLOCS[i].y;
			if (neighborX < 0 || neighborY < 0 || neighborX >= this.width || neighborY >= this.height) {
				neighbors[i] = null;
			}
			else {
				neighbors[i] = this.grid[neighborY][neighborX];
			}
		}
	};

	this.initialize = function(arrayTypeDist) {
		if (options) {
			for (var key in options) {
				this[key] = options[key];
			}
		}

		// sort the cell types by distribution
		arrayTypeDist.sort(function(a, b) {
			return a.distribution > b.distribution ? 1 : -1;
		});

		var totalDist = 0;
		// add all distributions together
		for (var i=0; i<arrayTypeDist.length; i++) {
			totalDist += arrayTypeDist[i].distribution;
			arrayTypeDist[i].distribution = totalDist;
		}

		this.grid = [];
		for (var y=0; y<this.height; y++) {
			this.grid[y] = [];
			for (var x=0; x<this.width; x++) {
				var random = Math.random() * 100;

				for (i=0; i<arrayTypeDist.length; i++) {
					if (random <= arrayTypeDist[i].distribution) {
						this.grid[y][x] = new cellTypes[arrayTypeDist[i].name](x, y);
						break;
					}
				}
			}
		}
	};

	var cellTypes = {};
	this.registerCellType = function(name, options, init) {
		cellTypes[name] = function(x, y) {
			CellAutoCell.call(this, x, y);

			if (init) {
				init.call(this);
			}

		};
		cellTypes[name].prototype = Object.create(CellAutoCell.prototype);
		cellTypes[name].prototype.constructor = cellTypes[name];
		cellTypes[name].prototype.cellType = name;

		if (options) {
			for (var key in options) {
				cellTypes[name].prototype[key] = options[key];
			}
		}

	};

}
