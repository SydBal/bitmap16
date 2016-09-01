/*
Initializing a table in RethinkDB for new 16x16 bitmap


*/

var r = require('rethinkdb')
require('rethinkdb-init')(r);

//Rethink Configs
var dbConfig = {
    host: '192.241.198.201',
    port: 28015,
    db: 'rtaheatmap',
    tables: {
  		bitmap: "bitmap"
    }
};

//Initialize a single database and table to a locally hosted RethinkDB server
r.init({
	    host: dbConfig.host,
	    port: dbConfig.port,
	    db: dbConfig.db
    },[
    	{
    		name: 'bitmap',
    		primaryKey: 'id'
    	}
    ]
).then(function (conn) {
	generate256table(conn)
	//getBitmapInOrder(conn)
});

function generate256table(conn) {
	for (var i = 256; i > 0; i--) {
		r.db(dbConfig.db).table(dbConfig.tables.bitmap).replace({id:i,color:"#F00001"}).run(conn, function(err, result) {
	        if (err) throw err;
	        console.log(result);
	        console.log("^^ result of element " + i)
	    });
	};
};

function getBitmapInOrder(conn){
	var bitmapArray = []
	r.db(dbConfig.db).table(dbConfig.tables.bitmap).run(conn, function(err, cursor){
		cursor.each(function(err, row){
		    bitmapArray.push(row)
        }, function(){
        	//console.log("hello")
        	bitmapArray.sort(function(a, b){
        		return a.id - b.id;
        	})
        	console.log(bitmapArray)
        })
	})
}