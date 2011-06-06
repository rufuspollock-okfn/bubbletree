/*jshint undef: true, browser:true, jquery: true, devel: true */
/*global Raphael, TWEEN, OpenSpending, vis4, vis4color */


/*
 * represents a bubble
 */
OpenSpending.BubbleTree.Bubbles.Multi = function(node, bubblechart, origin, radius, angle, color) {

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
		me.breakdown = breakdown;
		me.breakdownColors = [
			me.node.color, vis4color.fromHex(me.node.color).lightness(0.8).x,
			vis4color.fromHex(me.node.color).lightness(0.9).x
		];
		
		me.govRad = utils.amount2rad(me.node.amount * breakdown[0]);
		
		var showIcon = false; //this.bubbleRad * this.bc.bubbleScale > 30;
		// create label

		me.initialized = true;
		
		//me.show();
	};
	
	/*
	 *
	 */
	me.onclick = function(e) {
		var me = this;
		if (me.node.children.length > 0) {
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
	
	/*
	 * adds all visible elements to the page
	 */
	this.show = function() {
		var me = this, i;
		
		me.circle = me.paper.circle(me.pos.x, me.pos.y, me.govRad * me.bc.bubbleScale)
			.attr({ stroke: false, fill: me.color });

		me.label = $('<div class="label"><div class="amount">'+utils.formatNumber(me.node.amount)+'</div><div class="desc">'+me.node.label+'</div></div>');
		$('#bubble-chart').append(me.label);
		
		if (me.node.children.length > 1) {
			$(me.circle.node).css({ cursor: 'pointer'});
			$(me.label).css({ cursor: 'pointer'});
		}	
		
		me.breakdownArcs = [];
		
		for (i in me.breakdown) {
			if (i < 1) {
				continue;
			}
			var arc = me.paper.path("M 0 0 L 2 2")
				.attr({ fill: me.breakdownColors[i], 'fill-opacity': 1, stroke: false });
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
	
	
	this.draw = function() {
		var me = this, ro = me.bubbleRad * me.bc.bubbleScale, ri = me.govRad * me.bc.bubbleScale, 
			ox = me.pos.x, oy = me.pos.y, devnull = me.getXY();
		if (!me.visible) return;
		
		me.circle.attr({ cx: me.pos.x, cy: me.pos.y, r: ri, 'fill-opacity': me.alpha });
		
		// draw breakdown chart
		var i,x=me.pos.x,y=me.pos.y,x0,x1,x2,x3,y0,y1,y2,y3, oa = -Math.PI * 0.5, da;
		for (i in me.breakdown) {
			if (i < 1) continue;
			da = (me.breakdown[i] / (1 - me.breakdown[0])) * Math.PI * 2;
			x0 = x+Math.cos((oa))*ri; 
			y0 = y+Math.sin((oa))*ri;
			x1 = x+Math.cos((oa+da))*ri;
			y1 = y+Math.sin((oa+da))*ri;
			x2 = x+Math.cos((oa+da))*ro;
			y2 = y+Math.sin((oa+da))*ro;
			x3 = x+Math.cos((oa))*ro;
			y3 = y+Math.sin((oa))*ro;
			oa += da;
			
			var path = "M"+x0+" "+y0+" A"+ri+","+ri+" 0 "+(da > Math.PI ? "1,1" : "0,1")+" "+x1+","+y1+" L"+x2+" "+y2+" A"+ro+","+ro+" 0 "+(da > Math.PI ? "1,0" : "0,0")+" "+x3+" "+y3+" Z";
			
			me.breakdownArcs[i-1]
				.attr({ path: path, 'fill-opacity': me.alpha*0.5 });
		}
		

		//me.label.attr({ x: me.pos.x, y: me.pos.y, 'font-size': Math.max(4, me.bubbleRad * me.bc.bubbleScale * 0.25) });
		if (ro < 20) me.label.hide();
		else {
			me.label.show();
		
			if (ro < 40) {
				me.label.find('.desc').hide();
			} else {
				// full label
				me.label.find('.desc').show();
			}
		}
		me.label.css({ width: 2*ro+'px', opacity: me.alpha });
		me.label.css({ left: (me.pos.x-ro)+'px', top: (me.pos.y-me.label.height()*0.5)+'px' });
	
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
	
	
	this.init();
};