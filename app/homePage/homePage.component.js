/* globals angular io socket Highcharts*/
angular
  .module('homePage')
  .component('homePage', {
    templateUrl: "/homePage/homePage.template.html",
    controller: function homePageController($scope, userService) {
      var self = this;
      var user;
      $scope.$watch(function(){
        return userService.user;
      }, function(newValue, oldValue){
        if (newValue){
          user = " "+userService.user.settings.name+" "
          self.username = user
        } else {
          user = " "
          self.username = user
        }
      });
    }
  })