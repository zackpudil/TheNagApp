const { Expo } = require('expo-server-sdk');
const Db = require('./db');

const expo = new Expo();

const sendNotifications = async (messages) => {
  console.log('Sending Messages: ');
  console.log(messages.map(x => `${x.to}:${x.body}`).join());

  const chunks = expo.chunkPushNotifications(messages);
  await Promise.all(
    chunks.map(chunk => expo.sendPushNotificationsAsync(chunk))
  );
};

const notifyAllNaggers = async (body) => {
  // grab all users that are naggers, which are ambers (possible on multiple devices)
  const ambers = await Db.users().find({ type: 'Nagger' }).toArray();
  const messages = ambers.map(a => ({
    to: a.deviceToken,
    body,
    data: {}
  }));

  await sendNotifications(messages);
};

const notifyEverybody = async (naggerMessage, naggieMessage) => {
  const users = await Db.users().find().toArray();

  const messages = users.map(user => ({
    to: user.deviceToken,
    body: user.type === 'Nagger' ? naggerMessage : naggieMessage,
    data: {}
  }));

  sendNotifications(messages);
};

const notifyUserAndNaggers = async (deviceToken, message, naggerMessage) => {
  const ambers = await Db.users().find({ type: 'Nagger' }).toArray();
  const messages = [
    {
      to: deviceToken,
      body: message
    },
    ...ambers.map(amber => ({
      to: amber.deviceToken,
      body: naggerMessage
    }))
  ];
  await sendNotifications(messages);
};

module.exports = {
  sendNotifications,
  notifyAllNaggers,
  notifyEverybody,
  notifyUserAndNaggers
};
