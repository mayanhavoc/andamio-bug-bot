require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, InteractionType } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// On Ready
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Register Slash Command
const commands = [
  new SlashCommandBuilder()
    .setName('bug')
    .setDescription('Submit a bug report')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Short title of the bug')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('summary')
        .setDescription('Brief description')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('url')
        .setDescription('Relevant URL (if any)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('steps')
        .setDescription('Steps to reproduce')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('expected')
        .setDescription('Expected result')
        .setRequired(true))
].map(command => command.toJSON());

// Register Command to Guild
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
(async () => {
  try {
    console.log('🔄 Registering slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );
    console.log('✅ Slash commands registered!');
  } catch (error) {
    console.error(error);
  }
})();

// Handle Interactions
client.on('interactionCreate', async interaction => {
  if (interaction.type !== InteractionType.ApplicationCommand) return;
  
  if (interaction.commandName === 'bug') {
    const title = interaction.options.getString('title');
    const summary = interaction.options.getString('summary');
    const url = interaction.options.getString('url') || 'N/A';
    const steps = interaction.options.getString('steps');
    const expected = interaction.options.getString('expected');

    const bugReport = `
🐞 **New Bug Report:**

**Title:** ${title}
**Summary:** ${summary}
**URL:** ${url}
**Steps to Reproduce:** ${steps}
**Expected Result:** ${expected}
    `;

    await interaction.reply({ content: '✅ Bug report submitted! Thank you!', ephemeral: true });

    const channel = await client.channels.fetch(process.env.REPORT_CHANNEL_ID);
    channel.send(bugReport);
  }
});

// Login
client.login(process.env.DISCORD_TOKEN);
