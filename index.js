#!/usr/bin/env node

/* Dependencies */
// https://github.com/strathausen/culoare
var colors = require('culoare');
var parseMagnet = require('parse-magnet-uri').parseMagnet;
// https://github.com/tj/commander.js
var program = require('commander');
var request = require('request');
request.defaults({
	proxy: 'http://cache.trippnology.net:3128',
	tunnel: true
});
var cheerio = require('cheerio');
var _ = require('underscore');
var queryString = require('query-string');

var pkg = require('./package.json');

/* Help */
program
	.version(pkg.version)
	.option(
		'-u, --url [url]',
		'The URL to scrape',
		'http://trippnology.com/shed/ip/'
	)
	//.option('-u, --url [url]', 'The URL to scrape', 'https://www.google.co.uk/')
	.option(
		'-s, --selector [selector]',
		'jQuery selector to return',
		'#nav-block'
	)
	.option(
		'-f, --format [format]',
		'Output infohash, HTML, JSON, object or text',
		/^(hash|html|json|link|object|text)$/i,
		'html'
	);

// You might want to use named commands instead of just options
program
	.command('hello [name]')
	.description('Forget pizza, say hello!')
	.action(function(name) {
		return console.log('Hello %s', name || 'World');
	});

// Deal with arguments
program.parse(process.argv);

/* Main body of the program */
function output(body) {
	var $ = cheerio.load(body);
	var $html = $('html');
	var $content = $html.find(program.selector);
	// Can't get is() to work :(
	var found = $html.is(program.selector);

	$.prototype.logObject = function() {
		console.log(this);
	};

	$.prototype.logText = function(elem) {
		//var text = elem.children[0].data;
		var text = elem.children[0].next.data;
		if (!text) {
			return;
		}
		console.log(text);
	};

	$.prototype.logHtml = function() {
		var html = this.html();
		if (html === null) {
			return console.error('Could not find %s', program.selector);
		}
		console.log(html);
	};

	/*
	 * This bit is just for testing if we can grab infohashes this way
	 * Run with: node ./ -u https://thepiratebay.org/top/48hall -s 'a[href^="magnet"]' -f hash
	 */
	$.prototype.logInfohash = function() {
		//var hash = queryString.parse(this[0].attribs.href).info_hash;
		var magnetURL = this[0].attribs.href;
		var magnet = parseMagnet(magnetURL);
		console.log(magnet.infoHash);
	};

	// Not working due to circular references
	var hash_array = [];
	$.prototype.logJSON = function() {
		//console.log(this);
		//console.log(JSON.stringify(this[0]));
		var magnetURL = this[0].attribs.href;
		var magnet = parseMagnet(magnetURL);
		hash_array.push(magnet.infoHash);
	};

	$.prototype.logLink = function(elem) {
		console.log(elem.attribs.href);
	};

	$content.each(function(i, elem) {
		if (program.format == 'hash') {
			$(this).logInfohash();
		}
		if (program.format == 'html') {
			$(this).logHtml();
		}
		if (program.format == 'json') {
			//$content.logJSON();
			$(this).logJSON();
		}
		if (program.format == 'link') {
			$(this).logLink(elem);
		}
		if (program.format == 'object') {
			$content.logObject();
		}
		if (program.format == 'text') {
			$content.logText(elem);
		}
	});

	if (hash_array.length) {
		console.log(JSON.stringify(hash_array));
	}
}

request(program.url, function(error, response, body) {
	if (!error) {
		//console.log('Status: %s', response.statusCode);
		if (response.statusCode == 200) {
			output(body);
		}
	} else {
		console.log('Error getting %s', program.url);
		console.error(error);
	}
});
