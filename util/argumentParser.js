// tools.js
// ========
module.exports = {
    parse: function (options, client, argumentString, guild) {

        var feedback = require('./feedback');
        var config = require('../config');

        var argumentList = getArguments(argumentString);

        for (a = 0; a < argumentList.length; a++) {

            var argument = argumentList[a].trim();

            // help-message
            if (argument == "--help" || argument == "-h") {

                /*
                print help and exit
                 */
                options.message = config.helpText;
                options.play = false;

                /*
                custom channel
                 */
            } else if (argument.startsWith("--channel ") || argument.startsWith("-c ")) {

                var value = argument.substring(argument.indexOf(" ") + 1);
                var found = false;

                var channels = Array.from(guild.channels.values());

                // iterate through available channels to find the specified channel
                for (i = 0; i < channels.length; i++) {

                    var channel = channels[i];

                    if (channel.type == "voice" && channel.name.toLowerCase() == value) {
                        options.voiceChannel = channel;
                        options.play = true;
                        found = true;
                        break;
                    }

                }

                /*
                if no channel was found
                 */
                if (!found) {

                    // invalid channel, report and exit
                    options.message = "I could not find the voice-channel you specified. Select one of the following:\n"
                        + getVoiceChannelList(channels);
                    options.play = false;
                }

                /*
                custom sound file
                 */
            } else if (argument.startsWith("--file ") || argument.startsWith("-f ")) {

                var value = argument.substring(argument.indexOf(" ") + 1);

                // get list of matching files
                var candidates = getAudio(value);

                if (candidates.length == 0) {

                    // no match found, cant continue. report and exit
                    options.message = "I could not find a filename matching the pattern you specified.";
                    options.play = false;
                } else if (candidates.length > 1) {

                    // multiple matches
                    options.message = "I found multiple audios matching your pattern. Please select one of the following:\n\n"
                        + candidates.join("\n");
                    options.play = false;

                } else {

                    // set the only match as desired audio
                    options.file = candidates[0];
                    options.play = true;
                }

                /*
                 list all sounds
                */
            } else if (argument == "--sounds") {

                //feedback.printSounds(client, textChannel);
                options.message = getSounds();
                options.play = false;

                /*
                 print stats to channel
                */
            } else if (argument == "--leave") {
                options.leave = true;
                options.play = false;
            } else {
                // unknown argument, print help and exit
                options.message = "You entered an unknown argument.";
                options.play = false;
            }
        }

        return JSON.stringify(options);
    }

};

function getArguments(argumentString) {

    argumentString = argumentString.split(" -").join(" --").split(" -");

    return argumentString;
}

function getVoiceChannelList(channels) {

    var voiceChannels = "";

    for (i = 0; i < channels.length; i++) {

        var channel = channels[i];

        if (channel.type == "voice") {
            voiceChannels += channel.name + "\n";
        }

    }

    return voiceChannels.trim();

}

function getAudio(pattern) {

    var fs = require('fs');

    var folder = "./audio";
    var files = fs.readdirSync(folder);

    var candidates = [];
    // "^.*" + pattern + ".*";
    var regex = "^" + pattern.split("*").join(".*");

    // iterate through available files to find matching ones
    for (i = 0; i < files.length; i++) {

        var file = files[i];

        // get matches
        if (file.match(regex)) {
            // add matched file
            candidates.push(folder + "/" + file);
        }
    }

    return candidates;
}

function getSounds() {

    var fs = require('fs');
    var folder = "./audio";
    var files = fs.readdirSync(folder);

    return files.join("\n");
}
