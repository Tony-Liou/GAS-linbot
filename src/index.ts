import {WebhookRequestBody} from "@line/bot-sdk/dist/types";

const CHANNEL_ACCESS_TOKEN: string = "YOUR ACCESS TOKEN";
const OWNER_USER_ID: string = "U6927223567093f97c9b8fcf548083f55";

//const GROUP_ID: string = "";

function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.HTML.HtmlOutput | GoogleAppsScript.Content.TextOutput {
    return ContentService.createTextOutput("What are you looking for?")
        .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e: GoogleAppsScript.Events.DoPost): GoogleAppsScript.HTML.HtmlOutput | GoogleAppsScript.Content.TextOutput {
    const jsonObj: WebhookRequestBody = JSON.parse(e.postData.contents);
    //console.log(jsonObj.events[0].source);
    // Not from Line platform
    if (!("destination" in jsonObj) || !("events" in jsonObj)) {
        return HtmlService.createHtmlOutput();
    }

    // Line platform connection test
    if (jsonObj.events.length === 0) {
        console.info("LINE connection test");
        return HtmlService.createHtmlOutput();
    }

    const event = jsonObj.events[0];
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
                text: `${commandList[commands.startNewGame]}\nStart a new number guessing game.\n${commandList[commands.greet]}\n提示綁定訊息\n${commandList[commands.successfulBinding]}\n綁定成功訊息`
            };
            break;
        case commandList[commands.startNewGame]:
            const result = startNewGuessingGame();
            response = {
                type: "text",
                text: result
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
                const result = guessNumber(userMsg.substring(1));
                response = {
                    type: "text",
                    text: result
                };
            } else {
                response = {
                    type: "text",
                    text: userMsg
                };
            }
            break;
    }

    if (response !== undefined) {
        const client = new Client({
            channelAccessToken: CHANNEL_ACCESS_TOKEN
        });
        const {replyToken} = event;
        const resp = client.replyMessage(replyToken, response);
        console.log("Response code: " + resp.getResponseCode());
    }

    return HtmlService.createHtmlOutput();
}

function sendMessage(msg: string): void {
    const client = new Client({
        channelAccessToken: CHANNEL_ACCESS_TOKEN
    });
    const resp = client.pushMessage(OWNER_USER_ID, {
        type: "text",
        text: msg
    });
    console.log(resp.getContentText());
}