## USAGE/DEPLOYMENT

### Create bot user/token
Visit https://discordapp.com/developers/applications/me and create a new Bot. Then, click "Create a Bot User" to get a user-token, which will be needed later.

### Clone repository
`git clone https://github.com/Blogshot/audio-bot.git`

### Install environment
```
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Download FFMPEG

#### Debian/Ubuntu
`apt-get install ffmpeg`

#### Alternative download/install:
Download the appropriate package from here: https://ffmpeg.org/download.html

If you're a Windows user, you'll have to [edit your environment variables](http://adaptivesamples.com/how-to-install-ffmpeg-on-windows/).

### Create a file named `stats.json`:
```
{
  "guildCount": 0
}
```

### Create a file named `config.js` and change its contents according to our needs:
```
module.exports = {
  // https://discordapp.com/developers/applications/me

  // token
  token: "<token>",

  status: "Status to display in user list",
  prefix: "!",
  invokation: "audio",
  helpText: "Bot usage:\n```\n"
  + "!audio   [options]\n"
  + "\nOptions:\n\n"
  + "  -h, --help  \tShow this message\n"
  + "  -c <channel>\tSpecify voice channel to join\n"
  + "  -f <pattern>\tSpecify sound file to play. Wildcard: *\n"
  + "  --sounds    \tList all available sound files\n"
  + "  --leave     \tForce-leave the current channel\n\n"
  + "```\n"
  + "If you need assistance or want to share feedback, contact <Owner> or join the support-discord: <Invite-Link>"
};
```

### Create a file named `package.json` to enable npm installation
`npm init`  
and then  
`npm install discord.js node-opus --save`

### Drop the desired files (MP3) into the audio-folder
Rename the MP3s to lowercase with `rename 'y/A-Z/a-z/' * `

### Start the bot

#### Without sharding
`node bot.js`

#### With sharding
`node sharder.js`
