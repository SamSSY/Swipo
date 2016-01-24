var Sequelize = require('sequelize');
module.exports = function (sequelize) {
	return {
		User: sequelize.define('user', {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true
			},
			password: {
				type: Sequelize.STRING
			},
			fb_id: {
				type: Sequelize.INTEGER,
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
			url: {
				type: Sequelize.STRING
			},
			source: {
				type: Sequelize.STRING
			},
			tag: {
				type: Sequelize.STRING
			}

		}, {
			freezeTableName: true
		})
	}
}