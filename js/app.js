var projectIdentity = angular.module('projectIdentity', ['ngResource']);

projectIdentity.filter('translate', function() {
  var translations = {
    'male': 'Mand',
    'female': 'Kvinde'
  };

  return function(input) {
    if(input) return translations[input];
  };
});


projectIdentity.directive( 'hidden', function() {
  return {
    restrict: 'C',
    link: function( scope, element, attrs ) {
      element.removeClass( 'hidden' );
    }
  };
});

// projectIdentity.factory('FetchCpr', function ($http) {
//   return $http({method: 'GET', url: 'server/fetchCpr.php'});
// });

projectIdentity.controller('page', function ($scope, $q, $http, $timeout) {
  var errorCount = 0;

  $scope.facebook = {};
  $scope.$on("facebookResponse", function(e, response){

    // connected to facebook
    if(response.status == "connected"){

      // long poll backend
      (function poll() {
        $http({method: 'GET', url: 'server/fetchCpr.php'}).success(function(data, status, headers, config) {

          $scope.fetchedData = data;
          console.log(data.status);

          // keep polling
          if(data.status === "pending" || data.status === "initiated"){
            $timeout(poll, 2000);
          }

        // error (not logged in, or not verified)
        }).error(function(data, status, headers, config) {

          // allow a max of 2 errors
          errorCount++;
          if(errorCount < 3){
            $timeout(poll, 3000);
          }else{
            $scope.errorMsg = data.msg;
          }
        });
      })();

      // fetch user info
      FB.api('/me?fields=name,birthday,gender,verified,picture.height(200)', function(user){
        console.log(user);
        $scope.facebook.user = user;
        $scope.$apply();
      });
    }
  });
});