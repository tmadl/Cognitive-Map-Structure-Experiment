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
	
	var data = {};
	data.DISTSCALE = DISTSCALE;
	
	var exp_properties = {};
	exp_properties.expno = 1; //0!
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
			// generate and store map of experiment 1 (two random buildings)
			coords = map.randomMap(2);
			data["exp"+exp_properties.expno]["task"+exp_properties.taskno].real_coords = coords;
		}
		else {
			nextExperiment();
		}
	};
	
	this.experiment2 = function() {
		var CONDITIONS = 4;
		var BUILDINGS = 9;
		
		exp_properties.taskno++;
		if (exp_properties.taskno <= taskNumbersPerExperiment[exp_properties.expno]) {
			data["exp"+exp_properties.expno]["task"+exp_properties.taskno] = {};
			updateProgress();

			var ct = permuted_taskno[exp_properties.taskno-1]; //current task number, randomly permuted
			var condition = ct % CONDITIONS + 1;
			
			// generate and store maps of experiment 2
			//if (condition == 2) {
			if (Math.round(Math.random())) {
				var groups = 2 + Math.round(Math.random()); // 2 or 3 groups
				coords = map.groupedMap(BUILDINGS, groups);
			}
			else {
				coords = map.equidistantMap(BUILDINGS);
			}
			data["exp"+exp_properties.expno]["task"+exp_properties.taskno].real_coords = coords;
		}
		else {
			permuted_taskno = null;
			nextExperiment();
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
		
		if (!this.permuted_taskno) { //permute task numbers randomly
			var tasks = new Array(taskNumbersPerExperiment[exp_properties.expno]);
			for (var i=1; i<=taskNumbersPerExperiment[exp_properties.expno]; i++)
				tasks[i-1]=i;
			this.permuted_taskno = tasks.sort(function(a,b) {return Math.random()*2-1;});
		}
		
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


