import { TeamsActivityHandler, CardFactory, TurnContext, Attachment } from "botbuilder";
import { analyze } from "./cognitiveService";
const rawWelcomeCard = require("./adaptiveCards/welcome.json");
const rawResultCard = require("./adaptiveCards/analysisResult.json");
const ACData = require("adaptivecards-templating");

export class TeamsBot extends TeamsActivityHandler {

  constructor() {
    super();

    this.onMessage(async (context, next) => {
      let txt = context.activity.text;
      const removedMentionText = TurnContext.removeRecipientMention(
        context.activity
      );
      if (removedMentionText) {
        // Remove the line break
        txt = removedMentionText.trim();
      }

      // send the text for analysis and render the result
      const analysisResult = await analyze(txt);
      const card = this.renderAdaptiveCard(rawResultCard, analysisResult);
      await context.sendActivity({ attachments: [card] });

      await next();
    });

    // This event will fire the first time a user creates a conversation with this bot
    this.onMembersAdded(async (context, next) => {
      const card = this.renderAdaptiveCard(rawWelcomeCard);
      await context.sendActivity({ attachments: [card] });
      await next();
    });
  }

  // Bind AdaptiveCard with data
  renderAdaptiveCard(rawCardTemplate: any, dataObj?: any): Attachment {
    const cardTemplate = new ACData.Template(rawCardTemplate);
    const cardWithData = cardTemplate.expand({ $root: dataObj });
    const card = CardFactory.adaptiveCard(cardWithData);
    return card;
  }
}

