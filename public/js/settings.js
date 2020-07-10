/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

var listSelector = document.getElementById('lists');
var vegetableSelector = document.getElementById('vegetable');

t.render(function(){
  return Promise.all([
    t.get('card', 'shared', 'templateLists'),
    t.get('board', 'private', 'vegetable'),
    t.lists('id', 'name')
  ])
  .spread(function(savedLists, savedVegetable, templatelists){
    
    templatelists.map((list, i) => {
      var item = list[i];
      var el = document.createElement('option');
      el.textContent = item[0];
      el.value = item[1];
      listSelector.appendChild(el);
    })

    if(savedLists /*&& /[a-z]+/.test(savedFruit)*/){
      listSelector.value = savedLists;
    }
    if(savedVegetable && /[a-z]+/.test(savedVegetable)){
      vegetableSelector.value = savedVegetable;
    }
  })
  .then(function(){
    t.sizeTo('#content')
    .done();
  })
});

document.getElementById('save').addEventListener('click', function(){
  return t.set('card', 'private', 'vegetable', vegetableSelector.value)
  .then(function(){
    return t.set('board', 'shared', 'fruit', fruitSelector.value);
  })
  .then(function(){
    t.closePopup();
  })
})
