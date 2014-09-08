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
	var exp_properties = {};
	exp_properties.expno = 0;
	exp_properties.max_expno = 2;
	
	var taskNumbersPerExperiment = [-1, 30, 24, 24, 24];
	var nextExperiment = function() {
		$("#instructions_exp"+exp_properties.expno).hide();
		exp_properties.expno++;
		$("#instructions_exp"+exp_properties.expno).show();
		exp_properties.taskno = 1;
		exp_properties.max_taskno = taskNumbersPerExperiment[exp_properties.expno];
	};
	var updateProgress = function() {
		for (key in exp_properties) {
			$("#"+key).text(exp_properties[key]);
		}
	};
	
	this.run = function() {
		nextExperiment();
		updateProgress();
		//generateMap();
		this["experiment"+exp_properties.expno]();
	};
	
	this.experiment1 = function() {
		clearMap();
		generateMap();
	};
	
	var generateMap = function() {
		// objects
		for (var i=0; i<2; i++) {
			hx = Math.floor( Math.random() * 40 - 20 ) * 100;
			hz = Math.floor( Math.random() * 40 - 20 ) * 100;
			house = addHouse(defaulthouse, hx, hz);
			setHouseColor(house, 255, 0, 0);
		}
		$("#distance").val(Math.round(Math.sqrt(Math.pow(objects[0].position.x-objects[1].position.x, 2) + Math.pow(objects[0].position.z-objects[1].position.z, 2))*DISTSCALE));
	};
	
	var clearMap = function() {
		for (var i = 0; i < objects.length; i++) {
			scene.remove(objects[i]);
		}
		while (objects.length > 0) {
			objects.pop();
		}
	};
	 
	 
	this.onEnter = function() {
		document.title="enter";
	};
};
