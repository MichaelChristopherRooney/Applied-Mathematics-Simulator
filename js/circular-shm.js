var size = 600;
var oldSize;
var rLine;
var waterBackground;
var circle1;
var paper;
var clearID;
var fps = 60;
var state;
var pointList = [];
var backgroundRectangle;
var oldScale;
var oldSize;

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
	
		
	var x;
	oldSize = size;
	oldScale;
	
	if(w > h){
		size = w - 250 - 10 - 165;
	}else{
		size = h - 80 - 250 - 10 - 165;
	}	
	
	if(state){
		
		console.log("hi?");
		
		if(state.scale){
			oldScale = state.scale;
			x = oldSize / state.scale;
			state.scale = size / x;
			document.getElementById("scale").innerHTML 
			= "Scale: 1 metre = " + state.scale.toFixed(3) + " pixels";
		}
		
		if(state.type == "horizontal"){
			rescaleHorizontal();
		}else if(state.type == "basic"){
			rescaleBasic();
		}
		
	}
	
	if(w < 1024){
		document.getElementById("navbar").style.display = "none";
		document.getElementById("navselect").style.display = "block";
		document.getElementById("navselect").style.width = (w - 20) + "px";
	}else{
		document.getElementById("navbar").style.display = "block";
		document.getElementById("navselect").style.display = "none";
	}
	
	paper.setSize(size, size);
	backgroundRectangle.attr("height", size);
	backgroundRectangle.attr("width", size);
	
	document.getElementById("graphics_panel").style.width = size + "px";
	document.getElementById("graphics_panel").style.height = size + "px";
	document.getElementById("graphics_panel").style.left = "165px";
	document.getElementById("info_pane").style.left = (size + 10 + 165) + "px";
	document.getElementById("navbar").style.width = (w - 16) + "px";
	
}

function rescaleHorizontal(){
	
	var x = state.radius * Math.cos(state.angleR);
	var y = state.radius * Math.sin(state.angleR);
	
	var centre = size / 2;
	circle1.attr("cx", (x * state.scale) + centre);
	circle1.attr("cy", (y * state.scale) + centre);
	
	if(rLine){
		rLine.remove();
		rLine = null;
	}
	
	rLine = paper.path("M" + centre + " " + centre + 
		"L" + circle1.attr("cx")
		+ " " + circle1.attr("cy")
	);
	
}

function rescaleBasic(){
	
	circle1.attr("cx", (state.x * state.scale) + (size / 2))
	circle1.attr("cy", (size / 2))
	
}

/*
this holds the state at the moment the run button is pressed
*/
function stateObject(){
	this.radius;
	this.vr = 0;
	this.mass = 0;
	this.force = 0;
	this.vm = 0;
	this.angleR = 0;
	this.angleD = 0;
	this.amplitude = 0;
	this.type = 0;
	this.time = 0;
	this.maxA = 0;
	this.maxV = 0;
	this.a = 0;
	this.v = 0;
	this.x = 0;
	this.tension = 0;
	this.initialV = 0;
}

/*
when the "Run simulation" button is pressed
*/
function run(){

	cleanUp();
	
	state = new stateObject();
	
	var select = document.getElementById("typeSelect");
	var type = select[select.selectedIndex].id;
	
	if(type == "horizontal"){
		runHorizontal();
	}else if(type == "basic"){
		runBasic();
	}

}

function runHorizontal(){
	
	state.type = "horizontal";
		
	if(!parseInputHorizontal()){
		return false;
	}
		
	getValuesHorizontal();
	getScaleHorizontal();
	setDataHorizontal();
	
	circle1 = paper.circle(-10, -10, 10);
	circle1.attr("fill", "#f00");
	circle1.attr("stroke", "#000");
	
	clearID = setInterval(simulateStepHorizontal, (1/fps) * 1000);
	
}

function parseInputHorizontal(){

	state.radius = parseFloat(document.getElementById("horizontal-r").value);
	state.mass = parseFloat(document.getElementById("horizontal-m").value);
	state.vr = parseFloat(document.getElementById("horizontal-vr").value);
	
	var alertMessage = "";
	
	if(isNaN(state.radius) || state.radius <= 0 || (state.radius == "" && state.radius != 0)){
		alertMessage += "Radius must be a number > 0\n";
	}
	
	if(isNaN(state.mass) || state.mass <= 0 || (state.mass == "" && state.mass != 0)){
		alertMessage += "Mass must be a number > 0\n";
	}
	
	if(isNaN(state.vr) || state.vr <= 0 || (state.vr == "" && state.vr != 0)){
		alertMessage += "Angular velocity must be a number > 0\n";
	}
	
	if(alertMessage != ""){
		alert(alertMessage);
		return false;
	}
	
	return true;
}

function getValuesHorizontal(){
	
	state.force = state.mass * state.vr * state.vr * state.radius;
	state.vm = state.vr * state.radius;
	
}

function getScaleHorizontal(){
	
	state.scale = (size / (state.radius));
	state.scale = state.scale / 2.5;
	
}

function setDataHorizontal(){
	
	document.getElementById("horizontal-info").style.display = "block";
	document.getElementById("basic-info").style.display = "none";
	//hide others
	
	document.getElementById("horizontal-force-value").innerHTML 
		= "Force: " + state.force.toFixed(3) + "N";
		
	document.getElementById("horizontal-radius-value").innerHTML 
		= "Radius: " + state.radius.toFixed(3) + "m";
		
	document.getElementById("horizontal-mass-value").innerHTML 
		= "Mass: " + state.mass.toFixed(3) + "kg";
		
	document.getElementById("horizontal-vr-value").innerHTML 
		= "Angular velocity: " + state.vr.toFixed(3) + "rad/s";
		
	document.getElementById("horizontal-vm-value").innerHTML 
		= "Velocity: " + state.vm.toFixed(3) + "m/s";
		
	document.getElementById("scale").innerHTML = 
		"Scale: 1 metre = " + state.scale.toFixed(3) + " pixels";
	
}

function simulateStepHorizontal(){
	
	
	if(state.angleD > 360){
		state.angleD = state.angleD - 360;
		state.angleR = state.angleD * (Math.PI / 180);
	}
	
	var x = state.radius * Math.cos(state.angleR);
	var y = state.radius * Math.sin(state.angleR);
	
	var x1 = 
	(x * Math.cos(90 * (Math.PI / 180))) 
	- (y * Math.sin(90 * (Math.PI / 180)));
			
	var y1 = 
	(x * Math.sin(90 * (Math.PI / 180))) 
	+ (y * Math.cos(90 * (Math.PI / 180)));
	
	var centre = size / 2;
	circle1.attr("cx", (x1 * state.scale) + centre);
	circle1.attr("cy", (y1 * state.scale) + centre);
	
	if(rLine){
		rLine.remove();
		rLine = null;
	}
	
	rLine = paper.path("M" + centre + " " + centre + 
		"L" + circle1.attr("cx")
		+ " " + circle1.attr("cy")
	);
	
	state.angleR = state.angleR + (state.vr * (1/fps));
	state.angleD = state.angleR * (180 / Math.PI);
	
	document.getElementById("time").innerHTML = "Time: " + state.time.toFixed(3) + "s";
	
	state.time = state.time + (1/fps);
	
}

function runBasic(){
	
	state.type = "basic";
		
	if(!parseInputBasic()){
		return false;
	}
	
	getValuesBasic();
	getScaleBasic();
	setDataBasic();

	circle1 = paper.circle(-10, -10, 10);
	circle1.attr("fill", "#f00");
	circle1.attr("stroke", "#000");
	
	clearID = setInterval(simulateStepBasic, (1/fps) * 1000);
	
}

function parseInputBasic(){
	
	alertMessage = "";
	
	state.vr = parseFloat(document.getElementById("basic-vr").value);
	state.amplitude = parseFloat(document.getElementById("basic-a").value);
	
	if(isNaN(state.vr) || state.vr <= 0 || state.vr == ""){
		alertMessage +=
		"Angular velocity must be a number > 0\n";
	}
	
	if(isNaN(state.amplitude) || state.amplitude <= 0 || state.amplitude == ""){
		alertMessage +=
		"Amplitude must be a number > 0\n";
	}

	if(alertMessage){
		alert(alertMessage);
		return false;
	}
	
	return true;
	
}

function getValuesBasic(){
	
	state.maxV = state.vr * state.amplitude;
	state.maxA = state.vr * state.vr * state.amplitude;

}

function getScaleBasic(){
	
	state.scale = size / state.amplitude / 2;
	
}

function setDataBasic(){
	
	document.getElementById("horizontal-info").style.display = "none";
	document.getElementById("basic-info").style.display = "block";
	//hide others
	
	document.getElementById("basic-amplitude-value").innerHTML 
		= "Amplitude: " + state.amplitude.toFixed(3) + "m";
		
	document.getElementById("basic-vr-value").innerHTML 
		= "Angular velocity: " + state.vr.toFixed(3) + "rad/s";
		
	document.getElementById("basic-maxa-value").innerHTML 
		= "Max acceleration: " + state.maxA.toFixed(3) + "m/s/s";
		
	document.getElementById("basic-maxv-value").innerHTML 
		= "Max velocity: " + state.maxV.toFixed(3) + "m/s";
		
	document.getElementById("basic-cura-value").innerHTML 
		= "Acceleration: " + state.a.toFixed(3) + "m/s/s";
		
	document.getElementById("basic-curv-value").innerHTML 
		= "Velocity: " + state.v.toFixed(3) + "m/s";
		
	document.getElementById("basic-curx-value").innerHTML 
		= "Displacement: " + state.x.toFixed(3) + "m";
		
	document.getElementById("scale").innerHTML = 
		"Scale: 1 metre = " + state.scale.toFixed(3) + " pixels";
	
	
}

function simulateStepBasic(){
	
	state.x = state.amplitude * Math.sin(state.vr * state.time);
	
	state.a = (-1) * state.vr * state.vr * state.x;
	state.v = Math.sqrt(
		state.vr * state.vr * (
			(state.amplitude * state.amplitude)
			- (state.x * state.x)
		)
	);
	
	document.getElementById("basic-cura-value").innerHTML 
		= "Acceleration: " + state.a.toFixed(3) + "m/s/s";
		
	document.getElementById("basic-curv-value").innerHTML 
		= "Velocity: " + state.v.toFixed(3) + "m/s";
		
	document.getElementById("basic-curx-value").innerHTML 
		= "Displacement: " + state.x.toFixed(3) + "m";
	
	circle1.attr("cx", (state.x * state.scale) + (size / 2))
	circle1.attr("cy", (size / 2))
	
	if(rLine){
		rLine.remove();
		rLine = null;
	}
	
	rLine = paper.path("M" + (size / 2) + " " + 0 + 
		"L" + (size / 2)
		+ " " + size
	);
	
	state.time += (1 / fps);
	
}

function cleanUp(){
	
	if(clearID){
		clearInterval(clearID);
		clearID = null;
	}
	
	if(state){
		state = null;
	}
	
	if(circle1){
		circle1.remove();
		circle1 = null;
	}
	
	if(rLine){
		rLine.remove();
		rLine = null;
	}
	
}

function typeChange(){
	
	var select = document.getElementById("typeSelect");
	var type = select[select.selectedIndex].id;
	
	if(type == "horizontal"){
		document.getElementById("horizontal-div").style.display = "block";
		document.getElementById("basic-div").style.display = "none";
	}else if(type == "basic"){
		document.getElementById("horizontal-div").style.display = "none";
		document.getElementById("basic-div").style.display = "block";
	}
	
}

function clearInput(){
	
	document.getElementById("horizontal-r").value = "";
	document.getElementById("horizontal-m").value = "";
	document.getElementById("horizontal-vr").value = "";
	
	document.getElementById("typeSelect").selectedIndex = 0;
	typeChange();
	
	/*
	for non HTML5 browsers this is needed
	to display placeholder text again
	*/
	Placeholders.enable();
	
}

function stopSimulation(){
	
	if(clearID){
		clearInterval(clearID);
	}
	
}

function showHelp(){
	var alertMessage =
	"In horizontal circle the user needs to enter:\n"
	+ "The radius of the circle\n" 
	+ "The mass of the object\n"
	+ "The angular velocity (in radians)\n\n";
	
	alert(alertMessage);
}
