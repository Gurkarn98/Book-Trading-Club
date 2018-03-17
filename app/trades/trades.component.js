/* globals angular io socket Highcharts*/
angular
  .module('trades')
  .component('trades', {
    templateUrl: "/trades/trades.template.html",
    controller: function tradesController(userService, bookStoreService) {
      userService.isAuthenticated().then(function (response){
        if (response.data){
          userService.user = response.data
          setVariables()
        }
      })
      var self = this;
      self.rme = true;
      self.rmea = false;
      self.rmer = false;
      self.err=''
      self.showme = function (category){
        if (category === "Accepted"){
          self.rme = false;
          self.rmea = true;
          self.rmer = false;
        }
        if (category === "Rejected"){
          self.rme = false;
          self.rmea = false;
          self.rmer = true;
        }
        if (category === "Pending"){
          self.rme = true;
          self.rmea = false;
          self.rmer = false;
        }
      }
      self.rto = true;
      self.rtoa = false;
      self.rtor = false;
      self.showto = function (category){
        if (category === "Accepted"){
          self.rto = false;
          self.rtoa = true;
          self.rtor = false;
        }
        if (category === "Rejected"){
          self.rto = false;
          self.rtoa = false;
          self.rtor = true;
        }
        if (category === "Pending"){
          self.rto = true;
          self.rtoa = false;
          self.rtor = false;
        }
      }
      function setVariables(){
        self.requestMe = userService.user.trades.forMe.filter(trade =>{
          return trade.status === "Pending"
        })
        self.requestMeA = userService.user.trades.forMe.filter(trade =>{
          return trade.status === "Accepted"
        })
        self.requestMeR = userService.user.trades.forMe.filter(trade =>{
          return trade.status === "Rejected"
        })
        self.requestToR = userService.user.trades.fromMe.filter(trade =>{
          return trade.status === "Rejected"
        })
        self.requestToA = userService.user.trades.fromMe.filter(trade =>{
          return trade.status === "Accepted"
        })
        self.requestTo = userService.user.trades.fromMe.filter(trade =>{
          return trade.status === "Pending"
        })
        self.requestMeNum = self.requestMe.length
        self.requestMeANum = self.requestMeA.length
        self.requestMeRNum = self.requestMeR.length
        self.requestToNum = self.requestTo.length
        self.requestToANum = self.requestToA.length
        self.requestToRNum = self.requestToR.length
      }
      self.cancel = function(request){
        var cancelRequest ={
          request : request,
          user: userService.user.username
        }
        bookStoreService.cancel(cancelRequest).then(function(response){
          userService.user.trades.fromMe = response.data[0]
          setVariables()
          self.err=response.data[1]
        })
      }
      self.decision = function(request, decision){
        request.user = userService.user.username
        request.decision = decision
        bookStoreService.decision(request).then(function(response){
          userService.user.trades.forMe = response.data[0]
          setVariables()
          self.err = response.data[1]
          if (response.data[2]){
            bookStoreService.books = response.data[2]
          }
        })
      }
      self.delete=function(request, type){
        request.myusername = userService.user.username
        request.type=type
        bookStoreService.clear(request).then(response=>{
          userService.user.trades = response.data
          setVariables()
        })
      }
    }
  })