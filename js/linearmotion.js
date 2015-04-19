var size = 600;
var oldSize;
var graphSize = 225;
var graphLine;
var graphLine2;
var baseLine;
var circle1;
var circle2;
var paper;
var graph;
var clearID;
var fps = 60;
var state;
var pointList = [];
var backgroundRectangle;
var graphBackground;

$(document).ready(function(){
	
	paper = Raphael(document.getElementById("graphics_panel"), size, size);

	backgroundRectangle = paper.rect(0, 0, size, size);
	backgroundRectangle.attr("fill", "#bdbdbd");
	backgroundRectangle.attr("stroke", "#000");
	
	graph = Raphael(document.getElementById("graph_panel"), graphSize, graphSize);
	graphBackground = graph.rect(0, 0, graphSize, graphSize);
	graphBackground.attr("fill", "#bdbdbd");
	graphBackground.attr("stroke", "#000");
	
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
	var oldSize = size;
	var oldScale;
		
	size = w - 250 - 10 - 165;
	
	
	if(size + 80 > h){
		size = h - 80;
	}
	
	if(w < 1024){
		document.getElementById("navbar").style.display = "none";
		document.getElementById("navselect").style.display = "block";
		document.getElementById("navselect").style.width = w - 20;
	}else{
		document.getElementById("navbar").style.display = "block";
		document.getElementById("navselect").style.display = "none";
	}
	
		
	if(state){
		
		if(state.scale){
			oldScale = state.scale;
			x = oldSize / state.scale;
			state.scale = size / x;
			
			document.getElementById("scale").innerHTML = 
			"Scale: 1 metre = " + state.scale.toFixed(3) + " pixels";
		}
		
		
	}

	
	if(circle1){
		circle1.attr("cx", (circle1.attr("cx") / oldScale) * state.scale);
	}

	if(circle2){
		circle2.attr("cx", (circle2.attr("cx") / oldScale) * state.scale);
	}
	
	if(pointList){
		for(var i = 0; i < pointList.length; i++){
			pointList[i].attr("cx", (pointList[i].attr("cx") / oldScale) * state.scale);
		}
	}
	
	paper.setSize(size, size);
	backgroundRectangle.attr("height", size);
	backgroundRectangle.attr("width", size);
	
	document.getElementById("graphics_panel").style.width = size;
	document.getElementById("graphics_panel").style.height = size;
	document.getElementById("graphics_panel").style.left = "165px";
	
	document.getElementById("info_pane").style.left = (size + 10 + 165) + "px";
	document.getElementById("graph_panel").style.left = (size + 10 + 165) + "px";
	document.getElementById("graphText").style.left = (size + 10 + 165) + "px";
			
}

/*
this holds the state at the moment the run button is pressed
*/
function stateObject(){
	this.u1 = 0;
	this.v1 = 0;
	this.a1 = 0;
	this.s1 = 0;
	this.u2 = 0;
	this.v2 = 0;
	this.a2 = 0;
	this.s2 = 0;
	this.currentTime = 0;
	this.endTime = 0;
	this.delay = 0;
	this.graphScale = 0;
	this.startV = 0;
	this.priorX = 0;
	this.priorT = 0;
	this.startV2 = 0;
	this.priorX2 = 0;
	this.priorT2 = 0;
	this.startS = 0;
	this.ticks = 0;
}

/*
when the "Run simulation" button is pressed
*/
function run(){

	if(clearID){
		clearInterval(clearID);
		clearID = null;
	}
	
	if(graphLine){
		graphLine.remove();
	}
	
	if(graphLine2){
		graphLine2.remove();
		
	}
	
	if(baseLine){
		baseLine.remove();
		baseLine = false;
	}
	
	if(circle1){
		circle1.remove();
		circle1 = null;
	}
	
	if(circle2){
		circle2.remove();
		circle2 = null;
	}
	
	if(pointList){
		for(var i = 0; i < pointList.length; i++){
			pointList[i].remove();
		}
		pointList = [];
	}
	
	state = new stateObject();
		
	var select = document.getElementById("typeSelect");
	state.type = select[select.selectedIndex].id;
	
	if(state.type == "reachSpeed"){
		
		circle1 = paper.circle(-10, -10, 10);
		circle1.attr("fill", "#f00");
		circle1.attr("stroke", "#000");
	
		if(!runReach()){
			return false;
		}
		
	}else if(state.type == "slowToZero"){
		
		circle1 = paper.circle(-10, -10, 10);
		circle1.attr("fill", "#f00");
		circle1.attr("stroke", "#000");
	
		if(!runSlow()){
			return false;
		}
		
	}else if(state.type == "catchup"){
		
		circle1 = paper.circle(-10, -10, 10);
		circle1.attr("fill", "#f00");
		circle1.attr("stroke", "#000");
		
		circle2 = paper.circle(-10, -10, 10);
		circle2.attr("fill", "#f00");
		circle2.attr("stroke", "#000");
		
		if(!runCatchup()){
			return false;
		}
		
	}

}

function runCatchup(){
	
	if(!parseInputCatchup()){
		return false;
	}
	
	if(!getCatchupValues()){
		return false;
	}
	
	setInfo();
	
	state.priorV = state.u1;
	state.priorX = state.s1;
	
	state.priorV2 = state.u2;
	state.priorX2 = state.s2;
	
	state.priorT = 0;
	
	clearID = setInterval(simulateStepCatchup, (1/fps) * 1000);
	
}

function parseInputCatchup(){
	
	/* parse all relevant input */
	//state.u1 = parseFloat(document.getElementById("catch-u1").value);
	state.a1 = parseFloat(document.getElementById("catch-a1").value);
	state.u2 = parseFloat(document.getElementById("catch-u2").value);
	state.a2 = parseFloat(document.getElementById("catch-a2").value);
	state.delay = parseFloat(document.getElementById("delay").value);
	
	/* now verify the input */
	var alertMessage = "";
	
	/*
	if(isNaN(state.u1) || state.u1 <= 0 || (state.u1 == "" && state.u1 != 0)){
		alertMessage += "Initial velocity (u1) must be a number > 0\n";
	}
	*/
	if(isNaN(state.a1) || state.a1 < 0 || (state.a1 == "" && state.a1 != 0)){
		alertMessage += "Acceleration (a1) must be a number ≥ 0\n";
	}
	
	if(isNaN(state.u2) || state.u2 < 0 || (state.u2 == "" && state.u2 != 0)){
		alertMessage += "Initial speed (u2) must be a number ≥ 0\n";
	}
	
	if(isNaN(state.a2) || state.a2 < 0 || (state.a2 == "" && state.a2 != 0)){
		alertMessage += "Acceleration (a2) must be a number ≥ 0\n";
	}
	
	if(isNaN(state.delay) || state.delay <= 0 || state.delay == ""){
		alertMessage += "Delay must be a number > 0\n";
	}
	
	if(alertMessage != ""){
		alert(alertMessage);
		return false;
	}
	
	return true;
	
}

function getCatchupValues(){

	var a = (0.5 * state.a2) - (0.5 * state.a1);
	var b = state.u2 - (state.a2 * state.delay);
	var c = (0.5 * state.a2 * state.delay * state.delay) 
		- (state.u2 * state.delay);

	state.endTime = (-b + Math.sqrt((b * b) - (4 * a * c))) / (2 * a);
	
	if(isNaN(state.endTime)){
		alert("Car two will never overtake car one");
		return false;
	}
	
	state.scale = size / (0.5 * state.a1 * state.endTime * state.endTime);
	state.graphScale = graphSize / state.endTime;
	
	var tT = graphSize / state.endTime;
	var tV1 = graphSize / (state.u1 + (state.a1 * (state.endTime)));
	var tV2 = graphSize / (state.u2 + (state.a2 * (state.endTime - state.delay)));
	
	if(tT < tV1 && tT < tV2){
		state.graphScale = tT;
	}else if(tV1 < tV2){
		state.graphScale = tV1;
	}else{
		state.graphScale = tV2;
	}
	
	return true;
	
}

function simulateStepCatchup(){
	
	if(state.currentTime > state.endTime){
		clearInterval(clearID);
		state.currentTime = state.endTime;
	}
	
	state.v1 = state.u1 + (state.a1 * state.currentTime);
	state.s1 = (state.u1 * state.currentTime)
		+ (0.5 * state.a1 * state.currentTime * state.currentTime);
	
	if(state.currentTime > state.delay){
		
		state.v2 = state.u2 + (state.a2 * (state.currentTime - state.delay));
		state.s2 = (state.u2 * (state.currentTime - state.delay))
		+ (0.5 * state.a2 * (state.currentTime - state.delay) * (state.currentTime - state.delay));
		
		circle2.attr("cx", state.s2 * state.scale);
		circle2.attr("cy", 300);
		
		if(state.ticks % 10 == 0){
			var tCircle1 = paper.circle(0, 0, 2);
			tCircle1.attr("cx", state.s2 * state.scale);
			tCircle1.attr("cy", 300);
			tCircle1.attr("fill", "#000");
			pointList.push(tCircle1);
		}
		
	}
	
	if(state.ticks % 10 == 0){
		tCircle2 = paper.circle(0, 0, 2);
		tCircle2.attr("cx", state.s1 * state.scale);
		tCircle2.attr("cy", 200);
		tCircle2.attr("fill", "#000");
		pointList.push(tCircle2);
	}
	
	circle1.attr("cx", state.s1 * state.scale);
	circle1.attr("cy", 200);
	
	document.getElementById("cv1").innerHTML = "Current velocity: " + state.v1.toFixed(3) + "m/s";
	document.getElementById("cs1").innerHTML = "Current position: " + state.s1.toFixed(3) + "m";
	document.getElementById("time").innerHTML = "Current time: " + state.currentTime.toFixed(3) + "s";
	
	document.getElementById("cv2").innerHTML = "Current velocity: " + state.v2.toFixed(3) + "m/s";
	document.getElementById("cs2").innerHTML = "Current position: " + state.s2.toFixed(3) + "m";
	
	state.currentTime += (1 / fps);
	state.ticks++;
	
	if(graphLine){
		graphLine.remove();
		graphLine = false;
	}
	
	if(graphLine2){
		graphLine2.remove();
		graphLine2 = false;
	}
	
	var graphString = 
		"M" + (0) 
		+ " " + (graphSize - (state.startV * state.graphScale)) 
		+ "L" +  (state.currentTime * state.graphScale) 
		+ " " + (graphSize - (state.v1 * state.graphScale));
	graphLine = graph.path(graphString);
	
	if(state.currentTime > state.delay){
		
		if(!baseLine){
			graphString = 
			"M" + (state.delay * state.graphScale)
			+ " " + graphSize
			+ "L" +  (state.delay * state.graphScale) 
			+ " " + (graphSize - (state.u2 * state.graphScale));
			baseLine = graph.path(graphString);
		}

		graphString = 
		"M" + (state.delay * state.graphScale)
		+ " " + (graphSize - (state.u2 * state.graphScale))
		+ "L" +  (state.currentTime * state.graphScale) 
		+ " " + (graphSize - (state.v2 * state.graphScale));
		graphLine2 = graph.path(graphString);
	}
	
	state.priorV = state.v1;
	state.priorX = state.s1;
	
	state.priorV2 = state.v2;
	state.priorX2 = state.s2;
	
	state.priorT = state.currentTime;
	
}

function runSlow(){
	
	if(!parseInputSlow()){
		return false;
	}
	
	if(!getSlowValues()){
		return false;
	}
	
	setInfo();
	
	state.priorV = state.u1;
	state.priorX = state.s1;
	state.priorT = 0;
	
	var graphString = 
		"M" + (0) + " " + (graphSize - (state.u1 * state.graphScale)) 
		+ "L" +  (graphSize) + " " + (graphSize - (state.u1 * state.graphScale));
	baseLine = graph.path(graphString);
	
	clearID = setInterval(simulateStepSlow, (1/fps) * 1000);
	
}

function parseInputSlow(){
	
	/* parse all relevant input */
	state.u1 = parseFloat(document.getElementById("slow-u1").value);
	state.a1 = parseFloat(document.getElementById("slow-a1").value);
	
	/* now verify the input */
	var alertMessage = "";
	
	if(isNaN(state.u1) || state.u1 <= 0 || (state.u1 == "" && state.u1 != 0)){
		alertMessage += "Initial velocity must be a number > 0\n";
	}
	
	if(isNaN(state.a1) || state.a1 >= 0 || (state.a1 == "" && state.a1 != 0)){
		alertMessage += "Acceleration must be a number < 0\n";
	}
	
	if(alertMessage != ""){
		alert(alertMessage);
		return false;
	}
	
	return true;
	
}

function getSlowValues(){
	
	/*
	v = u + at
	get t when v = 0
	*/
	state.endTime = (-state.u1) / state.a1;
	
	/* this error should never be entered, but just in case */
	if(state.endTime < 0){
		alert(
		"Zero velocity will never be reached with given values\n"
		);
		return false;
	}
	
	/* s = u*t + 0.5*a*t*t */
	state.s1 = (state.u1 * state.endTime)
		+ (0.5 * state.a1 * state.endTime * state.endTime);
		
	state.scale = size / state.s1;
	
	state.startV = state.u1;
	state.startS = state.s1;
	
	var tX = graphSize / state.endTime;
	var tY = graphSize / state.u1
	
	if(tX < tY){
		state.graphScale = tX;
	}else{
		state.graphScale = tY;
	}
	
	return true;
	
}

function simulateStepSlow(){
	
	if(state.currentTime > state.endTime){
		clearInterval(clearID);
		state.currentTime = state.endTime;
	}
	
	state.v1 = state.u1 + (state.a1 * state.currentTime);
	state.s1 = (state.u1 * state.currentTime)
		+ (0.5 * state.a1 * state.currentTime * state.currentTime);
	
	circle1.attr("cx", state.s1 * state.scale);
	circle1.attr("cy", 200);
	
	document.getElementById("cv1").innerHTML = "Current velocity: " + state.v1.toFixed(3) + "m/s";
	document.getElementById("cs1").innerHTML = "Current position: " + state.s1.toFixed(3) + "m";
	
	document.getElementById("time").innerHTML = "Current time: " + state.currentTime.toFixed(3) + "s";
	
	
	if(state.ticks % 10 == 0){
		var tCircle = paper.circle(0, 0, 2);
		tCircle.attr("cx", state.s1 * state.scale);
		tCircle.attr("cy", 200);
		tCircle.attr("fill", "#000");
		pointList.push(tCircle);
	}
	
	state.currentTime += (1 / fps);
	state.ticks++;
	
	if(graphLine){
		graphLine.remove();
		graphLine = false;
	}
	
	var graphString = 
		"M" + (0) + " " + (graphSize - (state.startV * state.graphScale)) 
		+ "L" +  (state.currentTime * state.graphScale) + " " + (graphSize - (state.v1 * state.graphScale));
	graphLine = graph.path(graphString);
	
	state.priorV = state.v1;
	state.priorX = state.s1;
	state.priorT = state.currentTime;
	
}

function runReach(){
	
	if(!parseInputReach()){
		return false;
	}
	
	if(!getReachValues()){
		return false;
	}
	
	setInfo();
	
	state.priorV = state.u1;
	state.priorX = state.s1;
	state.priorT = 0;
	
	var graphString = 
		"M" + (0) + " " + (graphSize - (state.u1 * state.graphScale)) 
		+ "L" +  (graphSize) + " " + (graphSize - (state.u1 * state.graphScale));
	baseLine = graph.path(graphString);
	
	clearID = setInterval(simulateStepReach, (1/fps) * 1000);
	
}

function parseInputReach(){
	
	/* parse all relevant input */
	state.u1 = parseFloat(document.getElementById("reach-u1").value);
	state.a1 = parseFloat(document.getElementById("reach-a1").value);
	state.v1 = parseFloat(document.getElementById("reach-v1").value);
	
	/* now verify the input */
	var alertMessage = "";
	
	if(isNaN(state.u1) || state.u1 < 0 || (state.u1 == "" && state.u1 != 0)){
		alertMessage += "Initial velocity must be a number ≥ 0\n";
	}
	
	if(isNaN(state.a1) || state.a1 < 0 || (state.a1 == "" && state.a1 != 0)){
		alertMessage += "Acceleration must be a number ≥ 0\n";
	}
	
	if(isNaN(state.v1) || state.v1 < 0 || state.v1 <= state.u1 || (state.v1 == "" && state.v1 != 0)){
		alertMessage += "Final velocity must be a number ≥ 0 and be > than initial velocity\n";
	}
	
	if(alertMessage != ""){
		alert(alertMessage);
		return false;
	}
	
	return true;
	
}

function getReachValues(){
	
	//v = u + at
	state.endTime = (state.v1 - state.u1) / state.a1;
	
	/* this error should never be entered, but just in case */
	if(state.endTime < 0){
		alert(
		"Final velocity will never be reached with given values\n"
		);
		return false;
	}
	
	/* s = u*t + 0.5*a*t*t */
	state.s1 = (state.u1 * state.endTime)
		+ (0.5 * state.a1 * state.endTime * state.endTime);
		
	state.scale = size / state.s1;
	
	state.startV = state.u1;
	state.startS = state.s1;
	
	var tX = graphSize / state.endTime;
	var tY = graphSize / state.v1
	
	if(tX < tY){
		state.graphScale = tX;
	}else{
		state.graphScale = tY;
	}
	
	return true;
	
}

function simulateStepReach(){
	
	if(state.currentTime > state.endTime){
		clearInterval(clearID);
		state.currentTime = state.endTime;
	}
	
	state.v1 = state.u1 + (state.a1 * state.currentTime);
	state.s1 = (state.u1 * state.currentTime)
		+ (0.5 * state.a1 * state.currentTime * state.currentTime);
	
	circle1.attr("cx", state.s1 * state.scale);
	circle1.attr("cy", 200);
	
	document.getElementById("cv1").innerHTML = "Current velocity: " + state.v1.toFixed(3) + "m/s";
	document.getElementById("cs1").innerHTML = "Current position: " + state.s1.toFixed(3) + "m";
	document.getElementById("time").innerHTML = "Current time: " + state.currentTime.toFixed(3) + "s";
	
	if(state.ticks % 10 == 0){
		var tCircle = paper.circle(0, 0, 2);
		tCircle.attr("cx", state.s1 * state.scale);
		tCircle.attr("cy", 200);
		tCircle.attr("fill", "#000");
		pointList.push(tCircle);
	}
	
	state.currentTime += (1 / fps);
	state.ticks++;
	
	if(graphLine){
		graphLine.remove();
		graphLine = false;
	}
	
	var graphString = 
		"M" + (0) + " " + (graphSize - (state.startV * state.graphScale)) 
		+ "L" +  (state.currentTime * state.graphScale) + " " + (graphSize - (state.v1 * state.graphScale));
	graphLine = graph.path(graphString);
	
	state.priorV = state.v1;
	state.priorX = state.s1;
	state.priorT = state.currentTime;
	
}

function setInfo(){
	
	document.getElementById("iu1").innerHTML = 
		"Initial speed: " + state.u1.toFixed(3) + "m/s";
	document.getElementById("ia1").innerHTML = 
		"Initial accleration: " + state.a1.toFixed(3) + "m/s²";
	document.getElementById("is1").innerHTML = 
		"Initial position: 0.000m";
	document.getElementById("cv1").innerHTML = 
		"Current velocity: " + state.v1.toFixed(3) + "m/s";
	document.getElementById("cs1").innerHTML = 
		"Current position: " + state.s1.toFixed(3) + "m";
		
	document.getElementById("iu2").innerHTML = 
		"Initial speed: " + state.u2.toFixed(3) + "m/s";
	document.getElementById("ia2").innerHTML = 
		"Initial accleration: " + state.a2.toFixed(3) + "m/s²";
	document.getElementById("is2").innerHTML = 
		"Initial position: 0.000m";
	document.getElementById("cv2").innerHTML = 
		"Current velocity: " + state.v2.toFixed(3) + "m/s";
	document.getElementById("cs2").innerHTML = 
		"Current position: " + state.s2.toFixed(3) + "m";
	
	
	document.getElementById("time").innerHTML = 
		"Time: " + state.currentTime.toFixed(3) + "s";
	document.getElementById("scale").innerHTML = 
		"Scale: 1 metre = " + state.scale.toFixed(3) + " pixels";
	
	
}


function typeChange(){
	
	var select = document.getElementById("typeSelect");
	var type = select[select.selectedIndex].id;
	
	if(type == "reachSpeed"){
		document.getElementById("reach").style.display = "block";
		document.getElementById("slow").style.display = "none";
		document.getElementById("catch").style.display = "none";
	}else if(type == "slowToZero"){
		document.getElementById("reach").style.display = "none";
		document.getElementById("slow").style.display = "block";
		document.getElementById("catch").style.display = "none";
	}else if(type == "catchup"){
		document.getElementById("reach").style.display = "none";
		document.getElementById("slow").style.display = "none";
		document.getElementById("catch").style.display = "block";
	}
}

function clearInput(){
	
	document.getElementById("reach-u1").value = "";
	document.getElementById("reach-a1").value = "";
	document.getElementById("reach-v1").value = "";
	
	document.getElementById("slow-u1").value = "";
	document.getElementById("slow-a1").value = "";
	
	document.getElementById("catch-a1").value = "";
	document.getElementById("catch-u2").value = "";
	document.getElementById("catch-a2").value = "";
	document.getElementById("delay").value = "";
	
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
	"Reach speed shows an object accelerating to a given speed.\n\n"
	+ "Slow to zero shows an object decelerating to zero.\n\n"
	+ "Catchup shows one object starting from zero and accelerating.\n" 
	+ "After a given time the second object starts from a given speed and accelerates.\n"
	+ "The simulation continues until they have caught up.\n";
	
	alert(alertMessage);
}
