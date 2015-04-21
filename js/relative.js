var size = 600;
var oldSize;
var vaLine;
var vbLine;
var vabLine;
var riverLine;
var hLine;
var vLine;
var cLine;
var pLine;
var waterBackground;
var circle1;
var circle2;
var aCircle;
var bCircle;
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

/*
resize only if it has been 250ms since last resize
this stops elements jumping while the browser is still resizing
*/
var resizeTimer;
$(window).resize(function (){
	
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(getNewSize, 250);
	
	
});

/* 
readjust all elements to suit new display size
*/
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
		
	size = w - 250 - 10 - 165;
	
	if(size + 80 > h){
		size = h - 80;
	}

	if(size < 480){
		size = 400;
	}	
	
	if(state){
		
		if(state.scale){
			oldScale = state.scale;
			x = oldSize / state.scale;
			state.scale = size / x;
			
			//document.getElementById("scale").innerHTML = "Scale: 1 metre = " + state.scale.toFixed(3) + " pixels";
		}
		
		/*
		if Vab scenario then we can just
		call runVAB again to recreate the
		lines with the new size in mind
		*/
		if(state.type == "vab"){
			rescaleVAB();
		}else if(state.type == "closest"){
			rescaleClosest();
		}else if(state.type == "river"){
			rescaleRiver();
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

/*
rescale all graphical elements in the simple VAB scenario
*/
function rescaleVAB(){
	
	vaLine.remove();
	vbLine.remove();
	vabLine.remove();
	vabLine = vbLine = vaLine = null;
	simulateStepVAB();
	
}

/*
rescale all graphical elements in the closest distance scenario
*/
function rescaleClosest(){
	
	if(circle1){
		circle1.attr("cx", (circle1.attr("cx") / oldScale) * state.scale);
		circle1.attr("cy", (circle1.attr("cy") / oldScale) * state.scale);
	}

	if(circle2){
		circle2.attr("cx", (circle2.attr("cx") / oldScale) * state.scale);
		circle2.attr("cy", (circle2.attr("cy") / oldScale) * state.scale);
	}
	
	if(vLine){

		vLine.remove();
		vLine = null;
		
		vLine = paper.path("M" + (size/2) + " " + 0 + 
		"L" + (size/2)
		+ " " + size
		);
		
	}
	
	if(hLine){
		
		hLine.remove();
		hLine = null;
		
		hLine = paper.path("M" + 0 + " " + (size / 2) + 
		"L" + size
		+ " " + (size / 2)
		);
	}
	
	
	var x = -state.startA;
	var y = -state.startB;
	
	if(aCircle){
		
		aCircle.remove();
		aCircle = null;
		
		aCircle = paper.circle((size / 2) + (x * state.scale), (size / 2), 3);
		aCircle.attr("fill", "#000");
		aCircle.attr("stroke", "#000");
		
	}
	
	if(bCircle){
		
		bCircle.remove();
		bCircle = null;
		
		bCircle = paper.circle((size / 2), (size / 2) - (y * state.scale), 3);
		bCircle.attr("fill", "#000");
		bCircle.attr("stroke", "#000");
		
	}
	
	if(cLine){
		
		cLine.remove();
		cLine = null;
		
		cLine = paper.path("M" + circle1.attr("cx") + " " + circle1.attr("cy") + 
		"L" + circle2.attr("cx")
		+ " " + circle2.attr("cy")
		);
	}
	
	if(vabLine){
		
		vabLine.remove();
		vabLine = null;
		
		x = (state.vabi * state.time);
		y = (state.vabj * state.time) - state.startB;

		vabLine = paper.path("M" + (size / 2) + " " + ((size / 2) + (state.startB * state.scale)) + 
		"L" + ((size / 2) + (x * state.scale))
		+ " " + ((size / 2) - (y * state.scale))
		);
	}
	
	if(pLine){
		
		pLine.remove();
		pLine = null;
		
		pLine = paper.path("M" + aCircle.attr("cx") + " " +  aCircle.attr("cy") + 
		"L" + ((size / 2) + (x * state.scale))
		+ " " + ((size / 2) - (y * state.scale)));
		
	}
	
}

/*
rescale all graphical elements in the river crossing scenario
*/
function rescaleRiver(){
	
	if(waterBackground){
		
		waterBackground.remove();
		waterBackground = null;
		
		waterBackground = paper.rect(0, (size - (state.width * state.scale)), size, size);
		waterBackground.attr("fill", "#66FFFF");
		waterBackground.attr("stroke", "#000");
		
	}
	
	if(riverLine){
		
		riverLine.remove();
		riverLine = null;
		
		riverLine = paper.path("M" + (size/2) + " " + size + 
		"L" + (size/2)
		+ " " + (size - (state.width * state.scale))
		);
	}
	
	var centre = size / 2;
	var x = state.vabi * state.time;
	var y = state.vabj * state.time;
	
	if(vabLine){
		
		vabLine.remove();
		vabLine = null;
		
		
	
		vabLine = paper.path("M" + centre + " " + size + 
		"L" + (centre - (x * state.scale))
		+ " " + (size - (y * state.scale))
		);
		
		vabLine.attr("stroke", "#FF0000");
		
	}
	
	if(pLine){
		
		pLine.remove();
		pLine = null;
		
		pLine = paper.path("M" + (centre - (x * state.scale)) + " " + (size - (y * state.scale)) + 
			"L" + (centre - ((x + (state.vbi/4)) * state.scale))
			+ " " + (size - ((y + (state.vabj/4)) * state.scale))
		);
	}
	
	
	
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
	this.vp = 0;
	this.sa = 0;
	this.sb = 0;
	this.scale = 0;
	this.type = "";
	this.riverAngle = 0;
	this.riverSpeed = 0;
	this.width = 0;
	this.endTime = 0;
	this.across = 0;
	this.time = 0;
	this.distance = 0;
	this.startA = 0;
	this.startB = 0;
	this.endA = 0;
	this.endB = 0;
	this.closest = 0;
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
		runVAB();
	}else if(type == "closest"){
		runClosest();
	}else if(type == "river"){
		runRiver();
	}
		

}

/*
run the simple VAB scenario
*/
function runVAB(){
	
	state.type = "vab";
		
	if(!parseInputVAB()){
		return false;
	}
		
	getScaleVAB();
	setDataVAB();
	simulateStepVAB();
	
}

/*
parse input for the simple VAB scenario
*/
function parseInputVAB(){

	state.vai = parseFloat(document.getElementById("vab-vai").value);
	state.vaj = parseFloat(document.getElementById("vab-vaj").value);
	state.vbi = parseFloat(document.getElementById("vab-vbi").value);
	state.vbj = parseFloat(document.getElementById("vab-vbj").value);
	
	var alertMessage = "";
	
	if(isNaN(state.vai) || (state.vai == "" && state.vai != 0)){
		alertMessage += "A's i velocity must be a number\n";
	}
	
	if(isNaN(state.vaj) || (state.vaj == "" && state.vaj != 0)){
		alertMessage += "A's j velocity must be a number\n";
	}
	
	if(isNaN(state.vbi) || (state.vbi == "" && state.vbi != 0)){
		alertMessage += "B's i velocity must be a number\n";
	}
	
	if(isNaN(state.vbj) || (state.vbj == "" && state.vbj != 0)){
		alertMessage += "B's j velocity must be a number\n";
	}
	
	if(alertMessage != ""){
		alert(alertMessage);
		return false;
	}
	
	state.vabi = state.vai - state.vbi;
	state.vabj = state.vaj - state.vbj;
	
	return true;
}

/*
set data in the right hand info panel for the simple VAB scenario
*/
function setDataVAB(){
	
	document.getElementById("vab-info").style.display = "block";
	document.getElementById("closest-info").style.display = "none";
	document.getElementById("river-info").style.display = "none";
	
	document.getElementById("va-value").innerHTML 
	= "Va (red line): " + state.vai.toFixed(3) + "i + " + state.vaj.toFixed(3) + "j";
	document.getElementById("vb-value").innerHTML 
	= "Vb (blue line): " + state.vbi.toFixed(3) + "i + " + state.vbj + "j";
	document.getElementById("vab-value").innerHTML 
	= "Vab (purple line): " + state.vabi.toFixed(3) + "i + " + state.vabj + "j";
	
	document.getElementById("scale").innerHTML
	= "Scale: 1 metre : 1" + state.scale.toFixed(3) + " pixels";
	
	document.getElementById("time").innerHTML = "";
	
}

/*
get the display scale for the simple VAB scenario
*/
function getScaleVAB(){
	
	// largest components of Va, Vb and Vab
	var aMax = Math.max(Math.abs(state.vai), Math.abs(state.vaj));
	var bMax = Math.max(Math.abs(state.vbi), Math.abs(state.vbj));
	var abMax = Math.max(Math.abs(state.vabi), Math.abs(state.vabj));
	
	// select largest out of the above three
	state.scale = size / Math.max(abMax, Math.max(aMax, bMax));
	
}

/*
simulate the simple VAB scenario
note that this only runs once
*/
function simulateStepVAB(){
	
	var centre = size / 2;
	
	vaLine = paper.path("M" + centre + " " + centre + 
		"L" + ((state.vai * state.scale / 2) + centre)
		+ " " + (centre - (state.vaj * state.scale / 2)));
	
	vbLine = paper.path("M" + centre + " " + centre + 
		"L" + ((state.vbi * state.scale / 2) + centre)
		+ " " + (centre - (state.vbj * state.scale / 2)));
	
	vabLine = paper.path("M" + centre + " " + centre + 
		"L" + ((state.vabi * state.scale / 2) + centre)
		+ " " + (centre - (state.vabj * state.scale / 2)));
	
	vaLine.attr("stroke", "#FF3300");
	vbLine.attr("stroke", "#0000FF");
	vabLine.attr("stroke", "#CC00CC");
	
}

/*
run the closest distance scenario
*/
function runClosest(){
	
	state.type = "closest";
		
	if(!parseInputClosest()){
		return false;
	}
		
	getValuesClosest();
		
	getScaleClosest();
	setDataClosest();
	
	circle1 = paper.circle(-10, -10, 10);
	circle1.attr("fill", "#f00");
	circle1.attr("stroke", "#000");
	
	circle2 = paper.circle(-10, -10, 10);
	circle2.attr("fill", "#f00");
	circle2.attr("stroke", "#000");
	
	vLine = paper.path("M" + (size/2) + " " + 0 + 
		"L" + (size/2)
		+ " " + size);
		
	hLine = paper.path("M" + 0 + " " + (size / 2) + 
		"L" + size
		+ " " + (size / 2));
	
	var x = -state.startA;
	var y = -state.startB;
	
	aCircle = paper.circle((size / 2) + (x * state.scale), (size / 2), 3);
	aCircle.attr("fill", "#000");
	aCircle.attr("stroke", "#000");
	
	bCircle = paper.circle((size / 2), (size / 2) - (y * state.scale), 3);
	bCircle.attr("fill", "#000");
	bCircle.attr("stroke", "#000");
	
	clearID = setInterval(simulateStepClosest, (1/fps) * 1000);
	
		
}

/*
parse input for the closest distance scenario
*/
function parseInputClosest(){

	state.vai = parseFloat(document.getElementById("closest-ai").value);
	state.vbj = parseFloat(document.getElementById("closest-bj").value);
	state.startA  = parseFloat(document.getElementById("closest-as").value);
	state.startB  = parseFloat(document.getElementById("closest-bs").value);
	
	var alertMessage = "";
	
	if(isNaN(state.vai) || state.vai <= 0 || (state.vai == "" && state.vai != 0)){
		alertMessage += "A's i velocity must be a number > 0\n";
	}
	
	if(isNaN(state.startA) || state.startA <= 0 || (state.startA == "" && state.startA != 0)){
		alertMessage += "A's distance west must be a number > 0\n";
	}
	
	if(isNaN(state.vbj) || state.vbj <= 0 || (state.vbj == "" && state.vbh != 0)){
		alertMessage += "B's j velocity must be a number > 0\n";
	}
	
	if(isNaN(state.startB) || state.startB <= 0 || (state.startB == "" && state.startB != 0)){
		alertMessage += "B's distance south must be a number > 0\n";
	}
	
	if(alertMessage != ""){
		alert(alertMessage);
		return false;
	}
	
	return true;
}

/*
calculate needed values for the closest distance scenario
*/
function getValuesClosest(){

	state.vabi = -state.vai;
	state.vabj = state.vbj;
	
	// get slope of line L = Vabj / Vabi
	var slope =  Math.abs(state.vabi) / Math.abs(state.vabj);
	
	var pq, tq, rt;
	pq = slope * state.startB;
	tq = state.startA - pq;
	
	var theta = Math.atan(slope);
	rt = Math.cos(theta) * tq;
	state.closest = rt;
	
	var qr = rt * Math.tan(theta);
	var sq = state.startB / Math.cos(theta)
	
	state.distance = qr + sq;
	state.endTime = state.distance / Math.sqrt((Math.pow(state.vabj, 2) + Math.pow(state.vabi, 2)));
	
	state.endA = (state.vai * state.endTime) - state.startA;
	state.endB = (state.vbj * state.endTime) - state.startB;

}

/*
set data in the right hand info panel for the closest distance scenario
*/
function setDataClosest(){
	
	document.getElementById("vab-info").style.display = "none";
	document.getElementById("closest-info").style.display = "block";
	document.getElementById("river-info").style.display = "none";
	
	document.getElementById("vai-value").innerHTML 
	= "Vai: " + state.vai.toFixed(3) + "i";
	document.getElementById("vbj-value").innerHTML 
	= "Vbj: " + state.vbj.toFixed(3) + "j";
	document.getElementById("vab-closest-value").innerHTML 
	= "Vab: " + state.vabi.toFixed(3) + "i + " + state.vabj.toFixed(3) + "j";
	document.getElementById("time-closest-value").innerHTML 
	= "Time of closest distance: " + state.endTime.toFixed(3) + "s";
	document.getElementById("distance-closest-value").innerHTML
	= "Closest distance: " + state.closest.toFixed(3) + "m";
	
	document.getElementById("scale").innerHTML
	= "Scale: 1 metre : 1" + state.scale.toFixed(3) + " pixels";
	
	
}

/*
get the display scale for the closest distance scenario
*/
function getScaleClosest(){
	
	var a, b;
	
	if(state.endA > state.startA){
		a = state.endA;
	}else{
		a = state.startA;
	}
	
	if(state.endB > state.startB){
		b = state.endB;
	}else{
		b = state.startB;
	}
	
	if(state.distance > a && state.distance > b){
		state.scale = size / state.distance / 2;
	}else if(a > b){
		state.scale = size / a / 2;
	}else{
		state.scale = size / b / 2;
	}
	
}

/*
simulate the closest distance scenario
*/
function simulateStepClosest(){
	
	if(state.time > state.endTime){
		clearInterval(clearID);
		state.time = state.endTime;
	}
	
	var x = (state.vai * state.time) - state.startA;
	var y = (state.vbj * state.time) - state.startB;
	
	circle1.attr("cx", (size / 2) + (x * state.scale));
	circle1.attr("cy", size / 2);
	
	circle2.attr("cx", size / 2);
	circle2.attr("cy", (size / 2) - (y * state.scale));
	
	if(cLine){
		cLine.remove();
		cLine = null;
	}
	
	cLine = paper.path("M" + circle1.attr("cx") + " " + circle1.attr("cy") + 
		"L" + circle2.attr("cx")
		+ " " + circle2.attr("cy"));
	
	if(vabLine){
		vabLine.remove();
		vabLine = null;
	}
	
	var x = (state.vabi * state.time);
	var y = (state.vabj * state.time) - state.startB;

	vabLine = paper.path("M" + (size / 2) + " " + ((size / 2) + (state.startB * state.scale)) + 
		"L" + ((size / 2) + (x * state.scale))
		+ " " + ((size / 2) - (y * state.scale))
	);
		
	
	if(state.time == state.endTime){
		
		pLine = paper.path("M" + aCircle.attr("cx") + " " +  aCircle.attr("cy") + 
		"L" + ((size / 2) + (x * state.scale))
		+ " " + ((size / 2) - (y * state.scale)));
		
	}
	
	document.getElementById("time").innerHTML 
	= "Time: " + state.time.toFixed(3) + "s";
	
	state.time += (1 / fps);
	
}

/*
run the river crossing scenario
*/
function runRiver(){
	
	state.type = "river";
		
	if(!parseInputRiver()){
		return fasle;
	}
	
	getValuesRiver();
	getScaleRiver();
	setDataRiver();
		
	waterBackground = paper.rect(0, (size - (state.width * state.scale)), size, size);
	waterBackground.attr("fill", "#66FFFF");
	waterBackground.attr("stroke", "#000");
		
	riverLine = paper.path("M" + (size/2) + " " + size + 
		"L" + (size/2)
		+ " " + (size - (state.width * state.scale)));
		
	clearID = setInterval(simulateStepRiver, (1/fps) * 1000);
	
}

/*
parse input for the river crossing scenario
*/
function parseInputRiver(){
	
	alertMessage = "";
	
	state.vp = parseFloat(document.getElementById("river-vp").value);
	
	if(isNaN(state.vp) || state.vp <= 0 || state.vp == ""){
		alertMessage +=
		"Person's speed must be a number > 0\n";
	}
	
	state.riverAngle = parseFloat(document.getElementById("river-angle").value);
	
	if(isNaN(state.riverAngle) || state.riverAngle <= 0 
	|| state.riverAngle > 90 || state.riverAngle == ""){
		alertMessage += 
		"Starting angle must be a number 90 ≥ α > 0\n";
	}
	
	state.riverSpeed = parseFloat(document.getElementById("river-vr").value);
	
	if(isNaN(state.riverSpeed) || state.riverSpeed <= 0 || state.riverSpeed == ""){
		alertMessage += 
		"River speed must be a number > 0\n";
	}
	
	state.width = parseFloat(document.getElementById("river-w").value);
	
	if(isNaN(state.width) || state.width <= 0 || state.width == ""){
		alertMessage += 
		"River width must be a number > 0\n";
	}
	
	if(alertMessage != ""){
		alert(alertMessage);
		return false;
	}
	
	return true;
	
}

/*
calculate needed values for the river crossing scenario
*/
function getValuesRiver(){
	
	state.vabj = state.vp * Math.sin(state.riverAngle * (Math.PI / 180));
	state.vbi = state.vp * Math.cos(state.riverAngle * (Math.PI / 180));
	state.vabi = state.vbi - state.riverSpeed;
	state.endTime = state.width / state.vabj;
	state.across = state.endTime * state.vabi;

}

/*
set data in the right hand info panel for the river crossing scenario
*/
function setDataRiver(){
	
	document.getElementById("vab-info").style.display = "none";
	document.getElementById("closest-info").style.display = "none";
	document.getElementById("river-info").style.display = "block";
	
	document.getElementById("current-value").innerHTML 
	= "Speed of current: " + state.riverSpeed.toFixed(3) + "m/s";
	document.getElementById("angle-value").innerHTML 
	= "Angle: " + state.riverAngle.toFixed(3);
	document.getElementById("landing-value").innerHTML 
	= "Landing location: " + state.across.toFixed(3) + "m";
	document.getElementById("ij-value").innerHTML 
	= "Vab: " + state.vabi.toFixed(3) + "i + " + state.vabj.toFixed(3) + "j";
	
	document.getElementById("scale").innerHTML
	= "Scale: 1 metre : 1" + state.scale.toFixed(3) + " pixels";
	
}

/*
get the display scale for the river crossing scenario
*/
function getScaleRiver(){
	
	if(state.width > (Math.abs(state.across * 2))){
		state.scale = size / state.width;
	}else{
		state.scale = (size / 2) / Math.abs(state.across);
	}
	
}

/*
simulate the river crossing scenario
*/
function simulateStepRiver(){
	
	if(state.time > state.endTime){
		clearInterval(clearID);
		state.time = state.endTime;
	}
	
	var x = state.vabi * state.time;
	var y = state.vabj * state.time;
	
	if(vabLine){
		vabLine.remove();
		vabLine = null;
	}
	
	var centre = size / 2;
	vabLine = paper.path("M" + centre + " " + size + 
		"L" + (centre - (x * state.scale))
		+ " " + (size - (y * state.scale))
	);
		
	vabLine.attr("stroke", "#FF0000");
	
	if(pLine){
		pLine.remove();
		pLine = null;
	}
	
	pLine = paper.path("M" + (centre - (x * state.scale)) + " " + (size - (y * state.scale)) + 
		"L" + (centre - ((x + (state.vbi/4)) * state.scale))
		+ " " + (size - ((y + (state.vabj/4)) * state.scale))
	);
	
	document.getElementById("time").innerHTML
	= "Time: " + state.time.toFixed(3) + "s";
	
	state.time += (1 / fps);
	
}

/*
remove graphical elements from previous simulations
*/
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
		vabLine.remove();
		vabLine = null;
	}
	
	if(riverLine){
		riverLine.remove();
		riverLine = null;
	}
	
	if(waterBackground){
		waterBackground.remove();
		waterBackground = null;
	}
	
	if(hLine){
		hLine.remove();
		hLine = null;
	}
	
	if(vLine){
		vLine.remove();
		vLine = null;
	}
	
	if(cLine){
		cLine.remove();
		cLine = null;
	}
	
	if(pLine){
		pLine.remove();
		pLine = null;
	}
	
	if(aCircle){
		aCircle.remove();
		aCircle = null;
	}
	
	if(bCircle){
		bCircle.remove();
		bCircle = null;
	}
	
}

/*
handle the selected scenario being changed
*/
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

/*
clear all input
*/
function clearInput(){
	
	document.getElementById("vab-vai").value = "";
	document.getElementById("vab-vaj").value = "";
	document.getElementById("vab-vbi").value = "";
	document.getElementById("vab-vbj").value = "";
	
	document.getElementById("closest-ai").value = "";
	document.getElementById("closest-as").value = "";
	document.getElementById("closest-bj").value = "";
	document.getElementById("closest-bs").value = "";
	
	document.getElementById("river-vp").value = "";
	document.getElementById("river-angle").value = "";
	document.getElementById("river-vr").value = "";
	document.getElementById("river-w").value = "";
	
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
	"In simple Vab the result of Vab = Va - Vb is shown.\n\n"
	+ "In closest distance one object approaches from the west and another from the south.\n"
	+ "The closest distance between these objects is shown.\n\n"
	+ "In river crossing a person swims with speed v at an angle Θ.\n"
	+ "The river has a given width and a current of a given speed.\n"
	+ "The affect the current has on the swimmer is shown in the path they take.\n";
	
	alert(alertMessage);
}
