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
		
	if(w > h){
		size = w - 250 - 10 - 165;
	}else{
		size = h - 250 - 10 - 165 - 80;
	}
	
	if(size < 600){
		size = 600;
	}else if(size + 80 > h){
		size = h - 80;
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
	document.getElementById("info_pane").style.left = size + 10 + 165;
	document.getElementById("graph_panel").style.left = size + 10 + 165;
	document.getElementById("graphText").style.left = size + 10 + 165;
			
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
		

}

function typeChange(){
	
	var select = document.getElementById("typeSelect");
	var type = select[select.selectedIndex].id;
	
	if(type == "vab"){
		document.getElementById("vabdiv").style.display = "block";
		document.getElementById("closestdiv").style.display = "none";
		document.getElementById("riverdiv").style.display = "none";
	}else if(type == "closest"){
		document.getElementById("vabdiv").style.display = "none";
		document.getElementById("closestdiv").style.display = "block";
		document.getElementById("riverdiv").style.display = "none";
	}else if(type == "river"){
		document.getElementById("vabdiv").style.display = "none";
		document.getElementById("closestdiv").style.display = "none";
		document.getElementById("riverdiv").style.display = "block";
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
	
}

function stopSimulation(){
	
	if(clearID){
		
		clearInterval(clearID);
		
		if(circle1){
			circle1.attr("cx", -10);
			circle1.attr("cy", -10);
		}
		
		if(circle2){
			circle2.attr("cx", -10);
			circle2.attr("cy", -10);
		}
		
		if(pointList){
			for(var i = 0; i < pointList.length; i++){
				pointList[i].remove();
			}
			pointList = [];
		}
	}
	
}
