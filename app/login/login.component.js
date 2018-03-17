/* globals angular io socket Highcharts*/
angular
  .module('login')
  .component('login', {
    templateUrl: "/login/login.template.html",
    controller: function loginController($scope, $state, userService) {
      var self = this;
      self.err = ""
      self.login = function (email, password){
        if (email === true && password === true){
          var credentials = {
            email : $scope.email,
            password: $scope.password
          }
          userService.login(credentials).then(function (response) {
            if (response.data !== "No User found!") {
              userService.user = response.data
              $state.go('home')
              self.err = ""
            } else {
              self.err = 'No user found!'
            }
          })
        }
      }
    }
  })
    