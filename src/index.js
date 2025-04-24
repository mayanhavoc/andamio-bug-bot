require("dotenv").config();
const {
	Client,
	GatewayIntentBits,
	REST,
	Routes,
	InteractionType
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const logger = require("./utils/logger");

// Initialize Discord Client
const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.commands = new Collection();
client.slashCommands = [];

// Dynamically read command files
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
	.readirSync(commandsPath)
	.filter((file) => file.endsWith(".js"));

const commands = client.slashCommands;
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if (command.data && command.execute) {
		client.commands.set(command.data.name, command);
		commandList.push(command.data.toJSON());
	} else {
		logger.warn(`Skipping invalid command file: ${file}`);
	}
}

// Register Slash Commands
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
(async () => {
	try {
		logger.info("Registering slash commands...");
		await rest.put(
			Routes.applicationGuildCommands(
				process.env.CLIENT_ID,
				process.env.GUILD_ID
			),
			{
				body: commands
			}
		);
		logger.success("Slash commands registered");
	} catch (error) {
		logger.error("Error registering slash commands:", error);
	}
})();

// Bot Ready
client.once("ready", () => {
	logger.success(`Logged in as ${client.user.tag}`);
	client.user.setActivity("Andamio.io", { type: "WATCHING" });
});

// Interaction Handler
client.on("interactionCreate", async (interaction) => {
	if (interaction.type !== InteractionType.ApplicationCommand) return;
	const command = client.commands.get(interaction.commandName);
	if (!command) {
		logger.warn(`No command matching ${interaction.commandName} was found.`);
		return;
	}
	try {
		await command.execute(interaction);
		logger.info(`Executed command: ${interaction.commandName}`);
	} catch (error) {
		logger.error(`Error executing command ${interaction.commandName}:`, error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: "There was an error while executing this command!",
				ephemeral: true
			});
		} else {
			await interaction.reply({
				content: "There was an error while executing this command!",
				ephemeral: true
			});
		}
	}
});

// Start the bot
client
	.login(process.env.DISCORD_TOKEN)
	.then(() => {
		logger.success("Discord bot is online!");
	})
	.catch((error) => {
		logger.error("Failed to log in to Discord:", error);
	});
