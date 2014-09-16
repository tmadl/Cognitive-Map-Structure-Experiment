Map = function() {
	var DEFAULTDIST = 250;
	var MINDIST = BUILDINGWIDTH*2;
	
	var MAXGROUPSIZE = 100, MINGROUPSIZE = 100;
	
	var rndpos = function(maxd, mind) {
		if (!maxd) maxd = DEFAULTDIST;
		if (!mind) mind = -maxd;
		return Math.random()*maxd*2 - mind;
	};
	
	this.getDistance = function(fromId, toId) {
		return Math.round(getEdgeDistance(objects[0], objects[1]));
	};
	
	this.randomMap = function(n) {
		var coords = [];
		for (var i=0; i<n; i++) {
			hx = hz = 0;
			while (hx == 0 || i == 1 && getDistance(hx, hz, objects[objects.length-1].position.x, objects[objects.length-1].position.z) < buildingwidthpx*2) {
				hx = rndpos();
				hz = rndpos();
			}
			coords.push([hx, hz]);
		}
		this.generateMap(coords);
		return coords;
	};

	this.groupedMap = function(n, groups) {
		var coords = [], colors = [];
		var mu = new Array(groups), sigma = new Array(groups);
		for (var i=0; i<groups; i++) {
			mu[i] = [rndpos(), rndpos()];
			sigma[i] = [rndpos(MAXGROUPSIZE, 0), rndpos(MAXGROUPSIZE, 0)];
		}

		for (var i=0; i<9; i++) {
			var group = Math.floor(Math.random()*groups); 
			var hx = normal_random(mu[group][0], sigma[group][0]);
			var hy = normal_random(mu[group][1], sigma[group][1]);
			var c = 0xffffff;

			coords.push([hx, hy]);
			colors.push(c);
		}
		this.generateMap(coords, colors);
		
		//
		for (var i=0; i<groups; i++) {
			this.addClusterToMinimap([mu[i][0], mu[i][1], sigma[i][0], sigma[i][1]]);
		}
		//
		
		return coords;
	};
	
	this.equidistantMap = function() {
		var coords = [], colors = [];
		var d = MINDIST + Math.random()*DEFAULTDIST;
		
		for (var i=0; i<9; i++) {
			var hx = Math.floor(i/3) * d;
			var hy = (i%3) * d;
			var c = 0xffffff;

			coords.push([hx, hy]);
			colors.push(c);
		}
		this.generateMap(coords, colors);
		return coords;
	};

	this.generateMap = function(coords, colors) {
		this.clearMap();
		for (var i = 0; i < coords.length; i++) {
			var house = addHouse(defaulthouse, coords[i][0], coords[i][1]);
			if (colors) {
				setHouseColor(house, colors[i]);
			}
		}
		this.generateMinimap(coords, colors);
		////data["exp"+exp_properties.expno]["task"+exp_properties.taskno].real_coords = coords;
		return coords;
	};
	
	this.generateMinimap = function(coords, colors) {
		var html = "";
		for (var i = 0; i < objects.length; i++) {
			var c = minimapCoords([objects[i].position.x, objects[i].position.z]);
			html += "<div class='dot' style='left:"+c[0]+"px;top:"+c[1]+"px;height:"+c[2]+"px;width:"+c[3]+"px;background:#"+colors[i].toString(16)+"'></div>";
		}
		var c = minimapCoords([controls.getObject().position.x, controls.getObject().position.z]);
		html += "<div id='me' class='dot' style='left:"+c[0]+"px;top:"+c[1]+"px;border:1px solid red;'></div>";
		$("#minimap").html(html);
	};
	this.addClusterToMinimap = function(c) {
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
	};
};

/////////////////////////

function minimapCoords(c) {
	if (c.length < 4) {
		c[2] = c[3] = buildingwidthpx;
	}
	return [Math.round(c[0]*MINIMAPSIZE/FOGRANGE+5), Math.round(c[1]*MINIMAPSIZE/FOGRANGE+5), Math.round(c[2]*MINIMAPSIZE/FOGRANGE), Math.round(c[3]*MINIMAPSIZE/FOGRANGE)];
}

function addHouse(houselabel, hx, hz, color) { //hx and hz in m
	house = houses[houselabel].clone();
	house.position.set(hx / DISTSCALE, 0, hz / DISTSCALE); // convert between m and units
	house.scale.set(HOUSESCALE, HOUSESCALE, HOUSESCALE);
	bbox = getBoundingBox(house);
	
	//var lbl = houselabel;
	var lbl = "obj"+objects.length;
	var text1 = get3DText(lbl, (bbox.max.z-bbox.min.z)/2);
	house.add(text1);
	var text2 = get3DText(lbl, bbox.min.z-0.01, Math.PI);
	house.add(text2);
	
	if (color) {
		setHouseColor(house, color);
	}
	
	scene.add(house);
	objects.push(house);
	
	return house;
}

function getDistance(x1, x2, z1, z2) { // in m
	//var x1 = o1.position.x, x2 = o2.position.x, z1 = o1.position.z, z2 = o2.position.z;
	return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(z2-z1, 2));
}

function getEdgeDistance(o1, o2) { // in m
	var x1 = o1.position.x, x2 = o2.position.x, z1 = o1.position.z, z2 = o2.position.z;
	var l = buildingwidth / 2;
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


function normal_random(mean, variance) {
    if (mean == undefined)
        mean = 0.0;
    if (variance == undefined)
        variance = 1.0;
    var V1, V2, S;
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