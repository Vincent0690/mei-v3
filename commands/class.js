const config = require("../config.json");
const { MessageEmbed, MessageSelectMenu, MessageActionRow } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { get, update } = require("../cache");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("class")
		.setDescription("Shows stats of a class.")
		.setDefaultPermission(true),
	is_disabled: false,
	usage: "class",

	async execute(interaction) {
		let cars = get("CARS");

		if(!cars) {
			update("CARS");
			throw "No cache";
		};

		interaction.editReply({
			ephemeral: false,
			embeds: [
				new MessageEmbed()
				.setTitle("OKKKK")
				.setDescription("dick")
			],
			data: {
				type: 4,
			},
			components: [
				new MessageActionRow()
					.addComponents(
						new MessageSelectMenu()
						.setCustomId("classes")
						.setPlaceholder("Select one or multiples classes.")
						.setMinValues(1)
						.addOptions([
							{
								label: "D",
								description: "Class D",
								value: "d",
							},
							{
								label: "C",
								description: "Class C",
								value: "c",
							},
							{
								label: "B",
								description: "Class B",
								value: "b",
							},
							{
								label: "A",
								description: "Class A",
								value: "a",
							},
							{
								label: "S",
								description: "Class S",
								value: "s",
							}
						])
					)
			]
		}).then(PANEL => {
			let collector = PANEL.createMessageComponentCollector({
				filter: (i) => i.customId === "SELECT_MENU" && i.user.id === interaction.user.id,
				time: 300000
			});

			collector.on("collect", i => {
				console.log(`Collected ${i.customId}`);
			});
		}).catch(console.error);
	}
};