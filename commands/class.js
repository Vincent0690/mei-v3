const config = require("../config.json");
const { MessageEmbed, MessageSelectMenu, MessageActionRow } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { get, update } = require("../cache");
const Humanize = require("humanize-plus");

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
			ephemeral: true,
			embeds: [
				new MessageEmbed()
				.setTitle("Which classes do you want to include in the results?")
				.setDescription("Select one or multiples classes.")
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
								value: "D",
							},
							{
								label: "C",
								description: "Class C",
								value: "C",
							},
							{
								label: "B",
								description: "Class B",
								value: "B",
							},
							{
								label: "A",
								description: "Class A",
								value: "A",
							},
							{
								label: "S",
								description: "Class S",
								value: "S",
							}
						])
					)
			]
		}).then(PANEL => {
			let collector = PANEL.createMessageComponentCollector({
				filter: (i) => i.isSelectMenu() && i.customId === "classes" && i.user.id === interaction.user.id,
				time: 300000
			});

			collector.on("collect", i => {
				i.deferReply().then(() => {
					let SELECTED_CLASSES = i.values;

					let uncommons_total = 0;
					let rares_total = 0;
					let epics_total = 0;

					let parts_total = 0;
					let stages_total = 0;
				
					cars.filter(c => SELECTED_CLASSES.includes(c.class)).forEach(car => {
						console.log(car.model)
						car.upgrades_stages.forEach(stage => {
							stages_total += stage * 4;
						});
			
						uncommons_total += car.parts.uncommons.per_stat * 4;
						rares_total += car.parts.rares.per_stat * 4;
						epics_total += car.parts.epics.per_stat * 4;
			
						parts_total += ((car.parts.uncommons.per_stat * 4) + car.parts.uncommons.cost_per_import) + ((car.parts.rares.per_stat * 4) + car.parts.rares.cost_per_import) + ((car.parts.epics.per_stat * 4) + car.parts.epics.cost_per_import);
					});

					let embed = new MessageEmbed()
					.setTitle(`Info: ${SELECTED_CLASSES.join(", ")}`)
					.setColor(config.COLORS.purple)
					.addField("Parts", `${config.EMOTES.uncommon_part} x${Humanize.intComma(uncommons_total)}
${config.EMOTES.rare_part} x${Humanize.intComma(rares_total)}
${config.EMOTES.epic_part} x${Humanize.intComma(epics_total)}`)
					.addField("Upgrades", `${config.EMOTES.uncommon_part}${config.EMOTES.rare_part}${config.EMOTES.epic_part} ${Humanize.intComma(parts_total)} ${config.EMOTES.credit}
${config.EMOTES.upgrades} ${Humanize.intComma(stages_total)} ${config.EMOTES.credit}

${Humanize.intComma(stages_total + parts_total)} ${config.EMOTES.credit} to upgrade ${cars.filter(c => SELECTED_CLASSES.includes(c.class)).length} cars in class ${SELECTED_CLASSES.join(", ")}.`);

					i.editReply({
						ephemeral: false,
						embeds: [
							embed
						],
						data: {
							type: 4
						}
					}).catch(() => {});
				}).catch(() => {});
			});
		}).catch(console.error);
	}
};