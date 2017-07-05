//CONFETTI
var Confetti = (new function() {
	var $canvas;
	var context;
	var canvasHeight = 0;
	var canvasWidth = 0;

	var particleCount = 500;
	var particles = [];

	var isAnimating = false;

	var previousTime;

	var colors = [
		'#e34517',
		'#f5ff53',
		'#b4e85e',
		'#00bd72',
		'#0b4239',
		'#fdff98',
		'#ffda7c',
		'#ffb169',
		'#f0785d',
		'#ae3d4f'
	];

	function distributedRandom() {
		var random = Math.random();
		return Math.pow(2 * random - 1, 3) + .5 * random - .25;
	}

	function drawEllipse(centerX, centerY, radiusX, radiusY, rotationZ) {
		var minX = centerX - radiusX;
		var maxX = centerX + radiusX;
		var minY = centerY - radiusY;
		var maxY = centerY + radiusY;

		context.save();
		context.translate(centerX, centerY);
		context.rotate(rotationZ);
		context.translate(-centerX, -centerY);

		context.beginPath();
		context.moveTo(centerX, minY);

		context.bezierCurveTo(maxX, minY, maxX, maxY, centerX, maxY);
		context.bezierCurveTo(minX, maxY, minX, minY, centerX, minY);

		context.closePath();
		context.fill();

		context.restore();
	}

	function drawRectangle(centerX, centerY, radiusX, radiusY, rotationZ) {
		var minX = centerX - radiusX;
		var maxX = centerX + radiusX;
		var minY = centerY - radiusY;
		var maxY = centerY;

		context.save();
		context.translate(centerX, centerY);
		context.rotate(rotationZ);
		context.translate(-centerX, -centerY);

		context.beginPath();
		context.moveTo(minX, minY);
		context.lineTo(minX, maxY);
		context.lineTo(maxX, maxY);
		context.lineTo(maxX, minY);
		context.closePath();
		context.fill();

		context.restore();
	}

	function draw() {
		context.clearRect(0, 0, canvasWidth, canvasHeight);

		var currentTime = new Date().getTime();
		var dt = Math.min((currentTime - previousTime) / 1000, .016);
		previousTime = currentTime;

		for (x = 0; x < particles.length; x++) {
			var particle = particles[x];

			//Apply air resistance
			if (particle.vx > 0) {
				particle.vx -= (dt / 20) * particle.vx * particle.vx;
			} else {
				particle.vx += (dt / 20) * particle.vx * particle.vx;
			}
			if (particle.vy > 0) {
				particle.vy -= (dt / 20) * particle.vy * particle.vy;
			} else {
				particle.vy += (dt / 20) * particle.vy * particle.vy;
			}

			//Apply gravity
			particle.vy += dt * 4;

			//Apply randomness
			particle.vx += distributedRandom() * dt * 20;
			particle.vy += distributedRandom() * dt * 16;

			//Update position
			particle.x += particle.vx;
			particle.y += particle.vy;

			if (particle.y > canvasHeight + 50 || particle.x < -50 || particle > canvasHeight + 50) {
				particles.splice(x, 1);

				if (!particles.length) {
					isAnimating = false;
					$canvas.remove();

					return;
				}

				continue;
			}

			particle.rotation = (particle.rotation + 0.2 + Math.PI) % Math.PI;

			//Draw particle
			context.fillStyle = particle.color;

			if (particle.rectangular) {
				drawRectangle(particle.x, particle.y, particle.size, particle.size * Math.sin(particle.rotation), particle.rotationZ);
			} else {
				drawEllipse(particle.x, particle.y, particle.size, particle.size * Math.sin(particle.rotation), particle.rotationZ);
			}
		}

		setTimeout(draw, 10);
	}

	var intervalId;
	var showCount = 0;

	function deferredShow(){
		if(!isAnimating){
			this.show(false, true);
			showCount--;
			if(showCount == 0){
				clearInterval(intervalId);
			}
		}
	}

	this.showRepeated = function(count){
		showCount = count;
		intervalId = setInterval($.proxy(deferredShow, this), 100);
	};

	this.show = function (fallDown, rectangularConfetti) {
		if (isAnimating) {
			return;
		}

		canvasWidth = $(window).width();
		canvasHeight = $(window).height();

		//Create canvas
		$canvas = $('<canvas/>')
			.css({
				'position': 'fixed',
				'left': 0,
				'top': 0,
				'zIndex': 9999,
				'pointerEvents': 'none'
			})
			.attr('width', canvasWidth)
			.attr('height', canvasHeight)
			.appendTo('body');

		context = $canvas[0].getContext("2d");
		particles = [];

		var x;

		if (fallDown) {
			for (x = 0; x < particleCount; x++) {
				particles.push({
					x: Math.random() * canvasWidth,
					y: -50 - Math.random() * canvasHeight,
					vx: Math.random() * 10 - 5,
					vy: 0,
					size: 10 + 2 * distributedRandom(),
					color: colors[Math.floor(x * colors.length / particleCount)],
					rotation: Math.random() * Math.PI,
					rotationZ: Math.random() * Math.PI,
					rectangular: rectangularConfetti && x % 4 && (x + 1) % 4
				});
			}
		} else {
			for (x = 0; x < particleCount; x++) {
				var speed = 7 + Math.random() * 30;

				var angle = (.3 + distributedRandom() / 2) * Math.PI / 8;

				var confettiOffset = Math.min((canvasWidth / 2) - 50, 600);

				particles.push({
					x: canvasWidth / 2 + (x % 2 ? confettiOffset : -confettiOffset),
					y: canvasHeight + 50,
					vx: (speed * Math.sin(angle)) * (x % 2 ? -1 : 1),
					vy: -speed * Math.cos(angle),
					size: 10 + 2 * distributedRandom(),
					color: colors[Math.floor(x * colors.length / particleCount)],
					rotation: Math.random() * Math.PI,
					rotationZ: Math.random() * Math.PI,
					rectangular: rectangularConfetti && x % 4 && (x + 1) % 4
				});
			}
		}

		isAnimating = true;

		previousTime = new Date().getTime();

		draw();
	};

	$(window).bind('resize', function () {
		if (isAnimating) {
			canvasWidth = $(window).width();
			canvasHeight = $(window).height();

			$canvas
				.attr('width', canvasWidth)
				.attr('height', canvasHeight);
		}
	});

} ());
