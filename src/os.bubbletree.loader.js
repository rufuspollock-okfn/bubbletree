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
	 * loads either a cached API aggregate or
	 * calls the API directly
	 */
	me.loadDataFromAPI = function() {
        var me = this,
            drilldowns,
            breakdown;

        me.rootNode = { label: me.config.rootNodeLabel };
	    OpenSpending.BubbleTree.getTree(
		{apiUrl: me.config.apiUrl,
		 dataset: me.config.dataset,
		 drilldowns: me.config.drilldowns,
                 breakdown: me.config.breakdown,
		 cuts: me.config.cuts,
		 callback: me.dataLoaded.bind(me),
		 testDataPath: me.config.testDataPath
		});
	};
	
	/*
	 * loads data from a local JSON file
	 */
	me.loadLocalData = function() {
		var me = this;
		vis4.log('loadLocalData()', me.config.localDataPath);
		
		$.ajax({
			url: me.config.localDataPath,
			context: me,
			dataType: 'json',
			success: function(data) {
				
				this.run(data);
			}
		});
	};

	/*
	 * is called by getTree() once the data is loaded
	 */
	me.dataLoaded = function(data) {
		var me = this,
		tree = OpenSpending.BubbleTree.buildTree(data, me.config.drilldowns,
                                                          me.config.breakdown, me.rootNode);
		me.run(tree);
	};

	/*
	 * defines the local bubble styles (which override and extend the
	 * global styles that are passed along with the data nodes)
	 */
	me.defaultBubbleStyles = {
		'root': { // Total
			color: '#999999'
		},
		'10': { // Helping Others
			color: '#f4714c'
		},
		'02': { // Defence
			color: '#999933'
		},
		'05': { // Environment
			color: '#006633'
		},
		'07': { // Health
			color: '#cc0066'
		},
		'03': { // Order & Safety
			color: '#0099cc'
		},
		'06': { // Our Streets
			color: '#cc6666'
		},
		'08': { // Culture
			color: '#cccc00'
		},
		'01': { // Running Government
			color: '#9900cc'
		},
		'09': { // Education
			color: '#3333cc'
		},
		'04': { // Country, Social Systems
			color: '#33cc33'
		}
	};



	/*
	 * run will be called by dataLoaded once, well, the data is loaded
	 */
	me.run = function(data) {
		var me = this;
		// initialize bubble chart
		var bubbleChart = new OpenSpending.BubbleTree(
			me.config
		);
		bubbleChart.setData(data);
		// we'll store the instance for debugging purposes
		window.bubblechart = bubbleChart;
	};

	// override bubble styles
	if (!me.config.hasOwnProperty('bubbleStyles')) {
		me.config.bubbleStyles = me.defaultBubbleStyles;
	}

	if (me.config.hasOwnProperty('localData')) {
		// use the given js object
		me.run(me.config.localData);
	} else if (me.config.hasOwnProperty('localDataPath')) {
		// load local tree json file
		me.loadLocalData();
	} else {
		// call api or use cached aggregate
		me.loadDataFromAPI();
	}
};

