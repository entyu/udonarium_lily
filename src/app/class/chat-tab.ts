import { ChatMessage, ChatMessageContext } from './chat-message';
import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { InnerXml, ObjectSerializer } from './core/synchronize-object/object-serializer';
import { EventSystem } from './core/system';
import { StringUtil } from './core/system/util/string-util';

@SyncObject('chat-tab')
export class ChatTab extends ObjectNode implements InnerXml {
  @SyncVar() name: string = 'タブ';
  @SyncVar() isUseStandImage: boolean = true;
  get chatMessages(): ChatMessage[] { return <ChatMessage[]>this.children; }

  private _unreadLength: number = 0;
  get unreadLength(): number { return this._unreadLength; }
  get hasUnread(): boolean { return 0 < this.unreadLength; }

  get latestTimeStamp(): number {
    let lastIndex = this.chatMessages.length - 1;
    return lastIndex < 0 ? 0 : this.chatMessages[lastIndex].timestamp;
  }

  // ObjectNode Lifecycle
  onChildAdded(child: ObjectNode) {
    super.onChildAdded(child);
    if (child.parent === this && child instanceof ChatMessage && child.isDisplayable) {
      this._unreadLength++;
      EventSystem.trigger('MESSAGE_ADDED', { tabIdentifier: this.identifier, messageIdentifier: child.identifier });
    }
  }

  addMessage(message: ChatMessageContext): ChatMessage {
    message.tabIdentifier = this.identifier;

    let chat = new ChatMessage();
    for (let key in message) {
      if (key === 'identifier') continue;
      if (key === 'tabIdentifier') continue;
      if (key === 'text') {
        chat.value = message[key];
        continue;
      }
      if (message[key] == null || message[key] === '') continue;
      chat.setAttribute(key, message[key]);
    }
    chat.initialize();
    EventSystem.trigger('SEND_MESSAGE', { tabIdentifier: this.identifier, messageIdentifier: chat.identifier });
    this.appendChild(chat);
    return chat;
  }

  markForRead() {
    this._unreadLength = 0;
  }

  innerXml(): string {
    let xml = '';
    for (let child of this.children) {
      if (child instanceof ChatMessage && !child.isDisplayable) continue;
      xml += ObjectSerializer.instance.toXml(child);
    }
    return xml;
  };

  parseInnerXml(element: Element) {
    return super.parseInnerXml(element);
  };

  log(logFormat, dateFormat): string {
    const logBody = this.chatMessages
    .filter(chatMessage => chatMessage.isDisplayable)
    .map(chatMessage => chatMessage.logFragment(logFormat, null, dateFormat))
    .join("\n");

    return logFormat == 0 
      ? logBody
      : `<!DOCTYPE html>
<html lang="ja-JP">
<head>
<meta charset="UTF-8">
<title>Udonarium with Fly：チャットログ：${ StringUtil.escapeHtml(this.name) }</title>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<style>
${ ChatMessage.logCss() }
</style>
</head>
<body>
${ logBody }
</body>
</html>`
  }
}