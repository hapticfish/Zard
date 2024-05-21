
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, SlashCommandBuilder} = require('discord.js');
const userModel = require("../database/userModel");
const {updateLastBotInteraction} = require("../database/databaseUtil");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-profile')
        .setDescription('Create User Profile.'),

    async execute(interaction) {
        await updateLastBotInteraction(interaction.user.id);
        console.log('Executing command to create profile...');

        try {
            const commandId = interaction.commandId;
            const commandName = interaction.commandName;
            const startTime = Date.now();

            console.log(`createUserProfile_${commandId}_${commandName}_${startTime}`);
            // Ensure all parts are included in the custom ID
            const customId = `createUserProfile_${commandId}_${commandName}_${startTime}`;

            const modal = new ModalBuilder()
                .setCustomId(customId)
                .setTitle('Create User Profile');

            // Create text input components for each field
            const timeZoneInput = new TextInputBuilder()
                .setCustomId('time_zone')
                .setLabel('Time Zone TZ format (America/New_York)')
                .setPlaceholder('America/Chicago')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const emailInput = new TextInputBuilder()
                .setCustomId('email')
                .setLabel('Your Email Address')
                .setPlaceholder('lizards@gmail.com')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const mobileNumberInput = new TextInputBuilder()
                .setCustomId('mobile_number')
                .setLabel('Mobile Number')
                .setPlaceholder('1234567899')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const investmentProfileInput = new TextInputBuilder()
                .setCustomId('investment_profile')
                .setLabel('Investment Profile (Consrv, Aggrsv)')
                .setPlaceholder('Aggressive')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const riskToleranceInput = new TextInputBuilder()
                .setCustomId('risk_tolerance')
                .setLabel('Risk Tolerance (Low, Medium, High)')
                .setPlaceholder('High')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const favoriteCryptocurrenciesInput = new TextInputBuilder()
                .setCustomId('favorite_cryptocurrencies')
                .setLabel('Favorite Cryptocurrencies (BTC, ETH)')
                .setPlaceholder('BTC')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(timeZoneInput),
                new ActionRowBuilder().addComponents(emailInput),
                new ActionRowBuilder().addComponents(mobileNumberInput),
                new ActionRowBuilder().addComponents(investmentProfileInput),
                new ActionRowBuilder().addComponents(riskToleranceInput),
                /*new ActionRowBuilder().addComponents(favoriteCryptocurrenciesInput)*/
            );

            // Show the modal to the user
            await interaction.showModal(modal);
        } catch (error) {
            console.error('Failed to execute create-profile command:', error);
            await interaction.reply({content: 'Failed to open the profile creation modal.', ephemeral: true});
        }
    },

};


