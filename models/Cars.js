const Mongoose = require("mongoose");

let Schema = Mongoose.Schema({
	car_id: String,
	model: String,
	brand: String,
	max_star: Number,
	refill: String,
	added: String,
	fuels: Number,
	rarity: String,
	class: String,
	stats: Object,
	blueprints: Object,
	ranks: Object,
	parts: Object,
	upgrades_stages: Array,
	per_stars_upgrades: Array,
	electric: Boolean,
	images: Array,
	nitro_speeds: Object,
	drift_speed: Number,
	air_speed: Number,
	shop: Object,
	decals: Array,
	review: String,
	start_accel: String,
	nitro_duration: Object,
	shortcuts: Array,
	comments: String,
	specs: Object,
	walltest: Object
});

module.exports = Mongoose.model("Cars", Schema);