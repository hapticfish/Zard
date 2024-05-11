const { SlashCommandBuilder } = require('@discordjs/builders');
const moment = require('moment-timezone');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('market-times')
        .setDescription('Displays market open and close times across various global exchanges.')
        .addStringOption(option =>
            option.setName('timezone')
                .setDescription('Your local timezone in TZ database format (e.g., America/New_York)')
                .setRequired(false)),

    async execute(interaction) {
        const userTimezone = interaction.options.getString('timezone') || 'UTC';

        if (!moment.tz.zone(userTimezone)) {
            await interaction.reply({
                content: "The time zone format was incorrect or not provided. Please provide a valid time zone. For a list of valid TZ formatted time zones, visit https://en.wikipedia.org/wiki/List_of_tz_database_time_zones.",
                ephemeral: true
            });
            return;
        }

        const markets = [
            { name: 'New York', open: '09:30', close: '16:00', tz: 'America/New_York', abbreviation: 'EDT' },
            { name: 'London', open: '08:00', close: '16:30', tz: 'Europe/London', abbreviation: 'BST' },
            { name: 'Shanghai', open: '09:30', close: '15:00', tz: 'Asia/Shanghai', abbreviation: 'CST' },
            { name: 'Tokyo', open: '09:00', close: '15:00', tz: 'Asia/Tokyo', abbreviation: 'JST' },
            { name: 'Shenzhen', open: '09:30', close: '14:57', tz: 'Asia/Shanghai', abbreviation: 'CST' },
            { name: 'Hong Kong', open: '09:30', close: '16:00', tz: 'Asia/Hong_Kong', abbreviation: 'HKT' },
            { name: 'Seoul', open: '09:00', close: '15:30', tz: 'Asia/Seoul', abbreviation: 'KST' },
        ].map(market => {
            const now = moment().tz(userTimezone);
            const openTime = moment.tz(`${moment().format('YYYY-MM-DD')} ${market.open}`, market.tz).tz(userTimezone);
            const closeTime = moment.tz(`${moment().format('YYYY-MM-DD')} ${market.close}`, market.tz).tz(userTimezone);

            let status, timeUntilDisplay;
            if (now.isBetween(openTime, closeTime)) {
                status = 'Open';
                const duration = moment.duration(closeTime.diff(now));
                timeUntilDisplay = `Closes in ${duration.hours()} hour(s) and ${duration.minutes()} minute(s)`;
            } else {
                status = 'Closed';
                const nextOpenTime = now.isBefore(openTime) ? openTime : moment.tz(`${moment().add(1, 'days').format('YYYY-MM-DD')} ${market.open}`, market.tz).tz(userTimezone);
                const duration = moment.duration(nextOpenTime.diff(now));
                timeUntilDisplay = `Opens in ${duration.hours()} hour(s) and ${duration.minutes()} minute(s)`;
            }

            return { ...market, status, timeUntilDisplay };
        });

        let response = `Market Open and Close Times (${userTimezone}):\n\`\`\``;
        markets.forEach(market => {
            response += `\n${market.name}: ${market.status} (${market.timeUntilDisplay})`;
        });
        response += '\`\`\`';

        await interaction.reply(response);
    },
};
