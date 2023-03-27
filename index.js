require('dotenv').config();

const FeedParser = require('feedparser');
const fetch = require('node-fetch');
const functions = require('./lib/functions.js');
const tls = require('tls')
const fs = require('fs')

const url = process.env.REMOTE_SERVER_URL
const sslCert = process.env.REMOTE_SSL_SERVER_CERTIFICATE
const sslKey = process.env.REMOTE_SSL_SERVER_KEY
const intervalSecs = (typeof process.env.GDACS_PULL_INTERVAL !== 'undefined') ? process.env.GDACS_PULL_INTERVAL : 60;
const logCot = (typeof process.env.LOGCOT !== 'undefined') ? process.env.LOGCOT : false;

var interval = intervalSecs * 1000;

process.env.TZ = 'UTC';

const run = () => {

  const urlMatch = url.match(/^ssl:\/\/(.+):([0-9]+)/)
  if (!urlMatch) return

  const options = {
    host: urlMatch[1],
    port: urlMatch[2],
    cert: fs.readFileSync(sslCert),
    key: fs.readFileSync(sslKey),
    rejectUnauthorized: false
  }

  const client = tls.connect(options, () => {
    if (client.authorized) {
      console.log("Connection authorized by a Certificate Authority.")
    } else {
      console.log("Connection not authorized: " + client.authorizationError)
    }
 })

  client.on('data', (data) => {
    console.log(data);
  })

  client.on('error', (err) => {
    console.error(`Could not connect to SSL host ${url}`)
  })

  client.on('close', () => {
    console.info(`Connection to SSL host ${url} closed`)
  })

  function heartbeat() {
    
  }

  function pullandfeed() {
    var feedparser = new FeedParser();
    var req = fetch('https://www.gdacs.org/xml/rss.xml')
  
    req.then(function (res) {
      if (res.status !== 200) {
        throw new Error('Bad status code');
      }
      else {
        res.body.pipe(feedparser);
      }
    }, function (err) {
      console.log(err);
    });
  
    feedparser.on('error', function (error) {
      console.log(error);
    });
  
    feedparser.on('readable', function () {
      var stream = this;
      var meta = this.meta;
      var item;
  
      while (item = stream.read()) {
        if (item['gdacs:iscurrent']['#'] == 'true') {
          //console.log(item);
          client.write(functions.gdacs2cot(item,intervalSecs));
          if (logCot) {
            console.log(functions.gdacs2cot(item,intervalSecs));
            console.log('-----')
          }
        }
      };
    });
    setTimeout(pullandfeed,interval);
  };
  pullandfeed();
};

if (url && sslCert && sslKey) {
  run();
}
