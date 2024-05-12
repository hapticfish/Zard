
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, SlashCommandBuilder} = require('discord.js');
const userModel = require("../database/userModel");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-profile')
        .setDescription('Create User Profile.'),

    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('createUserProfile')
            .setTitle('User Profile Information');

        // Create text input components for each field
        const timeZoneInput = new TextInputBuilder()
            .setCustomId('time_zone')
            .setLabel('Your Time Zone (e.g., America/New_York)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const emailInput = new TextInputBuilder()
            .setCustomId('email')
            .setLabel('Your Email Address')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const mobileNumberInput = new TextInputBuilder()
            .setCustomId('mobile_number')
            .setLabel('Your Mobile Number')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const investmentProfileInput = new TextInputBuilder()
            .setCustomId('investment_profile')
            .setLabel('Your Investment Profile (e.g., Conservative, Aggressive)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const riskToleranceInput = new TextInputBuilder()
            .setCustomId('risk_tolerance')
            .setLabel('Your Risk Tolerance (e.g., Low, Medium, High)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const favoriteCryptocurrenciesInput = new TextInputBuilder()
            .setCustomId('favorite_cryptocurrencies')
            .setLabel('Your Favorite Cryptocurrencies (e.g., BTC, ETH)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        // Add inputs to modal
        modal.addComponents(
            new ActionRowBuilder().addComponents(timeZoneInput),
            new ActionRowBuilder().addComponents(emailInput),
            new ActionRowBuilder().addComponents(mobileNumberInput),
            new ActionRowBuilder().addComponents(investmentProfileInput),
            new ActionRowBuilder().addComponents(riskToleranceInput),
            new ActionRowBuilder().addComponents(favoriteCryptocurrenciesInput)
        );

        // Show the modal to the user
        await interaction.showModal(modal);
    },

    async modalSubmit(modalInteraction) {
        if (modalInteraction.customId !== 'createUserProfile') return;

        // Extract user-provided data from the modal
        const timeZone = modalInteraction.fields.getTextInputValue('time_zone');
        const email = modalInteraction.fields.getTextInputValue('email');
        const mobileNumber = modalInteraction.fields.getTextInputValue('mobile_number');
        const investmentProfile = modalInteraction.fields.getTextInputValue('investment_profile');
        const riskTolerance = modalInteraction.fields.getTextInputValue('risk_tolerance');
        const favoriteCryptocurrencies = modalInteraction.fields.getTextInputValue('favorite_cryptocurrencies');

        // Construct the user profile data object with only the data provided by user input
        const userData = {
            time_zone: timeZone,
            email: email,
            mobile_number: mobileNumber,
            investment_profile: investmentProfile,
            risk_tolerance: riskTolerance,
            favorite_cryptocurrencies: favoriteCryptocurrencies,
        };

        // Call the upsertUserProfile to write data to the database
        try {
            await userModel.upsertUserProfile(modalInteraction, userData);
            await modalInteraction.reply({ content: 'Your profile has been successfully updated!', ephemeral: true });
        } catch (error) {
            console.error('Error updating user profile:', error);
            await modalInteraction.reply({ content: 'Failed to update your profile. Please try again later.', ephemeral: true });
        }
    }


}

//todo submit the new slash command to discord.


