import {TextMessage, WebhookRequestBody} from "@line/bot-sdk/dist/types";
import {Message} from "@line/bot-sdk";
import {Client} from "./line-client";

const CHANNEL_ACCESS_TOKEN = "YOUR ACCESS TOKEN";
const OWNER_USER_ID = "U6927223567093f97c9b8fcf548083f55";
//const GUEST_USER_ID = "Ue6424f988543579790fc628655df3ed2";

const enum commands {
  startNewGame,
  greet,
  successfulBinding,
  bindingStatus,
  serviceStatus
}

const commandsInfo = [
  ['!newguessgame', 'Start a new number guessing game.'],
  ['!greeting', '提示綁定訊息'],
  ['!successfulbinding', '綁定成功訊息'],
  ['!bindingstatus', '查詢是否已綁定'],
  ['!servicestatus', '目前服務狀態'],
];

// noinspection JSUnusedLocalSymbols
function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.HTML.HtmlOutput | GoogleAppsScript.Content.TextOutput {
  return HtmlService.createHtmlOutput("<b>What are you looking for?</b>");
}

// noinspection JSUnusedLocalSymbols
/** Necessary function */
function doPost(e: GoogleAppsScript.Events.DoPost): GoogleAppsScript.HTML.HtmlOutput | GoogleAppsScript.Content.TextOutput {
  const jsonObj = JSON.parse(e.postData.contents);

  // Not from Line platform
  if ("messages" in jsonObj) {
    internalRequestHandler(jsonObj as { messages: Array<Message> | any });
    return ContentService.createTextOutput();
  } else if (!("destination" in jsonObj && "events" in jsonObj)) {
    return ContentService.createTextOutput();
  }

  const lineJson = jsonObj as WebhookRequestBody;
  // Line platform connection test
  if (lineJson.events.length === 0) {
    console.info("LINE connection test");
    return HtmlService.createHtmlOutput();
  }

  console.log("Source: ", lineJson.events[0].source);

  const event = lineJson.events[0];
  // Not implemented yet
  if (!(event.type === "message" && event.message.type === "text")) {
    return HtmlService.createHtmlOutput();
  }

  const userMsg = event.message.text;
  let response: TextMessage | undefined;
  switch (userMsg) {
    case "!help":
      response = {
        type: "text",
        text: commandsInfo.map(arr => arr.join('\n')).join('\n'),
        quickReply: {
          items: [
            {
              type: "action",
              action: {
                type: "message",
                label: "Start a new game",
                text: commandsInfo[commands.startNewGame][0]
              }
            },
            {
              type: "action",
              action: {
                type: "message",
                label: "Rebinding",
                text: commandsInfo[commands.greet][0]
              }
            },
            {
              type: "action",
              action: {
                type: "message",
                label: "Successful binding",
                text: commandsInfo[commands.successfulBinding][0]
              }
            },
            {
              type: "action",
              action: {
                type: "message",
                label: "Binding status",
                text: commandsInfo[commands.bindingStatus][0]
              }
            },
            {
              type: "action",
              action: {
                type: "message",
                label: "Service status",
                text: commandsInfo[commands.serviceStatus][0]
              }
            },
          ]
        }
      };
      break;
    case commandsInfo[commands.startNewGame][0]:
      response = {
        type: "text",
        text: startNewGuessingGame()
      };
      break;
    case commandsInfo[commands.greet][0]:
      response = {
        type: "text",
        text: "請輸入於註冊頁面取得的認證碼："
      };
      break;
    case commandsInfo[commands.successfulBinding][0]:
      response = {
        type: "text",
        text: "帳號綁定成功！"
      };
      break;
    case commandsInfo[commands.bindingStatus][0]:
      response = {
        type: "text",
        text: "已綁定"
      };
      break;
    case commandsInfo[commands.serviceStatus][0]:
      response = {
        type: "text",
        text: "目前服務狀態正常"
      };
      break;
    default:
      const guessNumberRegex = /^!\d{1,2}$/;
      if (guessNumberRegex.test(userMsg)) {
        response = {
          type: "text",
          text: pickNumber(userMsg.substring(1))
        };
      } else {
        response = {
          type: "text",
          text: userMsg
        };
      }
      break;
  }

  const client = new Client({
    channelAccessToken: CHANNEL_ACCESS_TOKEN
  });
  const {replyToken} = event;
  const resp = client.replyMessage(replyToken, response);
  console.log("Reply response code: %d", resp.getResponseCode());

  return HtmlService.createHtmlOutput();
}

function sendMessage(msg: string) {
  const client = new Client({
    channelAccessToken: CHANNEL_ACCESS_TOKEN
  });
  const resp = client.pushMessage(OWNER_USER_ID, {
    type: "text",
    text: msg
  });
  console.log(resp.getContentText());
}

function internalRequestHandler(jsonObj: { messages: Array<Message> }) {
  const client = new Client({
    channelAccessToken: CHANNEL_ACCESS_TOKEN
  });

  let resp: GoogleAppsScript.URL_Fetch.HTTPResponse | undefined;
  try {
    resp = client.broadcast(jsonObj.messages);
  } catch (e) {
    console.error("Internal request error: " + e);
    return;
  }

  const statusCode = resp.getResponseCode();
  console.log("Broadcast response code: %d", statusCode);
  if (statusCode !== 200) {
    console.warn("Response message: ", resp.getContentText());
  }
}