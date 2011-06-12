/*jshint undef: true, browser:true, jquery: true, devel: true */
/*global Raphael, TWEEN, OpenSpending, vis4 */


/*
 * represents a bubble
 */
OpenSpending.BubbleTree.Bubbles.Donut = function(node, bubblechart, origin, radius, angle, color) {

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
	me.bubbleRad = utils.amount2rad(this.node.amount);
	
	/*
	 * child rotation is just used from outside to layout possible child bubbles
	 */
	me.childRotation = 0;
	
	
	/*
	 * convertes polar coordinates to x,y
	 */
	me.getXY = function() {
		var me = this, o = me.origin, a = me.angle, r = me.rad;
		me.pos.x = o.x + Math.cos(a) * r;
		me.pos.y = o.y - Math.sin(a) * r;
	};
	
	/*
	 * inistalizes the bubble
	 */
	me.init = function() {
		var me = this;
		me.pos = new me.ns.Vector(0,0);
		me.getXY();
		
		var breakdown = [], b, i, val, bd = [], styles = me.bc.config.bubbleStyles;
		
		me.breakdownOpacities = [0.2, 0.7, 0.45, 0.6, 0.35];
		
		for (i in me.node.breakdowns) {
			b = me.node.breakdowns[i];
			b.famount = utils.formatNumber(b.amount);
			val = b.amount / me.node.amount;
			breakdown.push(val);
			bd.push(b);
			
			
			
			if (styles && styles.hasOwnProperty('name') && styles.name.hasOwnProperty(b.name) && styles.name[b.name].hasOwnProperty('opacity')) {
				me.breakdownOpacities[bd.length-1] = styles.name[b.name].opacity;
			}
		}
		me.node.breakdowns = bd;
		me.breakdown = breakdown;
		
		var showIcon = false; //this.bubbleRad * this.bc.bubbleScale > 30;
		// create label
		/*this.label = me.paper.text(me.pos.x, me.pos.y + (showIcon ? me.bubbleRad * 0.4: 0), utils.formatNumber(me.node.amount)+'\n'+me.node.label)
			.attr({ 'font-family': 'Graublau,Georgia,serif', fill: '#fff', 'font-size': Math.max(4, me.bubbleRad * me.bc.bubbleScale * 0.25) });
		*/
		
		/*if (showIcon) {
			me.icon = me.paper.path("M17.081,4.065V3.137c0,0,0.104-0.872-0.881-0.872c-0.928,0-0.891,0.9-0.891,0.9v0.9C4.572,3.925,2.672,15.783,2.672,15.783c1.237-2.98,4.462-2.755,4.462-2.755c4.05,0,4.481,2.681,4.481,2.681c0.984-2.953,4.547-2.662,4.547-2.662c3.769,0,4.509,2.719,4.509,2.719s0.787-2.812,4.557-2.756c3.262,0,4.443,2.7,4.443,2.7v-0.058C29.672,4.348,17.081,4.065,17.081,4.065zM15.328,24.793c0,1.744-1.8,1.801-1.8,1.801c-1.885,0-1.8-1.801-1.8-1.801s0.028-0.928-0.872-0.928c-0.9,0-0.957,0.9-0.957,0.9c0,3.628,3.6,3.572,3.6,3.572c3.6,0,3.572-3.545,3.572-3.545V13.966h-1.744V24.793z")
				.translate(me.pos.x, me.pos.y).attr({fill: "#fff", stroke: "none"});
		}*/
		
		me.initialized = true;
		
		//me.show();
	};
	
	/*
	 *
	 */
	me.onclick = function(e) {
		var me = this;
		if (me.node.children.length > 1) {
			me.bc.navigateTo(me.node);
		}
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
		e.target = me;
		e.type = 'HIDE';
		e.bubblePos = { x:me.pos.x, y: me.pos.y };
		e.mousePos = { x:e.origEvent.pageX - c.offsetLeft, y: e.origEvent.pageY - c.offsetTop };
		me.bc.tooltip(e);
	};
	
	this.draw = function() {
		var me = this, r = Math.max(5, me.bubbleRad * me.bc.bubbleScale), ox = me.pos.x, oy = me.pos.y, devnull = me.getXY();
		if (!me.visible) return;
		
		me.circle.attr({ cx: me.pos.x, cy: me.pos.y, r: r, 'fill-opacity': me.alpha });
		if (me.node.children.length > 1) me.dashedBorder.attr({ cx: me.pos.x, cy: me.pos.y, r: r*0.85, 'stroke-opacity': me.alpha * 0.8 });
		else me.dashedBorder.attr({ 'stroke-opacity': 0 });

		if (me.breakdown.length > 1) {
			// draw breakdown chart
			var i,x=me.pos.x,y=me.pos.y,x0,x1,x2,x3,y0,y1,y2,y3,ir = r*0.85, oa = -Math.PI * 0.5, da;
			for (i in me.breakdown) {
				da = me.breakdown[i] * Math.PI * 2;
				x0 = x+Math.cos((oa))*ir; 
				y0 = y+Math.sin((oa))*ir;
				x1 = x+Math.cos((oa+da))*ir;
				y1 = y+Math.sin((oa+da))*ir;
				x2 = x+Math.cos((oa+da))*r;
				y2 = y+Math.sin((oa+da))*r;
				x3 = x+Math.cos((oa))*r;
				y3 = y+Math.sin((oa))*r;
				oa += da;
				
				var path = "M"+x0+" "+y0+" A"+ir+","+ir+" 0 "+(da > Math.PI ? "1,1" : "0,1")+" "+x1+","+y1+" L"+x2+" "+y2+" A"+r+","+r+" 0 "+(da > Math.PI ? "1,0" : "0,0")+" "+x3+" "+y3+" Z";
				
				me.breakdownArcs[i].attr({ path: path, 'stroke-opacity': me.alpha*0.2, 'fill-opacity': me.breakdownOpacities[i]*me.alpha });
			}
		}

		//me.label.attr({ x: me.pos.x, y: me.pos.y, 'font-size': Math.max(4, me.bubbleRad * me.bc.bubbleScale * 0.25) });
		if (r < 20) me.label.hide();
		else {
			me.label.show();
		
			if (r < 40) {
				me.label.find('.desc').hide();
			} else {
				// full label
				me.label.find('.desc').show();
			}
		}
		me.label.css({ width: 2*r*0.9+'px', opacity: me.alpha });
		me.label.css({ left: (me.pos.x-r*0.9)+'px', top: (me.pos.y-me.label.height()*0.53)+'px' });
	
		//if (me.icon) me.icon.translate(me.pos.x - ox, me.pos.y - oy);
	
	};
	
	/*
	 * removes all visible elements from the page
	 */
	this.hide = function() {
		var me = this, i;
		me.circle.remove();
		me.dashedBorder.remove();
		me.label.remove();
		//$('#bubble-chart')
		me.visible = false;
		for (i in me.breakdownArcs) {
			me.breakdownArcs[i].remove();
		}
		
		//if (me.icon) me.icon.remove();
	};
	
	/*
	 * adds all visible elements to the page
	 */
	me.show = function() {
		var me = this, i, r = Math.max(5, me.bubbleRad * me.bc.bubbleScale);
		
		me.circle = me.paper.circle(me.pos.x, me.pos.y, r)
			.attr({ stroke: false, fill: me.color });

		me.dashedBorder = me.paper.circle(me.pos.x, me.pos.y,  r*0.85)
			.attr({ stroke: '#fff', 'stroke-opacity': me.alpha * 0.4,  'stroke-dasharray': ". ", fill: false });
		
		me.label = $('<div class="label"><div class="amount">'+utils.formatNumber(me.node.amount)+'</div><div class="desc">'+me.node.label+'</div></div>');
		$('#bubble-chart').append(me.label);
		
		if (me.node.children.length > 1) {
			$(me.circle.node).css({ cursor: 'pointer'});
			$(me.label).css({ cursor: 'pointer'});
		}	
		
		var list = [me.circle.node, me.label];
		
		if (me.breakdown.length > 1) {
			me.breakdownArcs = {};
			
			for (i in me.breakdown) {
				var arc = me.paper.path("M 0 0 L 2 2")
					.attr({ fill: '#fff', 'fill-opacity': Math.random()*0.4 + 0.3, stroke: '#fff'});
				me.breakdownArcs[i] = arc;
				$(arc.node).hover(me.arcHover.bind(me), me.arcUnhover.bind(me));
			}
			
			for (i in me.breakdownArcs) {
				// we dont add the breakdown arcs to the list 'cause
				// we want them to fire different mouse over events
				// list.push(me.breakdownArcs[i].node);
				$(me.breakdownArcs[i].node).click(me.onclick.bind(me));
			}
		}
		
		var mgroup = new me.ns.MouseEventGroup(me, list);
		mgroup.click(me.onclick.bind(me));
		mgroup.hover(me.onhover.bind(me));
		mgroup.unhover(me.onunhover.bind(me));
		
		me.visible = true;
		
	};
	
	
	me.arcHover = function(e) {
		var me = this, c = me.bc.$container[0], i, 
			arcs = me.breakdownArcs, node, 
			bd = me.node.breakdowns;
			
		for (i in arcs) {
			if (arcs[i].node == e.target) {
				e.node = bd[i];
				e.bubblePos = { x:me.pos.x, y: me.pos.y };
				e.mousePos = { x:e.pageX - c.offsetLeft, y: e.pageY - c.offsetTop };
				e.target = me;
				e.type = 'SHOW';
				me.bc.tooltip(e);
				return;
			}
		}
		
		vis4.log('cant find the breakdown node');
	};
	
	me.arcUnhover = function(e) {
		var me = this, c = me.bc.$container[0], i, 
			arcs = me.breakdownArcs, node, 
			bd = me.node.breakdowns;
			
		for (i in arcs) {
			if (arcs[i].node == e.target) {
				e.node = bd[i];
				e.bubblePos = { x:me.pos.x, y: me.pos.y };
				e.mousePos = { x:e.pageX - c.offsetLeft, y: e.pageY - c.offsetTop };
				e.type = 'HIDE';
				e.target = me;
				me.bc.tooltip(e);
				return;
			}
		}
		
		vis4.log('cant find the breakdown node');
	};
	
	me.init();
};