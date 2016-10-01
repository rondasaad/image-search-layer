var express = require('express');
var app = express();
var mongo = require('mongodb').MongoClient;
var assert = require('assert');

var GoogleSearch = require('google-search');
var googleSearch = new GoogleSearch({
  key: process.env.key_google,
  cx: process.env.cx_google
});

var db_url =   'mongodb://user:pass@ds041556.mlab.com:41556/imagesearcher';

app.get('/', function(req, res){
    mongo.connect(db_url, function(err, db){
        assert.equal(null, err);
        var options = {
            "limit": 10,
            "skip": 0,
            "sort": {when:-1},
            "fields": {_id:0}
        };
        db.collection('history').find({}, options).toArray(function(err, docs ){
            assert.equal(null, err);
            res.writeHead(200,{'Content-Type': 'application/json'});
            res.end(JSON.stringify(docs));
            db.close();
        });
    });
})

app.get('/:q', function(req,res){ 
    var result = [];
    var q = req.params.q;
    googleSearch.build({q : q, num: 10, start: req.query.offset || 1},
        function(error, response) {
            res.writeHead(200,{'Content-Type': 'application/json'});
            for(var i in response.items)
            result.push({
                url: response.items[i].link,//pagemap.metatags[0]['og:url'],
               caption: response.items[i].title,//pagemap.metatags[0]['og:title'],
               image: response.items[i].pagemap.imageobject[0].url//metatags[0]['og:image'],
            });
            res.end(JSON.stringify(result));

            mongo.connect(db_url, function(err, db){
                assert.equal(null, err);
                var when = new Date();
                var when = when.toString();
                db.collection('history').insertOne({term: q, when: when}, function(err, item){
                    assert.equal(null, err);
                    console.log(JSON.stringify(item));
                    db.close();
                });
            });
        });
});

app.listen(process.env.PORT || 8080);
