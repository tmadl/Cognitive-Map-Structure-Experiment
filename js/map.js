var DEFAULTDIST = 250;
var MAXGROUPSIZE = 500, MINGROUPSIZE = 300, MINGROUPDIST = 300;

var function_names = ["Customer", "Supplier", "Gas Station"];

//http://names.mongabay.com/male_names.htm
var top50names_male = ['JAMES', 'JOHN', 'ROBERT', 'MICHAEL', 'WILLIAM', 'DAVID', 'RICHARD', 'CHARLES', 'JOSEPH', 'THOMAS', 'CHRISTOPHER', 'DANIEL', 'PAUL', 'MARK', 'DONALD', 'GEORGE', 'KENNETH', 'STEVEN', 'EDWARD', 'BRIAN', 'RONALD', 'ANTHONY', 'KEVIN', 'JASON', 'MATTHEW', 'GARY', 'TIMOTHY', 'JOSE', 'LARRY', 'JEFFREY', 'FRANK', 'SCOTT', 'ERIC', 'STEPHEN', 'ANDREW', 'RAYMOND', 'GREGORY', 'JOSHUA', 'JERRY', 'DENNIS', 'WALTER', 'PATRICK', 'PETER', 'HAROLD', 'DOUGLAS', 'HENRY', 'CARL', 'ARTHUR', 'RYAN', 'ROGER'];
var top50names_female = ['MARY', 'PATRICIA', 'LINDA', 'BARBARA', 'ELIZABETH', 'JENNIFER', 'MARIA', 'SUSAN', 'MARGARET', 'DOROTHY', 'LISA', 'NANCY', 'KAREN', 'BETTY', 'HELEN', 'SANDRA', 'DONNA', 'CAROL', 'RUTH', 'SHARON', 'MICHELLE', 'LAURA', 'SARAH', 'KIMBERLY', 'DEBORAH', 'JESSICA', 'SHIRLEY', 'CYNTHIA', 'ANGELA', 'MELISSA', 'BRENDA', 'AMY', 'ANNA', 'REBECCA', 'VIRGINIA', 'KATHLEEN', 'PAMELA', 'MARTHA', 'DEBRA', 'AMANDA', 'STEPHANIE', 'CAROLYN', 'CHRISTINE', 'MARIE', 'JANET', 'CATHERINE', 'FRANCES', 'ANN', 'JOYCE', 'DIANE'];
var names = top50names_male.slice(25).concat(top50names_female.slice(0, 25)).sort(function(a,b) {return Math.random()*2-1;});

//30
var shoptypes = ['clothes', 'cookie', 'doughnut', 'food', 'music', 'pet', 'grocery', 'bakery', 'barber', 'book', 'tea', 'computer', 'flower', 'gift', 'perfume', 'shoe', 'repair', 'tobacco', 'toy', 'thrift', 'specialty', 'coffee', 'electronics', 'phone', 'watch', 'cutlery', 'fruit', 'furniture', 'jewelry', 'chocolate', 'print', 'lego', 'wellness', 'whiskey', 'duty-free', 'alcohol'];
shoptypes = shoptypes.sort(function(a,b) {return Math.random()*2-1;});

var supplier_category = "shop", customer_category = "house";
var function_name_groups = [append(normalcase(names), "'s "+customer_category), append(normalcase(shoptypes), " "+supplier_category)];

Map = function() {
	this.building_coords=[];
	this.cluster_assignments=[];
	this.clusters = 0;
	this.labels=[];
	this.group_colors = [0xffffff];
	this.boundary_color = 0xffffff;
	
	this.building_colors = [];
	this.building_functions = [];
	
	this.getCentroid = function(ids) {
		var xs = 0, ys = 0;
		for (var i = 0; i < ids.length; i++) {
			xs += this.building_coords[ids[i]][0];
			ys += this.building_coords[ids[i]][1];
		}
		return [xs/ids.length, ys/ids.length];
	};
	this.getIdsByCluster = function(cluster) {
		var ids = [];
		for (var i = 0; i < this.cluster_assignments.length; i++) {
			if (this.cluster_assignments[i] == cluster)
				ids.push(i);
		}
		return ids;
	};
	
	this.getIdsByFunctionName = function(functionname) {
		var ids = [];
		for (var i = 0; i < this.labels.length; i++) {
			if (this.labels[i].toLowerCase().indexOf(functionname.toLowerCase()) > -1)
				ids.push(i);
		}
		return ids;
	};
	
	var randomDist = function(maxd, mind) {
		if (!maxd) maxd = DEFAULTDIST;
		if (!mind) mind = 0; //-maxd;
		return Math.random()*(maxd - mind) + mind;
	};
	
	this.getDistance = function(fromId, toId) {
		return Math.round(getEdgeDistance(objects[fromId], objects[toId]));
	};
	
	this.randomMap = function(n) {
		var maxgroups = 3;
		
		this.building_coords = [];
		this.cluster_assignments = [];
		this.group_colors = rndColors(maxgroups);
		
		var fnames = function_name_groups.slice(); //shuffle(function_name_groups.slice());
		fnames[0] = shuffle(fnames[0]);
		fnames[1] = shuffle(fnames[1]);
		function_numbers = [0,0];
		
		var functions = [], colors = [];
		for (var i=0; i<n; i++) {
			var pos = rndNotTooClose(this.building_coords, function() {return randomDist(DEFAULTDIST*2);}, null, BUILDINGWIDTH);
			this.building_coords.push([pos[0], pos[1]]);
			
			//TODO random map
			//TODO 12 normal trials, 3 random trials (~30min)
			//TODO predict rndmap clusterings from feature importances 
			
			if (i<=1) {
				fid = i; //there must be at least one customer and supplier (for delivery game)
			}
			else {
				fid = Math.floor(Math.random()); // rest random
			}
			function_numbers[fid]++;
			functions.push(fnames[fid][function_numbers[fid]]);
			colors.push(rndColors(1, 0)[0]);
		}
		this.renderMap(this.building_coords, colors, functions);
		return [this.building_coords, null];
	};

	this.decisionboundaryMap = function(features) {
		var BUILDINGS = 4;
		var groups = 2;
		
		this.clusters = groups;
		this.building_coords = [];
		this.cluster_assignments = [];
		this.group_colors = rndColors(groups);
		
		var fnames = function_name_groups.slice(); //shuffle(function_name_groups.slice());
		fnames[0] = shuffle(fnames[0]);
		fnames[1] = shuffle(fnames[1]);
		
		var mu = new Array(groups), sigma = new Array(groups);
		for (var i=0; i<groups; i++) {
			var pos = rndNotTooClose(mu, function() {return randomDist(0, 500);}, function() {return randomDist(0, 500);}, 300);
			mu[i] = [pos[0], pos[1]];
			sigma[i] = [randomDist(MAXGROUPSIZE, MINGROUPSIZE), randomDist(MAXGROUPSIZE, MINGROUPSIZE)];
		}
		mu = [];
		// centroids between 300 and 500m
		while (mu.length == 0 || tooClose([mu[0]], mu[1][0], mu[1][1], 300) || !tooClose([mu[0]], mu[1][0], mu[1][1], 500)) {
			mu = [[randomDist(0, 800), randomDist(0, 800)], [randomDist(0, 800), randomDist(0, 800)]];
		}
		//alert(getDistance(mu[0][0], mu[0][1], mu[1][0], mu[1][1])); 

		function_numbers = [0,0,0];
		
		var permuted_id = shuffle(BUILDINGS);
		
		var colors = [], functions = [];
		var dx = mu[0][0] - mu[1][0], dy = mu[0][1] - mu[1][1];
		var alpha = Math.atan2(dy, dx);
		var clustersize = randomDist(50, 120); //distance of 2 bldgs in a cluster - between 50 and 120m
		//groups of 2 bldgs
		for (var clid = 0; clid <= 1; clid ++) {
			var c = this.group_colors[clid];
			for (var i=-1; i<=1; i+=2) {
				var x = mu[clid][0] - i*clustersize/2 * Math.cos(Math.PI/2 - alpha), y = mu[clid][1] + i*clustersize/2 * Math.sin(Math.PI/2 - alpha);
				this.building_coords.push([x, y]);
				this.cluster_assignments.push(clid);
				function_numbers[clid]++;
				functions.push(fnames[clid][function_numbers[clid]]);
				colors.push(c);
			}
		}
		
		// additional 1 building, characterized by 3D distance vector
		/*
		* characterize building by distance to the 2 clusters in 3D feature space: [position, color, function]
		* 0...feature equivalent to cluster 1; 0.5...feature halfway between the two clusters; 1...feature equivalent to cluster 2
		*/
		if (!features) {
			//dist col fun
			features = [Math.random()*0.8+0.1, Math.random()*0.8+0.1, Math.round(Math.random())]; //random features (min 20% distance from both clusters)
		}
		var centroid1 = this.getCentroid(this.getIdsByCluster(0)), centroid2 = this.getCentroid(this.getIdsByCluster(1));
		var dx = centroid2[0] - centroid1[0], dy = centroid2[1] - centroid1[1];
		var hx = centroid1[0] + dx*features[0], hy = centroid1[1] + dy*features[0]; 
		//alert(centroid1+"\n"+centroid2+"\n"+features[0]+"\n"+[hx, hy]);
		var col = interpolateColor(features[1], this.group_colors[0], this.group_colors[1]);
		var fun;
		if (features[2] > 0.5) { 
			function_numbers[1]++;
			fun = fnames[1][function_numbers[1]];
		}
		else {
			function_numbers[0]++;
			fun = fnames[0][function_numbers[0]];
		}
		this.building_coords.push([hx, hy]);
		this.cluster_assignments.push(-1);
		colors.push(col);
		functions.push(fun);
		this.boundary_color = col;
		
		this.renderMap(this.building_coords, colors, functions);
		//
		for (var i=0; i<groups; i++) {
			this.renderClusterInMinimap([mu[i][0], mu[i][1], sigma[i][0], sigma[i][1]]);
		}
		//
		
		return [this.building_coords, this.cluster_assignments];
	};

	this.groupedMap = function(groups, by_function, by_colors, buildings) {
		var BUILDINGS = buildings ? buildings : 5;
		
		this.clusters = groups;
		this.building_coords = [];
		this.cluster_assignments = [];
		this.group_colors = [];
		if (!by_colors) {
			for (var i = 0; i < groups; i++) this.group_colors.push(0xffffff);
		}
		else {
			this.group_colors = rndColors(groups);
		}
		
		var fnames = function_name_groups.slice();
		fnames[0] = shuffle(fnames[0]);
		fnames[1] = shuffle(fnames[1]);
		
		var mu = new Array(groups), sigma = new Array(groups);
		for (var i=0; i<groups; i++) {
			var pos = rndNotTooClose(mu, randomDist, randomDist, MINGROUPDIST);
			mu[i] = [pos[0], pos[1]];
			sigma[i] = [randomDist(MAXGROUPSIZE, MINGROUPSIZE), randomDist(MAXGROUPSIZE, MINGROUPSIZE)];
		}

		function_numbers = [0,0,0];
		
		var permuted_id = shuffle(BUILDINGS);
		
		var colors = [], functions = [];
		for (var i=0; i<BUILDINGS; i++) {
			var clid = permuted_id[i]%groups; 
			var c = this.group_colors[clid];
			
			var pos = rndNotTooClose(this.building_coords, function() {return normal_random(mu[clid][0], sigma[clid][0]);}, function() {return normal_random(mu[clid][1], sigma[clid][1]);});
			this.building_coords.push([pos[0], pos[1]]);
			this.cluster_assignments.push(clid);
			
			if (by_function) {
				function_numbers[clid]++;
				functions.push(fnames[clid][function_numbers[clid]]);
			}
			if (!by_function || by_colors) {
				function_numbers[0]++;
				functions.push(fnames[0][function_numbers[0]]);
				colors.push(c);
			}
		}
		this.renderMap(this.building_coords, colors, functions);
		
		//
		for (var i=0; i<groups; i++) {
			this.renderClusterInMinimap([mu[i][0], mu[i][1], sigma[i][0], sigma[i][1]]);
		}
		//
		
		return [this.building_coords, this.cluster_assignments];
	};
	
	var eqclusters2 = [[1,1,0,0,0,0], [0,0,0,1,1,0], [0,0,0,0,1,1], [1,0,0,1,0,0], [0,1,0,0,0,1]];
	var eqclusters3 = [[1,1,0,0,0,2], [0,0,0,1,1,2], [0,0,0,2,1,1], [1,0,0,1,0,1], [0,1,0,2,0,1]];
	var eqclusters;
	this.regularMap = function(groups, by_function) {
		//
		//if (!equidistant) equidistant = false; // equidistant, or added position noise
		var equidistant = true; //always equidistant
		
		var gridsize = 3;
		eqclusters = groups == 2 ? eqclusters2 : eqclusters3; 
		
		//var BUILDINGS = 4 + Math.round(Math.random()); // buildings: 4 || 5
		var BUILDINGS = 5;
		//var rect = Math.round(Math.random()); // rectangular or triangular
		var rect = 0; //always triangular
		
		this.clusters = groups;
		this.building_coords = [];
		this.cluster_assignments = [];
		this.group_colors = by_function ? [] : rndColors(groups);
		if (by_function)
			for (var i = 0; i < groups; i++) this.group_colors.push(0xffffff);
		
		var fnames = function_name_groups.slice();
		fnames[0] = shuffle(fnames[0]);
		fnames[1] = shuffle(fnames[1]);
		
		var d = MINDIST*2 + Math.random()*DEFAULTDIST;
		
		var rndi = Math.floor(Math.random()*eqclusters.length);
		var clid_vec = groups ? eqclusters[rndi] : [0,0,0,0,0,0];
		var oc = clid_vec;
		var colors = [], functions = [];
		
		//alert(groups+"\n"+rndi);

		function_numbers = [0,0,0];
		
		var j = 0;
		for (var i=3; i<BUILDINGS+4; i++) {
			if (i==5) continue;
			
			var xi = Math.floor(i/gridsize), yi = (i%gridsize);
			if (rect)
				var hx = xi * d, hy = yi * d; // rectangular
			else
				var hx = xi * d + (yi%2)*d/2, hy = yi * d * Math.sqrt(3)/2; // triangular grid
			var clid = clid_vec[i-3];
			var c = this.group_colors[clid];
			
			if (!equidistant) {
				hx += Math.random()*d/2 - d/4;
				hy += Math.random()*d/2 - d/4;
			}

			this.building_coords.push([hx, hy]);
			this.cluster_assignments.push(clid);
			if (by_function) {
				function_numbers[clid]++;
				functions.push(fnames[clid][function_numbers[clid]]);
			}
			else {
				function_numbers[0]++;
				functions.push(fnames[0][function_numbers[0]]);
				colors.push(c);
			}
		}
		this.renderMap(this.building_coords, colors, functions);
		
		return [this.building_coords, this.cluster_assignments];
	};
	
	
	var tspeqclusters2 = [[1,1,0,1,1,0,0,0,0], [0,0,0,1,1,0,1,1,0], [0,1,1,0,1,1,0,0,0], [0,0,0,0,1,1,0,1,1]];
	var tspeqclusters3 = [[1,1,2,1,1,2,0,0,2], [2,2,2,1,1,0,1,1,0], [0,1,1,0,1,1,2,2,2], [2,0,0,2,1,1,2,1,1]];
	var tspeqclusters;
	this.regularTspMap = function(groups, buildings) {
		//
		var equidistant = false; // equidistant, or added position noise
		
		var gridsize = 3;
		tspeqclusters = groups == 2 ? tspeqclusters2 : tspeqclusters3; 
		
		var rect = Math.round(Math.random()); // rectangular or triangular
		
		this.clusters = groups;
		this.building_coords = [];
		this.cluster_assignments = [];
		this.group_colors = rndColors(groups);
		
		var fnames = shuffle(function_name_groups.slice());
		fnames[0] = shuffle(fnames[0]);
		fnames[1] = shuffle(fnames[1]);
		
		var d = MINDIST*2 + Math.random()*DEFAULTDIST;
		
		var rndi = Math.floor(Math.random()*tspeqclusters.length);
		
		//alert((groups == 2 ? "tspeqclusters2" : "tspeqclusters3") + "\n" + rndi + "\n" + tspeqclusters[rndi]);
		
		var clid_vec = groups ? tspeqclusters[rndi] : [0,0,0,0,0,0];
		var oc = clid_vec;
		var colors = [], functions = [];
		
		function_numbers = [0,0,0];
		
		var j = 0;
		for (var i=0; i<buildings; i++) {
			var xi = Math.floor(i/gridsize), yi = (i%gridsize);
			if (rect)
				var hx = xi * d, hy = yi * d; // rectangular
			else
				var hx = xi * d + (yi%2)*d/2, hy = yi * d * Math.sqrt(3)/2; // triangular grid
			var clid = clid_vec[i];
			var c = this.group_colors[clid];
			
			if (!equidistant) {
				hx += Math.random()*d/2 - d/4;
				hy += Math.random()*d/2 - d/4;
			}

			this.building_coords.push([hx, hy]);
			this.cluster_assignments.push(clid);
			colors.push(c);
		}
		this.renderMap(this.building_coords, colors, functions);
		
		return [this.building_coords, this.cluster_assignments];
	};

	this.renderMap = function(coords, colors, functions) {
		this.building_coords = coords;
		this.building_colors = colors;
		this.building_functions = functions;
		for (var i = 0; i < coords.length; i++) {
			var f = functions&&functions.length>0 ? functions[i] : ("Building "+(i+1));
			this.labels.push(f);
			if (colors) {
				addHouse(f, coords[i][0], coords[i][1], colors[i]);
			}
			else {
				addHouse(f, coords[i][0], coords[i][1]);				
			}
		}
		this.renderMinimap(coords, colors);
		return coords;
	};
	
	this.renderMinimap = function(coords, colors) {
		var html = "";
		for (var i = 0; i < objects.length; i++) {
			var c = minimapCoords([objects[i].position.x, objects[i].position.z]);
			var col = colors && colors[i] ? intToCol(colors[i]) : "#ffffff";
			html += "<div class='dot' style='left:"+c[0]+"px;top:"+c[1]+"px;height:"+c[2]+"px;width:"+c[3]+"px;background:"+col+"' title='"+this.labels[i]+"'></div>";
			try {
				html += "<div class='dotlabel' style='left:"+(c[0]+3)+"px;top:"+c[1]+"px;color:"+col+"' title='"+this.labels[i]+"'>"+this.labels[i].charAt(0)+this.labels[i].charAt(this.labels[i].length-1)+"</div>";
			}
			catch (e) {
				alert(e);
			}
		}
		var c = minimapCoords([controls.getObject().position.x, controls.getObject().position.z]);
		html += "<div id='me' class='dot' style='left:"+c[0]+"px;top:"+c[1]+"px;border:1px solid red;'></div>";
		$("#minimap").html(html);
		
		$("#minimap").show();
	};
	this.renderClusterInMinimap = function(c) {
		for (var i=0; i<c.length; i++) c[i]/=DISTSCALE;
		c[0]-=c[2]/2;
		c[1]-=c[3]/2;
		c = minimapCoords(c);
		$("#minimap").html($("#minimap").html()+"<div class='dot gauss' style='left:"+c[0]+"px;top:"+c[1]+"px;height:"+c[2]+"px;width:"+c[3]+"px;background-color: rgba(0, 255, 255, 0.15);-webkit-border-radius: 1000px; -moz-border-radius: 1000px; border-radius: 1000px;'></div>");
	};
	
	this.update = function() {
		if ($("#me")) {
			var c = minimapCoords([controls.getObject().position.x, controls.getObject().position.z]);
			$("#me").css({left: c[0], top: c[1]});
		}
	};
	
	this.clearMap = function() {
		for (var i = 0; i < objects.length; i++) {
			scene.remove(objects[i]);
		}
		while (objects.length > 0) {
			objects.pop();
		}
		
		this.building_coords=[];
		this.cluster_assignments=[];
		this.labels=[];
	};
};

/////////////////////////

function minimapCoords(c) {
	if (c.length < 4) {
		c[2] = c[3] = buildingwidthpx;
	}
	var M=2;
	return [Math.round(c[0]*MINIMAPSIZE/FOGRANGE*M+5), Math.round(c[1]*MINIMAPSIZE/FOGRANGE*M+5), Math.round(c[2]*MINIMAPSIZE/FOGRANGE*M), Math.round(c[3]*MINIMAPSIZE/FOGRANGE*M)];
}

function addHouse(houselabel, hx, hz, color) { //hx and hz in m
	var chouse = houses[defaulthouse].clone();
	chouse.children[0].children[1].material = chouse.children[0].children[1].material.clone(); //otherwise houses share material
	
	chouse.position.set(hx / DISTSCALE, 0, hz / DISTSCALE); // convert between m and units
	chouse.scale.set(HOUSESCALE, HOUSESCALE, HOUSESCALE);
	bbox = getBoundingBox(chouse);
	
	var lbl = houselabel;
	var text1 = get3DText(lbl, (bbox.max.z-bbox.min.z)/2);
	chouse.add(text1);
	var text2 = get3DText(lbl, bbox.min.z-0.01, Math.PI);
	chouse.add(text2);
	
	if (color) {
		setHouseColor(chouse, color);
	}
	
	scene.add(chouse);
	objects.push(chouse);
	
	return chouse;
}

// distance helper functions

function getDistance(x1, z1, x2, z2) { 
	//var x1 = o1.position.x, x2 = o2.position.x, z1 = o1.position.z, z2 = o2.position.z;
	return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(z2-z1, 2));
}

function getEdgeDistance(o1, o2) { // in m
	if (!o1 || !o2) return null;
	var x1 = o1.position.x, x2 = o2.position.x, z1 = o1.position.z, z2 = o2.position.z;
	var l = buildingwidthpx / 2;
	var v1 = [new THREE.Vector2(x1 + l, z1 + l), new THREE.Vector2(x1 + l, z1 - l), new THREE.Vector2(x1 - l, z1 + l), new THREE.Vector2(x1 - l, z1 - l)];
	var v2 = [new THREE.Vector2(x2 + l, z2 + l), new THREE.Vector2(x2 + l, z2 - l), new THREE.Vector2(x2 - l, z2 + l), new THREE.Vector2(x2 - l, z2 - l)];
	
	var d = leastDistance(v1, v2)*DISTSCALE;
	return d;
	//return (Math.sqrt(Math.pow(dx, 2) + Math.pow(dz, 2))*DISTSCALE - buildingwidth*DISTSCALE);
}

function getPointToEdgeDistance(o1, o2) { // in m
	var x1 = o1.position.x, x2 = o2.position.x, z1 = o1.position.z, z2 = o2.position.z;
	var l = buildingwidthpx / 2;
	var v1 = [new THREE.Vector2(x1, z1)];
	var v2 = [new THREE.Vector2(x2 + l, z2 + l), new THREE.Vector2(x2 + l, z2 - l), new THREE.Vector2(x2 - l, z2 + l), new THREE.Vector2(x2 - l, z2 - l)];
	
	var d = leastDistance(v1, v2)*DISTSCALE;
	return d;
	//return (Math.sqrt(Math.pow(dx, 2) + Math.pow(dz, 2))*DISTSCALE - buildingwidth*DISTSCALE);
}

function leastDistance(v1, v2) {
	var mind = Infinity;
	for (var i = 0; i < v1.length; i++) {
		for (var j = 0; j < v2.length; j++) {
			var d = Math.sqrt(Math.pow(v2[j].x-v1[i].x, 2)+Math.pow(v2[j].y-v1[i].y, 2));
			if (d < mind) {
				mind = d;
			}
		}
	}
	return mind;
}

// helper functions for generating random positions, clusters, and colors

var tooClose = function(coords, nx, ny, mind) {
	if (!mind) mind = MINDIST;
	for (var i = 0; i < coords.length; i++) {
		if (coords[i] && coords[i][0] && getDistance(coords[i][0], coords[i][1], nx, ny) < mind) {
			return true;
		}
	}
	return false;
};
var rndNotTooClose = function(coords, rndFunctionX, rndFunctionY, mind) {
	if (!rndFunctionY) rndFunctionY = rndFunctionX;
	var maxtries = 1000;
	var j = 0;
	var x = 0,y;
	do {
		x = rndFunctionX();
		y = rndFunctionY();
	} while(tooClose(coords, x, y, mind) && j++ < maxtries);
	if (j>=maxtries) {
		//alert("Error: buildings too close!");
		var maxx = -Infinity, maxy = -Infinity;
		for (var i=0; i<coords.length; i++) {
			if (coords[i]) {
				if (coords[i][0]>maxx) maxx=coords[i][0];
				if (coords[i][1]>maxy) maxy=coords[i][1];
			}
		}
		x = maxx+mind/Math.sqrt(2);
		y = maxy+mind/Math.sqrt(2);
	}
	if (isNaN(x) || isNaN(y)) return rndNotTooClose(coords, rndFunctionX, rndFunctionY, mind);
	return [x, y];
};
/*
var rndGridClusters = function(gridsize, no_clusters) {
	var cmap = [];
	for (var i=0; i<gridsize; i++) {
		cmap[i]=[];
		for (var j=0; j<gridsize; j++) {
			cmap[i][j]=0;
		}	
	}
	
	if (!no_clusters) return cmap;
	
	var S = 2;
	var xs = Math.round(Math.random()*(gridsize - S));
	var ys = Math.round(Math.random()*(gridsize - S));
	for (var i=0; i<gridsize; i++) {
		for (var j=0; j<gridsize; j++) {
			if (i >= xs && i < xs+S && j >= ys && j < ys+S) cmap[i][j]=1;
			//else {
			//	cmap[i][j]=2+Math.round(Math.random()*(no_clusters-2));
			//}
		}
	}
	return cmap;
};*/

//var coldist = function(col1, col2) {
var moddist = function(c1, c2) {
	return Math.min((c1-c2+256)%256, (c2-c1+256)%256);
};
var coldist = function(r1, g1, b1, r2, g2, b2) {
	//var r1=Math.floor(col1/65536), g1=Math.floor(col1/256)%256, b1=col1%256;
	//var r2=Math.floor(col2/65536), g2=Math.floor(col2/256)%256, b2=col2%256;
	return Math.sqrt(Math.pow(moddist(r1, r2), 2) + Math.pow(moddist(g1, g2), 2) + Math.pow(moddist(b1, b2), 2));
};

var mincoldist = function(rgbs, r, g, b) {
	var mind = Infinity;
	var rgbs2 = rgbs;
	//rgbs2.push([255, 255, 255]);
	for (var i=0; i<rgbs2.length; i++) {
		var d = coldist(rgbs2[i][0], rgbs2[i][1], rgbs2[i][2], r, g, b);
		if (d < mind) mind = d;
	}
	return mind;
};

var rndColors = function(n, MINDIST) {
//	var MINDIST = 150;
	if (!MINDIST) MINDIST = 150;
	var rgbs = [];
	var colors = [];
	var maxtries = 1000;
	for (var i=0; i<n; i++) {
		var r, g, b;
		var j=0;
		do {
			r = Math.floor(Math.random()*256);
			g = Math.floor(Math.random()*256);
			b = Math.floor(Math.random()*256);
		} while (mincoldist(rgbs, r, g, b) < MINDIST && j++ < maxtries);
		rgbs.push([r, g, b]);
		colors.push(65536*r+256*g+b);
	}
	return colors; 
};

function intToCol(i, len) {
	if (!i) 
		i=0;
	if (!len) len = 6;
	var col = i.toString(16);
	while (col.length < len) col += "0";
	return "#"+col;
}

function interpolateColor(fraction, col1, col2) {
	var r1=Math.floor(col1/65536), g1=Math.floor(col1/256)%256, b1=col1%256;
	var r2=Math.floor(col2/65536), g2=Math.floor(col2/256)%256, b2=col2%256;
	var dr = (r2 - r1), dg = (g2 - g1), db = (b2 - b1); 
	var r = Math.round(r1 + dr*fraction)%256, g = Math.round(g1 + dg*fraction)%256, b = Math.round(b1 + db*fraction)%256;
	return (65536*r+256*g+b);
}


function normalcase(arr) {
	for (var i = 0; i < arr.length; i++) {
		arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].substring(1).toLowerCase();
	}
	return arr;
}

function append(arr, str) {
	for (var i = 0; i < arr.length; i++) {
		arr[i] = arr[i] + str;
	}
	return arr;
}