// server.js
// where your node app starts
debugger; console.log('debugger');
const compression = require('compression');
const cors = require('cors');
const TrelloWebhookServer = require('@18f/trello-webhook-server');
const express = require('express');
const Trello = require('trello');

const app = express();
const trello = new Trello(process.env.TRELLO_API_KEY, process.env.TRELLO_API_TOKEN);
var count = 0;
var webhookReceived = 0;

// your manifest must have appropriate CORS headers, you could also use '*'
app.use(cors());

// compress our client side content before sending it over the wire
//app.use(compression());

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));



//TRELLO WEBHOOK SERVER

var trello_link = "https://trello.com";
var output = [];



// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.info(`Node Version: ${process.version}`);
  console.log('Trello Power-Up Server listening on port ' + listener.address().port);

  trelloWHServer.start(process.env.MODEL_ID)
    .then(webhookID => {
      console.log(`Webhook ID: ${webhookID}`);
      trelloWHServer.on('data', event => {
        webhookReceived += 1;
        console.log('webhook no. ' + webhookReceived, msgText(event.action));
        output.push(msgText(event.action));
        processWebhook(event.action)
      });
    })
    .catch(e => {
      console.log('Error getting Trello webhook');
      console.log(e);
    });

  });;
  
const trelloWHServer = new TrelloWebhookServer({
  server: listener,
  hostURL: 'https://' + process.env.PROJECT_DOMAIN + '.glitch.me/webhooks/trello',
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

    processCardFromWebhook(action.data, action.type);
  }
}

function processCardFromWebhook(data, actionType) {
  count += 1;
  let allCards = trello.getCardsOnBoard(data.board.id);

  allCards.then((cards) => {
    var templateCards = cards.filter(c => c.isTemplate);
    console.log(`FILTERED CARDS ${count}:`);//,
    //templateCards);
  })
    .catch((error) => {
      console.log('Oops, that didn\'t work!: ' + error);
    })

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

/* // http://expressjs.com/en/starter/basic-routing.html
app.get("*", function (request, response) {
  response.sendFile(__dirname + '/public/index.html');
}); */
