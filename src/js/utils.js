/*jshint undef: true, browser:true, jquery: true, devel: true */
/*global Raphael, TWEEN, BubbleTree */

BubbleTree.Utils = {};

BubbleTree.Utils.log = function() {
	try {
		if (window.hasOwnProperty('console')) console.log.apply(this, arguments);
	} catch (e) {}	
};

BubbleTree.Utils.amount2rad = function(a) {
	return Math.pow(Math.max(0, a) /BubbleTree.a2radBase, 0.6);
};

BubbleTree.Utils.formatNumber = function(n) {
	var prefix = '';
	if (n < 0) {
		n = n*-1;
		prefix = '-';
	}
	if (n >= 1000000000000) return prefix+Math.round(n / 100000000000)/10 + 't';
	if (n >= 1000000000) return prefix+Math.round(n / 100000000)/10 + 'b';
	if (n >= 1000000) return prefix+Math.round(n / 100000)/10 + 'm';
	if (n >= 1000) return prefix+Math.round(n / 100)/10 + 'k';
	else return prefix+n;
	
};
