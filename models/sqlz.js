var Sequelize = require('sequelize');
module.exports = function (sequelize) {
	return {
		User: sequelize.define('user', {
			id: {
				type: Sequelize.STRING,
				primaryKey: true
			},
			password: {
				type: Sequelize.STRING
			},
			fb_id: {
				type: Sequelize.STRING
			},
			fb_name: {
				type: Sequelize.STRING
			},
			fb_email: {
				type: Sequelize.STRING
			},
			fb_token: {
				type: Sequelize.STRING	
			}
		}, {
			freezeTableName: true
		}),

		Post: sequelize.define('post2', {
			id: {
				type: Sequelize.STRING,
				primaryKey: true
			},
			time: {
				type: Sequelize.DATE
			},
			title: {
				type: Sequelize.STRING
			},
			source: {
				type: Sequelize.STRING
			},
			url: {
				type: Sequelize.STRING
			},
			tag: {
				type: Sequelize.STRING
			}

		}, {
			freezeTableName: true
		}),

		TagValue: sequelize.define('tagvalue', {
			id: {
				type: Sequelize.STRING,
				primaryKey: true
			},
			headline: {
				type: Sequelize.INTEGER
			},
			entertainment: {
				type: Sequelize.INTEGER
			},
			international: {
				type: Sequelize.INTEGER
			},
			sports: {
				type: Sequelize.INTEGER
			},
			finance: {
				type: Sequelize.INTEGER
			},
			supplement: {
				type: Sequelize.INTEGER
			},
			forum: {
				type: Sequelize.INTEGER
			},
			life: {
				type: Sequelize.INTEGER
			},
			china: {
				type: Sequelize.INTEGER
			},
			local: {
				type: Sequelize.INTEGER
			},
			society: {
				type: Sequelize.INTEGER
			},
			type: {
				type: Sequelize.STRING
			}
		}, {
			freezeTableName: true
		})
	}
}