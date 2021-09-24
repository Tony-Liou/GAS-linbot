import {TextMessage, WebhookRequestBody} from "@line/bot-sdk/dist/types";
import {Message} from "@line/bot-sdk";
import {Client} from "./line-client";

const CHANNEL_ACCESS_TOKEN = "YOUR ACCESS TOKEN";
const OWNER_USER_ID = "U6927223567093f97c9b8fcf548083f55";
const GUEST_USER_ID = "Ue6424f988543579790fc628655df3ed2";

function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.HTML.HtmlOutput | GoogleAppsScript.Content.TextOutput {
  return HtmlService.createHtmlOutput("<b>What are you looking for?</b>");
}

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

  const enum commands {
    startNewGame,
    greet,
    successfulBinding
  }

  const commandList = ['!newguessgame', '!greeting', '!successfulbinding'];

  const userMsg = event.message.text;
  let response: TextMessage | undefined;
  switch (userMsg) {
    case "!help":
      response = {
        type: "text",
        text: `${commandList[commands.startNewGame]}\nStart a new number guessing game.\n${commandList[commands.greet]}\n提示綁定訊息\n${commandList[commands.successfulBinding]}\n綁定成功訊息`,
        quickReply: {
          items: [
            {
              type: "action",
              action: {
                type: "message",
                label: "Start a new game",
                text: commandList[commands.startNewGame]
              }
            },
            {
              type: "action",
              action: {
                type: "message",
                label: "Rebinding",
                text: commandList[commands.greet]
              }
            },
            {
              type: "action",
              action: {
                type: "message",
                label: "Successful binding",
                text: commandList[commands.successfulBinding]
              }
            },
          ]
        }
      };
      break;
    case commandList[commands.startNewGame]:
      response = {
        type: "text",
        text: startNewGuessingGame()
      };
      break;
    case commandList[commands.greet]:
      response = {
        type: "text",
        text: "請輸入於註冊頁面取得的認證碼："
      };
      break;
    case commandList[commands.successfulBinding]:
      response = {
        type: "text",
        text: "帳號綁定成功！"
      }
      break;
    default:
      const guessNumberRegex = /^!\d{1,2}$/;
      if (guessNumberRegex.test(userMsg)) {
        response = {
          type: "text",
          text: guessNumber(userMsg.substring(1))
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