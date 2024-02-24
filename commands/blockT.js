async function loadFetch() {
    console.log('Dynamically importing fetch module...');
    const { default: fetch } = await import('node-fetch');
    console.log('Fetch module imported successfully.');
    return fetch;
}

module.exports = {
    name: 'blockt',
    execute: async (message, args) => {
        console.log(`[START] Execute function triggered.`);
        console.log(`Message received: ${message.content}`);
        console.log('!blockT command received');
        console.log('User Args: ' + args.join(', ')); // Modify to log all args

        if (!args.length) {
            console.log('Error: No arguments provided. Sending message to channel...');
            return message.channel.send('You need to provide the ticker symbol of the cryptocurrency.');
        }

        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            // Application specific logging, throwing an error, or other logic here
        });

        const currentTimestamp = new Date().getTime();

        const baseUrl = 'https://blockchain.info/blocks/';
        const format = '?format=json';

// Combine the URL with the current timestamp and format
        const url = `${baseUrl}${currentTimestamp}${format}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(blocks => {
                console.log('Blocks Data:', blocks);

                if (blocks.length >= 10) {
                    // Take the last 10 blocks
                    const last10Blocks = blocks.slice(0, 10);
                    let totalCompletionTime = 0;

                    // Calculate the total completion time of the last 10 blocks
                    for (let i = 0; i < last10Blocks.length - 1; i++) {
                        totalCompletionTime += last10Blocks[i].time - last10Blocks[i + 1].time;
                    }

                    // Calculate the average completion time
                    const averageCompletionTimeInSeconds = totalCompletionTime / (last10Blocks.length - 1);
                    const averageMinutes = Math.floor(averageCompletionTimeInSeconds / 60);
                    const averageSeconds = averageCompletionTimeInSeconds % 60;

                    message.channel.send(`Average Completion Time for the last 10 blocks: ${averageMinutes} minutes and ${averageSeconds.toFixed(0)} seconds`);

                    // Calculate and display the completion times for the last 3 blocks
                    message.channel.send('Completion Times for the Last 3 Blocks:');
                    for (let i = 0; i < 3; i++) { // Only iterate through the first 3 of the last 3 blocks for comparison
                        const completionTimeInSeconds = blocks[i].time - blocks[i + 1].time;
                        const minutes = Math.floor(completionTimeInSeconds / 60);
                        const seconds = completionTimeInSeconds % 60;
                        message.channel.send(`Block ${blocks[i].height} to Block ${blocks[i + 1].height}: ${minutes} minutes and ${seconds.toFixed(0)} seconds`);
                    }
                } else {
                    console.log('Not enough blocks to calculate an average completion time or completion times for the last 3 blocks.');
                }
            })
            .catch(e => console.log('Error:', e));


    }//end execute
};