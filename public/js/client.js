/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;

var TEMPLATESPLUS_ICON = './css/templates+.svg';

var boardButtonCallback = function (t) {
	return t.board("id")
		.then(boardId => {
			console.log('Processing board buttons!', t, boardId);
			return t.popup({
				title: 'Template cards',
				url: t.signUrl('./list-templates.html'),
				height: 50
			})
		})
		.catch(function (err) {
			console.error('Error: ', error);
		})
}

var cardButtonCallback = t => {
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
		url: t.signUrl('./settings.html'),
		height: 60
	})
}

TrelloPowerUp.initialize({
	// Start adding handlers for your capabilities here!
	'board-buttons': function (t, options) {
		return [{
			icon: TEMPLATESPLUS_ICON,
			title: 'Template cards',
			text: 'Templates+',
			condition: 'always',
			callback: boardButtonCallback
		}]
	},
	'card-buttons': function (t, options) {
		// check that viewing member has write permissions on this board

		if (options.context.permissions.board !== 'write') {
			return [];
		}
		return t
			.get('member', 'private', 'token')
			.then(function (token) {
				return [{
					title: 'Templates+',
					icon: TEMPLATESPLUS_ICON,
					text: 'Template settings',
//					callback: function (context) { 						
					callback: cardButtonCallback
							//cardButtonCallback
						//}
					//}
				}];
			})
			.catch(function (err) {
				console.error("We have a problem with card-buttons:", err);
			});
	}
}, {
	helpfulStacks: true
});
