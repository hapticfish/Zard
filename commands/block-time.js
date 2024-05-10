// commands/block-time.js
async function loadFetch() {
    console.log('Dynamically importing fetch module...');
    const { default: fetch } = await import('node-fetch');
    console.log('Fetch module imported successfully.');
    return fetch;
}

const { SlashCommandBuilder } = require('@discordjs/builders');