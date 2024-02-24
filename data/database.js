const mongodb = require('mongodb');

const mongoClient = mongodb.MongoClient;
const uri = 'mongodb://localhost:27017';

let database;
async function connect(){
   const client = await mongoClient.connect(uri);
   database = client.db('blog');
}
function getDB(){
   if (!database) {
      throw {message: 'error with database connection!'}
   }
   else
   return database;
}
module.exports = {
   connectDB : connect,
   getDB : getDB
};