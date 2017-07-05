const express = require('express');
const app = express();
// const bodyParser = require('body-parser');
const PORT = process.env.PORT || 8080;
'use strict';
app.set('view engine', 'ejs');

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get('/urls', (req, res) => {
  res.render('urls_index', { urls: urlDatabase });
});

app.get('/urls/:id', (req, res) => {
  var longURL = urlDatabase[req.params.id];
  var templateVars = {
    shortURL: req.params.id,
    longURL: longURL
  };
  res.render('urls_shows', templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
