const config = require('./config.js');
const Discord = require('discord.js');
const feedback = require('./util/feedback');
const logger = require('./util/logger')
const fs = require('fs');

const client = new Discord.Client();
const token = config.token;

// set listeners
setListeners(client);

// log our bot in
client.login(token);

function setListeners(client) {

    client.on('ready', () => {
        logger.log("Ready!");

        // wait 10 seconds after ready to ensure readiness and set status
        setTimeout(function () {
            logger.log("Status set");
            client.user.setStatus('online');
            client.user.setGame(config.status);
        }, 10000);

    });

    client.on("disconnect", closeevent => {
        logger.log("Disconnected with code " + closeevent.code + " (" + closeevent.reason + ")!");

        if (closeevent.code != 4005) {
            logger.log("Reconnecting automatically...");
            client.destroy().then(() => client.login(token))
        }
    });

    // create listener for messages
    client.on('message', message => {
        handleMessage(message);
    });

}

function handleMessage(message) {
    var content = message.content.toLowerCase();
    var textChannel = message.channel;
    var guild = message.guild;

    logger.log("  Handling message: '" + content + "'")

    if (!content.startsWith(config.prefix + config.invokation)) {
        return;
    }

    var options = new Object();

    // default, will be overwritten by argument if needed
    options.voiceChannel = message.member.voiceChannel;
    options.play = true;
    options.file = getRandomAudio();
    
    // has arguments?
    content = content.replace(config.prefix + config.invokation, "").trim();

    if (content != "") {
        var argumentParser = require("./util/argumentParser");
        argumentParser.parse(options, client, content, guild);
    }

    if (options.leave) {
        var voiceConnection = client.voiceConnections.get(guild.id);

        if (voiceConnection) {
            voiceConnection.disconnect();
            voiceConnection.channel.leave();
        }
    }

    var isBusy = isBusyInGuild(guild);

    if (isBusy) {
        options.message = "I am currently needed in Channel '" + isBusy.name + "'."
        options.play = false;
    }

    if (options.play) {
        if (options.voiceChannel) {

            playAudio(options.voiceChannel, options.file, textChannel);
        } else {
            options.message = "You have to be in a voice channel to do this.";
        }
    }

    if (options.message) {
        feedback.writeMessage(textChannel, options.message);
    }

}

function isBusyInGuild(guild) {

    var connections = Array.from(client.voiceConnections.values());

    for (i = 0; i < connections.length; i++) {
        var connection = connections[i];

        if (connection.channel.guild == guild) {
            return connection.channel;
        }
    }
    return false;
}

function playAudio(voiceChannel, file, textChannel) {

    // check for permissions first
    if (!voiceChannel.permissionsFor(client.user.id).hasPermission("CONNECT")) {
        feedback.writeMessage(textChannel, "No permission to join this channel.")
        return;
    };
    if (!voiceChannel.permissionsFor(client.user.id).hasPermission("SPEAK")) {
        feedback.writeMessage(textChannel, "No permission to speak in this channel.")
        return;
    };

    voiceChannel.join().then(connection => {

        connection.playFile(file).on("end", () => {
            connection.disconnect();
            voiceChannel.leave();

            writeStats();
        });

    }).catch(error => {
        feedback.writeMessage(textChannel, error.toString());
    });
}

function getRandomAudio() {

    var fs = require('fs');
    var files = fs.readdirSync("./audio");

    var index = Math.floor(Math.random() * (files.length));

    return "./audio/" + files[index];
}

var lastWrite;
function writeStats() {

    client.shard.fetchClientValues('guilds.size').then(results => {
        // return if lastWrite was less than 5secs
        if ((Date.now() - lastWrite) < 5000) {
            return;
        }

        var guildSum = 0;
        for (var i = 0; i < results.length; i++) {
            guildSum += results[i];
        }

        // Set current time    
        lastWrite = Date.now();

        // write current stats
        var fileName = './stats.json';
        var file = require(fileName);

        file.guildCount = guildSum;
        file.shards = results.length;

        fs.writeFile(
            fileName,
            JSON.stringify(file, null, 2),
            function (error) {
                if (error) return logger.log(error);
            }
        );
    }).catch(console.error);
}
