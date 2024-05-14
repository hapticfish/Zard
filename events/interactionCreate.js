const { Events } = require('discord.js');
const userModel = require('../database/userModel');
const reportingModel = require('../database/reportingModel');
const { logCommandUsage } = require('../database/commandUsageModel');
const { logUsage } = require('../utils/writeLogUsageHelper');


module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isModalSubmit()) {
            await handleModalSubmit(interaction);
        }
    }
};

async function handleModalSubmit(interaction) {
    const customId = interaction.customId;
    const startTime = interaction.client.startTime || Date.now();

    switch (customId) {
        case 'createUserProfile':
            await handleCreateUserProfile(interaction, startTime);
            break;
        case 'userFeedbackModal':
            await handleUserFeedbackModal(interaction, startTime);
            break;
        case 'bugReportModal':
            await handleBugReportModal(interaction, startTime);
            break;
        default:
            console.warn('Unhandled modal submission:', customId);
            break;
    }
}

async function handleCreateUserProfile(interaction, startTime) {
    const commandName = 'create-profile';
    const commandId = 'createUserProfile'; // Replace with actual command ID if available


    try {
        await interaction.deferReply({ ephemeral: true });

        const userData = {
            timeZone: interaction.fields.getTextInputValue('time_zone'),
            email: interaction.fields.getTextInputValue('email'),
            mobileNumber: interaction.fields.getTextInputValue('mobile_number'),
            investmentProfile: interaction.fields.getTextInputValue('investment_profile'),
            riskTolerance: interaction.fields.getTextInputValue('risk_tolerance'),
            // favoriteCryptocurrencies: interaction.fields.getTextInputValue('favorite_cryptocurrencies')
        };

        console.log('Extracted Data:', userData);

        const errors = validateData(userData);
        if (errors.length > 0) {
            console.log('Validation errors:', errors);
            await interaction.editReply({ content: `Please correct the following errors:\n- ${errors.join('\n- ')}` });

            // Log failed command usage
            await logUsage(interaction, false, errors.join(', '), startTime);
            return;
        }

        console.log('Data validation successful. Updating user profile...');
        await userModel.upsertUserProfile(interaction, userData);
        console.log('User profile updated successfully.');
        await interaction.editReply({ content: 'Your profile has been successfully updated!' });

        // Log successful command usage
        await logUsage(interaction, true, null, startTime);
    } catch (error) {
        console.error('Error during modal submission handling:', error);
        await interaction.editReply({ content: 'Failed to update your profile. Please try again later.' });

        // Log failed command usage
        await logUsage(interaction, false, error.message, startTime);
    }
}

async function handleUserFeedbackModal(interaction, startTime) {

    try {
        await interaction.deferReply({ ephemeral: true });

        const userID = interaction.user.id;
        const feedbackType = interaction.fields.getTextInputValue('feedbackTypeInput');
        const content = interaction.fields.getTextInputValue('contentInput');
        const satRating = parseInt(interaction.fields.getTextInputValue('satRatingInput'), 10);
        const responseNeeded = interaction.fields.getTextInputValue('responseNeededInput') === 'Yes';

        await reportingModel.writeUserFeedback(userID, feedbackType, satRating, content, responseNeeded, interaction);
        await interaction.editReply({ content: 'Thank you for your feedback!', ephemeral: true });

        // Log successful modal submission
        await logUsage(interaction, true, null, startTime);

    } catch (error) {
        console.error('Error handling feedback submission:', error);
        await interaction.editReply({ content: 'Failed to submit your feedback. Please try again later.', ephemeral: true });

        // Log failed modal submission
        await logUsage(interaction, false, error.message, startTime);
    }
}

async function handleBugReportModal(interaction, startTime) {
    try {
        await interaction.deferReply({ ephemeral: true });

        const userID = interaction.user.id;
        const title = interaction.fields.getTextInputValue('titleInput');
        const description = interaction.fields.getTextInputValue('descriptionInput');
        const steps = interaction.fields.getTextInputValue('stepsInput');
        const severity = interaction.fields.getTextInputValue('severityInput');

        await reportingModel.writeBugReport(userID, title, description, steps, severity, interaction);
        await interaction.editReply({ content: 'Bug report submitted successfully!', ephemeral: true });

        // Log successful modal submission
        await logUsage(interaction, true, null, startTime);

    } catch (error) {
        console.error('Error handling bug report submission:', error);
        await interaction.editReply({ content: 'Failed to submit your bug report. Please try again later.', ephemeral: true });

        // Log failed modal submission
        await logUsage(interaction, false, error.message, startTime);

    }
}

function validateData({ timeZone, email, mobileNumber, investmentProfile, riskTolerance }) {
    let errors = [];
    if (!/^[A-Za-z_]+\/[A-Za-z_]+$/.test(timeZone)) errors.push('Time zone must be in "Continent/City" format.');
    if (!/^\S+@\S+\.\S+$/.test(email)) errors.push('Invalid email address format.');
    if (!/^[\d+]{10,15}$/.test(mobileNumber)) errors.push('Mobile number should be between 10 to 15 digits.');
    if (!['Bonds', 'Stocks', 'Crypto', 'Funds', 'Aggressive', 'Conservative', 'Moderate'].includes(investmentProfile)) errors.push('Invalid investment profile.');
    if (!['Low', 'Medium', 'High'].includes(riskTolerance)) errors.push('Invalid risk tolerance.');
    return errors;
}
