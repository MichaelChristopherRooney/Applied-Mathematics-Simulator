/*
this is scaling code that every simulator uses
it provides the width of the window, and the size that the simulator display shoudld be
it also handles resizing the navbar
*/

var w;
var h;

function getNewDimensions(){
	
	if( typeof( window.innerWidth ) == 'number' ) {
		//Non-IE
		w = window.innerWidth;
		h = window.innerHeight;
	} else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
		//IE 6+ in 'standards compliant mode'
		w = document.documentElement.clientWidth;
		h = document.documentElement.clientHeight;
	} else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
		//IE 4 compatible
		w = document.body.clientWidth;
		h = document.body.clientHeight;
	}
	
	return w;
	
}

function getNewSize(){
	
	var size = w - 250 - 10 - 165;
	
	if(size + 80 > h){
		size = h - 80;
	}
	
	if(size < 480){
		size = 400;
	}
	
	return size;
	
}

function resizeNavBar(){
	
	navbar = document.getElementById("navbar");
	navselect = document.getElementById("navselect");
	navselectmenu = document.getElementById("navselectmenu");
	
	// once below a certain width change the navbar to a dropdown menu
	if(w < 1024){
		
		navbar.style.display = "none";
		navselect.style.display = "block";
		
		if(w < 800){
			navselect.style.width = (800 - 20) + "px";
			navselectmenu.style.width = (800 - 40) + "px";
		}else{
			navselect.style.width = (w - 20) + "px";
			navselectmenu.style.width = (w - 40) + "px";
		}
	}else{
		navbar.style.display = "block";
		navbar.style.width = (w - 16) + "px";
		navselect.style.display = "none";
	}
	
}