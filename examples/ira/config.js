var italyNorth = '#00A057',
	italySouth = '#D94246',
	italyCenter = '#aaa';

var config = {
	// todo: we should really document all the settings
	apiUrl: 'http://openspending.org/api',
	// todo: ...
	localApiCache: 'data/aggregate-italy.json',
	// todo: we should really document all the settings		
	dataset: 'italyregionalaccounts',
	// todo: we should really document all the settings
	drilldowns: ['function', 'to'],
	// todo: we should really document all the settings
	//cuts: ['year:2005'],
	// todo: we should really document all the settings
	rootNodeLabel: 'Italian Regional Accounts Total', 
	// jquery selector code to identify the container div 
	container: '#bubble-chart',
	// 
	initYear: 2009,
	// breakdown
	breakdown: 'from',
	// this callback is invoked as soon as the year changes by url
	// defines what class is used to render the bubbles
	// possible values are pie,donut,plain,multi,icon
	bubbleType: ['donut', 'icon', 'donut'],
	// fake breakdown values for each node
	//fakeBreakdowns: ['Government', 'General Bugdet Support', 'Aid'],
	bubbleStyles: {
		'name': {
			'italy-liguria': { color: italyNorth },
			'italy-piemonte': { color: italyNorth },
			'italy-lombardia': { color: italyNorth },
			'italy-puglia': { color: italyNorth },
			'italy-friuli-venezia': { color: italyNorth },
			'italy-emilia-romagna': { color: italyNorth },
			'italy-veneto': { color: italyNorth },

			'italy-marche': { color: italyCenter },
			'italy-lazio': { color: italyCenter },
			'italy-toscana': { color: italyCenter },
			'italy-umbria': { color: italyCenter },

			'italy-sicilia': { color: italySouth },
			'italy-molise': { color: italySouth },
			'italy-sardegna': { color: italySouth },
			'italy-campania': { color: italySouth },
			'italy-basilicata': { color: italySouth },
			'italy-abruzzo': { color: italySouth },
			'italy-calabria': { color: italySouth },
			'italy-provincia-auton': { color: italyNorth },
				
			// donut slice opacities
			'ac': { opacity: .4 },
			'al': { opacity: .9 }
		}
	}
};