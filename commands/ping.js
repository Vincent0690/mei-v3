const config = require("../config.json");
const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Pong!")
		.setDefaultPermission(true),
	is_disabled: false,
	usage: "ping",

	async execute(interaction) {
		interaction.editReply({
			ephemeral: true,
			embeds: [
				new MessageEmbed()
				.setColor(config.COLORS.blue)
				.setTitle("Pong!")
			],
			data: {
				type: 4,
			}
		}).catch(() => {});
	}
};