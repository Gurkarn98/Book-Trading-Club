/* globals angular io socket Highcharts*/
angular
  .module('tradeBook')
  .component('tradeBook', {
    templateUrl: "/tradeBook/tradeBook.template.html",
    controller: function tradeBookController(userService, bookStoreService, $scope) {
      var self = this;
      self.err=""
      self.username = userService.user.username
      self.close = function(){
        $scope.$parent.showInfo = !$scope.$parent.showInfo;
      }
      self.onKeyDown= function($event){
        if (window.event.code === "Escape" || $event.code === "Escape") {
          $scope.$parent.showInfo = !$scope.$parent.showInfo;
        }
      }
      $scope.$parent.trade= function(book){
        $scope.$parent.showInfo = !$scope.$parent.showInfo;
        self.book = book
        $scope.$parent.showInfo = true
      }
      $scope.$parent.showInfo = false
      self.trade=function(book, user){
        var tradeDetails = {
          title : book.title,
          authors : book.authors,
          link: book.link,
          tousername : user.username,
          myusername : self.username,
          mylocation : userService.user.settings.city + ", " + userService.user.settings.state+ ", " +userService.user.settings.country,
          status: "Pending"
        }
        bookStoreService.trade(tradeDetails).then(function(response){
          if (response.data !== "Request only once from same user!" && response.data !== 0) {
            userService.user.trades.fromMe = response.data
            self.err=""
          } else if (response.data === "Request only once from same user!") {
            self.err = response.data
          } else if (response.data === 0) {
            self.err = "This book is no more availabe to this user."
          }
        })
      }
    }
  })