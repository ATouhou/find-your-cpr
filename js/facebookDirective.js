projectIdentity.directive('facebook', function($http) {
  return {
    restrict: 'E',
    // scope: true,

    // Controller
    controller: function($scope, $attrs) {
      // Load the SDK Asynchronously
      (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/all.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));

      $scope.login = function() {
        FB.login(function(response) {
          $scope.$emit("facebookResponse", response);
          $scope.facebook.status = response.status;
          $scope.$apply();
        }, { scope: 'user_birthday' });
      };
    }, // controller end


    // Link function
    link: function(scope, element, attrs, controller) {
      scope.facebook = {};

      // fbAsyncInit is run as soon as the SDK is loaded
      window.fbAsyncInit = function() {
        scope.facebook.sdkLoaded = true;
        scope.$emit("sdkloaded");

        FB.init({
          appId      : attrs.appId, // App ID
          channelUrl : 'channel.php', // Channel File
          status     : false, // check login status
          cookie     : true // enable cookies to allow the server to access the session
        });

        // Additional init code here
        FB.getLoginStatus(function(response) {
          scope.$emit("facebookResponse", response);
          scope.facebook.status = response.status;
          scope.$apply();
        });
      }; // end of fbAsyncInit
    } // end of link function


  };
});