
module.exports = {
    name: 'sig',
    execute(message, args) {
        console.log(`Message received: ${message.content}`);
        console.log('!sig command received'); // Confirm command is detected


    }
}