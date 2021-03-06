const Botkit = require('botkit');
const got = require('got');
const rand = require('lodash/random');

const controller = Botkit.slackbot({
  debug: false,
});

controller.spawn({
  token: process.env.token
}).startRTM((err) => {
  if (err) {
    throw new Error(err);
  }
});

controller.on('rtm_close', () => {
  process.exit(1);
});

controller.hears(
  ['^[dD]efine (.*)'],
  ['ambient', 'direct_message'],
  (bot, message) => {
    got(`https://mashape-community-urban-dictionary.p.rapidapi.com/define?term=${message.match[1]}`, {
      json: true,
      headers: {
        'X-Mashape-Key': process.env.mashape
      }
    }).then((response) => {
      const definitions = response.body.list;
      if (definitions.length > 0) {
        bot.reply(message, `*${definitions[0].word}*:\n${definitions[0].definition}`)
      } else {
        bot.reply(message, 'Word not found, sorry guy');
      }
    }).catch(() => {
      bot.reply(message, 'Oh noooooo, I fucked up');
    });
  }
);

controller.hears(
  ['[sS][hH][aA][rR][lL][eE][eE][nN]'],
  ['ambient', 'direct_message'],
  (bot, message) => {
    got(`https://andruxnet-random-famous-quotes.p.rapidapi.com/cat=movies`, {
      json: true,
      headers: {
        'X-Mashape-Key': process.env.mashape
      }
    }).then((response) => {
      bot.reply(message, response.body[0].quote);
    }).catch(() => {
      bot.reply(message, 'Oh noooooo, I fucked up')
    });
  }
);

controller.hears(
  ['^[rR]eddit (.+)'],
  ['ambient', 'direct_message'],
  (bot, message) => {
    got(`https://www.reddit.com/r/${message.match[1]}/hot.json`, {
      json: true,
      headers: {
        'X-Mashape-Key': process.env.mashape
      }
    }).then((response) => {
      if (response.body.data.children.length > 0) {
        const post = response.body.data.children[rand(response.body.data.children.length - 1)].data;

        const reply = `${post.over_18 ? 'NSFW: ' : ''}${post.title}\n${post.url}\nScore: ${post.score}\n\n${post.selftext}`;

        bot.reply(message, reply);
      }
    }).catch(() => {
      bot.reply(message, 'Couldn\'t find that subreddit guy, sorry')
    });
  }
);
