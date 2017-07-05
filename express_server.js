const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
"use strict";
app.set('view engine', 'ejs');

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/urls', (req, res) => {
  res.render('urls_index', { urls: urlDatabase });
});

app.get('/urls/b2xVn2', (req, res) => {
  res.render('urls_shows', { shortURL: urlDatabase.b2xVn2 });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
