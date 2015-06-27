function CellAutoCell(locX, locY) {
	this.x = locX;
	this.y = locY;

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
CellAutoCell.prototype.reset = function(neighbors) {
	return;
};
