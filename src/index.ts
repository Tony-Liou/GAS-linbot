import { WebhookRequestBody } from "@line/bot-sdk/dist/types";

const CHANNEL_ACCESS_TOKEN: string = "rCpuGHQiXxXQPwCyLt2eIBQ2a7jiLybtU32jyoSMJVRw4ROmHNLYItRj127W05KosPbNRSa7lmGTU0PvPLCtbMH90gowmehhA+PpkQjDlMDg/q99XsZMcHzQZMaSlGG1mg8xdG7S8H9uGPXy2jaLDAdB04t89/1O/w1cDnyilFU=";
const GROUP_ID: string = "";

function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.HTML.HtmlOutput | GoogleAppsScript.Content.TextOutput {
    return ContentService.createTextOutput("What are you looking for?")
        .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e: GoogleAppsScript.Events.DoPost): GoogleAppsScript.HTML.HtmlOutput | GoogleAppsScript.Content.TextOutput {
    const jsonObj: WebhookRequestBody = JSON.parse(e.postData.contents);
    console.info(jsonObj);
    Logger.log(jsonObj);
    // Not from Line platform
    if (!("destination" in jsonObj) || !("events" in jsonObj)) {
        return HtmlService.createHtmlOutput();
    }

    // Line platform connection test
    if (jsonObj.events.length === 0) {
        return HtmlService.createHtmlOutput();
    }

    const event = jsonObj.events[0];
    if (!(event.type === "message" && event.message.type === "text")) {
        return HtmlService.createHtmlOutput();
    }

    const userMsg = event.message.text;
    let response: TextMessage | undefined;
    switch (userMsg) {
        case "!help":
            response = {
                text: "Help what?",
                type: "text"
            };
            break;
        case "!newguessgame":
            const result = startNewGuessingGame();
            response = {
                type: "text",
                text: result
            };
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
        const { replyToken } = event;
        const resp = client.replyMessage(replyToken, response);
        console.log(resp.getResponseCode());
    }

    return HtmlService.createHtmlOutput();
}