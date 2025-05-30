const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { submitBugToNotion } = require("../utils/notion");

module.exports = {
	data: new SlashCommandBuilder()
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
		),
	async execute(interaction) {
		const reporter = `${interaction.user.username}#${interaction.user.discriminator}`;
		await interaction.reply({
			content: "✅ Bug report received! Processing now...",
			flags: 64
		});
		const title = interaction.options.getString("title");
		const summary = interaction.options.getString("summary");
		const steps = interaction.options.getString("steps");
		const expected = interaction.options.getString("expected");
		const url = interaction.options.getString("url") || "No URL provided";

		// Create Discord Embed
		const bugEmbed = new EmbedBuilder()
			.setColor(0xff0000)
			.setTitle(`🐞 Bug Report: ${title}`)
			.setAuthor({
				name: "Andamio Bug Bot",
				iconURL:
					"https://app.andamio.io/_next/image?url=%2Fandamio-logo-no-white-overflow.png",
				url: "https://www.andamio.io"
			})
			.setDescription(`**Summary:**\n${summary}`)
			.addFields(
				{
					name: "🔎 Steps to Reproduce",
					value: `**1.** ${steps.replace(/\n/g, "\n**•** ")}`,
					inline: false
				},
				{
					name: "🎯 Expected Result",
					value: expected,
					inline: false
				},
				{
					name: "🌐 Relevant URL",
					value:
						url !== "No URL provided"
							? `[Click Here](${url})`
							: "No URL provided.",
					inline: false
				}
			)
			.setFooter({
				text: "Reported via Andamio Bug Bot",
				iconURL:
					"https://app.andamio.io/_next/image?url=%2Fandamio-logo-no-white-overflow.png"
			})
			.setTimestamp();

		const channel = await interaction.client.channels.fetch(
			process.env.BUG_REPORT_CHANNEL_ID
		);
		await channel.send({ embeds: [bugEmbed] });

		await submitBugToNotion(title, summary, steps, expected, url, reporter);
	}
};
