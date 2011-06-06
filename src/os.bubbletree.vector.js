/*jshint undef: true, browser:true, jquery: true, devel: true */
/*global OpenSpending */


OpenSpending.BubbleTree.Vector = function(x,y) {
	var me = this;
	me.x = x; 
	me.y = y;
	
	/*
	 * calculates the length of the vector
	 */
	this.length = function() {
		var me = this;
		return Math.sqrt(me.x*me.x + me.y * me.y);
	};
	
	/*
	 * changes the length of the vector
	 */
	this.normalize = function(len) {
		var me = this, l = me.length();
		if (!len) len = 1.0;
		me.x *= len/l;
		me.y *= len/l;
	};
	
	/*
	 * creates an exact copy of this vector
	 */
	this.clone = function() {
		var me = this;
		return new OpenSpending.BubbleTree.Vector(me.x, me.y);
	};
};