/*jshint undef: true, browser:true, jquery: true, devel: true */
/*global OpenSpending, vis4 */
/*
 * in JS there's no thing like mouse event capsulation, this
 * class will work around this. It makes it possible to set
 * events like click and hover for a group of objects that
 * belong together
 */
OpenSpending.BubbleTree.MouseEventGroup = function(target, members) {
	
	var me = this;
	me.target = target; // e.g. instance of a bubble
	me.members = members; // e.g. raphael nodes or html elements
	
	/*
	 * public interface for setting click handlers
	 */
	me.click = function(callback) {
		var me = this, members = me.members, i, mem;
		me.clickCallback = callback;
		for (i in members) {
			mem = members[i];
			$(mem).click(me.handleClick.bind(me));
		}
	};
	
	me.handleClick = function(evt) {
		var me = this;
		me.clickCallback({ target: me.target, origEvent: evt, mouseEventGroup: me });
	};
	
	/*
	 *
	 */
	me.hover = function(callback) {
		var me = this, members = me.members, i, mem;
		me.hoverCallback = callback;
		for (i in members) {
			mem = members[i];
			$(mem).hover(me.handleMemberHover.bind(me), me.handleMemberUnHover.bind(me));
		}
	};
	
	/*
	 * public interface for setting unhover callback
	 */
	me.unhover = function(callback) {
		var me = this;
		me.unhoverCallback = callback;
	};
	
	/*
	 * stores wether the mouse currently hover over any
	 * object in our members list. this is used to check
	 * wether a occuring hover event is an actual hover
	 * event.
	 */
	me.wasHovering = false;
	me.mouseIsOver = false;
	
	me.handleMemberHover = function(evt) {
		var me = this;
		// since we don't know which event will receive first, the unhover of the member
		// the mouse is leaving or the hover of the member the mouse is entering, we will
		// delay the final check a bit
		new vis4.DelayedTask(25, me, me.handleMemberHoverDelayed, evt);	
		
	};

	/*
	 * will be called after all unhover events are processed
	 */
	me.handleMemberHoverDelayed = function(evt) {
		var me = this;
		// this will eventually override the false set by handleMemberUnHover a few
		// milliseconds ok. Exactly what we want!
		me.mouseIsOver = true;
				
		if (!me.wasHovering) {
			// the target is newly hovered
			
			me.wasHovering = true;
			if ($.isFunction(me.hoverCallback)) {
				me.hoverCallback({ target: me.target, origEvent: evt, mouseEventGroup: me });
			}
		} // else can be ignored, no news
	};
	

	me.handleMemberUnHover = function(evt) {
		var me = this;
		me.mouseIsOver = false;
		// we need to wait a bit to find out if this is a real unhover event
		// or just the change to another element in the member list
		// so we need to delay the final check a bit (let's say 30ms)
		new vis4.DelayedTask(40, me, me.handleMemberUnHoverDelayed, evt);	
	};
	
	me.handleMemberUnHoverDelayed = function(evt) {
		var me = this;
		if (!me.mouseIsOver) {
			// well, finally no nasty hover event has disturbed our good unhover
			// process, so we can assume that this is a real unhover event
			
			me.wasHovering = false;
			if ($.isFunction(me.unhoverCallback)) {
				me.unhoverCallback({ target: me.target, origEvent: evt, mouseEventGroup: me });
			}
		}
	};
		
	/*
	 * this function is used for later addition of member objects like dynamic tooltips
	 */
	me.addMember = function(mem) {
		var me = this;
		// if (me.clickCallback && noClick) $(mem).click(me.handleClick.bind(me));
		if (me.hoverCallback) $(mem).hover(me.handleMemberHover.bind(me), me.handleMemberUnHover.bind(me));
		me.members.push(mem);
	};
	
	/*
	 * this function is used for later removal of member objects like dynamic tooltips
	 */
	me.removeMember = function(mem) {
		var me = this, members = me.members, i, tmp = [];
		if (me.clickCallback) $(mem).unbind('click');
		if (me.hoverCallback) $(mem).unbind('mouseenter mouseleave');
		for (i in members) {
			if (members[i] != mem) tmp.push(members[i]);
		}
		me.members = tmp;
		
	};
};
