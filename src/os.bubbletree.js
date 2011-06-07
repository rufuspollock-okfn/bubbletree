/*!
 * OpenSpending BubbleTree 0.8
 *
 * Copyright (c) 2011 Gregor Aisch (http://driven-by-data.net)
 * Licensed under the MIT license
 */
/*jshint undef: true, browser:true, jquery: true, devel: true */
/*global Raphael, TWEEN, vis4, vis4color, vis4loader */

var OpenSpending = OpenSpending ? OpenSpending : {}; 


OpenSpending.BubbleTree = function(config, onHover, onUnHover) {
	
	var me = this;
	
	me.$container = $(config.container);	
	
	me.config = config;
	
	/*
	 * this function is called when the user hovers a bubble
	 */
	//me.onHover = onHover;
	
	//me.onUnHover = onUnHover;
	me.tooltip = config.tooltipCallback;
	
	/*
	 * stylesheet JSON that contains colors and icons for the bubbles
	 */
	me.style = config.bubbleStyles;
	
	me.ns = OpenSpending.BubbleTree;
	
	/*
	 * hashmap of all nodes by url token
	 */
	me.nodesByUrlToken = {};
	
	/*
	 * flat array of all nodes
	 */
	me.nodeList = [];
	
	me.iconsByUrlToken = {};
	
	me.globalNodeCounter = 0;
	
	me.displayObjects = [];
	
	me.bubbleScale = 1;
	
	me.globRotation = 0;
	
	me.currentYear = config.initYear;
	
	me.currentCenter = undefined;
	
	me.currentTransition = undefined;
	
	/*
	 * @public loadData
	 * @deprecated!
	 */
	me.loadData = function(url) {
		$.ajax({
			url: url,
			dataType: 'json',
			success: this.setData.bind(this)
		});
	};
	
	/*
	 * is either called directly or by $.ajax when data json file is loaded
	 */
	me.setData = function(data) {
		var me = this;
		me.initData(data);
		me.initPaper();
		me.initBubbles();
		me.initTween();
		//me.navigateTo(me.treeRoot);
		me.initHistory();
		
		//this.quickPrototype(data);
	};
	
	/*
	 * initializes the data tree, adds links to parent node for easier traversal etc
	 */
	me.initData = function(root) {
		var me = this;
		me.traverse(root, 0);
		me.treeRoot = root;
	};
	
	/*
	 * used for recursive tree traversal
	 */
	me.traverse = function(node, index) {
		var c, child, pc, me = this, urlTokenSource;
		
		// store node in flat node list
		me.nodeList.push(node);
		
		node.famount = me.ns.Utils.formatNumber(node.amount);
		
		if (me.style.hasOwnProperty(node.id)) {
			node.color = me.style[node.id].color;	
		} else if (node.hasOwnProperty('color') && node.color !== undefined) {
			// use color given in data
		} else {
			// use color from parent node if no other match available
			if (node.level > 0) node.color = node.parent.color;
			else node.color = '#999999';
		}
		// lighten up the color if there are no children
		if (node.children.length < 2) {
			node.color = vis4color.fromHex(node.color).saturation('*.86').x;
		}
		
		if (node.level > 0) {
			pc = node.parent.children;
			if (pc.length > 1) {	
				node.left = pc[(index-1+pc.length) % pc.length];
				node.right = pc[(Number(index)+1) % pc.length];
				if (node.right == node.left) node.right = undefined;
			}
		}
		if (node.label !== undefined && node.label !== "") {
			urlTokenSource = node.label;
		} else if (node.token !== undefined && node.token !== "") {
			urlTokenSource = node.token;
		} else {
			urlTokenSource = ''+me.globalNodeCounter;
		}
		
		me.globalNodeCounter++;
		
		node.urlToken = urlTokenSource.toLowerCase().replace(/\W/g, "-");
		while (me.nodesByUrlToken.hasOwnProperty(node.urlToken)) {
			node.urlToken += '-';
		} 
		me.nodesByUrlToken[node.urlToken] = node;
		node.maxChildAmount = 0;
		for (c in node.children) {
			child = node.children[c];
			child.parent = node;
			node.maxChildAmount = Math.max(node.maxChildAmount, child.amount);
			me.traverse(child, c);
		}
		
		// fake breakdowns
		if (me.config.fakeBreakdowns && (!node.breakdowns || node.breakdowns.length < 1)) {
			node.breakdowns = [];
			var sum = 0, val;
			for (c=0; c<me.config.fakeBreakdowns.length; c++) {
				val = Math.random();
				node.breakdowns.push( { id: c, label: me.config.fakeBreakdowns[c], amount: val } );
				sum += val;
			}
			for (c in node.breakdowns) {
				node.breakdowns[c].amount = node.breakdowns[c].amount / sum * node.amount;
			}
		}
	};
	
	/*
	 * initializes all that RaphaelJS stuff
	 */
	me.initPaper = function() {
		var me = this, $c = me.$container, rt = me.treeRoot,
			w = $c.width(), h = $c.height(),
			paper = Raphael($c[0], w, h),
			maxRad = Math.min(w, h) * 0.5 - 40,
			base, Vector = me.ns.Vector,
			origin = new Vector(w * 0.5, h * 0.5); // center
			
		me.width = w;
		me.height = h;
		me.paper = paper;
		base = Math.pow((Math.pow(rt.amount, 0.6) + Math.pow(rt.maxChildAmount, 0.6)*2) / maxRad, 1.6666666667);
//		window.alert(maxRad+', '+paper.height+'  '+paper.width+'   '+$c.height()+'   '+$c.width());
		me.a2radBase = me.ns.a2radBase = base;
		
		me.origin = origin;
	};
	
	/*
	 * initializes the Tweening engine
	 */
	me.initTween = function() {
		this.tweenTimer = setInterval(this.loop, 1000/120);
	};
	
	/*
	 * creates instances for all bubbles in the dataset. the bubbles will
	 * remain invisble until they enter the stage via changeView()
	 */
	me.initBubbles = function() {
		vis4.log('initBubbles');
		var me = this, rt = me.treeRoot, Bubbles = me.ns.Bubbles, bubbleClass;
		
		// chosse one of them for the vis
		switch (me.config.bubbleType) {
			case 'pie':
				bubbleClass = Bubbles.Pies;
				break;
			case 'donut':
				bubbleClass = Bubbles.Donut;
				break;
			case 'multi':
				bubbleClass = Bubbles.Multi;
				break;
			case 'icon':
				bubbleClass = Bubbles.Icon;
				me.initIcons();
				break;
			default:
				bubbleClass = Bubbles.Plain;
				break;
		}
		me.ns.Bubble = bubbleClass;	
		
		var rootBubble = me.createBubble(rt, me.origin, 0, 0, rt.color);
		me.traverseBubbles(rootBubble);
	};
	
	/*
	 * if the bubble type is set to "icon", this func will be called before the
	 * bubbles are traversed. it will store icon urls into the nodes 
	 */
	me.initIcons = function() {
		var me = this, styles = me.config.bubbleStyles, i, node, taxonomy, id, taxStyles;
		
		for (i in me.nodeList) {
			node = me.nodeList[i];
			id = node.name;
			if (node.hasOwnProperty('taxonomy')) {
				taxonomy = node.taxonomy;
				if (styles.hasOwnProperty(taxonomy)) {
					taxStyles = styles[taxonomy];
					if (taxStyles.hasOwnProperty(id) && taxStyles[id].hasOwnProperty('icon')) {
						node.iconUrl = taxStyles[id].icon;
					}
				} 
			} else {
				// node has no taxonomy
				if (styles.hasOwnProperty('id') && styles.id.hasOwnProperty(node.id) && styles.id[node.id].hasOwnProperty('icon')) {
					node.iconUrl = styles.id[node.id].icon;
				}
			}
		}
	};
	
	me.iconsLoaded = function(ldr) {
		var me = this, i, j, paths, icon, svg, item;
		vis4.log('loaded '+ldr.items.length+' icons');
		for (i in ldr.items) {
			item = ldr.items[i];
			svg = item.data;
			if (!me.iconsByUrlToken.hasOwnProperty(item.id)) {
				me.iconsByUrlToken[item.id] = [];
			}
			paths = svg.getElementsByTagName('path');
			for (j in paths) {
				me.iconsByUrlToken[item.id].push(paths[j].getAttribute('d'));
			}
		}
	};

	me.traverseBubbles = function(parentBubble) {
		var me = this, ring,
			a2rad = me.ns.Utils.amount2rad,
			i, c, children, childBubble, childRadSum = 0, oa = 0, da, ca, twopi = Math.PI * 2;
		children = parentBubble.node.children;
		
		// sum radii of all children
		for (i in children) {
			c = children[i];
			childRadSum += a2rad(c.amount);
		}
		
		if (children.length > 0) {
			// create ring
			ring = me.createRing(parentBubble.node, parentBubble.pos, 0, { stroke: '#ccc', 'stroke-dasharray': "- " });
		}
		
		for (i in children) {
			c = children[i];
		
			da = a2rad(c.amount) / childRadSum * twopi;
			ca = oa + da*0.5;
		
			if (isNaN(ca)) vis4.log(oa, da, c.amount, childRadSum, twopi);
		
			c.centerAngle = ca;
		
			childBubble = me.createBubble(c, parentBubble.pos, 0, ca, c.color);
			// für jedes kind einen bubble anlegen und mit dem parent verbinden
			oa += da;
			
			me.traverseBubbles(childBubble);
		}

	};
	
		
	/*
	 * creates a new bubble 
	 */
	me.createBubble = function(node, origin, rad, angle, color) {
		var me = this, ns = me.ns, i, b, bubble;
		bubble = new ns.Bubble(node, me, origin, rad, angle, color);
		//me.bubbles.push(bubble);
		me.displayObjects.push(bubble);
		// vis4.log('created bubble for', node.label);
		return bubble;
	};
	
	me.createRing = function(node, origin, rad, attr) {
		var me = this, ns = me.ns, ring;
		ring = new ns.Ring(node, me, origin, rad, attr);
		me.displayObjects.push(ring);
		return ring;
	};
	
	/*
	 * is called every time the user changes the view
	 * each view is defined by the selected node (which is displayed 
	 */
	me.changeView = function(token) {
		var me = this, 
			paper = me.paper,
			maxRad = Math.min(me.width, me.height) * 0.5 - 60,
			ns = me.ns, 
			utils = ns.Utils, 
			o = me.origin,
			l1attr = { stroke: '#ccc', 'stroke-dasharray': "- " },
			l2attr = { stroke: '#ccc', 'stroke-dasharray': ". " },
			a2rad = utils.amount2rad,
			root = me.treeRoot, 
			nodesByUrlToken = me.nodesByUrlToken, 
			node = nodesByUrlToken.hasOwnProperty(token) ? nodesByUrlToken[token] : null,
			t = new ns.Layout(), 
			bubble, tr, i, twopi = Math.PI * 2,
			getBubble = me.getBubble.bind(me), getRing = me.getRing.bind(me),
			unify = me.unifyAngle;
		
		if (node !== null) {
		
			// what do you we have to do here?
			// - find out the origin position
			// -
		
			var parent, grandpa, sibling, c, cn, rad1, rad2, rad, srad, sang, ring, tgtScale, 
				radSum, leftTurn = false, rightTurn = false;
		
			
			
			// initially we will mark all bubbles and rings for hiding
			// get....() will set this flag to false 
			for (i in me.displayObjects) me.displayObjects[i].hideFlag = true;
			
		
			if (node == root) {
			
				
				t.$(me).bubbleScale = 1.0;
				
				// move origin to center
				t.$(o).x = me.width * 0.5;
				t.$(o).y = me.height * 0.5;

				// make the root bubble visible
				parent = getBubble(root);
				//parent.childRotation = 0;
				
				rad1 = a2rad(node.amount) + a2rad(node.maxChildAmount) + 20;

				ring = getRing(root);
				t.$(ring).rad = rad1;

				for (i in node.children) {
					cn = node.children[i];
					// adjust rad and angle for children
					bubble = getBubble(cn);
					t.$(bubble).angle = unify(cn.centerAngle + parent.childRotation);
					t.$(bubble).rad = rad1;
				}
				
			} else { 
				// node is not the root node
				
				tgtScale = maxRad / (a2rad(node.amount) + a2rad(node.maxChildAmount)*2);
				t.$(me).bubbleScale = tgtScale;
				
				parent = getBubble(node);
				
				if (me.currentCenter && me.currentCenter == node.left) rightTurn = true;
				else if (me.currentCenter && me.currentCenter == node.right) leftTurn = true;
				
				var sa = me.shortestAngleTo;
				//if (leftTurn) sa = me.shortestLeftTurn;
				//if (rightTurn) sa = me.shortestRightTurn;

				t.$(parent).angle = sa(parent.angle, 0);
				
				// find the sum of all radii from node to root
				rad1 = a2rad(node.amount) * tgtScale + a2rad(node.maxChildAmount) * tgtScale + 20;

				ring = getRing(node);
				t.$(ring).rad = rad1;

				grandpa = getBubble(node.parent);
				grandpa.childRotation = -node.centerAngle;
				
				t.$(grandpa).rad = 0;
				// 
				rad2 = me.width * 0.5 - Math.max(me.width * 0.5 - 280 - 
					tgtScale * (a2rad(node.parent.amount)+a2rad(node.amount)), 
					tgtScale*a2rad(node.parent.amount)*-1+60);

				radSum = rad1 + rad2;
				
				t.$(o).x = me.width * 0.5 - rad2;
				t.$(o).y = me.height * 0.5;
				
				rad2 += me.width * 0.1;
				
				ring = getRing(node.parent);
				t.$(ring).rad = rad2;
				
				t.$(parent).rad = rad2;
				
				
				// children
				for (i in node.children) {
					cn = node.children[i];
					// adjust rad and angle for children
					bubble = getBubble(cn);
					t.$(bubble).angle = me.shortestAngleTo(bubble.angle, cn.centerAngle + parent.childRotation);
					t.$(bubble).rad = rad1;
				}
				
				// left and right sibling
				
				if (node.left) {
					sibling = node.left;
					srad = a2rad(sibling.amount)*tgtScale;
					sang = twopi - Math.asin((me.paper.height*0.5 + srad - 50) / rad2);
					
					bubble = getBubble(sibling);
					t.$(bubble).rad = rad2;
					t.$(bubble).angle = sa(bubble.angle, sang);
				}
				if (node.right) {
					sibling = node.right;
					srad = a2rad(sibling.amount)*tgtScale;
					sang = Math.asin((me.paper.height*0.5 + srad - 50) / rad2);
					
					bubble = getBubble(sibling);
					t.$(bubble).rad = rad2;
					t.$(bubble).angle = sa(bubble.angle, sang);
				}
			}
			
			// now we're going to check all hides and shows
			for (i in me.displayObjects) {
				var obj = me.displayObjects[i];
				if (obj.hideFlag && obj.visible) {
					// bubble is on stage but shouldn't
					t.$(obj).alpha = 0; // let it disappear
					if (obj.className == "bubble" && obj.node.level > 1) t.$(obj).rad = 0; // move to center
					//else t.$(obj).rad = 
					t.hide(obj); // remove from stage afterwards
				} else if (!obj.hideFlag) {
					// bubble is not on stage but should
					t.$(obj).alpha = 1; 
					if (!obj.visible) {
						obj.alpha = 0;
						t.show(obj);
					}
				} 
			}

			tr = new ns.AnimatedTransitioner($.browser.msie ? 0 : 1000);
			tr.changeLayout(t);
			me.currentTransition = tr;
			me.currentCenter = node;
						
		} else {
			utils.log('node '+token+' not found');
		}
		// step1: 
		
		// step2: 
	};
	
	me.unifyAngle = function(a) {
		var pi = Math.PI, twopi = pi * 2;
		while (a >= twopi) a -= twopi;
		while (a < 0) a += twopi;
		return a;
	};
	
	me.shortestAngle = function(f, t) {
		var deg = function(a) { return Math.round(a/Math.PI*180)+''; };
		var pi = Math.PI, twopi = pi * 2, unify= me.unifyAngle;
		f = unify(f);
		t = unify(t);
		var sa = t - f;
		if (sa > pi) sa -= twopi;
		if (sa < -pi) sa += twopi;
		
		vis4.log('shortestAngle', deg(f), deg(t), deg(sa));
		
		return sa;
	};
	
	me.shortestAngleTo = function(f, t) {
		return f+me.shortestAngle(f, t);
	};
	
	me.shortestLeftTurn = function(f, t) {
		var sa = me.shortestAngle(f, t);
		if (sa > 0) sa = sa - Math.PI*2;
		return f+sa;
	};
	
	me.shortestRightTurn = function(f, t) {
		var sa = me.shortestAngle(f, t);
		if (sa < 0) sa = Math.PI*2 + sa;
		return f+sa;
	};

	
	/*
	 * returns the instance of a bubble for a given node
	 */
	me.getBubble = function(node) {
		return this.getDisplayObject('bubble', node);
	};
	
	/*
	 * 
	 */
	me.getRing = function(node) {
		return this.getDisplayObject('ring', node);
	};
	
	me.getDisplayObject = function(className, node) {
		var me = this, i, o;
		for (i in me.displayObjects) {
			o = me.displayObjects[i];
			if (o.className != className) continue;
			if (o.node == node) {
				o.hideFlag = false;
				return o;
			}
		}
		vis4.log(className+' not found for node', node);
	};
	
	/*
	me.createRing = function(t, origin, rad, attr) {
		var me = this, ns = me.ns, 
			ring = new ns.Ring(me, origin, attr, rad);
		ring.toBack();
		me.rings.push(ring);
		t.$(ring).rad = rad;
		return ring;
	};
	*/
	
	me.initHistory = function() {
		$.history.init(me.urlChanged.bind(me), { unescape: ",/" });
	};
	
	me.freshUrl = '';
	
	/*
	 * callback for every url change, either initiated by user or
	 * by this class itself
	 */
	me.urlChanged = function(hash) {
		var me = this, tr = me.currentTransition;
		
		me.freshUrl = hash;
		
		if (tr && tr.running) {
			vis4.log('transition is running at the moment, adding listener');
			tr.onComplete(me.changeUrl.bind(me));
		} else {
			me.changeUrl();
		}
	};
	
	/*
	 * this function initiate the action which follows the url change
	 */
	me.changeUrl = function() {
		var me = this, parts = me.freshUrl.split('/'), yr = parts[1], token = parts[parts.length-1], url;
		
		if (me.freshUrl === "") me.navigateTo(me.treeRoot);
		
		if (me.nodesByUrlToken.hasOwnProperty(token)) {
			url = me.getUrlForNode(me.nodesByUrlToken[token]);
			if (me.freshUrl != url) {
				// node found but url not perfect
				$.history.load(url);
			} else {
				me.navigateTo(me.nodesByUrlToken[token], true);
			}
		} else {
			me.navigateTo(me.treeRoot);
		}
	};
	
	me.navigateTo = function(node, fromUrlChange) {
		var me = this;
		if (fromUrlChange) me.changeView(node.urlToken);
		else $.history.load(me.getUrlForNode(node));
	};
	
	/*
	 * creates a valid url for a given node, e.g. /2010/health/medical-supplies
	 */
	me.getUrlForNode = function(node) {
		var parts = [];
		parts.push(node.urlToken);
		while (node.parent) {
			parts.push(node.parent.urlToken);
			node = node.parent;
		}
		parts.reverse();
		return '/'+me.currentYear+'/'+parts.join('/');
	};
	
	
	this.loop = function() {
		TWEEN.update();
	};
	
};

OpenSpending.BubbleTree.Styles = {};