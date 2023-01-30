require('dotenv').config();
const fs = require('fs');
const helpers = require('./helpers');
const fileName = 'vod.m3u';

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
	const groupsToKeep = [
		'Series: Apple TV+',
		'Series: HBO',
		'Series: Netflix',
		'Movies: Action',
		'Movies: Adventure',
		'Movies: Comedy',
		'Movies: Crime',
		'Movies: Documentary',
		'Movies: Drama',
		'Movies: Fantasy',
		'Movies: Family',
		'Movies: Horror',
		'Movies: Kids',
		'Movies: Marvel and DC',
		'Movies: Music',
		'Movies: Science-Fiction',
		'Movies: Thriller',
		'Movies: War',
		'Movies: Western',
	];

	if (groupsToKeep.filter((group) => item.group.title.includes(group)).length > 0) {
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
