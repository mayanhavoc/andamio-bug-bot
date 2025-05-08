const { Client: NotionClient } = require("@notionhq/client");

const notion = new NotionClient({ auth: process.env.NOTION_API_KEY });

function determinedePriority(title) {
	const lowerTitle = title.toLowerCase();
	if (lowerTitle.includes("critical") || lowerTitle.includes("urgent")) {
		return "High";
	} else if (lowerTitle.includes("minor") || lowerTitle.includes("low")) {
		return "Low";
	}
	return "Normal";
}

async function submitBugToNotion(title, summary, steps, expected, url) {
	try {
		const priority = determinedePriority(title);
		await notion.pages.create({
			parent: {
				database_id: process.env.NOTION_BUG_DATABASE_ID
			},
			properties: {
				Title: {
					title: [
						{
							text: { content: title || "Untitled bug" }
						}
					]
				},
				Summary: {
					rich_text: [
						{
							text: { content: summary || "No summary provided" }
						}
					]
				},
				Steps: {
					rich_text: [
						{
							text: { content: steps || "No steps provided" }
						}
					]
				},
				Expected: {
					rich_text: [
						{
							text: { content: expected || "No expected result provided" }
						}
					]
				},
				URL: {
					url: url || "https://example.com"
				},
				Priority: {
					select: { name: priority }
				}
			}
		});
		console.log("✅ Bug submitted to Notion successfully.");
	} catch (error) {
		console.error(
			"❌ Error submitting bug to Notion:",
			error.body || error.message
		);
		throw new Error("Failed to submit bug to Notion");
	}
}

async function submitFeedbackToNotion({
	feedback,
	improvement,
	category,
	nps,
	source
}) {
	try {
		await notion.pages.create({
			parent: {
				database_id: process.env.NOTION_FEEDBACK_DATABASE_ID
			},
			properties: {
				Feedback: {
					title: [
						{
							text: { content: feedback }
						}
					]
				},
				"How can we improve your experience?": {
					rich_text: [
						{
							text: { content: improvement }
						}
					]
				},
				Category: {
					select: { name: category }
				},
				NPS: {
					number: nps
				},
				Source: {
					select: { name: source || "Discord" }
				},
				"Submission time": {
					date: {
						start: new Date().toISOString()
					}
				}
			}
		});
		console.log("✅ Feedback submitted to Notion successfully.");
	} catch (error) {
		console.error(
			"❌ Error submitting feedback to Notion:",
			error.body || error.message
		);
		throw new Error("Failed to submit feedback to Notion");
	}
}

module.exports = {
	submitBugToNotion,
	submitFeedbackToNotion
};
// This module provides functions to submit bugs and feedback to Notion databases.
