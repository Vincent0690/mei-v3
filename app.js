require("dotenv").config();

const fs = require("fs");
const Mongoose = require("mongoose");
const cache = require("./cache");
const { REST } = require("@discordjs/rest");
const { Client, Intents, Collection, VoiceBroadcast } = require("discord.js");
const { Routes } = require("discord-api-types/v9");

const config = require("./config.json");

const bot = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.DIRECT_MESSAGES
	]
});

const commandsFiles = fs.readdirSync(config.COMMANDS_DIR).filter(file => file.endsWith(".js"));
const commands = [];

bot.commands = new Collection();

for(let file of commandsFiles) {
	let command = require(`${config.COMMANDS_DIR}/${file}`);

	if(!command.is_disabled) {
		commands.push(command.data.toJSON());
		bot.commands.set(command.data.name, command);
	};
};

bot.once("ready", () => {
	bot.user.setActivity(config.ACTIVITY.name, {
		type: config.ACTIVITY.type,
	});

	console.log("Bot ready.");

	let CLIENT_ID = bot.user.id;

	let rest = new REST({
		version: "9"
	}).setToken(process.env.TOKEN);

	(async () => {
		try {
			if(process.env.ENV === "production") {
				await rest.put(Routes.applicationCommands(CLIENT_ID), {
					body: commands
				});
				console.log("Registered commands globally.");
			} else {
				await rest.put(Routes.applicationGuildCommands(CLIENT_ID, config.TEST_GUILD_ID), {
					body: commands
				});
				console.log("Registered commands locally.");
			};
		} catch(err) {
			if(err) console.error(err);
		};
	})();
});

bot.on("interactionCreate", (interaction) => {
	if(interaction.isCommand()) {
		let command = interaction.client.commands.get(interaction.commandName);

		if(!command) return;
		if(command.is_disabled) return;
	
		interaction.deferReply().then(() => {
			try {
				command.execute(interaction);
			} catch(err) {
				if(err) console.error(err);
		
				interaction.editReply({
					ephemeral: true,
					embeds: [
						new MessageEmbed()
						.setColor(config.COLORS.red)
						.setTitle(`${config.EMOTES.error} An error occured, please try again.`)
					],
					data: {
						type: 4
					}
				}).catch(() => {});
			};
		}).catch(() => {});
	};
});

Mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	ssl: true,
	user: process.env.DB_USER,
	pass: process.env.DB_PASS
}, err => {
	if(err) {
		console.error(err);
		return process.exit(1);
	};

	console.log("DB ready.");

	cache.update();
});

bot.login(process.env.TOKEN);