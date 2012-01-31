/*jshint undef: true, browser:true, jquery: true, devel: true, smarttabs: true */
/*global Raphael, TWEEN, BubbleTree */

/*
 * represents a ring
 */
BubbleTree.Ring = function(node, bc, o, rad, attr) {
	
	var me = this;
	me.className = "ring";
	me.rad = rad;
	me.bc = bc;
	me.attr = attr;
	me.origin = o;
	me.alpha = 1;
	me.visible = false;
	me.node = node;
	
	me.init = function() {
		//var o = me.origin;
	};
	
	me.draw = function() {
		var me = this, o = me.origin;
		if (!me.visible) return;
		me.circle.attr({ cx: o.x, cy: o.y, r: me.rad, 'stroke-opacity': me.alpha });
	};
	
	/*
	 * removes all raphael nodes from stage
	 */
	me.hide = function() {
		var me = this;
		me.circle.remove();
		me.visible = false;
	};
	
	me.show = function() {
		var me = this;
		me.circle = me.bc.paper.circle(o.x, o.y, me.rad).attr(me.attr);
		me.visible = true;
		me.circle.toBack();
	};
	
	
	me.init();
};