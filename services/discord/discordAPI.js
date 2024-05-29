// discordAPI.js
const { sendToKafka } = require('../kafka/kafkaProducer');

async function fetchMessages(client, channelId, limit = 10) {
    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isText()) {
        throw new Error('Channel not found or not a text channel');
    }

    const messages = await channel.messages.fetch({ limit });
    return messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        author: msg.author.username,
        createdAt: msg.createdAt,
        channelId: channelId,
    }));
}

async function startMessageStream(client, channelId) {
    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isText()) {
        throw new Error('Channel not found or not a text channel');
    }

    // Fetch initial messages
    channel.messages.fetch({ limit: 10 }).then(messages => {
        messages.forEach(msg => {
            sendToKafka('discord-messages', {
                id: msg.id,
                content: msg.content,
                author: msg.author.username,
                createdAt: msg.createdAt,
                channelId: channelId,
            });
        });
    });

    // Listen to new messages
    client.on('messageCreate', (message) => {
        if (message.channel.id === channelId) {
            sendToKafka('discord-messages', {
                id: message.id,
                content: message.content,
                author: message.author.username,
                createdAt: message.createdAt,
                channelId: channelId,
            });
        }
    });
}

module.exports = { fetchMessages, startMessageStream };
