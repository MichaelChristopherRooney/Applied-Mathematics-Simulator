var size = 600;
var circle;
var paper;
var proj;
var clearID;
var offGround;
var fps = 60;
var scale;
var currentObject = 0;

$(document).ready(function(){
	
	// Creates canvas 320 × 200 at 10, 50
	paper = Raphael(160, 0, size, size);
	
	var backgroundRectangle = paper.rect(0, 0, size, size);
	backgroundRectangle.attr("fill", "#bdbdbd");
	backgroundRectangle.attr("stroke", "#000");
	
	circle = paper.circle(0, size, 10);
	circle.attr("fill", "#f00");
	circle.attr("stroke", "#fff");
	
});

function swapObjects(){
	
	var first = document.getElementById("first");
	var second = document.getElementById("second");
	
	if(first.style.display != "none"){
		
		first.style.display = "none";
		second.style.display = "block";
		
	}else{
		
		first.style.display = "block";
		second.style.display = "none";
		
	}
}

function movingObject(){
	this.u = 0;
	this.s = 0;
	this.a = 0;
}

function run(){
	
}
/*
function addNew(){
	
	var value = document.getElementById("name").value;
	
	if(value == ""){
		alert("Name cannot be empty");
		return;
	}
	
	//var dropdown = document.getElementById("dropdown");
	//var option = document.createElement("option");
	//option.text = value;
	//dropdown.add(option);
	
	var x = document.getElementById("dropdown");
    var option = document.createElement("option");
    option.text = value;
    x.add(option);
}
*/