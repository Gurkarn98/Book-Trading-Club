/* globals angular io socket*/
angular
  .module('mybooksPage')
  .component('mybooksPage', {
    templateUrl: "/mybooksPage/mybooksPage.template.html",
    controller: function mybooksController($scope, userService, bookStoreService) {
      var self = this;
      $(".click").removeClass('clicked')
      $(".mybooks").addClass("clicked")
      var settings = false;
      var previous = undefined;
      $scope.$watch(function(){
        return bookStoreService.books;
      }, function(newVal, oldVal){
        if (newVal){
          self.books = bookStoreService.books
          self.books.forEach((book,i) => {
            self.books[i].user = book.user.filter(user=>{
              return user.username === userService.user.username
            })
          })
        }
      })
      self.delete = function (book, authors) {
        var details = {
          title : book,
          authors: authors,
          user : [userService.user]
        }
        bookStoreService.delete(details).then(function(response){
          bookStoreService.books = response.data
        })
      }
      self.switch= function(book){
        var id = book.title+book.authors
        self.copies = book.user[0].settings.copies
        self.tradeMethod = book.user[0].settings.method
        if (!settings && id !== previous && previous === undefined) {
          document.getElementById(id+'set').style.display = "block";
          document.getElementById(id+'img').style.display = "none";
          document.getElementById(id+'grp').style.transform = "scale(1.5)";
          document.getElementById(id+'grp').style.transform = "all 300ms";
          document.getElementById(id+'grp').style.margin = "4%";
          previous = id
          settings = true
        } else if (!settings && id !== previous && previous !== undefined) {    
          document.getElementById(id+'set').style.display = "block";
          document.getElementById(id+'img').style.display = "none";
          document.getElementById(id+'grp').style.transform = "scale(1.5)";
          document.getElementById(id+'grp').style.transform = "all 300ms";
          document.getElementById(id+'grp').style.margin = "4%";
          document.getElementById(previous+'set').style.display = "none";
          document.getElementById(previous+'img').style.display = "block";
          document.getElementById(previous+'grp').style.transform = "scale(1)";
          document.getElementById(previous+'grp').style.margin = "0.4%";
          previous = id
          settings=true
        } else if(settings && id !== previous && previous !== undefined) {
          document.getElementById(id+'set').style.display = "block";
          document.getElementById(id+'img').style.display="none";
          document.getElementById(id+'grp').style.transform = "scale(1.5)";
          document.getElementById(id+'grp').style.transform = "all 300ms";
          document.getElementById(id+'grp').style.margin = "4%"
          document.getElementById(previous+'set').style.display = "none";
          document.getElementById(previous+'img').style.display = "block";
          document.getElementById(previous+'grp').style.transform = "scale(1)";
          document.getElementById(previous+'grp').style.margin = "0.4%"          
          previous = id
          settings = true
        } else if (!settings && id === previous) {       
          document.getElementById(id+'set').style.display = "block";
          document.getElementById(id+'img').style.display = "none";
          document.getElementById(id+'grp').style.transform = "scale(1.5)";
          document.getElementById(id+'grp').style.transform = "all 300ms";
          document.getElementById(id+'grp').style.margin = "4%";
          settings= true
        } else if (settings && id === previous) {
          document.getElementById(id+'set').style.display = "none"                     
          document.getElementById(id+'img').style.display = "block";
          document.getElementById(id+'grp').style.transform = "scale(1.5)";
          document.getElementById(id+'grp').style.transform = "all 300ms";
          document.getElementById(id+'grp').style.margin = "4%";
          settings = false          
        }
      }
      self.save = function(book){
        var updated = {
          user: [{username: userService.user.username}],
          title: book.title,
          authors: book.authors,
          settings: {
            copies: self.copies,
            method: self.tradeMethod
          }
        }
        bookStoreService.modify(updated).then(response=>{
          bookStoreService.books = response.data
          settings=false
        })
      }
    }
  })