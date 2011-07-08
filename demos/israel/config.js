var config = {
	// todo: we should really document all the settings
	apiUrl: 'http://staging.openspending.org/api',
	dataset: 'israel',
	// todo: we should really document all the settings
	drilldowns: ['primary', 'section', 'entity'/*, 'programme'*/],
	// todo: we should really document all the settings
	cuts: ['year:2010'],
	// todo: we should really document all the settings
	rootNodeLabel: 'Budget total', 

	localApiCache: 'aggregate.json',
	
	container: '#bubble-chart',
	// 
	//initYear: 2009,
	// breakdown
	//breakdown: 'cofog3',
	// this callback is invoked as soon as the year changes by url
	// defines what class is used to render the bubbles
	// possible values are pie,donut,plain,multi
	bubbleType: ['plain'],
	// fake breakdown values for each node
	fakeBreakdowns: ['Government', 'General Bugdet Support', 'Aid'],

};