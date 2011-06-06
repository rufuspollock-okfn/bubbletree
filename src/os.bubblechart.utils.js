/*jshint undef: true, browser:true, jquery: true, devel: true */
/*global Raphael, TWEEN, OpenSpending */

OpenSpending.BubbleChart.Utils = {};

OpenSpending.BubbleChart.Utils.log = function() {
	try {
		if (window.hasOwnProperty('console')) console.log.apply(this, arguments);
	} catch (e) {}	
};

OpenSpending.BubbleChart.Utils.amount2rad = function(a) {
	return Math.pow(a/OpenSpending.BubbleChart.a2radBase, 0.6);
};

OpenSpending.BubbleChart.Utils.formatNumber = function(n) {
	if (n >= 1000000000000) return Math.round(n / 100000000000)/10 + 't';
	if (n >= 1000000000) return Math.round(n / 100000000)/10 + 'b';
	if (n >= 1000000) return Math.round(n / 100000)/10 + 'm';
	if (n >= 1000) return Math.round(n / 100)/10 + 'k';
	else return n;
	
};
