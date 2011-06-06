/*jshint undef: true, browser:true, jquery: true, devel: true */
/*global Raphael, TWEEN, OpenSpending, vis4 */

/*
 * transforms the current display to a new layout
 * while transitioning, there are several possible cases:
 * - a node exists both before and after the transition
 * - a node appears at the beginning of the transition
 * - a node disappears at the end of the transtion
 */
OpenSpending.BubbleTree.SimpleTransitioner = function() {
	
	var me = this;
	
	me.garbage = [];
	
	me.running = false;
	
	me.changeLayout = function(layout) { 
		var i, o, props, p;
		for (i in layout.objects) {
			o = layout.objects[i];
			if (o === undefined || o === null) continue;
			props = layout.props[i];
			for (p in props) {
				o[p] = props[p];
			}
			if ($.isFunction(o.draw)) o.draw();
			if (o.removable) {
				me.garbage.push(o);
			}
		}
		me.collectGarbage();
	};
	
	/*
	 * calls the remove() function on every object marked for
	 * removal. will run right after the tween ends
	 */
	me.collectGarbage = function() {
		var i, o, me = this;
		for (i in me.garbage) {
			o = me.garbage[i];
			if ($.isFunction(o.remove)) o.remove();
		}
		me.garbage = [];
	};
	
};

OpenSpending.BubbleTree.AnimatedTransitioner = function(duration) {
	
	var me = this;
	
	me.duration = duration;
	me.running = false;
	
	me.changeLayout = function(layout) {
		var i, o, props, p, me = this;
		me.running = true;
		me.layout = layout;
		
		// at first show all objects that are marked for showing
		for (i in layout.toShow) {
			o = layout.toShow[i];
			if ($.isFunction(o.show)) o.show();
		}
		
		for (i in layout.objects) {
			o = layout.objects[i];
			if (o === undefined || o === null) continue;
			props = layout.props[i];
			
			if (me.duration > 0) {
				var tween = new TWEEN.Tween(o), toProps = {};
				
				for (p in props) {
					//o[p] = props[p];
					toProps[p] = props[p];
				}
				tween.to(toProps, me.duration);
				tween.easing(TWEEN.Easing.Exponential.EaseOut);
				if ($.isFunction(o.draw)) tween.onUpdate(o.draw.bind(o));
				if (i == layout.objects.length-1) tween.onComplete(me._completed.bind(me));
				tween.start();
			} else {
				for (p in props) {
					o[p] = props[p];
				}
				if ($.isFunction(o.draw)) o.draw();
			}
		}
		if (me.duration === 0) {
			// redraw all
			for (i in layout.objects) {
				o = layout.objects[i];
				if ($.isFunction(o.draw)) o.draw();
			}
			me._completed();
		}
	};
	
	me.onComplete = function(callback) {
		var me = this;
		if ($.isFunction(callback)) me.completeCallbacks.push(callback);
	};
	
	me._completed = function() {
		var me = this, callbacks = me.completeCallbacks, i, obj;
		me.running = false;
		
		for (i in me.layout.objects) {
			obj = me.layout.objects[i];
			if ($.isFunction(obj.draw)) obj.draw(); // the final draw	
		}
		// now hide all objects marked for hiding
		for (i in me.layout.toHide) {
			obj = me.layout.toHide[i];
			if ($.isFunction(obj.hide)) obj.hide();
		}
		
		for (i in callbacks) {
			callbacks[i]();
		}
	};
	
};