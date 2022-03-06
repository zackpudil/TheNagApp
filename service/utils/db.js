class Db {
  static instance = null;
  constructor() { }

  static setDatabase(mongoClient) {
    const db = mongoClient.db('nagapp');
    Db.instance = {
      users: db.collection('users'),
      nags: db.collection('nags'),
      chores: db.collection('chores')
    };
  }

  static users() {
    return Db.instance.users;
  }

  static nags() {
    return Db.instance.nags;
  }

  static chores() {
    return Db.instance.chores;
  }
};

module.exports = Db;
