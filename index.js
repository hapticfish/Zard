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

const { pool } = require('./database/index'); // ensure the path is correct
const fs = require('fs');
const {initAlerts} = require("./services/websocketService");
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles){
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command); /*change   client.commands.set(command.data.name, command);  */
    console.log(`Loading command ${command.name}`);
}

client.once('ready', async () => {
    console.log('Ready!');
    try {
        // Verify database connection before initializing alerts
        const res = await pool.query('SELECT NOW()'); // Simple query to check database responsiveness
        console.log('Database connection time:', res.rows[0].now);
        await initAlerts();
        console.log('Alerts initialized successfully.');
    } catch (error) {
        console.error('Failed to initialize alerts or database error:', error);
    }

});


client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});


// client.on('messageCreate', message => {
//     if (!message.content.startsWith('!') || message.author.bot) return;
//
//     const args = message.content.slice(1).trim().split(/ +/);
//     const commandName = args.shift().toLowerCase();
//
//     if (!client.commands.has(commandName)) return;
//
//     const command = client.commands.get(commandName);
//
//     try {
//         command.execute(message, args);
//     } catch (error) {
//         console.error(error);
//         message.reply('There was an error executing that command.');
//     }
// });

//todo CREATE USER PROFILES TO WORK WITH PROMPT FOR MODELS feedback and bug ect.


client.login(process.env.DISCORD_TOKEN);