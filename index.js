const Discord = require("discord.js");
const client = new Discord.Client();
const { cuchan } = require('./config.js')
const fs = require('fs');
const { prefix } = require('./config.js');
client.db = require("quick.db");
client.request = new (require("rss-parser"))();
client.config = require("./config.js");

client.on("ready", () => {
  client.user.setActivity(`!추천영상을 입력해 으악의 추천영상을 시청하세요.`, { type: "WATCHING"})
    console.log("I'm ready!");
    handleUploads();
});
client.on('message', message => {
	if (message.content === '으악') {
		message.react('861498718720753664');
	}
});

  client.on('message', (message) => {
    if (message.author.bot) return;
    if (message.content == `${prefix}추천영상`) {
      let replies = JSON.parse(fs.readFileSync('./replies.js', 'utf8'));
      let reply = randomItem(replies);//${cuchan}${reply}
      let embed = new Discord.MessageEmbed() //embed
      .setTitle(`${cuchan}`)
      .setURL(`${reply}`)
      message.channel.send(embed);
    }
  });

  function randomItem(array) {
    return array[Math.floor(Math.random()*array.length)];
  }



function handleUploads() {
    if (client.db.fetch(`postedVideos`) === null) client.db.set(`postedVideos`, []);
    setInterval(() => {
        client.request.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${client.config.channel_id}`)
        .then(data => {
            if (client.db.fetch(`postedVideos`).includes(data.items[0].link)) return;
            else {
                client.db.set(`videoData`, data.items[0]);
                client.db.push("postedVideos", data.items[0].link);
                let parsed = client.db.fetch(`videoData`);
                let channel = client.channels.cache.get(client.config.channel);
                if (!channel) return;
                let message = client.config.messageTemplate
                    .replace(/{author}/g, parsed.author)
                    .replace(/{title}/g, Discord.Util.escapeMarkdown(parsed.title))
                    .replace(/{url}/g, parsed.link);
                channel.send(message);
            }
        });
    }, client.config.watchInterval);
}

client.login(process.env.token);
