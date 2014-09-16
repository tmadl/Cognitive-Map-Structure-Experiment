var houselabels = ['Apartments', 'Office highrise'];
var defaulthouse = houselabels[0];
var housenames = ['city3_h9_LOD', 'city3_h10_LOD'];
var modelpath = 'models/';

var houses = {}; // possible house objects to copy from
var objects = []; // actual objects in current scene
//var boundingboxes = [];

var experiment;

//called after models loaded
function init() {	
	setupScene();

	experiment = new Experiment();
	experiment.run();
}


Experiment = function() {
	var map = new Map();
	var coords; // current building coordinates
	
	var data = {};
	data.DISTSCALE = DISTSCALE;
	
	var exp_properties = {};
	exp_properties.expno = 1; //0!
	exp_properties.max_expno = 2;
	
	var distanceEstimation = {from: -1, to: -1, dist: -1};
	
	//var taskNumbersPerExperiment = [-1, 30, 24, 24, 24];
	var taskNumbersPerExperiment = [-1, 2, 24, 24, 24];

	var updateProgress = function() {
		for (key in exp_properties) {
			$("#"+key).text(exp_properties[key]);
		}
		$("#distance").val("");
	};
	
	this.exp1task = function() {
		// generate and store map of experiment 1 (two random buildings)
		coords = map.randomMap(2);
		// which distance is to be estimated
		distanceEstimation.from = 0;
		distanceEstimation.to = 1;
	};
	this.exp1judged = function() {
		//distance judged - next map
		nextTask();
	};
	
	this.exp2task = function() {
		var CONDITIONS = 4;
		var BUILDINGS = 9;
		
		var ct = permuted_taskno[exp_properties.taskno-1]; //current task number, randomly permuted
		var condition = ct % CONDITIONS + 1; //cycle through conditions
		
		// generate and store maps of experiment 2
		// if (condition==2) {
		if (Math.round(Math.random())) {
			var groups = 2 + Math.round(Math.random()); // 2 or 3 groups
			coords = map.groupedMap(BUILDINGS, groups);
		}
		else { // equidistant 
			coords = map.equidistantMap(BUILDINGS);
		}
	};
	this.exp2judged = function() {
		// distance judged - ask for next judgment
		nextTask();
	};	
	
	var nextTask = function() {
		exp_properties.taskno++;
		if (exp_properties.taskno <= taskNumbersPerExperiment[exp_properties.expno]) {
			//clear and initialize task data (real and estimated distances and building ids between which the distance was judged)
			data["exp"+exp_properties.expno]["task"+exp_properties.taskno] = {};
			data["exp"+exp_properties.expno]["task"+exp_properties.taskno].distbetween = [];
			data["exp"+exp_properties.expno]["task"+exp_properties.taskno].real_distances = [];
			data["exp"+exp_properties.expno]["task"+exp_properties.taskno].estimated_distances = [];
			updateProgress();
			//call current experiment task function
			coords = null;
			experiment["exp"+exp_properties.expno+"task"]();
			// reset camera to somewhere near the existing buildings (but not within them)
			var i = Math.round(Math.random()*objects.length);
			while (!objects[i]) i = Math.round(Math.random()*objects.length);
			controls.getObject().position.x = objects[i].position.x + buildingwidthpx*1.5;
			controls.getObject().position.z = objects[i].position.z + buildingwidthpx*1.5;
			controls.getObject().rotation.y = 0.8;
			//store data
			if (coords)
				data["exp"+exp_properties.expno]["task"+exp_properties.taskno].real_coords = coords;
			else 
				alert("Error: map coordinates not stored");
		}
		else {
			nextExperiment();
		}
	};
	
	var nextExperiment = function() {
		//show next instructions
		$("#instructions_exp"+exp_properties.expno).hide();
		exp_properties.expno++;
		$("#instructions_exp"+exp_properties.expno).show();
		exp_properties.taskno = 0;
		exp_properties.max_taskno = taskNumbersPerExperiment[exp_properties.expno];
		
		// initialize experiment data
		data["exp"+exp_properties.expno] = {};
		
		//permute task numbers randomly
		var tasks = new Array(taskNumbersPerExperiment[exp_properties.expno]);
		for (var i=1; i<=taskNumbersPerExperiment[exp_properties.expno]; i++)
			tasks[i-1]=i;
		this.permuted_taskno = tasks.sort(function(a,b) {return Math.random()*2-1;});
		
		nextTask();
	};
	this.run = function() {
		nextExperiment();
	};
	 
	this.onEnter = function() {
		//participant pressed enter; record distance estimate
		
		est = parseInt($("#distance").val());
		if (isNaN(est)) {
			alert("Please enter an estimated distance!\n(Make sure it is a valid number)");
		}
		else {
			// get real distance
			var reald = map.getDistance(distanceEstimation.from, distanceEstimation.to);
			// store estimated and real distance
			distanceEstimation.dist = est;
			data["exp"+exp_properties.expno]["task"+exp_properties.taskno].distbetween.push([distanceEstimation.from, distanceEstimation.to]);
			data["exp"+exp_properties.expno]["task"+exp_properties.taskno].real_distances.push(reald);
			data["exp"+exp_properties.expno]["task"+exp_properties.taskno].estimated_distances.push(est);
			
			showDistance(reald, est);
			
			//nextTask();
			experiment["exp"+exp_properties.expno+"judged"]();
		}
	};
	var showDistance = function(est, reald) {
		if (exp_properties.expno == 1 && exp_properties.taskno <= 5) { //exp1 first 5 tasks - show correct distance to user
			delta = Math.abs(est - reald);
			overunder = est > reald ? "over": "under";
			alert("The correct distance was "+reald+"\nYou "+overunder+"estimated by "+delta+"\n\n(This information will only be shown "+(5 - exp_properties.taskno)+" more times)");
		}
	};
	
	this.update = function() {
		map.update();
	};
};


