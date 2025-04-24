const { bugCommand } = require("../commands/bug");
const { feedbackCommand } = require("../commands/feedback");

module.exports = [bugCommand.data, feedbackCommand.data];
