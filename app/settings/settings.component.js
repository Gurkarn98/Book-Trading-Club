/* globals angular io socket Highcharts*/
angular
  .module('settings')
  .component('settings', {
    templateUrl: "/settings/settings.template.html",
    controller: function loginController($scope, userService) {
      var self = this;
      $scope.city = userService.user.settings.city
      $scope.state = userService.user.settings.state
      $scope.country = userService.user.settings.country
      self.save= function(city, state, country) {
        if(city && state && country){
          if ($scope.city !== userService.user.settings.city ||
              $scope.state !== userService.user.settings.state ||
              $scope.country !== userService.user.settings.country){
            var change ={
              password : false,
              username : userService.user.username,
              location : {
                city : $scope.city,
                state : $scope.state,
                country : $scope.country,
                full: $scope.city+", "+$scope.state+", "+$scope.country
              }
            }
            userService.update(change).then(function(response){
              userService.user.settings = response.data
            })           
          }
        }
      }
      self.change = function(current, New, confirm) {
        if (current && New && confirm){
          if ($scope.newPassword === $scope.confirmPassword){
            var change ={
              password : {
                new: $scope.newPassword,
                current : $scope.currentPassword
              },
              username : userService.user.username,
              location : false
            }
            userService.update(change).then(function(response){
              if (response.data === 'Your password has been updated.'){
                self.passErr = response.data
                self.color = "green"
              } else {
                self.passErr = response.data
                self.color = "red"
              }
            })
          } else {
            self.color = "red"
            self.passErr = "New passwords do not match!"
          }   
        }
      }
    }
  })
    