/* globals angular io socket Highcharts*/
angular
  .module('mybooks')
  .component('mybooks', {
    templateUrl: "/mybooks/mybooks.template.html",
    controller: function mybooksController($scope, $location) {
      var self = this;
      $scope.books=false
      var path = $location.path().split("/")[$location.path().split("/").length-1]
      if (path === "mybooks" || path === "add" || path === "trades"){
        $("."+path).addClass("clicked")
      }
      $(".click").on('click', function(){
        $(".click").removeClass('clicked')
        $("."+$(this).attr('class').split(" ")[0]).addClass("clicked")
      })
    }
  })