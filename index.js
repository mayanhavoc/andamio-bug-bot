require("dotenv").config();
const {
	Client,
	GatewayIntentBits,
	REST,
	Routes,
	SlashCommandBuilder,
	InteractionType,
	EmbedBuilder
} = require("discord.js");
const { Client: NotionClient } = require("@notionhq/client");

// Initialize Discord Client
const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// Initialize Notion Client
const notion = new NotionClient({ auth: process.env.NOTION_API_KEY });

// Setup Slash Commands
const commands = [
	new SlashCommandBuilder()
		.setName("bug")
		.setDescription("Submit a bug report")
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
		.addStringOption((option) =>
			option
				.setName("url")
				.setDescription("Relevant URL (if any)")
				.setRequired(false)
		)
].map((command) => command.toJSON());

// Register Slash Commands to Guild
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
		console.error("❌ Error registering slash commands:", error);
	}
})();

// On Bot Ready
client.once("ready", () => {
	console.log(`✅ Logged in as ${client.user.tag}`);
});

// Handle Bug Submission
client.on("interactionCreate", async (interaction) => {
	if (interaction.type !== InteractionType.ApplicationCommand) return;
	if (interaction.commandName !== "bug") return;

	const title = interaction.options.getString("title");
	const summary = interaction.options.getString("summary");
	const steps = interaction.options.getString("steps");
	const expected = interaction.options.getString("expected");
	const url = interaction.options.getString("url") || "No URL provided";

	// Create Discord Embed
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

	try {
		await interaction.reply({
			content: "✅ Bug report submitted! Thank you!",
			ephemeral: true
		});

		const channel = await client.channels.fetch(process.env.REPORT_CHANNEL_ID);
		await channel.send({ embeds: [bugEmbed] });

		// Submit to Notion
		await submitBugToNotion(title, summary, steps, expected, url);
	} catch (error) {
		console.error("❌ Error handling bug submission:", error);
	}
});

// --- Submit Bug to Notion --- //
async function submitBugToNotion(title, summary, steps, expected, url) {
	try {
		const priority = determinePriority(title);

		await notion.pages.create({
			parent: { database_id: process.env.NOTION_DATABASE_ID },
			properties: {
				Title: {
					title: [
						{
							text: {
								content: title || "Untitled Bug"
							}
						}
					]
				},
				Summary: {
					rich_text: [
						{
							text: {
								content: summary || "No summary provided."
							}
						}
					]
				},
				Steps: {
					rich_text: [
						{
							text: {
								content: steps || "No steps provided."
							}
						}
					]
				},
				Expected: {
					rich_text: [
						{
							text: {
								content: expected || "No expected result provided."
							}
						}
					]
				},
				URL: {
					url: url || "https://example.com"
				},
				Priority: {
					select: {
						name: priority
					}
				}
			}
		});

		console.log("✅ Bug report successfully submitted to Notion!");
	} catch (error) {
		console.error(
			"❌ Failed to submit bug report to Notion:",
			error.body || error.message
		);
	}
}

// --- Determine Priority Based on Title --- //
function determinePriority(title) {
	const lowered = title.toLowerCase();

	if (
		lowered.includes("critical") ||
		lowered.includes("urgent") ||
		lowered.includes("blocker")
	) {
		return "High";
	}
	return "Normal";
}

// Login Bot
client.login(process.env.DISCORD_TOKEN);
