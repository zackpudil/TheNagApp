const {
  ToadScheduler,
  SimpleIntervalJob,
  AsyncTask
} = require('toad-scheduler');
const Db = require('../utils/db');
const {
  notifyEverybody,
  notifyUserAndNaggers
} = require('../utils/notifications');


const createChores = async (chores) => {
  console.log(chores);

  for(const chore of chores) {
    const date = new Date();
    if (chore.dateNagCreated === `${date.getDate()}-${date.getDay()}`) {
      console.log(`Chore's nag as already been created ${date}`);
      continue;
    }

    const nag = await Db.nags().findOne({ choreId: chore._id });
    if (nag) {
      console.log(`Found ${nag._id} for chore ${chore.nagTitle}`);
      continue;
    }

    console.log(`Creating nag from chore ${chore.nagTitle}`);
    await Db.nags().insertOne({
      choreId: chore._id,
      choreImage: Math.floor(Math.random()*3.4) + 1,
      title: chore.nagTitle,
      isAssigned: chore.isAssigned,
      assingedToName: chore.assignedToName,
      assignedToDeviceToken: chore.assignedToDeviceToken,
    });

    console.log(`Updating chore ${chore._id} to current date`);
    await Db.chores().updateOne(
      {
        _id: chore._id
      },
      {
        $set: {
          dateNagCreated: `${date.getDate()}-${date.getDay()}`
        }
      }
    );

    if (chore.isAssigned) {
      await notifyUserAndNaggers(
        chore.assignedToDeviceToken,
        `You got a ${chore.choreType} chore ${chore.nagTitle}`,
        `New ${chore.choreType} chore up for grabs (${chore.nagTitle})`
      );
    } else {
      await notifyEverybody(
        `New ${chore.choreType} chore up for grabs (${chore.nagTitle})`,
        `You got a ${chore.choreType} chore ${chore.nagTitle}`
      );
    }
  }
}

const task = new AsyncTask(
  'choreScheduler',
  async () => {
    const date = new Date();
    const dayOfMonth = date.getDate();
    const dayOfWeek = date.getDay();
    const hourOfDay = date.getHours();

    console.log(`2. Checking for Chores to create ${dayOfMonth} ${dayOfWeek} ${hourOfDay}`);

    if (dayOfMonth === 1) {
      const monthlyChores = await Db.chores().find({ choreType: 'monthly' }).toArray();
      console.log(`creating ${monthlyChores.length} monthly chores`);
      await createChores(monthlyChores);
    }

    if (dayOfWeek === 1) {
      const weeklyChores = await Db.chores().find({ choreType: 'weekly' }).toArray();
      console.log(`creating ${weeklyChores.length} weekly chores`);
      await createChores(weeklyChores);
    }

    // 3 am in real time
    if (hourOfDay === 21) {
      const dailyChores = await Db.chores().find({ choreType: 'daily' }).toArray();
      console.log(`creating ${dailyChores.length} daily chores`);
      await createChores(dailyChores);
    }
  },
  (err) => { console.error(err); }
);

const scheduler = new ToadScheduler();
const startChoreScheduler = () => {
  const job = new SimpleIntervalJob({ minutes: 30, runImmediately: false },  task, 'choreJob');
  scheduler.addSimpleIntervalJob(job);
};

module.exports = startChoreScheduler;

