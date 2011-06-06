OpenSpending BubbleChart Readme
-------------------------------

**Call process**

 - The html container includes bubblechart.min.js and all needed libraries
 - Container creates a new instance of BubbleChart.Loader class and passes the configuration to it
 - The Loader calls the data API depending on the values defined in the config and then creates a new instance of the BubbleChart class
