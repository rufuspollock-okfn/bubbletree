/*jshint undef: true, browser:true, jquery: true, devel: true */
/*global OpenSpending, vis4 */

/*
 * loads the data and initializes the bubblechart
 * you need to include the bubblechart.min.js first
 */
OpenSpending.BubbleTree.Loader = function(config) {

	var me = this;

	me.config = config;

	me.ns = OpenSpending.BubbleTree;

	/*
	 * loads data from a local JSON file
	 */
	me.loadData = function() {
		var me = this, url = me.config.data;
		console.log('loading url ',url);
		$.ajax({
			url: url,
			context: me,
			dataType: 'json',
			success: function(data) {
				this.run(data);
			}
		});
	};

	/*
	 * run will be called by dataLoaded once, well, the data is loaded
	 */
	me.run = function(data) {
		console.log('running bubbletree');
		var me = this;
		// initialize bubble chart
		var bubbleChart = new OpenSpending.BubbleTree(
			me.config
		);
		bubbleChart.setData(data);
		
	};

	if (!me.config.hasOwnProperty('data')) {
		console.error('BubbleTree Error: no data set', me.config);
	}
	if (typeof me.config.data == "string") {
		// use the given js object
		me.loadData();
	} else {
		// load local tree json file
		me.run(me.config.data);
	}
};

