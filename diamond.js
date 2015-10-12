/*
install sqlite3
convert  file to JSON
create the database
read json into db
write four methods
*/

// Import express to create and configure the HTTP server.
var express = require('express');

// Create a HTTP server app.
var app = express();

// body parser is needed to parse the data from the body
var bodyParser = require('body-parser');
app.use(bodyParser());

// import file system
var fs = require('fs');
var file = "diamonds.db";
var exists = fs.existsSync(file);

// data
var data = JSON.parse(fs.readFileSync('diamond-data.json', 'utf8'));

// check if the db file exists
if(!exists) {
  console.log("Creating DB file.");
  fs.openSync(file, "w");
}

// Create a sqlite3 database    // http://blog.modulus.io/nodejs-and-sqlite
var sqlite3 = require('sqlite3').verbose();
// opens connection
var db = new sqlite3.Database(file);  // could be a directory either  // file // ':memory:'


db.serialize(function(){
  // if the table does not exist, create it
   if (!exists) {
    // REAL is a floating point number
    // INTEGER, TEXT, BLOG, NULL: https://www.sqlite.org/datatype3.html
    // id INTEGER PRIMARY KEY,
    db.run("CREATE TABLE diamonds (price INTEGER, carat REAL, cut TEXT, colour TEXT, clarity TEXT, x REAL, y REAL, z REAL, depth REAL, tables REAL)");


  // method 1
  var stmt = db.prepare("INSERT INTO diamonds VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

  data.forEach(function(diamond){
    stmt.run(diamond.price, diamond.carat, diamond.cut, diamond.color, diamond.clarity, diamond.x, diamond.y, diamond.z, diamond.depth, diamond.table);
  });

  stmt.finalize();
}
  // method 2
  // for (var i = 0; i < data.length; i++) {
  //   //db.run("INSERT INTO diamonds VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", data[i].price, data[i].carat, data[i].cut, data[i].color, data[i].clarity, data[i].x, data[i].y, data[i].z, data[i].depth, data[i].table);
  //   db.run("INSERT INTO diamonds (price, carat, cut, colour, clarity, x, y, z, depth, tables) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", data[i].price, data[i].carat, data[i].cut, data[i].color, data[i].clarity, data[i].x, data[i].y, data[i].z, data[i].depth, data[i].table);
  //   //console.log(data[i]);
  // }

  // test
  //db.run("INSERT INTO diamonds VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 24, 34.45, "Good", "Red", "Clear", 11.11, 22.22, 33.33, 44.44, 55.55);

  // select
  // console.log("ID\tPrice\tCarat\tCut\t\tColour\tClarity\tx\ty\tz\tdepth\ttable");
  // console.log("===============================================================================================");
  // db.each("SELECT rowid AS id, price, carat, cut, colour, clarity, x, y, z, depth, tables FROM diamonds", function(err, row){
  //   console.log(row.id + "\t" + row.price + "\t" + row.carat + "\t" + row.cut + "\t\t" + row.colour + "\t" + row.clarity + "\t" + row.x + "\t" + row.y + "\t" + row.z + "\t" + row.depth + "\t" + row.tables);
  // });
});
// how to re open database?
db.close();

app.get('/', function(req, res) {
  res.send("This is the Diamond API.\n");
});

// When a user goes to /, return a small help string.
app.get('/:id', function(req, res) {
  var result = "";// = "info: ";
  // open connection
  var db = new sqlite3.Database(file);
  db.get("SELECT rowid as id, price, carat, cut, colour, clarity, x, y, z, depth, tables FROM diamonds WHERE id = ?", req.params.id, function(err, row){
    // server logs
    // console.log("Err: " + err);
    // console.log("Row: " + row);

    if (row === undefined) {
      result = "Could not find diamond with id: " + req.params.id + "\n";
      res.send(result);
    }
    else{
      result = "id:\t" + row.id + "\nprice:\t" + row.price + "\ncarat:\t" + row.carat + "\ncut:\t" + row.cut + "\ncolour:\t" + row.colour + "\nclarity:" + row.clarity + "\nx:\t" + row.x + "\ny:\t" + row.y + "\nz:\t" + row.z + "\ndepth:\t" + row.depth + "\ntable:\t" + row.tables + "\n";
      res.send(result);
    }
  });
  // close connection
  db.close();
});

// update
// params are in the body (need the body parser)
app.put('/:id', function(req, res) {
  var result = "";

  var price = req.body.price;
  var db = new sqlite3.Database(file);
  db.run("UPDATE diamonds SET price=?, carat=?, cut=?, colour=?, clarity=?, x=?, y=?, z=?, depth=?, tables=? WHERE rowId=?", [req.body.price, req.body.carat, req.body.cut, req.body.colour, req.body.clarity, req.body.x, req.body.y, req.body.z, req.body.depth, req.body.table, req.params.id], function(err, row){
    // curl commands:
    // curl -X PUT -d 'price=25&carat=1.22&cut=wow&colour=B&clarity=J3&x=1.1&y=2.2&z=3.3&depth=5.5&table=66'  localhost:8000/15
    // curl localhost:8000/15

    // server logs
    // console.log("Err: " + err);
    // console.log("Row: " + row);
    // console.log("this.lastId: " + this.lastID);
    // console.log("this.changes: " + this.changes);

    if (this.changes == 1) {
      result = "Updated diamond with id: " + req.params.id + "\n";
      res.send(result);
    }
    else{
      result = "Could not find diamond with id: " + req.params.id + "\n";
      res.send(result);
    }
  });

  db.close();
});

// add
app.post('/', function(req, res) {
  var result = "";

  var price = req.body.price;
  var db = new sqlite3.Database(file);

  db.run("INSERT INTO diamonds VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [req.body.price, req.body.carat, req.body.cut, req.body.colour, req.body.clarity, req.body.x, req.body.y, req.body.z, req.body.depth, req.body.table], function(err, row){
    // curl commands:
    // curl -X POST -d 'price=25&carat=1.22&cut=wow&colour=B&clarity=J3&x=1.1&y=2.2&z=3.3&depth=5.5&table=66'  localhost:8000
    // curl localhost:8000/15

    // server logs
    //console.log("Err: " + err);
    //console.log("Row: " + row);
    //console.log("this.lastId: " + this.lastID);
    //console.log("this.changes: " + this.changes);

    if (this.changes == 1) {
      result = "Inserted diamond with id: " + this.lastID + "\n";
      res.send(result);
    }
    else{
      result = "Could not insert diamond.\n";
      res.send(result);
    }
  });

  db.close();

});

// API:
// https://github.com/mapbox/node-sqlite3/wiki/API

// remove
app.delete('/:id', function(req, res) {
  var result = "";

  var db = new sqlite3.Database(file);
  db.run("DELETE FROM diamonds WHERE rowId = ?", req.params.id, function(err, row){
    // server logs
    console.log("Err: " + err);
    console.log("Row: " + row);
    console.log("this.lastId: " + this.lastID);
    console.log("this.changes: " + this.changes);

    // this.changes tells you how many changes were just done
    if (this.changes == 1) {
      result = "Deleted diamond with id: " + req.params.id + "\n";
      res.send(result);
    }
    else{
      result = "Could not find diamond with id: " + req.params.id + "\n";
      res.send(result);
    }
  });

  db.close();
});

// Start the server.
var server = app.listen(8000);

console.log("Web Service running on localhost:8000");
