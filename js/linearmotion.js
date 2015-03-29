var size = 600;
var circle;
var paper;
var clearID;
var fps = 60;
var scale;
var secondEnabled = false;
var state;

$(document).ready(function(){

	paper = Raphael(160, 0, size, size);

	var backgroundRectangle = paper.rect(0, 0, size, size);
	backgroundRectangle.attr("fill", "#bdbdbd");
	backgroundRectangle.attr("stroke", "#000");

	circle = paper.circle(0, size, 10);
	circle.attr("fill", "#f00");
	circle.attr("stroke", "#fff");

});

/*
when the object selected in the check box changes this function runs to
change the displayed fields
*/
function swapObjects(){

	var first = document.getElementById("first");
	var second = document.getElementById("second");

	if(first.style.display != "none" && secondEnabled){

		first.style.display = "none";
		second.style.display = "block";

	}else{

		first.style.display = "block";
		second.style.display = "none";

	}
}

/*
this holds the state at the moment the run button is pressed
*/
function stateObject(){
	this.u1 = 0;
	this.a1 = 0;
	this.s1 = 0;
	this.u2 = 0;
	this.a2 = 0;
	this.s2 = 0;
	this.secondEnabled = false;
	this.terminateSelect = 0;
	this.terminateObjectSelect = 0;
	this.terminateObjectValue = 0;
	this.timeToTerminate = 0;
}

/*
when the "Run simulation" button is pressed
*/
function run(){

	parseInput();
	console.log("Input parsed");
	
	if(!verifyInput()){
		return;
	}
	console.log("Input verified");
	
	if(!determineTerminate()){
		return;
	}

	clearID = setInterval(simulateStep(), (1/fps) * 1000);

}

/*
determines if the program will terminate given the input
*/
function determineTerminate(){
	
	console.log("Selected object: " + state.terminateSelect);

	
	if(state.terminateSelect == 0){ // velocity
		return determineTerminateVelocity();
	}else if(state.terminateSelect == 1){ // displacement
		return determineTerminateDisplacement();
	}else if(state.terminateSelect == 2){ // time
		return true;
	}else if(state.terminateSelect == 3){ // objects equal
		return determineTerminateEqual();
	}
}

/*
determine if the selected object will ever reach the terminating velocity value
*/
function determineTerminateVelocity(){
	
	console.log("Determining if velocity will reach given value");
	
	var u, a, s;
	
	if(state.terminateObjectSelect == 0){
		u = state.u1;
		a = state.a1;
		s = state.s1;
	}else{
		u = state.u2;
		a = state.a2;
		s = state.s2;
	}
	
	console.log("u: " + u + ", a: " + a + ", s: " + s);
	
	// using equation "v = u + at" to get t
	var t = (state.terminateObjectValue - u) / a;
	
	console.log("t: " + t);
	
	if(t < 0){
		alert("Selected object will never reach given velocity");
		return false;
	}
	
	state.timeToTerminate = t;
	
	return true;
}

function determineTerminateDisplacement(){
	
	console.log("Determining if displacement will reach given value");
	
	var u, a, s;
	
	if(state.terminateObjectSelect == 0){
		u = state.u1;
		a = state.a1;
		s = state.s1;
	}else{
		u = state.u2;
		a = state.a2;
		s = state.s2;
	}
	
	console.log("u: " + u + ", a: " + a + ", s: " + s);
	
	// check that part under the square root will not be negative
	var t = (2 * u * u) + (8 * a * state.terminateObjectValue);
	
	if(t < 0){
		alert("Selected object will never reach given displacement");
		return false;
	}
	
	// using equation "s = ut + (0.5 * a * t * t)" to get t
	t = ((-2 * u) 
		+ Math.sqrt((4 * u * u) + (8 * a * state.terminateObjectValue))
		) / (2 * a);
	/*	
	TO DO: 
	Could possibly be an issue if with using +- in the quadratic formula?
	*/
	
	state.timeToTerminate = t;
	
	return true;
}

function determineTerminateEqual(){
	
	return true;
}

/*
gets values for the next step in the simulation
*/
function simulateStep(){

}


function parseInput(){

	if(state){
		state = null;
	}
	
	state = new stateObject();
	
	state.u1 = parseInt(document.getElementById("u1").value);
	state.a1 = parseInt(document.getElementById("a1").value);
	state.s1 = parseInt(document.getElementById("s1").value);
	state.u2 = parseInt(document.getElementById("u2").value);
	state.a2 = parseInt(document.getElementById("a2").value);
	state.s2 = parseInt(document.getElementById("s2").value);
	state.secondEnabled = secondEnabled;
	state.terminateSelect 
		= document.getElementById("terminateSelect").selectedIndex;
	state.terminateObjectSelect 
		= document.getElementById("terminateObjectSelect").selectedIndex;
	state.terminateObjectValue = parseInt(document.getElementById("terminateObjectValue").value);

}

/*
check that all input is correctly formed
if errors are found format an error alert saying where the errors are
*/
function verifyInput(){

	var alertMessage = "";

	if(isNaN(state.u1) || (state.u1 != 0 && state.u1 == "")){
		alertMessage +=
		"First object:\n\tInitial speed must be a number\n";
	}

	if(isNaN(state.a1) || (state.a1 != 0 && state.a1 == "")){
		alertMessage += "\tAcceleration must be a number\n";
	}

	
	if(isNaN(state.s1) || (state.s1 != 0 && state.s1 == "")){
		alertMessage += "\tInitial position must be a number\n";
	}

	
	/* if the "enable second" button was pressed */
	if(state.secondEnabled){

		if(isNaN(state.u2) || (state.u2 != 0 && state.u2 == "")){
			alertMessage +=
			"\nSecond object:\n\tInitial speed must be a number\n";
		}

		if(isNaN(state.a2) || (state.a2 != 0 && state.a2 == "")){
			alertMessage += "\tAcceleration must be a number\n";
		}

		if(isNaN(state.s2) || (state.s2 != 0 && state.s2 == "")){
			alertMessage +=
			"\tInitial position must be a number\n";
		}

	}
	
	/*
	TO DO: Verify termination condition input
	*/

	if(alertMessage != ""){
		alert(alertMessage);
		return false;
	}
	
	return true;

}

function terminateChange(){
	
	var x = document.getElementById("terminateSelect").selectedIndex;
	
	var first = document.getElementById("objectTerminate");
	var second = document.getElementById("timeTerminate");

	if(x == 2){

		first.style.display = "none";
		second.style.display = "block";

	}else{

		first.style.display = "block";
		second.style.display = "none";

	}
	
}
function enableSecond(){
	
	if(!secondEnabled){
		
		secondEnabled = true;
		document.getElementById("enableSecond").innerHTML 
			= "Disable second";
		
		var x = document.getElementById("dropdown");
		var option = document.createElement("option");
		option.text = "Second object";
		x.add(option);
		
		var x = document.getElementById("terminateObjectSelect");
		var option = document.createElement("option");
		option.text = "Second object";
		x.add(option);
		
	}else{
		
		secondEnabled = false;
		document.getElementById("enableSecond").innerHTML
			= "Enable second";
		
		var x = document.getElementById("dropdown");
		x.remove(1);
		
		var x = document.getElementById("terminateObjectSelect");
		x.remove(1);
		
		swapObjects();
		
	}
	

}

function clearInput(){

	if(secondEnabled){
		
		document.getElementById("dropdown").selectedIndex = 0;
		document.getElementById("dropdown").remove(1);
		
		var x = document.getElementById("terminateObjectSelect");
		x.remove(1);
		
		secondEnabled = false;
		document.getElementById("enableSecond").innerHTML
			= "Enable second";
		
		swapObjects();
		
	}
	
	document.getElementById("u").value = "";
	document.getElementById("a").value = "";
	document.getElementById("s").value = "";

	document.getElementById("u1").value = "";
	document.getElementById("a1").value = "";
	document.getElementById("s1").value = "";
	
	document.getElementById("terminateSelect").selectedIndex = 0;
	document.getElementById("objectTerminate").style.display = "block";
	document.getElementById("timeTerminate").style.display = "none";
	
	document.getElementById("terminateObjectValue").value = "";
	document.getElementById("terminateTimeValue").value = "";
	

}