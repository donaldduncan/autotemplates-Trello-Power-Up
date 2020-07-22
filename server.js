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



const trelloWHServer = new TrelloWebhookServer({
  server: app,
  hostURL: ngrok + '/webhooks/trello',  //'https://' + process.env.PROJECT_DOMAIN + '.glitch.me/webhooks/trello',
  apiKey: process.env.TRELLO_API_KEY,
  apiToken: process.env.TRELLO_API_TOKEN,
  clientSecret: process.env.SECRET
});

function processWebhook(action) {


  //  We're only interested in actions relating to a card being created on the board.
  if (action.type == "emailCard" ||
    action.type == "createCard" ||
    action.type == "updateCard" ||
    action.type == "copyCard" ||
    action.type == "moveCardToBoard" ||
    action.type == "convertToCardFromCheckItem" ||
    action.type == "moveListToBoard") {
    if (action.type == "updateCard" &&
      action.data.listAfter) {
      action.type = "updateCard:idList";
    }
    if (action.display.translationKey.includes('action_moved_card')) { return; }

    processCardFromWebhook(action.data, action.type);
  }
}

function processCardFromWebhook(data, actionType) {
  getAllTemplates(data);

  //var templateCard = getTemplateForCard(card, templates);
  //trello.getCard(card.idBoard, card.id, result => {processCard(result, templateCard, actionType)});
  //var checklistIds  = getChecklistIds(checklists);
  //processCard(card,templateCard,actionType);

}

/* function getTemplateForCard(card, templates) {

  if (templates && templates.length == 0) {
    return [];
  }
  else if (templates.length == 1 && templates[0].isForAllCards == true) {
    return templates[0];
  }
  else {
    var listName = getNameWithoutLimit(card.list.name);

    for (var i = 0; i < templates.length; i++) {
      if (card.list && templates[i].name.trim() === listName) {
        return templates[i];
      }
    }
  }

  return [];

} */

/* function processCard(card, templateCard, actionType) {

  // var addDescription = false;

  // Don't process template card
  if (card.id == templateCard.id || !templateCard.id || card.idList == process.env.idList) {
    return;
  }

  // Use the description from the template if no current description:
  if (card.desc.trim() == "" && templateCard.desc.trim() != "") {
    addCardDescription(card, templateCard);
  }

  // If no current due date, calculate from template card:
  if (templateCard.desc.indexOf("today+") !== -1) {
    addDueDate(card, templateCard);
  }

  // Add any missing checklists/checklist items:
  checkForMissingChecklists(card, templateCard)

} */



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
  getAllTemplates(req.params.boardId)
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
  getPluginData(req.params.id)
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

function getAllTemplates(boardId) {
  return new Promise((resolve, reject) => {
    trello.getCardsOnBoard(boardId)
      .then((cards) => {
        var templateCards = cards.filter(c => c.isTemplate);
        resolve(templateCards);
      })
      .catch((error) => {
        console.log('Oops, that didn\'t work!: ' + error);
      })
  })
}

function getPluginData(cardId) {
  return new Promise((resolve, reject) => {
    trello.makeRequest('get', `/1/cards/${cardId}/pluginData`)
      .then((data) => {
        var thisPlugin = data.filter(item => item.idPlugin === "5f05809aa235002f1d9ba1d8");
        resolve(JSON.parse(thisPlugin[0].value));
      })
      .catch((err) => {
        console.log('Oops, that didn\'t work!: ' + err);
      })
  })
}