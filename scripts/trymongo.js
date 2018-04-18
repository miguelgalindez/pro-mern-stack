'use strict';
const MongoClient=require('mongodb');

function usage() {
    console.log('Usage:');
    console.log('node', __filename, '<option>');
    console.log('Where option is one of:');
    console.log('  callbacks   Use the callbacks paradigm');
    console.log('  promises    Use the Promises paradigm');    
    console.log('  async       Use the async module');
}

/*  One problem with the callback paradigm is that it can get
    deeply nested and complicated, depending on the depth of the chain. */
function testWithCallbacks(){
    MongoClient.connect('mongodb://localhost/playground', function(err, db){
        db.collection('employees').insertOne({_id: 1, name: 'A. Callback'}, function(err, result){
            console.log("Result of insert: "+ result.insertedId);
            db.collection('employees').find({_id: 1}).toArray(function(err, docs){
                console.log("Result of find ", docs);
                db.close();
            });
        });
    });
}

function testWithPromises(){
    let db;
    MongoClient.connect('mongodb://localhost/playground')
        .then(connection => {
            db=connection;
            return db.collection('employees').insertOne({id:2, name: 'B. Promises'});
        }).then(result =>{
            console.log("Result of insert ", result.insertedId);
            return db.collection('employees').find({id: 2}).toArray();
        }).then(docs =>{
            console.log("Result of find: ", docs);
            db.close();
        }).catch(err =>{
            console.log("ERROR: ", err);
            if(db) db.close();
        });
}

function testWithAsync(){
    const async=require('async');
    let db;
    async.waterfall([
        next=>{
            MongoClient.connect('mongodb://localhost/playground', next);
        },
        (connection, next) => {
            db=connection;
            db.collection('employees').insertOne({id: 3, name: 'C. Async'}, next);
        },
        (result, next) => {
            console.log("Insert Result: ", result);
            db.collection('employees').find({id: 3}).toArray(next);
        },
        (docs, next) => {
            console.log("Result of find ", docs);
            db.close();
            next(null, "All done");
        }
    ], (err, result) => {
        if(err) console.log('ERROR: ', err);
        else console.log(result);
    });
}

if(process.argv.length<3){
    console.log("Incorrect number of arguments");
    usage();
} else if(process.argv[2] ==='callbacks')
    testWithCallbacks();
else if(process.argv[2]==='promises')
    testWithPromises();
else if(process.argv[2]==='async')
    testWithAsync();
else{
    console.log("Invalid option: "+process.argv[2]);
    usage();
}