/*jshint undef: true, browser:true, jquery: true, devel: true, smarttabs: true */
/*global Raphael, TWEEN, BubbleTree, vis4 */

BubbleTree.Bubbles = BubbleTree.Bubbles || {};

/*
 * represents a bubble
 */
BubbleTree.Bubbles.Plain = function(node, bubblechart, origin, radius, angle, color) {

	var ns = BubbleTree, utils = ns.Utils, me = this;
	me.className = "bubble";
	me.node = node;
	me.paper = bubblechart.paper;
	me.origin = origin;
	me.bc = bubblechart;
	me.rad = radius;
	me.angle = angle;
	me.color = color;
	me.alpha = 1;
	me.visible = false;
	me.ns = ns;
	me.pos = ns.Vector(0,0);
	me.bubbleRad = utils.amount2rad(this.node.amount);
	me.container = me.bc.$container;
	
	/*
	 * child rotation is just used from outside to layout possible child bubbles
	 */
	me.childRotation = 0;
	
	
	/*
	 * convertes polar coordinates to x,y
	 */
	me.getXY = function() {
		var me = this, o = me.origin, a = me.angle, r = me.rad;
		if (me.pos === undefined) me.pos = new me.ns.Vector(0,0);
		me.pos.x = o.x + Math.cos(a) * r;
		me.pos.y = o.y - Math.sin(a) * r;
	};
	
	/*
	 * inistalizes the bubble
	 */
	me.init = function() {
		var me = this;
		me.getXY();
		
		var showIcon = false; //this.bubbleRad * this.bc.bubbleScale > 30;
		
		if (!me.node.shortLabel) me.node.shortLabel = me.node.label.length > me.bc.config.cutLabelsAt+3 ? me.node.label.substr(0, me.bc.config.cutLabelsAt)+'...' : me.node.label;
		
		me.initialized = true;
		
		//me.show();
	};
	
	/*
	 *
	 */
	me.onclick = function(e) {
		var me = this;
		me.bc.onNodeClick(me.node);
		
		//if (me.node.children.length > 1) {
			me.bc.navigateTo(me.node);
		//}
	};
	
	me.onhover = function(e) {
		var me = this, c = me.bc.$container[0];
		e.node = me.node;
		e.target = me;
		e.bubblePos = { x:me.pos.x, y: me.pos.y };
		e.mousePos = { x:e.origEvent.pageX - c.offsetLeft, y: e.origEvent.pageY - c.offsetTop };
		e.type = 'SHOW';
		me.bc.tooltip(e);
	};
	
	me.onunhover = function(e) {
		var me = this, c = me.bc.$container[0];
		e.node = me.node;
		e.type = 'HIDE';
		e.target = me;
		e.bubblePos = { x:me.pos.x, y: me.pos.y };
		e.mousePos = { x:e.origEvent.pageX - c.offsetLeft, y: e.origEvent.pageY - c.offsetTop };
		me.bc.tooltip(e);
	};
	
	me.draw = function() {
		var me = this,
			r = Math.max(5, me.bubbleRad * me.bc.bubbleScale),
			ox = me.pos.x,
			oy = me.pos.y,
			devnull = me.getXY(),
		x = me.pos.x, y = me.pos.y;
		if (!me.visible) return;
		
		me.circle.attr({ cx: me.pos.x, cy: me.pos.y, r: r, 'fill-opacity': me.alpha });
		if (me.node.children.length > 1) me.dashedBorder.attr({ cx: me.pos.x, cy: me.pos.y, r: r-4, 'stroke-opacity': me.alpha * 0.9 });
		else me.dashedBorder.attr({ 'stroke-opacity': 0 });
		

		//me.label.attr({ x: me.pos.x, y: me.pos.y, 'font-size': Math.max(4, me.bubbleRad * me.bc.bubbleScale * 0.25) });
		
		me.label.show();
		me.label.find('*').show();
		me.label2.show();
		if (r >= me.bc.config.minRadiusLabels) {
			// full label
			me.label2.hide();
		} else if (r >= me.bc.config.minRadiusAmounts) {
			// full label
			me.label.find('.desc').hide();
		} else if (r >= me.bc.config.minRadiusHideLabels) {
			me.label.hide();
		} else {
			me.label.hide();
			me.label2.hide();
		}

		me.label.css({ width: 2*r+'px', opacity: me.alpha });
		me.label.css({ left: (me.pos.x-r)+'px', top: (me.pos.y-me.label.height()*0.5)+'px' });
	
		var w = Math.max(70, 3*r);
		me.label2.css({ width: w+'px', opacity: me.alpha });
		me.label2.css({ left: (x - w*0.5)+'px', top: (y + r)+'px' });

		//if (me.icon) me.icon.translate(me.pos.x - ox, me.pos.y - oy);
	
	};
	
	/*
	 * removes all visible elements from the page
	 */
	me.hide = function() {
		var me = this, i;
		me.circle.remove();
		me.dashedBorder.remove();
		me.label.remove();
		me.label2.remove();
		
		//$('#bubble-chart')
		me.visible = false;

		
		//if (me.icon) me.icon.remove();
	};
	
	/*
	 * adds all visible elements to the page
	 */
	me.show = function() {
		var me = this, i, cx = me.pos.x, cy = me.pos.y, r = Math.max(5, me.bubbleRad * me.bc.bubbleScale);
		
		me.circle = me.paper.circle(cx, cy, r)
			.attr({ stroke: false, fill: me.color });

		me.dashedBorder = me.paper.circle(cx, cy, r-3)
			.attr({ stroke: '#ffffff', 'stroke-dasharray': "- " });
	
	
		me.label = $('<div class="label '+me.node.id+'"><div class="amount">'+utils.formatNumber(me.node.amount)+'</div><div class="desc">'+me.node.shortLabel+'</div></div>');
		me.container.append(me.label);
		
		if (me.node.children.length > 0) {
			$(me.circle.node).css({ cursor: 'pointer'});
			$(me.label).css({ cursor: 'pointer'});
		}	
		
		// additional label
		me.label2 = $('<div class="label2 '+me.node.id+'"><span>'+me.node.shortLabel+'</span></div>');
		me.container.append(me.label2);
		
		var list = [me.circle.node, me.label, me.dashedBorder.node];

		var mgroup = new me.ns.MouseEventGroup(me, list);
		mgroup.click(me.onclick.bind(me));
		mgroup.hover(me.onhover.bind(me));
		mgroup.unhover(me.onunhover.bind(me));
		
		me.visible = true;
		
	};
	
	/*
	 * adds an invisible bubble on top for seamless 
	 * event handling
	 */
	me.addOverlay = function() {
		// add invisible overlay circle
		var me = this;
		
		me.overlay = me.paper.circle(me.circle.attrs.cx, me.circle.attrs.cy, me.circle.attrs.r)
			.attr({ stroke: false, fill: '#fff', 'opacity': 0});
		
		if (Raphael.svg) {
			me.overlay.node.setAttribute('class', me.node.id);
		}
		$(me.overlay.node).css({ cursor: 'pointer'});
		$(me.overlay.node).click(me.onclick.bind(me));
		
		$(me.label).click(me.onclick.bind(me));
	};
	
	me.init();
};
