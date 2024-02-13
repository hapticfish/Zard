const { Client, GatewayIntentBits } = require('discord.js');
// const fetch = require('node-fetch');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const token = 'MTIwNjc1NzA0Njg5NzM0NDU4Mg.GeqET0.mf9lGg35X_yIppqu1aMb0jxF7Y3hPKHlu8g-3A'
const moment = require('moment-timezone');


client.once('ready', () => {
    console.log('Ready!');
});

client.on('messageCreate', message => {
    console.log(`Message received: ${message.content}`); // Log every message received to debug
    if(message.content === '!ping') {
        console.log('!ping command received'); // Confirm command is detected
        message.channel.send('Pong!')
            .then(() => console.log('Replied with Pong!'))
            .catch(console.error); // Log any errors in sending the message
    }
    if(message.content === '!hello' || '!help') {
        console.log('!hello received!'); // Confirm command is detected
        // Send a DM to the user with the commands menu
        const commandsMenu = `
Hello! I am your guide for all things crypto in this dangerous and strange world! Here are some commands you can use:

1. **!price <crypto_symbol>**
   - *Description*: Search price by cryptocurrency symbol.
   - *Example*: \`!price BTC\`

2. **!MO**
   - *Description*: Shows market open times for your local time.
   - *Example*: \`!MO\`

3. **!convert <amount> <from_crypto> <to_crypto>**
   - *Description*: Converts an amount from one cryptocurrency to another.
   - *Example*: \`!convert 100 BTC ETH\`

4. **!portfolio**
   - *Description*: Displays your current cryptocurrency portfolio.
   - *Example*: \`!portfolio\`

5. **!alert <crypto_symbol> <target_price>**
   - *Description*: Sets a price alert for a cryptocurrency.
   - *Example*: \`!alert BTC 50000\`

What can I help you with today, Traveler?
        `;
        message.author.send(commandsMenu)
            .then(() => console.log('Sent commands menu to user via DM.'))
            .catch(console.error); // Log any errors in sending the message

        // Optionally, confirm in the channel that a DM has been sent
        if (message.channel.type === 'GUILD_TEXT') { // Check if the message is from a server text channel
            message.reply('I\'ve sent you a DM with all the commands! 📬')
                .catch(console.error); // Log any errors in replying to the message
        }
    }
});


client.login(token);