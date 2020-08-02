var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();
var trelloAuthUrl = `https://trello.com/1/authorize?expiration=never&name=Templates+&scope=read&key=ac13950b00cd7aef069ad1b211ccb850&callback_method=fragment&return_url=${window.location.origin}%2Fauth-success.html`;
var tokenLooksValid = function (token) {
    // If this returns false, the Promise won't resolve.
    return /^[0-9a-f]{64}$/.test(token);
}

document.getElementById('auth-btn').addEventListener('click', function () {
    t.authorize(trelloAuthUrl, { height: 680, width: 580, validToken: tokenLooksValid })
        .then(function (token) {
            // store the token in Trello private Power-Up storage
            return t.set('organization', 'private', 'token', token)
                .catch(t.NotHandled, function () {
                    // sometimes that may not work
                    // the best example is if this member is a member of the board
                    // but not a member of the team
                    // in that case we fall back to storing it at the board
                    return t.set('board', 'private', 'token', token);
                })
        })
        .then(function () {
            // now that we have the token, let the user continue
            return t.closePopup();
        });
});


window.Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

var trelloAuthUrl = 'https://trello.com/1/authorize?';

// you'll want to update these for your own app :)
var authParams = {
    name: 'Templates+',
    expiration: 'never',
    scope: 'read,write',
    key: 'ac13950b00cd7aef069ad1b211ccb850',
    callback_method: 'fragment',
    return_url: 'https://' + window.location.host + '/auth-success.html',
};

var params = Object.keys(authParams);
params.forEach(function (param) {
    trelloAuthUrl += param + '=' + encodeURIComponent(authParams[param]) + '&';
});

var tokenLooksValid = function (token) {
    return /^[0-9a-f]{64}$/.test(token);
}

document.getElementById('auth-btn').addEventListener('click', function () {
    t.authorize(trelloAuthUrl, { height: 680, width: 580, validToken: tokenLooksValid })
        .then(function (token) {
            // store the token in Trello private Power-Up storage
            return t.set('member', 'private', 'token', token)
        })
        .then(function () {
            // now that we have the token, let the user continue
            return t.closePopup();
        });
});