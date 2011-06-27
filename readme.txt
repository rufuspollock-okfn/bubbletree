Documentation for BubbleTree
============================

The BubbleTree can be used to display hierarchical (spending) data in an interactive visualization. The setup is easy and independent from the OpenSpending platform. However, there is an optional integration module to connect with data from the OpenSpending API.

## Configuration vars
The constructor of the bubble chart takes just one argument, the configuration object which contains all settings that can be set. This section will cover all available configuration variables.

Example:

	new OpenSpending.BubbleTree.Loader({
		data: treeObj,
		container: '#bubbletree'
	});

### Data format

The BubbleTree expects the data in a linked tree structure. The core element in the tree are nodes which must at least consist of the properties *label* and *amount*:

	rootNode = {
		label: "Total budget",
		amount: 1000000
	}
	
The child nodes then are (recursivly) inserted within the *children* array.

	rootNode = {
		label: "Total budget",
		amount: 1000000,
		children: [{
			label: "Health",
			amount: 650000
		}, {
			label: "Government",
			amount: 350000
		}]
	}
	
You can also give the nodes unique identifier by setting the *id* property.

	node = {
		id: "gov"
		label: "Government",
		amount: 350000
	}
	
Another way to identify the nodes is to assign them to a taxonomy by setting the *taxonomy* and *name* properties.

	node = {
		taxonomy: "cofog",
		name: "05.3",
		label: "Government",
		amount: 350000
	}
	
### HTML Integration

You need to tell the BubbleTree at which point in the container HTML the visualization should be inserted. To do this, simply set the *container* property in configuration. The container can be either a HTML DOM node or a jQuery selector String 

* *container* - String, jQuery selector of the container element for the visualization, must be defined in HTML code, e.g. '#bubbletree'

**Note:** The container element must be defined in the HTML page, the BubbleTree won't create it itself. 


### Display Properties

* *bubbleType* - defines what class is used to render the bubbles. Possible values are plain, icon, donut. Can be either a String if the same type should be used for all bubbles or an array of strings if different bubble types should be used for different tree levels.

	config.bubbleType = 'plain'
		
	config.bubbleType = ['donut', 'icon', 'donut']; 

### Custom Styling

It is possible to change the default display properties of each bubble by setting up bubble styles. Bubble styles can be defined once for each taxonomy (e.g. COFOG) or for individual node ids. By now, you can use bubble styles to change the colors that come out of the API or to set up icon images for the bubbleType "icon". 
* *bubbleStyles* - Object that holds bubble style declarations, grouped into taxonomies. 

Example:

	config.bubbleStyles = {
		'cofog': OpenSpending.BubbleTree.Styles.Cofog,
		'itb-function': OpenSpending.BubbleTree.Styles.ItbFunction,
	};

There are two reserved words, that can't be used as taxonomy ids: *id* and *name*. Both are used to directly apply styles to bubbles which don't belong to any taxonomy. In the following example, a color is defined for the node with the id "root". Also, all nodes with the name "italy-toscana" will get the color #dd333.

	config.bubbleStyles = {
		'id: {
			'root: { color: '#cccccc' }
		},
		'name': {
			'italy-toscana': { color: '#dd3333' }
		}
	}



## Appendix

### Integration with OpenSpending API

If you want to connect the BubbleTree with OpenSpending data you might want to use the Aggregator class.

	new OpenSpending.Aggregator({
		apiUrl: "http://openspending.org/api",
		dataset: "cra",
		drilldowns: ["cofog1", "cofog2"],
		cuts: ['year:2008'],
		breakdown: 'region',
		callback: function(data) {
			new OpenSpending.BubbleTree.Loader({
				data: data,
				container: '#bubbletree'
			});
		}
	});

The following config variables can be used to change the data source:

* apiUrl - String, url of a running OpenSpending API instance, e.g. "http://openspending.org/api"
* dataset - String, name of the used dataset, e.g. "israel"
* drilldowns - Array of drilldown taxonomies, e.g. ['primary', 'section', 'entity']
* cuts - Array of filters?, e.g. ['year:2010']
* breakdown - String, taxonomy for sub-breakdowns as displayed in the donut bubbles, e.g. 'cofog1'

For local testing purposes you can also use locally cached api call results by setting the *localApiCache* property.

* localApiCache - String, url to a locally stored API output JSON


### Tooltip integration

In the current implementation, tooltips are not part of the BubbleTree. Instead, the visualization provides a simple API for adding custom tooltips.

 * *initTooltip* - function that will initialize the tooltip for a given bubble.
 
	function initTooltip(node, bubble) {
		
	}

#### Event Handler
The tooltip event handler can be set with the *tooltipCallback* property in the configuration (see above).
The event handler must handle both the tooltip show and hide events. See index.html for an example implementation.

#### Event Properties
The following event properties are available

* type - can be "SHOW" or "HIDE"
* mousePos - object with numerical properties x and y, stores the actual mouse position at the time the tooltip event was thrown, relative to the container div
* bubblePos - same as mousePos, but stores the position of the bubble instead of the mouse
* node - the node of the bubble that is related to the tooltip event
* origEvent - the original event object as thrown by jQuery
* target - the related Bubble object



## Basic setup

* Create an empty HTML page with a blank DIV in it that should be used as a container for the BubbleTree
* Include the required JS libraries, which are
	* jQuery 1.5.2 (<http://www.jquery.org>)
	* jQuery History (<http://tkyk.github.com/jquery-history-plugin/>)
	* RaphaelJS 1.5.2 (<http://raphaeljs.com/>)
	* Tween.js (<https://github.com/sole/tween.js>)
	* vis4.js (<https://bitbucket.org/gka/vis4.js>)
* Include bubble


## Custom Taxonomy Styling (e.g. Icons)

### Icon Specifications
The icons are stored in /icons/ folder in standard SVG format. However, there are some specifications to ensure that the visualization can use the icons correctly.

* the svg canvas should be 100px * 100px
* the icon itself must be stored in one or many SVG path elements. Every other SVG elements like <circle> will be ignored by the viz.
* the icon SVG must not be too large to keep the viz performance. SVG filesize of under 10kb are perfect, everything above 100kb should be avoided.
* the icon paths should not exceed the bubble size

### Taxonomy to Icon Mapping
The icon filenames are arbitrary. The mapping between taxonomies and icons is done at JavaScript side by defining the *bubbleStyle* property in the configuration (see above), which is a three level nested dictionary

* *taxonomy_id* => *nodeStyles*
	* *node_name* => *styles*
		* *styles* is a dictionary of visual properties to their actual values, e.g. 'color' = '#dd0000'

Please see index.html and style.cofog.js for a working example.
