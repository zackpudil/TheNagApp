const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const { MongoClient } = require('mongodb');

const Db = require('./utils/db');
const userController = require('./controllers/userController');
const nagsController = require('./controllers/nagsController');
const choresController = require('./controllers/choresController');

const app = express();

MongoClient.connect('mongodb://mongo:27017/nagapp', async (err, client) => {
	if (err) return console.log(err);

  Db.setDatabase(client);

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(fileUpload({ limits: { fileSize: 50*1024*1024 }}));

  userController(app);
  nagsController(app);
  choresController(app);

  app.listen(3000, () => {
    console.log('listening on 3000');
  });
});
