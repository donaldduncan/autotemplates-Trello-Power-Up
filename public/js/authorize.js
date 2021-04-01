var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();
var apiKey = t.arg('apiKey'); // Passed in as an argument to our iframe
var trelloAuthUrl = `https://trello.com/1/authorize?expiration=1hour&name=Example%20Trello%20Power-Up&scope=read&key=${apiKey}&callback_method=fragment&return_url=${window.location.origin}%2Fauth-success.html`;
var tokenLooksValid = function (token) {
    // If this returns false, the Promise won't resolve.
    return /^[0-9a-f]{64}$/.test(token);
}

document.getElementById('auth-btn').addEventListener('click', function () {
    t.authorize(trelloAuthUrl, { height: 680, width: 580, validToken: tokenLooksValid })
        .then(function (token) {
            // store the token in Trello private Power-Up storage
            return t.set('member', 'private', 'token', token)
        })
        .then(function () {
            // now that we have the token we needed lets go on to letting
            // the user do whatever they need to do.
            return t.closePopup();
        });
    });