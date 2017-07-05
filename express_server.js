const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 8080;
'use strict';
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "2b4dwD": "http://www.youtube.com"
};

app.get('/urls', (req, res) => {
  res.render('urls_index', { urls: urlDatabase });
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

app.post('/urls', (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`urls/${shortURL}`);
});

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

app.post('/urls/:id/delete', (req, res) => {
  let url = urlDatabase[req.params.id];
  if (url) {
    delete urlDatabase[req.params.id];
    res.redirect('/urls')
  } else {
    res.send('The URL you are trying to reach does not exist');
  }
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
