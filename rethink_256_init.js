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
	//generate256table(conn)
	//getBitmapInOrder(conn)
	recolor256("#F0F0FF", conn)
});

//create a 256bit table
function generate256table(conn) {
	generate256row(conn, 256)
};

//generate rows in order
function generate256row(conn, iter){
	if(iter>0){
		r.db(dbConfig.db).table(dbConfig.tables.bitmap).insert({id:iter,color:"#000000"}).run(conn, function(err, result) {
	        if (err) throw err;
	        generate256row(conn, iter-1);
	    });
	}else{
		console.log("Done generating 256bitmap")
	}
}

function recolor256(color, conn) {
	for (var i = 156; i > 0; i--) {
		r.db(dbConfig.db).table(dbConfig.tables.bitmap).replace({id:i,color:color}).run(conn, function(err, result) {
	        if (err) throw err;
	    });
	};
}

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