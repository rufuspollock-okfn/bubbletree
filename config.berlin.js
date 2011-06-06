var config = {
				apiUrl: 'http://berlin.offenerhaushalt.de/api',
				dataset: 'berlin',
				// todo: we should really document all the settings		
				drilldowns: ['hauptfunktion', 'oberfunktion'],
				// todo: we should really document all the settings
				cuts: ['year:2011'],
				// todo: we should really document all the settings
				rootNodeLabel: 'Berlin',

	container: '#bubble-chart',
	// 
	initYear: 2011,
	// breakdown
	//breakdown: 'cofog3',
	// this callback is invoked as soon as the year changes by url
	// defines what class is used to render the bubbles
	// possible values are pie,donut,plain,multi
	bubbleType: 'plain',
	// fake breakdown values for each node
	fakeBreakdowns: ['Government', 'General Bugdet Support', 'Aid'],

};