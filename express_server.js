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
     user_name: users[req.session.user_id] ? users[req.session.user_id].name : undefined
   };
   next();
});
// Checks if the user is logged in or not and redirects accordingly
app.use('/urls', verifyCookieExists);
app.use('/urls/*', verifyCookieExists);
app.use('/login', verifyNoCookie);

//Functions

function encrypt(password, userID) {
  return bcrypt.hashSync(password, 10);
}

// generate a a string of 6 random characters
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

function verifyCookieExists(req, res, next) {
  if (req.session.user_id) {
   next();
 } else {
   res.redirect('/login');
 }
}

function verifyNoCookie(req, res, next) {
  if (!req.session.user_id) {
   next();
 } else {
   res.redirect('/urls');
 }
}

// Find a longURL to redirect to given a shortURL. This by passes path reqs
function findUrl(shortURL) {
  for (let user in urlDatabase) {
    for (let id  in urlDatabase[user]) {
      if (shortURL === id) return urlDatabase[user][id];
    }
  }
}

function findUser(email) {
  for (let uid in users) {
    if (email === users[uid].email)
      return uid;
  }
  return undefined;
}

// Object databases

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

var urlDatabase = {
  "user1": {
    "9sm5xK": "http://www.google.com",
    "b2xVn2": "http://www.lighthouselabs.ca"
  },
  "user2": {
    "2b4dwD": "http://www.youtube.com"
  }
};

// GET'S

app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlDatabase[req.session.user_id]
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:id', (req, res) => {
  var longURL = urlDatabase[req.session.user_id][req.params.id];
  var templateVars = {
    shortURL: req.params.id,
    longURL
  };
  res.render('urls_show', templateVars);
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/u/:shortURL', (req, res) => {
  if (findUrl(req.params.shortURL)) {
    res.redirect(findUrl(req.params.shortURL));
  } else {
    res.send('Error 404: Not Found'));
  }
});

// POST's

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

app.post('/login', (req, res) => {
  const user = findUser(req.body.email);
  bcrypt.compare(req.body.password, users[user].password, function(err, response) {
      if (err) {
        res.send('Error 404: Incorrect Password and/or Email')
      }
      if (response) {
          req.session.user_id = user;
          res.redirect('/urls');
        }
  });
});
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  let shortURL = generateRandomString();
  let cookie = req.session.user_id;
  if (urlDatabase[cookie]) {
  urlDatabase[cookie][shortURL] = req.body.longURL;
  res.redirect('urls/');
  } else {
    urlDatabase[cookie] = {};
    urlDatabase[cookie][shortURL] = req.body.longURL;
    res.redirect('urls/');
  }
});

app.post('/urls/:id/delete', (req, res) => {
  let url = urlDatabase[req.session.user_id][req.params.id];
  if (url) {
    delete urlDatabase[req.session.user_id][req.params.id];
    res.redirect('/urls');
  } else {
    res.send('The URL you are trying to reach does not exist');
  }
});

app.post('/urls/:id/update', (req, res) => {
  urlDatabase[req.session.user_id][req.params.id] = [req.body.URL];
  res.redirect('/urls');
});

// Is the server running?

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
