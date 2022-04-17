const config = require("../config.json");
const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { get, update } = require("../cache");
const Humanize = require("humanize-plus");

const JsSearch = require("js-search");
const MiniSearch = require("minisearch");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("compare")
		.setDescription("Compare two cars between them.")
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
	usage: "compare <carName> [level]",

	async execute(interaction, car_id) {
		let cars = get("CARS");

		if(!cars) {
			update("CARS");
			throw "No cache";
		};

		let CAR_A;

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

			CAR_A = cars.find(car => car.car_id === result.car_id);
		} else CAR_A = cars.find(car => car.car_id === car_id);

		let CAR_A_LEVEL;

		if(typeof interaction.options.getString("level") === "string") {
			if(interaction.options.getString("level") === "stock" && typeof CAR_A.stats[0] === "object") CAR_A_LEVEL

			if(a_indic_txt > A_CAR.max_star) return message.channel.send(u.makeErr(`This car doesn't have ${a_indic_txt} stars.`));
		};

		Cars.findOne({car_id: A_ID.car_id}, (A_ERR, A_CAR) => {
			if(A_ERR || !A_CAR) {
				console.log(A_ERR);

				return message.channel.send(u.makeErr(`Sorry, an error occured.`));
			};

			let a_indic_pos = a_args.join(" ").search(/(\*)/gi);
			let a_indic_txt;

			if(a_indic_pos !== -1) a_indic_txt = a_args.join(" ")[Math.floor(a_indic_pos - 1)];

			let a_tokenized = false;

			if(a_indic_pos !== -1 && !isNaN(a_indic_txt)) {
				if(a_indic_txt < 0 || a_indic_txt > 6) return message.channel.send(u.makeErr(`Wrong token usage.
Example: \`${guild.prefix}compare lancer 1*\``));
	
				if(a_indic_txt > A_CAR.max_star) return message.channel.send(u.makeErr(`This car doesn't have ${a_indic_txt} stars.`));
	
				if(!A_CAR.stats[a_indic_txt] && a_indic_txt != A_CAR.max_star && a_indic_txt != 0) return message.channel.send(u.makeErr(`Missing data.`));
	
				a_tokenized = true;
			};

			let answer = new Discord.MessageEmbed()
			.setColor("DEEB34")
			.setTitle("Choose the second car to compare with:");

			if(!a_tokenized) {
				answer.setDescription(`${A_CAR.brand} ${A_CAR.model}`);
			} else {
				answer.setDescription(`${a_indic_txt}⭐ **${A_CAR.brand} ${A_CAR.model}**`);
			};
			
			message.channel.send(answer).then(() => {
				let filter = m => m.author.id === message.author.id;
				let collector = message.channel.createMessageCollector(filter, {
					time: 240000,
					max: 1
				});
	
				collector.on("collect", msg => {
					let B_ID = miniSearch.search(msg.content.replace(/([0-9]\*)/g, ""))[0];

					if(!B_ID) {
						let b_search = new JsSearch.Search("car_id");

						b_search.addIndex("shortcuts");
						b_search.addIndex("model");
						b_search.addIndex("brand");

						b_search.addDocuments(cache.cachedCars);

						B_ID = b_search.search(msg.content.replace(/([0-9]\*)/g, ""))[0];
						if(!B_ID) return message.channel.send(u.makeErr(`None of the results match.`));
					};

					Cars.findOne({car_id: B_ID.car_id}, (B_ERR, B_CAR) => {
						if(B_ERR || !B_CAR) {
							console.log(B_ERR);
			
							return message.channel.send(u.makeErr(`Sorry, an error occured.`));
						};
			
						let b_indic_pos = msg.content.search(/(\*)/gi);
						let b_indic_txt;
			
						if(b_indic_pos !== -1) b_indic_txt = msg.content[Math.floor(b_indic_pos - 1)];
			
						let b_tokenized = false;
			
						if(b_indic_pos !== -1 && !isNaN(b_indic_txt)) {
							if(b_indic_txt < 0 || b_indic_txt > 6) return message.channel.send(u.makeErr(`Wrong token usage.
Example: \`${guild.prefix}compare lancer 1*\``));
				
							if(b_indic_txt > B_CAR.max_star) return message.channel.send(u.makeErr(`This car doesn't have ${b_indic_txt} stars.`));
				
							if(!B_CAR.stats[b_indic_txt] && b_indic_txt != B_CAR.max_star && b_indic_txt != 0) return message.channel.send(u.makeErr(`Missing data.`));
				
							b_tokenized = true;
						};

						let embed = new Discord.MessageEmbed()
						.setColor("FC034E")
						.setTitle(`${A_CAR.brand} ${A_CAR.model} / ${B_CAR.brand} ${B_CAR.model}`);

						if(!a_tokenized) {
							if(!b_tokenized) {
								let A_BP_TOTAL = Object.values(A_CAR.blueprints).filter(e => e !== null && e !== "key").reduce((a, b) => a + b, 0);
								let B_BP_TOTAL = Object.values(B_CAR.blueprints).filter(e => e !== null && e !== "key").reduce((a, b) => a + b, 0);

								let A_GOLD_COST = 0;
						
								A_CAR.upgrades_stages.forEach(stage => {
									A_GOLD_COST += stage * 4;
								});

								A_GOLD_COST += ((A_CAR.parts.uncommons.per_stat * 4) * A_CAR.parts.uncommons.cost_per_import);
								A_GOLD_COST += ((A_CAR.parts.rares.per_stat * 4) * A_CAR.parts.rares.cost_per_import);
								A_GOLD_COST += ((A_CAR.parts.epics.per_stat * 4) * A_CAR.parts.epics.cost_per_import);

								let B_GOLD_COST = 0;
						
								B_CAR.upgrades_stages.forEach(stage => {
									B_GOLD_COST += stage * 4;
								});

								B_GOLD_COST += ((B_CAR.parts.uncommons.per_stat * 4) * B_CAR.parts.uncommons.cost_per_import);
								B_GOLD_COST += ((B_CAR.parts.rares.per_stat * 4) * B_CAR.parts.rares.cost_per_import);
								B_GOLD_COST += ((B_CAR.parts.epics.per_stat * 4) * B_CAR.parts.epics.cost_per_import);

								let DIFF_GOLD_COST = short(Math.abs(A_GOLD_COST - B_GOLD_COST));

								if(A_GOLD_COST > B_GOLD_COST) DIFF_GOLD_COST = `*-${DIFF_GOLD_COST}*`;
								if(A_GOLD_COST == B_GOLD_COST) DIFF_GOLD_COST = "=";
								if(A_GOLD_COST < B_GOLD_COST) DIFF_GOLD_COST = `*+${DIFF_GOLD_COST}*`;

								embed.addField(A_CAR.class, `<:bp:787052519217299506> **${Object.values(A_CAR.blueprints)[0] === "key" ? `🔑 + ${A_BP_TOTAL}` : A_BP_TOTAL}**
<:credit:740932705876967450> **${(A_GOLD_COST / 1000000).toFixed(1)}M**
<:0_:787056212722188420>`, true);

								embed.addField(B_CAR.class, `**${Object.values(B_CAR.blueprints)[0] === "key" ? `🔑 + ${B_BP_TOTAL}` : B_BP_TOTAL}**
**${(B_GOLD_COST / 1000000).toFixed(1)}M**`, true);

								embed.addField("<:0_:787056212722188420>", `${diff(A_BP_TOTAL, B_BP_TOTAL)}
${DIFF_GOLD_COST}`, true);

								embed.addField(`STOCK [${A_CAR.ranks[0]}]`, `<:speed:787049195403083836> **${A_CAR.stats[0].speed || "?"}km/h**
<:accel:787049189682708482> **${A_CAR.stats[0].acceleration || "?"}**
<:hand:787049191771078686> **${A_CAR.stats[0].handling || "?"}**
<:nitro:787049195143823370> **${A_CAR.stats[0].nitro || "?"}**
<:0_:787056212722188420>`, true);

								embed.addField(`STOCK [${B_CAR.ranks[0]}]`, `**${B_CAR.stats[0].speed || "?"}km/h**
**${B_CAR.stats[0].acceleration || "?"}**
**${B_CAR.stats[0].handling || "?"}**
**${B_CAR.stats[0].nitro || "?"}**`, true);

								embed.addField("<:0_:787056212722188420>", `${diff(A_CAR.stats[0].speed, B_CAR.stats[0].speed)}
${diff(A_CAR.stats[0].acceleration, B_CAR.stats[0].acceleration)}
${diff(A_CAR.stats[0].handling, B_CAR.stats[0].handling)}
${diff(A_CAR.stats[0].nitro, B_CAR.stats[0].nitro)}`, true);

								embed.addField(`GOLD [${A_CAR.ranks.gold}]`, `<:speed:787049195403083836> **${A_CAR.stats.gold.speed || "?"}km/h**
<:accel:787049189682708482> **${A_CAR.stats.gold.acceleration || "?"}**
<:hand:787049191771078686> **${A_CAR.stats.gold.handling || "?"}**
<:nitro:787049195143823370> **${A_CAR.stats.gold.nitro || "?"}**

${A_CAR.nitro_speeds.blue > A_CAR.nitro_speeds.yellow ? "<:BlueFlame:757222895742091374>" : "<:YellowFlame:764500109362200586>"} **${A_CAR.nitro_speeds.blue}km/h**
<:tiresmoke:831228565319974934> **${A_CAR.start_accel.replace("00:0", "")}s**`, true);

								embed.addField(`GOLD [${B_CAR.ranks.gold}]`, `**${B_CAR.stats.gold.speed || "?"}km/h**
**${B_CAR.stats.gold.acceleration || "?"}**
**${B_CAR.stats.gold.handling || "?"}**
**${B_CAR.stats.gold.nitro || "?"}**

**${B_CAR.nitro_speeds.blue || "?"}km/h**
**${B_CAR.start_accel.replace("00:0", "")}s**`, true);

								embed.addField("<:0_:787056212722188420>", `${diff(A_CAR.stats.gold.speed, B_CAR.stats.gold.speed)}
${diff(A_CAR.stats.gold.acceleration, B_CAR.stats.gold.acceleration)}
${diff(A_CAR.stats.gold.handling, B_CAR.stats.gold.handling)}
${diff(A_CAR.stats.gold.nitro, B_CAR.stats.gold.nitro)}

${diff(A_CAR.nitro_speeds.blue, B_CAR.nitro_speeds.blue)}`, true);
							} else {
								embed.addField(`Gold [${A_CAR.ranks.gold || "?"}]`, `<:speed:787049195403083836> **${A_CAR.stats.gold.speed || "?"}km/h**
<:accel:787049189682708482> **${A_CAR.stats.gold.acceleration || "?"}**
<:hand:787049191771078686> **${A_CAR.stats.gold.handling || "?"}**
<:nitro:787049195143823370> **${A_CAR.stats.gold.nitro || "?"}**`, true);

								embed.addField(`${"⭐".repeat(b_indic_txt)} [${B_CAR.ranks[b_indic_txt] || "?"}]`, `**${B_CAR.stats[b_indic_txt].speed || "?"}km/h**
**${B_CAR.stats[b_indic_txt].acceleration || "?"}**
**${B_CAR.stats[b_indic_txt].handling || "?"}**
**${B_CAR.stats[b_indic_txt].nitro || "?"}**`, true);

								embed.addField("<:0_:787056212722188420>", `${diff(A_CAR.stats.gold.speed, B_CAR.stats[b_indic_txt].speed)}
${diff(A_CAR.stats.gold.acceleration, B_CAR.stats[b_indic_txt].acceleration)}
${diff(A_CAR.stats.gold.handling, B_CAR.stats[b_indic_txt].handling)}
${diff(A_CAR.stats.gold.nitro, B_CAR.stats[b_indic_txt].nitro)}`, true);
							};
						} else {
							if(!b_tokenized) {
								embed.addField(`${"⭐".repeat(a_indic_txt)} [${A_CAR.ranks[a_indic_txt] || "?"}]`, `**${A_CAR.stats[a_indic_txt].speed || "?"}km/h**
**${A_CAR.stats[a_indic_txt].acceleration || "?"}**
**${A_CAR.stats[a_indic_txt].handling || "?"}**
**${A_CAR.stats[a_indic_txt].nitro || "?"}**`, true);

								embed.addField(`Gold [${B_CAR.ranks.gold || "?"}]`, `<:speed:787049195403083836> **${B_CAR.stats.gold.speed || "?"}km/h**
<:accel:787049189682708482> **${B_CAR.stats.gold.acceleration || "?"}**
<:hand:787049191771078686> **${B_CAR.stats.gold.handling || "?"}**
<:nitro:787049195143823370> **${B_CAR.stats.gold.nitro || "?"}**`, true);

								embed.addField("<:0_:787056212722188420>", `${diff(A_CAR.stats[a_indic_txt].speed, B_CAR.stats.gold.speed)}
${diff(A_CAR.stats[a_indic_txt].acceleration, B_CAR.stats.gold.acceleration)}
${diff(A_CAR.stats[a_indic_txt].handling, B_CAR.stats.gold.handling)}
${diff(A_CAR.stats[a_indic_txt].nitro, B_CAR.stats.gold.nitro)}`, true);
							} else {
								embed.addField(`${"⭐".repeat(a_indic_txt)} [${A_CAR.ranks[a_indic_txt] || "?"}]`, `**${A_CAR.stats[a_indic_txt].speed || "?"}km/h**
**${A_CAR.stats[a_indic_txt].acceleration || "?"}**
**${A_CAR.stats[a_indic_txt].handling || "?"}**
**${A_CAR.stats[a_indic_txt].nitro || "?"}**`, true);

								embed.addField(`${"⭐".repeat(b_indic_txt)} [${B_CAR.ranks[b_indic_txt] || "?"}]`, `**${B_CAR.stats[b_indic_txt].speed || "?"}km/h**
**${B_CAR.stats[b_indic_txt].acceleration || "?"}**
**${B_CAR.stats[b_indic_txt].handling || "?"}**
**${B_CAR.stats[b_indic_txt].nitro || "?"}**`, true);

								embed.addField("<:0_:787056212722188420>", `${diff(A_CAR.stats[a_indic_txt].speed, B_CAR.stats[b_indic_txt].speed)}
${diff(A_CAR.stats[a_indic_txt].acceleration, B_CAR.stats[b_indic_txt].acceleration)}
${diff(A_CAR.stats[a_indic_txt].handling, B_CAR.stats[b_indic_txt].handling)}
${diff(A_CAR.stats[a_indic_txt].nitro, B_CAR.stats[b_indic_txt].nitro)}`, true);
							};
						};

						message.channel.send(embed);
					});
				});
			});
		});
	}
};