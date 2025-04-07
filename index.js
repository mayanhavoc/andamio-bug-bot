require("dotenv").config();
const {
	Client,
	GatewayIntentBits,
	REST,
	Routes,
	SlashCommandBuilder,
	InteractionType
} = require("discord.js");
const { EmbedBuilder } = require("discord.js");

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// On Ready
client.once("ready", () => {
	console.log(`✅ Logged in as ${client.user.tag}`);
});

const commands = [
	new SlashCommandBuilder()
		.setName("bug")
		.setDescription("Submit a bug report")
		// Required fields FIRST
		.addStringOption((option) =>
			option
				.setName("title")
				.setDescription("Short title of the bug")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("summary")
				.setDescription("Brief description of the bug")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("steps")
				.setDescription("Steps to reproduce the bug")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("expected")
				.setDescription("Expected result if no bug existed")
				.setRequired(true)
		)
		// Optional fields AFTER all required ones
		.addStringOption((option) =>
			option
				.setName("url")
				.setDescription("Relevant URL (if any)")
				.setRequired(false)
		)
].map((command) => command.toJSON());

// Register Command to Guild
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
(async () => {
	try {
		console.log("🔄 Registering slash commands...");
		await rest.put(
			Routes.applicationGuildCommands(
				process.env.CLIENT_ID,
				process.env.GUILD_ID
			),
			{ body: commands }
		);
		console.log("✅ Slash commands registered!");
	} catch (error) {
		console.error(error);
	}
})();

// Handle Interactions
client.on("interactionCreate", async (interaction) => {
	if (interaction.type !== InteractionType.ApplicationCommand) return;

	if (interaction.commandName === "bug") {
		const title = interaction.options.getString("title");
		const summary = interaction.options.getString("summary");
		const url = interaction.options.getString("url") || "No URL provided"; // Default to "No URL provided" if none is given
		/**
		 * Steps to reproduce and expected are required, so no need to check for them.
		 * They will always be present if the command was executed correctly.
		 */
		const steps = interaction.options.getString("steps");
		const expected = interaction.options.getString("expected");

		const bugEmbed = new EmbedBuilder()
			.setTitle(`🐞 Bug: ${title}`)
			.addFields(
				{ name: "Summary", value: summary, inline: false },
				{ name: "Steps to Reproduce", value: steps, inline: false },
				{ name: "Expected Result", value: expected, inline: false },
				{ name: "URL", value: url, inline: false }
			)
			.setColor(0xff0000)
			.setTimestamp();

		await interaction.reply({
			content: "✅ Bug report submitted! Thank you!",
			flags: MessageFlags.Ephemeral
		}); // Reply to the interaction to acknowledge it

		const channel = await client.channels.fetch(process.env.REPORT_CHANNEL_ID);
		channel.send({ embeds: [bugEmbed] });
	}
});

// Login
client.login(process.env.DISCORD_TOKEN);
