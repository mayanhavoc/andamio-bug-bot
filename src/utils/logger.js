// src/utils/logger.js

const chalk = require("chalk");

function timestamp() {
	return new Date().toISOString();
}

module.exports = {
	info: (...args) => {
		console.log(`${chalk.blue("[INFO]")} ${chalk.gray(timestamp())}`, ...args);
	},
	success: (...args) => {
		console.log(
			`${chalk.green("[SUCCESS]")} ${chalk.gray(timestamp())}`,
			...args
		);
	},
	warn: (...args) => {
		console.warn(
			`${chalk.yellow("[WARN]")} ${chalk.gray(timestamp())}`,
			...args
		);
	},
	error: (...args) => {
		console.error(
			`${chalk.red("[ERROR]")} ${chalk.gray(timestamp())}`,
			...args
		);
	},
	debug: (...args) => {
		if (process.env.DEBUG === "true") {
			console.log(
				`${chalk.magenta("[DEBUG]")} ${chalk.gray(timestamp())}`,
				...args
			);
		}
	}
};
