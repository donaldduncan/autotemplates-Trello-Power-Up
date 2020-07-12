/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

var listSelector = document.getElementById('lists');
var vegetableSelector = document.getElementById('vegetable');

t.render(function () {
  return Promise.all([
    t.get('card', 'shared', 'templateLists'),
    t.get('board', 'private', 'vegetable'),
    t.lists('id', 'name'),
    t.getContext('all')
  ])
    .spread(function (savedLists, savedVegetable, templatelists, context) {

      console.log('Context: ', context);

      templatelists.map((list, i) => {
        var el = document.createElement('option');
        el.textContent = list['name'];
        el.value = list['id'];
        listSelector.appendChild(el);
      })
      listSelector.setAttribute("size", `${templatelists.length}`);
      console.log(Array(listSelector.options));
      listsSelected = Array(...listSelector.options).reduce((acc, option) => {
        if (option.selected) {
          acc.push(option.value);
        }
        return acc;
      }, []);

      if (savedLists /*&& /[a-z]+/.test(savedFruit)*/) {
        listSelector.value = savedLists;
      }
      if (savedVegetable && /[a-z]+/.test(savedVegetable)) {
        vegetableSelector.value = savedVegetable;
      }
    })
    .then(function () {
      t.sizeTo('#content')
        .done();
    })
});

document.getElementById('save').addEventListener('click', function () {
  var card = t.getContext('all');
  console.log(card);
  console.log(listsSelected);
  return t.set(`${card.card}`, 'private', 'vegetable', vegetableSelector.value)
    .then(function () {
      return t.set('card', 'shared', 'templateLists', listSelector.value);
    })
})
