exports.helpers = function(context){
  return {
    // Helper functions
    zeroPad: function(num, places) {
      return function(){
        var zero = places - num.toString().length + 1;
        return Array(+(zero > 0 && zero)).join("0") + num;
      }.call(context, arguments);
    }, // end of zeroPad

    getRandomString: function(length){
      return function(){
        var randomString = Math.random().toString(36).slice(3, length+3);
        if(randomString === ""  ){
          return getRandomString(length);
        }else{
          return randomString;
        }
      }.call(context, arguments);
    }, // end of getRandomString

    // helper method for clicking on a DOM element when it is ready
    clickWhenReady: function(selector, index){
      return function(){
        var successFunction = function(){
          this.click(selector);
        };

        var errorFunction = function(){
          index = index || 0;
          console.log("Error at index: " + index);
          var screenshotSelector = this.exists("#content") ? "#content" : "body";
          this.captureSelector('timeout_' + person.dob + '_' + index + '.png', screenshotSelector);
          this.exit();
        };

        this.waitForSelector(selector, successFunction, errorFunction);
      }.call(context, arguments);
    }, // end of clickWhenReady

    getRandomUserAgent: function(){
      return function(){
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

        // set random UserAgent
        var randomNumber = Math.floor(Math.random() * userAgents.length);
        return userAgents[randomNumber];
      }.call(context, arguments);
    }
  };
};