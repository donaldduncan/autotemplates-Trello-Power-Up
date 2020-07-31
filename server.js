const dotenv = require('dotenv').config();
const compression = require('compression');
const cors = require('cors');
const TrelloWebhookServer = require('@18f/trello-webhook-server');
const Trello = require('trello');
const restify = require('restify');

const app = restify.createServer({ name: 'Restify Server' });
const trello = new Trello(process.env.TRELLO_API_KEY, process.env.TRELLO_API_TOKEN);

// your manifest must have appropriate CORS headers, you could also use '*'
app.use(cors());

// compress our client side content before sending it over the wire
//app.use(compression());


var trello_link = "https://trello.com";
var output = [];
const ngrok = 'https://b66fbc5cba2c.ngrok.io';
const thisPluginId = '5f05809aa235002f1d9ba1d8';

const trelloWHServer = new TrelloWebhookServer({
  server: app,
  hostURL: ngrok + '/webhooks/trello',  //'https://' + process.env.PROJECT_DOMAIN + '.glitch.me/webhooks/trello',
  apiKey: process.env.TRELLO_API_KEY,
  apiToken: process.env.TRELLO_API_TOKEN,
  clientSecret: process.env.SECRET
});

function processWebhook(action) {
  const triggerActions = ["emailCard", "createCard", "updateCard", "copyCard", "moveCardToBoard", "convertToCardFromCheckItem", "moveListToBoard", "updateCard"];
  if (!triggerActions.includes(action.type) || (action.type == "updateCard" && !action.data.listAfter)) return;

  getCardAsync(action.data.card.id)
    .then(triggerCard => {
      return getAllTemplatesAsync(action.data.board.id).then(allTemplates => [allTemplates, triggerCard])
    })
    .then(([allTemplates, triggerCard]) => {
      console.log(allTemplates);
      
      var triggeredTemplates = allTemplates.filter(template => {
        var data = template.pluginData.filter(item => item.idPlugin == thisPluginId);
        return data[0] ? JSON.parse(data[0].value).templateLists.includes(triggerCard.idList) : false;
      });
      
      console.log(triggeredTemplates);
      console.log(triggerCard);

      processCard(triggerCard, triggeredTemplates, action.type)

      //return [triggeredTemplates, triggerCard];
    //})
    //.then(([templates, card]) => {
      //console.log(triggeredTemplates);
      //triggeredTemplates.map(template => {
        //template.checklists.length ? console.log("got one!", template.checklists[0].checkItems[0].name) : false;
      //});
    })
    .catch(err => {
      console.error(err);
    })
}

var processCard = (card, templateCards, actionType) => {
 
  // var addDescription = false;
 
  // Don't process template cards
  if (card.isTemplate) return;
 
/* // Use the description from the template if no current description:
  if (card.desc.trim() == "" && templateCard.desc.trim() != "") {
    addCardDescription(card, templateCard);
  }
 
  // If no current due date, calculate from template card:
  if (templateCard.desc.indexOf("today+") !== -1) {
    addDueDate(card, templateCard);
  } */
 
  // Add any missing checklists/checklist items:
  checkForMissingChecklists(templateCards, card)
 
}



var createCardText = function (action) {
  return (cardLink(action.data.card)) + " added by " + action.memberCreator.fullName;
};

var commentCardText = function (action) {
  return "New comment on " + (cardLink(action.data.card)) + " by " + action.memberCreator.fullName + "\n" + action.data.text;
};

var updateCardText = function (action) {
  if ("closed" in action.data.card) {
    if (action.data.card.closed) {
      return (cardLink(action.data.card)) + " archived by " + action.memberCreator.fullName;
    } else {
      return (cardLink(action.data.card)) + " un-archived by " + action.memberCreator.fullName;
    }
  } else if ("listAfter" in action.data && "listBefore" in action.data) {
    return (cardLink(action.data.card)) + " moved to " + action.data.listAfter.name + " by " + action.memberCreator.fullName;
  } else if ('pos' in action.data.old) {
    return (cardLink(action.data.card)) + " changed position, by " + action.memberCreator.fullName;
  } else if ('isTemplate' in action.data.old) {
    return (cardLink(action.data.card)) + " template status changed, by " + action.memberCreator.fullName;
  } else {
    return ("I don't know what to do with this:" + JSON.stringify(action));
  }
};

var cardLink = function (card) {
  return `<a href='${trello_link}/c/${card.shortLink}' target='_new'>${card.name}</a>`;
};

var boardLink = function (board) {
  return "<a href='" + trello_link + "/b/" + board.shortLink + "' target='_new'>" + board.name + "</a>";
};

var msgText = function (action) {
  switch (action.type) {
    case 'createCard':
      return createCardText(action);
    case 'commentCard':
      return commentCardText(action);
    case 'updateCard':
      return updateCardText(action);
    default:
      return action.type + " not understood";
  }
};

app.head("/", function (req, res, next) {
  res.end();
  return next();
});

app.get("/webhooks", function (req, res, next) {
  res.send(output);
  return next();
});

app.get('*', restify.plugins.serveStatic({
  directory: __dirname + '/public',
  default: 'index.html'
}));

app.get('/isTemplate/:cardId', (req, res) => {
  trello.makeRequest('get', `/1/cards/${req.params.cardId}/isTemplate`)
    .then((isTemplate => {
      res.send(isTemplate);
    }))
    .catch((err) => {
      console.error('An error occurred:', err);
      res.error(err);
    })
})

app.get('/allTemplates/:boardId', (req, res) => {
  getAllTemplatesAsync(req.params.boardId)
    .then((allTemplates) => {
      res.send(allTemplates)
    })
    .catch((err) => {
      console.error('An error occurred:', err);
      res.error(err);
    })
})

app.put('/makeTemplate/:id', (req, res) => {
  trello.updateCard(req.params.id, 'isTemplate', true)
    .then(() => {
      res.end();
    })
    .catch((err) => {
      console.error('An error occurred:', err);
      res.error(err);
    })
})

app.get("/pluginData/:id", (req, res) => {
  getPluginDataAsync(req.params.id)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log('Oops, that didn\'t work!: ', err);
    })
})

// listen for requests :)
app.listen(process.env.PORT, () => {
  console.info(`Node Version: ${process.version}`);
  console.log('Trello Power-Up Server listening on port ' + app.address().port);

  trelloWHServer.start(process.env.MODEL_ID)
    .then(webhookID => {
      console.log(`Webhook ID: ${webhookID}`);
      trelloWHServer.on('data', event => {
        console.log(msgText(event.action));
        output.push(msgText(event.action));
        processWebhook(event.action)
      });
    })
    .catch(err => {
      console.log('Error getting Trello webhook', err);
    });

});;

var getAllTemplatesAsync = boardId => {
  return new Promise((resolve, reject) => {
    //trello.getCardsOnBoardWithExtraParams(boardId, { checklists: 'all', pluginData: true })
    trello.makeRequest("get", `/1/boards/${boardId}/cards/all`, { checklists: 'all', pluginData: true })
      .then((cards) => {
        console.log("all cards:", cards);
        var templateCards = cards.filter(c => c.isTemplate);
        resolve(templateCards);
      })
      .catch((error) => {
        console.log('Error getting templates!: ', error);
      })
  })
}

var getCardAsync = cardId => trello.makeRequest('get', `/1/cards/${cardId}`, { checklists: 'all' });


var getPluginDataAsync = cardId => {
  return new Promise(resolve => {
    trello.makeRequest('get', `/1/cards/${cardId}/pluginData`)
      .then((data) => {
        var thisPlugin = data.filter(item => item.idPlugin === "5f05809aa235002f1d9ba1d8");
        resolve(JSON.parse(thisPlugin[0].value));
      })
      .catch((err) => {
        console.log(' ' + err);
      })
  })
}

var checkForMissingChecklists = (templates, card) => {
  for (var i = 0; i < templates.length; i++) {
    for (var j = 0; j < templates[i].checklists.length; j++) {
      var matchingChecklist = getMatchingCheckList(templates[i].checklists[j].name, card);
      if (matchingChecklist == null) {
        copyChecklist(card, templates[i].checklists[j].id, templates[i].checklists[j].name);
      }
      else {
        syncChecklistItems(card, templates[i].checklists[j], matchingChecklist);
      }
    }
  }
}

var getMatchingCheckList = (name, card) => {
  
  var index = 0;
  for (var i=0; i < card.checklists.length; i++) {
    
    if (card.checklists[i].name == name) {
       return card.checklists[i];
    }  
  }
  
  return null;
  
}

var copyChecklist = (card, fromChecklistId, fromCheckListName) => {

  trello.addExistingChecklistToCard(card.id, fromChecklistId)
  .catch(err => console.log(err));
  
}

function syncChecklistItems(card, templateChecklist, matchingChecklist) {
  
  for (var i = 0; i < templateChecklist.checkItems.length; i++) {
    
    var checkItemFound = false;
    
    for (var j = 0; (j < matchingChecklist.checkItems.length && !checkItemFound); j++) {
      if (matchingChecklist.checkItems[j].name == templateChecklist.checkItems[i].name) {
        checkItemFound = true;
        if (templateChecklist.checkItems[i].state == "complete") {
          deleteChecklistItem(matchingChecklist.id, matchingChecklist.checkItems[j].id);
        }
      }
    }
    
    if (templateChecklist.checkItems[i].state == "incomplete" && !checkItemFound) {
      addChecklistItem(matchingChecklist.id,templateChecklist.checkItems[i].name);
    }
    
  }
  
}

var addChecklistItem = (checklistId, name) => {

  trello.addItemToChecklist(checklistId, name)
  .catch(err => console.log(err));
  
}

var deleteChecklistItem = (checklistId, checklistItemId) => {

  trello.makeRequest('delete', `/1/checklists/${checklistId}/checkItems${checklistItemId}`)
  .catch(err => console.log(err));
  
}

var addCardDescription = (card, templateCard) => {
  
  var description = templateCard.desc.replace(/(\+\d+(\s?)+(weeks|w))|((today\+)\d+)/g, "").trim()
   
  var url = constructTrelloURL("cards/" + card.id + "?desc=" + encodeURIComponent(description));
  var resp = UrlFetchApp.fetch(url, {"method": "put"});
  
}

var addDueDate = (card, templateCard) => {
  if (card.due) {
    var duePrevious = new Date(card.due);//.toLocaleDateString();
    duePrevious.setDate(duePrevious.getDate() - 1);
    duePrevious = duePrevious.toLocaleDateString();
    
    var description;
    card.desc ? description = card.desc + "\n\n" : description = "";
    description += "Previously due: " + duePrevious;
    
    var url = constructTrelloURL("cards/" + card.id + "?desc=" + encodeURIComponent(description));
    var resp = UrlFetchApp.fetch(url, {"method": "put"});
  }
  
  var date = new Date();
  var weeksAdded = templateCard.desc.substr(templateCard.desc.indexOf("today+")+6,2)
  
  date.setDate(date.getDate() + (7 * parseInt(weeksAdded)));
  
  var url = constructTrelloURL("cards/" + card.id + "?due=" + encodeURIComponent(date.toISOString()));
  var resp = UrlFetchApp.fetch(url, {"method": "put"});
  Logger.log("Add due date");
}

var updateCardName = (card, newCardName) => {
  
  var url = constructTrelloURL("card/" + card.id + "/name?value=" + encodeURIComponent(newCardName));
  var resp = UrlFetchApp.fetch(url, {"method": "put"});
  Logger.log("Updated card name");
}