const userInfo = require('./.mongo_login');
const mongo = require('mongodb').MongoClient;
const path = require('path');
const express = require('express');
const app = express();
const bodyParser= require('body-parser');
const PORT = process.env.PORT || 8080;

const user = userInfo.username;
const pw = userInfo.password;
const dbURL = `mongodb://${user}:${pw}@ds033875.mlab.com:33875/url_shortener`;

const parseURL = (url) => url.includes('http://') ? url : `http://${url}`;

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
})

app.post('/shortenedURL', (req,res) => {
  const collection = db.collection('urls');
  const long = parseURL(req.body.URL);
  collection.count({}, (err,count) => {
    if (err) return console.log(err);
    collection.save({long, short: count + 1}, (err,result) => {
      if (err) return console.log(err);
      res.send(`Your shortened URL: ${count + 1}`);
    })
  });
})

app.get('/:input', (req,res) => {
  const collection = db.collection('urls');
  const short = Number(req.params.input);
  collection.findOne({short}, (err, item) => {
    res.redirect(item.long);
  })
})

mongo.connect(dbURL, (err, database) => {
  if (err) return console.log(err);
  db = database;
  app.listen(PORT, () => {
    console.log(`App running on port: ${PORT}`);
  })
})
