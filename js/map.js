var DEFAULTDIST = 250;
var MAXGROUPSIZE = 400, MINGROUPSIZE = 200, MINGROUPDIST = 300;

var function_names = ["Customer", "Restaurant", "Gas Station", "Tuning Shop"];

Map = function() {
	this.building_coords=[];
	this.cluster_ids=[];
	this.clusters = 0;
	this.labels=[];
	this.group_colors = [0xffffff];
	
	this.getIdsByCluster = function(cluster) {
		var ids = [];
		for (var i = 0; i < this.cluster_ids.length; i++) {
			if (this.cluster_ids[i] == cluster)
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
		return Math.round(getEdgeDistance(objects[0], objects[1]));
	};
	
	this.randomMap = function(n) {
		this.building_coords = [];
		for (var i=0; i<n; i++) {
			var pos = rndNotTooClose(this.building_coords, function() {return randomDist(DEFAULTDIST*2);});
			this.building_coords.push([pos[0], pos[1]]);
			this.cluster_ids.push(0);
		}
		this.renderMap(this.building_coords);
		return [this.building_coords, null];
	};

	this.groupedMap = function(groups, by_function) {
		var BUILDINGS = 7;
		
		this.clusters = groups;
		this.building_coords = [];
		this.cluster_ids = [];
		this.group_colors = [];
		for (var i = 0; i < groups; i++) this.group_colors.push(0xffffff);
		
		var mu = new Array(groups), sigma = new Array(groups);
		for (var i=0; i<groups; i++) {
			var pos = rndNotTooClose(mu, randomDist, randomDist, MINGROUPDIST);
			mu[i] = [pos[0], pos[1]];
			sigma[i] = [randomDist(MAXGROUPSIZE, MINGROUPSIZE), randomDist(MAXGROUPSIZE, MINGROUPSIZE)];
		}

		var permuted_id = [];
		for (var i=0; i<BUILDINGS; i++) {
			permuted_id.push(i);
		}
		permuted_id = shuffle(permuted_id);
		
		var colors = [], functions = [];
		for (var i=0; i<BUILDINGS; i++) {
			var group = permuted_id[i]%groups; 
			var c = group_colors[clid];
			
			var pos = rndNotTooClose(this.building_coords, function() {return normal_random(mu[group][0], sigma[group][0]);}, function() {return normal_random(mu[group][1], sigma[group][1]);});
			this.building_coords.push([pos[0], pos[1]]);
			this.cluster_ids.push(group);
			
			if (by_function)
				functions.push(function_names[permuted_id[i]%function_names.length]);
			else
				colors.push(c);
		}
		//this.renderMap(this.building_coords, colors, functions);
		this.renderMap(this.building_coords, colors);
		
		//
		for (var i=0; i<groups; i++) {
			this.renderClusterInMinimap([mu[i][0], mu[i][1], sigma[i][0], sigma[i][1]]);
		}
		//
		
		return [this.building_coords, this.cluster_ids];
	};
	
	var eqclusters = [[1,1,0,0,0,0], [0,0,0,1,1,0], [0,0,0,0,1,1], [1,0,0,1,0,0]];
	this.equidistantMap = function(groups) {
		var BUILDINGS = 5, gridsize = 3;
		
		this.clusters = groups;
		this.building_coords = [];
		this.cluster_ids = [];
		this.group_colors = groups ? rndColors(groups) : [0xffffff];
		
		var d = MINDIST*2 + Math.random()*DEFAULTDIST;
		
		var rndi = Math.round(Math.random()*eqclusters.length);
		var clid_vec = groups ? eqclusters[rndi] : [0,0,0,0,0,0];
		var oc = clid_vec;
		var colors = [];
		
		for (var i=3; i<9; i++) {
			if (i==5) continue;
			
			var xi = Math.floor(i/gridsize), yi = (i%gridsize);
			//var hx = xi * d, hy = yi * d; // rectangular
			var hx = xi * d + (yi%2)*d/2, hy = yi * d * Math.sqrt(3)/2; // triangular grid
			var clid;
			try {
				var clid = clid_vec[i-3];
			} 
			catch (exc) {
				clid = groups?eqclusters[rndi][i-3]:0;
			}
			var c = this.group_colors[clid];

			this.building_coords.push([hx, hy]);
			colors.push(c);
			this.cluster_ids.push(clid);
		}
		this.renderMap(this.building_coords, colors);
		
		return [this.building_coords, this.cluster_ids];
	};

	this.renderMap = function(coords, colors, functions) {
		for (var i = 0; i < coords.length; i++) {
			var f = functions ? functions[i] : ("Building "+(i+1));
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
			html += "<div class='dotlabel' style='left:"+(c[0]+3)+"px;top:"+c[1]+"px;color:"+col+"' title='"+this.labels[i]+"'>"+(i+1)+"</div>";
		}
		var c = minimapCoords([controls.getObject().position.x, controls.getObject().position.z]);
		html += "<div id='me' class='dot' style='left:"+c[0]+"px;top:"+c[1]+"px;border:1px solid red;'></div>";
		$("#minimap").html(html);
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
		this.cluster_ids=[];
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
	var x1 = o1.position.x, x2 = o2.position.x, z1 = o1.position.z, z2 = o2.position.z;
	var l = buildingwidthpx / 2;
	var v1 = [new THREE.Vector2(x1 + l, z1 + l), new THREE.Vector2(x1 + l, z1 - l), new THREE.Vector2(x1 - l, z1 + l), new THREE.Vector2(x1 - l, z1 - l)];
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

var rndColors = function(n) {
	var MINDIST = 150;
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

function intToCol(i) {
	var col = i.toString(16);
	while (col.length < 6) col += "0";
	return "#"+col;
}



// random

function normal_random(mean, variance) {
    if (mean == undefined)
        mean = 0.0;
    if (variance == undefined)
        variance = 1.0;
    var V1, V2, S;
    var j = 0;
    do {
        var U1 = Math.random();
        var U2 = Math.random();
        V1 = 2 * U1 - 1;
        V2 = 2 * U2 - 1;
        S = V1 * V1 + V2 * V2;
    } while (S > 1);

    X = Math.sqrt(-2 * Math.log(S) / S) * V1;
    X = mean + Math.sqrt(variance) * X;
    return X;
}