/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

var templatesList = document.getElementById('lists');
var isTemplateContent = document.getElementById('content-isTemplate');
var notTemplateContent = document.getElementById('content-notTemplate');
var makeTemplateBtn = document.getElementById('refresh');
var listsSelected = [];

isTemplateContent.style.display = 'none';
notTemplateContent.style.display = 'none';

t.render(function () {
  return Promise.all([
    t.get('card', 'shared', 'templateLists'),
    t.lists('id', 'name'),
    t.card('id'),
    t.get('organization', 'private', 'token')
  ])
    .then(resolvedPromises => {
      return axios.get('/isTemplate/' + resolvedPromises[2].id, { token: resolvedPromises[3].token })
        .then(res => {
          resolvedPromises.push(res.data._value);
          return resolvedPromises;
        })
    })
    .spread(function (savedLists, allLists, card, isTemplate) {
      console.log('got here!');
      var content = isTemplate
        ? isTemplateContent
        : notTemplateContent;
      content.style.display = 'block';

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
    return Promise.all([
      t.card('id'),
      t.get('organization', 'private', 'token')
    ])
      .then(all => {
        console.log(all[0].id);
        axios.put('/makeTemplate/' + all[0].id, { token: all[1].token });
      })
      .then(() => {
        t.alert({
          message: 'Settings updated!'
        })
      })
      .then(() => {
        t.closePopup();
      })
      .catch(err => console.error(err))
  }
})
