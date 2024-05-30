const { sendToKafka } = require('../kafka/kafkaProducer');

async function fetchMessagesFromChannel(client, channelId, limit = 100) {
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

async function fetchAllMessages(client) {
    const channels = client.channels.cache.filter(channel => channel.isText());
    let allMessages = [];
    for (const [channelId, channel] of channels) {
        const messages = await fetchMessagesFromChannel(client, channelId);
        allMessages = allMessages.concat(messages);
    }
    return allMessages;
}

function startMessageStream(client) {
    client.on('messageCreate', (message) => {
        if (message.channel.isText()) {
            sendToKafka('discord-messages', {
                id: message.id,
                content: message.content,
                author: message.author.username,
                createdAt: message.createdAt,
                channelId: message.channel.id,
            });
        }
    });

    client.on('channelCreate', (channel) => {
        if (channel.isText()) {
            fetchMessagesFromChannel(client, channel.id).then(messages => {
                messages.forEach(msg => {
                    sendToKafka('discord-messages', msg);
                });
            }).catch(console.error);
        }
    });
}

module.exports = { fetchAllMessages, startMessageStream };
