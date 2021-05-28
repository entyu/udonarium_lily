import { ChatMessage } from './chat-message';
import { ChatTab } from './chat-tab';
import { SyncObject } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { InnerXml } from './core/synchronize-object/object-serializer';

@SyncObject('chat-tab-list')
export class ChatTabList extends ObjectNode implements InnerXml {
  private static _instance: ChatTabList;
  static get instance(): ChatTabList {
    if (!ChatTabList._instance) {
      ChatTabList._instance = new ChatTabList('ChatTabList');
      ChatTabList._instance.initialize();
    }
    return ChatTabList._instance;
  }

  get chatTabs(): ChatTab[] { return this.children as ChatTab[]; }

  addChatTab(chatTab: ChatTab): ChatTab
  addChatTab(tabName: string, identifier?: string): ChatTab
  addChatTab(...args: any[]): ChatTab {
    let chatTab: ChatTab = null;
    if (args[0] instanceof ChatTab) {
      chatTab = args[0];
    } else {
      let tabName: string = args[0];
      let identifier: string = args[1];
      chatTab = new ChatTab(identifier);
      chatTab.name = tabName;
      chatTab.initialize();
    }
    return this.appendChild(chatTab);
  }

  parseInnerXml(element: Element) {
    // XMLからの新規作成を許可せず、既存のオブジェクトを更新する
    for (let child of ChatTabList.instance.children) {
      child.destroy();
    }

    let context = ChatTabList.instance.toContext();
    context.syncData = this.toContext().syncData;
    ChatTabList.instance.apply(context);
    ChatTabList.instance.update();

    super.parseInnerXml.apply(ChatTabList.instance, [element]);
    this.destroy();
  }

  log(logFormat, dateFormat): string {
    if (!this.chatTabs) return '';
    const logBody = this.chatTabs.reduce((ac, chatTab) => {
        if (chatTab) ac.push(...chatTab.chatMessages.filter(chatMessage => chatMessage.isDisplayable)
          .map(chatMessage => ({ index: chatMessage.index, tabName: chatTab.name, chatMessage: chatMessage }))); 
        return ac;
      }, [])
      .sort((a, b) => a.index - b.index)
      .map(obj => obj.chatMessage.logFragment(logFormat, obj.tabName, dateFormat))
      .join("\n");

    return logFormat == 0 
      ? logBody
      : `<!DOCTYPE html>
<html lang="ja-JP">
<head>
<meta charset="UTF-8">
<title>Udonarium with Fly：チャットログ：全てのタブ</title>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<style>
${ ChatMessage.logCss() }
</style>
</head>
<body>
${ logBody }
</body>
</html>`;
  }
}