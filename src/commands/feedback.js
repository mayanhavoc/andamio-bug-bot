const { SlashCommandBuilder } = require("discord.js");
const { submitFeedbackToNotion } = require("../utils/notion");

const reporter = `${interaction.user.username}#${interaction.user.discriminator}`;
const reporterId = interaction.user.id;

module.exports = {
	data: new SlashCommandBuilder()
		.setName("feedback")
		.setDescription("Share feedback or suggestions about the platform")
		.addStringOption((option) =>
			option
				.setName("feedback")
				.setDescription("Short headline or topic of your feedback")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("improvement")
				.setDescription("How could we improve your experience?")
				.setRequired(false)
		)
		.addIntegerOption((option) =>
			option
				.setName("nps")
				.setDescription(
					"On a scale of 1-10, how likely are you to recommend us?"
				)
				.setMinValue(0)
				.setMaxValue(10)
				.setRequired(false)
		)
		.addStringOption((option) =>
			option
				.setName("category")
				.setDescription("What kind of feedback is this?")
				.addChoices(
					{ name: "UI/UX", value: "UI/UX" },
					{ name: "Bug", value: "Bug" },
					{ name: "Feature", value: "Feature" },
					{ name: "Price", value: "Price" },
					{ name: "Customer Support", value: "Customer Support" },
					{ name: "Other", value: "Other" }
				)
				.setRequired(false)
		),
	async execute(interaction) {
		const feedback = interaction.options.getString("feedback");
		const improvement =
			interaction.options.getString("improvement") || "No suggestions provided";
		const category = interaction.options.getString("category") || "Other";
		const nps = interaction.options.getInteger("nps") ?? null;

		try {
			await submitFeedbackToNotion({
				feedback,
				improvement,
				category,
				nps,
				source: "Discord",
				reporter,
				reporterId
			});

			await interaction.reply({
				content: "✅ Thanks for your feedback!",
				flags: 64 // ephemeral response
			});
		} catch (error) {
			console.error("Error submitting feedback:", error);
			await interaction.reply({
				content: "❌ There was a problem submitting your feedback.",
				flags: 64
			});
		}
	}
};
