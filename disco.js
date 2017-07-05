jQuery.fn.afterTransition = function(callback){
	if(window.ontransitionend === undefined && window.onwebkittransitionend === undefined && window.onotransitionend === undefined && window.onmstransitionend === undefined){
		//No CSS transition support, immediately invoke callback
		for(var i = 0; i < this.length; i++){
			callback.call(this[i]);
		}
	}else{
		//Wait for transition to complete
		this.on('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function(){
			$(this).off('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd');
			callback.call(this);
		})
	}
};

var Disco = (new function(){

	var $canvas;
	var context;

	var isAnimating = false;
	var lightsEnabled = false;

	var $discoBallCord, $discoBallContainer, $discoBall;

	var radius = 100;
	var layersPerHemisphere = 7;

	var faces;

	var discoBallPosition = new Vector(0, 0, 0);

	var lights = [{
		position: new Vector(-200, 100, 0),
		ambientColor: '#f99',
		reflectionColorInner: 'rgba(150, 150, 255, .7)',
		reflectionColorOuter: 'rgba(150, 150, 255, 0)'
	},{
		position: new Vector(200, 100, -100),
		ambientColor: '#9f9',
		reflectionColorInner: 'rgba(150, 255, 150, .7)',
		reflectionColorOuter: 'rgba(150, 255, 150, 0)'
	},{
		position: new Vector(100, -100, -100),
		ambientColor: '#99f',
		reflectionColorInner: 'rgba(255, 150, 150, .7)',
		reflectionColorOuter: 'rgba(255, 150, 150, 0)'
	}]

	var reflectionRadius = 6;

	var wallDistance = 200;

	var rotationY = 0;

	var timeElapsed;
	var timeVisible = 15000;

	var twoPi = Math.PI * 2;
	function normalizeAngle(angle){
		return (angle + twoPi) % twoPi;
	}

	function draw() {
		var currentTime = new Date().getTime();
		var dt = (currentTime - previousTime) / 1000;
		timeElapsed += currentTime - previousTime;
		previousTime = currentTime;

		rotationY = (rotationY + Math.PI * 2 - dt / 3) % (Math.PI * 2);

		$discoBall.css('transform', 'rotateY(' + rotationY + 'rad)');

		context.clearRect(0, 0, canvasWidth, canvasHeight);
		context.fillStyle = 'rgba(0, 0, 0, .5)';
		context.fillRect(0, 0, canvasWidth, canvasHeight);

		if(lightsEnabled){
			$.each(faces, function(i, face){
				var brightnessR = face.brightness;
				var brightnessG = face.brightness;
				var brightnessB = face.brightness;

				$.each(lights, function(j, light){
					context.fillStyle = light.gradient;
					
					var faceRotationY = normalizeAngle(rotationY + face.rotationY);
					var faceRotationX = face.rotationX;

					var faceOrientation = new Vector(faceRotationY, faceRotationX);
					
					var angle = Vector.angle(faceOrientation, light.optimalVector);
					if(angle < 1){
						var highlight = Math.max(1 - angle, 0);
						if(light.ambientColorComponents.r){
							brightnessR = brightnessR + (255 - brightnessR) * (light.ambientColorComponents.r / 255) * highlight;
						}
						if(light.ambientColorComponents.g){
							brightnessG = brightnessG + (255 - brightnessG) * (light.ambientColorComponents.g / 255) * highlight;
						}
						if(light.ambientColorComponents.b){
							brightnessB = brightnessB + (255 - brightnessB) * (light.ambientColorComponents.b / 255) * highlight;
						}
					}

					//Adjust face color
					face.$elm.css('backgroundColor', getColor(brightnessR, brightnessG, brightnessB));

					//if(i === 0 && j === 0){
						if(faceOrientation.z < 0){
							//Mirror light vector
							var reflectionAngle = Vector.subtract(Vector.multiply(Vector.multiply(faceOrientation, Vector.dotProduct(light.position, faceOrientation)), 2), light.position);
							if(reflectionAngle.z < 0){
								//Reflect to back wall
								var relativeX = -wallDistance / reflectionAngle.z * reflectionAngle.x;
								var relativeY = -wallDistance / reflectionAngle.z * reflectionAngle.y;
								var x = relativeX + discoBallPosition.x;
								var y = relativeY + discoBallPosition.y;
								if(x > 0 && y > 0 && x < canvasWidth && y < canvasHeight){
									var distance = Math.sqrt(relativeX * relativeX + relativeY * relativeY);

									var rotationZ = Math.atan(relativeY / relativeX);
									var xScale = 1 + 4 * Math.sin(Math.min(1, distance / canvasWidth) * Math.PI / 2);

									context.save();
									context.translate(x, y);
									context.rotate(rotationZ);
									context.scale(xScale, 1);

									context.beginPath();
									context.moveTo(0, -reflectionRadius);

									context.bezierCurveTo(reflectionRadius, -reflectionRadius, reflectionRadius, reflectionRadius, 0, reflectionRadius);
									context.bezierCurveTo(-reflectionRadius, reflectionRadius, -reflectionRadius, -reflectionRadius, 0, -reflectionRadius);

									context.closePath();

									context.fill();

									context.restore();
								}
							}
						}
					//}
				});
			});
		}

		if(timeElapsed > timeVisible){
			lightsEnabled = false;

			$.each(faces, function(i, face){
				face.$elm.css('backgroundColor', getColor(face.brightness, face.brightness, face.brightness));
			});

			context.clearRect(0, 0, canvasWidth, canvasHeight);
			$discoBallCord.css('top', -discoBallPosition.y - radius);
			$discoBallContainer.css('top', -2 * radius).afterTransition(function(){
				$canvas.remove();
				$discoBallCord.remove();
				$discoBallContainer.remove()
				isAnimating = false;
			});
		}

		setTimeout(draw, 10);
	}

	function getColor(r, g, b){
		return '#' +
			Math.floor(r).toString(16) +
			Math.floor(g).toString(16) +
			Math.floor(b).toString(16);	
	}

	function getDiscoGreyShade(brightness){
		var brightnessHex = brightness.toString(16);
		return '#' + brightnessHex + brightnessHex + brightnessHex;
	}

	function parseColor(hexString){
		if(hexString.length == 4){
			return {
				r: parseInt(hexString[1] + hexString[1], 16),
				g: parseInt(hexString[2] + hexString[2], 16),
				b: parseInt(hexString[3] + hexString[3], 16),
			};
		}else{
			return {
				r: parseInt(hexString.substr(1, 2), 16),
				g: parseInt(hexString.substr(3, 2), 16),
				b: parseInt(hexString.substr(5, 2), 16),
			};
		}
	}

	this.show = function(){
		if (isAnimating) {
			return;
		}

		timeElapsed = 0;

		canvasWidth = $(window).width();
		canvasHeight = $(window).height();

		//Create canvas
		$canvas = $('<canvas/>')
			.css({
				'position': 'fixed',
				'left': 0,
				'top': 0,
				'zIndex': 9997,
				'pointerEvents': 'none'
			})
			.attr('width', canvasWidth)
			.attr('height', canvasHeight)
			.appendTo('body');

		context = $canvas[0].getContext("2d");
		
		faces = [];

		var faceSize = Math.PI * radius / (2 * layersPerHemisphere + 2);

		discoBallPosition.x = canvasWidth / 2
		discoBallPosition.y = canvasHeight / 2;

		$discoBallCord = $('<div/>').css({
			position: 'fixed',
			left: discoBallPosition.x - 1,
			top: -discoBallPosition.y - radius,
			width: 2,
			height: discoBallPosition.y,
			backgroundColor: '#555',
			zIndex: 9998,
			transition: 'top 1s'
		}).appendTo('body');

		$discoBallContainer = $('<div/>').css({
			position: 'fixed',
			left: discoBallPosition.x - radius + 1,
			top: -2 * radius,
			padding: radius - (faceSize / 2) - 1,
			transformStyle: 'preserve-3d',
			backgroundColor: '#919191',
			borderRadius: radius,
			zIndex: 9998,
			transition: 'top 1s'
		}).appendTo('body');

		setTimeout(function(){
			$discoBallCord.css('top', 0);
			$discoBallContainer.css('top', discoBallPosition.y - radius + 1).afterTransition(function(){
				lightsEnabled = true;
			});
		}, 1);

		$discoBall = $('<div/>').css({
			width: faceSize,
			height: faceSize,
			transformStyle: 'preserve-3d'
		}).appendTo($discoBallContainer);

		for(var i = 0; i < layersPerHemisphere; i++){
			var layerXRotation = .5 * Math.PI / (layersPerHemisphere + 1) * (i + .5);
			var layerRadius = Math.cos(layerXRotation) * radius;
			var layerCircumference = 2 * Math.PI * layerRadius;
			var facesInLayer = Math.floor(layerCircumference / faceSize);
			var faceWidthInLayer = layerCircumference / facesInLayer;

			var topYRotationOffset = Math.random() * faceWidthInLayer;
			var bottomXRotationOffset = Math.random() * faceWidthInLayer;

			for(var j = 0; j < facesInLayer; j++){
				var yRotation = Math.PI * 2 / facesInLayer * j;

				var brightness = Math.floor(130 + 30 * Math.random());
				//Create top hemisphere face
				var $topFace = $('<div/>').css({
					position: 'absolute',
					width: faceWidthInLayer,
					height: faceSize + 1,
					backgroundColor: getDiscoGreyShade(brightness),
					transform: 'rotateY(' + (yRotation + topYRotationOffset) + 'rad) rotateX(' + layerXRotation + 'rad) translateZ(' + radius + 'px)',
					backfaceVisibility: 'hidden',
					transformStyle: 'preserve-3d',
					outline: '1px solid transparent' //Firefox jagged line fix
				}).appendTo($discoBall);

				faces.push({
					rotationX: layerXRotation,
					rotationY: yRotation + topYRotationOffset,
					$elm: $topFace,
					brightness: brightness
				});

				brightness = Math.floor(130 + 30 * Math.random());
				//Create bottom hemisphere face
				var $bottomFace = $('<div class="face">').css({
					position: 'absolute',
					width: faceWidthInLayer,
					height: faceSize + 1,
					backgroundColor: getDiscoGreyShade(brightness),
					transform: 'rotateY(' + (yRotation + bottomXRotationOffset) + 'rad) rotateX(-' + layerXRotation + 'rad) translateZ(' + radius + 'px)',
					backfaceVisibility: 'hidden',
					transformStyle: 'preserve-3d',
					outline: '1px solid transparent' //Firefox jagged line fix
				}).appendTo($discoBall);

				faces.push({
					rotationX: -layerXRotation,
					rotationY: yRotation + bottomXRotationOffset,
					$elm: $bottomFace,
					brightness: brightness
				});
			}
		}

		//For each light, find angle at which a face reflects 100%
		$.each(lights, function(i, light){
			light.position.normalize();
			vectorScreen = new Vector(0, 0, 1);
			light.optimalVector = Vector.divide(Vector.add(light.position, vectorScreen), 2).normalize();
			light.ambientColorComponents = parseColor(light.ambientColor);
			light.backVector = Vector.divide(Vector.add(light.position, new Vector(0, 0, -1)), 2).normalize();
			light.gradient = context.createRadialGradient(0,0,0,0,0,reflectionRadius);
			light.gradient.addColorStop(0, light.reflectionColorInner);
			light.gradient.addColorStop(.5, light.reflectionColorInner);
			light.gradient.addColorStop(1, light.reflectionColorOuter);
		});

		isAnimating = true;

		previousTime = new Date().getTime();

		draw();
	}

	$(window).bind('resize', function () {
		if (isAnimating) {
			canvasWidth = $(window).width();
			canvasHeight = $(window).height();

			$canvas
				.attr('width', canvasWidth)
				.attr('height', canvasHeight);

			discoBallPosition.x = canvasWidth / 2
			discoBallPosition.y = canvasHeight / 2;

			$discoBallCord.css({
				left: discoBallPosition.x - 1,
				height: discoBallPosition.y
			});

			$discoBallContainer.css({
				left: discoBallPosition.x - radius,
				top: discoBallPosition.y - radius
			});
		}
	});
}());