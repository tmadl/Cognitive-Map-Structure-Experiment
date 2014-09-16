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
	exp_properties.expno = 1; //0!!!
	exp_properties.max_expno = 2;
	
	var DISTJUDGMENTS = 6;
	var distanceEstimation = [-1, -1, -1, -1]; //distance, from, to, type
	var distEstTypes = []; // within-cluster or across-cluster
	var distEstAsked = []; // already asked 
	var cdistEst = -1;
	
	//var taskNumbersPerExperiment = [-1, 30, 24, 24, 24];
	var taskNumbersPerExperiment = [-1, 2, 24, 24, 24];

	var updateProgress = function() {
		for (key in exp_properties) {
			$("#"+key).text(exp_properties[key]);
		}
		$("#distance").val("");
	};
	
	this.exp1task = function() {
		DISTJUDGMENTS = 1;
		// generate and store map of experiment 1 (two random buildings)
		map.randomMap(2);
	};
	this.exp1judged = function() {
		//distance judged - next map
		nextTask();
	};
	
	this.exp2task = function() {
		var CONDITIONS = 4;
		DISTJUDGMENTS = 6;
		
		var ct = permuted_taskno[exp_properties.taskno-1]; //current task number, randomly permuted
		var condition = ct % CONDITIONS + 1; //cycle through conditions
		
		// generate and store maps of experiment 2
		var groups = 2 + Math.round(Math.random()); // 2 or 3 groups
		if (false && condition==2) {
			map.groupedMap(groups);
		}
		else if (false && condition == 1) { // equidistant, no cluters
			map.equidistantMap();
		}
		else { // equidistant 
			//cluster by color [c3] or function [c4] 
			map.equidistantMap(groups);
		}
	};
	this.exp2judged = function() {
		// distance judged - ask for next judgment
		if (exp_properties.expno == 1) {
			nextTask();
		}
		else {
			cdistEst++;
			if (cdistEst < DISTJUDGMENTS) {
				askForDistEst();
			}
			else {
				nextTask();
			}
		}
	};	
	
	var askForDistEst = function() {
		var fromid = -1, toid = -1;
		var from = "Building 1", to = "Building 2";
		// which distance is to be estimated
		$("#wora").text("");
		if (map.clusters == 0) {
			do {
				var ids = map.getIdsByCluster(0);
				var rndids = drawRandom(ids, 2);
				fromid = rndids[0];
				toid = rndids[1];
			} while (containsVector(distEstAsked, [fromid, toid]));
		}
		else {
			$("#wora").text(distEstTypes[cdistEst]);
			var j = 0, maxtries = 1000;
			do {
				var cluster = Math.floor(Math.random()*map.clusters);
				var ids = map.getIdsByCluster(cluster);
				if (distEstTypes[cdistEst] == 0) { // draw 2 within cluster
					var rndids = drawRandom(ids, 2);
					fromid = rndids[0];
					toid = rndids[1];
				}
				else if (distEstTypes[cdistEst] == 1) { // draw across cluster
					var cluster2;
					do {
						cluster2 = Math.floor(Math.random()*map.clusters);
					} while (cluster2 == cluster);
					var ids2 = map.getIdsByCluster(cluster2);
					fromid = drawRandom(ids, 1)[0];
					toid = drawRandom(ids2, 1)[0];
				}
			} while ((containsVector(distEstAsked, [fromid, toid]) || containsVector(distEstAsked, [toid, fromid])) && j++ < maxtries);
		}
		distEstAsked.push([fromid, toid]);
		distanceEstimation = [-1, fromid, toid, distEstTypes[cdistEst]]; //distance, from, to, type
		
		$("#distance").val("");
		$("#from").text(map.labels[fromid]);
		$("#to").text(map.labels[toid]);
		$("#distest").animate({opacity:0},200,"linear",function(){$(this).animate({opacity:1},200);});
	};
	
	var nextTask = function() {
		exp_properties.taskno++;
		if (exp_properties.taskno <= taskNumbersPerExperiment[exp_properties.expno]) {
			//clear map
			map.clearMap();
			//clear and initialize task data (real and estimated distances and building ids between which the distance was judged)
			data["exp"+exp_properties.expno]["task"+exp_properties.taskno] = {};
			data["exp"+exp_properties.expno]["task"+exp_properties.taskno].distance_estimations = [];
			updateProgress();
			
			//call current experiment task function
			experiment["exp"+exp_properties.expno+"task"]();
			//store map data
			data["exp"+exp_properties.expno]["task"+exp_properties.taskno].real_coords = map.building_coords;
			data["exp"+exp_properties.expno]["task"+exp_properties.taskno].cluster_ids = map.cluster_ids;
			
			// reset camera to somewhere near the existing buildings (but not within them)
			var i = Math.round(Math.random()*objects.length);
			while (!objects[i]) i = Math.round(Math.random()*objects.length);
			controls.getObject().position.x = objects[i].position.x + buildingwidthpx*1.5;
			controls.getObject().position.z = objects[i].position.z + buildingwidthpx*1.5;
			controls.getObject().rotation.y = 0.8;
			
			//set up distance estimations
			cdistEst = 0;
			distEstAsked = [];
			// randomize distance judgment types
			distEstTypes = [];
			if (DISTJUDGMENTS < 2) distEstTypes = [-1];
			else {
				for (var i=0; i<DISTJUDGMENTS/2; i++)
					distEstTypes[i] = 0;
				for (var i=DISTJUDGMENTS/2; i<DISTJUDGMENTS; i++)
					distEstTypes[i] = 1;
			}
			distEstTypes = distEstTypes.sort(function(a,b) {return Math.random()*2-1;});
			// ask for first distance judgment
			askForDistEst();
		}
		else {
			nextExperiment();
		}
	};
	
	var nextExperiment = function() {
		if (exp_properties.expno >= exp_properties.max_expno) {
			// TODO - transmit data, show code
			alert("Finished experiment. Plz wait for code");
		}
		else {
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
		}
	};
	this.run = function() {
		nextExperiment();
	};
	
	this.getData = function() {
		return data;
	};
	this.getMap = function() {
		return map;
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
			distanceEstimation[0] = est;
			data["exp"+exp_properties.expno]["task"+exp_properties.taskno].distance_estimations.push(distanceEstimation);
			showDistance(est, reald);
			
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


////

function drawRandom(list, n) {
	var result = [];
	for (var i=0; i<n; i++) {
		do {
			r = list[Math.floor(Math.random()*list.length)];
		} while (result.indexOf(r) > -1);
		result[i] = r;
	}
	return result;
}



function containsVector(mat, vec) {
	for (var i = 0; i < mat.length; i++) {
		if (mat[i].length != vec.length) continue;
		var c = true;
		for (var j = 0; j < vec.length; j++) {
			if (mat[i][j] != vec[j]) {
				c = false;
				break;
			} 
		}
		if (c) return true;
	}
	return false;
}
