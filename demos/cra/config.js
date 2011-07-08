var config = {
	// todo: we should really document all the settings
	apiUrl: 'http://openspending.org/api',
	// todo: ...
	//localApiCache: 'data/aggregate-cra.json',
	// todo: we should really document all the settings		
	dataset: 'cra',
	// todo: we should really document all the settings
	drilldowns: ['cofog1', 'cofog2', 'region'],
	// todo: we should really document all the settings
	cuts: ['year:2009'],
	// todo: we should really document all the settings
	rootNodeLabel: 'Grant total', 
	// jquery selector code to identify the container div 
	container: '#bubble-chart',
	// 
	initYear: 2009,
	// breakdown
	breakdown: 'cg_lg_or_pc',
	// this callback is invoked as soon as the year changes by url
	// defines what class is used to render the bubbles
	// possible values are pie,donut,plain,multi,icon
	bubbleType: ['icon','icon','icon','donut'],
	// fake breakdown values for each node
	fakeBreakdowns: ['Government', 'General Bugdet Support', 'Aid'],
};