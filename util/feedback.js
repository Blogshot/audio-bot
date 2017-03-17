module.exports = {

  writeMessage: function (channel, text) {

    channel.sendMessage(text).catch(error => {
      // message could not be send, try to communicate using another channel
      var channels = Array.from(channel.guild.channels.values());

      // try first channel (i=0)
      checkChannel(channels,
        text + "\n\n(This message was meant to be sent to channel '"
        + channel.name + "', but I don't have permission to write there)", 0);
    });
  }
  
}

function checkChannel(channels, text, i) {

  var channel = channels[i];

  // abort if we couldn't write anywhere
  if (!channel) {
    return;
  }

  // skip any non-text channel 
  if (channel.type != "text") {
    checkChannel(channels, text, i + 1);
    return;
  }

  // send message again
  channel.sendMessage(text).catch(error => {
    // if message could not be send, try next channel
    checkChannel(channels, text, i + 1);
  });
}