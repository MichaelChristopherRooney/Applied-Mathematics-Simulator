var size = 600;
var circle;
var paper;
var clearID;
var fps = 60;
var scale;
var firstObject;
var secondObject;
var secondEnabled = false;

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

function movingObject(u, a, s){
	this.u = u;
	this.a = a;
	this.s = s;
}

/*
when the "Run simulation" button is pressed
*/
function run(){

	if(!verifyInput()){
		return;
	}

	parseInput();

	clearID = setInterval(simulateStep(), (1/fps) * 1000);

}

/*
gets values for the next step in the simulation
*/
function simulateStep(){

}


function parseInput(){

	firstObject = movingObject(
		parseInt(document.getElementById("u")),
		parseInt(document.getElementById("a")),
		parseInt(document.getElementById("s"))
	);

	if(secondEnabled == true){
		secondObject = movingObject(
			parseInt(document.getElementById("u1")),
			parseInt(document.getElementById("a1")),
			parseInt(document.getElementById("s1"))
		);
	}

}

/*
check that all input is correctly formed
if errors are found format an error alert saying where the errors are
*/
function verifyInput(){

	var alertMessage = "";

	var value = parseInt(document.getElementById("u").value);

	if(isNaN(value) || value == ""){
		alertMessage +=
		"First object:\n\tInitial speed must be a number\n";
	}

	value = parseInt(document.getElementById("a").value);

	if(isNaN(value) || value == ""){
		alertMessage += "\tAcceleration must be a number\n";
	}

	value = parseInt(document.getElementById("s").value);

	if(isNaN(value) || value == ""){
		alertMessage += "\tInitial position must be a number\n";
	}

	/* if the "enable second" check box is checked  */
	if(secondEnabled){

		var value = parseInt(document.getElementById("u1").value);

		if(isNaN(value) || value == ""){
			alertMessage +=
			"\nSecond object:\n\tInitial speed must be a number\n";
		}

		value = parseInt(document.getElementById("a1").value);

		if(isNaN(value) || value == ""){
			alertMessage += "\tAcceleration must be a number\n";
		}

		value = parseInt(document.getElementById("s1").value)

		if(isNaN(value) || value == ""){
			alertMessage +=
			"\tInitial position must be a number\n";
		}

	}

	if(alertMessage != ""){
		alert(alertMessage);
		return false;
	}

}

function enableSecond(){
	
	if(!secondEnabled){
		
		secondEnabled = true;
		document.getElementById("enableSecond").innerHTML = "Disable second";
		
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
		document.getElementById("enableSecond").innerHTML = "Enable second";
		
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
		document.getElementById("enableSecond").innerHTML = "Enable second";
		
		swapObjects();
		
	}
	
	document.getElementById("u").value = "";
	document.getElementById("a").value = "";
	document.getElementById("s").value = "";

	document.getElementById("u1").value = "";
	document.getElementById("a1").value = "";
	document.getElementById("s1").value = "";

}