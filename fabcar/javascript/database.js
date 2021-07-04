const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) =>{

    MongoClient.connect(
        'mongodb+srv://arnobkumarsaha:sustcse16@cluster0.nj6lk.mongodb.net/searchableEncryption?retryWrites=true&w=majority'
    ).then( (client)=>{
        console.log("MongoDB connected !");
        _db = client.db();
        callback();
    }).catch( (err)=>{
        console.log(err);
        throw err;
    });
}

const getDb = () =>{
    if(_db){
        return _db;
    }
    throw 'No Database found.'
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;