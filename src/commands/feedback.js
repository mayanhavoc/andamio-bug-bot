const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
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
					"Select a feedback category: UX/UI, Feature, Bug, Price, Other"
				)
				.setRequired(true)
		),

	async execute(interaction) {
		const title = interaction.options.getString("title");
		const description = interaction.options.getString("description");
		const category = interaction.options.getString("category");

		try {
			await submitFeedbackToNotion({
				feedback: title,
				improvement: description,
				category,
				source: "Discord"
			});

			await interaction.reply({
				content:
					"✅ Thank you for your feedback! It has been submitted successfully.",
				flags: 64
			});
		} catch (error) {
			console.error("❌ Error submitting feedback:", error);
			await interaction.reply({
				content:
					"❌ There was an error submitting your feedback. Please try again later.",
				ephemeral: true
			});
			return; // Don't try to send embed if the database call failed
		}

		const feedbackEmbed = new EmbedBuilder()
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

		try {
			const channel = await interaction.client.channels.fetch(
				process.env.FEEDBACK_REPORT_CHANNEL_ID
			);
			await channel.send({ embeds: [feedbackEmbed] });
		} catch (error) {
			console.error("⚠️ Failed to send feedback embed to channel:", error);
		}
	}
};
