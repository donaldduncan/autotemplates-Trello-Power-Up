/* global TrelloPowerUp */

//const axios = require('axios');
var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

var templatesList = document.getElementById('templatesList');
var backendUrl = 'https://57725fbea36e.ngrok.io/';
var trelloUrl = 'https://api.trello.com/1/'

t.render(function () {
  return Promise.all([
    t.board('id'),
    t.args(token)
  ])
    .then(board => {
      return axios.get('/allTemplates/' + board[0].id, {token: token})
    })
    .then(function (allTemplates) {
      templatesList.innerHTML = "";
      allTemplates.data.map((template, i) => {
        var el = document.createElement('li');
        el.innerHTML = `<div class="card-container">
                          <div class="card-component">
                          ${template.name}
                          </div>
                        </div>`;

        templatesList.appendChild(el);
      })
      return (allTemplates.data)
    })
    .then(function (allTemplates) {
      console.log("allTemplates", allTemplates)

      const containers = document.getElementsByClassName('card-component');
      [...containers].map((el, i) => {
        const cardEl = document.createElement('trello-card');
        cardEl.card = allTemplates[i];
        el.innerHTML = '';
        el.appendChild(cardEl);
      })
    })
    .then(function () {
      t.sizeTo('#content')
        .done();
    })
    .catch((err) => console.log(err));
});

/* document.getElementById('save').addEventListener('click', function () {
  listsSelected = [...templatesList.selectedOptions].map(opt => opt.value);
  return t.set('card', 'shared', 'templateLists', [])
    .then(() => {
      return t.set('card', 'shared', 'templateLists', listsSelected)
    })
    .then(() => {
      t.alert({
        message: 'Settings updated!'
      });
    })
    .then(() => {
      t.closePopup();
    })
})

makeTemplateBtn.addEventListener('click', () => {
  if (t.memberCanWriteToModel('card')) {
    t.card('id')
      .then(card => {
        console.log('Card: ', card);
        axios.put('/makeTemplate/' + card.id);
      })
  }
})
 */