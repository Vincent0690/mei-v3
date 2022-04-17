const config = require("../config.json");
const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { get, update } = require("../cache");
const Humanize = require("humanize-plus");

const JsSearch = require("js-search");
const MiniSearch = require("minisearch");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("cost")
		.setDescription("Shows cost of a car.")
		.setDefaultPermission(true)
		.addStringOption(option =>
			option.setName("car")
			.setRequired(true)
			.setDescription("The name of the car"))
		.addStringOption(option => 
			option.setName("level")
			.setRequired(false)
			.setDescription("The ⭐ level of the car")
			.addChoices([
				["Stock", "stock"],
				["1⭐", "1"],
				["2⭐", "2"],
				["3⭐", "3"],
				["4⭐", "4"],
				["5⭐", "5"],
				["Max", "max"],
				["Gold", "gold"]
			])),
	is_disabled: false,
	usage: "cost <carName> [level]",

	async execute(interaction, car_id) {
		let cars = get("CARS");

		if(!cars) {
			update("CARS");
			throw "No cache";
		};

		let CAR;

		if(!car_id) {
			let searchTerm = interaction.options.getString("car");
			let levelTerm = interaction.options.getString("level");
	
			let firstEngine = new MiniSearch({
				fields: ["shortcuts", "brand", "model"],
				storeFields: ["car_id"],
				searchOptions: {
					fuzzy: 0.2
				}
			});
	
			cars.forEach(c => c.id = c.car_id);
	
			firstEngine.addAll(cars);
	
			let result = firstEngine.search(searchTerm)[0];
	
			if(!result) {
				let secondEngine = new JsSearch.Search("car_id");
	
				secondEngine.addIndex("shortcuts");
				secondEngine.addIndex("model");
				secondEngine.addIndex("brand");
	
				secondEngine.addDocuments(cars);
	
				result = secondEngine.search(searchTerm)[0];
				if(!result) return interaction.editReply({
					ephemeral: true,
					embeds: [
						new MessageEmbed()
						.setColor(config.COLORS.red)
						.setTitle(`${config.EMOTES.error} None of the results match.`)
					],
					data: {
						type: 4
					}
				}).catch(() => {});
			};

			CAR = cars.find(car => car.car_id === result.car_id);
		} else CAR = cars.find(car => car.car_id === car_id);

		//if(levelTerm !== null) {};

		let classIcon;
	
		switch(CAR.class) {
			case "D":
				classIcon = "https://i.imgur.com/DkoLmUF.png";
			break;

			case "C":
				classIcon = "https://i.imgur.com/f3f2Rje.png";
			break;

			case "B":
				classIcon = "https://i.imgur.com/JgNy3B0.png";
			break;

			case "A":
				classIcon = "https://i.imgur.com/oB0jXjq.png";
			break;

			case "S":
				classIcon = "https://i.imgur.com/Q1jeg3Q.png";
			break;
		};

		let color;

		switch(CAR.rarity) {
			case "Uncommon":
				color = config.COLORS.uncommon_bp;
			break;

			case "Rare":
				color = config.COLORS.rare_bp;
			break;

			case "Epic":
				color = config.COLORS.epic_bp;
			break;
		};

		let bps = Object.values(CAR.blueprints).filter(e => e !== null && e !== "key");
		let bpsTotal = bps.reduce((a, b) => a + b, 0);

		//------

		let embed = new MessageEmbed()
			.setColor(color)
			.setAuthor({
				name: `${CAR.brand} ${CAR.model}`.toUpperCase(),
				iconURL: classIcon,
				url: `https://www.mei-a9.info/cars?car=${CAR.car_id}`
			})
			.setFooter({
				text: `ID: ${CAR.car_id} - Saw incorrect data? Tell us with /feedback`
			})

		//------

		let upgrades = [];
		let upgrades_total = 0;

		CAR.upgrades_stages.forEach((stage, i) => {
			upgrades.push(`\`\`[${i + 1}]\`\`  **${Humanize.intComma(stage)}**`);
			upgrades_total += stage;
		});

		embed.addField("Upgrades Stages:", `${upgrades.join("\n")}

\`\`Stages Total:\`\` ${Humanize.intComma(upgrades_total)} x 4 = **${Humanize.intComma(upgrades_total * 4)}** ${config.EMOTES.credit}
${config.EMOTES.void}`);

		embed.addField("Parts:", `\`\`Uncommons:\`\` ${CAR.parts.uncommons.per_stat * 4} x ${Humanize.intComma(CAR.parts.uncommons.cost_per_import)} = **${Humanize.intComma((CAR.parts.uncommons.per_stat * 4) * CAR.parts.uncommons.cost_per_import)}** ${config.EMOTES.credit}
\`\`Rares:\`\` ${CAR.parts.rares.per_stat * 4} x ${Humanize.intComma(CAR.parts.rares.cost_per_import)} = **${Humanize.intComma((CAR.parts.rares.per_stat * 4) * CAR.parts.rares.cost_per_import)}** ${config.EMOTES.credit}
${CAR.parts.epics.per_stat === 0 ? "" : `\`\`Epics:\`\` ${CAR.parts.epics.per_stat * 4} x ${Humanize.intComma(CAR.parts.epics.cost_per_import)} = **${Humanize.intComma((CAR.parts.epics.per_stat * 4) * CAR.parts.epics.cost_per_import)}** ${config.EMOTES.credit}`}

\`\`Parts Total:\`\` **${Humanize.intComma(((CAR.parts.uncommons.per_stat * 4) * CAR.parts.uncommons.cost_per_import) + ((CAR.parts.rares.per_stat * 4) * CAR.parts.rares.cost_per_import) + ((CAR.parts.epics.per_stat * 4) * CAR.parts.epics.cost_per_import))}** ${config.EMOTES.credit}
${config.EMOTES.void}`);

		embed.addField("Total", `${Humanize.intComma(upgrades_total * 4)} + ${Humanize.intComma(((CAR.parts.uncommons.per_stat * 4) * CAR.parts.uncommons.cost_per_import) + ((CAR.parts.rares.per_stat * 4) * CAR.parts.rares.cost_per_import) + ((CAR.parts.epics.per_stat * 4) * CAR.parts.epics.cost_per_import))} = **${Humanize.intComma((upgrades_total * 4) + (((CAR.parts.uncommons.per_stat * 4) * CAR.parts.uncommons.cost_per_import) + ((CAR.parts.rares.per_stat * 4) * CAR.parts.rares.cost_per_import) + ((CAR.parts.epics.per_stat * 4) * CAR.parts.epics.cost_per_import)))}** ${config.EMOTES.credit}`);

		//-----

		interaction.editReply({
			ephemeral: false,
			embeds: [
				embed
			],
			data: {
				type: 4,
			}
		}).catch(() => {});
	}
};