module.exports = {
    name: 'hello',
    execute(message, args) {

        if(message.content === '!hello') {
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

4. **!alert <crypto_symbol> <target_price>**
   - *Description*: Sets a price alert for a cryptocurrency.
   - *Example*: \`!alert BTC 50000\`
   
5. **!fee <crypto_symbol>**
   - *Description*: Displays current blockchain completions fee values.
   - *Example*: \`!fee btc\`
   
6. **!blockt <crypto_symbol>**
- *Description*: Displays the current estimated block time completion. Average and last 3 blocks.
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


    },
};