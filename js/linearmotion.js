var size = 600;
var circle;
var paper;
var proj;
var clearID;
var offGround;
var fps = 60;
var scale;

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