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
	var data = {};
	data.DISTSCALE = DISTSCALE;
	
	var exp_properties = {};
	exp_properties.expno = 0;
	exp_properties.max_expno = 2;
	
	//var taskNumbersPerExperiment = [-1, 30, 24, 24, 24];
	var taskNumbersPerExperiment = [-1, 2, 24, 24, 24];

	var updateProgress = function() {
		for (key in exp_properties) {
			$("#"+key).text(exp_properties[key]);
		}
		$("#distance").val("");
	};
	
	this.experiment1 = function() {
		exp_properties.taskno++;
		if (exp_properties.taskno <= taskNumbersPerExperiment[exp_properties.expno]) {
			data["exp"+exp_properties.expno]["task"+exp_properties.taskno] = {};
			updateProgress();
			clearMap();
			// generate and store map of experiment 1
			data["exp"+exp_properties.expno]["task"+exp_properties.taskno].real_coords = [];
			for (var i=0; i<2; i++) {
				hx = 0;
				while (hx == 0 || i == 1 && getDistance(hx, hz, objects[0].position.x, objects[0].position.z) < buildingwidth*2) {
					hx = Math.random()*350 - 175;
					hz = Math.random()*350 - 175;
				}
				house = addHouse(defaulthouse, hx, hz);
				data["exp"+exp_properties.expno]["task"+exp_properties.taskno].real_coords.push([hx, hz]);
			}
			data["exp"+exp_properties.expno]["task"+exp_properties.taskno].real_distance = Math.round(getEdgeDistance(objects[0], objects[1]));
		}
		else {
			nextExperiment();
		}
	};
	
	this.experiment2 = function() {
		exp_properties.taskno++;
		if (exp_properties.taskno <= taskNumbersPerExperiment[exp_properties.expno]) {
			data["exp"+exp_properties.expno]["task"+exp_properties.taskno] = {};
			updateProgress();
			clearMap();
			// generate and store map of experiment 1
			data["exp"+exp_properties.expno]["task"+exp_properties.taskno].real_coords = [];
			for (var i=0; i<2; i++) {
				hx = 0;
				while (hx == 0 || i == 1 && getDistance(hx, hz, objects[0].position.x, objects[0].position.z) < buildingwidth*2) {
					hx = Math.random()*350 - 175;
					hz = Math.random()*350 - 175;
				}
				house = addHouse(defaulthouse, hx, hz);
				data["exp"+exp_properties.expno]["task"+exp_properties.taskno].real_coords.push([hx, hz]);
			}
			data["exp"+exp_properties.expno]["task"+exp_properties.taskno].real_distance = Math.round(getEdgeDistance(objects[0], objects[1]));
		}
		else {
			nextExperiment();
		}
	};
	
	var clearMap = function() {
		for (var i = 0; i < objects.length; i++) {
			scene.remove(objects[i]);
		}
		while (objects.length > 0) {
			objects.pop();
		}
	};
	
	this.run = function() {
		nextExperiment();
	};
	var nextExperiment = function() {
		$("#instructions_exp"+exp_properties.expno).hide();
		exp_properties.expno++;
		$("#instructions_exp"+exp_properties.expno).show();
		exp_properties.taskno = 0;
		exp_properties.max_taskno = taskNumbersPerExperiment[exp_properties.expno];
		
		data["exp"+exp_properties.expno] = {};
		experiment["experiment"+exp_properties.expno]();
	};
	 
	this.onEnter = function() {
		//participant pressed enter;
		est = parseInt($("#distance").val());
		if (isNaN(est)) {
			alert("Please enter an estimated distance!\n(Make sure it is a valid number)");
		}
		else {
			d = data["exp"+exp_properties.expno]["task"+exp_properties.taskno].real_distance;
			data["exp"+exp_properties.expno]["task"+exp_properties.taskno].estimated_distance = est;
			
			if (exp_properties.taskno <= 5) { 
				delta = Math.abs(est - d);
				overunder = est > d ? "over": "under";
				alert("The correct distance was "+data["exp"+exp_properties.expno]["task"+exp_properties.taskno].real_distance+"\nYou "+overunder+"estimated by "+delta+"\n\n(This information will only be shown "+(5 - exp_properties.taskno)+" more times)");
			}
			
			this.experiment1();
		}
	};
};
