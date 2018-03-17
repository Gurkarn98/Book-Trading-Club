/* globals angular io socket Highcharts*/
angular
  .module('mybooksAddSetting')
  .component('mybooksAddSetting', {
    templateUrl: "/mybooksAddSetting/mybooksAddSetting.template.html",
    controller: function mybooksAddSettingController(bookStoreService, userService, $scope) {
      var self = this;
      self.copies = 1
      self.onKeyDown= function($event){
        if (window.event.code === "Escape" || $event.code === "Escape") {
          $scope.$parent.showsettings=!$scope.$parent.showsettings
        }
      }
      $scope.$parent.$watch("addBook", function(newValue, oldValue) {
        if (newValue != oldValue) {
          self.book = newValue
        }
      });
      self.close = function(){
        $scope.$parent.showsettings=!$scope.$parent.showsettings
      }
      self.add=function(book, copies, method){
        if (method && copies){
          var addBook = {
            title : book.title,
            authors : undefined,
            subtitle : undefined,
            description : undefined,
            link : undefined,
            user : [{
              username : userService.user.username,
              location : userService.user.settings.city+ " " +userService.user.settings.state+ " " +userService.user.settings.country,
              settings : {
                method : self.tradeMethod,
                copies: self.copies
              }
            }]
          }
          function parseData(){
            if (book.hasOwnProperty('authors')) {
              addBook.authors = book.authors.join(", ")
            }
            if (book.hasOwnProperty('subtitle')) {
              addBook.subtitle = book.subtitle
            }
            if (book.hasOwnProperty('description')) {
              addBook.description = book.description.split("").splice(0,500).join("")+"..."
            }
            if (book.hasOwnProperty('imageLinks') && book.imageLinks.hasOwnProperty('thumbnail')) {
              addBook.link = book.imageLinks.thumbnail
            }
          } 
          parseData();
          bookStoreService.add(addBook).then(function(response){
            if (response.data !== "Already") {
              $scope.$parent.showsettings=!$scope.$parent.showsettings
              bookStoreService.books = response.data
            } else {
              self.err="You already added this book to your book list."
            }
          })
        } else {
          self.err="Both options are required."
        }
      }
    }
  })