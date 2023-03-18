require('dotenv').config();
const fs = require('fs');

const helpers = require('./helpers');
const fileName = 'tv.m3u';

const filterItems = (file) => {
	const lines = file.split('\n');

	if (lines.length <= 1) return Promise.reject('File is empty.');

	for (let i = 0; i < lines.length; i++) {
		if (i == 0) continue;

		let line = lines[i].toString();
		if (line.startsWith('#EXTINF')) {
			let item = {
				tvg: {
					name: helpers.getAttribute('tvg-name', line),
				},
				group: {
					title: helpers.getAttribute('group-title', line),
				},
			};

			if (checkIfItemShouldBeRemoved(item)) {
				lines.splice(i, 2);
				i--;
			}
		}
	}

	return lines.join('\n');
};

const checkIfItemShouldBeRemoved = (item) => {
	const groupsToKeep = ['Live: USA'];

	const channelsToKeep = [
		'VIP UK: Channel 4 FHD',
		'VIP UK: Sky Sport F1 FHD',
		'VIP UK: Sky Sport Racing FHD',
		

		'VIP US: ABC St Louis',
		'VIP US: ABC FAMILY/SPARK',
		'US: ABC News HD',

		'VIP US: CBS Kansas City',
		'VIP US: CBS St Louis',
		'VIP US: CBS HD',
		'VIP US: CBS Sports Network HD',

		'VIP US: FOX Kansas City',
		'VIP US: FOX St Louis',
		'VIP US: Fox News Channel',
		'VIP US: FOX SPORTS ONE',
		'VIP US: FOX SPORTS TWO HD',

		'VIP US: MSNBC HD',

		'VIP US: NBC Kansas City',
		'VIP US: NBC St Louis',
		'VIP US: NBCSN HD',
	];
	const channelsToRemove = [
		'VIP US: 7 WWSB FL Sarasota HD',
		'VIP US: BEIN SPORTS US',
		'VIP US: BEIN SPORTS XTRA FHD',
		'VIP US: Bravo HD',
		'VIP US: FITE TV',
		'VIP US: Chiller TV',
		'VIP US: Marquee Sports Network',
		'VIP US: Cooking Channel',
		'VIP US: DAYSTAR TV',
		'VIP US: Disney HD',
		'VIP US: EMPIRE CINEMA',
		'VIP US: Hope Channel',
		'VIP US: ESPN Classic HD',
		'VIP US: PDC 2',
		'VIP US: IFC HD',
		'VIP US: Young Hollywood HD',
		'VIP US: KIDS READING TV',
		'VIP US: LMN HD',
		'VIP US: NASA TV HD',
		'VIP US: Olympic Channel FHD',
		'VIP US: NICKELODEON KIDS',
		'VIP US: NICKTOONS',
		'VIP US: NHL Tampa Bay Lightning HD',
		'VIP US: RT America HD',
		'VIP US: AT&T SportsNet Rocky Mountain Plus HD',
		'VIP US: Football Daily HD',
		'VIP US: Showtime Extreme HD',
		'VIP US: Starz Edge HD',
		'VIP US: Starz West',
		'VIP US: Sundance Tv',
		'VIP US: TBN',
		'VIP US: The Weather Channel',
		'VIP US: Universal Kids',
		'VIP US: Westerns 4 U',
		'VIP US: WRC Live (Events Only)',
		'VIP US: Eleven Sports HD',
		'VIP US: Zona Futbol HD',
		'VIP US: Teen Nick HD',
		'VIP US: TVG HD',
		'VIP US: YES HD',
		'VIP US: Fite TV 24/7',
		'US: FOX Sport 1',
		'US: Cozi TV',
		'US: LIFE TIME HD',
		'US: Fox 46 HD',
		'US: USA Network HD',

		'UFC Fight Pass',
		'[Live During Events Only]',
		'(Event Only)',
		'Sling PPV',
		'Live Event',
		'MLB Extra Innings',
		'LIVE NBA',
		'Fox Soccer Match Pass',
		'ESPN + EVENT',
		'Cinema PPV',
		'(Live During Events Only)',
		'NBC Gold PL',
		'NFL SUNDAY TICKET',
		'VIP US: NBA League Pass',
		'VIP US: ESPN COLLEGE EXTRA',
		'VIP US: NHL',
		'VIP US: News 12',
		'VIP US: ABC',
		'VIP US: CBS',
		'VIP US: NBC',
		'VIP US: Fox',
		'VIP US: FOX',
		'VIP US: Bally Sports',
		'VIP US: NESN',
		'VIP US: Pac12',
		'VIP US: SBG',
		'VIP US: Univision',
		'VIP US: Telemundo',
		'VIP US: AL JAZEERA HD',
		'VIP US: At&t SportsNet',
	];

	if (channelsToKeep.includes(item.tvg.name)) {
		return false;
	}
	if (groupsToKeep.filter((group) => item.group.title.includes(group)).length > 0) {
		if (item.group.title === 'Live: USA') {
			if (channelsToRemove.filter((channel) => item.tvg.name.includes(channel)).length > 0) {
				return true;
			}
		}
		return false;
	}
	return true;
};

const main = async () => {
	try {
		await helpers.downloadFile(process.env.M3U_URL, fileName);
		const data = fs.readFileSync(`./Download/${fileName}`, 'utf8');
		const parsedFile = await filterItems(data);
		fs.writeFileSync(`./${fileName}`, parsedFile);
		fs.unlink(`./Download/${fileName}`, (err) => {
			if (err) {
				console.log(err);
			}
		});
	} catch (error) {
		console.log(error);
	}
};

main();
