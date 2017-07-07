const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 8080;
const cookieParser = require('cookie-parser');
'use strict';
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "2b4dwD": "http://www.youtube.com"
};

const users = {
  "user1": {
    id: "user1",
    name: "bill",
    email: "user1@example.com",
    password: "waterbottle"
  },
  "user2": {
    id: "user2",
    name: "joe",
    email: "user2@example.com",
    password: "coffeecup"
  }
}

app.use(function (req, res, next) {
   res.locals = {
     user_name: users[req.cookies.user_id] ? users[req.cookies.user_id].name : undefined
   };
   next();
});

function verifyCookieExists(req, res, next) {
  if (req.cookies.user_id) {
   next();
 } else {
   res.redirect('/login');
 }
}

app.use('/urls', verifyCookieExists);

app.use('/urls/*', verifyCookieExists);

app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlDatabase
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:id', (req, res) => {
  var longURL = urlDatabase[req.params.id];
  var templateVars = {
    shortURL: req.params.id,
    longURL: longURL
  };
  res.render('urls_show', templateVars);
});

app.get('/register', (req, res) => {
  res.render('_register');
});

app.get('/login', (req, res) => {
  res.render('_login', users);
});
// check if an email exists in the user object database
function checkEmail(email) {
  for (let uid in users) {
    if (email === users[uid].email)
      return true;
  }
  return false;
}

app.post('/register', (req, res) => {
  let userID = generateRandomString();
  const {password, email, name} = req.body;
  const check = checkEmail(email) // true is email already exists
  if (email == false) {
    res.send('Error 400: Enter a valid username and password.')
  } else if (check) {
    res.send('Error 400: The username you have entered already exists.')
  } else {
      users[userID] = {
        id: userID,
        name,
        email,
        password
      };
      res.cookie('user_id', userID);
      console.log(users); // debug statement to check users obj
      res.redirect('/urls');
  }
});
// find a user given a user's email address, will return false if not found
function findUser(email) {
  for (let uid in users) {
    if (email === users[uid].email)
      return uid;
  }
  return undefined;
}

app.post('/login', (req, res) => {
  const user = findUser(req.body.email);
  if (user !== undefined) {
    if (req.body.email === users[user].email && req.body.password === users[user].password) {
      res.cookie('user_id', user);
      res.redirect('/urls');
    } else {
      res.send('Error 400: Incorrect Username and/or password')
    }
  } else {
    res.send('Error 400: You are not a registered user.');
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`urls/${shortURL}`);
});
// generate a a string of 6 random characters
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

app.post('/urls/:id/delete', (req, res) => {
  let url = urlDatabase[req.params.id];
  if (url) {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  } else {
    res.send('The URL you are trying to reach does not exist');
  }
});

app.post('/urls/:id/update', (req, res) => {
  urlDatabase[req.params.id] = [req.body.URL];
  res.redirect('/urls');
});

app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];

  if (longURL) {
    res.redirect(longURL);
  } else {
    res.render('urls_not_found');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
