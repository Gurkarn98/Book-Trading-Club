/* globals angular io socket Highcharts*/
angular
  .module('signup')
  .component('signup', {
    templateUrl: "/signup/signup.template.html",
    controller: function signupController($state, userService) {
      var self = this;
      self.err = ""
      self.signup = function (email, name ,password, city, state, country){
        if (email && password && self.password === self.confirmPassword && name && state && country && city){
          var credentials = {
            email : self.email,
            password: self.password,
            name: self.name,
            city: self.city,
            state: self.state,
            country: self.country
          }
          userService.signup(credentials).then(function (response) {
            if (response.data !== "That email is already taken.") {
              userService.user = response.data
              $state.go('home')
              self.err = ""
            } else {
              self.err = 'That email is already taken.'
            }
          })
        } else if (self.password !== self.confirmPassword) {
          self.err = "Passwords entered do not match!"        
        }
      }
    }
  })