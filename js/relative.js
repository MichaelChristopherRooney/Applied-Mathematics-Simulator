var size = 600;
var oldSize;
var vaLine;
var vbLine;
var vabLine;
var circle1;
var circle2;
var paper;
var clearID;
var fps = 60;
var state;
var pointList = [];
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
	
		
	var x;
	var oldSize = size;
	var oldScale;
		
	if(w > h){
		size = w - 250 - 10 - 165;
	}else{
		size = h - 250 - 10 - 165 - 80;
	}
	
	if(size + 80 > h){
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
	document.getElementById("graphics_panel").style.height = size;
	document.getElementById("info_pane").style.left = size + 10 + 165;
	
}

/*
this holds the state at the moment the run button is pressed
*/
function stateObject(){
	this.vai = 0;
	this.vaj = 0;
	this.vbi = 0;
	this.vbj = 0;
	this.vabi = 0;
	this.vabj = 0;
	this.scale = 0;
	this.type = "";
}

/*
when the "Run simulation" button is pressed
*/
function run(){

	cleanUp();
	
	state = new stateObject();
	
	var select = document.getElementById("typeSelect");
	var type = select[select.selectedIndex].id;
	
	if(type == "vab"){
		
		state.type = "vab";
		
		if(parseInputVAB()){
			return false;
		}
		
		getScaleVAB();
		runVAB();
		
	}else if(type == "closest"){
		
	}else if(type == "river"){
		
	}
		

}

function parseInputVAB(){

	state.vai = parseFloat(document.getElementById("vab-vai").value);
	state.vaj = parseFloat(document.getElementById("vab-vaj").value);
	state.vbi = parseFloat(document.getElementById("vab-vbi").value);
	state.vbj = parseFloat(document.getElementById("vab-vbj").value);
	
	var alertMessage = "";
	
	if(isNaN(state.vai) || (state.vai == "" && state.vai != 0)){
		alertMessage += "Vai must be a number\n";
	}
	
	if(isNaN(state.vaj) || (state.vaj == "" && state.vaj != 0)){
		alertMessage += "Vaj must be a number\n";
	}
	
	if(isNaN(state.vbi) || (state.vbi == "" && state.vbi != 0)){
		alertMessage += "Vbi must be a number\n";
	}
	
	if(isNaN(state.vbj) || (state.vbj == "" && state.vbj != 0)){
		alertMessage += "Vbj must be a number\n";
	}
	
	if(alertMessage != ""){
		alert(alertMessage);
		return false;
	}
	
	state.vabi = state.vai - state.vbi;
	state.vabj = state.vaj - state.vbj;
	
}

function getScaleVAB(){
	
	var aMax = Math.max(Math.abs(state.vai), Math.abs(state.vaj));
	var bMax = Math.max(Math.abs(state.vbi), Math.abs(state.vbj));
	var abMax = Math.max(Math.abs(state.vabi), Math.abs(state.vabj));
	
	state.scale = size / Math.max(abMax, Math.max(aMax, bMax));
	
}

function runVAB(){
	//MX YLX Y
	var centre = size / 2;
	vaLine = paper.path("M" + centre + " " + centre + 
		"L" + (state.vai * state.scale / 2) 
		+ " " + (size - (state.vaj * state.scale / 2)));
	vbLine = paper.path("M" + centre + " " + centre + 
		"L" + (state.vbi * state.scale / 2) 
		+ " " + (size - (state.vbj * state.scale / 2)));
	vabLine = paper.path("M" + centre + " " + centre + 
		"L" + (state.vabi * state.scale / 2) 
		+ " " + (size - (state.vabj * state.scale / 2)));
	
	
	
}

function cleanUp(){
	
	if(clearID){
		clearInterval(clearID);
		clearID = null;
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
	
	if(vaLine){
		vaLine.remove();
		vaLine = null;
	}
	
	if(vbLine){
		vbLine.remove();
		vbLine = null;
	}
	
	if(vabLine){
		vabLine.remove;
		vabLine = null;
	}
	
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
	
	document.getElementById("vab-vai").value = "";
	document.getElementById("vab-vaj").value = "";
	document.getElementById("vab-vbi").value = "";
	document.getElementById("vab-vbj").value = "";
	
	/*
	document.getElementById("slow-u1").value = "";
	document.getElementById("slow-a1").value = "";
	
	document.getElementById("catch-a1").value = "";
	document.getElementById("catch-u2").value = "";
	document.getElementById("catch-a2").value = "";
	document.getElementById("delay").value = "";
	*/
	
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
