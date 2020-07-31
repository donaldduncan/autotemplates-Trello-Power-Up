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
	console.log("here", t);
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
		return t
			.set("member", "shared", "hello", "world")
			.then(function () {
				return {
					title: 'Templates+',
					icon: TEMPLATESPLUS_ICON,
					text: 'Template settings',
					callback: cardButtonCallback /* {
						type: 'iframe',
						url: t.signUrl('./section.html'),
						height: 230
					} */
				};
			})
			.catch(function (err) {
				console.error("We have a problem:", err);
			});
	}
}, {
	helpfulStacks: true
});
