/*jshint undef: true, browser:true, jquery: true, devel: true */
/*global Raphael, TWEEN, OpenSpending, vis4 */


/*
 * represents a bubble
 */
OpenSpending.BubbleTree.Bubbles.Pies = function(node, bubblechart, origin, radius, angle, color) {

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
		
		var breakdown = [], sum = 0, i, val;
		for (i=0; i<3; i++) {
			val = Math.random();
			breakdown.push(val);
			sum += val;
		}
		for (i in breakdown) {
			breakdown[i] = breakdown[i] / sum;
		}
		vis4.log(breakdown);
		me.breakdown = breakdown;
		
		me.breakdownOpacities = [0.25, 0.59, 0.4];
		
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
		e.bubblePos = { x:me.pos.x, y: me.pos.y };
		e.mousePos = { x:e.origEvent.pageX - c.offsetLeft, y: e.origEvent.pageY - c.offsetTop };
		e.type = 'SHOW';
		me.bc.tooltip(e);
	};
	
	me.onunhover = function(e) {
		var me = this, c = me.bc.$container[0];
		e.node = me.node;
		e.type = 'HIDE';
		e.bubblePos = { x:me.pos.x, y: me.pos.y };
		e.mousePos = { x:e.origEvent.pageX - c.offsetLeft, y: e.origEvent.pageY - c.offsetTop };
		me.bc.tooltip(e);
	};
	
	this.draw = function() {
		var me = this, r = me.bubbleRad * me.bc.bubbleScale, ox = me.pos.x, oy = me.pos.y, devnull = me.getXY();
		if (!me.visible) return;
		
		me.circle.attr({ cx: me.pos.x, cy: me.pos.y, r: r, 'fill-opacity': me.alpha });
		
		// draw breakdown chart
		var i,x=me.pos.x,y=me.pos.y,x0,x1,x2,x3,y0,y1,y2,y3,ir = r*0.85, oa = -Math.PI * 0.5, da;
		for (i in me.breakdown) {
			da = me.breakdown[i] * Math.PI * 2;
			x0 = x; 
			y0 = y;
			x2 = x+Math.cos((oa+da))*r;
			y2 = y+Math.sin((oa+da))*r;
			x3 = x+Math.cos((oa))*r;
			y3 = y+Math.sin((oa))*r;
			oa += da;
			
			var path = "M"+x0+" "+y0+" L"+x2+" "+y2+" A"+r+","+r+" 0 "+(da > Math.PI ? "1,0" : "0,0")+" "+x3+" "+y3+" Z";
			
			me.breakdownArcs[i].attr({ path: path, 'stroke-opacity': me.alpha*0.2, 'fill-opacity': me.breakdownOpacities[i]*me.alpha });
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
		me.label.css({ width: 2*r+'px', opacity: me.alpha });
		me.label.css({ left: (me.pos.x-r)+'px', top: (me.pos.y-me.label.height()*0.5)+'px' });
	
		//if (me.icon) me.icon.translate(me.pos.x - ox, me.pos.y - oy);
	
	};
	
	/*
	 * removes all visible elements from the page
	 */
	this.hide = function() {
		var me = this, i;
		me.circle.remove();
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
	this.show = function() {
		var me = this, i;
		
		me.circle = me.paper.circle(me.pos.x, me.pos.y, me.bubbleRad * me.bc.bubbleScale)
			.attr({ stroke: false, fill: me.color });

		
		me.label = $('<div class="label"><div class="amount">'+utils.formatNumber(me.node.amount)+'</div><div class="desc">'+me.node.label+'</div></div>');
		$('#bubble-chart').append(me.label);
		
		if (me.node.children.length > 1) {
			$(me.circle.node).css({ cursor: 'pointer'});
			$(me.label).css({ cursor: 'pointer'});
		}	
		
		me.breakdownArcs = [];
		
		for (i in me.breakdown) {
			var arc = me.paper.path("M 0 0 L 2 2")
				.attr({ fill: '#fff', 'fill-opacity': Math.random()*0.4 + 0.3, stroke: '#fff'});
			me.breakdownArcs.push(arc);
		}
		
		var list = [me.circle.node, me.label];
		for (i in me.breakdownArcs) {
			list.push(me.breakdownArcs[i].node);
		}
		var mgroup = new me.ns.MouseEventGroup(me, list);
		mgroup.click(me.onclick.bind(me));
		mgroup.hover(me.onhover.bind(me));
		mgroup.unhover(me.onunhover.bind(me));
		
		me.visible = true;
		
	};
	
	this.init();
};