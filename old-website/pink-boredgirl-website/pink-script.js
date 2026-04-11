$(document).ready(function(){

var elems = ["small-star", "medium-star", "big-star"];
var weights = [5, 2, 1]; // weight of each element above

var weighedElems = [];
var currentElem = 0;
while (currentElem < elems.length) {
  for (var i = 0; i < weights[currentElem]; i++)
    weighedElems[weighedElems.length] = elems[currentElem];
  currentElem++;
}

console.log(weighedElems);

var width = $(window).width();
var height = $(window).height();

console.log(width);
console.log(height);

for (var i = 0; i < 180; i++) {
  var left = Math.floor(Math.random() * width-15);
  var top = Math.floor(Math.random() * height-15);
  var rnd = Math.floor(Math.random() * weighedElems.length);
  document.getElementById("sky").insertAdjacentHTML('afterbegin', '<div class = "' + weighedElems[rnd] + '" style = "top: ' + top + 'px; left: ' + left + 'px;"></div>' );
}

});

