var size = 600;
var circle;
var line;
var paper;
var state;
var clearID;
var offGround;
var fps = 60;
var pointList = [];
var paper;
var backgroundRectangle;

$(document).ready(function(){
	
	paper = Raphael(document.getElementById("graphics_panel"), size, size);
	
	backgroundRectangle = paper.rect(0, 0, size, size);
	backgroundRectangle.attr("fill", "#bdbdbd");
	backgroundRectangle.attr("stroke", "#000");
	
	getNewSize();

	
});

var resizeTimer;
$(window).resize(function (){
	
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(getNewSize, 250);
	
	
});

function getNewSize(){
	
	var w = 0, h = 0;
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
	
		
	var oldSize = size;
	var oldScale;
		
	
	size = w - 250 - 10 - 165;
	
	if(size + 80 > h){
		size = h - 80;
	}
	
	if(w < 1024){
		document.getElementById("navbar").style.display = "none";
		document.getElementById("navselect").style.display = "block";
		document.getElementById("navselect").style.width = (w - 20) + "px";
	}else{
		document.getElementById("navbar").style.display = "block";
		document.getElementById("navselect").style.display = "none";
	}
	
	if(state){
		oldScale = state.scale;
		var x = oldSize / state.scale;
		state.scale = size / x;
		rescale(oldSize, oldScale);
	}
	
	paper.setSize(size, size);
	backgroundRectangle.attr("height", size);
	backgroundRectangle.attr("width", size);
	
	document.getElementById("graphics_panel").style.width = size + "px";
	document.getElementById("graphics_panel").style.left = "165px";
	document.getElementById("info_pane").style.left = size + 10 + 165 + "px";
	document.getElementById("navbar").style.width = (w - 16) + "px";
		
}

function rescale(oldSize, oldScale){
	
	document.getElementById("scale").innerHTML = 
	"Scale: 1 metre = " + state.scale.toFixed(3) + " pixels";	
			
	if(circle){
		circle.attr("cx", (circle.attr("cx") / oldScale) * state.scale);
		circle.attr("cy", (circle.attr("cy") / oldScale) * state.scale);
	}
			
	if(pointList){
		for(var i = 0; i < pointList.length; i++){
			pointList[i].attr("cx", (pointList[i].attr("cx") / oldScale) * state.scale);
			pointList[i].attr("cy", (pointList[i].attr("cy") / oldScale) * state.scale);
		}
	}
		
	if(line){
		
		line.remove();
		line = null;
		
		if(state.type == "offGround"){
			line = paper.path("M0 " 
			+ (size - (state.startHeight * scale)) + " " + "L"
			+ size
			+ " "
			+ (size - (state.startHeight * scale))
			);
		}else if(state.type == "incline"){
			line = paper.path("M0 " + size + "L"
			+ size
			+ " "
			+ (size - 
			(size * Math.tan(state.inclineAngle * (Math.PI / 180)))
			)
			);
		}
	}
}

/*
see appendix for detailed explanations of
values and formulae used in projectiles
*/
function stateObject(){
		this.u = 0;
		this.ux = 0;
		this.uy = 0;
		this.vx = 0;
		this.vy = 0;
		this.projectileAngle = 0;
		this.tof = 0;
		this.sx = 0;
		this.sy = 0; 
		this.time = 0;
		this.range = 0;
		this.maxHeight = 0;
		this.startHeight = 0;
		this.inclineAngle = 0;
		this.type = "";
		this.scale = 0;
}

/*
called when the "Run simulation" button is pressed
*/
function run(){
	
	cleanUp();
	
	/*
	
	//parseInt(document.getElementById("u").value),parseInt(document.getElementById("angle").value)
	*/
	
	circle = paper.circle(-10, -10, 10);
	circle.attr("fill", "#f00");
	circle.attr("stroke", "#000");
	
	state = new stateObject();
	
	if(document.getElementById("offGround").checked){
		
		state.type = "offGround";
		
		if(!parseInputOffGround()){
			return false;
		}
		
		getOffGroundValues();
		getScaleOffGround();
		setData();
		
		line = paper.path("M0 " 
			+ (size - (state.startHeight * state.scale)) + " " + "L"
			+ size
			+ " "
			+ (size - (state.startHeight * state.scale))
		);
		
		clearID = setInterval(simulateStepOffGround, (1/fps) * 1000);
		
	}else if(document.getElementById("isIncline").checked){
		
		state.type = "incline";
		
		if(!parseInputIncline()){
			return false;
		}
		
		getInclineValues();
		getScaleIncline();
		setData();
		
		line = paper.path("M0 " + size + "L"
			+ size
			+ " "
			+ (size - 
			(size * Math.tan(state.inclineAngle * (Math.PI / 180)))
			)
		);
		
		clearID = setInterval(simulateStepIncline, (1/fps) * 1000);
		
	}else{
		
		state.type = "normal";
		
		if(!parseInput()){
			return false;
		}
		
		getValues();
		getScale();
		setData();
		clearID = setInterval(simulateStep, (1/fps) * 1000);
		
	}
	
}

function parseInput(){
	
	var alertMessage = "";
	
	state.u = parseFloat(document.getElementById("u").value);
	
	if(isNaN(state.u) || state.u == "" || state.u <= 0){
		alertMessage += "Initial speed must be a number and be > 0\n";
	}
	
	state.projectileAngle = parseFloat(document.getElementById("angle").value);
	
	if(isNaN(state.projectileAngle) || state.projectileAngle < 0 || state.projectileAngle > 90 
	|| (state.projectileAngle == "" && state.projectileAngle != 0)){
		alertMessage += 
		"Projectile angle must be a number and be >= 0 and <= 90\n";
	}
	
	if(alertMessage != ""){
		alert(alertMessage);
		return false;
	}
	
	return true;
	
}

/*
gets constant values for the normal case
*/
function getValues(){
	
	state.ux = state.u * Math.cos(state.projectileAngle * (Math.PI / 180));
	state.uy = state.u * Math.sin(state.projectileAngle * (Math.PI / 180));
	state.vx = state.ux;
	state.vy = 0;
	state.tof = (2 * state.uy) / 9.8;
	state.sx = 0;
	state.sy = 0; 
	state.time = 0;
	state.range = state.ux * state.tof;
	state.maxHeight = 
		(state.uy * (state.tof / 2) 
		+ (-4.9 * (state.tof / 2) 
		* (state.tof / 2)));
		
}

/*
gets values for the next step in the simulation
*/
function simulateStep(){
	
	if(state.time > state.tof){
		clearInterval(clearID);
		state.time = state.tof;
	}
	
	state.vy = state.uy + (-9.8 * state.time);
	state.sx = (state.ux * state.time);
	state.sy = (state.uy * state.time) 
		+ (-4.9 * state.time * state.time);
	
	
	circle.attr("cx", state.sx * state.scale);
	circle.attr("cy", size - (state.sy * state.scale));
	
	var tCircle = paper.circle(0, 0, 2);
	tCircle.attr("cx", state.sx * state.scale);
	tCircle.attr("cy", size - (state.sy * state.scale));
	tCircle.attr("fill", "#000");
	pointList.push(tCircle);
	
	setData();
	
	state.time = state.time + (1/fps);
	
}

/*
gets constant values for when the specific case where the projectile is
fired up an inclined plane
*/
function getInclineValues(){
	
	state.ux = state.u * Math.cos(state.projectileAngle * (Math.PI / 180));
	state.uy = state.u * Math.sin(state.projectileAngle * (Math.PI / 180));
	state.vx = state.ux;
	state.vy = 0;
	state.sx = 0;
	state.sy = 0; 
	state.time = 0;

	state.tof = (2 * state.uy) 
		/ (9.8 * Math.cos(state.inclineAngle * (Math.PI / 180))
	);
		
	state.range = (state.ux * state.tof) 
		+ (-4.9 
		* Math.sin(state.inclineAngle * (Math.PI / 180)) 
		* state.tof * state.tof
	);
	
	state.maxHeight = (state.uy * (state.tof / 2)) 
		+ (-4.9 
		* Math.cos(state.inclineAngle * (Math.PI / 180)) 
		* (state.tof / 2) * (state.tof / 2)
	);

	
}

function parseInputIncline(){
	
	var alertMessage = "";
	
	state.u = parseFloat(document.getElementById("u").value);
	
	if(isNaN(state.u) || state.u == "" || state.u <= 0){
		alertMessage += "Initial speed must be a number and be > 0\n";
	}
	
	state.projectileAngle = parseFloat(document.getElementById("angle").value);
	
	if(isNaN(state.projectileAngle) || state.projectileAngle < 0 || state.projectileAngle > 90 
	|| (state.projectileAngle == "" && state.projectileAngle != 0)){
		alertMessage += 
		"Projectile angle must be a number and be >= 0 and <= 90\n";
	}
	
	state.inclineAngle = parseFloat(document.getElementById("inclineAngle").value);
	
	if(isNaN(state.inclineAngle) || state.inclineAngle <= 0 || state.inclineAngle > 90
	|| (state.inclineAngle == "" && state.inclineAngle != 0)){
		alertMessage +=
		"Incline plane angle must be a number > 0 and <= 90"
	}
	
	if(state.inclineAngle + state.projectileAngle > 90){
		alertMessage +=
		"Incline angle + projectile angle must be < 90"
	}
	
	if(alertMessage != ""){
		alert(alertMessage);
		return false;
	}
	
	return true;
	
}

function simulateStepIncline(){
	
	if(state.time > state.tof){
		state.time = state.tof;
		clearInterval(clearID);
	}
		
	state.vx = state.ux + 
		(-9.8 
		* Math.sin(state.inclineAngle * (Math.PI / 180)) 
		* state.time
	);
	state.vy = state.uy + 
		(-9.8 
		* Math.cos(state.inclineAngle * (Math.PI / 180)) 
		* state.time
	);
	state.sx = (state.ux * state.time) 
		+ (-4.9 
		* Math.sin(state.inclineAngle * (Math.PI / 180)) 
		* state.time * state.time
	);
	state.sy = (state.uy * state.time) 
		+ (-4.9 
		* Math.cos(state.inclineAngle * (Math.PI / 180)) 
		* state.time * state.time
	);
	
	var x = 
	(state.sx * Math.cos(state.inclineAngle * (Math.PI / 180))) 
	- (state.sy * Math.sin(state.inclineAngle * (Math.PI / 180)));
			
	var y = 
	(state.sx * Math.sin(state.inclineAngle * (Math.PI / 180))) 
	+ (state.sy * Math.cos(state.inclineAngle * (Math.PI / 180)));
			
	circle.attr("cx", x * state.scale);
	circle.attr("cy", size - (y * state.scale));
	
	var tCircle = paper.circle(0, 0, 2);
	tCircle.attr("cx", x * state.scale);
	tCircle.attr("cy", size - (y * state.scale));
	tCircle.attr("fill", "#000");
	pointList.push(tCircle);
	
	setData();
	
	state.time = state.time + (1/fps);
	
}

function parseInputOffGround(){
	
	var alertMessage = "";
	
	state.u = parseFloat(document.getElementById("u").value);
	
	if(isNaN(state.u) || state.u == "" || state.u <= 0){
		alertMessage += "Initial speed must be a number and be > 0\n";
	}
	
	state.projectileAngle = parseFloat(document.getElementById("angle").value);
	
	if(isNaN(state.projectileAngle) || state.projectileAngle < 0 || state.projectileAngle > 90 
	|| (state.projectileAngle == "" && state.projectileAngle != 0)){
		alertMessage += 
		"Projectile angle must be a number and be >= 0 and <= 90\n";
	}
	
	state.startHeight = parseFloat(document.getElementById("startHeight").value);
	
	if(isNaN(state.startHeight) || state.startHeight <= 0 || state.startHeight == ""){
		alertMessage +=
		"Start height must be a number > 0"
	}
	
	if(alertMessage != ""){
		alert(alertMessage);
		return false;
	}
	
	return true;
	
}

/*
gets constant values for when the specific case where the projectile starts
off the ground
*/
function getOffGroundValues(){
	
	state.ux = state.u * Math.cos(state.projectileAngle * (Math.PI / 180));
	state.uy = state.u * Math.sin(state.projectileAngle * (Math.PI / 180));
	state.vx = state.ux;
	state.vy = 0;
	state.tof = (2 * state.uy) / 9.8;
	state.sx = 0;
	state.sy = 0; 
	state.time = 0;
	
	state.tof = (-state.uy 
		- Math.sqrt((state.uy * state.uy) - (-19.6 * state.startHeight)))
		/ -9.8;
	state.range = state.ux * state.tof;
	var tempTOF = (2 * state.uy) / 9.8;
	state.maxHeight = (state.uy * (tempTOF / 2) 
		+ (-4.9 * (tempTOF / 2) * (tempTOF / 2))
	);
	
}

/*
gets values for the next step in the simulation
specific for when the projectile starts off the ground
*/
function simulateStepOffGround(){
	
	if(state.time > state.tof){
		clearInterval(clearID);
		state.time = state.tof;
	}
	
	state.vy = state.uy + (-9.8 * state.time);
	state.sx = (state.ux * state.time);
	state.sy = (state.uy * state.time) 
		+ (-4.9 * state.time * state.time);
		
	circle.attr("cx", state.sx * state.scale);
	circle.attr("cy", size - ((state.startHeight + state.sy) * state.scale));
	
	var tCircle = paper.circle(0, 0, 2);
	tCircle.attr("cx", state.sx * state.scale);
	tCircle.attr("cy", size - ((state.startHeight + state.sy) * state.scale));
	tCircle.attr("fill", "#000");
	pointList.push(tCircle);
	
	setData();
	
	state.time = state.time + (1/fps);
	
}

function stopSimulation(){
	
	if(clearID){
		clearInterval(clearID);

	}
	
}

function cleanUp(){
	
	if(state){
		state = null;
	}
	
	if(clearID){
		clearInterval(clearID);
		clearID = null;
	}
	
	if(line){
		line.remove();
		line = null;
	}
	
	if(pointList){
		for(var i = 0; i < pointList.length; i++){
			pointList[i].remove();
		}
		pointList = [];
	}

	if(circle){
		circle.remove();
		circle = null;
	}
	
}
	
function getScale(){
	
	if(state.projectileAngle == 0){
			state.scale = 1;
	}else if(state.range > state.maxHeight){
			state.scale = size / state.range;
	}else{
			state.scale = size / state.maxHeight;
	}

}

function getScaleOffGround(){
	
	if(state.projectileAngle == 0){
		if(state.range > state.startHeight){
			state.scale = size / state.range;
		}else{
			state.scale = size / state.startHeight;
		}
	}else if(state.range > (state.maxHeight + state.startHeight)){
		state.scale = size / state.range;
	}else if(state.maxHeight > state.startHeight){
		state.scale = size / state.maxHeight;
	}else{
		state.scale = size / (state.startHeight + state.maxHeight);
	}
}

function getScaleIncline(){
	
	if(state.projectileAngle == 0){
		state.scale = 1;
	}else if(state.maxHeight > state.range){
			
		var tempRange = (state.ux * (state.tof / 2)) 
			+ (-4.9 
			* Math.sin(state.inclineAngle * (Math.PI / 180)) 
			* ((state.tof / 2) * (state.tof / 2))
		);
		
		var y = 
			((tempRange) 
			* Math.sin(state.inclineAngle * (Math.PI / 180))) 
			+ (state.maxHeight 
			* Math.cos(state.inclineAngle * (Math.PI / 180))
		);
		
		state.scale = size / y;
		
	}else{
		state.scale = size / state.range;
	}
	
}

function inclineChecked(){
	document.getElementById("offGround").checked = false;
}

function offgroundChecked(){
	document.getElementById("isIncline").checked = false;
}

function setData(){
	
	document.getElementById("ux").innerHTML = "Initial x velocity: " + state.ux.toFixed(3) + "m/s";
	document.getElementById("uy").innerHTML = "Initial y velocity: " + state.uy.toFixed(3) + "m/s";
	document.getElementById("vx").innerHTML = "Current x velocity: " + state.vx.toFixed(3) + "m/s";
	document.getElementById("vy").innerHTML = "Current y velocity: " + state.vy.toFixed(3) + "m/s";
	document.getElementById("sx").innerHTML = "Current x position: " + state.sx.toFixed(3) + "m";
	document.getElementById("sy").innerHTML = "Current y position: " + state.sy.toFixed(3) + "m";
	document.getElementById("tof").innerHTML = 
		"Time of flight: " + state.tof.toFixed(3) + "s";
	document.getElementById("range").innerHTML = 
		"Max range: " + state.range.toFixed(3) + "m";
	document.getElementById("height").innerHTML = 
		"Max height: " + state.maxHeight.toFixed(3) + "m";
	document.getElementById("scale").innerHTML = 
		"Scale: 1 metre = " + state.scale.toFixed(3) + " pixels";
		
		
		
}

function clearInput(){
	
	document.getElementById("u").value = "";
	document.getElementById("angle").value = "";
	document.getElementById("isIncline").checked = false;
	document.getElementById("inclineAngle").value = "";
	document.getElementById("offGround").checked = false;
	document.getElementById("startHeight").value = "";
	
	/*
	for non HTML5 browsers this is needed
	to display placeholder text again
	*/
	Placeholders.enable();
	
}

function showHelp(){
	var alertMessage =
	"The projectile is launched at a given speed at a given angle α to the ground.\n\n"
	+ "When incline plane is checked, the projectile is launched at an angle α relative to an inclined plane of angle Θ to the ground.\n\n"
	+ "When off ground is checked the projectile is launched from a starting height above the ground.\n\n"
	+ "Incline plane and off ground cannot be selected at the same.\n";
	
	alert(alertMessage);
}
