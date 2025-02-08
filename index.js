#!/usr/bin/env node

const axios = require('axios');
const cheerio = require('cheerio');
const colors = require('culoare');
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
	//.option('-u, --url [url]', 'The URL to scrape', 'https://www.google.co.uk/')
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
function output(body) {
	const $ = cheerio.load(body);
	const $html = $('html');
	const $content = $html.find(options.selector);
	// Can't get is() to work :(
	const found = $html.is(options.selector);

	$.prototype.logObject = function () {
		console.log(this);
	};

	$.prototype.logText = (elem) => {
		//var text = elem.children[0].data;
		const text = elem.children[0].next.data;
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

	/*
	 * This bit is just for testing if we can grab infohashes this way
	 * Run with: node ./ -u https://thepiratebay.org/search.php?q=top100:48h -s 'a[href^="magnet"]' -f hash
	 */
	$.prototype.logInfohash = function () {
		const magnetURL = this[0].attribs.href;
		const magnet = parseMagnet(magnetURL);
		console.log(magnet.infoHash);
	};

	// Not working due to circular references
	const hash_array = [];
	$.prototype.logJSON = function () {
		//console.log(this);
		//console.log(JSON.stringify(this[0]));
		const magnetURL = this[0].attribs.href;
		const magnet = parseMagnet(magnetURL);
		hash_array.push(magnet.infoHash);
	};

	$.prototype.logLink = (elem) => {
		console.log(elem.attribs.href);
	};

	$content.each(function (i, elem) {
		if (options.format === 'hash') {
			$(this).logInfohash();
		}
		if (options.format === 'html') {
			$(this).logHtml();
		}
		if (options.format === 'json') {
			//$content.logJSON();
			$(this).logJSON();
		}
		if (options.format === 'link') {
			$(this).logLink(elem);
		}
		if (options.format === 'object') {
			$content.logObject();
		}
		if (options.format === 'text') {
			$content.logText(elem);
		}
	});

	if (hash_array.length) {
		console.log(JSON.stringify(hash_array));
	}
}

axios
	.get(options.url)
	.then((response) => {
		output(response.data);
	})
	.catch((error) => {
		console.error('Error getting %s', options.url);
		console.error(error);
	});
