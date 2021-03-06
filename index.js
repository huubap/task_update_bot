const SlackBot = require('slackbots');
const axios = require('axios');

const bot = new SlackBot({
  token: 'xoxb-1160973993026-1154923438406-04DatVszG88ktjCFsEwKnEVw',
  name: 'Task Update Bot'
});

const OHAYO = 'Ohayo';
const CHECKOUT = 'Checkout';
const YES = 'YES';

const CHANNEL_GENERAL = 'general';
const CHANNEL_TASK_UPDATE = 'huubap_task_update';

const MSG_1 = 'Hello';
const MSG_2 = ' Good morning!!! , Let\'s start your task update.';
const MSG_3 = '*What task have you done on previous working day?*';
const MSG_4 = '*What task will you take on today?*';
const MSG_5 = '*Any blockers/roadblocks?*';
const MSG_6 = 'Thanks for the input, below is the summary:';

const MSG_8 = 'What I worked on previous working day:';
const MSG_9 = 'What task I take today:';
const MSG_10 = 'Blockers/Roadblocks:';
const MSG_11 = 'are you on leave tomorrow? Type \'YES\' or \'NO\'';

let channels = [];
let users = [];
let tasks = [];

// Start Handler
bot.on('start', () => {

  bot.getChannels().then(result => {
    console.log('Channels...!!!');
    channels = result;
  });

  bot.getUsers().then(result => {
    console.log('Users...!!!');
    users = result.members;
  });

  postToChannel(CHANNEL_GENERAL, 'task_update_bot started...!!!');
});

// Error Handler
bot.on('error', err => console.log(err));

// Open connection
bot.on('open', () => console.log('Socket Opened...!!!'));

// Close connection
bot.on('close', () => console.log('Socket Closed...!!!'));

// Message Handler
bot.on('message', data => {
  console.log(data);
  if (data.type !== 'message') {
    return;
  }

  handleMessage(data);
});

// Respond to Data
function handleMessage(data) {
    if (!data)
        return;

    let user = getUser(data);

    if (data.text.includes(OHAYO)) {
        let task = getUserTask(data);
        if (task) {
            reset(task);
        } else {
            task = {user_id: user.id, yesterday: -1, today: -1, blocker: -1};
            tasks.push(task);
        }
        postToUser(user.name, `${MSG_1} ${user.real_name} ${MSG_2}\n ${MSG_3}`);
    } else if (data.text.includes(CHECKOUT)) {
        postToUser(user.name, `${MSG_1} ${user.real_name} ${MSG_11}`);
    }
    else if (data.text.includes(YES)) {
        let summary = getLeaveSummary(user);
        postToChannel(CHANNEL_TASK_UPDATE, "*Attention !!!*", summary);
    }
    else if (getUserTask(data)) {
        let task = getUserTask(data);
        if (task.yesterday === -1) {
            task.yesterday = data.text;
            postToUser(user.name, MSG_4);
        } else if (task.today === -1) {
            task.today = data.text;
            postToUser(user.name, MSG_5);
        } else if (task.blocker === -1) {
            task.blocker = data.text;
            postToUser(user.name, MSG_6);

            let yesterdayDate = getYesterdayDate();
            let summary = getTaskUpdateSummary(user, task);
            postToUser(user.name, "*[Task update on " + yesterdayDate + " ]*", summary);
            postToChannel(CHANNEL_TASK_UPDATE, "*[Task update on " + yesterdayDate + " ]*", summary);
        }
    }
}

function reset(task) {
  if (!task)
    return;
  task.yesterday = -1;
  task.today = -1;
  task.blocker = -1;
}

function getUser(data) {
  return users.find(item => item.id === data.user);
}

function getUserTask(data) {
  return tasks.find(item => item.user_id === data.user);
}

function postToUser(userChannel, message, params) {
  bot.postMessageToUser(userChannel, message, params);
}

function postToChannel(channel, message, params) {
  bot.postMessageToChannel(channel, message, params);
}

function getYesterdayDate() {
    var options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    var today = new Date();
    today.setDate(today.getDate() - 1);
    var dateString = today.toLocaleDateString("en-US", options)
    return dateString;
}

function getTaskUpdateSummary(user, task) {

    let authorName = user.real_name;
    let yesterdayTask = task.yesterday;
    let todayTask = task.today;
    let blockers = task.blocker;
    let profileIconURL = user.profile.image_24;

    var messageSummary = {
        "icon_emoji": ":taskupdatebot:",
        "attachments": [{
            "mrkdwn_in": ["text"],
            "color": "#36a64f",
            "author_name": "" + authorName + "",
            "author_icon": "" + profileIconURL + "",
            "fields": [{
                    "title": "" + MSG_8 + "",
                    "value": "" + yesterdayTask + "",
                    "short": false
                },
                {
                    "title": "" + MSG_9 + "",
                    "value": "" + todayTask + "",
                    "short": false

                },
                {
                    "title": "" + MSG_10 + "",
                    "value": "" + blockers + "",
                    "short": true
                }
            ]
        }]
    };
    return messageSummary;
}

function getLeaveSummary(user) {
    let authorName = user.real_name;
    let profileIconURL = user.profile.image_24;

    var messageSummary = {
        "icon_emoji": ":taskupdatebot:",
        "attachments": [{
            "mrkdwn_in": ["text"],
            "color": "#a64648",
            "author_name": "" + authorName + "",
            "author_icon":  "" + profileIconURL + "",
            "fields": [{
                "title": "I'll be on leave tomorrow",
                "value": "",
                "short": false
            }
            ]
        }]
    };
    return messageSummary;
}
