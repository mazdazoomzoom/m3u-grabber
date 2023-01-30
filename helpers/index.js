const path = require('path');
const axios = require('axios');
const fs = require('fs');
const ProgressBar = require('progress');

module.exports = {
	getAttribute: (name, line) => {
		let regex = new RegExp(name + '="(.*?)"', 'gi');
		let match = regex.exec(line);

		return match && match[1] ? match[1] : '';
	},

	downloadFile: async (url, fileName) => {
		const filePath = path.join(__dirname, '..', 'Download', fileName);
		const fileWriter = fs.createWriteStream(filePath);

		console.log(`Downloading file: ${fileName}`);

		const { data, headers } = await axios({
			url,
			method: 'GET',
			responseType: 'stream',
		});
		const totalLength = headers['content-length'];

		console.log(`Starting download of ${fileName} (${totalLength} bytes) ...`);
		const progressBar = new ProgressBar('->  downloading [:bar] :rate/mbps :percent :etas', {
			width: 40,
			complete: '=',
			incomplete: ' ',
			renderThrottle: 1,
			total: parseInt(totalLength),
		});

		data.on('data', (chunk) => progressBar.tick(chunk.length));
		data.pipe(fileWriter);

		return new Promise((resolve, reject) => {
			fileWriter.on('finish', () => {
				console.log('Downloaded file.');
				resolve();
			});
			fileWriter.on('error', (err) => {
				console.log(err);
				reject(err);
			});
		});
	},
};
