#!/usr/bin/env node

const axios = require('axios');
const cheerio = require('cheerio');
const parseMagnet = require('parse-magnet-uri').parseMagnet;
const { program } = require('commander');

const pkg = require('./package.json');

/* Help */
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

// Deal with arguments
program.parse();
const options = program.opts();

/* Main body of the program */
async function output(body) {
	const $ = cheerio.load(body);
	const $html = $('html');
	const $content = $html.find(options.selector);

	$.prototype.logObject = function () {
		console.log(this);
	};

	$.prototype.logText = (elem) => {
		const text = elem.children[0].data;
		if (!text) {
			return;
		}
		console.log(text);
	};

	$.prototype.logHtml = function () {
		const html = this.html();
		if (html === null) {
			return console.error('Could not find %s', options.selector);
		}
		console.log(html);
	};

	$.prototype.logInfohash = function () {
		const magnetURL = this[0].attribs.href;
		const magnet = parseMagnet(magnetURL);
		console.log(magnet.infoHash);
	};

	const hash_array = [];
	$.prototype.logJSON = function () {
		const magnetURL = this[0].attribs.href;
		const magnet = parseMagnet(magnetURL);
		hash_array.push(magnet.infoHash);
	};

	$.prototype.logLink = (elem) => {
		console.log(elem.attribs.href);
	};

	$content.each(function (i, elem) {
		switch (options.format) {
			case 'hash':
				$(this).logInfohash();
				break;
			case 'html':
				$(this).logHtml();
				break;
			case 'json':
				$(this).logJSON();
				break;
			case 'link':
				$(this).logLink(elem);
				break;
			case 'object':
				$content.logObject();
				break;
			case 'text':
				$content.logText(elem);
				break;
			default:
				console.error('Invalid format option');
		}
	});

	if (hash_array.length) {
		console.log(JSON.stringify(hash_array));
	}
}

async function scrape() {
	try {
		const response = await axios.get(options.url, { timeout: 10000 });
		if (response.status !== 200) {
			throw new Error(`Unexpected status code: ${response.status}`);
		}
		output(response.data);
	} catch (error) {
		console.error('Error getting %s', options.url);
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
