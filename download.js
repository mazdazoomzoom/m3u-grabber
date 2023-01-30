const fs = require('fs');
const { exec } = require('child_process');

const helpers = require('./helpers');

const parseM3U = async (m3uFile) => {
	let m3uEntries = m3uFile.map((item, index) => {
		if (item.startsWith('#EXTINF')) {
			return {
				tvg: {
					name: helpers.getAttribute('tvg-name', item),
				},
				url: m3uFile[index + 1].replace('\r', ''),
			};
		}
		return;
	});

	return m3uEntries.filter((item) => item !== undefined);
};

const main = async () => {
	try {
		const tvFile = fs.readFileSync('./vod.m3u', 'utf8').split('\n');
		let requestDownload = fs.readFileSync('./request.txt', 'utf8').split('\n');

		let m3uEntries = await parseM3U(tvFile);

		while (requestDownload.length > 0) {
			let toDownload = requestDownload.shift();
			let url = '';

			let found = m3uEntries.filter((item) => {
				return item.tvg.name.includes(toDownload);
			});
			if (found.length > 0) {
				for (const item of found) {
					url = item.url;
					const fileName = item.tvg.name.replace(/[^a-zA-Z0-9 ]/g, '') + '.mkv';
					await helpers.downloadFile(url, fileName);

					// Move file to new location - /media/MediaShare/_newly_downloaded
					let command = `mv "./Download/${fileName}" /media/MediaShare/_newly_downloaded/Download/`;
					exec(command, (error, stdout, stderr) => {
						if (error) {
							console.log(`error: ${error.message}`);
							return;
						}
						if (stderr) {
							console.log(`stderr: ${stderr}`);
							return;
						}

						console.log(`stdout: ${stdout}`);
					});
				}
			} else {
				console.log('Not found: ' + toDownload);
			}

			// Check for any new requests from request.txt
			let requestDownloadNew = fs.readFileSync('./request.txt', 'utf8').split('\n');
			if (requestDownloadNew.length > 0) {
				// remove current request
				requestDownloadNew = requestDownloadNew.filter((item) => {
					return item !== toDownload;
				});
				requestDownload = requestDownloadNew;
			}

			// Remove current request from request.txt
			fs.writeFileSync('./request.txt', requestDownload.join('\n'));
		}
	} catch (error) {
		console.log(error);
	}
};

main();
