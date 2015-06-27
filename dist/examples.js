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

function example_cyclic() {
	var world = new CAWorld({
		width: 96,
		height: 64,
		cellSize: 6
	});

	world.registerCellType('cyclic', {
		colors: [
			'255,0,0,1', '255,96,0,1', '255,191,0,1', '223,255,0,1',
			'128,255,0,1', '32,255,0,1', '0,255,64,1', '0,255,159,1',
			'0,255,255,1', '0,159,255,1', '0,64,255,1', '32,0,255,1',
			'127,0,255,1', '223,0,255,1', '255,0,191,1', '255,0,96,1'
		],
		getColor: function () {
			return this.colors[this.state];
		},
		process: function (neighbors) {
			var next = (this.state + 1) % 16;

			var changing = false;
			for (var i = 0; i < neighbors.length; i++) {
				if (neighbors[i] !== null) {
					changing = changing || neighbors[i].state === next;
				}
			}
			//var changing = neighbors.some(function (spot) {
			//    return spot.creature.state === next;
			//});
			if (changing) this.state = next;
			return true;
		}
	}, function () {
		this.state = Math.floor(Math.random() * 16);
	});

	world.initialize([
		{ name: 'cyclic', distribution: 100 }
	]);

	return world;
}
function example_fallingWater() {

    var world = new CAWorld({
		width: 96,
		height: 64,
		cellSize: 6
	});

    world.registerCellType('water', {
        getColor: function() {
            return '89, 125, 206, ' + (this.water ? Math.max(0.3, this.water/9) : 0);
        },
        process: function(neighbors) {
            if (this.water === 0) {
                // already empty
                return;
            }
            // bottom
            if (neighbors[world.BOTTOM] !== null && this.water && neighbors[world.BOTTOM].water < 9) {
                // all of it
                var amt = Math.min(this.water, 9 - neighbors[world.BOTTOM].water);
                this.water-= amt;
                neighbors[world.BOTTOM].water += amt;
                return;
            }

            // bottom with corners
            for (var i=5; i<=7; i++) {
                if (i!=world.BOTTOM && neighbors[i] !== null && this.water && neighbors[i].water < 9) {
                    // half of it
                    var amt = Math.min(this.water, Math.ceil((9 - neighbors[i].water)/2));
                    this.water-= amt;
                    neighbors[i].water += amt;
                    return;
                }
            }
            // sides
            for (i=3; i<=4; i++) {
                if (neighbors[i] !== null && neighbors[i].water < this.water) {
                    // third of it
                    var amt = Math.min(this.water, Math.ceil((9 - neighbors[i].water)/3));
                    this.water-= amt;
                    neighbors[i].water += amt;
                    return;
                }
            }
        }
    }, function() {
        this.water = Math.floor(Math.random() * 9);
    });

    world.registerCellType('rock', {
        getColor: function() {
            return '68, 36, 52, 1';
        }
    });

    world.initialize([
        { name: 'water', distribution: 70 },
        { name: 'rock', distribution: 30 }
    ]);

	return world;
}

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
