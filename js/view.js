var HOUSESCALE = 20;
var FOGRANGE = 10000;
var CAMERARANGE = FOGRANGE*1.25;

var DEFBUILDINGHEIGHT = 50;
var buildingheightpx = 286;
var DISTSCALE = DEFBUILDINGHEIGHT/buildingheightpx; // correct for rendered (286) vs. subjective (50m) building height
var buildingwidthpx = 150;
var BUILDINGWIDTH = buildingwidthpx * DISTSCALE;
var MINDIST = BUILDINGWIDTH*2; //minimum building distance

var houselabels = ['Apartments', 'Office highrise'];
var defaulthouse = houselabels[0];
var housenames = ['city3_h9_LOD', 'city3_h10_LOD'];
var modelpath = 'models/';

var MINIMAPSIZE = 100.0;

var loaded = false;
var camera, scene, renderer, raycaster;
var geometry, material, mesh;
var controls;

var myEvent = window.attachEvent || window.addEventListener;
var chkevent = window.attachEvent ? 'onbeforeunload' : 'beforeunload'; /// make IE7, IE8 compitable

            myEvent(chkevent, function(e) { // For >=IE7, Chrome, Firefox
                var confirmationMessage = 'Are you sure to leave the page?';  // a space
                (e || window.event).returnValue = confirmationMessage;
                return confirmationMessage;
            });

onerror = function(msg, url, line) {
    alert ("error: " + msg + "\n" + "file: " + url + "\n" + "line: " + line);
    return true;    // avoid to display an error message in the browser
};

function setupScene() {

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, CAMERARANGE );

	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0xffffff, 0, FOGRANGE );

	scene.add(new THREE.HemisphereLight(0x8888FF, 0xAAAA99, 1));

	controls = new THREE.PointerLockControls( camera );
	controls.jumpingOn = false;
	scene.add( controls.getObject() );

	raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

	// floor
	geometry = new THREE.PlaneGeometry( 15000, 15000, 100, 100 );
	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
	material = new THREE.MeshBasicMaterial( { color: 0xAAAA99 } );

	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );

	//

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0xffffff );
	renderer.setSize( window.innerWidth, window.innerHeight );

	document.body.appendChild( renderer.domElement );

	window.addEventListener( 'resize', onWindowResize, false );

	//
	animate();
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {
	detectCollision();

	requestAnimationFrame( animate );

	controls.update();

	renderer.render( scene, camera );

	if (experiment)
		experiment.update();
}

function detectCollision() {
	unlockAllDirection();

	var rotationMatrix;
	var cameraDirection = controls.getDirection(new THREE.Vector3(0, 0, 0)).clone();

	if (controls.moveForward()) {
		// Nothing to do!
	}
	else if (controls.moveBackward()) {
		rotationMatrix = new THREE.Matrix4();
		rotationMatrix.makeRotationY(180 * Math.PI / 180);
	}
	else if (controls.moveLeft()) {
		rotationMatrix = new THREE.Matrix4();
		rotationMatrix.makeRotationY(90 * Math.PI / 180);
	}
	else if (controls.moveRight()) {
		rotationMatrix = new THREE.Matrix4();
		rotationMatrix.makeRotationY((360-90) * Math.PI / 180);
	}
	else return;

	if (rotationMatrix !== undefined){
		cameraDirection.applyMatrix4(rotationMatrix);
	}

	var rayCaster = new THREE.Raycaster(controls.getObject().position, cameraDirection);
	var intersects = rayCaster.intersectObjects(objects, true); //accurate but slow
	if (intersects.length > 0 && intersects[0].distance < 40)
		lockDirection();
}

function lockDirection() {
	if (controls.moveForward()) {
		controls.lockMoveForward(true);
	}
	else if (controls.moveBackward()) {
		controls.lockMoveBackward(true);
	}
	else if (controls.moveLeft()) {
		controls.lockMoveLeft(true);
	}
	else if (controls.moveRight()) {
		controls.lockMoveRight(true);
	}
}

function unlockAllDirection(){
	controls.lockMoveForward(false);
	controls.lockMoveBackward(false);
	controls.lockMoveLeft(false);
	controls.lockMoveRight(false);
}

function getBoundingBox(obj) {
	var minX = Infinity, minY = Infinity, minZ = Infinity;
	var maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

	obj.traverse (function (msh)
    {
        if (msh instanceof THREE.Mesh)
        {
            msh.geometry.computeBoundingBox();
            var bBox = msh.geometry.boundingBox;

            // compute overall bbox
            minX = Math.min (minX, bBox.min.x);
            minY = Math.min (minY, bBox.min.y);
            minZ = Math.min (minZ, bBox.min.z);
            maxX = Math.max (maxX, bBox.max.x);
            maxY = Math.max (maxY, bBox.max.y);
            maxZ = Math.max (maxZ, bBox.max.z);
        }
    });

    var bBox_min = new THREE.Vector3 (minX, minY, minZ);
    var bBox_max = new THREE.Vector3 (maxX, maxY, maxZ);
    var bBox_new = new THREE.Box3 (bBox_min, bBox_max);
    return bBox_new;
}

function get3DText(str, zOffset, rotate) {
	if (!zOffset) zOffset = 4;
	if (!rotate) rotate = 0;

	var text3d = new THREE.TextGeometry( str, {
		size: 0.4,
		height: 0,
		curveSegments: 2,
		font: "helvetiker"
	});
	text3d.computeBoundingBox();
	var centerOffset = -0.5 * ( text3d.boundingBox.max.x - text3d.boundingBox.min.x );
	var textMaterial = new THREE.MeshBasicMaterial( { color: 0xdddddd, overdraw: 0.5 } );
	var text = new THREE.Mesh( text3d, textMaterial );
	if (rotate) {
		text.rotation.set(0, rotate, 0);
		centerOffset *= -1;
	}
	text.position.x = centerOffset;
	text.position.y = 1.5;
	text.position.z = zOffset;
	return text;
}


function setHouseColor(o, r, g, b) {
	if (g && b) {
		o.children[0].children[1].material.color.setHex(65536*r+256*g+b);
	}
	else if (r) {
		if (typeof r == "number")
			o.children[0].children[1].material.color.setHex(r);
		else
			o.children[0].children[1].material.color.setHex(65536*r[0]+256*r[1]+r[2]);
	}
	else {
		o.children[0].children[1].material.color.setHex(0xffffff);
	}
}

var dollars = null;
function loadHouses() {
	for (i=0; i<houselabels.length; i++) {
		// texture
		var manager = new THREE.LoadingManager();
		manager.onProgress = function ( item, loaded, total ) {
			console.log( item, loaded, total );
		};

		// model
		var loader = new THREE.OBJMTLLoader();
		var path = modelpath+housenames[i];
		(function(i) {
			loader.load(path+".obj", path+".mtl", function ( object ) {
				var label = houselabels[i];
				houses[label] = object;
				// everything loaded?
				if (Object.keys(houses).length == houselabels.length && !loaded) {	//} && dollars != null) {
					$("#starter").show();
					$("#loader").hide();
					loaded = true;
					init();
				}
			}, function(progress) {
				var portion = 100/houselabels.length;
				var already_loaded = portion * Object.keys(houses).length;
				var p = 0.1*Math.round(10*(already_loaded + portion/progress.total*progress.loaded));
				$("#progress").text(p);
			});
		}(i));
	}

}

// pointer lock

document.exitPointerLock = document.exitPointerLock    ||
                           document.mozExitPointerLock ||
                           document.webkitExitPointerLock;

var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions_center' );
// http://www.html5rocks.com/en/tutorials/pointerlock/intro/
var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
if ( havePointerLock ) {
	var element = document.body;
	var pointerlockchange = function ( event ) {
		if (!mapcanvasshown) {
			if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
				if (experiment.blocked) instructions.style.display = 'none';
				else {
					controls.enabled = true;
					blocker.style.display = 'none';
					controls.setDirection( 0, 0, 0 );
				}
			} else {
				controls.enabled = false;
				blocker.style.display = '-webkit-box';
				blocker.style.display = '-moz-box';
				blocker.style.display = 'box';
				instructions.style.display = '';
			}
		}
	};
	var pointerlockerror = function ( event ) {
		//alert("error");
		controls.enabled = false;
		blocker.style.display = '-webkit-box';
		blocker.style.display = '-moz-box';
		blocker.style.display = 'box';
		instructions.style.display = '';
	};
	// Hook pointer lock state change events
	document.addEventListener( 'pointerlockchange', pointerlockchange, false );
	document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
	document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
	document.addEventListener( 'pointerlockerror', pointerlockerror, false );
	document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
	document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
	instructions.addEventListener( 'click', function ( event ) {
		instructions.style.display = 'none';
		if (loaded && !experiment.blocked) {
			// Ask the browser to lock the pointer
			lockPointer();
		}
	}, false );
} else {
	instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
}
function lockPointer() {
	element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
	if ( /Firefox/i.test( navigator.userAgent ) ) {
		var fullscreenchange = function ( event ) {
			if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {
				document.removeEventListener( 'fullscreenchange', fullscreenchange );
				document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
				element.requestPointerLock();
			}
		};
		document.addEventListener( 'fullscreenchange', fullscreenchange, false );
		document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );
		element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
		element.requestFullscreen();
	} else {
		element.requestPointerLock();
	}
}

$(document).on("keydown", function (e) {
	if (sw) {
		$(".confirm").click();
	}

	v=$("#distance").val();
	if (e.which === 8 && !$(e.target).is("input, textarea")) {
    	e.preventDefault();
    	//if (controls.enabled)
    	{ // help delete from distance judgment
			$("#distance").val(v.substring(0, v.length-1));
		}
	}
	else if (e.which >= '0'.charCodeAt(0) && e.which <= '9'.charCodeAt(0)  && !$(e.target).is("input, textarea")) {
		//if (controls.enabled)
		{ // pointer is locked; help enter distance judgment
			$("#distance").val(v+String.fromCharCode(e.which));
		}
	}
	else if (e.which == 13 && !sw) {
		e.preventDefault();
		event.stopPropagation();
		experiment.onEnter();
	}
	else if (e.which == 69) {
		experiment.onUse();
	}

	sw = false;
});


$(document).ready(function() {
	$("#starter").hide();
	loadHouses();
});

var sw = false;
function swalert(str1, str2) {
	setTimeout(function() {sw = true;swal(str1, str2?str2:"");}, 100);
}