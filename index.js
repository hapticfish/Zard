require('dotenv').config();
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});


const fs = require('fs');
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles){
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
    console.log(`Loading command ${command.name}`);
}

client.once('ready', () => {
    console.log('Ready!');
});

client.on('messageCreate', message => {
    if (!message.content.startsWith('!') || message.author.bot) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!client.commands.has(commandName)) return;

    const command = client.commands.get(commandName);

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('There was an error executing that command.');
    }
});

client.login(process.env.DISCORD_TOKEN);