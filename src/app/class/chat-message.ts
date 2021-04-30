import { ImageFile } from './core/file-storage/image-file';
import { ImageStorage } from './core/file-storage/image-storage';
import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { Network } from './core/system';
import { StringUtil } from './core/system/util/string-util';
import { Autolinker } from 'autolinker';
import { PeerCursor } from './peer-cursor';

export interface ChatMessageContext {
  identifier?: string;
  tabIdentifier?: string;
  originFrom?: string;
  from?: string;
  to?: string;
  name?: string;
  text?: string;
  timestamp?: number;
  tag?: string;
  dicebot?: string;
  imageIdentifier?: string;
  color?: string;
  isInverseIcon?: number;
  isHollowIcon?: number;
  isBlackPaint?: number;
  aura?: number;
  characterIdentifier?: string;
  standIdentifier?: string;
  standName?: string;
  isUseStandImage?: boolean;
}

@SyncObject('chat')
export class ChatMessage extends ObjectNode implements ChatMessageContext {
  @SyncVar() originFrom: string;
  @SyncVar() from: string;
  @SyncVar() to: string;
  @SyncVar() name: string;
  @SyncVar() tag: string; 
  @SyncVar() dicebot: string;
  @SyncVar() imageIdentifier: string;
  @SyncVar() color: string;
  @SyncVar() isInverseIcon: number;
  @SyncVar() isHollowIcon: number;
  @SyncVar() isBlackPaint: number;
  @SyncVar() aura: number = -1;
  @SyncVar() characterIdentifier: string;
  @SyncVar() standIdentifier: string;
  @SyncVar() standName: string;
  @SyncVar() isUseStandImage: boolean;

  get tabIdentifier(): string { return this.parent.identifier; }
  get text(): string { return <string>this.value }
  get timestamp(): number {
    let timestamp = this.getAttribute('timestamp');
    let num = timestamp ? +timestamp : 0;
    return Number.isNaN(num) ? 1 : num;
  }
  private _to: string;
  private _sendTo: string[] = [];
  get sendTo(): string[] {
    if (this._to !== this.to) {
      this._to = this.to;
      this._sendTo = this.to != null && 0 < this.to.trim().length ? this.to.trim().split(/\s+/) : [];
    }
    return this._sendTo;
  }

  private _tag: string;
  private _tags: string[] = [];
  get tags(): string[] {
    if (this._tag !== this.tag) {
      this._tag = this.tag;
      this._tags = this.tag != null && 0 < this.tag.trim().length ? this.tag.trim().split(/\s+/) : [];
    }
    return this._tags;
  }

  get image(): ImageFile { return ImageStorage.instance.get(this.imageIdentifier); }
  get index(): number { return this.minorIndex + this.timestamp; }
  get isDirect(): boolean { return 0 < this.sendTo.length ? true : false; }
  get isSendFromSelf(): boolean { return this.from === Network.peerContext.userId || this.originFrom === Network.peerContext.userId; }
  get isRelatedToMe(): boolean { return (-1 < this.sendTo.indexOf(Network.peerContext.userId)) || this.isSendFromSelf ? true : false; }
  get isDisplayable(): boolean { return this.isDirect ? this.isRelatedToMe : true; }
  get isSystem(): boolean { return -1 < this.tags.indexOf('system') ? true : false; }
  get isDicebot(): boolean { return this.isSystem && this.from.indexOf('Dice') >= 0 && this.text.indexOf(': 計算結果 →') < 0 ? true : false; }
  get isCalculate(): boolean { return this.isSystem && this.from.indexOf('Dice') >= 0 && this.text.indexOf(': 計算結果 →') > -1 ? true : false; }
  get isSecret(): boolean { return -1 < this.tags.indexOf('secret') ? true : false; }
  get isSpecialColor(): boolean { return this.isDirect || this.isSecret || this.isSystem || this.isDicebot || this.isCalculate; }

  logFragment(logForamt: number, tabName: string=null, logTimestampType: number, noImage=true) {
    if (logForamt == 0) {
      return this.logFragmentText(tabName, logTimestampType);
    } else {
      return this.logFragmentHtml(tabName, logTimestampType, logForamt != 2);
    }
  }

  logFragmentText(tabName: string=null, logTimestampType: number): string {
    tabName = (!tabName || tabName.trim() == '') ? '' : `[${ tabName }] `;
    const date = new Date(this.timestamp);
    let dateStr = ('00' + date.getHours()).slice(-2) + ':' + ('00' + date.getMinutes()).slice(-2);
    if (logTimestampType == 0) {
      dateStr = '';
    } else if (logTimestampType == 1) {
      dateStr = dateStr + '：';
    } else if (logTimestampType == 2) {
      dateStr = date.getFullYear() + '/' + ('00' + (date.getMonth() + 1)).slice(-2) + '/' + ('00' + date.getDate()).slice(-2) + ' ' + dateStr + ':' + ('00' + date.getSeconds()).slice(-2) + '：';
    }
    return `${ tabName }${ dateStr }${ this.name }：${ (this.isSecret && !this.isSendFromSelf) ? '（シークレットダイス）' : this.text }`
  }

  logFragmentHtml(tabName: string=null, logTimestampType: number, noImage=true): string {
    const tabNameHtml = (!tabName || tabName.trim() == '') ? '' : `<span class="tab-name">${ StringUtil.escapeHtml(tabName) }</span> `;
    const date = new Date(this.timestamp);
    const shortDateTimeStr = ('00' + date.getHours()).slice(-2) + ':' + ('00' + date.getMinutes()).slice(-2);
    const longDateTimeStr = date.getFullYear() + '/' + ('00' + (date.getMonth() + 1)).slice(-2) + '/' + ('00' + date.getDate()).slice(-2) + ' ' + shortDateTimeStr + ':' + ('00' + date.getSeconds()).slice(-2);
    const nameHtml = StringUtil.escapeHtml(this.name);
    
    let dateHtml = '';
    if (logTimestampType == 1) {
      dateHtml = `<time datetime="${ date.toISOString() }">${ shortDateTimeStr }</time>：`;
    } else if (logTimestampType == 2) {
      dateHtml = `<time datetime="${ date.toISOString() }">${ longDateTimeStr }</time>：`;;
    }
    
    let messageClassNames = ['message'];
    if (this.isDirect || this.isSecret) messageClassNames.push('direct-message');
    if (this.isSystem) messageClassNames.push('system-message');
    if (this.isDicebot || this.isCalculate) messageClassNames.push('dicebot-message');
    const color = StringUtil.escapeHtml(this.color ? this.color : PeerCursor.CHAT_DEFAULT_COLOR);
    const colorStyle = this.isSpecialColor ? '' : ` style="color: ${ color }"`;

    const textAutoLinkedHtml = (this.isSecret && !this.isSendFromSelf) ? '<s>（シークレットダイス）</s>' 
      : Autolinker.link(StringUtil.escapeHtml(this.text), {
        urls: {schemeMatches: true, wwwMatches: true, tldMatches: false}, 
        truncate: {length: 96, location: 'end'}, 
        decodePercentEncoding: false, 
        stripPrefix: false, 
        stripTrailingSlash: false, 
        email: false, 
        phone: false,
        className: 'outer-link',
        replaceFn : function(m) {
          return m.getType() == 'url' && StringUtil.validUrl(m.getAnchorHref());
        }
      });
    return `<div class="${ messageClassNames.join(' ') }" style="border-left-color: ${ color }">
  <div class="msg-header" title="${ longDateTimeStr + '：' + nameHtml }">${ tabNameHtml }${ dateHtml }<span class="msg-name"${ colorStyle }>${ nameHtml }</span>：</div>
  <div class="msg-text"${ colorStyle }>${ textAutoLinkedHtml }</div>
</div>`;
  }

  static logCss(noImage=true): string {
    return `body {
  color: #444;
  background-color: #FFF;
}
.message {
  display: flex;
  width: 100%;
  word-wrap: break-word;
  overflow-wrap: anywhere;
  word-break: break-word;
  border-left: 4px solid transparent;
  margin-top: 1px;
}
.direct-message {
  background-color: #555;
  color: #CCC;
}
.dicebot-message .msg-text {
  color: #22F;
}
.direct-message.dicebot-message .msg-text {
  color: #CCF;
}
.dicebot-message .msg-name,
.dicebot-message .msg-text {
  font-style: oblique;
}
.tab-name {
  display: inline-block;
}
.tab-name::before {
  content: '[';
}
.tab-name::after {
  content: ']';
}
.msg-header {
  white-space: nowrap;
  border-left: 1px solid #FFF;
  padding-left: 3px;
}
.msg-name {
  font-weight: bolder;
}
.msg-text {
  white-space: pre-wrap;
  width: 100%
}
a[target=_blank] {
  text-decoration: none;
  word-break: break-all;
}
a[target=_blank]:hover {
  text-decoration: underline;
}
a.outer-link::after {
  margin-right: 2px;
  margin-left: 2px;
  font-family: 'Material Icons';
  content: '\\e89e';
  font-weight: bolder;
  text-decoration: none;
  display: inline-block;
  font-size: smaller;
  vertical-align: 25%;
}
.direct-message a[href] {
  color: #CCF;
}
.direct-message a[href]:visited {
  color: #99D;
}`;
  }
}
