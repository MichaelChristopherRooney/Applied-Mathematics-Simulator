var size = 600;
var oldSize;
var vaLine;
var vbLine;
var vabLine;
var riverLine;
var waterBackground;
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
			
			//document.getElementById("scale").innerHTML = "Scale: 1 metre = " + state.scale.toFixed(3) + " pixels";
		}
		
		/*
		if Vab scenario then we can just
		call runVAB again to recreate the
		lines with the new size in mind
		*/
		if(state.type == "vab"){
			vaLine.remove();
			vbLine.remove();
			vabLine.remove();
			vabLine = vbLine = vaLine = null;
			runVAB();
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

function runVAB(){
	
	state.type = "vab";
		
	if(!parseInputVAB()){
		return false;
	}
		
	getScaleVAB();
	setDataVAB();
	simulateStepVAB();
	
}

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

function setDataVAB(){
	
	document.getElementById("va-value").innerHTML = "Va: " + state.vai + "i + " + state.vaj + "j";
	document.getElementById("vb-value").innerHTML = "Vb: " + state.vbi + "i + " + state.vbj + "j";
	document.getElementById("vab-value").innerHTML = "Vab: " + state.vabi + "i + " + state.vabj + "j";
	
}

function getScaleVAB(){
	
	var aMax = Math.max(Math.abs(state.vai), Math.abs(state.vaj));
	var bMax = Math.max(Math.abs(state.vbi), Math.abs(state.vbj));
	var abMax = Math.max(Math.abs(state.vabi), Math.abs(state.vabj));
	
	state.scale = size / Math.max(abMax, Math.max(aMax, bMax));
	
}

function simulateStepVAB(){
	//MX YLX Y
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
	
	vaLine.attr("stroke", "#00FF00"); // green
	vbLine.attr("stroke", "#FF3399"); // purple
	vabLine.attr("stroke", "#663300"); // brown
	
}

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
	
	//state.endTime = state.endTime * 3;
	clearID = setInterval(simulateStepClosest, (1/fps) * 1000);
	
		
}
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
	
	var qr = rt * Math.tan(theta);
	var sq = state.startB * Math.cos(theta)
	
	state.distance = qr + sq;
	state.endTime = state.distance / Math.sqrt((Math.pow(state.vabj, 2) + Math.pow(state.vabi, 2)));
	
	state.endA = (state.vai * state.endTime) - state.startA;
	state.endB = (state.vbj * state.endTime) - state.startB;
	
	console.log("Vab: " + state.vabi + " " + state.vabj);
	console.log("Slope: " + slope);
	console.log("PQ: " + pq);
	console.log("TQ: " + tq);
	console.log("RT: " + rt);
	console.log("QR: " + qr);
	console.log("SQ: " + sq)
	console.log("Distance: " + state.distance);
	console.log("End time: " + state.endTime);
}

function setDataClosest(){
	
}

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
	
	if(a > b){
		state.scale = size / a / 2;
	}else{
		state.scale = size / b / 2;
	}
	
	console.log(size);
	console.log(a);
	console.log(b);
	console.log(state.scale);
	
}

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
	
	/*
	console.log(Math.sqrt(
		Math.pow((circle1.attr("cx") - circle2.attr("cx")), 2)
		+ Math.pow((circle1.attr("cy") - circle2.attr("cy")), 2)
	));
	*/
	
	state.time += (1 / fps);
	
}

function runRiver(){
	
	state.type = "river";
		
	if(!parseInputRiver()){
		return fasle;
	}
	
	getValuesRiver();
	getScaleRiver();
		
	waterBackground = paper.rect(0, (size - (state.width * state.scale)), size, size);
	waterBackground.attr("fill", "#1fcbd0");
	waterBackground.attr("stroke", "#000");
		
	riverLine = paper.path("M" + (size/2) + " " + size + 
		"L" + (size/2)
		+ " " + (size - (state.width * state.scale)));
		
	clearID = setInterval(simulateStepRiver, (1/fps) * 1000);
	
}
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
		"Starting angle must be ≤ 90 and > 0\n";
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

function getValuesRiver(){
	
	state.vabj = state.vp * Math.sin(state.riverAngle * (Math.PI / 180));
	state.vabi = state.vp * Math.cos(state.riverAngle * (Math.PI / 180));
	state.vabi = state.vabi - state.riverSpeed;
	state.endTime = state.width / state.vabj;
	state.across = state.endTime * state.vabi;

}

function setDataRiver(){
	
}

function getScaleRiver(){
	
	if(state.width > (state.across * 2)){
		state.scale = size / state.width;
	}else{
		state.scale = (size / 2) / state.across;
	}
	
}

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
		+ " " + (size - (y * state.scale)));
	
	state.time += (1 / fps);
	
}

function cleanUp(){
	
	if(clearID){
		clearInterval(clearID);
		clearID = null;
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
