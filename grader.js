#!/usr/bin/env node

/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2

 - https://github.com/danwrong/restler
*/

var fs = require ('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile){
    var instr = infile.toString();
    if (!fs.existsSync(instr)){
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile){
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function (checksfile){
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function (htmlfile, checksfile){
   out=checkHtmlStream(fs.readFileSync(htmlfile), checksfile)
   return out;
/*    
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks (checksfile).sort();
    var out = {};
    for (var ii in checks){
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
*/
};

var checkHtmlStream = function (htmlread, checksfile){
    $ = cheerio.load(htmlread);
    var checks = loadChecks (checksfile).sort();
    var out = {};
    for (var ii in checks){
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};


var clone = function(fn){
    // Workaround for commander.js issue
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};


var buildfn = function(checks){
    var readresponse = function (result, response){
	if (result instanceof Error){
	    console.error ('Error: ' + util.format (response.message));
	}else{
	    //htmlread=result;
	    //console.error ("Leido: " + htmlread);
	    var checkJson = checkHtmlStream (result, checks);
	    var outJson = JSON.stringify (checkJson, null, 4);	
	    console.log (outJson);

	}
    }
    return readresponse;
};

var htmlread=".";

if (require.main == module){
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <URL>', 'URL pointing to an html file. This option takes precedence over --file')
	.parse(process.argv);
    if (program.url){
	var readresponse = buildfn(program.checks);
	rest.get(program.url).on('complete',readresponse);
	//console.log ("LEIDO : " + htmlread);
	//var checkJson = checkHtmlStream (htmlread, program.checks);
    }else{
	var checkJson = checkHtmlFile (program.file, program.checks);
	var outJson = JSON.stringify (checkJson, null, 4);	
	console.log (outJson);
    }


} else {
    exports.checkHtmlFile = checkHtmlFile;
}
