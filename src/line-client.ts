const MESSAGING_API_PREFIX = "https://api.line.me/v2/bot";

export type TextMessage = {
  type: "text";
  /**
   * Message text. You can include the following emoji:
   *
   * - Unicode emoji
   * - LINE original emoji
   *   ([Unicode codepoint table for LINE original emoji](https://developers.line.biz/media/messaging-api/emoji-list.pdf))
   *
   * Max: 2000 characters
   */
  text: string;
};

type Message =
  | TextMessage
/*| ImageMessage
| VideoMessage
| AudioMessage
| LocationMessage
| StickerMessage
| ImageMapMessage
| TemplateMessage
| FlexMessage*/;

interface Config {
  channelAccessToken?: string;
  channelSecret?: string;
}

interface ClientConfig extends Config {
  channelAccessToken: string;
}

export class Client {
  private http: HTTPClient;

  constructor(config: ClientConfig) {
    if (!config.channelAccessToken) {
      throw new Error("no channel access token");
    }

    this.http = new HTTPClient(config);
  }

  public pushMessage(
    to: string,
    messages: Message | Message[],
    notificationDisabled: boolean = false,
  ): GoogleAppsScript.URL_Fetch.HTTPResponse {
    return this.http.post(
      `${MESSAGING_API_PREFIX}/message/push`,
      JSON.stringify({
        messages: toArray(messages),
        to: to,
        notificationDisabled: notificationDisabled
      }),
    );
  }

  public replyMessage(
    replyToken: string,
    messages: Message | Message[],
    notificationDisabled: boolean = false,
  ): GoogleAppsScript.URL_Fetch.HTTPResponse {
    return this.http.post(
      `${MESSAGING_API_PREFIX}/message/reply`,
      JSON.stringify({
        messages: toArray(messages),
        replyToken: replyToken,
        notificationDisabled: notificationDisabled
      }),
    );
  }

  public multicast(
    to: string[],
    messages: Message | Message[],
    notificationDisabled: boolean = false,
  ): GoogleAppsScript.URL_Fetch.HTTPResponse {
    return this.http.post(
      `${MESSAGING_API_PREFIX}/message/multicast`,
      JSON.stringify({
        messages: toArray(messages),
        to: to,
        notificationDisabled: notificationDisabled,
      }),
    );
  }

  public broadcast(
    messages: Message | Message[],
    notificationDisabled: boolean = false,
  ): GoogleAppsScript.URL_Fetch.HTTPResponse {
    return this.http.post(
      `${MESSAGING_API_PREFIX}/message/broadcast`,
      JSON.stringify({
        messages: toArray(messages),
        notificationDisabled: notificationDisabled,
      }),
    );
  }
}

class HTTPClient {
  private config: ClientConfig;

  constructor(config: ClientConfig) {
    this.config = config;
  }

  // public async get<T>(url: string, params?: any): Promise<T> {
  //     const res = await this.instance.get(url, { params });
  //     return res.data;
  // }

  public post(
    url: string,
    body: GoogleAppsScript.URL_Fetch.Payload,
    config?: Partial<GoogleAppsScript.URL_Fetch.URLFetchRequestOptions>,
  ): GoogleAppsScript.URL_Fetch.HTTPResponse {
    return UrlFetchApp.fetch(url, {
      contentType: "application/json",
      method: "post" as GoogleAppsScript.URL_Fetch.HttpMethod,
      headers: {
        Authorization: "Bearer " + this.config.channelAccessToken
      },
      payload: body,
      muteHttpExceptions: true,
      ...config
    });
  }
}
