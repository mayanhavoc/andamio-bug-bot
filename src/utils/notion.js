const { Client: NotionClient } = require("@notionhq/client");

const notion = new NotionClient({ auth: process.env.NOTION_API_KEY });

// Define your functions below
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
							text: {
								content: title
							}
						}
					]
				},
				Summary: {
					rich_text: [
						{
							text: {
								content: summary
							}
						}
					]
				},
				Steps: {
					rich_text: [
						{
							text: {
								content: steps
							}
						}
					]
				},
				Expected: {
					rich_text: [
						{
							text: {
								content: expected
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
		console.log("Bug submitted to Notion successfully.");
	} catch (error) {
		console.error(
			"Error submitting bug to Notion:",
			error.body || error.message
		);
		throw new Error("Failed to submit bug to Notion");
	}
}

async function submitFeedbackToNotion({
	feedback,
	improvement,
	context,
	category,
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
							text: {
								content: feedback
							}
						}
					]
				},
				"How can we improve": {
					rich_text: [
						{
							text: {
								content: improvement
							}
						}
					]
				},
				Source: {
					select: { name: source || "Discord" }
				},
				Categories: {
					multi_select: {
						name: category
					}
				},
				"Submision time": {
					date: {
						start: new Date().toISOString()
					}
				}
			}
		});
		console.log("Feedback submitted to Notion successfully.");
	} catch (error) {
		console.error(
			"Error submitting feedback to Notion:",
			error.body || error.message
		);
		throw new Error("Failed to submit feedback to Notion");
	}
}
function determinedePriority(title) {
	// Simple heuristic to determine priority based on title keywords
	const lowerTitle = title.toLowerCase();
	if (lowerTitle.includes("critical") || lowerTitle.includes("urgent")) {
		return "High";
	} else if (lowerTitle.includes("minor") || lowerTitle.includes("low")) {
		return "Low";
	}
	return "Normal"; // Default priority
}

module.exports = {
	submitBugToNotion,
	submitFeedbackToNotion
};
