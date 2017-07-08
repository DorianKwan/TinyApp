// Dependancies
const PORT = process.env.PORT || 8080;
const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
app.set('view engine', 'ejs');

// Middleware

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['myKey'],
  maxAge: 24 * 60 * 60 * 1000
}));
app.use(function (req, res, next) {
   res.locals = {
     user_name: users[req.session.user_id] ? users[req.session.user_id].name : undefined,
     user_email: users[req.session.user_id] ? users[req.session.user_id].email : undefined
   };
   next();
});
// Middleware checking for a logged in user
app.use('/urls', verifyCookieExists);
app.use('/urls/*', verifyCookieExists);
app.use('/login', verifyNoCookie);

//Functions
// Password hashing
function encrypt(password, userID) {
  return bcrypt.hashSync(password, 10);
}
// userID and shortURL random string generation
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}
// Checks for cookies(user logged in?), redirects accordingly
function verifyCookieExists(req, res, next) {
  if (req.session.user_id) {
   next();
 } else {
   res.redirect('/login');
 }
}
// Checks for cookies(user logged in?), redirects accordingly
function verifyNoCookie(req, res, next) {
  if (!req.session.user_id) {
   next();
 } else {
   res.redirect('/urls');
 }
}
// Find the longURL to give access use to non-owners
function findUrl(shortURL) {
  for (let user in urlDatabase) {
    for (let id  in urlDatabase[user]) {
      if (shortURL === id) return urlDatabase[user][id];
    }
  }
}
// Checks if a user email exists
function findUser(email) {
  for (let uid in users) {
    if (email === users[uid].email)
      return uid;
  }
  return undefined;
}
// If user doesn't add http://
function addProtocol(longURL) {
  if (longURL.includes('https') || longURL.includes('http')) {
    return longURL;
  } else {
    return `http://${longURL}`;
  }
}

// Object databases
// Users memory object database :(
const users = {
  "user1": {
    id: "user1",
    name: "bill",
    email: "user1@example.com",
    password: encrypt('waterbottle')
  },
  "user2": {
    id: "user2",
    name: "joe",
    email: "user2@example.com",
    password: encrypt('coffeecup')
  }
};
// URL memory object database :'(
var urlDatabase = {
  "user1": {
    "9sm5xK": "http://www.google.com",
    "b2xVn2": "http://www.lighthouselabs.ca"
  },
  "user2": {
    "2b4dwD": "http://www.youtube.com"
  }
};

// GET REQUESTS
// To registeration page
app.get('/register', (req, res) => {
  res.render('register');
});
// To login padding-left
app.get('/login', (req, res) => {
  res.render('login');
});
// To urls page
app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlDatabase[req.session.user_id]
  };
  res.render('urls_index', templateVars);
});
// To new link page
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});
// To edit page
app.get('/urls/:id', (req, res) => {
  if (urlDatabase[req.session.user_id][req.params.id]) {
    var longURL = urlDatabase[req.session.user_id][req.params.id];
    var templateVars = {
      shortURL: req.params.id,
      longURL
    };
    res.render('urls_show', templateVars);
  } else {
    res.send("Error 404: You do not own this URL. Please go back to your URLs")
  }
});
// To longURL page
app.get('/u/:shortURL', (req, res) => {
  if (findUrl(req.params.shortURL)) {
    res.redirect(addProtocol(findUrl(req.params.shortURL)));
  } else {
    res.send('Error 404: URL Not Found');
  }
});

// POST REQUESTS
// Register a new user
app.post('/register', (req, res) => {
  let userID = generateRandomString();
  const {password, email, name} = req.body;
  const check = findUser(email) // true is email already exists
  if (!email) {
    res.send('Error 404: Enter a valid username and password.')
  } else if (check) {
    res.send('Error 15023: The username you have entered already exists.')
  } else {
      users[userID] = {
        id: userID,
        name,
        email,
        password: encrypt(password)
      };
      req.session.user_id = userID;
      res.redirect('/urls');
  }
});
// Login as user x
app.post('/login', (req, res) => {
  const user = findUser(req.body.email);
  bcrypt.compare(req.body.password, users[user].password, function(err, response) {
      if (err) {
        res.send(error.response)
      }
      if (response) {
        req.session.user_id = user;
        res.redirect('/urls');
      }
      else {
        res.send('Error 401: Incorrect password and/or email')
      }
  });
});
// Clear the session cookie, effectively logging out, redirecting to login
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});
// Create a new url and redirects to urls
app.post('/urls', (req, res) => {
  let shortURL = generateRandomString();
  let cookie = req.session.user_id;
    urlDatabase[cookie] = {};
    urlDatabase[cookie][shortURL] = req.body.longURL;
    res.redirect('urls/');
});
// Deletes a url from the users urls and redirects to urls
app.post('/urls/:id/delete', (req, res) => {
  let url = urlDatabase[req.session.user_id][req.params.id];
  if (url) {
    delete urlDatabase[req.session.user_id][req.params.id];
    res.redirect('/urls');
  } else {
    res.send('The URL you are trying to reach does not exist');
  }
});
// Updates an existing url and redirects to urls
app.post('/urls/:id/', (req, res) => {
  urlDatabase[req.session.user_id][req.params.id] = [req.body.URL];
  res.redirect('/urls');
});

// Is the server running?

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
