var Vector = function(x, y, z){
	this.x = 0;
	this.y = 0;
	this.z = 0;

	if(x !== undefined && y !== undefined){
		if(z === undefined){
			//Create vector from y and x rotation
			var xRotation = y;
			var yRotation = x;

			this.x = Math.cos(xRotation) * Math.sin(yRotation);
			this.y = -Math.sin(xRotation);
			this.z = Math.cos(xRotation) * Math.cos(yRotation);
			this.normalize();
		}else{
			//Create vector from cartesian input
			this.x = x;
			this.y = y;
			this.z = z;
		}
	}
};

Vector.prototype = {
	x: 0,
	y: 0,
	z: 0,

	normalize: function(){
		var length = this.length();
		this.x = this.x / length;
		this.y = this.y / length;
		this.z = this.z / length;
		return this;
	},

	length: function(){
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);;
	},

	toString: function(){
		return '[' + this.x + ', ' + this.y + ', ' +this.z + ']';
	}
};

Vector.add = function(v1, v2){
	if(v2.hasOwnProperty('x') && v2.hasOwnProperty('y') && v2.hasOwnProperty('z')){
		return new Vector(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
	}else{
		return new Vector(v1.x + v2, v1.y + v2, v1.z + v2);
	}
};

Vector.subtract = function(v1, v2){
	if(v2.hasOwnProperty('x') && v2.hasOwnProperty('y') && v2.hasOwnProperty('z')){
		return new Vector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
	}else{
		return new Vector(v1.x - v2, v1.y - v2, v1.z - v2);
	}
};

Vector.multiply = function(v1, v2){
	if(v2.hasOwnProperty('x') && v2.hasOwnProperty('y') && v2.hasOwnProperty('z')){
		return new Vector(v1.x * v2.x, v1.y * v2.y, v1.z * v2.z);
	}else{
		return new Vector(v1.x * v2, v1.y * v2, v1.z * v2);
	}
};

Vector.divide = function(v1, v2){
	if(v2.hasOwnProperty('x') && v2.hasOwnProperty('y') && v2.hasOwnProperty('z')){
		return new Vector(v1.x / v2.x, v1.y / v2.y, v1.z / v2.z);
	}else{
		return new Vector(v1.x / v2, v1.y / v2, v1.z / v2);
	}
};

Vector.dotProduct = function(v1, v2){
	return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
};

Vector.angle = function(v1, v2){
	if(v1.x == v2.x && v1.y == v2.y && v1.z == v2.z){
		return 0;
	}else{
		return Math.acos(Vector.dotProduct(v1, v2) / (v1.length() * v2.length()));
	}
};
