const dotenv = require('dotenv');
dotenv.config();
const MongoClient = require('mongodb').MongoClient;

let _db;

const initDb = (callback) => {
  if (_db) {
    console.log('Db is already initialized!');
    return callback(null, _db);
  }
  MongoClient.connect(process.env.MONGODB_CONNECTION_URI)
    .then((client) => {
      _db = client;
      callback(null, _db);
    })
    .catch((err) => {
      callback(err);
    });
};

const getDb = () => {
  if (!_db) {
    throw Error('Db not initialized');
  }
  return _db;
};

const initTestDb = async () => {
  _db = new MongoClient(process.env.MONGODB_CONNECTION_URI);
  return await _db.connect();
}

const closeDb = async () => {
  if (_db) await _db.close();
};

module.exports = {
  initDb,
  getDb,
  initTestDb,
  closeDb,
};