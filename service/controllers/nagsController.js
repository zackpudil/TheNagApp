const { ObjectId } = require('mongodb');
const path = require('path');
const fs = require('fs');

const Db = require('../utils/db');
const { notifyUserAndNaggers, notifyEverybody, sendNotifications } = require('../utils/notifications');

const nagsController = (app) => {
  app.get('/nags', async (req, res) => {
    const cursor = Db.nags().find();
    const nagsToSend = await cursor.toArray();

    console.log(`found ${nagsToSend.length} to send`);
    res.send(nagsToSend);
  });

  app.get('/nags/needsApproval', async (req, res) => {
    const cursor = Db.nags().find({ needsApproval: true });
    const nagsToSend = await cursor.toArray();

    console.log(`found ${nagsToSend.length} that need approval`);
    res.send(nagsToSend);
  });

  app.get('/nags/user/:deviceToken', async (req, res) => {
    const nagsToSend = await Db.nags()
      .find({
        $or: [
          {
            $and: [
              { assignedToDeviceToken: req.params.deviceToken },
              {
                $or: [
                  { awaitingApproval: { $exists: false } },
                  { awaitingApproval: false }
                ]
              }
            ]
          },
          {
            isAssigned: false
          }
        ]
      })
      .toArray();

    console.log(`found ${nagsToSend.length} for user ${req.params.deviceToken}`);
    res.send(nagsToSend);
  });

  app.post('/nag', async (req, res) => {
    const newNag = JSON.parse(req.body.nag);
    console.log(newNag);

    if (!req.files.nagImage) {
      res.send({ status: 'nope' });
      return;
    }

    const savedNag = await Db.nags().insertOne(newNag);

    console.log(savedNag);
    console.log(req.files.nagImage);

    const fileName = `./nag-images/${savedNag.insertedId}.jpg`;
    req.files.nagImage.mv(fileName);

    console.log(fileName);

    await Db.nags().updateOne(
      { _id: ObjectId(savedNag.insertedId) },
      {
        $set: {
          uri: `http://${req.headers.host}/nag/${savedNag.insertedId}/nag-image`
        }
      }
    );

    if (newNag.assignedToDeviceToken) {
      await notifyUserAndNaggers(
        newNag.assignedToDeviceToken,
        newNag.title,
        `Ya created a new nag for ${newNag.name}`
      );
    } else {
      await notifyEverybody(
        'Ya created a new nag for every body',
        `Amber got a new Nag: ${newNag.title}`
      );
    }

    res.send({ status: 'ok' });
  });

  app.put('/nag/:nagId/do', async (req, res) => {
    if (!req.files) {
      res.send({ status: 'nope' });
      return;
    }

    const nagToDo = await Db.nags().findOne({ _id: ObjectId(req.params.nagId) });
    const naggie = await Db.users().findOne({ deviceToken: nagToDo.assignedToDeviceToken });

    console.log(req.files.nagImage);

    const fileName = `./nag-images/${req.params.nagId}-after.jpg`;
    req.files.nagImage.mv(fileName);

    console.log(fileName);

    await Db.nags().updateOne(
      { _id: nagToDo._id },
      {
        $set: {
          afterUri: `http://${req.headers.host}/nag/${nagToDo._id}/nag-image-after`,
          awaitingApproval: true,
          denied: false
        }
      }
    );

    await Db.users().updateOne(
      { _id: naggie._id},
      {
        $inc: {
          xp: 10
        }
      }
    );

    console.log(`updated nag ${nagToDo._id} and user ${naggie._id}`);

    await notifyUserAndNaggers(
      naggie.deviceToken,
      'Good job sir',
      `${naggie.name} Did a nag, go approve it`
    );

    res.send({ status: 'ok' });
  });

  app.put('/nag/:nagId/assign/:deviceToken', async (req, res) => {
    const assignie = await Db.users().findOne({ deviceToken: req.params.deviceToken });
    const nagToAssign = await Db.nags().findOne({ _id: ObjectId(req.params.nagId) });

    console.log(`assigning ${assignie.deviceToken} to nag ${nagToAssign._id}`);

    await Db.nags().updateOne(
      { _id: nagToAssign._id },
      {
        $set: {
          isAssigned: true,
          assignedToName: assignie.name,
          assignedToDeviceToken: assignie.deviceToken
        }
      }
    );

    await Db.users().updateOne(
      { deviceToken: assignie.deviceToken, },
      {
        $inc: {
          xp: 10
        }
      }
    );

    await notifyEverybody(
      `Lets congratulate ${assignie.name} for picking up a nag, good for him`,
      `${assignie.name} grabbed a nag for 10 xp points!`
    );

    res.send({ status: 'ok' });
  });

  app.delete('/nag/:nagId/approve', async (req, res) => {
    const nagToApprove = await Db.nags().findOne({ _id: ObjectId(req.params.nagId) });
    const naggieToGive = await Db.users().findOne({ deviceToken: nagToApprove.assignedToDeviceToken });

    const beforeFilePath = path.resolve(`./nag-images/${nagToApprove._id}.jpg`);
    const afterFilePath = path.resolve(`./nag-images/${nagToApprove._id}-after.jpg`);

    if (!nagToApprove.choreId) {
      console.log(`deleting ${beforeFilePath}`);
      fs.unlinkSync(beforeFilePath);
    }

    console.log(`deleting ${afterFilePath}`);
    fs.unlinkSync(afterFilePath);

    await Db.nags().deleteMany({ _id: nagToApprove._id });
    await Db.users().updateOne(
      { _id: naggieToGive._id },
      {
        $inc: {
          xp: 20
        }
      }
    );

    console.log(`deleted ${nagToApprove._id} and gave ${naggieToGive.name} 20 xp points`);

    await notifyUserAndNaggers(
      naggieToGive.deviceToken,
      'Your nag was approved! 20 xp points for you!',
      `You approved nag ${nagToApprove.title}`
    );

    res.send({ status: 'ok' });
  });

  app.put('/nag/:nagId/deny', async (req, res) => {
    const nagToDeny = await Db.nags().findOne({ _id: ObjectId(req.params.nagId) });
    console.log(nagToDeny);
    const naggieDenied = await Db.users().findOne({ deviceToken: nagToDeny.assignedToDeviceToken });
    console.log(naggieDenied);

    await Db.nags().updateOne(
      { _id: nagToDeny._id },
      {
        $set: {
          denied: true,
          awaitingApproval: false
        }
      }
    );

    await Db.users().updateOne(
      { _id: naggieDenied._id },
      {
        $inc: {
          xp: -15
        }
      }
    );
    console.log(`denied ${nagToDeny._id} and gave ${naggieDenied.name} -15 xp points`);

    await notifyUserAndNaggers(
      naggieDenied.deviceToken,
      `Amber denied nag "${nagToDeny.title}"`,
      'Ya denied a nag'
    );

    res.send({ status: 'ok' });
  });

  app.delete('/nag/:nagId', async (req, res) => {
    const nagToDelete = await Db.nags().findOne({ _id: ObjectId(req.params.nagId) });
    console.log(nagToDelete);

    if (nagToDelete.uri) {
      const filePath = path.resolve(`./nag-images/${nagToDelete._id}.jpg`);
      console.log(`deleting file ${filePath}`);
      fs.unlinkSync(filePath);
    }

    if (nagToDelete.afterUri) {
      const filePath = path.resolve(`./nag-images/${nagToDelete._id}-after.jpg`);
      console.log(`deleting file ${filePath}`);
      fs.unlinkSync(filePath);
    }

    await Db.nags().deleteMany({ _id: nagToDelete._id });
    console.log(`Deletied nag ${nagToDelete._id}`);

    if (nagToDelete.assignedToDeviceToken) {
      await notifyUserAndNaggers(
        nagToDelete.assignedToDeviceToken,
        `Amber delted: ${nagToDelete.title}`,
        'Ya deleted a nag'
      );
    } else {
      await notifyEverybody(
        'Ya deleted a nag',
        `Amber deleted: ${nagToDelete.title}`
      );
    }

    res.send({ status: 'ok' });
  });

  app.post('/nags/alert', async (req, res) => {
    const nagsToAlert = await Db.nags().find({ isAssigned: true }).toArray();
    console.log(nagsToAlert);

    const deviceTokensToNag = nagsToAlert
      .map(nag => nag.assignedToDeviceToken)
      .filter((v, i, a) => a.indexOf(v) == i);

    const messages = deviceTokensToNag.map(deviceToken => ({
      to: deviceToken,
      body: "Amber's friendly reminder to do ya nags bish",
      data: {}
    }));
    await sendNotifications(messages);

    res.send({ status: 'ok' });
  });

  app.post('/nag/:nagId/alert', async (req, res) => {
    const nag = await Db.nags().findOne({ _id: ObjectId(req.params.nagId) });

    await sendNotifications([{
      to: nag.assignedToDeviceToken,
      body: `Reminder: ${nag.title}`,
      data: { }
    }]);
    res.send({ status: 'ok' });
  });

  app.get('/nag/:nagId/nag-image', async (req, res) => {
    const file = path.resolve(`./nag-images/${req.params.nagId}.jpg`)
    console.log(`sending ${file}`);
    res.sendFile(file);
  });

  app.get('/nag/:nagId/nag-image-after', async (req, res) => {
    const file = path.resolve(`./nag-images/${req.params.nagId}-after.jpg`)
    console.log(`sending ${file}`);
    res.sendFile(file);
  });
};

module.exports = nagsController;
