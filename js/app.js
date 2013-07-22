var projectIdentity = angular.module('projectIdentity', ['ngResource']);

projectIdentity.filter('translate', function() {
  var translations = {
    'male': 'Mand',
    'female': 'Kvinde'
  };

  return function(input) {
    if(input){
      return translations[input];
    }
  };
});



// projectIdentity.factory('FetchCpr', function ($http) {
//   return $http({method: 'GET', url: 'server/fetchCpr.php'});
// });

projectIdentity.controller('page', function ($scope, $q, $http, $timeout) {
  $scope.facebook = {};
  $scope.$on("facebookResponse", function(e, response){

    // connected to facebook
    if(response.status == "connected"){

      // long poll backend
      (function poll() {
        $http({method: 'GET', url: 'server/fetchCpr.php'}).success(function(data, status, headers, config) {

          $scope.fetchedData = data;
          console.log(data.status);

          if(data.status === "pending" || data.status === "initiated"){
            $timeout(poll, 2000);
          }
        });
      })();



      // fetch user info
      FB.api('/me', function(user){
        console.log(user);
        $scope.facebook.user = user;
        $scope.$apply();
      });
    }
  });
});