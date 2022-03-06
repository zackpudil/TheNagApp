const {
  notifyEverybody,
  notifyUserAndNaggers,
  notifyAllNaggers,
} = require('../utils/notifications');

const Db = require('../utils/db');

const userController = (app) => {

  app.get('/users', async (req, res) => {
    const naggies = await Db.users().find({ type: 'Naggie' }).toArray();

    console.log(`found ${naggies.length} Naggies`);
    res.send(naggies);
  });

  app.get('/user/:deviceToken', async (req, res) => {
		const { deviceToken } = req.params;
		const user = await Db.users().findOne({ deviceToken });
		console.log(`GOT user from token ${deviceToken} ${user}`);
		res.send(user || false);
	});

	app.post('/user', async (req, res) => {
    const newUser = req.body;
    console.log(`Creating user ${req.body.name} with token ${req.body.deviceToken}`);
    await Db.users().insertOne(req.body);

    if (newUser.needsApproval) {
      await notifyAllNaggers(`Lil bitch ${newUser.name} needs approval`);
    }

		res.send(newUser);
	});

  app.put('/user/:deviceToken', async (req, res) => {
    const deviceToken = req.params.deviceToken;
    const oldUser = await Db.users().findOne({ deviceToken })

    console.log(`Found user ${oldUser} with token ${deviceToken}`);
    const newUser = req.body;

    if (oldUser.needsApproval && !newUser.needsApproval) {
      await notifyUserAndNaggers(
        deviceToken,
        'Da bitch approved ya',
        `You approved ${newUser.name}`
      );
    }

    await Db.users().replaceOne({ deviceToken: deviceToken }, {
      ...newUser,
      _id: oldUser._id
    });

    res.status(204);
  });

  app.delete('/user/:deviceToken', async (req, res) => {
    const deviceToken = req.params.deviceToken;
    const deletedUser = await Db.users().findOne({ deviceToken });

    console.log(`Deleting user ${deletedUser}:${deviceToken}`);

    await Db.users().deleteOne({ deviceToken });

    await notifyUserAndNaggers(
      deviceToken, 
      `Amber said you ain't ${deletedUser.name}! You Lying bitch.  Try again!`,
      'You denied user'
    );

    res.status(204);
  });
};

module.exports = userController;
