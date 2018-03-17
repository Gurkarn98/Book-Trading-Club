angular.
  module('app')
  .factory('userService', function ($http){
    var userService = {
      user : undefined,
      login : function(credentials){
        return $http.post("/login", credentials)
      },
      isAuthenticated : function(){
        return $http.post('/authorized')
      },
      signup : function(credentials){
        return $http.post('/signup', credentials)
      },
      logout : function (){
        return $http.post("/logout")
      },
      update : function (details){
        return $http.post("/update", details)
      }
    }
    return userService;
  })
