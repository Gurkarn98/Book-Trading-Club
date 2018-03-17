/* globals angular io socket*/
angular
  .module('mybooksAdd')
  .component('mybooksAdd', {
    templateUrl: "/mybooksAdd/mybooksAdd.template.html",
    controller: function mybooksAddController($scope, bookStoreService) {
      var self = this;
      self.data
      $scope.addBook = []
      $scope.showsettings=false
      $scope.add = function (book){
        $scope.addBook = book
        $scope.showsettings=!$scope.showsettings
      } 
      self.search = function (valid){
        var details = {
          title : self.title
        }
        if (valid) {
          bookStoreService.search(details).then(function(response){
            response.data.forEach( (book, i) => {
              if (response.data[i].volumeInfo.hasOwnProperty('imageLinks')){
                response.data[i].volumeInfo.imageLinks.thumbnail = book.volumeInfo.imageLinks.thumbnail.replace('http://', 'https://')
              }
            })
            self.data = response.data
          })
        }
      }
    }
  })