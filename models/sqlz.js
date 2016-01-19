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

		Post: sequelize.define('post', {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true
			},
			time: {
				type: Sequelize.DATE
			},
			title: {
				type: Sequelize.STRING
			},
			path: {
				type: Sequelize.STRING
			},
			source: {
				type: Sequelize.STRING
			},
			views: {
				type: Sequelize.INTEGER
			},
			author: {
				type: Sequelize.STRING
			}
		}, {
			freezeTableName: true
		})
	}
}