var express = require('express');
var app = express();

var GoogleSearch = require('google-search');
var googleSearch = new GoogleSearch({
  key: 'AIzaSyBunbtKmh4Vd2dsx-PY6I4MDbOYu0DuFzs',
  cx: '011581325920002180380:b4n_v1lkgzu'
});
 
app.get('/:q', function(req,res){ 
    var result = [];
    googleSearch.build({
      q: req.params.q,
      num: 10,
      start: req.query.offset
     }, function(error, response) {
        res.writeHead(200,{'Content-Type': 'application/json'});
       for(var i in response.items)
            result.push({
                url: response.items[i].link,//pagemap.metatags[0]['og:url'],
               caption: response.items[i].title,//pagemap.metatags[0]['og:title'],
               image: response.items[i].pagemap.imageobject[0].url//metatags[0]['og:image'],
            });
        
        res.end(JSON.stringify(result));
    });
});


app.listen(8080);