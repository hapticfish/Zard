async function loadFetch() {
    console.log('Dynamically importing fetch module...');
    const { default: fetch } = await import('node-fetch');
    console.log('Fetch module imported successfully.');
    return fetch;
}

module.exports = {
    name: 'blockT',
    execute: async (message, args) => {
        console.log(`[START] Execute function triggered.`);
        console.log(`Message received: ${message.content}`);
        console.log('!blockT command received');
        console.log('User Args: ' + args.join(', ')); // Modify to log all args

        if (!args.length) {
            console.log('Error: No arguments provided. Sending message to channel...');
            return message.channel.send('You need to provide the ticker symbol of the cryptocurrency.');
        }

        console.log('Attempting to load fetch module dynamically...');
        const fetch = await loadFetch(); // Load fetch dynamically

        async function fetchLast10BlocksAndCalculateAverageBlockTime() {
            const timeInMillis = Date.now(); // Current time in milliseconds
            const url = `https://blockchain.info/blocks/${timeInMillis}?format=json`;
            console.log(`Fetching last 10 blocks from: ${url}`);

            try {
                const response = await fetch(url);
                console.log(`Received response from API. HTTP status: ${response.status}`);
                const data = await response.json();

                if (data && data.blocks && data.blocks.length > 0) {
                    console.log('Blocks data found. Length:', data.blocks.length);
                    const blocks = data.blocks.slice(0, 10); // Assuming the API returns the latest blocks first

                    let totalBlockTime = 0;
                    for (let i = 0; i < blocks.length - 1; i++) {
                        console.log(`Calculating time difference for block: ${blocks[i].height}`);
                        totalBlockTime += blocks[i].time - blocks[i + 1].time;
                    }

                    const averageBlockTime = totalBlockTime / (blocks.length - 1);
                    const hours = Math.floor(averageBlockTime / 3600);
                    const minutes = Math.floor((averageBlockTime % 3600) / 60);
                    const seconds = Math.floor(averageBlockTime % 60);

                    // Format the time in HH:MM:SS
                    const formattedTime = [
                        hours.toString().padStart(2, '0'),
                        minutes.toString().padStart(2, '0'),
                        seconds.toString().padStart(2, '0')
                    ].join(':');

                    console.log(`Calculated average time: ${formattedTime}. Sending response...`);
                    return message.channel.send(`Average Block Completion Time (HH:MM:SS): ${formattedTime}`).then(() => console.log('Response sent to message successfully.')).catch(err => console.error('Failed to send reply:', err));
                } else {
                    console.log('No valid blocks data found. Most likely an error with the provided response.');
                    return message.channel.send("No valid block data found.");
                }
            } catch (error) {
                console.error('Error occurred while fetching block data:', error);
                return message.channel.send("Failed to fetch block data.");
            }
        }

        fetchLast10BlocksAndCalculateAverageBlockTime().then(() => console.log('[COMPLETE] Execution of command complete.')).catch(error => console.error('Error during execution:', error));
    }
};