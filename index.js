require('./setup');
var jsforce = require('jsforce');
var conn = new jsforce.Connection();
var fs = require('fs');
conn.login(process.env.USER, process.env.PASSWORD, function(err, res) {
  if (err) { return console.error(err); }
  conn.query('SELECT Id, Name, Query FROM PushTopic Where Name = \'AccountUpdates\'', function(err, res) {
    if (err) { return console.error(err); }
    console.log(JSON.stringify(res));
    if(res.totalSize === 0){
      conn.sobject("PushTopic").create({
        Name: 'AccountUpdates',
        Query: 'Select Id, Name, Rating, OwnerId From Account',
        NotifyForFields: 'Referenced',
        NotifyForOperationDelete: true,
        NotifyForOperationCreate: true,
        NotifyForOperationUpdate: true,
        NotifyForOperationUndelete: true,
        ApiVersion: 37.0
      }, function(err, ret) {
        if(err || !ret.success) { console.log('error: '); console.log(err); console.log(ret.success); return console.error(err, ret); }
        console.log("Push Topic Created! " + ret.id);
        subscribeToTopic(conn);
      });
    } else {
      subscribeToTopic(conn);
    }
  });
});

function subscribeToTopic(conn){
  conn.streaming.topic("AccountUpdates").subscribe(function(message) {
      console.log(message);
      console.log('Event Type : ' + message.event.type);
      console.log('Event Created : ' + message.event.createdDate);
      console.log('Object Id : ' + message.sobject.Id);
      fs.writeFileSync('replay.txt', message.event.replayId);
  }, parseInt(fs.readFileSync('replay.txt',"utf8")));
}
