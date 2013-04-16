var Workshop = function() {
	var container, stats;

	var camera, scene, renderer, objects;
	var pointLight;

	var sphere;

	var targetRotation = 0;
	var targetRotationOnMouseDown = 0;

	var mouseX = 0;
	var mouseXOnMouseDown = 0;

	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;

	var moveForward = false;
	var moveBackwards = false;
	var moveLeft = false;
	var moveRight = false;
	var moveUp = false;
	var moveDown = false;

	var targetMoveLeft = false;
	var targetMoveRight = false;
	var targetMoveUp = false;
	var targetMoveDown = false;

	var debugContext;

	var objectIndex = 0;
	var editObjects = false;
	var objectBlinker = false;
	var lastTime = 0;

	var plane;
	var ball = {
		object : null,
		inMotion : false,
		direction : 1,
		speed : 16,
		bounceCounter : 0,
		bounceSpeed : 0.05,
		maxHeight : 400,
		xVelocity : 0
	};
	var MAX_X = 10.0;

	var showSpheres = false;
	var showLights = true;
	var showGrid = true;
	var showDebug = false;
	var showStats = true;
	var showHand = true;
	var showBall = true;

	init();
	animate();

	function init() {

		container = document.createElement('div');
		document.body.appendChild(container);

		camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
		camera.position.set(0, 150, 400);
		camera.position.z += 1000;
		camera.target = new THREE.Vector3(0, 150, 0);

		scene = new THREE.Scene();

		// Grid

		if (showGrid) {
			var size = 500, step = 100;

			var geometry = new THREE.Geometry();

			for (var i = -size; i <= size; i += step) {

				geometry.vertices.push(new THREE.Vector3(-size, 0, i));
				geometry.vertices.push(new THREE.Vector3(size, 0, i));

				geometry.vertices.push(new THREE.Vector3(i, 0, -size));
				geometry.vertices.push(new THREE.Vector3(i, 0, size));

			}

			var material = new THREE.LineBasicMaterial({
				color : 0x000000,
				opacity : 0.5
			});

			var line = new THREE.Line(geometry, material);
			line.type = THREE.LinePieces;
			scene.add(line);
		}

		// Objects

		objects = [];

		if (showSpheres) {

			geometry = new THREE.IcosahedronGeometry(100, 1);

			material = new THREE.MeshBasicMaterial({
				envMap : THREE.ImageUtils.loadTexture('textures/metal.jpg', new THREE.SphericalReflectionMapping()),
				overdraw : true
			});

			for (var i = 0; i < 10; i++) {

				sphere = new THREE.Mesh(geometry, material);

				sphere.position.x = Math.random() * 1000 - 500;
				sphere.position.y = Math.random() * 1000 - 500;
				sphere.position.z = Math.random() * 1000 - 500;

				sphere.rotation.x = Math.random() * 200 - 100;
				sphere.rotation.y = Math.random() * 200 - 100;
				sphere.rotation.z = Math.random() * 200 - 100;

				sphere.scale.x = sphere.scale.y = sphere.scale.z = Math.random() + 0.5;

				objects.push(sphere);

				scene.add(sphere);

			}
		}

		if (showHand) {
			plane = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshBasicMaterial({
				color : 0x0000ff,
				opacity : 0.5
			}));
			plane.overdraw = true;
			plane.material.side = THREE.DoubleSide;
			scene.add(plane);
		}

		if (showBall) {
			console.log("a");
			geometry = new THREE.IcosahedronGeometry(100, 1);

			material = new THREE.MeshBasicMaterial({
				envMap : THREE.ImageUtils.loadTexture('textures/metal.jpg', new THREE.SphericalReflectionMapping()),
				overdraw : true
			});

			ball.object = new THREE.Mesh(geometry, material);
			ball.object.scale.x = ball.object.scale.y = ball.object.scale.z = 0.1;
			ball.object.position.z = -500;
			scene.add(ball.object);
			console.log("b");
		}

		// Lights

		if (showLights) {
			var ambientLight = new THREE.AmbientLight(Math.random() * 0x202020);
			scene.add(ambientLight);

			var directionalLight = new THREE.DirectionalLight(Math.random() * 0xffffff);
			directionalLight.position.x = Math.random() - 0.5;
			directionalLight.position.y = Math.random() - 0.5;
			directionalLight.position.z = Math.random() - 0.5;
			directionalLight.position.normalize();
			scene.add(directionalLight);

			pointLight = new THREE.PointLight(0xff0000, 1);
			scene.add(pointLight);
		}

		renderer = new THREE.CanvasRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);

		container.appendChild(renderer.domElement);

		if (showDebug) {
			var debugCanvas = document.createElement('canvas');
			debugCanvas.width = 512;
			debugCanvas.height = 512;
			debugCanvas.style.position = 'absolute';
			debugCanvas.style.top = '0px';
			debugCanvas.style.left = '0px';

			container.appendChild(debugCanvas);

			debugContext = debugCanvas.getContext('2d');
			debugContext.setTransform(1, 0, 0, 1, 256, 256);
			debugContext.strokeStyle = '#000000';
		}

		if (showStats) {
			stats = new Stats();
			stats.domElement.style.position = 'absolute';
			stats.domElement.style.top = '0px';
			container.appendChild(stats.domElement);
		}

		document.addEventListener('keydown', onDocumentKeyDown, false);
		document.addEventListener('keyup', onDocumentKeyUp, false);

		//

		window.addEventListener('resize', onWindowResize, false);

	}

	function toggleEditObjects() {
		editObjects = !editObjects;
	}

	function selectNextObject() {
		if (editObjects) {
			if (++objectIndex >= objects.length) {
				objectIndex = 0;
			}
		}
	}

	function selectLastObject() {
		if (editObjects) {
			if (--objectIndex < 0) {
				objectIndex = objects.length - 1;
			}
		}
	}

	function onWindowResize() {

		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);

	}

	function onDocumentKeyDown(event) {
		console.log(event.keyCode)
		switch ( event.keyCode ) {

			case 38:
				// up
				moveForward = true;
				break;
			case 40:
				// down
				moveBackwards = true;
				break;
			case 37:
				// left
				moveLeft = true;
				break;
			case 39:
				// right
				moveRight = true;
				break;
			case 59:
				// ;
				moveUp = true;
				break;
			case 190:
				// .
				moveDown = true;
				break;
			case 65:
				// a
				targetMoveLeft = true;
				break;
			case 68:
				// d
				targetMoveRight = true;
				break;
			case 87:
				// w
				targetMoveUp = true;
				break;
			case 83:
				// s
				targetMoveDown = true;
				break;
			case 219:
				// [
				selectLastObject();
				break;
			case 221:
				// ]
				selectNextObject();
				break;
			case 80:
				// p
				toggleEditObjects();

		}

		// 86 = f
		// 70 = v
		// 83 = S
		// 87 = W
		// 68 = d
		// 65 = a
		// 59 = ;
		// 191 = /
	}

	function onDocumentKeyUp(event) {

		switch ( event.keyCode ) {

			case 38:
				// up
				moveForward = false;
				break;
			case 40:
				// down
				moveBackwards = false;
				break;
			case 37:
				// left
				moveLeft = false;
				break;
			case 39:
				// right
				moveRight = false;
				break;
			case 59:
				// ;
				moveUp = false;
				break;
			case 190:
				// .
				moveDown = false;
				break;
			case 65:
				// a
				targetMoveLeft = false;
				break;
			case 68:
				// d
				targetMoveRight = false;
				break;
			case 87:
				// w
				targetMoveUp = false;
				break;
			case 83:
				// s
				targetMoveDown = false;
				break;

		}

	}

	//

	function animate() {

		requestAnimationFrame(animate);

		updateCamera();
		render();

		if (showStats) {
			stats.update();
		}

	}

	function updateCamera() {
		if (moveForward)
			camera.position.z -= 10;
		if (moveBackwards)
			camera.position.z += 10;

		if (moveLeft)
			camera.position.x -= 10;
		if (moveRight)
			camera.position.x += 10;

		if (moveUp)
			camera.position.y += 10;
		if (moveDown)
			camera.position.y -= 10;

		if (targetMoveLeft)
			camera.target.x -= 10;
		if (targetMoveRight)
			camera.target.x += 10;
		if (targetMoveUp)
			camera.target.y += 10;
		if (targetMoveDown)
			camera.target.y -= 10;

		camera.lookAt(camera.target);

	}

	function render() {

		if (showDebug) {
			debugContext.clearRect(-256, -256, 512, 512);
			debugContext.beginPath();

			// center
			debugContext.moveTo(-10, 0);
			debugContext.lineTo(10, 0);
			debugContext.moveTo(0, -10);
			debugContext.lineTo(0, 10);

			// camera

			debugContext.moveTo(camera.position.x * 0.1, camera.position.z * 0.1);
			debugContext.lineTo(camera.target.x * 0.1, camera.target.z * 0.1);
			debugContext.rect(camera.position.x * 0.1 - 5, camera.position.z * 0.1 - 5, 10, 10);
			debugContext.rect(camera.target.x * 0.1 - 5, camera.target.z * 0.1 - 5, 10, 10);
			debugContext.rect(-50, -50, 100, 100);
		}

		for (var i = 0, l = objects.length; i < l; i++) {

			var object = objects[i];

			object.rotation.x += 0.01;
			object.rotation.y += 0.005;
			object.position.y = Math.sin(object.rotation.x) * 200;

			if (showDebug)
				debugContext.rect(object.position.x * 0.1 - 5, object.position.z * 0.1 - 5, 10, 10);

		}

		if (showBall) {
			updateBall();
		}

		if (showDebug) {
			debugContext.closePath();
			debugContext.stroke();
		}

		if (editObjects) {
			showObjectEditState();
		}

		renderer.render(scene, camera);

	}

	function updateBall() {
		if (ball.inMotion) {
			ball.object.position.z += ball.speed * ball.direction;

			ball.object.position.y = Math.abs(Math.cos(ball.bounceCounter)) * ball.maxHeight;

			ball.object.position.x += ball.xVelocity;

			ball.bounceCounter += ball.bounceSpeed;
			if (ball.bounceCounter > Math.PI * 2) {
				ball.bounceCounter = ball.bounceCounter - (Math.PI * 2);
			}

			console.log(ball.object.position.z + ' ... ' + plane.position.z);
			if (ball.object.position.z > plane.position.z) {
				//we're at the hand, bounce back
				if (lineDistance(ball.object.position, plane.position) < 60) {
					ball.direction *= -1;
				}
			} else if (ball.object.position.z < -810) {
				ball.direction *= -1;
			}

			if (ball.object.position.x > 400 && ball.xVelocity > 0) {
				ball.xVelocity *= -1;
			} else if (ball.object.position.x < -400 && ball.xVelocity < 0) {
				ball.xVelocity *= -1;
			}

		} else {

			ball.object.position.z = -500;
			ball.xVelocity = (Math.random() * MAX_X) * (Math.random() > 0.5 ? -1 : 1);

		}

	}

	function showObjectEditState() {
		if (objects[objectIndex]) {
			var d = new Date();
			if (d.getTime() > (lastTime + 1000)) {
				lastTime = d.getTime();
				objectBlinker = !objectBlinker;
				if (objectBlinker) {
					objects[objectIndex].material.opacity = 0.5;
				} else {
					objects[objectIndex].material.opacity = 1.0;
				}
			}
		}
	}

	// *** LEAP CODE BELOW

	var previousFrame;
	var paused = false;
	var pauseOnGesture = false;
	var moveFactor = 2.0;

	// Setup Leap loop with frame callback function
	var controllerOptions = {
		enableGestures : false
	};

	Leap.loop(controllerOptions, function(frame) {
		if (paused) {
			return;
			// Skip this update
		}

		if (frame.valid) {
			// Frame motion factors
			if (previousFrame) {
				var translation = frame.translation(previousFrame);
				//frameString += "Translation: " + vectorToString(translation) + " mm <br />";

				var rotationAxis = frame.rotationAxis(previousFrame);
				var rotationAngle = frame.rotationAngle(previousFrame);
				//frameString += "Rotation axis: " + vectorToString(rotationAxis, 2) + "<br />";
				//frameString += "Rotation angle: " + rotationAngle.toFixed(2) + " radians<br />";

				var scaleFactor = frame.scaleFactor(previousFrame);

			}

			if (frame.hands.length > 0) {
				//for (var i = 0; i < frame.hands.length; i++) {
				var hand = frame.hands[0];

				//handString += "<div style='width:300px; float:left; padding:5px'>";
				//handString += "Hand ID: " + hand.id + "<br />";
				//handString += "Direction: " + vectorToString(hand.direction, 2) + "<br />";
				//handString += "Palm normal: " + vectorToString(hand.palmNormal, 2) + "<br />";
				//handString += "Palm position: " + vectorToString(hand.palmPosition) + " mm<br />";
				//handString += "Palm velocity: " + vectorToString(hand.palmVelocity) + " mm/s<br />";
				//handString += "Sphere center: " + vectorToString(hand.sphereCenter) + " mm<br />";
				//handString += "Sphere radius: " + hand.sphereRadius.toFixed(1) + " mm<br />";

				// Hand motion factors
				if (previousFrame) {
					var translation = hand.translation(previousFrame);
					//handString += "Translation: " + vectorToString(translation) + " mm<br />";

					var rotationAxis = hand.rotationAxis(previousFrame, 2);
					var rotationAngle = hand.rotationAngle(previousFrame);
					//handString += "Rotation axis: " + vectorToString(rotationAxis) + "<br />";
					//handString += "Rotation angle: " + rotationAngle.toFixed(2) + " radians<br />";

					var scaleFactor = hand.scaleFactor(previousFrame);
					//handString += "Scale factor: " + scaleFactor.toFixed(2) + "<br />";
				}

				if (plane) {
					if (showBall) {
						ball.inMotion = true;
					}

					plane.position.x = hand.palmPosition[0] * moveFactor;
					plane.position.y = hand.palmPosition[1] * moveFactor;
					plane.position.z = hand.palmPosition[2] * moveFactor;
					//plane.rotation.x = hand.direction[0];
					//plane.rotation.y = hand.direction[1];

					var t = hand.palmNormal;

					//limit y-axis between 0 and 180 degrees
					curY = map(t[1], -1, 1, 0, 179)

					//assign rotation coordinates

					rotateX = t[0];
					rotateY = -curY;

					//plane.rotation.x = Math.sin(rotateY * Math.PI / 180) * Math.cos(rotateX * Math.PI / 180);
					//plane.rotation.z = Math.sin(rotateY * Math.PI / 180) * Math.sin(rotateX * Math.PI / 180);
					//plane.rotation.y = Math.cos(rotateY * Math.PI / 180);

					var ROTMAX = 90 + 45;
					var ROTMIN = -(90 + 45);

					//plane.rotation.y = Math.min(ROTMAX, Math.max(ROTMIN, -de2ra(t[0] * 180)));
					//plane.rotation.x = Math.min(ROTMAX, Math.max(ROTMIN, de2ra(t[1] * 180) + 90));

					plane.rotation.y = -de2ra(t[0] * 180);
					plane.rotation.x = de2ra(t[1] * 180) + 90;

					//plane.rotation.z = -de2ra(t[2] * 180);

					//plane.lookAt(new THREE.Vector3(hand.direction[0], hand.direction[1], hand.direction[2]));
					//plane.lookAt(new THREE.Vector3(hand.palmNormal[0], hand.palmNormal[1], hand.palmNormal[2]));

					//plane.rotation = new THREE.Vector3(hand.direction[0], -hand.direction[1], -hand.direction[2]);
					console.log(hand.direction[0] + ' ' + hand.direction[1] + ' ' + hand.direction[2]);
					//plane.rotation.z = hand.direction[2];
				}

				/*
				// IDs of pointables (fingers and tools) associated with this hand
				if (hand.pointables.length > 0) {
				var fingerIds = [];
				var toolIds = [];
				for (var j = 0; j < hand.pointables.length; j++) {
				var pointable = hand.pointables[j];
				if (pointable.tool) {
				toolIds.push(pointable.id);
				}
				else {
				fingerIds.push(pointable.id);
				}
				}
				if (fingerIds.length > 0) {
				handString += "Fingers IDs: " + fingerIds.join(", ") + "<br />";
				}
				if (toolIds.length > 0) {
				handString += "Tools IDs: " + toolIds.join(", ") + "<br />";
				}
				}
				*/

				//handString += "</div>";
				//}
			} else {
				//handString += "No hands";
			}

			// Store frame for motion functions
			previousFrame = frame;
		}
	});

	//map function to be used to map values from leap into proper degrees (0-360)
	function map(value, inputMin, inputMax, outputMin, outputMax) {
		outVal = ((value - inputMin) / (inputMax - inputMin) * (outputMax - outputMin) + outputMin);
		if (outVal > outputMax) {
			outVal = outputMax;
		}
		if (outVal < outputMin) {
			outVal = outputMin;
		}
		return outVal;
	}


	this.de2ra = function(degree) {
		return degree * (Math.PI / 180);
	}
	function lineDistance(point1, point2) {
		var xs = 0;
		var ys = 0;

		xs = point2.x - point1.x;
		xs = xs * xs;

		ys = point2.y - point1.y;
		ys = ys * ys;

		return Math.sqrt(xs + ys);
	}

}();
