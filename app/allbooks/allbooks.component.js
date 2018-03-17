/* globals angular io socket Highcharts*/
angular
  .module('allbooks')
  .component('allbooks', {
    templateUrl: "/allbooks/allbooks.template.html",
    controller: function allbooksController(userService, $scope, bookStoreService) {
      var self = this;
      self.books;
      self.title=[]
      $scope.showInfo = false;
      bookStoreService.getAll().then(function(response){
        var username = userService.user.username
        self.books = response.data
        self.books.forEach(function(book){
          if (book.user.length === 1){
            if (book.user[0].username=== username){
              self.title.push(book.title + " " + book.authors)
            }
          }
        })
      })
    }
  })