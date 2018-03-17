angular.
  module("app").
  run(function ($rootScope, $transitions, $state, userService, bookStoreService) {
    $transitions.onStart( {}, function($transition$) {
      if (userService.user === undefined) {
        userService.isAuthenticated().then(function (response){
          if (response.data !== false) {
            $rootScope.show = true
          } else {
            $rootScope.show = false
          }
          if (response.data === false && $transition$.$to().data.authenticate === true) {
            userService.user = false
            $state.transitionTo("login");
          } else if (response.data !== false && ($transition$.$to().name === 'signup' || $transition$.$to().name === 'login')) {
            userService.user = response.data
            $state.transitionTo("home");
          } else if (response.data === false && $transition$.$to().data.authenticate === false) {
          } else {
            userService.user = response.data
            var user = {user: [{username : userService.user.username}]}
            bookStoreService.getByUser(user).then(function(response){
              bookStoreService.books = response.data
            })
          
          }
        })
      } else if (userService.user === false && $transition$.$to().data.authenticate === true) {
        $state.transitionTo("login");
        $rootScope.show = false
      } else if (userService.user !== undefined && userService.user !== false && ($transition$.$to().name === 'signup' || $transition$.$to().name === 'login')) {
        $state.transitionTo("home");
      } else if (userService.user !== undefined && userService.user !== false) {
        $rootScope.show=true
      }
    });
  });