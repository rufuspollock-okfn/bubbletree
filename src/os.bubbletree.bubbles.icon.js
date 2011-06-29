/*jshint undef: true, browser:true, jquery: true, devel: true */
/*global Raphael, TWEEN, OpenSpending, vis4, vis4loader */

/*
 * represents a bubble
 */
OpenSpending.BubbleTree.Bubbles.Icon = function(node, bubblechart, origin, radius, angle, color) {

	var ns = OpenSpending.BubbleTree, utils = ns.Utils, me = this;
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
	
	me.iconLoaded = false;
	
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
		
		me.hasIcon = me.node.hasOwnProperty('icon');
		
		if (!me.node.shortLabel) me.node.shortLabel = me.node.label.length > 50 ? me.node.label.substr(0, 30)+'...' : me.node.label;
		
		/*if (showIcon) {
			me.icon = me.paper.path("M17.081,4.065V3.137c0,0,0.104-0.872-0.881-0.872c-0.928,0-0.891,0.9-0.891,0.9v0.9C4.572,3.925,2.672,15.783,2.672,15.783c1.237-2.98,4.462-2.755,4.462-2.755c4.05,0,4.481,2.681,4.481,2.681c0.984-2.953,4.547-2.662,4.547-2.662c3.769,0,4.509,2.719,4.509,2.719s0.787-2.812,4.557-2.756c3.262,0,4.443,2.7,4.443,2.7v-0.058C29.672,4.348,17.081,4.065,17.081,4.065zM15.328,24.793c0,1.744-1.8,1.801-1.8,1.801c-1.885,0-1.8-1.801-1.8-1.801s0.028-0.928-0.872-0.928c-0.9,0-0.957,0.9-0.957,0.9c0,3.628,3.6,3.572,3.6,3.572c3.6,0,3.572-3.545,3.572-3.545V13.966h-1.744V24.793z")
				.translate(me.pos.x, me.pos.y).attr({fill: "#fff", stroke: "none"});
		}*/
		
		
		me.initialized = true;
		
		//me.show();
	};
	
	
	/*
	 * adds all visible elements to the page
	 */
	me.show = function() {
		var me = this, i, cx = me.pos.x, icon, cy = me.pos.y, r = Math.max(5, me.bubbleRad * me.bc.bubbleScale);
				
		me.circle = me.paper.circle(cx, cy, r)
			.attr({ stroke: false, fill: me.color });

		me.dashedBorder = me.paper.circle(cx, cy, Math.min(r-3, r*0.95))
			.attr({ stroke: '#ffffff', 'stroke-dasharray': "- " });
	
		if ($.isFunction(me.bc.config.initTooltip)) {
			me.bc.config.initTooltip(me.node, me.circle.node);
		}
	
		me.label = $('<div class="label"><div class="amount">'+utils.formatNumber(me.node.amount)+'</div><div class="desc">'+me.node.shortLabel+'</div></div>');
		me.bc.$container.append(me.label);
		
		if ($.isFunction(me.bc.config.initTooltip)) {
			me.bc.config.initTooltip(me.node, me.label[0]);
		}
		
		// additional label
		me.label2 = $('<div class="label2"><span>'+me.node.shortLabel+'</span></div>');
		me.bc.$container.append(me.label2);
		
		if (me.node.children.length > 0) {
			$(me.circle.node).css({ cursor: 'pointer'});
			$(me.label).css({ cursor: 'pointer'});
		}	
		
		var list = [me.circle.node, me.label, me.dashedBorder.node];

		var mgroup = new me.ns.MouseEventGroup(me, list);
		mgroup.click(me.onclick.bind(me));
		mgroup.hover(me.onhover.bind(me));
		mgroup.unhover(me.onunhover.bind(me));
		me.mgroup = mgroup;
		
		me.visible = true;
		
		if (me.hasIcon) {
			if (!me.iconLoaded) me.loadIcon();
			else me.displayIcon();
		} 
	};	
	
	/*
	 * will load the icon as soon as needed
	 */
	me.loadIcon = function() {
		var me = this, ldr = new vis4loader();
		ldr.add(me.bc.config.rootPath + me.node.icon);
		ldr.load(me.iconLoadComplete.bind(me));
	};
	
	/*
	 * on complete handler for icon loading process
	 */
	me.iconLoadComplete = function(ldr) {
		var me = this, svg, j, paths;
		svg = ldr.items[0].data;
		me.iconPathData = [];
		paths = svg.getElementsByTagName('path');
		for (j in paths) {
			if (paths[j] && $.isFunction(paths[j].getAttribute)) {
				me.iconPathData.push(String(paths[j].getAttribute('d')));
			}
		}
		me.iconLoaded = true;
		me.displayIcon();
	};
	
	/*
	 * will display the icon, create the svg path element, etc
	 */
	me.displayIcon = function() {
		var me = this, i, path;
		me.iconPaths = [];
		for (i in me.iconPathData) {
			path = me.paper.path(me.iconPathData[i])
				.attr({fill: "#fff", stroke: "none"})
				.translate(-50, -50);
			me.iconPaths.push(path);
			me.mgroup.addMember(path.node);
		}
	};
	
	/*
	 * will remove the icon from stage
	 */
	me.removeIcon = function() {
		var me = this, i, path;
		for (i in me.iconPaths) {
			me.iconPaths[i].remove();
		}
		me.iconPaths = [];
	};
	
	
	me.draw = function() {
		var me = this, 
			r = Math.max(5, me.bubbleRad * me.bc.bubbleScale), 
			ox = me.pos.x, 
			oy = me.pos.y, 
			devnull = me.getXY(), 
			x = me.pos.x, y = me.pos.y, 
			showIcon = me.hasIcon && r > 15,
			showLabel = me.hasIcon ? r > 40 : r > 20,
			i, path, scale, transform, ly;
		
		if (!me.visible) return;
		
		me.circle.attr({ cx: x, cy: y, r: r, 'fill-opacity': me.alpha });
		if (me.node.children.length > 1) me.dashedBorder.attr({ cx: me.pos.x, cy: me.pos.y, r: Math.min(r-3, r-4), 'stroke-opacity': me.alpha * 0.9 });
		else me.dashedBorder.attr({ 'stroke-opacity': 0 });
		

		//me.label.attr({ x: me.pos.x, y: me.pos.y, 'font-size': Math.max(4, me.bubbleRad * me.bc.bubbleScale * 0.25) });
		if (!showLabel) {
			me.label.hide();
			me.label2.show();
		} else {
			me.label.show();
			if ((showIcon && r < 70) || (!showIcon && r < 40)) {
				me.label.find('.desc').hide();
				me.label2.show();
			} else {
				// full label
				me.label.find('.desc').show();
				me.label2.hide();
			}
		}
		
		ly = showIcon ? y+r*0.77-me.label.height() : y-me.label.height()*0.5; 
		me.label.css({ width: (showIcon ? r*1.2 : 2*r)+'px', opacity: me.alpha });
		me.label.css({ left: (showIcon ? x - r*0.6 : x-r)+'px', top: ly+'px' });
		
		var w = Math.max(80, 3*r);
		me.label2.css({ width: w+'px', opacity: me.alpha });
		me.label2.css({ left: (x - w*0.5)+'px', top: (y + r)+'px' });
		
		
		//if (me.icon) me.icon.translate(me.pos.x - ox, me.pos.y - oy);
		if (me.hasIcon) {
			if (showIcon) {
				scale = (r - (showLabel ? me.label.height()*0.5 : 0)) / 60;
				for (i in me.iconPaths) {
					path = me.iconPaths[i];
					//path.translate(me.pos.x - ox, me.pos.y - oy);
					
					transform = "scale("+scale+") translate("+(x/scale)+", "+((y+(showLabel ? me.label.height()*-0.5 : 0))/scale)+")";
					path.node.setAttribute("transform", transform);
					path.attr({ 'fill-opacity': me.alpha });
				}
			} else {
				for (i in me.iconPaths) {
					path = me.iconPaths[i];
					path.attr({ 'fill-opacity': 0 });
				}
			}
		} 
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
		
		//me.bc.$container
		me.visible = false;
		if (me.hasIcon) me.removeIcon();
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
		e.bubblePos = { x:me.pos.x, y: me.pos.y };
		e.mousePos = { x:e.origEvent.pageX - c.offsetLeft, y: e.origEvent.pageY - c.offsetTop };
		e.type = 'SHOW';
		e.target = me;
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
	
	
	me.init();
};
