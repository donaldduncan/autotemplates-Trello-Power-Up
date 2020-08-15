/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;

var TEMPLATESPLUS_ICON = './css/templates+.svg';

var boardButtonCallback = function (t) {
	return t.board("id")
		.then(boardId => {
			console.log('Processing board buttons!', t, boardId);
			return t.popup({
				title: 'Template cards',
				url: './list-templates.html',
				height: 50
			})
		})
		.catch(function (err) {
			console.error('Error: ', error);
		})
}

var cardButtonCallback = ([t, token]) => {
	console.log("t: ", t, token, t.getContext());
	if (!token) {
		console.log('no token!')
		context.popup({
			title: 'Authorize Your Account',
			url: './auth.html',
			height: 75
		});
	} else {
		return t.popup({
			title: 'Template+ settings',
			url: './settings.html',
			height: 60
		})
	}
}

TrelloPowerUp.initialize({
	// Start adding handlers for your capabilities here!
	'board-buttons': function (t, options) {
		if (options.context.permissions.board !== 'write') {
			return [];
		}
		return t
			.get('organization', 'private', 'token')
			.then(function (token) {
				return {
					icon: TEMPLATESPLUS_ICON,
					title: 'Template cards',
					text: 'Templates+',
					condition: 'always',
					callback: (t) => {
						if (token) {
							console.log('no token!')
							t.popup({
								title: 'Authorize Your Account',
								url: './auth.html',
								height: 75
							});
						} else {
							return t.board("id")
								.then(boardId => {
									console.log('Processing board buttons!', t, boardId);
									return t.popup({
										title: 'Template cards',
										url: './list-templates.html',
										height: 50
									})
								})
								.catch(function (err) {
									console.error('Error: ', error);
								})
						}
					}
				}
			})
	},
	'card-buttons': function (t, options) {
		console.log('options: ', options);
		// check that viewing member has write permissions on this board
		if (options.context.permissions.board !== 'write') {
			return [];
		}
		return t
			.get('organization', 'private', 'token')
			.then(function (token) {
				console.log('token: ', token);
				return {
					title: 'Templates+',
					icon: TEMPLATESPLUS_ICON,
					text: 'Template settings',
					//callback: cardButtonCallback([t, token]),
					callback: (t) => {
						console.log("t: ", t, token, t.getContext());
						if (token) {
							console.log('no token!')
							t.popup({
								title: 'Authorize Your Account',
								url: './auth.html',
								height: 75
							});
						} else {
							return t.popup({
								title: 'Template+ settings',
								url: './settings.html',
								height: 60
							})
						}
					},
				};
			})
			.catch(function (err) {
				console.error("We have a problem with card-buttons:", err);
			});
	}
}, {
	helpfulStacks: true
});
