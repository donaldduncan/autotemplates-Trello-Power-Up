/* global TrelloPowerUp */

//const axios = require('axios');
var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

var templatesList = document.getElementById('lists');
var isTemplateContent = document.getElementById('content-isTemplate');
var notTemplateContent = document.getElementById('content-notTemplate');
var makeTemplateBtn = document.getElementById('refresh');
var listsSelected = [];
var backendUrl = 'https://57725fbea36e.ngrok.io/';
var trelloUrl = 'https://api.trello.com/1/'

isTemplateContent.style.display = 'none';
notTemplateContent.style.display = 'none';

t.render(function () {
  return Promise.all([
    t.get('card', 'shared', 'templateLists'),
    t.lists('id', 'name'),
    t.card('id')
  ])
    .then(allData => {
      return axios.get('/isTemplate/' + allData[2].id)
        .then(res => {
          allData.push(res.data._value);
          return allData;
        })
    })

    .spread(function (savedLists, allLists, card, isTemplate) {
      console.log('got here!');
      isTemplate ? isTemplateContent.style.display = 'block' : notTemplateContent.style.display = 'block';

      templatesList.innerHTML = "";
      allLists.map((list, i) => {
        var el = document.createElement('option');
        el.textContent = list['name'];
        el.value = list['id'];
        templatesList.appendChild(el);
      })
      templatesList.setAttribute("size", `${allLists.length}`);

      if (savedLists /*&& /[a-z]+/.test(savedFruit)*/) {
        [...templatesList.options].map((opt, i) => {
          templatesList.options[i].selected = savedLists.indexOf(opt.value) >= 0;
        })
      }
    })
    .then(function () {
      t.sizeTo('#content')
        .done();
    })
    .catch((err) => console.log(err));
});

document.getElementById('update').addEventListener('click', function () {
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
      .then(() => {
        t.alert({
          message: 'Settings updated!'
        })
      })
      .then(() => {
        t.closePopup();
      })
  }
})
