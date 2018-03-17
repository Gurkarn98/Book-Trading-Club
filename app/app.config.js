angular.
  module('app').
  config(['$urlRouterProvider', '$stateProvider', '$locationProvider',
  function routes($urlRouterProvider, $stateProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('/');
    $urlRouterProvider.rule(function($injector, $location) {
        var path = $location.path();
        var hasTrailingSlash = path[path.length-1] === '/';
        if(hasTrailingSlash) {
          var newPath = path.substr(0, path.length - 1); 
          return newPath; 
        } 
      });
    $stateProvider.
      state('home', {
        url: '/',
        template: '<home-page></home-page>',
        data :  {
          authenticate : false
        }
      }).
      state('login', {
        url: '/login',
        template: '<login></login>',
        data :  {
          authenticate : false
        }
      }).
      state('allbooks', {
        url: '/allbooks',
        template : '<allbooks></allbooks>',
        data :  {
          authenticate : true
        }
      }).
      state('mybooks', {
        url: '/', 
        template : '<mybooks></mybooks>',
        data :  {
          authenticate : true
        }
      }).
      state('mybooks.add', {
        url: 'mybooks/add',
        template : '<mybooks-add></mybooks-add>',
        data :  {
          authenticate : true
        }
      }).
      state('mybooks.page', {
        url: 'mybooks',
        template : '<mybooks-page></mybooks-page>',
        data :  {
          authenticate : true
        }
      }).
      state('mybooks.trades', {
        url: 'mybooks/trades',
        template : '<trades></trades>',
        data :  {
          authenticate : true
        }
      }).
      state('signup', {
        url: '/signup',
        template: '<signup></signup>',
        data :  {
          authenticate : false
        }
      }).
      state('settings', {
        url: '/settings',
        template: '<settings></settings>',
        data :  {
          authenticate : true
        }
      })
  }])