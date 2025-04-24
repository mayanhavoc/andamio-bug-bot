const { SlashCommandBuilder } = require("discord.js");
const { submitFeedbackToNotion } = require("../utils/notion");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("feedback")
		.setDescription("Share feedback or suggestions about the platform")
		.addStringOption((option) =>
			option
				.setName("title")
				.setDescription("Short headline or topic of your feedback")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("description")
				.setDescription("Describe your idea, suggestion or issue")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("category")
				.setDescription(
					"Select a feedback category: UX/UI, Feature, Bug, Price, Other,"
				)
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("context")
				.setDescription("Where or when did this feedback come up?")
				.setRequired(false)
		),
	async execute(interaction) {
		const title = interaction.options.getString("title");
		const description = interaction.options.getString("description");
		const context =
			interaction.options.getString("context") || "No context provided";
		const category = interaction.options.getString("category");

		try {
			await submitFeedbackToNotion(title, description, context, category);
			await interaction.reply({
				content:
					"Thank you for your feedback! It has been submitted successfully.",
				ephemeral: true
			});
		} catch (error) {
			console.error("Error submitting feedback:", error);
			await interaction.reply({
				content:
					"There was an error submitting your feedback. Please try again later.",
				ephemeral: true
			});
		}
		const feedbackEmbed = newEmbedBuilder()
			.setColor(0x00b0f4)
			.setTitle(`💡 Feedback: ${title}`)
			.addFields(
				{ name: "📝 Description", value: description, inline: false },
				{ name: "📍 Context", value: context, inline: false },
				{ name: "🏷️ Category", value: category, inline: false }
			)
			.setFooter({
				text: `Submitted by ${interaction.user.tag}`,
				iconURL: interaction.user.displayAvatarURL()
			})
			.setTimestamp();

		const channel = await interaction.client.channels.fetch(
			process.env.FEEDBACK_REPORT_CHANNEL_ID
		);
		channel.send({ embeds: [feedbackEmbed] }).catch(console.error);

		await submitFeedbackToNotion({
			feedback: title,
			improvement: description,
			context,
			category,
			source: "Discord"
		});
	}
};
