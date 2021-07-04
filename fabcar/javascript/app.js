const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const multer = require('multer');
const mongoose = require('mongoose');

const app = express()
const port = 5000;


///
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const MONGODB_URI = "mongodb+srv://arnobkumarsaha:sustcse16@cluster0.nj6lk.mongodb.net/searchableEncryption?retryWrites=true&w=majority";

const csrf = require('csurf'); // to prevent csrf attack
const flash = require('connect-flash'); // to help users by showing what error occured.

const User = require('./models/user');


const encDec = require('./EncryptDecrypt-v2');
const fs = require('fs');


const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/files');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-*-' + file.originalname);
    }
});

//encDec.getEncryptFile('rosalind.txt'/* '2021-05-27T18:21:22.710Z-*-solive.txt' */);

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(multer({storage: fileStorage}).single('file'));
app.use(express.static(path.join(__dirname, "public")));


// Specifying the session storage & then use the middleware
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});
const csrfProtection = csrf();


// session, crsf(cross site request forgery) & flash Middlewares
app.use(
  session({
    httpOnly: false,
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
app.use(csrfProtection);
app.use(flash());



// Check if the requester is authenticated or not
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

// res.locals variables are passed to every views.
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();

  if(!req.user){
    res.locals.profileName = "";
  }
  else res.locals.profileName = req.user.name;
  next();
});




// About Routes.
var usersRouter = require("./routes/user");
var indexRouter = require("./routes/index");

const errorController = require('./controllers/error');

/*
app.get('',(req,res) =>{
    res.render('index')
})
app.get('/form',(req,res) =>{
    res.render('form')
})*/

/*
app.post('/form', urlencodedParser, (req,res) => {
    res.json(req.body)
})*/


app.use("/user", usersRouter);

app.use("/", indexRouter);

app.use(errorController.get404);


mongoose
  .connect(
    MONGODB_URI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )
  .then(result =>{
    app.listen(port, ()=> console.info("App listening on port: " , port))
    console.log("Yesss ! MongoDb is connected.");
  })
  .catch(err =>{
    console.log(err);
  });



// app.listen(port, ()=> console.info("App listening on port: " , port))