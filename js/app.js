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


projectIdentity.controller('page', function ($scope, $http, $timeout) {

  var errorCount = 0;

  $scope.pollBackend = function(){
    var middle_name = $scope.facebook.user.middle_name || "";
    $scope.fetchedData = $scope.fetchedData || {status: "pending"};

    $http({method: 'GET', url: 'server/fetchCpr.php?middle_name=' + middle_name}).success(function(data, status, headers, config) {
      $scope.fetchedData = data;

      // keep polling
      if(data.status === "pending" || data.status === "initiated" || data.status === "restarting"){
        $timeout($scope.pollBackend, 1000);
      }

    // error (not logged in, or not verified)
    }).error(function(data, status, headers, config) {

      // allow max 2 errors
      errorCount++;
      if(errorCount < 3){
        $timeout($scope.pollBackend, 3000);
      }else{
        $scope.errorMsg = data.msg;
      }
    });
  };  // end of poll backend

  $scope.facebook = {};
  $scope.$on("facebookResponse", function(e, response){

    // connected to facebook
    if(response.status == "connected"){

      // fetch user info
      FB.api('/me?fields=name,first_name,middle_name,last_name,birthday,gender,verified,picture.height(200)', function(user){
        console.log(user);
        $scope.facebook.user = user;
        $scope.$apply();
      });
    } // end of status == "connected"
  }); // end of facebookResponse listener
}); // end of "page"-controller