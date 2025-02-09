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
	.option('-s, --selector <selector>', 'jQuery selector to find', 'a')
	.option(
		'-c, --content <type>',
		'Process this element in various ways',
		/^(hash|html|image|json|link|object|text)$/i,
		'link',
	)
	.option(
		'-o, --output <format>',
		'Output format',
		/^(html|json|object|text)$/i,
		'text',
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
		throw new Error(
			`Could not find any elements matching ${options.selector}`,
		);
	}

	let result;

	switch (options.content) {
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
		case 'image':
			result = $content.map((i, elem) => elem.attribs.src).get();
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
			throw new Error('Invalid format option');
	}

	return result;
}

/**
 * Outputs the parsed data based on the specified format.
 * @param {Array} result - The parsed data to output.
 */
async function output(result) {
	switch (options.output) {
		case 'json':
			console.log(JSON.stringify(result));
			break;
		case 'html':
		case 'text':
			console.log(result.join('\n'));
			break;
		case 'object':
			console.log(result);
			break;
		default:
			throw new Error('Invalid format option');
	}
}

/**
 * Scrapes the specified URL and outputs the data.
 */
async function scrape(url) {
	try {
		const response = await axios.get(url, { timeout: 10000 });
		if (response.status !== 200) {
			throw new Error(`Unexpected status code: ${response.status}`);
		}
		return response.data;
	} catch (error) {
		if (error.response) {
			throw new Error(
				`Server responded with status code ${error.response.status}`,
			);
		}
		if (error.request) {
			throw new Error(`Request failed: ${error.message}`);
		}
		throw new Error(`An unexpected error occurred: ${error.message}`);
	}
}

async function go() {
	return scrape(options.url)
		.then(parse)
		.then(output)
		.catch((error) => {
			console.log(error.message);
			process.exit(1);
		});
}

go();
