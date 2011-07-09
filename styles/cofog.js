/*
 * BubbleTree Style for COFOG taxonomy
 *
 */
 
if (!BubbleTree) window.alert('You must include the BubbleTree before including the styles');

BubbleTree.Styles = BubbleTree.Styles || {};

BubbleTree.Styles.Cofog = {
	'01': { icon: 'styles/icons/government-uk.svg', color: '#C75746' },
	'01.1': { icon: 'styles/icons/legislative.svg' },
	'01.1.1': { icon: 'styles/icons/legislative.svg' },
	'01.1.2': { icon: 'styles/icons/pig.svg' },
	'01.1.3': { icon: 'styles/icons/worldmap.svg' },
	'01.2': { icon: 'styles/icons/aid.svg' },
	'01.2.1': { icon: 'styles/icons/aid-developing-countries.svg' },
	'01.2.2': { icon: 'styles/icons/economic-aid.svg' },
	'01.3': { icon: 'styles/icons/misc-services.svg' },
	'01.3.1': { icon: 'styles/icons/human-resources.svg' },
	'01.3.2': { icon: 'styles/icons/planning.svg' },
	'01.3.3': { icon: 'styles/icons/research.svg' },
	'01.7': { icon: 'styles/icons/public-debt.svg' },
	
	'02': { icon: 'styles/icons/defence.svg', color: '#0AB971' },
	'02.1': { icon: 'styles/icons/military.svg' },
	'02.2': { icon: 'styles/icons/civil-defence.svg' },
	'02.3': { icon: 'styles/icons/foreign-military-aid.svg' },
	'02.4': { icon: 'styles/icons/defence-research.svg' },
	'02.5': { icon: 'styles/icons/defence-admin.svg' },
	
	'03': { icon: 'styles/icons/order-safety.svg', color: '#EC2406' }, 
	'03.1': { icon: 'styles/icons/police.svg' },
	'03.2': { icon: 'styles/icons/fire-brigade.svg' },
	'03.3': { icon: 'styles/icons/courts.svg' },
	'03.4': { icon: 'styles/icons/prisons.svg' },
	'03.5': { icon: 'styles/icons/rd-order-safety.svg' },
	'03.6': { icon: 'styles/icons/admin-order-safety.svg' },
	
	'04': { icon: 'styles/icons/social-systems.svg', color: '#790586' }, 
	'04.1': { icon: 'styles/icons/social-systems.svg' },
	'04.1.1': { icon: 'styles/icons/social-systems.svg' },
	'04.1.2': { icon: 'styles/icons/labour.svg' },					
	'04.2': { icon: 'styles/icons/farms.svg' },
	'04.2.1': { icon: 'styles/icons/farms.svg' },
	'04.2.2': { icon: 'styles/icons/forest.svg' },
	'04.2.3': { icon: 'styles/icons/fishing.svg' },				
	'04.3': { icon: 'styles/icons/energy.svg' },
	'04.3.1': { icon: 'styles/icons/coal.svg' },
	'04.3.2': { icon: 'styles/icons/petrol.svg' },
	'04.3.3': { icon: 'styles/icons/nuclear.svg' },
	'04.3.4': { icon: 'styles/icons/fuel.svg' },
	'04.3.5': { icon: 'styles/icons/electricity.svg' },
	'04.3.6': { icon: 'styles/icons/wind.svg' },
	'04.4': { icon: 'styles/icons/manufactoring-construction.svg' },
	'04.5': { icon: 'styles/icons/transport.svg' },
	'04.5.1': { icon: 'styles/icons/car.svg' },
	'04.5.2': { icon: 'styles/icons/anchor.svg' },
	'04.5.3': { icon: 'styles/icons/railways.svg' },
	'04.5.4': { icon: 'styles/icons/airplane.svg' },
	'04.6': { icon: 'styles/icons/police.svg' },
	'04.7': { icon: 'styles/icons/police.svg' },
	'04.8': { icon: 'styles/icons/rd-eco.svg' },
	'04.9': { icon: 'styles/icons/police.svg' },
	
	'05': { icon: 'styles/icons/environment.svg', color: '#2A3A03' },	
	'05.1': { icon: 'styles/icons/waste.svg' },
	'05.2': { icon: 'styles/icons/toilet.svg' },
	'05.3': { icon: 'styles/icons/pollution.svg' },
	'05.4': { icon: 'styles/icons/tree.svg' },
	'05.6': { icon: 'styles/icons/environment-admin.svg' },
	
	'06': { icon: 'styles/icons/our-streets.svg', color: '#D33673' },		
	'06.1': { icon: 'styles/icons/housing.svg' },		
	'06.2': { icon: 'styles/icons/community.svg' },
	'06.3': { icon: 'styles/icons/water.svg' },
	'06.4': { icon: 'styles/icons/street-lights.svg' },
	
	'07': { icon: 'styles/icons/health.svg', color: '#4E6D00' },											'07.1': { icon: 'styles/icons/medical-supplies.svg' },				
	'07.1.1': { icon: 'styles/icons/medical-supplies.svg' },				
	'07.1.2': { icon: 'styles/icons/other-medical-products.svg' },				
	'07.1.3': { icon: 'styles/icons/wheelchair.svg' },		
	'07.2': { icon: 'styles/icons/health.svg' },
	'07.2.1': { icon: 'styles/icons/health.svg' },
	'07.2.2': { icon: 'styles/icons/microscope.svg' },
	'07.2.2': { icon: 'styles/icons/dental.svg' },
	'07.3': { icon: 'styles/icons/hospital.svg' },
	'07.3.1': { icon: 'styles/icons/hospital.svg' },
	'07.3.2': { icon: 'styles/icons/hospital-specialized.svg' },
	'07.3.2': { icon: 'styles/icons/dental.svg' },
	
	'08': { icon: 'styles/icons/culture.svg', color: '#938626' },					
	'08.2': { icon: 'styles/icons/culture.svg' },					
	'08.1': { icon: 'styles/icons/sports.svg' },	
	'08.3': { icon: 'styles/icons/media.svg' },	
	'09': { icon: 'styles/icons/education.svg' },				
	
	'10': { icon: 'styles/icons/helping-others.svg', color: '#935B3B' },
	'10.1': { icon: 'styles/icons/helping-others.svg' },
	'10.1.2': { icon: 'styles/icons/helping-others.svg' },
	'10.2': { icon: 'styles/icons/old-age.svg' },
	'10.4': { icon: 'styles/icons/family.svg' },
	'10.7': { icon: 'styles/icons/family2.svg' }

};