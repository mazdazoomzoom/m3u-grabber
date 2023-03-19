require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const helpers = require('./helpers');
const fileName = 'vod.m3u';

const getLineItems = async (file) => {
	const lines = file.split('\n');
	let items = [];

	if (lines.length <= 1) return Promise.reject('File is empty.');

	for (let i = 0; i < lines.length; i++) {
		if (i == 0) continue;

		let line = lines[i].toString();
		if (line.startsWith('#EXTINF')) {
			items.push(helpers.getAttribute('tvg-name', line));
		}
	}

	return items;
};

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
		await helpers.downloadFile(process.env.M3U_URL, `${fileName}`);
		const data = fs.readFileSync(`./Download/${fileName}`, 'utf8');
		const parsedFile = await filterItems(data);
		const oldFile = fs.readFileSync(`./${fileName}`, 'utf8');

		// Compare Items in ParseFile and OldFile
		const oldItems = await getLineItems(oldFile);
		const newItems = await getLineItems(parsedFile);

		const newItemsToM3u = newItems.filter((item) => {
			return !oldItems.includes(item);
		});

		// Send new items to Discord
		// https://discord.com/api/webhooks/1087061290138214400/ReF1R2HEoqpOlaAKeODpliFlpu7D3tfP3eGqYbpidr-lOWvNiNh_4fxkjS3x8H0qFtLa
		//

		if (newItemsToM3u.length > 0) {
			let params = {
				username: "New M3U VOD's",
				avatar_url: '',
				content: 'Hi, I found some new VODs for you. Check them out!',
			};
			params.content += `\n\n${newItemsToM3u.join('\n')}`;

			axios.post(process.env.DISCORD_WEBHOOK, params);
		}

		console.log('New Items: ', newItemsToM3u);
		fs.writeFileSync('./NewItemsInVODm3u.txt', newItemsToM3u.join('\n'));

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
