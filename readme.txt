Radial Bubble Tree Readme
-----


# Configuration vars
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

# Basic setup
* Create an empty HTML page with a blank DIV in it that should be used as a container for the BubbleTree
* Include the required JS libraries, which are
* * jQuery 1.5.2 (http://www.jquery.org)
* * jQuery History (http://tkyk.github.com/jquery-history-plugin/)
* * RaphaelJS 1.5.2 (http://raphaeljs.com/)
* * Tween.js (https://github.com/sole/tween.js)
* * vis4.js (https://bitbucket.org/gka/vis4.js)
* Include bubble