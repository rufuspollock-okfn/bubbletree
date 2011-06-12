var config = {
	// todo: we should really document all the settings
	apiUrl: 'http://openspending.org/api',
	// todo: ...
	localApiCache: 'data/example-aggregate.json',
	// todo: we should really document all the settings		
	dataset: 'dfid',
	// todo: we should really document all the settings
	drilldowns: ['cofog1'],
	// todo: we should really document all the settings
	cuts: ['year:2009'],
	// todo: we should really document all the settings
	rootNodeLabel: 'Grant total', 
	// jquery selector code to identify the container div 
	container: '#bubble-chart',
	// 
	initYear: 2009,
	// breakdown
	breakdown: 'cofog3',
	// this callback is invoked as soon as the year changes by url
	// defines what class is used to render the bubbles
	// possible values are pie,donut,plain,multi,icon
	bubbleType: 'icon',
	// fake breakdown values for each node
	fakeBreakdowns: ['Government', 'General Bugdet Support', 'Aid'],
};