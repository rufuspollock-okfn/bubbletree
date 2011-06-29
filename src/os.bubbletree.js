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
	
	if (!me.config.hasOwnProperty('rootPath')) me.config.rootPath = '';
	
	/*
	 * this function is called when the user hovers a bubble
	 */
	//me.onHover = onHover;
	
	//me.onUnHover = onUnHover;
	me.tooltip = config.tooltipCallback ? config.tooltipCallback : function() {};
	
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
	
	me.baseUrl = '';
	
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
		root.level = 0;
		me.preprocessData(root);
		me.traverse(root, 0);
		me.treeRoot = root;
	};
	
	me.preprocessData = function(root) {
		var me = this, maxNodes = me.config.maxNodesPerLevel;
		if (maxNodes) {
			if (maxNodes < root.children.length) {
				// take the smallest nodes
				// sort children
				var tmp = me.sortChildren(root.children);
				tmp.reverse();
				var keep = [], move = [], moveAmount = 0, breakdown;
				for (var i in root.children) {
					if (i < maxNodes) {
						keep.push(root.children[i]);
					} else {
						move.push(root.children[i]);
						moveAmount += root.children[i].amount;
					}
				}
				root.children = keep;
				root.children.push({
					'label': 'More',
					'name': 'more',
					'amount': moveAmount,
					'children': move,
					'breakdown': breakdown
				});
			}
		}
	};
	
	/*
	 * used for recursive tree traversal
	 */
	me.traverse = function(node, index) {
		var c, child, pc, me = this, urlTokenSource, styles = me.config.bubbleStyles;
		
		if (!node.children) node.children = [];
		
		// store node in flat node list
		me.nodeList.push(node);
		
		node.famount = me.ns.Utils.formatNumber(node.amount);
		if (node.parent) node.level = node.parent.level + 1;
		
		if (styles) {
		
			var props = ['color', 'shortLabel', 'icon'];
		
			for (var p in props) {
				var prop = props[p];
				
				if (styles.hasOwnProperty('id') && styles.id.hasOwnProperty(node.id) && styles.id[node.id].hasOwnProperty(prop)) {
					// use color by id
					node[prop] = styles.id[node.id][prop];
				} else if (node.hasOwnProperty('name') && styles.hasOwnProperty('name') && styles.name.hasOwnProperty(node.name) && styles.name[node.name].hasOwnProperty(prop)) {
					// use color by id
					node[prop] = styles.name[node.name][prop];
				} else if (node.hasOwnProperty('taxonomy') && styles.hasOwnProperty(node.taxonomy) && styles[node.taxonomy].hasOwnProperty(node.name) && styles[node.taxonomy][node.name].hasOwnProperty(prop)) {
					node[prop] = styles[node.taxonomy][node.name][prop];
				}
			}
		} 
		
		if (!node.color) {
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
		
		// sort children
		node.children = me.sortChildren(node.children, true);
		
		for (c in node.children) {
			child = node.children[c];
			child.parent = node;
			node.maxChildAmount = Math.max(node.maxChildAmount, child.amount);
			me.traverse(child, c);
		}
		
		if (node.breakdowns !== null) {
			node.breakdownsByName = {};
			for (c in node.breakdowns) {
				var bd = node.breakdowns[c];
				bd.famount = me.ns.Utils.formatNumber(bd.amount);
				if (bd.name) node.breakdownsByName[bd.name] = bd;
			}
		}
	};
	
	me.sortChildren = function(children, alternate) {
		var tmp = [], odd = true;
		children.sort(me.compareAmounts);
		if (alternate) {
			while (children.length > 0) {
				tmp.push(odd ? children.pop() : children.shift());
				odd = !odd;
			}
			return tmp;
		} else {
			return children;
		}
	};
	
	me.compareAmounts = function(a, b) {
		if (a.amount > b.amount) return 1;
		if (a.amount == b.amount) return 0;
		return -1;
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
		me.a2radBase = me.ns.a2radBase = base;
		
		me.origin = origin;
		
		$(window).resize(me.onResize.bind(me));
	};
	
	me.onResize = function() {
		var me = this, $c = me.$container, w = $c.width(), h = $c.height(), 
			maxRad = Math.min(w, h) * 0.5 - 40, base, rt = me.treeRoot, b, obj;
		me.paper.setSize(w, h);
		me.origin.x = w * 0.5;
		me.origin.y = h * 0.5;
		me.width = w;
		me.height = h;
		base = Math.pow((Math.pow(rt.amount, 0.6) + Math.pow(rt.maxChildAmount, 0.6)*2) / maxRad, 1.6666666667);
		me.a2radBase = me.ns.a2radBase = base;
		
		for (b in me.displayObjects) {
			obj = me.displayObjects[b];
			if (obj.className == "bubble") {
				obj.bubbleRad = me.ns.Utils.amount2rad(obj.node.amount);
			}
		}
		// vis4.log(me);
		if (me.currentCenter) {
			me.changeView(me.currentCenter.urlToken);
		}
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
		//vis4.log('initBubbles');
		var me = this, rt = me.treeRoot, i, icons = false, Bubbles = me.ns.Bubbles, bubbleClass;
		
		me.bubbleClasses = [];
		
		// defaults to plain bubble
		if (!me.config.hasOwnProperty('bubbleType')) me.config.bubbleType = ['plain'];
		// convert to array if neccessairy
		if (!$.isArray(me.config.bubbleType)) me.config.bubbleType = [me.config.bubbleType];
		
		if ($.isArray(me.config.bubbleType)) {
			for (i in me.config.bubbleType) {
				if (me.config.bubbleType[i] == 'icon') icons = true;
				me.bubbleClasses.push(me.getBubbleType(me.config.bubbleType[i]));
			}
		}
		
		var rootBubble = me.createBubble(rt, me.origin, 0, 0, rt.color);
		me.traverseBubbles(rootBubble);
	};
	
	/*
	 * returns the bubble class for a given bubble class id
	 * e.g. 'icon' > OpenSpending.BubbleTree.Bubbles.Icon
	 */
	me.getBubbleType = function(id) {
		var me = this, Bubbles = me.ns.Bubbles;
		// chosse one of them for the vis
		switch (id) {
			case 'pie': return Bubbles.Pies;
			case 'donut': return Bubbles.Donut;
			case 'multi': return Bubbles.Multi;
			case 'icon': return Bubbles.Icon;
			default: return Bubbles.Plain;
		}
	};

	/*
	 * iterates over the complete tree and creates a bubble for
	 * each node
	 */
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
			ring = me.createRing(parentBubble.node, parentBubble.pos, 0, { stroke: '#888', 'stroke-dasharray': "-" });
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
	 * creates a new bubble for a given node. the bubble type will be chosen
	 * by the level of the node
	 */
	me.createBubble = function(node, origin, rad, angle, color) {
		var me = this, ns = me.ns, i, b, bubble, classIndex = node.level;
		classIndex = Math.min(classIndex, me.bubbleClasses.length-1);
		
		bubble = new me.bubbleClasses[classIndex](node, me, origin, rad, angle, color);
		me.displayObjects.push(bubble);
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
			maxRad = Math.min(me.width, me.height) * 0.35,
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
			
		
			if (node == root || node.parent == root && node.children.length < 2) {
						
				t.$(me).bubbleScale = 1.0;
				
				// move origin to center
				t.$(o).x = me.width * 0.5;
				t.$(o).y = me.height * 0.5;

				// make the root bubble visible
				parent = getBubble(root);
				
				//parent.childRotation = 0;
				
				if (node != root) {
					parent.childRotation = -node.centerAngle;
				}
				
				rad1 = a2rad(root.amount) + a2rad(root.maxChildAmount) + 20;

				ring = getRing(root);
				t.$(ring).rad = rad1;

				for (i in root.children) {
					cn = root.children[i];
					// adjust rad and angle for children
					bubble = getBubble(cn);
					t.$(bubble).angle = unify(cn.centerAngle + parent.childRotation);
					t.$(bubble).rad = rad1;
				}
				
			} else { 
			
				// node is not the root node
	
				var origNode = node; // save the reference of the node..

				if (node.children.length < 2) { // ..because if it has no children..
					node = node.parent;         // ..we center on its parent
				} 
				
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
				rad1 = (a2rad(node.amount) + a2rad(node.maxChildAmount)) * tgtScale + 20;

				ring = getRing(node);
				t.$(ring).rad = rad1;

				grandpa = getBubble(node.parent);
				grandpa.childRotation = -node.centerAngle;
				
				var maybeRoot = grandpa;
				
				while (maybeRoot && maybeRoot.node.parent) {
					maybeRoot = getBubble(maybeRoot.node.parent, true);
					t.$(maybeRoot).rad = 0;
				}
				
				t.$(grandpa).rad = 0;
				// 
				var hw = me.width * 0.5;
				
				rad2 = 0 - Math.max(
					//hw *0.8 - tgtScale * (a2rad(node.parent.amount)+a2rad(node.amount)), // maximum visible part
					hw * 0.8 - tgtScale * (a2rad(node.parent.amount) + a2rad(Math.max(node.amount*1.15 + node.maxChildAmount*1.15, node.left.amount * 0.85, node.right.amount * 0.85))),
					tgtScale*a2rad(node.parent.amount)*-1 + hw*0.15 // minimum visible part
				) + hw;
				
				vis4.log('rad (parent) = '+rad2,'   rad (center) = ',rad1);
				
				if (node.left && node.right) {
					var maxSiblSize = tgtScale * a2rad(Math.max(node.left.amount, node.right.amount));
				}
		
				//rad2 = hw - (tgtScale*a2rad(node.parent.amount)*-1+ hw*0.15);

				radSum = rad1 + rad2;
				
				t.$(o).x = me.width * 0.5 - rad2 - (node != origNode ? rad1 * 0.35: 0);
				t.$(o).y = me.height * 0.5;
				
				vis4.log('o.x = '+o.x,'    t.$(o).x = '+t.$(o).x);
				
				new vis4.DelayedTask(1500, vis4, vis4.log, o, grandpa.pos);
				
				rad2 += me.width * 0.1;
				
				ring = getRing(node.parent);
				t.$(ring).rad = rad2;
				
				t.$(parent).rad = rad2;
				
				var ao = 0-(node != origNode ? origNode.centerAngle + parent.childRotation: 0);
				// children
				for (i in node.children) {
					cn = node.children[i];
					// adjust rad and angle for children
					bubble = getBubble(cn);
					t.$(bubble).angle = me.shortestAngleTo(bubble.angle, cn.centerAngle + parent.childRotation + ao);
					t.$(bubble).rad = rad1;
				}
				
				// left and right sibling
				
				var siblCut = me.height * 0.07;
				
				if (node.left) {
					sibling = node.left;
					srad = a2rad(sibling.amount)*tgtScale;
					sang = twopi - Math.asin((me.paper.height*0.5 + srad - siblCut) / rad2);
					
					bubble = getBubble(sibling);
					t.$(bubble).rad = rad2;
					t.$(bubble).angle = sa(bubble.angle, sang);
				}
				if (node.right) {
					sibling = node.right;
					srad = a2rad(sibling.amount)*tgtScale;
					sang = Math.asin((me.paper.height*0.5 + srad - siblCut) / rad2);
					
					bubble = getBubble(sibling);
					t.$(bubble).rad = rad2;
					t.$(bubble).angle = sa(bubble.angle, sang);
				}
				
				node = origNode;
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

			tr = new ns.AnimatedTransitioner($.browser.msie || me.currentCenter == node ? 0 : 1000);
			tr.changeLayout(t);
			me.currentTransition = tr;
			if (!me.currentCenter && $.isFunction(me.config.firstNodeCallback)) {
				me.config.firstNodeCallback(node);
			}
			me.currentCenter = node;
			vis4.log('currentNode = '+me.currentCenter);
						
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
	me.getBubble = function(node, keepHidden) {
		return this.getDisplayObject('bubble', node, keepHidden);
	};
	
	/*
	 * 
	 */
	me.getRing = function(node) {
		return this.getDisplayObject('ring', node);
	};
	
	me.getDisplayObject = function(className, node, keepHidden) {
		var me = this, i, o;
		for (i in me.displayObjects) {
			o = me.displayObjects[i];
			if (o.className != className) continue;
			if (o.node == node) {
				if (!keepHidden) o.hideFlag = false;
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
		
		if (!me.freshUrl) {
			// setting an url for the very first time
			if (hash.indexOf('/~/')) {
				me.baseUrl = hash.substr(0, hash.indexOf('/~/'));
			}
		}
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
		var me = this, parts = me.freshUrl.split('/'), token = parts[parts.length-1], url;
		
		// var urlParts = me.freshUrl.split('/~/');
		
		
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
		vis4.log('bc.navigateTo(',node,',',fromUrlChange,')');
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
		return me.baseUrl+'/~/'+parts.join('/');
	};
	
	me.onNodeClick = function(node) {
		if ($.isFunction(me.config.nodeClickCallback)) {
			me.config.nodeClickCallback(node);
		}
	};
	
	// removes all nodes
	me.clean = function() {
		var me = this, i;
		$('.label').remove();
		/*for (i in me.displayObjects) {
			try {
				if ($.isFunction(me.displayObjects[i].hide)) me.displayObjects[i].hide();
			} catch (e) {
			
			}
		}*/
	};
	
	this.loop = function() {
		TWEEN.update();
	};
	
};

OpenSpending.BubbleTree.Styles = {};