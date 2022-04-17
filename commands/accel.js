const config = require("../config.json");
const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { get, update } = require("../cache");
const Table = require("table");

const JsSearch = require("js-search");
const MiniSearch = require("minisearch");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("accel")
		.setDescription("Shows the 0-200 LB.")
		.setDefaultPermission(true)
		.addStringOption(option =>
			option.setName("car")
			.setRequired(false)
			.setDescription("The name of the car")),
	is_disabled: false,
	usage: "accel [carName]",

	async execute(interaction, car_id) {
		let cars = get("CARS");

		if(!cars) {
			update("CARS");
			throw "No cache";
		};

		let start_accel_pos = cars.filter(c => c.start_accel !== "").sort((a, b) => {
			if(!(typeof a.start_accel === "string" && typeof b.start_accel === "string")) return;

			return Number(a.start_accel.replace(":", "").replace(".", "")) - Number(b.start_accel.replace(":", "").replace(".", ""))
		});

		if(!interaction.options.getString("car")) {
			let data = [
				["POS", "CAR", "TIME"]
			];

			start_accel_pos.slice(0, 20).forEach((car, i) => {
				data.push([i + 1, car.model.toUpperCase(), car.start_accel.replace("00:0", "")]);
			});

			interaction.editReply({
				ephemeral: false,
				embeds: [
					new MessageEmbed()
					.setTitle("Top 20 of fastest cars at 0-200km/h")
					.setDescription(`See full leaderboard here: https://mei-a9.info/beststarts
\`\`\`
${Table.table(data, {
	border: Table.getBorderCharacters("void")
})}
\`\`\``)
					.setFooter({
						text: `All time are done in 60fps, on a flat road, without any user inputs (nitro nor steering) and in a golden acceleration car.
This feature is outdated`
						})
					.setColor(config.COLORS.purple)
				],
				data: {
					type: 4,
				}
			}).catch(() => {});
		} else {
			let CAR;

			if(!car_id) {
				let searchTerm = interaction.options.getString("car");
		
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

			let accel_text = CAR.start_accel !== "" ? `${CAR.start_accel.replace("00:0", "")}s which place it in pos ${start_accel_pos.findIndex(c => c.car_id === CAR.car_id) + 1} on ${cars.filter(c => c.start_accel !== "").length} cars` : "?";

			let close_cars = cars.filter(c => c.start_accel !== "" && c.stats.gold.acceleration !== null && CAR.stats.gold.acceleration.toString().split(".")[0] === c.stats.gold.acceleration.toString().split(".")[0]);

			let avg = 0;

			if(close_cars.length !== 0) {
				close_cars.forEach(c => {
					avg += Number(c.start_accel.replace("00:0", ""));
				});

				avg = (avg / close_cars.length).toFixed(3);
			};

			let accel_comment_text = `The 0-200km/h average for ${CAR.stats.gold.acceleration.toString().split(".")[0]}.xx cars is ${avg}s.`;

			interaction.editReply({
				ephemeral: false,
				embeds: [
					new MessageEmbed()
					.setColor(config.COLORS.purple)
					.setThumbnail(CAR.images[0])
					.setTitle(`${CAR.brand} ${CAR.model}`.toUpperCase())
					.setDescription(`This car reach 200km/h in ${accel_text}.

This car has a ${CAR.stats.gold.acceleration !== null ? CAR.stats.gold.acceleration.toString().split(".")[0] : "?"}.xx acceleration stat.
${close_cars.length !== 0 ? accel_comment_text : ""}`)
				],
				data: {
					type: 4,
				}
			}).catch(() => {});
		};
	}
};