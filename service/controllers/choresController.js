const { ObjectId } = require('mongodb');
const path = require('path');
const Db = require('../utils/db');
const { notifyAllNaggers } = require('../utils/notifications');
const startChoreScheduler = require('../schedulers/chores');

const choresController = (app) => {
  startChoreScheduler();
  
  app.get('/chores', async (req, res) => {
    const chores = await Db.chores().find().toArray();
    console.log(`got ${chores.length} chores to send`);
    res.send(chores);
  });

  app.post('/chore', async (req, res) => {
    const newChore = req.body;
    console.log(newChore);

    const savedChore = await Db.chores().insertOne(newChore);

    console.log(savedChore);

    await notifyAllNaggers('New chore created');

    res.send({ status: 'ok' });
  });

  app.delete('/chore/:choreId', async (req, res) => {
    const chore = await Db.chores().findOne({ _id: ObjectId(req.params.choreId) });
    console.log(`deleting ${chore}`);

    await Db.chores().deleteMany({ _id: chore._id });

    await notifyAllNaggers('Ya deleted a chore');

    res.send({ status: 'ok' });
  });
};

module.exports = choresController;
