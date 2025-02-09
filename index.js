#!/usr/bin/env node

const axios = require('axios');
const cheerio = require('cheerio');
const parseMagnet = require('parse-magnet-uri').parseMagnet;
const { program } = require('commander');

const pkg = require('./package.json');

// CLI options
program
	.version(pkg.version)
	.option(
		'-u, --url <url>',
		'The URL to scrape',
		'https://weather.trippnology.com',
	)
	.option('-s, --selector [selector]', 'jQuery selector to return', 'a')
	.option(
		'-f, --format <format>',
		'Output infohash, HTML, JSON, object or text',
		/^(hash|html|json|link|object|text)$/i,
		'link',
	);

program.parse();
const options = program.opts();

/**
 * Parses the HTML content based on the specified format.
 * @param {string} body - The HTML content to parse.
 * @returns {Array} - An array containing the parsed data.
 */
async function parse(body) {
	const $ = cheerio.load(body);
	const $content = $(options.selector);

	if (!$content.length) {
		console.error(
			'Could not find any elements matching %s',
			options.selector,
		);
		return [];
	}

	let result;

	switch (options.format) {
		case 'hash':
			result = $content
				.map((i, elem) => {
					const magnetURL = elem.attribs.href;
					const magnet = parseMagnet(magnetURL);
					return magnet.infoHash;
				})
				.get();
			break;
		case 'html':
			result = $content.map((i, elem) => $(elem).html()).get();
			break;
		case 'json':
			result = $content
				.map((i, elem) => {
					const magnetURL = elem.attribs.href;
					const magnet = parseMagnet(magnetURL);
					return magnet.infoHash;
				})
				.get();
			break;
		case 'link':
			result = $content.map((i, elem) => elem.attribs.href).get();
			break;
		case 'object':
			result = $content;
			break;
		case 'text':
			result = $content.map((i, elem) => $(elem).text()).get();
			break;
		default:
			console.error('Invalid format option');
			result = [];
	}

	return result;
}

/**
 * Outputs the parsed data based on the specified format.
 * @param {Array} result - The parsed data to output.
 */
async function output(result) {
	switch (options.format) {
		case 'hash':
		case 'json':
			console.log(JSON.stringify(result));
			break;
		case 'html':
		case 'link':
		case 'text':
			//result.forEach((item) => console.log(item));
			console.log(result.join('\n'));
			break;
		case 'object':
			console.log(result);
			break;
		default:
			console.error('Invalid format option');
	}
}

/**
 * Scrapes the specified URL and outputs the data.
 */
async function scrape() {
	try {
		const response = await axios.get(options.url, { timeout: 10000 });
		if (response.status !== 200) {
			throw new Error(`Unexpected status code: ${response.status}`);
		}
		const result = await parse(response.data);
		output(result);
	} catch (error) {
		console.error('Error scraping %s', options.url);
		if (error.response) {
			console.error(
				`Server responded with status code ${error.response.status}`,
			);
		} else if (error.request) {
			console.error(`Request failed: ${error.message}`);
		} else {
			console.error(`An unexpected error occurred: ${error.message}`);
		}
	}
}

scrape();
