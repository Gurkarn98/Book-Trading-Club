var express = require('express');
var app = express();
var mongoose = require('mongoose');
var mongodb = require('mongodb').MongoClient
var passport = require('passport')
var LocalStrategy = require("passport-local").Strategy
var session = require('express-session')
var bodyParser = require('body-parser')
var MongoStore = require('connect-mongo')(session);
var db = mongoose.connection;
var User = require('/app/schema/User');
var https = require("https");
var books;
mongoose.connect(process.env.MONGODB2)
app.use((session)(
  {
    secret: 'adljndakfushfw84184fn#$%^*H*#*', 
    resave: true, saveUninitialized: true,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      activeDuration: 30 * 24 * 60 * 60 * 1000,
    },
    store : new MongoStore({
      mongooseConnection : mongoose.connection
    })
   }
));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('app'));
app.use(flash());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.find({id: id}, function(err, user) {
    done(err, user);
  });
});

passport.use('local-signup', new LocalStrategy({
  usernameField : 'email',
  passwordField : 'password',
  passReqToCallback : true
},
function(req, email, password, done) {
  process.nextTick(function() {
    User.findOne({ 'local.email' :  email }, function(err, user) {
      if (err)
        return done(err);
      if (user) {
        return done(null, false, 'That email is already taken.');
      } else {
        var newUser = new User();
        newUser.local.email = email;
        newUser.local.password = newUser.generateHash(password);
        newUser.local.settings.name = req.body.name;
        newUser.local.settings.city = req.body.city;
        newUser.local.settings.state = req.body.state;
        newUser.local.settings.country = req.body.country;
        newUser.save(function(err) {
          if (err)
            throw err;
          return done(null, newUser);
        });
      }
    });
  })
}))

passport.use('local-login', new LocalStrategy({
  usernameField : 'email',
  passwordField : 'password',
  passReqToCallback : true
},
function(req, email, password, done) {
  User.findOne({ 'local.email' :  email }, function(err, user) {
    if (err)
      return done(err);
    if (!user)
      return done(null, false, null);
    if (!user.validPassword(password))
      return done(null, false, null);
    return done(null, user);
  });
}));

mongodb.connect(process.env.MONGODB3, function (err, client){
  if (err) {
    console.log(err)
  }
  var db = client.db('book-store')
  var collection = db.collection('books')
  books = collection
})

function getByUsername(req, res){
  books.find({ user: {$elemMatch: {username: req.body.user[0].username}}}).toArray(function(err, dataByUsername){
    if (err) 
      console.log(err)
    res.send(dataByUsername)
  })
}

app.post('/signup/', function (req, res, next){
  passport.authenticate('local-signup', function(err, user, info) {
    if (err) 
      console.log(err)
    if (!user) { 
      res.send(info)
    } else {
    req.logIn(user, function(err) {
      if (err) 
        console.log(err)
      var sendUser = {
        username: user.local.email,
        settings: user.local.settings,
        trades : user.local.trades
      }
      res.send(sendUser)
    })}
  })(req, res, next);
});

app.post('/logout', function(req, res) {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err)
      res.send(false)
    } else {
      res.send(true);
    }
  });
});

app.post('/login/', function (req, res, next){
  passport.authenticate('local-login', function(err, user, info) {
    if (err) 
      console.log(err)
    if (!user) { 
      res.send('No User found!')
    } else {
    req.logIn(user, function(err) {
      if (err) 
        console.log(err)
      var sendUser = {
        username: user.local.email,
        settings: user.local.settings,
        trades : user.local.trades
      }
      res.send(sendUser)
    })}
  })(req, res, next);
});

app.post("/authorized/", function (req, res) {
  if (req.session.passport) {
    User.findById(req.session.passport.user, function(err, user) {
      if (err)
        console.log(err);
      var sendUser = {
        username: user.local.email,
        settings: user.local.settings,
        trades : user.local.trades
      }
      res.send(sendUser)
    });
  } else {
    res.send(false)
  }
});

app.post('/search/', function (req, res){
  https.get("https://www.googleapis.com/books/v1/volumes?q="+req.body.title+"&keys="+process.env.APIKEY, response => {
    response.setEncoding("utf8");
    var body = "";
    response.on("data", data => {
      body += data;
    });
    response.on("end", () => {
      body = JSON.parse(body);
      res.send(body.items)
    });
  })
});

app.post('/add', function (req, res){
  books.find({title : req.body.title, authors: req.body.authors}).toArray(function(err, data){
    if (err)
      console.log(err)
    if (data.length===0){
      books.insert(req.body, function (err, inserted){
        if (err)
          console.log(err)
        getByUsername(req, res);
      })
    } else if (data.length === 1) {
      books.find({title : req.body.title, authors: req.body.authors, user:{$elemMatch:{username : req.body.user[0].username}}}).toArray(function(err, dataMatched){
        if (err)
          console.log(err)
        if (dataMatched.length === 1) {
          res.send("Already")
        } else if (dataMatched.length === 0) {
          books.update({title : req.body.title, authors: req.body.authors},  {$push: {user : req.body.user[0]}}, function (err, updated){
            if (err)
              console.log(err)
            getByUsername(req, res);
          })
        }
      })
    }
  })
})

app.post('/getByUser/', function (req, res){
  getByUsername(req, res);
})

app.post('/delete/', function (req, res){
  books.update({title : req.body.title, authors: req.body.authors},  { $pull: { user: {username : req.body.user[0].username}}}, function (err, updated){
    if (err)
      console.log(err)
    books.find({title : req.body.title, authors: req.body.authors}).toArray(function(err, data){
      if (err)
        console.log(err)
      if (data[0].user.length === 0){
        books.remove({title : req.body.title, authors: req.body.authors},function(err, result) {
          if (err) {
            console.log(err);
          }
        });
      }
      getByUsername(req, res);
    })
  })
})

app.post('/trade/', function (req, res){
  books.find({title : req.body.title, authors: req.body.authors, user:{$elemMatch:{username : req.body.tousername, 'settings.copies': {$gt:0}}}}).toArray(function(err, data){
    if (err)
      console.log(err)
    if (data.length > 0){
      User.findOne({ 'local.email' :  req.body.tousername }, function(err, user) {
        if (err) 
          console.log(err)
        var trade = {
          title : req.body.title,
          authors : req.body.authors,
          link: req.body.link,
          username : req.body.myusername,
          location : req.body.mylocation,
          status : 'Pending'
        }
        var filtered =user.local.trades.forMe.filter(curtrade=>{
          var check = false
          if (curtrade.title === req.body.title && curtrade.authors === req.body.authors && curtrade.username === req.body.myusername && curtrade.status ==="Pending") {
            check = true
          }
          return check
        })
        if (filtered.length=== 0){
          user.local.trades.forMe.push(trade);
          user.save(function (err, user){
            if (err)
              console.log(err)
          });
          User.findOne({ 'local.email' :  req.body.myusername }, function(err, user) {
            if (err) 
              console.log(err)
            books.find({title : req.body.title, authors: req.body.authors, user:{$elemMatch:{username : req.body.myusername}}}).toArray(function(err, data){
              if (err)
                console.log(err)
              if (data.length === 0){
                var trade = {
                  title : req.body.title,
                  authors : req.body.authors,
                  link: req.body.link,
                  username : req.body.tousername,
                  status : 'Pending'
                }
                user.local.trades.fromMe.push(trade);
                user.save(function (err, user){
                  if (err)
                    console.log(err)
                  res.send(user.local.trades.fromMe)
                });  
              }       
            })
          })
        } else if (filtered.length > 0) {
          res.send('Request only once from same user!')
        }
      })
    } else if (data.length === 0) {
      res.send(0)
    }
  })
})

app.get('/getAll', function (req, res){
  books.find({}).toArray(function(err, data){
    if (err)
      console.log(err)
    res.send(data)
  })
})

app.post('/decision', function (req, res){
  console.log(req.body.decision)
  if (req.body.decision === "Accepted"){
    books.find({title : req.body.title, authors: req.body.authors, user:{$elemMatch:{username : req.body.user,  'settings.copies': {$gt:0}}}}).toArray(function(err, data){
      if (err)
        console.log(err)
      if (data.length>0) {
        updateUser();
      }
    })
  } else if (req.body.decision === "Rejected") {
    updateUser()
  }
  function updateBook(){
    books.update({title : req.body.title, authors: req.body.authors, 'user.username': req.body.user}, { $inc: { "user.$.settings.copies" : -1 } }, function (err, result){
      if (err)
        console.log(err)
      books.find({title : req.body.title, authors: req.body.authors, user:{$elemMatch:{username : req.body.user, 'settings.copies': 0}}}).toArray(function (err, book){
        if(err)
          console.log(err)
        console.log(book)
        if (book.length>0){
          books.update({title : req.body.title, authors: req.body.authors},  {$pull: { user: {username : req.body.user}}}, function (err, updated){
            if (err)
              console.log(err)
            User.findOne({ 'local.email' :  req.body.user}, function(err, user) {
              if (err)
                console.log(err)
              for (var i = 0; i < user.local.trades.forMe.length; i++) {
                if (user.local.trades.forMe[i].title === req.body.title && 
                    user.local.trades.forMe[i].authors === req.body.authors && 
                    user.local.trades.forMe[i].status === "Pending"){
                  user.local.trades.forMe[i].status = "Rejected"
                  User.findOne({ 'local.email' :user.local.trades.forMe[i].username}, function(err, user2) {
                    if (err)
                      console.log(err)
                    user2.local.trades.fromMe.filter(trade=>{
                      var found = false
                      if (trade.title === req.body.title && 
                          trade.authors === req.body.authors && 
                          trade.status === "Pending" &&
                          trade.username === req.body.user) {
                        found = true
                      }
                      return found
                    })[0].status = "Rejected"
                    user2.markModified('local');
                    user2.save(function (err, user){
                      if (err)
                        console.log(err)
                    })
                  })
                }
              }
              user.markModified('local');
              user.save(function (err, user){
                if (err)
                  console.log(err)
                books.find({ user: {$elemMatch: {username: req.body.user[0].username}}}).toArray(function(err, dataByUsername){
                  if (err) 
                    console.log(err)
                  res.send([user.local.trades.forMe,'',dataByUsername])
                })
              })
            })
          })
        }
        books.update({title : req.body.title, authors: req.body.authors},  {$push: {user : {username: req.body.username, location: req.body.location ,settings:{method: 'Both', copies: 1}}}}, function (err, updated){
          if (err)
            console.log(err)
        })
      })
    })
  }
  function updateUser(){
    User.findOne({ 'local.email' :  req.body.username}, function(err, user) {
      if (err)
        console.log(err)
      var matched = false
      for (var i = 0; i < user.local.trades.fromMe.length; i++) {
        if (user.local.trades.fromMe[i].title === req.body.title && 
            user.local.trades.fromMe[i].authors === req.body.authors && 
            user.local.trades.fromMe[i].status === "Pending"){
          matched = true
          user.local.trades.fromMe[i].status = req.body.decision
          i = user.local.trades.fromMe.length
          user.markModified('local');
          user.save(function (err, user){
            if (err)
              console.log(err)
            User.findOne({ 'local.email' :  req.body.user}, function(err, user) {
              if (err)
                console.log(err)
              for (var i = 0; i < user.local.trades.forMe.length; i++) {
                if (user.local.trades.forMe[i].title === req.body.title && 
                    user.local.trades.forMe[i].authors === req.body.authors && 
                    user.local.trades.forMe[i].status === "Pending" &&
                    user.local.trades.forMe[i].username === req.body.username){
                  user.local.trades.forMe[i].status = req.body.decision
                  i = user.local.trades.fromMe.length
                  user.markModified('local');
                  user.save(function (err, user){
                    if (err)
                      console.log(err)
                    if (req.body.decision === "Rejected"){
                      res.send([user.local.trades.forMe,''])
                    } else if (req.body.decision === "Accepted"){
                      updateBook()
                    }
                  });
                }
              }
            })
          });
        }
        if (matched === false && i === user.local.trades.fromMe.length-1){
          User.findOne({ 'local.email' :  req.body.user}, function(err, user) {
            if (err)
              console.log(err)
            res.send([user.local.trades.forMe, "Request already accepted or rejected or cancelled by user."])
          })
        }
      }
    })
  }
})

app.post('/cancel', function (req, res){
  User.findOne({ 'local.email' :  req.body.user}, function(err, user) {
    if (err)
      console.log(err)
    var matched = false
    user.local.trades.fromMe = user.local.trades.fromMe.filter(request=>{
      var found = false
      if (request.title === req.body.request.title && 
          request.authors === req.body.request.authors && 
          request.status === "Pending" &&
          request.username === req.body.request.username){
        found = true
        matched = true
      }
      return !found
    })
    var sendData = user.local.trades.fromMe
    user.markModified('local');
    user.save(function (err, user){
      if (err)
        console.log(err)
      User.findOne({ 'local.email' :  req.body.request.username}, function(err, user) {
        if (err)
          console.log(err)
        user.local.trades.forMe = user.local.trades.forMe.filter(request=>{
          var found = false
          if (request.title === req.body.request.title && 
              request.authors === req.body.request.authors && 
              request.status === "Pending" &&
              request.username === req.body.user){
            found = true
          }
          return !found
        })
        user.markModified('local');
        user.save(function (err, user){
          if (err)
            console.log(err)
          if (matched === true) {
            res.send([sendData,""])
          } else if (matched === false) {
            res.send([sendData,"Your request has been already accepted or rejected"])
          }
        })
      })
    })
  })
})

app.post('/update', function (req, res){
  if (req.body.password === false){
    User.findOne({ 'local.email' :  req.body.username }, function(err, user) {
      if (err)
        return console.log(err);
      user.local.settings.city = req.body.location.city;
      user.local.settings.state = req.body.location.state;
      user.local.settings.country = req.body.location.country;
      user.markModified('local');
      user.save(function (err, user){
        if (err)
          console.log(err)
        user.local.trades.fromMe.forEach(trade=>{
          User.findOne({ 'local.email' : trade.username}, function(err, user2) {
            if (err)
              return console.log(err);
            user2.local.trades.forMe.filter(trade2=>{
              var found = false;
              if (trade2.title === trade.title && trade2.authors === trade.authors && trade2.username === req.body.username){
                found = true
              }
              return found
            })[0].location = req.body.location.full
            user2.markModified('local');
            user2.save(function (err, user){
              if (err)
                console.log(err)
            })
          })
        })
        books.update({'user.username': req.body.username}, { $set: { "user.$.location" : req.body.location.full} }, function (err, results){
          if (err) 
            console.log(err)
        })
        res.send(user.local.settings)
      });
    })
  } else if (req.body.location === false){
    User.findOne({ 'local.email' :  req.body.username }, function(err, user) {
      if (err)
        return console.log(err);
      if (user.validPassword(req.body.password.current)){
        user.local.password = user.generateHash(req.body.password.new);
        user.markModified('local');
        user.save(function (err, user){
          if (err)
            console.log(err)
          res.send('Your password has been updated.')
        });
      } else {
        res.send("Your current password is wrong!")
      }
    })
  }
})

app.post('/modify', function (req, res){
  books.update({title : req.body.title, authors: req.body.authors, "user.username" : req.body.user[0].username},  {$set: {"user.$.settings" : req.body.settings}}, function(err, data){
    if (err)
      console.log(err)
    getByUsername(req, res)
  })
})

app.post('/clear', function (req, res){
  User.findOne({ 'local.email' :  req.body.myusername}, function(err, user) {
    if (err)
      return console.log(err);
    var filteredOnce = false;
    user.local.trades[req.body.type] = user.local.trades[req.body.type].filter(request=>{
      var found = false
      if (!filteredOnce && request.title === req.body.title&& request.authors === req.body.authors && request.username === req.body.username && request.status === req.body.status){
        found = true
        filteredOnce = true
      }
      return !found
    })
    user.markModified('local');
    user.save(function (err, user){
      if (err)
        console.log(err)
      res.send(user.local.trades)
    })
  })
})

app.get("/*", function (req, res) {
  res.sendFile(__dirname + '/app/index.html');
});

app.listen(process.env.PORT,function () {
  console.log('Your app is listening on port ' + process.env.PORT);
});
