$(document).ready(function(){

var elems = ["small-star", "medium-star", "big-star"];
var weights = [7, 2, 1]; // weight of each element above

var weighedElems = [];
var currentElem = 0;
while (currentElem < elems.length) {
  for (var i = 0; i < weights[currentElem]; i++)
    weighedElems[weighedElems.length] = elems[currentElem];
  currentElem++;
}

console.log(weighedElems);

var width = document.getElementById("sky").offsetWidth;
var height = document.getElementById("sky").offsetHeight;

console.log(width);
console.log(height);

for (var i = 0; i < 180; i++) {
	var left = Math.floor(Math.random() * width-15);
	var top = Math.floor(Math.random() * height-15);
	var rnd = Math.floor(Math.random() * weighedElems.length);
	document.getElementById("sky").insertAdjacentHTML('afterbegin', '<div class = "' + weighedElems[rnd] + '" style = "top: ' + top + 'px; left: ' + left + 'px;"></div>' );
}


$(window).scroll(function() {
    var winScrollTop = $(window).scrollTop();
    var winHeight = $(window).height();
    var floaterHeight = $('#floater').outerHeight(true);
    //true so the function takes margins into account
    var fromBottom = 0;

    var top = winScrollTop + winHeight - floaterHeight - fromBottom;
    $('#floater').css({'top': top + 'px'});
});

$(function() {   
    // contact form animations
    $('#contact').click(function() {
        $('#contactForm').fadeToggle();
    })
    
    $(document).mouseup(function (e) {
        var container = $("#contactForm");

        if (!container.is(e.target) // if the target of the click isn't the container...
            && container.has(e.target).length === 0) // ... nor a descendant of the container
        {
            container.fadeOut();
        }
    });

});


});

