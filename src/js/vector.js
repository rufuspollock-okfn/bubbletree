/*jshint undef: true, browser:true, jquery: true, devel: true, smarttabs: true */
/*global BubbleTree */


BubbleTree.Vector = function(x,y) {
	var me = this;
	me.x = x; 
	me.y = y;
	
	/*
	 * calculates the length of the vector
	 */
	me.length = function() {
		var me = this;
		return Math.sqrt(me.x*me.x + me.y * me.y);
	};
	
	/*
	 * changes the length of the vector
	 */
	me.normalize = function(len) {
		var me = this, l = me.length();
		if (!len) len = 1.0;
		me.x *= len/l;
		me.y *= len/l;
	};
	
	/*
	 * creates an exact copy of this vector
	 */
	me.clone = function() {
		var me = this;
		return new BubbleTree.Vector(me.x, me.y);
	};
};