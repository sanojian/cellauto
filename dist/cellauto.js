function CellAutoCell(locX, locY) {
	this.x = locX;
	this.y = locY;

	this.delays = [];
}

CellAutoCell.prototype.process = function(neighbors) {
	return;
};
CellAutoCell.prototype.countSurroundingCellsWithValue = function(neighbors, value) {
	var surrounding = 0;
	for (var i = 0; i < neighbors.length; i++) {
		if (neighbors[i] !== null && neighbors[i][value]) {
			surrounding++;
		}
	}
	return surrounding;
};
CellAutoCell.prototype.delay = function(numSteps, fn) {
	this.delays.push({ steps: numSteps, action: fn });
};

CellAutoCell.prototype.reset = function(neighbors) {
	return;
};

function CAWorld(options) {

	this.width = 24;
	this.height = 24;
	this.options = options;

	//this.TOPLEFT = 0; this.TOP = 1; this.TOPRIGHT = 2;
	//this.LEFT = 3; this.RIGHT = 4;
	//this.BOTTOMLEFT = 5; this.BOTTOM = 6; this.BOTTOMRIGHT = 7;

	this.TOPLEFT        = { index: 0, x: -1, y: -1 };
	this.TOP            = { index: 1, x:  0, y: -1 };
	this.TOPRIGHT       = { index: 2, x:  1, y: -1 };
	this.LEFT           = { index: 3, x: -1, y:  0 };
	this.RIGHT          = { index: 4, x:  1, y:  0 };
	this.BOTTOMLEFT     = { index: 5, x: -1, y:  1 };
	this.BOTTOM         = { index: 6, x:  0, y:  1 };
	this.BOTTOMRIGHT    = { index: 7, x:  1, y:  1 };
	
	this.randomGenerator = Math.random;

	var neighborhood = [null, null, null, null, null, null, null, null];
	this.step = function() {
		var y, x;
		for (y=0; y<this.height; y++) {
			for (x=0; x<this.width; x++) {
				this.grid[y][x].reset();
			}
		}

		// bottom up, left to right processing
		for (y=this.height-1; y>=0; y--) {
			for (x=this.width-1; x>=0; x--) {
				this.fillNeighbors(neighborhood, x, y);
				var cell = this.grid[y][x];
				cell.process(neighborhood);

				// perform any delays
				for (var i=0; i<cell.delays.length; i++) {
					cell.delays[i].steps--;
					if (cell.delays[i].steps <= 0) {
						// perform action and remove delay
						cell.delays[i].action(cell);
						cell.delays.splice(i, 1);
						i--;
					}
				}
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
				var random = this.randomGenerator() * 100;

				for (i=0; i<arrayTypeDist.length; i++) {
					if (random <= arrayTypeDist[i].distribution) {
						this.grid[y][x] = new this.cellTypes[arrayTypeDist[i].name](x, y);
						break;
					}
				}
			}
		}
	};

	this.cellTypes = {};
	this.registerCellType = function(name, cellOptions, init) {
		this.cellTypes[name] = function(x, y) {
			CellAutoCell.call(this, x, y);

			if (init) {
				init.call(this);
			}

			if (cellOptions) {
				for (var key in cellOptions) {
					if (typeof cellOptions[key] !== 'function') {
						// properties get instance
						if (typeof cellOptions[key] === 'object') {
							// objects must be cloned
							this[key] = JSON.parse(JSON.stringify(cellOptions[key]));
						}
						else {
							// primitive
							this[key] = cellOptions[key];
						}
					}
				}
			}
		};
		this.cellTypes[name].prototype = Object.create(CellAutoCell.prototype);
		this.cellTypes[name].prototype.constructor = this.cellTypes[name];
		this.cellTypes[name].prototype.cellType = name;

		if (cellOptions) {
			for (var key in cellOptions) {
				if (typeof cellOptions[key] === 'function') {
					// functions get prototype
					this.cellTypes[name].prototype[key] = cellOptions[key];
				}
			}
		}
	};

	// apply options
	if (options) {
		for (var key in options) {
			this[key] = options[key];
		}
	}

}

CAWorld.prototype.initializeFromGrid  = function(values, initGrid) {

	this.grid = [];
	for (var y=0; y<this.height; y++) {
		this.grid[y] = [];
		for (var x=0; x<this.width; x++) {
			for (var i=0; i<values.length; i++) {
				if (values[i].gridValue === initGrid[y][x]) {
					this.grid[y][x] = new this.cellTypes[values[i].name](x, y);
					break;
				}
			}
		}
	}

};

CAWorld.prototype.createGridFromValues = function(values, defaultValue) {
	var newGrid = [];

	for (var y=0; y<this.height; y++) {
		newGrid[y] = [];
		for (var x = 0; x < this.width; x++) {
			newGrid[y][x] = defaultValue;
			var cell = this.grid[y][x];
			for (var i=0; i<values.length; i++) {
				if (cell.cellType == values[i].cellType && cell[values[i].hasProperty]) {
					newGrid[y][x] = values[i].value;
				}
			}
		}
	}

	return newGrid;
};

;(function() {
  var CellAuto = {
    World: CAWorld,
    Cell: CellAutoCell
  };

  if (typeof define === 'function' && define.amd) {
    define('CellAuto', function () {
      return CellAuto;
    });
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = CellAuto;
  } else {
    window.CellAuto = CellAuto;
  }
})();
