Radial Bubble Tree Documentation
-----


# Configuration vars
The constructor of the bubble chart takes just one argument, the configuration object which contains all settings that can be set. This section will cover all available configuration variables.

Example:

var config = { container: '#bubbletree' };
new OpenSpending.BubbleTree.Loader(config);

## Integration
* container - String, jQuery selector of the container element for the visualization, must be defined in HTML code, e.g. '#bubbletree-container'

## Data Source
The following config variables can be used to change the data source:
* apiUrl - String, url of a running OpenSpending API instance, e.g. "http://openspending.org/api"
* dataset - String, name of the used dataset, e.g. "israel"
* drilldowns - Array of drilldown taxonomies, e.g. ['primary', 'section', 'entity']
* cuts - Array of filters?, e.g. ['year:2010']
* breakdown - String, taxonomy for sub-breakdowns as displayed in the donut bubbles, e.g. 'cofog1'

## Display Properties
* bubbleType - String, defines what class is used to render the bubbles. Possible values are plain, icon, donut
* initYear - Number, the year that is used to create the dynamic urls

## Debbugging Properties
* testDataPath - String, local url (must be on same server) to a test data set in JSON format
* fakeBreakdowns

## Custom Styling
It is possible to change the default display properties of each bubble by setting up bubble styles. Bubble styles can be defined once for each taxonomy (e.g. COFOG) or for individual node ids. By now, you can use bubble styles to change the colors that come out of the API or to set up icon images for the bubbleType "icon". 
* bubbleStyle - Object, contains 

## Tooltips

* tooltipCallback - Function that handles all tooltip events, see section Tooltips below for examples

# Basic setup
* Create an empty HTML page with a blank DIV in it that should be used as a container for the BubbleTree
* Include the required JS libraries, which are
* * jQuery 1.5.2 (http://www.jquery.org)
* * jQuery History (http://tkyk.github.com/jquery-history-plugin/)
* * RaphaelJS 1.5.2 (http://raphaeljs.com/)
* * Tween.js (https://github.com/sole/tween.js)
* * vis4.js (https://bitbucket.org/gka/vis4.js)
* Include bubble

# Tooltips
In the current implementation, tooltips are not part of the BubbleTree. Instead, the visualization provides a simple API for adding custom tooltips.

## Event Handler
The tooltip event handler can be set with the *tooltipCallback* property in the configuration (see above).
The event handler must handle both the tooltip show and hide events. See index.html for an example implementation.

## Event Properties
The following event properties are available
* type - can be "SHOW" or "HIDE"
* mousePos - object with numerical properties x and y, stores the actual mouse position at the time the tooltip event was thrown, relative to the container div
* bubblePos - same as mousePos, but stores the position of the bubble instead of the mouse
* node - the node of the bubble that is related to the tooltip event
* origEvent - the original event object as thrown by jQuery
* target - the related Bubble object



