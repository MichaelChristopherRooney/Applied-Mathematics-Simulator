var size = 600;
var oldScale;
var oldSize;

$(document).ready(function(){
	
	resize();
	
});

/*
resize only if it has been 250ms since last resize
this stops elements jumping while the browser is still resizing
*/
var resizeTimer;
$(window).resize(function (){
	
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(resize, 250);
	
});

/* 
readjust all elements to suit new display size
*/
function resize(){
	
	var w = getNewDimensions();
	resizeNavBar();
	
	oldSize = size;
	size = getNewSize();
	
}