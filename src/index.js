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
