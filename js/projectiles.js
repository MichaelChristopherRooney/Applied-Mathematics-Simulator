var size = 600;
var circle;
var line;
var paper;
var proj;
var clearID;
var offGround;
var fps = 60;
var scale;

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
see appendix for detailed explanations of
values and formulae used in projectiles
*/
function Projectile(u, projectileAngle){
		this.ux = u * Math.cos(projectileAngle * (Math.PI / 180));
		this.uy = u * Math.sin(projectileAngle * (Math.PI / 180));
		this.vx = this.ux;
		this.vy = 0;
		this.pa = projectileAngle;
		this.tof = (2 * this.uy) / 9.8;
		this.sx = 0;
		this.sy = 0; 
		this.time = 0;
		this.range = this.ux * this.tof;
		this.height = 
			(this.uy * (this.tof / 2) 
			+ (-4.9 * (this.tof / 2) 
			* (this.tof / 2)));
		this.startHeight = -1;
		this.slopeAngle = -1;
}

/*
gets values for the next step in the simulation
*/
function simulateStep(){
	
	if(proj.time < proj.tof){
		
		proj.vy = proj.uy + (-9.8 * proj.time);
		proj.sx = (proj.ux * proj.time);
		proj.sy = (proj.uy * proj.time) 
			+ (-4.9 * proj.time * proj.time);
		proj.time = proj.time + (1/fps);
	
		circle.attr("cx", proj.sx * scale);
		circle.attr("cy", size - (proj.sy * scale));
	
	}else{
		
		proj.vy = proj.uy + (-9.8 * proj.tof);
		proj.sy = 0;
		proj.sx = (proj.ux * proj.tof);
	
		circle.attr("cx", proj.sx * scale);
		circle.attr("cy", size - (proj.sy * scale));
		
		clearInterval(clearID);
		
	}
	
	document.getElementById("vx").innerHTML = "vx: " + proj.vx.toFixed(3);
	document.getElementById("vy").innerHTML = "vy: " + proj.vy.toFixed(3);
	document.getElementById("sx").innerHTML = "sx: " + proj.sx.toFixed(3);
	document.getElementById("sy").innerHTML = "sy: " + proj.sy.toFixed(3);
	
}

/*
gets values for the next step in the simulation
specific for when the projectile starts off the ground
*/
function simulateStepOffGround(){
	
	if(proj.time < proj.tof){
		
		proj.vy = proj.uy + (-9.8 * proj.time);
		proj.sx = (proj.ux * proj.time);
		proj.sy = (proj.uy * proj.time) 
			+ (-4.9 * proj.time * proj.time);
		proj.time = proj.time + (1/fps);
	
		circle.attr("cx", proj.sx * scale);
		circle.attr("cy", size - ((proj.startHeight + proj.sy) * scale));
		
	}else{
		
		proj.vx = proj.ux;
		proj.vy = proj.uy + (-9.8 * proj.tof);
		proj.sy = -proj.startHeight;
		proj.sx = (proj.ux * proj.tof);
	
		circle.attr("cx", proj.sx * scale);
		circle.attr("cy", size);
		
		clearInterval(clearID);
		
	}
	
	document.getElementById("vx").innerHTML = "vx: " + proj.vx.toFixed(3);
	document.getElementById("vy").innerHTML = "vy: " + proj.vy.toFixed(3);
	document.getElementById("sx").innerHTML = "sx: " + proj.sx.toFixed(3);
	document.getElementById("sy").innerHTML = "sy: " + proj.sy.toFixed(3);
	
}

function simulateStepSloped(){
	
	if(proj.time < proj.tof){
		
		proj.vx = proj.ux + 
			(-9.8 
			* Math.sin(proj.slopeAngle * (Math.PI / 180)) 
			* proj.time
		);
		proj.vy = proj.uy + 
			(-9.8 
			* Math.cos(proj.slopeAngle * (Math.PI / 180)) 
			* proj.time
		);
		proj.sx = (proj.ux * proj.time) 
			+ (-4.9 
			* Math.sin(proj.slopeAngle * (Math.PI / 180)) 
			* proj.time * proj.time
		);
		proj.sy = (proj.uy * proj.time) 
			+ (-4.9 
			* Math.cos(proj.slopeAngle * (Math.PI / 180)) 
			* proj.time * proj.time
		);
		proj.time = proj.time + (1/fps);
	
		circle.attr("cx", proj.sx * scale);
		circle.attr("cy", size - (proj.sy * scale));
		
	}else{
		
		proj.vx = proj.ux + 
			(-9.8 
			* Math.sin(proj.slopeAngle * (Math.PI / 180)) 
			* proj.tof
		);
		proj.vy = proj.uy + 
			(-9.8 
			* Math.cos(proj.slopeAngle * (Math.PI / 180)) 
			* proj.tof
		);
		proj.sy = 0;
		proj.sx = proj.range;
	
		circle.attr("cx", proj.sx * scale);
		circle.attr("cy", size - (proj.sy * scale));
		
		clearInterval(clearID);
		
	}
	
	document.getElementById("vx").innerHTML = "vx: " + proj.vx.toFixed(3);
	document.getElementById("vy").innerHTML = "vy: " + proj.vy.toFixed(3);
	document.getElementById("sx").innerHTML = "sx: " + proj.sx.toFixed(3);
	document.getElementById("sy").innerHTML = "sy: " + proj.sy.toFixed(3);
	
}
/*
called when the "Run simulation" button is pressed
*/
function run(){
	
	if(verifyInput() == false){
		return;
	}
	
	if(line){
		line.remove();
	}

	
	proj = new Projectile(parseInt(
		document.getElementById("u").value),
		parseInt(document.getElementById("angle").value)
	);
	
	if(document.getElementById("offGround").checked){
		proj.startHeight = 
			parseInt(document.getElementById("startHeight").value);
		getOffGroundValues();
		//line = paper.path("M0 600" + "L90 90");
	}else if(document.getElementById("isSloped").checked){
		proj.slopeAngle =
			parseInt(document.getElementById("slopeAngle").value);
		getSlopedValues();
		line = paper.path("M0 600" + "L"
			+ size
			+ " "
			+ (size - 
			(size * Math.tan(proj.slopeAngle * (Math.PI / 180)))
			)
		);
		Math.tan
	}
	
	getScale();
	
	document.getElementById("ux").innerHTML = "ux: " + proj.ux.toFixed(3);
	document.getElementById("uy").innerHTML = "uy: " + proj.uy.toFixed(3);
	document.getElementById("vx").innerHTML = "vx: ";
	document.getElementById("vy").innerHTML = "vy: ";
	document.getElementById("sx").innerHTML = "sx: ";
	document.getElementById("sy").innerHTML = "sy: ";
	document.getElementById("tof").innerHTML = 
		"TOF: " + proj.tof.toFixed(3);
	document.getElementById("range").innerHTML = 
		"Range: " + proj.range.toFixed(3);
	document.getElementById("height").innerHTML = 
		"Max height: " + proj.height.toFixed(3);
	document.getElementById("scale").innerHTML = 
		"Scale: 1 metre:" + scale.toFixed(3) + " pixels";
	
	if(proj.startHeight != -1){
		clearID = setInterval(simulateStepOffGround, (1/fps) * 1000);
	}else if(proj.slopeAngle != -1){
		clearID = setInterval(simulateStepSloped, (1/fps) * 1000);
	}else{
		clearID = setInterval(simulateStep, (1/fps) * 1000);
	}
	
}

/*
gets constant values for when the specific case where the projectile starts
off the ground
*/
function getOffGroundValues(){
	
	proj.tof = (-proj.uy 
		- Math.sqrt((proj.uy * proj.uy) - (-19.6 * proj.startHeight)))
		/ -9.8;
	proj.range = proj.ux * proj.tof;
	var tempTOF = (2 * proj.uy) / 9.8
	proj.height = (proj.uy * (tempTOF / 2) 
		+ (-4.9 * (tempTOF / 2) * (tempTOF / 2)));
	
}

function getSlopedValues(){
	
	proj.tof = (2 * proj.uy) 
		/ (9.8 * Math.cos(proj.slopeAngle * (Math.PI / 180)));
	proj.range = (proj.ux * proj.tof) 
		+ (-4.9 
		* Math.sin(proj.slopeAngle * (Math.PI / 180)) 
		* proj.tof * proj.tof
	);
	proj.height = (proj.uy * (proj.tof / 2)) 
		+ (-4.9 
		* Math.cos(proj.slopeAngle * (Math.PI / 180)) 
		* (proj.tof / 2) * (proj.tof / 2)
	);

	
}
	

function getScale(){
	
	if(proj.range > proj.height && proj.range > proj.startHeight){
		scale = size / proj.range;
	}else{
		if(proj.height > proj.startHeight){
			scale = size / proj.height;
		}else{
			scale = size / (proj.startHeight + proj.height);
		}
	}
	
}

function verifyInput(){

	var alertMessage = "";
	
	var value = parseInt(document.getElementById("u").value);
	
	if(isNaN(value) || value == "" || value <= 0){
		alertMessage += "Initial speed must be a number and be > 0\n";
	}
	
	value = parseInt(document.getElementById("angle").value);
	
	if(isNaN(value) || value == "" || value <= 0 || value > 90){
		alertMessage += 
		"Projectile angle must be a number and be > 0 and <= 90\n";
	}
	
	/* if the "sloped" check box is checked */
	if(document.getElementById("isSloped").checked == true){
		
		var angleTotal = value;
		value = parseInt(document.getElementById("slopeAngle").value);
		/* add the two angles together and make sure they are < 90 */
		angleTotal += value;
		
		if(isNaN(value) || value == "" || value <= 0 || value > 90){
			alertMessage += 
			"Slope angle must be a number and be > 0 and <= 90\n";
		}
		
		if(angleTotal >= 90){
			alertMessage += 
			"Slope angle + projectile angle must be < 90";
		}
		
	}
	
	/* if the "off ground" check box is checked */
	if(document.getElementById("offGround").checked == true){
		
		value = parseInt(document.getElementById("startHeight").value);
		if(isNaN(value) || value == "" || value <= 0){
			alertMessage += 
			"Starting height must be a number and be > 0\n";
		}

	}
	
	if(alertMessage != ""){
		alert(alertMessage);
		return false;
	}
	
}

function clearInput(){
	
	document.getElementById("u").value = "";
	document.getElementById("angle").value = "";
	document.getElementById("isSloped").checked = false;
	document.getElementById("slopeAngle").value = "";
	document.getElementById("offGround").checked = false;
	document.getElementById("startHeight").value = "";
	
}