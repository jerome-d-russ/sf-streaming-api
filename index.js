require('./setup');
var jsforce = require('jsforce');
var conn = new jsforce.Connection();
var fs = require('fs');
conn.login(process.env.USER, process.env.PASSWORD, function(err, res) {
  if (err) { return console.error(err); }
  conn.query('SELECT Id, Name FROM Account', function(err, res) {
    if (err) { return console.error(err); }
    console.log(res);
  });
});
