const Cars = require("./models/Cars");

const cache = {};

module.exports = {
	get(type) {
		switch(type) {
			case "CARS":
				return cache.cars;
			break;
		
			default:
				return cache;
			break;
		};
	},
	update: (type) => new Promise((resolve, reject) => {
		switch(type) {
			case "CARS":
				Cars.find({}, (err, cars) => {
					if(err) {
						reject();
						return console.error(err);
					};
					
					cache.cars = cars;
		
					resolve();
				}).lean();
			break;
		
			default:
				Cars.find({}, (cars_err, cars) => {
					if(cars_err) {
						reject();
						return console.error(cars_err);
					};
					
					cache.cars = cars;
					resolve();
				}).lean();
			break;
		};
	}),
};