angular.
  module('app')
  .factory('bookStoreService', function ($http){
    var bookStoreService = {
      books: undefined,
      getAll : function(){
        return $http.get('/getall')
      },
      getByUser : function(username){
        return $http.post('/getByUser', username)
      },
      add :  function(book){
        return $http.post('/add', book)
      },
      search :  function(book){
        return $http.post('/search', book)
      },
      delete : function(book){
        return $http.post('/delete', book)
      },
      trade: function(details){
        return $http.post('/trade', details)
      },
      decision: function(request){
        return $http.post('/decision', request)
      },
      cancel: function(request){
        return $http.post('/cancel', request)
      },
      modify: function(settings){
        return $http.post('/modify', settings)
      },
      clear: function(request){
        return $http.post('/clear', request)
      }
    }
    return bookStoreService;
  })
