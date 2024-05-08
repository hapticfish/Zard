const puppeteer = require('puppeteer');

module.exports = {
    name: 'fee',
    execute: async (message, args) => {
        console.log(`Message received: ${message.content}`);
        console.log('!fee command received');
        console.log('User Args: ' + args[0]?.toLowerCase());

        if (!args.length) {
            return message.channel.send('You need to provide the ticker symbol of the cryptocurrency.');
        }

        // Ensure the ticker is BTC since the scraping targets Bitcoin fee estimator
        if (args[0].toUpperCase() !== 'BTC') {
            return message.channel.send('This command currently only supports Bitcoin (BTC).');
        }

        try {
            const fees = await scrapeFees();
            const feeMessage = `Current Transaction Fees for Bitcoin Processed in:\n- Next Block: ${fees.nextBlock}\n- 3 Blocks: ${fees.threeBlocks}\n- 6 Blocks: ${fees.sixBlocks}`;
            message.channel.send(feeMessage);
        } catch (error) {
            console.error(error);
            message.channel.send('There was an error fetching the transaction fees.');
        }
    }
};

async function scrapeFees() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://privacypros.io/tools/bitcoin-fee-estimator/', { waitUntil: 'networkidle0' });

    const fees = await page.evaluate(() => {
        return {
            nextBlock: '$' + document.querySelector('#nbf-td > span').innerText,
            threeBlocks: '$' + document.querySelector('#tbf-td > span').innerText,
            sixBlocks: '$' + document.querySelector('#sbf-td > span').innerText,
        };
    });

    await browser.close();
    return fees;
}
