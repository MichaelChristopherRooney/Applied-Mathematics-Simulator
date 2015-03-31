var size = 600;
var graphSize = 225;
var graphLine;
var baseLine;
var circle1;
var circle2;
var paper;
var graph;
var clearID;
var fps = 60;
var state;

$(document).ready(function(){

	paper = Raphael(160, 0, size, size);

	var backgroundRectangle = paper.rect(0, 0, size, size);
	backgroundRectangle.attr("fill", "#bdbdbd");
	backgroundRectangle.attr("stroke", "#000");
	
	graph = Raphael(770, 375, graphSize, graphSize);
	var graphBackground = graph.rect(0, 0, graphSize, graphSize);
	graphBackground.attr("fill", "#bdbdbd");
	graphBackground.attr("stroke", "#000");
	
	circle1 = paper.circle(-10, -10, 10);
	circle1.attr("fill", "#f00");
	circle1.attr("stroke", "#fff");
	
	circle2 = paper.circle(-10, -10, 10);
	circle2.attr("fill", "#f00");
	circle2.attr("stroke", "#fff");

});

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
	this.graphScale = 0;
	this.startV = 0;
	this.startS = 0;
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
	
	if(baseLine){
		baseLine.remove();
	}
	
	state = new stateObject();
		
	var select = document.getElementById("typeSelect");
	state.type = select[select.selectedIndex].id;
	
	if(state.type == "reachSpeed"){
		if(!runReach()){
			return false;
		}
	}else if(state.type == "slowToZero"){
		if(!runSlow()){
			return false;
		}
	}else if(state.type == "catchup"){
		if(!runCatchup()){
			return false;
		}
	}

}

function runSlow(){
	
	if(!parseInputSlow()){
		return false;
	}
	
	getSlowValues();
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
	var tY = graphSize / state.v1
	
	if(tX < tY){
		state.graphScale = tX;
	}else{
		state.graphScale = tY;
	}
	
}

function simulateStepSlow(){
	
	if(state.currentTime > state.endTime){
		console.log("Simulation done");
		clearInterval(clearID);
		state.currentTime = state.endTime;
	}
	
	state.v1 = state.u1 + (state.a1 * state.currentTime);
	state.s1 = (state.u1 * state.currentTime)
		+ (0.5 * state.a1 * state.currentTime * state.currentTime);
	
	circle1.attr("cx", state.s1 * state.scale);
	circle1.attr("cy", 200);
	
	document.getElementById("cv1").innerHTML = "Current velocity: " + state.v1.toFixed(3);
	document.getElementById("cs1").innerHTML = "Current position: " + state.s1.toFixed(3);
	document.getElementById("time").innerHTML = "Current time: " + state.currentTime.toFixed(3);
	
	state.currentTime += (1 / fps);
	
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
	
	getReachValues();
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
	
}

function simulateStepReach(){
	
	if(state.currentTime > state.endTime){
		console.log("Simulation done");
		clearInterval(clearID);
		state.currentTime = state.endTime;
	}
	
	state.v1 = state.u1 + (state.a1 * state.currentTime);
	state.s1 = (state.u1 * state.currentTime)
		+ (0.5 * state.a1 * state.currentTime * state.currentTime);
	
	circle1.attr("cx", state.s1 * state.scale);
	circle1.attr("cy", 200);
	
	document.getElementById("cv1").innerHTML = "Current velocity: " + state.v1.toFixed(3);
	document.getElementById("cs1").innerHTML = "Current position: " + state.s1.toFixed(3);
	document.getElementById("time").innerHTML = "Current time: " + state.currentTime.toFixed(3);
	
	state.currentTime += (1 / fps);
	
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
		"Initial speed: " + state.u1.toFixed(3);
	document.getElementById("ia1").innerHTML = 
		"Initial accleration: " + state.a1.toFixed(3);
	document.getElementById("is1").innerHTML = 
		"Initial position: " + state.s1.toFixed(3);
	document.getElementById("cv1").innerHTML = 
		"Current velocity: " + state.v1.toFixed(3);
	document.getElementById("cs1").innerHTML = 
		"Current position: " + state.s1.toFixed(3);
	
	document.getElementById("time").innerHTML = 
		"Time: " + state.currentTime.toFixed(3);
	document.getElementById("scale").innerHTML = 
		"Scale: 1 metre = " + state.scale.toFixed(3) + " pixels";
	
	if(state.type == "reachSpeed" || state.type == "slowToZero"){
		document.getElementById("graphText").innerHTML = 
			"Velocity vs time";
	}else if(state.type == "catchup"){
		
	}
	
	
}


function typeChange(){
	
	var select = document.getElementById("typeSelect");
	var type = select[select.selectedIndex].id;
	console.log(type);
	
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
	
}

function stopSimulation(){
	
}