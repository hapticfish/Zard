require('dotenv').config();
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const { pool } = require('./database/index');
const {initAlerts} = require("./services/websocketService");
const express = require('express');
const app = express();
const notificationScheduler = require('./schedulers/notificationScheduler'); // Initialize the scheduler
const { fetchSentimentData, startDataStream} = require('./services/aggregator'); // Import fetchData from aggregator
const { startMessageStream } = require('./services/discord/discordAPI'); // Import startMessageStream from discordAPI

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

//load commands
for (const file of commandFiles){
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command); /*change   client.commands.set(command.data.name, command);  */
    console.log(`Loading command ${command.data.name}`);
}

// Load events
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.once('ready', async () => {
    console.log('Ready!');
    try {
        // Verify database connection before initializing alerts
        const res = await pool.query('SELECT NOW()'); // Simple query to check database responsiveness
        console.log('Database connection time:', res.rows[0].now);
        await initAlerts();
        console.log('Alerts initialized successfully.');

        // Initialize the scheduler
        notificationScheduler.init(client);
        console.log('Notification scheduler initialized successfully.');

        // Start fetching data
        startDataStream(client);
        console.log('Data fetching started successfully.');

        // Start streaming Discord messages
        startMessageStream(client);
        console.log('Discord message streaming started successfully.');
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

client.login(process.env.DISCORD_TOKEN);