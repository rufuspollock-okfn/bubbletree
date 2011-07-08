/*jshint undef: true, browser:true, jquery: true, devel: true */
/*global Raphael, TWEEN, OpenSpending */
/*
 * represents a radial line
 */
OpenSpending.BubbleTree.Line = function(bc, attr, origin, angle, fromRad, toRad) {
	this.bc = bc;
	this.o = origin;
	this.angle = angle;
	this.fromRad = fromRad;
	this.attr = attr;
	this.toRad = toRad;
	
	this.getXY = function() {
		this.x1 = this.o.x + Math.cos(this.angle) * this.fromRad; 
		this.y1 = this.o.y -Math.sin(this.angle) * this.fromRad;
		this.x2 = this.o.x + Math.cos(this.angle) * this.toRad; 
		this.y2 = this.o.y  -Math.sin(this.angle) * this.toRad;
	};
	
	this.init = function() {
		this.getXY();
		console.log("foo", "M"+this.x1+" "+this.y1+"L"+this.x2+" "+this.y2, attr);
		this.path = this.bc.paper.path(
			"M"+this.x1+" "+this.y1+"L"+this.x2+" "+this.y2
		).attr(this.attr);
	};
	
	this.draw = function() {
		//console.log('line.draw()', this.angle, this.fromRad, this.toRad);
		//console.log(this.x1, this);
		this.getXY();
		//console.log(this.x1);
		this.path.attr({ path: "M"+this.x1+" "+this.y1+"L"+this.x2+" "+this.y2 });
	};
	
	
	this.init();
	
};