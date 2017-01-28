const mongo = require('mongodb').MongoClient;
const http = require('http');
const url = require('url');
const path = require('path');
const express = require('express');
const app = express();
const bodyParser= require('body-parser');
const PORT = process.env.PORT || 8080;
let serverAddress = 'https://linkshrink.herokuapp.com/';

if(process.env.node_env !== 'production') {
  require('dotenv').load();
  serverAddress = '';
}

const dbURL = `mongodb://${process.env.username}:${process.env.password}@${process.env.mdbloc}:${process.env.mdbport}/url_shortener`;

const addHTTP = (url) => {
  if ((url.slice(0,8) === 'https://') || (url.slice(0,7) === 'http://')){
    return url;
  }
  return `http://${url}`;
}

app.use(bodyParser.urlencoded({extended: true}));

app.use('/shortenedURL', (req,res,next) => {
  const long = url.parse(addHTTP(req.body.URL)).hostname;
  const options = {method: 'HEAD', host: long, port: 80, path: '/'};
  const test = http.request(options, () => {
    next();
  })
  test.on('error', () => res.send('Invalid URL'));
  test.end();
})

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
})

app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'favicon.ico'));
});

app.post('/shortenedURL', (req,res) => {
  const collection = db.collection('urls');
  const long = addHTTP(req.body.URL);
  collection.count({}, (err,count) => {
    const extention = count + 1;
    if (err) return console.log(err);
    collection.save({long, short: extention}, (err,result) => {
      if (err) return console.log(err);
      res.send(`Your shortened URL: ${serverAddress}${extention}`);
    })
  });
})

app.get('/:input', (req,res) => {
  const collection = db.collection('urls');
  const short = Number(req.params.input);
  collection.findOne({short}, (err, item) => {
    try {
      res.redirect(item.long);
    } catch (e) {
      res.send('URL not found');
    }
  })
})

mongo.connect(dbURL, (err, database) => {
  if (err) return console.log(err);
  db = database;
  app.listen(PORT, () => {
    console.log(`App running on port: ${PORT}`);
  })
})
