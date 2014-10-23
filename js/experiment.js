houses = {}; // possible house objects to copy from
var objects = []; // actual objects in current scene
//var boundingboxes = [];

var experiment;

var serverlogurl="", getcodeurl="";
var serverlogurl = "http://madlnet.net/tsworks/savelog.php"; //takes the log POST parameter, writes a log file, and returns subject id
var getcodeurl = "http://madlnet.net/tsworks/getcode.php";
var subject_id = -1; 

//called after models loaded
function init() {	
	setupScene();

	experiment = new Experiment();
	experiment.run();
}

var current_dollars = [];

Experiment = function() {	
	var map = new Map();
	var coords; // current building coordinates
	var fuel = 100, cash = 0, has_package_from = null, delivered_to = null;
	var MINCASHINCR = 10, MAXCASHINCR = 50;
	var delivery_game = false, tsp_game = false, memorize_task = false, estimate_task = false;
	
	var data = {};
	data.DISTSCALE = DISTSCALE;
	
	var exp_properties = {};
	exp_properties.expno = 0; //0
	exp_properties.max_expno = 4; //5
	
	var DISTJUDGMENTS = 4;
	var distanceEstimation = [-1, -1, -1, -1]; //distance, from, to, type - 0 within, 1 across
	var presentation_time = 0; //when distance estimation instructions are presented (in ms)
	var distEstTypes = []; // within-cluster or across-cluster
	var distEstAsked = []; // already asked 
	var cdistEst = -1;
	var fromid, toid; //(for delivery or distance est.)
	
	var taskNumbersPerExperiment = [-1, 40, 12, 12, 12, 12];
	var acceptableDistanceError = 20; // percent error acceptable
	var requiredAcceptableJudgments = 4;
	//var taskNumbersPerExperiment = [-1, 15, 12, 12, 6];
	
	var SHOWDISTTASKS = Infinity; //show distance for first 5 tasks
	
	var MAX_DOLLARS = 10, MIN_DOLLARS = 5;

	var updateProgress = function() {
		for (key in exp_properties) {
			$("."+key).text(exp_properties[key]);
		}
		$("#distance").val("");
		$(".expno").text(exp_properties.expno>1?2:1);
		$(".max_expno").text(2);
	};
	
	var itext = null;
	this.exp1task = function() {
		delivery_game = false;
		DISTJUDGMENTS = 1;
		// generate and store map of experiment 1 (two random buildings)
		map.randomMap(2);
	};
	this.exp1judged = function() {
		$("#blocker").css('background-color', 'rgba(0,0,0,0.5)');
		this.blocked = false;
		//check correlation
		var n = Object.keys(experiment.getData().exp1).length;
		if (n > 20) {
			var dist = [], rdist = [];
			var distsum = 0, distsumsq = 0, rdistsum = 0, rdistsumsq = 0, psum = 0;
			for (k in data.exp1) {
				var d = data.exp1[k].distance_estimations[0][0], rd = data.exp1[k].real_distances[0];
				dist.push(d);
				rdist.push(rd);
				distsum += d; distsumsq += Math.pow(d, 2);
				rdistsum += rd; rdistsumsq += Math.pow(rd, 2);
				psum += d * rd;
			}
			var num = psum - (distsum * rdistsum / n);
	  		var den = Math.sqrt((distsumsq - Math.pow(distsum, 2) / n) * (rdistsumsq - Math.pow(rdistsum, 2) / n));
  			var r = num / den;
  			if (isNaN(r) || r < 0.3) {
  				alert("Your distance estimations are too inaccurate. Please try harder.");
  				//location.reload();
  			}
  		}
		
		//distance judged - next map
		estimate_task = false;
		
		var rd = data["exp"+exp_properties.expno]["task"+exp_properties.taskno].real_distances[data["exp"+exp_properties.expno]["task"+exp_properties.taskno].real_distances.length - 1];
		var d = data["exp"+exp_properties.expno]["task"+exp_properties.taskno].distance_estimations[data["exp"+exp_properties.expno]["task"+exp_properties.taskno].distance_estimations.length - 1];
		d = d[0];
		var perc = Math.abs(Math.round(100.0/rd*d) - 100);
		if (perc < acceptableDistanceError) {
			acceptablejudgments++;
			if (acceptablejudgments >= requiredAcceptableJudgments) {
				swalert("Good job!", "Your distance estimations are accurate. You can now proceed to experiment 2.\n\nPress Enter to continue", "success");
				nextExperiment();
				return false;
			}
		}
		else {
			acceptablejudgments = 0;
		}
		
		nextTask();
	};
	
	var condition;
	//var DISTGROUPCOND = 2, REGCOND = 1, FUNCGROUPCOND=4, COLGROUPCOND=3;
	var DISTGROUPCOND = 1, FUNCGROUPCOND=3, COLGROUPCOND=2;
	this.exp2task = function() {
		DISTJUDGMENTS = 4;
		
		var CONDITIONS = 3; //4
		
		var ct = permuted_taskno[exp_properties.taskno-1]; //current task number, randomly permuted
		condition = ct % CONDITIONS + 1; //cycle through conditions
		
		data["exp"+exp_properties.expno]["task"+exp_properties.taskno].condition = condition;
		
		// generate and store maps of experiment 2
		//var groups = 2 + Math.round(Math.random()); // 2 or 3 groups
		var groups = 2;
		if (condition == DISTGROUPCOND) {
			map.groupedMap(groups);
		}
		/*else if (condition == REGCOND) { // regular, no sp. clusters
			map.regularMap();
		}*/
		else { // equidistant, group by function or color
			//if (fuel < 20 && condition==FUNCGROUPCOND) groups = 3; // ensure there is a petrol station when fuel is low
			//cluster by color [c3] or function [c4] 
			map.regularMap(groups, condition==FUNCGROUPCOND);
		}
		 
		if (condition == FUNCGROUPCOND) {
			delivery_game = true;
			memorize_task = false;
			this.delivered = 0;
		}
		else {
			delivery_game = false;
			memorize_task = true;
		}
	};
	this.exp2judged = function() {
		// distance judged - ask for next judgment
		cdistEst++;
		if (cdistEst < DISTJUDGMENTS) {
			updateTaskInstruction();
		}
		else {
			estimate_task = false;
			$("#blocker").css('background-color', 'rgba(0,0,0,0.5)');
			this.blocked = false;

			//nextTask();
			showMapOverlay();
		}
	};	
	
	this.exp3task = function() {
		DISTJUDGMENTS = 4;
		
		delivery_game = false;
		var RNDTASKS = 5; // first 5 tasks random
		// generate and store map of experiment 3 (two building clusters and one additional building to determine decision boundary)
		features = [Math.random()*0.6+0.2, Math.random()*0.6+0.2, Math.random()*0.6+0.2]; //always random
		/*
		// additional building: random for the first 3 trials, then use active learning
		if (exp_properties.taskno <= RNDTASKS) {
			features = [Math.random()*0.6+0.2, Math.random()*0.6+0.2, Math.random()*0.6+0.2];
		}
		else {
			var data = [];
			var labels = [];
			for (var j=0; j<exp_properties.taskno; j++) {
				var biases = getDBBiases(j);
				var sum = numeric.sum(biases);
				if (sum == 0 || sum == 4 || biases[0]+biases[1] == biases[2]+biases[3]) { //undecidable cases. oo|oo uu|uu ou|uo 
				}
				else {
					var label = biases[0]+biases[1] < biases[2]+biases[3] ? 0 : 1;
					labels.push(label);
					data.push(data["exp"+exp_properties.expno]["task"+j].dbfeatures);
				}
			}
			features = [0,0,0];
		}*/
		data["exp"+exp_properties.expno]["task"+exp_properties.taskno].dbfeatures = features;
		// generate map
		map.decisionboundaryMap();
		delivery_game = true;
	};
	this.exp3judged = function() {
		// distance judged		
		// ask for next judgment
		cdistEst++;
		if (cdistEst < DISTJUDGMENTS) {
			updateTaskInstruction();
		}
		else {
			$("#blocker").css('background-color', 'rgba(0,0,0,0.5)');
			this.blocked = false;

			//nextTask();
			showMapOverlay();
		}
	};
	
	this.exp4task = function() {
		DISTJUDGMENTS = 4;
		
		var CONDITIONS = 3;
		var DISTGROUPCOND = 2, REGCOND = 1, COLGROUPCOND=3;
		
		var ct = permuted_taskno[exp_properties.taskno-1]; //current task number, randomly permuted
		var condition = ct % CONDITIONS + 1; //cycle through conditions
		
		data["exp"+exp_properties.expno]["task"+exp_properties.taskno].condition = condition;
		
		var buildings = 5;
		
		// generate and store maps of experiment 2
		var groups = 2; 
		if (condition == DISTGROUPCOND) {
			map.groupedMap(groups, 0, 0, buildings);
		}
		else if (condition == REGCOND) { // regular, no sp. clusters
			map.regularTspMap(0, buildings);
		}
		else { // equidistant, group by color
			//cluster by color [c3]
			map.regularTspMap(groups, buildings);
		}
		
		delivery_game = false;
		estimate_task = false;
		tsp_game = true;
		this.delivered = 0;
		delivered_to = -1;
		$("#package").removeClass("package_empty");
		$("#package").addClass("package");
		$("#packagetxt").show();
	};
	
	this.exp4judged = function() {
		// distance judged - ask for next judgment
		cdistEst++;
		if (cdistEst < DISTJUDGMENTS) {
			updateTaskInstruction();
		}
		else {
			$("#blocker").css('background-color', 'rgba(0,0,0,0.5)');
			this.blocked = false;

			//nextTask();
			showMapOverlay();
		}
	};	
	
	this.exp5task = function() {
		delivery_game = false;
		DISTJUDGMENTS = 0;
		// generate and store map of experiment 5 (building group)
		var res = map.groupedMap(1, 0, 0, 3);
		var coords = res[0];
	};
	this.exp5judged = function() {
		//distance judged - next map
		nextTask();
	};
	
	var getDBBiases = function(taskno) {
		var expno = 3; // DB estimated in exp 3
		var biases_by_map = [[], []];
		for (var i=0; i<=data["exp"+expno]["task"+taskno].real_distances[i].length; i++) {
			var type = data["exp"+expno]["task"+taskno].distance_estimations[i][3]; //submap 0 or 1
			var d = data["exp"+expno]["task"+taskno].distance_estimations[i][0];
			var rd = data["exp"+expno]["task"+taskno].real_distances[i];
			var bias = d < rd ? 0 : 1;
			biases_by_map[type].push(bias);
		}
		return biases_by_map[0].concat(biases_by_map[1]);
	};
	
	
	var flashCongrats = function() {
		swalert("Good job!", "You finished task "+exp_properties.taskno+"!\n"+(taskNumbersPerExperiment[exp_properties.expno]-exp_properties.taskno) + " tasks remain\n\nPress Enter to continue", "success");
		//$("#instructions_center").hide();$("#blocker").show();$("#congrats").show();
		//setTimeout('$("#instructions_center").show();$("#blocker").hide();$("#congrats").hide();lockPointer();', 2000);
	};
	
	var updateTaskInstruction = function() {
		$(".task").hide();
		
		$("#from").hide();
		$("#to").hide();
		
		if (delivery_game) {
			$(".deliver_task").show();
			$("#instructions_exp3").show();
			
			pair = getBuildingPairForDelivery();
			fromid = pair[0];
			toid = pair[1];
			$("#from").text(map.labels[fromid]);
			$("#to").text(map.labels[toid]);
			$("#from").show();
			$("#to").show();
		}
		else if (tsp_game) {
			$(".tsp_task").show();
		}
		else if (estimate_task) {
			var fixed_fromid = null;
			if (exp_properties.expno == 3) 
				fixed_fromid = objects.length-1; //in exp 3, always ask distance to middle (dec.boundary) building
			
			$("#from").show();
			$("#to").show();
			$(".estimate_task").show();
			pair = getBuildingPairForDistanceEstimation(fixed_fromid);
			
			fromid = pair[0];
			toid = pair[1];
			distEstAsked.push(pair);
			distanceEstimation = [-1, fromid, toid, distEstTypes[cdistEst]]; //distance, from, to, type	
			
			//renderDistance();
		}
		else {
			$(".remember_task").show();
		}
		
		
		if (memorize_task) {
			$(".remember_task").show();
			$("#instructions_exp2a").hide();
			$("#instructions_exp2b").hide();
			if (condition == FUNCGROUPCOND) 
				$("#instructions_exp2b").show();
			else 
				$("#instructions_exp2a").show();
		}
		else if (estimate_task) { //distance estimations
			try {
				//$("#distance").attr('title', map.getDistance(fromid, toid)); //! //$("#distance").val(""); //!
			} catch(e) {}
			$("#distance").val('');
			$("#from").text(map.labels[fromid]);
			$("#to").text(map.labels[toid]);
			$("#from").show();
			$("#to").show();
		}
		else if (tsp_game) {
			$("#from").hide();
			$("#to").hide();
			$(".startbuilding").text(data["exp"+exp_properties.expno]["task"+exp_properties.taskno].startbuilding+1);
		}
		
		$("#current_task").animate({opacity:0},200,"linear",function(){$(this).animate({opacity:1},200);});
		presentation_time = new Date();
	};
	
	this.resetTask = function() {
		exp_properties.taskno--;
		pointerlockchange();
		nextTask();
	};
	
	var phi = 0;
	this.getPhi = function() {return phi;};
	
	var nextTask = function() {
		exp_properties.taskno++;
		if (exp_properties.taskno <= taskNumbersPerExperiment[exp_properties.expno]) {
			//clear map
			map.clearMap();
			//clear and initialize task data (real and estimated distances and building ids between which the distance was judged)
			data["exp"+exp_properties.expno]["task"+exp_properties.taskno] = {};
			data["exp"+exp_properties.expno]["task"+exp_properties.taskno].condition = "";
			data["exp"+exp_properties.expno]["task"+exp_properties.taskno].distance_estimations = [];
			data["exp"+exp_properties.expno]["task"+exp_properties.taskno].response_latencies = [];
			data["exp"+exp_properties.expno]["task"+exp_properties.taskno].real_distances = [];
			updateProgress();
			
			//call current experiment task function
			experiment["exp"+exp_properties.expno+"task"]();
			//store map data
			data["exp"+exp_properties.expno]["task"+exp_properties.taskno].real_coords = map.building_coords;
			data["exp"+exp_properties.expno]["task"+exp_properties.taskno].cluster_assignments = map.cluster_assignments;
			
			// reset camera to somewhere near the existing buildings (but not within them)
			var centroid = map.getCentroid(range(0, objects.length-1));
			var farthest_id = -1, farthest_dist = -Infinity;
			for (var i = 0; i < objects.length - 1; i++) {
				var d = getDistance(map.building_coords[i][0], map.building_coords[i][1], centroid[0], centroid[1]);
				if (d > farthest_dist) {
					farthest_dist = d;
					farthest_id = i;
				}
			}
			farthest_dist = farthest_dist + 80;
			var d = farthest_dist;
			phi = Math.random()*Math.PI*2;
			if (exp_properties.expno == 4) { //adjacent to one rnd building, for tsp; otherwise farther away, bldgs in view 
				var i = Math.floor(Math.random()*objects.length);
				while (!objects[i]) i = Math.floor(Math.random()*objects.length);
				data["exp"+exp_properties.expno]["task"+exp_properties.taskno].startbuilding = i;
				controls.getObject().position.x = objects[i].position.x + buildingwidthpx*1.5;
				controls.getObject().position.z = objects[i].position.z + buildingwidthpx*1.5;
				controls.getObject().rotation.y = 0.8;
				tsp_game = true;
				estimate_task = false;
			}
			else {
				controls.getObject().position.x = (centroid[0] + farthest_dist*Math.cos(phi)) / DISTSCALE;
				controls.getObject().position.z = (centroid[1] + farthest_dist*Math.sin(phi)) / DISTSCALE;
				controls.getObject().rotation.y = 7.8 - phi;//3.8; //(Math.PI*2/3 + phi) % (Math.PI*2);
			}
			
			// add some dollars
			$(".dollarvis").hide();
			if (exp_properties.expno > 1) {
				for (var i = 0; i < current_dollars.length; i++) {
					scene.remove(current_dollars[i]);
				}
				current_dollars = [];
				var n_dollars = (exp_properties.taskno%2) ? MAX_DOLLARS : MIN_DOLLARS;
				data["exp"+exp_properties.expno]["task"+exp_properties.taskno].n_dollars = n_dollars;
				farthest_dist *= 1.5;
				for (var i = 0; i < n_dollars; i++) {
					var d = dollars.clone();
					//var x = (centroid[0] + Math.random()*farthest_dist - farthest_dist/2);
					//var z = (centroid[1] + Math.random()*farthest_dist - farthest_dist/2);
					var pos = rndNotTooClose(map.building_coords, 
								function() {return (centroid[0] + Math.random()*farthest_dist - farthest_dist/2);},
								function() {return (centroid[1] + Math.random()*farthest_dist - farthest_dist/2);}
							  );
					d.position.x = pos[0] / DISTSCALE;
					d.position.z = pos[1] / DISTSCALE;
					current_dollars.push(d);
					scene.add(d);
				}
				$(".dollarvis").show();
				$(".dollars").text(n_dollars);
			}
			
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
			distEstTypes = shuffle(distEstTypes);
				
			updateTaskInstruction();
		}
		else {
			//nextExperiment();
			$("#instructions_exp"+exp_properties.expno).hide();
			$("#instructions_exp"+exp_properties.expno+"a").hide();
			$("#instructions_exp"+exp_properties.expno+"b").hide();
			
			if (exp_properties.expno == 1) { // still on exp 1
				//show next instructions

				//exp_properties.expno++;
				exp_properties.expno = (subject_id % 3) + 2; //  [2 || 3 || 4]
				
				$("#instructions_exp"+exp_properties.expno).show();
				exp_properties.taskno = 0;
				exp_properties.max_taskno = taskNumbersPerExperiment[exp_properties.expno];
				
				// initialize experiment data
				data["exp"+exp_properties.expno] = {};
				
				//permute task numbers randomly
				var tasks = new Array(taskNumbersPerExperiment[exp_properties.expno]);
				for (var i=1; i<=taskNumbersPerExperiment[exp_properties.expno]; i++)
					tasks[i-1]=i;
				this.permuted_taskno = shuffle(tasks);
				
				nextTask();
			}
		}
		sendLogToServer();
	};
	
	var sendLogToServer = function() {
		var json_log_data = $.toJSON(data);
		
		$.post(serverlogurl, { log: json_log_data, id: subject_id })
		.done(function(d) {
		    if (subject_id < 0) 
		  	    subject_id = d;
		});
		
		if (exp_properties.expno > 1 && exp_properties.taskno > taskNumbersPerExperiment[exp_properties.expno]) {
			$.post(getcodeurl, { id: subject_id })
			.done(function(dat) {
			    if (dat) { 
			  	    code = dat;
			  	    $("#surveycode").html("<h1>Survey code:</h1><small><u style='border:1px solid green;'>"+code+"</u></small>");
		  	    	$("#surveycode").enableSelection();
		  	    	swalert("Finished experiment!", "Thank you for your participation!\nHere is your survey code: "+code, "success");
		  	   }
			});
		}
	};
	
	var nextExperiment = function() {
		if (exp_properties.expno >= exp_properties.max_expno) {
			sendLogToServer();
		}
		else {
			//show next instructions
			$("#instructions_exp"+exp_properties.expno).hide();
			$("#instructions_exp"+exp_properties.expno+"a").hide();
			$("#instructions_exp"+exp_properties.expno+"b").hide();
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
			this.permuted_taskno = shuffle(tasks);
			
			nextTask();
		}
	};
	
	var getBuildingPairForDelivery = function() {
		var ids1 = map.getIdsByFunctionName("supplier");
		var ids2 = map.getIdsByFunctionName("customer");
		var rndid1 = drawRandom(ids1, 1);
		var rndid2 = drawRandom(ids2, 1);
		return [rndid1, rndid2];
	};
	
	var getBuildingPairForDistanceEstimation = function(fixed_fromid) {
		var fromid = -1, toid = -1;
		
		// which distance is to be estimated - random, but make sure that its not asked twice
		
		if (!map.clusters) {
			do {
				var ids = map.getIdsByCluster(0);
				var rndids = drawRandom(ids, 2);
				fromid = fixed_fromid ? fixed_fromid : rndids[0];
				toid = rndids[1];
			} while (containsVector(distEstAsked, [fromid, toid]));
		}
		else {
			var j = 0, maxtries = 10000;
			do {
				var cluster, ids;
				do {
					cluster = Math.floor(Math.random()*map.clusters);
					ids = map.getIdsByCluster(cluster);
				} while(ids.length < 2);
				if (distEstTypes[cdistEst] == 0) { // draw 2 within cluster
					var rndids = drawRandom(ids, 2);
					fromid = fixed_fromid ? fixed_fromid : rndids[0];
					toid = rndids[1];
				}
				else if (distEstTypes[cdistEst] == 1) { // draw across cluster
					var cluster2;
					do {
						cluster2 = Math.floor(Math.random()*map.clusters);
					} while (cluster2 == cluster);
					var ids2 = map.getIdsByCluster(cluster2);
					fromid = fixed_fromid ? fixed_fromid : drawRandom(ids, 1)[0];
					toid = drawRandom(ids2, 1)[0];
				}
			} while ((containsVector(distEstAsked, [fromid, toid]) || containsVector(distEstAsked, [toid, fromid])) && j++ < maxtries);
		}
				
		return [fromid, toid];
	};
	
	var getBuildingPairForDBEstimation = function(fixed_fromid) {
		var fromid = fixed_fromid, toid = -1;
		
		// for decision boundary estimation - always ask from same building (on db) 
		
		var j = 0, maxtries = 1000;
		var ids = map.getIdsByCluster(0);
		var ids2 = map.getIdsByCluster(1);
		do {
			if (distEstTypes[cdistEst] == 0) { // draw 2 within cluster
				toid = drawRandom(ids, 1)[0];
			}
			else if (distEstTypes[cdistEst] == 1) { // draw across cluster
				toid = drawRandom(ids2, 1)[0];
			}
		} while ((containsVector(distEstAsked, [fromid, toid]) || containsVector(distEstAsked, [toid, fromid])) && j++ < maxtries);
				
		return [fromid, toid];
	};
	
	
	this.run = function() {
		this.timerLoop();
		nextExperiment();
	};
	
	this.getData = function() {
		return data;
	};
	this.getProperties = function() {
		return exp_properties;
	};
	this.getMap = function() {
		return map;
	};
	 
	this.onEnter = function() {
		//participant pressed enter; record distance estimate
		if (mapcanvasshown) {
			//record drawn map
			if (!mapcanvasclicked) {
				swalert("You made no changes to the map. Please create a map of where you remember the buildings by dragging them into their correct place with your mouse.");
			}
			else {
				rememberedbuildingx = [];
				rememberedbuildingy = [];
				for (var i = 0; i < objects.length; i++) {
					var x = $("#bid"+i).attr("x");
					var y = $("#bid"+i).attr("y");
					if (isNaN(x) || isNaN(y)) {
						x = $("#bid"+i).offset().left - $("#bid"+i).parent().offset().left;
						y = $("#bid"+i).offset().top - $("#bid"+i).parent().offset().top;
						x += imgsize/2;
						y += imgsize/2;
					}
					//convert?
					// store and log
					rememberedbuildingx.push(x);
					rememberedbuildingy.push(y);
				}
		
				data["exp"+exp_properties.expno]["task"+exp_properties.taskno].rememberedX = rememberedbuildingx;
				data["exp"+exp_properties.expno]["task"+exp_properties.taskno].rememberedY = rememberedbuildingy;
				
				lockPointer();
				mapcanvasshown = false;
				$("#instructions_center").show();
				$("#mapcanvas").hide();
				$("#mapinstructions").hide();
				$("#blocker").hide();
				$(".drag_task").hide();
				
				flashCongrats();
				nextTask();
			}
		}
		else if (delivery_game || tsp_game || memorize_task) {
			if (current_dollars.length > 0) {
				swalert("Please collect all dollar notes (and memorize the map)!");
				return false;
			}
			
			if (delivery_game && (has_package_from != fromid || delivered_to != toid)) {
				swalert("Please pick up a package from "+map.labels[fromid]+" and deliver it to "+map.labels[toid]+"! Press enter when finished.");
			}
			else if (tsp_game && (this.delivered < objects.length || delivered_to < 0)) {
				swalert("Please deliver packages to all buildings, and then return to Building "+(data["exp"+exp_properties.expno]["task"+exp_properties.taskno].startbuilding+1)+"! Press enter when finished.");
			}
			else {
				tsp_game = false;
				delivery_game = false;
				memorize_task = false;
				estimate_task = true;
				
				$(".pressenter").css('color', '#ddeeff');
				has_package_from = null;
				delivered_to = null;
				$("#blocker").show();
				$("#instructions_center").hide();
				$("#congrats").hide();
				controls.enabled = false;
				$("#blocker").css('background-color', 'rgba(150,150,150,1)');
				this.blocked = true;
				
				updateTaskInstruction();
			}
		}
		else {
			if (!estimate_task) {
				estimate_task = true;
				
				$("#blocker").show();
				$("#instructions_center").hide();
				$("#congrats").hide();
				controls.enabled = false;
				$("#blocker").css('background-color', 'rgba(150,150,150,1)');
				this.blocked = true;
				
				updateTaskInstruction();
			}
			else {
				//record distance estimate
				est = parseInt($("#distance").val());
				if (isNaN(est)) {
					swalert("Please enter an estimated distance!\n(Make sure it is a valid number)");
				}
				else {
					// get real distance
					var reald = map.getDistance(distanceEstimation[1], distanceEstimation[2]);
					// store estimated and real distance
					distanceEstimation[0] = est;
					data["exp"+exp_properties.expno]["task"+exp_properties.taskno].response_latencies.push(new Date() - presentation_time);
					data["exp"+exp_properties.expno]["task"+exp_properties.taskno].distance_estimations.push(distanceEstimation);
					data["exp"+exp_properties.expno]["task"+exp_properties.taskno].real_distances.push(reald);
					showDistance(est, reald);
					
					experiment["exp"+exp_properties.expno+"judged"]();
				}
			}
		}
	};
	this.onUse = function() {
		var mind = Infinity, minid = -1;
		for (var i = 0; i < objects.length; i++) {
			var d = getPointToEdgeDistance(controls.getObject(), objects[i]);
			if (d < mind) {
				mind = d;
				minid = i;
			}
		}
		if (mind < BUILDINGWIDTH*2) {
			var func = map.labels[minid].toLowerCase();
			if (func.indexOf("gas") > -1 || fuel < 10) { // gas station - fill up
				cash -= 100 - fuel;
				fuel = 100;
				$("#statusbar").animate({opacity:0},200,"linear",function(){$(this).animate({opacity:1},200);});
			}
			else if (func.indexOf("supplier") > -1) { // supplier - get package
				has_package_from = minid;
				$("#package").removeClass("package_empty");
				$("#package").addClass("package");
				$("#packagetxt").show();
				$("#statusbar").animate({opacity:0},200,"linear",function(){$(this).animate({opacity:1},200);});
				
				objects[minid].children[1].material.color.setHex(0x000000);
				objects[minid].children[2].material.color.setHex(0x000000);
			}
			else if (func.indexOf("customer") > -1 && has_package_from != null) { // customer - deliver package
				delivered_to = minid;
				$("#package").addClass("package_empty");
				$("#package").removeClass("package");
				$("#packagetxt").hide();
				$("#statusbar").animate({opacity:0},200,"linear",function(){$(this).animate({opacity:1},200);});
				cash += Math.round(Math.random()*(MAXCASHINCR-MINCASHINCR)) + MINCASHINCR;
				
				objects[minid].children[1].material.color.setHex(0x000000);
				objects[minid].children[2].material.color.setHex(0x000000);
				
				if (has_package_from == fromid && delivered_to == toid) $(".pressenter").css('color', '#00ff00');
			}
			else if (tsp_game) {
				// tsp - deliver package
				$("#statusbar").animate({opacity:0},200,"linear",function(){$(this).animate({opacity:1},200);});
				cash += MINCASHINCR;
				objects[minid].children[1].material.color.setHex(0x000000);
				objects[minid].children[2].material.color.setHex(0x000000);
				this.delivered++;
			}
		}
	};
	
	var acceptablejudgments = 0;
	var showDistance = function(est, reald) {
		if (exp_properties.expno == 1 && exp_properties.taskno <= SHOWDISTTASKS) { //exp1 first 5 tasks - show correct distance to user
			delta = Math.abs(est - reald);
			overunder = est > reald ? "over": "under";
			perc = Math.round((100/reald)*delta);
			swalert("Thank you! The actual distance was "+reald, "You "+overunder+"estimated by "+delta+" ("+perc+" %). This information can help you adjust your estimations.\n\nYou can proceed to the next experiment once you consistently make less than 20% mistakes.\n\nPress Enter to continue");
		}
	};
	
	var renderDistance = function() {
		if (exp_properties.taskno <= SHOWDISTTASKS) {
			if (itext) scene.remove(itext);
			var text = get3DText("Distance: " + map.getDistance(fromid, toid)+" m", 0);
			var x1=objects[0].position.x, x2=objects[1].position.x, z1=objects[0].position.z, z2=objects[1].position.z;
			text.material.color.setHex(0xff0000);
			text.position.y = 0;
			var itext = new THREE.Object3D();
			itext.position.x = (x1+x2)/2;
			itext.position.z = (z1+z2)/2;
			itext.add(text); 
			itext.scale.set(100, 100, 100);
			scene.add(itext);
		}
		else if (itext) {
			scene.remove(itext);
			itext = null;
		}
	};
	
	this.update = function() {
		map.update();
	};
	this.timerLoop = function() {
		$("#statusbar").show();
		for (var i = 0; i < current_dollars.length; i++) {
			var d = getDistance(controls.getObject().position.x, controls.getObject().position.z, current_dollars[i].position.x, current_dollars[i].position.z);
			if (d < MINDIST) {
				$("#statusbar").animate({opacity:0},200,"linear",function(){$(this).animate({opacity:1},200);});
				cash++;
				scene.remove(current_dollars[i]);
				current_dollars.splice(i, 1);
				$(".dollars").text(current_dollars.length);
				if (current_dollars.length == 0) {
					$(".dollarvis").hide();
				}
				break;
			}
		}
		
		if (exp_properties.expno == 4 && this.delivered >= objects.length) {
			var mind = Infinity, minid = -1;
			for (var i = 0; i < objects.length; i++) {
				var d = getPointToEdgeDistance(controls.getObject(), objects[i]);
				if (d < mind) {
					mind = d;
					minid = i;
				}
			}
			var startbuilding = -1;
			try {
				startbuilding = data["exp"+exp_properties.expno]["task"+exp_properties.taskno].startbuilding;
			}
			catch (exc) {}
			if (tsp_game && mind < 2*BUILDINGWIDTH && minid == startbuilding) {
				$(".pressenter").css('color', '#00ff00');
				delivered_to = minid;
				$("#packagetxt").hide();
			}
		}
		
		/*if (exp_properties.expno > 1) {
			//use up fuel in exp 2 and 3
			if (controls.moving)
				fuel-=0.5;
				
			if (fuel < 20) {
				$("#statusbar").animate({opacity:0},200,"linear",function(){$(this).animate({opacity:1},200);});
			}
			if (fuel < 0) {
				fuel = 0;
				controls.v = controls.slow_v;
			}
			else {
				controls.v = controls.default_v;
			}
			
			$("#fuellevel").width(fuel+"%");
			var r = Math.round(255 * (1 - fuel/100)), g = 256*Math.round(255 * (fuel/100));
			$("#fuellevel").css({background: intToCol(r)+intToCol(g).substring(1)+"00"});
			$("#cashamount").text(cash + " $");
		}*/
		$("#cashamount").text(cash + " $");
		var me = this;
		setTimeout(function() {me.timerLoop()}, 200);
	};
};

////

var mapcanvasclicked = false, mapcanvasshown = false;
var imgsize = 30;
function showMapOverlay() {
	var N = objects.length;
	
	controls.enabled = false;
	document.exitPointerLock();
	
	$("#blocker").show();
	$("#instructions_center").hide();
	$("#mapcanvas").show();
	$("#mapinstructions").show();
	$(".task").hide();
	$("#from").hide();
	$("#to").hide();
	$(".drag_task").show();
	
	mapcanvasclicked = false;
	mapcanvasshown = true;
	
	$("#mapcanvas").mousedown(function() {
		mapcanvasclicked = true;
	});
	
	var images = [];
	
	$("#mapcanvas").html("");
	for (var i=0; i < N; i++) {
		images.push(
			$("<img class='buildingimg' />").attr({
				src: "img/buildingsmall.png",
				id: "imgbid"+i,
				height: imgsize,
				width: imgsize,
			}).add($("<div id='blbl_bid"+i+"' class='buildinglbl'>"+experiment.getMap().labels[i]+"</div>"))
			.add($("<div class='buildingcolor' id='bid"+i+"' style='background:"+intToCol(experiment.getMap().group_colors[experiment.getMap().cluster_assignments[i]])+"'></div>").attr({
				onload: function() {
					$(this).draggable({ containment: "#mapcanvas" });
					$(this).mouseup(function() {
						var x = $(this).offset().left - $(this).parent().parent().offset().left;
						var y = $(this).offset().top - $(this).parent().parent().offset().top;
						x += imgsize/2;
						y += imgsize/2;
						$(this).attr("x", x);
						$(this).attr("y", y);
						$("#blbl_b"+$(this).attr("id")).css({left: $(this).offset().left, top: $(this).offset().top, position:'absolute'});
						$("#img"+$(this).attr("id")).css({left: $(this).offset().left, top: $(this).offset().top, position:'absolute'});
					});
					$(this).mousemove(function() {
						$("#blbl_"+$(this).attr("id")).css({left: $(this).offset().left, top: $(this).offset().top, position:'absolute'});
						$("#img"+$(this).attr("id")).css({left: $(this).offset().left, top: $(this).offset().top, position:'absolute'});
					});
					
				}
			})).add("<br/><br/><br/>")
		);
	}
	images = shuffle(images);
	for (var i = 0; i < N; i++) {
		$("#mapcanvas").append(images[i]);
	}
	for (var i = 0; i < N; i++) {
		$("#blbl_bid"+i).css({left: $("#bid"+i).offset().left, top: $("#bid"+i).offset().top, position:'absolute'});
		$("#imgbid"+i).css({left: $("#bid"+i).offset().left, top: $("#bid"+i).offset().top, position:'absolute'});
	}
}

////

function range(start, end) {
    var foo = [];
    for (var i = start; i <= end; i++) {
        foo.push(i);
    }
    return foo;
}

function shuffle(arr) {
	if (typeof arr == "number") {
		var a = [];
		for (var i=0; i<arr; i++) {
			a.push(i);
		}		
		return shuffle(a);
	}
	else {
		return arr.sort(function(a,b) {return Math.random()*2-1;});
	}
}

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
