var size = 600;
var circle;
var paper;
var clearID;
var fps = 60;
var secondEnabled = false;
var state;

$(document).ready(function(){

	paper = Raphael(160, 0, size, size);

	var backgroundRectangle = paper.rect(0, 0, size, size);
	backgroundRectangle.attr("fill", "#bdbdbd");
	backgroundRectangle.attr("stroke", "#000");

	circle = paper.circle(-10, -10, 10);
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
	this.v1 = 0;
	this.v2 = 0;
	this.secondEnabled = false;
	this.terminateSelect = 0;
	this.terminateObjectSelect = 0;
	this.terminateEqualSelect = 0;
	this.terminateValue = 0;
	this.timeToTerminate = 0;
	this.t1 = 0;
	this.t2 = 0;
	this.totalDistance = 0;
	this.scale = 0;
	this.offset = 0;
	this.time = 0;
	this.endPosition = 0;
	this.startPosition1 = 0;
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
	
	determineValues();

	getScale();
		
	document.getElementById("iu1").innerHTML = "Initial speed u1: " + state.u1.toFixed(3);
	document.getElementById("ia1").innerHTML = "Initial acceleration a1: " + state.a1.toFixed(3);
	document.getElementById("is1").innerHTML = "Initial position s1: " + state.s1.toFixed(3);
	document.getElementById("v1").innerHTML = "Current velocity v1: " + state.u1.toFixed(3);
	document.getElementById("cs1").innerHTML = "Current position s1: " + state.s1.toFixed(3);
	document.getElementById("ct").innerHTML = "Current time: " + state.time.toFixed(3);
	document.getElementById("sf").innerHTML = "Final position " + state.endPosition.toFixed(3);
	document.getElementById("td").innerHTML = "Total distance: " + state.totalDistance.toFixed(3);
	document.getElementById("tt").innerHTML = "Total time: " + state.timeToTerminate.toFixed(3);
	document.getElementById("scale").innerHTML = "Scale: " + state.scale.toFixed(3);

	
	clearID = setInterval(simulateStep, (1/fps) * 1000);

}


function determineValues(){
	
	if(state.secondEnabled){
		determineValuesTwo();
	}else{
		determineValuesSingle();
	}
}

function determineValuesSingle(){
	
	state.totalDistance =
		(state.u1 * state.timeToTerminate)
		+ (0.5 * state.a1 
		* state.timeToTerminate * state.timeToTerminate);
		
	state.endPosition = state.totalDistance + state.s1;
	
	console.log("Will travel a distance of: " + state.totalDistance);
	
}

/*
determines if the program will terminate given the input
*/
function determineTerminate(){
	
	if(state.terminateSelect == 0){ // velocity
	
		console.log("Velocity is termination criteria");
		return determineTerminateVelocity();
		
	}else if(state.terminateSelect == 1){ // displacement
	
		console.log("Displacement is termination criteria");
		return determineTerminateDisplacement();
		
	}else if(state.terminateSelect == 2){ // time
	
		state.timeToTerminate = state.terminateValue
		console.log("Will terminate after: " + state.timeToTerminate);
		return true; // time always increasing, will always terminate
		
	}else if(state.terminateSelect == 3){ // objects equal
		
		console.log("Equal attribute is termination criteria");
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
	var t = (state.terminateValue - u) / a;
	
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
	var t = (4 * u * u) + (8 * a * state.terminateValue);
	
	if(t < 0){
		alert("Selected object will never reach given displacement");
		return false;
	}
	
	// using equation "s = ut + (0.5 * a * t * t)" to get t
	t = ((-2 * u) 
		+ Math.sqrt((4 * u * u) + (8 * a * state.terminateValue))
		) / (2 * a);
	/*	
	TO DO: 
	Could possibly be an issue if with using +- in the quadratic formula?
	*/
	
	state.timeToTerminate = t;
	
	return true;
}

/*
determine if the two objects will ever be equal in the selected attribute
*/
function determineTerminateEqual(){
	
	console.log(
	"Determining if the two objects will be equal in a given attribute"
	);
	
	if(state.terminateEqualSelect == 0){ // velocity
		
		console.log("Velocity chosen");
		
		state.t1 = (state.terminateValue - state.u1) / state.a1;
		state.t2 = (state.terminateValue - state.u2) / state.a2;
		
		if(state.t1 < 0){
			
			alert(
			"Object one will not reach given velocity\n");
			return false;
			
		}else if(state.t2 < 0){
			
			alert("Object two will not reach given velocity\n");
			return false;
			
		}else if(state.t1 != state.t2){ //possible fp error here
		
			alert(
				"Objects will never be at the same velocity"
				+ "at the same time\n"
			);
			return false;
			
		}
		
	}else{ // displacement
		
		console.log("Displacement chosen");
		
		console.log("u: " + u + ", a: " + a + ", s: " + s);
	
		// using equation "s = ut + (0.5 * a * t * t)" to get t
		state.t1 = ((-2 * state.u1) 
			+ Math.sqrt(
				(4 * state.u1 * state.u1) 
				+ (8 * state.a1 * state.terminateValue)
			)) / (2 * state.a1);
			
		state.t2 = ((-2 * state.u2) 
			+ Math.sqrt(
				(4 * state.u2 * state.u2) 
				+ (8 * state.a2 * state.terminateValue)
			)) / (2 * state.a2);
			
		if(state.t1 < 0 || isNaN(state.t1)){
			
			alert("Object one will never reach given displacement");
			return false
			
		}else if(state.t2 < 0 || isNaN(state.t2)){
			
			alert("Object two will never reach given displacement");
			return false
			
		}else if(state.t1 != state.t2){
			
			alert(
				"Objects will never be at the same displacement"
				+ "at the same time\n"
			);
			return false;
			
		}
		/*	
		TO DO: 
		Could possibly be an issue if with using +- in the quadratic formula?
		*/
		
	}
	
	state.timeToTerminate = state.t1;
	
	return true;
	
}

/*
gets values for the next step in the simulation
*/
function simulateStep(){

	if(state.time > state.timeToTerminate){
		console.log("Simulation done");
		clearInterval(clearID);
		state.time = state.timeToTerminate;
	}
	
	state.v1 = state.u1 + (state.a1 * state.time);
	state.s1 = (state.u1 * state.time)
		+ (0.5 * state.a1 * state.time * state.time);
	
	//console.log(state.s1);
		
	if(state.secondEnabled){
		
	}
	
	document.getElementById("v1").innerHTML = "Current velocity v1: " + state.v1.toFixed(3);
	document.getElementById("cs1").innerHTML = "Current position s1: " + (state.s1 + state.startPosition1).toFixed(3);
	document.getElementById("ct").innerHTML = "Current time: " + state.time.toFixed(3);
	
	circle.attr("cx", state.s1 * state.scale);
	circle.attr("cy", 200);
	
	state.time += (1 / fps);
	
}

function getScale(){
	state.scale = size / state.totalDistance;
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
	state.terminateValue = parseInt(document.getElementById("terminateValue").value);
	state.terminateEqualSelect = document.getElementById("terminateEqualSelect").selectedIndex;
	state.startPosition1 = state.s1;
}

/*
check that all input is correctly formed
if errors are found format an error alert saying where the errors are
*/
function verifyInput(){

	var alertMessage = "";

	/* verify values of the first object */
	if(isNaN(state.u1) || (state.u1 != 0 && state.u1 == "")){
		alertMessage +=
		"First object: Initial speed must be a number\n";
	}

	if(isNaN(state.a1) || (state.a1 != 0 && state.a1 == "")){
		alertMessage += 
		"First object: Acceleration must be a number\n";
	}

	
	if(isNaN(state.s1) || (state.s1 != 0 && state.s1 == "")){
		alertMessage += 
		"First object: Initial position must be a number\n";
	}

	
	/* if the "enable second" button was pressed */
	if(state.secondEnabled){

		if(isNaN(state.u2) || (state.u2 != 0 && state.u2 == "")){
			alertMessage +=
			"Second object: Initial speed must be a number\n";
		}

		if(isNaN(state.a2) || (state.a2 != 0 && state.a2 == "")){
			alertMessage += 
			"Second object: Acceleration must be a number\n";
		}

		if(isNaN(state.s2) || (state.s2 != 0 && state.s2 == "")){
			alertMessage +=
			"Second object: Initial position must be a number\n";
		}

	}
	
	/* verify input based on the selected termination condition */
	if(state.terminateSelect == 0 || state.terminateSelect == 1){
		
		if(isNaN(state.terminateValue) || (state.terminateValue != 0 && state.terminateValue == "")){
			alertMessage +=
			"Terminate condition: Value must be a number"
		}
		
	}else if(state.terminateSelect == 2){
		
		if(isNaN(state.terminateValue) || state.terminateValue < 0 || (state.terminateValue != 0 && state.terminateValue == "")){
			alertMessage +=
			"Terminate condition: Time must be a number and non-negative";
		}
		
	}else if(state.terminateSelect == 3){
		
		if(!state.secondEnabled){
			alertMessage += 
			"Terminate condition: Second object used for termination but not enabled\n"
		}
		
		if(isNaN(state.terminateValue) || state.terminateValue < 0 || (state.terminateValue != 0 && state.terminateValue == "")){
			alertMessage +=
			"Terminate condition: Value must be a number\n"
		}
		
	}

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
	var third = document.getElementById("equalTerminate");

	if(x == 0 || x == 1){
		first.style.display = "block";
		second.style.display = "none";
		third.style.display = "none";
	}else if(x == 2){
		first.style.display = "none";
		second.style.display = "block";
		third.style.display = "none";
	}else if(x == 3){
		first.style.display = "none";
		second.style.display = "none";
		third.style.display = "block";
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
	
	document.getElementById("u1").value = "";
	document.getElementById("a1").value = "";
	document.getElementById("s1").value = "";

	document.getElementById("u2").value = "";
	document.getElementById("a2").value = "";
	document.getElementById("s2").value = "";
	
	document.getElementById("objectTerminate").style.display = "block";
	document.getElementById("timeTerminate").style.display = "none";
	document.getElementById("equalTerminate").style.display = "none";
	
	document.getElementById("terminateSelect").selectedIndex = 0;
	document.getElementById("terminateEqualSelect").selectedIndex = 0;
	
	document.getElementById("terminateValue").value = "";
	

}