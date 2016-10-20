var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

assert = require('assert')
//for heroku
var port = process.env.PORT || 3000;
server.listen(port);

var r = require('rethinkdb')

// RethinkDB database settings. Defaults can be overridden using environment variables.
var dbConfig = {
  host: '192.241.198.201',
  port: 28015,
  db: 'rtaheatmap',
  tables: {
    bitmap: 'bitmapinf',
  }
};

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

var conn2;
r.connect({host: dbConfig.host, port: dbConfig.port}, function(err, connection) {
  conn2 = connection;
});

io.on('connection', function (socket) {
  console.log('Got a connection!');
  updateAllArrays(socket);

  /* listen for clicks  and emit the results back to the proper client*/
  socket.on('click', function (data){
    r.db(dbConfig.db).table(dbConfig.tables.bitmap).replace({id:data.id,color:data.color}).run(conn2, function(err, result) {
      if (err) throw err;
    });
  });

  /* AddRow to the infinite bitmap */
  socket.on('addRow', function(data){
    console.log('Add that row!');
  });
});

/* update metadata of all arrays to the connected socket */
function updateAllArrays(socket) {
  onConnect(connectionSuccessful);
  return;

  function emitArrayInfo (array_info) {
    socket.emit('array_info', array_info);
  };

  function connectionSuccessful(conn) {
    r.db(dbConfig.db)
     .table(dbConfig.tables.bitmap)
     .run(conn, function(err, cursor) {
       cursor.toArray()
             .then(function (array_info) {
               emitArrayInfo(array_info);
             })
             .error(console.log);
     });
  };
}

/* change feeds update */
function change_feeds(conn) {

    function emitUpdate(update) {
      io.emit('update', update.new_val);
    }

    r.db(dbConfig.db)
     .table(dbConfig.tables.bitmap)
     .changes()
     .run(conn, function(err, cursor) {
       cursor.each(function(err, row){
         emitUpdate(row);
       });
     });

}

/**
 * A wrapper function for the RethinkDB API `r.connect`
 * to keep the configuration details in a single function
 * and fail fast in case of a connection error.
 */
function onConnect(callback) {
  r.connect({host: dbConfig.host, port: dbConfig.port }, function(err, connection) {
    assert.ok(err === null, err);
    callback(connection);
  });
}

// trigger change feeds
onConnect(change_feeds)
