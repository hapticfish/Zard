module.exports = {
    name: 'hello',
    execute(message, args) {
        message.channel.send('Pong!');
    },
};