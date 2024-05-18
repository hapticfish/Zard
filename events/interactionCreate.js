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
    const [baseCustomId, commandId, commandName, startTime] = customId.split('_');


    console.log(`Handling modal submission with custom ID: ${customId}`); // Debug log
    console.log(`Parsed values: commandId=${commandId}, commandName=${commandName}, startTime=${startTime}`); // Debug log


    const commandInfo = {
        commandId: commandId || null,
        commandName: commandName || 'Unknown',
        startTime: startTime ? parseInt(startTime, 10) : Date.now()
    };


    switch (baseCustomId) {
        case 'createUserProfile':
            await handleCreateUserProfile(interaction,commandInfo, startTime);
            break;
        case 'userFeedbackModal':
            await handleUserFeedbackModal(interaction, commandInfo, startTime);
            break;
        case 'bugReportModal':
            await handleBugReportModal(interaction, commandInfo, startTime);
            break;
        default:
            console.warn('Unhandled modal submission:', customId);
            break;
    }
}

async function handleCreateUserProfile(interaction, commandInfo) {
    console.log(`Entering handleCreateUserProfile function w/${commandInfo}`); // Debug log
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
            await logUsage(interaction, false, errors.join(', '), commandInfo.startTime, commandInfo);
            return;
        }

        console.log('Data validation successful. Updating user profile...');
        await userModel.upsertUserProfile(interaction, userData);
        console.log('User profile updated successfully.');
        await interaction.editReply({ content: 'Your profile has been successfully updated!' });

        // Log successful command usage
        await logUsage(interaction, true, null, commandInfo.startTime, commandInfo);
    } catch (error) {
        console.error('Error during modal submission handling:', error);
        await interaction.editReply({ content: 'Failed to update your profile. Please try again later.' });

        // Log failed command usage
        await logUsage(interaction, false, error.message, commandInfo.startTime, commandInfo);
    }
}

async function handleUserFeedbackModal(interaction, commandInfo) {
    console.log(`Entering handleUserFeedbackModal function w/${commandInfo}`); // Debug log
    try {
        await interaction.deferReply({ ephemeral: true });

        const userID = interaction.user.id;
        const feedbackType = interaction.fields.getTextInputValue('feedbackTypeInput');
        const content = interaction.fields.getTextInputValue('contentInput');
        let satRating = parseInt(interaction.fields.getTextInputValue('satRatingInput'), 10);

        if (isNaN(satRating)) {
            console.error('Invalid satisfaction rating:', satRating);
            satRating = 0; // Set a default value or handle appropriately
        }

        const responseNeeded = interaction.fields.getTextInputValue('responseNeededInput') === 'Yes';

        await reportingModel.writeUserFeedback(userID, feedbackType, satRating, content, responseNeeded, interaction);
        await interaction.editReply({ content: 'Thank you for your feedback!', ephemeral: true });

        // Log successful modal submission
        await logUsage(interaction, true, null, commandInfo.startTime, commandInfo);

    } catch (error) {
        console.error('Error handling feedback submission:', error);
        await interaction.editReply({ content: 'Failed to submit your feedback. Please try again later.', ephemeral: true });

        // Log failed modal submission
        await logUsage(interaction, false, error.message, commandInfo.startTime, commandInfo);
    }
}

async function handleBugReportModal(interaction, commandInfo) {
    console.log(`Entering handleBugReportModal function w/${commandInfo}`); // Debug log
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
        await logUsage(interaction, true, null, commandInfo.startTime, commandInfo);

    } catch (error) {
        console.error('Error handling bug report submission:', error);
        await interaction.editReply({ content: 'Failed to submit your bug report. Please try again later.', ephemeral: true });

        // Log failed modal submission
        await logUsage(interaction, false, error.message, commandInfo.startTime, commandInfo);

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


//todo Still reciving this error Trace back where command name is coming from WHY IS IT NULL!!
//todo need to find a way to grab the command name why is it Null!!

//todo This is whats being inserted into the table detail: 'Failing row contains (14, 211232814702657536, null, null, 2024-05-15 00:57:34.051, 1009641408040292352, 1009641408040292355, [{"value":
// "Complaint","type":4,"customId":"feedbackTypeInput"},{..., t, null, 935, No description available).',

/*Feedback submitted successfully
Command usage logged: UserID - 211232814702657536, CommandName - null
Database insertion error: error: null value in column "commandid" of relation "commandusage_2024" violates not-null constraint
    at C:\Users\John\Desktop\PersonalDevProjs\discordbot\node_modules\pg\lib\client.js:526:17
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async logCommandUsage (C:\Users\John\Desktop\PersonalDevProjs\discordbot\database\commandUsageModel.js:39:13)
    at async logUsage (C:\Users\John\Desktop\PersonalDevProjs\discordbot\utils\writeLogUsageHelper.js:26:5)
    at async handleUserFeedbackModal (C:\Users\John\Desktop\PersonalDevProjs\discordbot\events\interactionCreate.js:107:9)
    at async handleModalSubmit (C:\Users\John\Desktop\PersonalDevProjs\discordbot\events\interactionCreate.js:33:13)
    at async Object.execute (C:\Users\John\Desktop\PersonalDevProjs\discordbot\events\interactionCreate.js:12:13) {
  length: 430,
  severity: 'ERROR',
  code: '23502',
  detail: 'Failing row contains (14, 211232814702657536, null, null, 2024-05-15 00:57:34.051, 1009641408040292352, 1009641408040292355, [{"value":
"Complaint","type":4,"customId":"feedbackTypeInput"},{..., t, null, 935, No description available).',
  hint: undefined,
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: 'public',
  table: 'commandusage_2024',
  column: 'commandid',
  dataType: undefined,
  constraint: undefined,
  file: 'execMain.c',
  line: '2009',
  routine: 'ExecConstraints'
}
*/