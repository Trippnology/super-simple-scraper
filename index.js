#!/usr/bin/env node

const _ = require('underscore');
const cheerio = require('cheerio');
const colors = require('culoare');
const parseMagnet = require('parse-magnet-uri').parseMagnet;
const program = require('commander');
const queryString = require('query-string');
const request = require('request');

const pkg = require('./package.json');

/*request.defaults({
	proxy: 'http://cache.trippnology.net:3128',
	tunnel: true,
});*/
/* Help */
program
	.version(pkg.version)
	.option(
		'-u, --url [url]',
		'The URL to scrape',
		'https://weather.trippnology.com',
	)
	//.option('-u, --url [url]', 'The URL to scrape', 'https://www.google.co.uk/')
	.option('-s, --selector [selector]', 'jQuery selector to return', 'a')
	.option(
		'-f, --format [format]',
		'Output infohash, HTML, JSON, object or text',
		/^(hash|html|json|link|object|text)$/i,
		'link',
	);

// You might want to use named commands instead of just options
program
	.command('hello [name]')
	.description('Forget pizza, say hello!')
	.action((name) => console.log('Hello %s', name || 'World'));

// Deal with arguments
program.parse(process.argv);

/* Main body of the program */
function output(body) {
	const $ = cheerio.load(body);
	const $html = $('html');
	const $content = $html.find(program.selector);
	// Can't get is() to work :(
	const found = $html.is(program.selector);

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
			return console.error('Could not find %s', program.selector);
		}
		console.log(html);
	};

	/*
	 * This bit is just for testing if we can grab infohashes this way
	 * Run with: node ./ -u https://thepiratebay.org/search.php?q=top100:48h -s 'a[href^="magnet"]' -f hash
	 */
	$.prototype.logInfohash = function () {
		//var hash = queryString.parse(this[0].attribs.href).info_hash;
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
		if (program.format === 'hash') {
			$(this).logInfohash();
		}
		if (program.format === 'html') {
			$(this).logHtml();
		}
		if (program.format === 'json') {
			//$content.logJSON();
			$(this).logJSON();
		}
		if (program.format === 'link') {
			$(this).logLink(elem);
		}
		if (program.format === 'object') {
			$content.logObject();
		}
		if (program.format === 'text') {
			$content.logText(elem);
		}
	});

	if (hash_array.length) {
		console.log(JSON.stringify(hash_array));
	}
}

request(program.url, (error, response, body) => {
	if (!error) {
		if (response.statusCode === 200) {
			output(body);
		}
	} else {
		console.log('Error getting %s', program.url);
		console.error(error);
	}
});
