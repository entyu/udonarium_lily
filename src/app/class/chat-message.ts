import { ImageFile } from './core/file-storage/image-file';
import { ImageStorage } from './core/file-storage/image-storage';
import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { Network } from './core/system';
import { StringUtil } from './core/system/util/string-util';
import { Autolinker } from 'autolinker';
import { PeerCursor } from './peer-cursor';
import { formatDate } from '@angular/common';

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
  @SyncVar() lastUpdate: number = 0

  get tabIdentifier(): string { return this.parent.identifier; }
  get text(): string { return <string>this.value; }
  set text(text: string) { this.value = (text == null) ? '' : text; }
  
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

  get isEdited(): boolean {
    return this.lastUpdate > 0;
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
  get isEmptyDice(): boolean { return !this.isDicebot || -1 < this.tags.indexOf('empty'); }
  get isSpecialColor(): boolean { return this.isDirect || this.isSecret || this.isSystem || this.isDicebot || this.isCalculate; }
  get isEditable(): boolean { return !this.isSystem && this.from === Network.peerContext.userId }
  get isFaceIcon(): boolean { return !this.isSystem && (!this.characterIdentifier || this.tags.indexOf('noface') < 0); }

  get isSuccess(): boolean { return this.isDicebot && -1 < this.tags.indexOf('success'); }
  get isFailure(): boolean { return this.isDicebot && -1 < this.tags.indexOf('failure'); }
  get isCritical(): boolean { return this.isDicebot && -1 < this.tags.indexOf('critical'); }
  get isFumble(): boolean { return this.isDicebot && -1 < this.tags.indexOf('fumble'); }

  //とりあえず
  private locale = 'en-US';
  
  logFragment(logForamt: number, tabName: string=null, dateFormat='HH:mm', noImage=true) {
    if (logForamt == 0) {
      return this.logFragmentText(tabName, dateFormat);
    } else {
      return this.logFragmentHtml(tabName, dateFormat, logForamt != 2);
    }
  }

  logFragmentText(tabName: string=null, dateFormat='HH:mm'): string {
    tabName = (!tabName || tabName.trim() == '') ? '' : `[${ tabName }] `;
    const dateStr = (dateFormat == '') ? '' : formatDate(new Date(this.timestamp), dateFormat, this.locale) + '：';
    const lastUpdateStr = !this.isEdited ? '' : 
      (dateFormat == '') ? ' (編集済)' : ` (編集済 ${ formatDate(new Date(this.lastUpdate), dateFormat, this.locale) })`;
    let text = this.text;
    if (text.lastIndexOf('\n') == text.length - 1 && !lastUpdateStr) {
      // 最終行の調整
      text += "\n";
    }
    return `${ tabName }${ dateStr }${ this.name }：${ (this.isSecret && !this.isSendFromSelf) ? '（シークレットダイス）' : text + lastUpdateStr }`
  }

  logFragmentHtml(tabName: string=null, dateFormat='HH:mm', noImage=true): string {
    const tabNameHtml = (!tabName || tabName.trim() == '') ? '' : `<span class="tab-name">${ StringUtil.escapeHtml(tabName) }</span> `;
    const date = new Date(this.timestamp);
    const dateHtml = (dateFormat == '') ? '' : `<time datetime="${ date.toISOString() }">${ StringUtil.escapeHtml(formatDate(date, dateFormat, this.locale)) }</time>：`;
    const nameHtml = StringUtil.escapeHtml(this.name);

    let messageClassNames = ['message'];
    if (this.isDirect || this.isSecret) messageClassNames.push('direct-message');
    if (this.isSystem) messageClassNames.push('system-message');
    if (this.isDicebot || this.isCalculate) messageClassNames.push('dicebot-message');
    
    let messageTextClassNames = ['msg-text'];
    if (!this.isSecret || this.isSendFromSelf) {
      if (this.isSuccess) messageTextClassNames.push('is-success');
      if (this.isFailure) messageTextClassNames.push('is-failure');
      if (this.isCritical) messageTextClassNames.push('is-critical');
      if (this.isFumble) messageTextClassNames.push('is-fumble');
    }

    const color = StringUtil.escapeHtml(this.color ? this.color : PeerCursor.CHAT_DEFAULT_COLOR);
    const colorStyle = this.isSpecialColor ? '' : ` style="color: ${ color }"`;

    let textAutoLinkedHtml = (this.isSecret && !this.isSendFromSelf) ? '<s>（シークレットダイス）</s>' 
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

      let lastUpdateHtml = '';
      if (this.isEdited) {
        if (dateFormat == '') {
          lastUpdateHtml = '<span class="is-edited">編集済</span>';
        } else {
          const lastUpdate = new Date(this.lastUpdate);
          lastUpdateHtml = `<span class="is-edited"><b>編集済</b> <time datetime="${ lastUpdate.toISOString() }">${ StringUtil.escapeHtml(formatDate(lastUpdate, dateFormat, this.locale)) }</time></span>`;
        }
      }
      
      if (textAutoLinkedHtml.lastIndexOf('\n') == textAutoLinkedHtml.length - 1 && !lastUpdateHtml) {
        // 最終行の調整
        textAutoLinkedHtml += "\n";
      }

    return `<div class="${ messageClassNames.join(' ') }" style="border-left-color: ${ color }">
  <div class="msg-header">${ tabNameHtml }${ dateHtml }<span class="msg-name"${ colorStyle }>${ nameHtml }</span>：</div>
  <div class="${ messageTextClassNames.join(' ') }"><span${ colorStyle }>${ textAutoLinkedHtml }</span>${ lastUpdateHtml }</div>
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
  color: #11F;
}
.direct-message.dicebot-message .msg-text {
  color: #CCF;
}
.dicebot-message .msg-text.is-success {
  color:#17f;
}
.dicebot-message .msg-text.is-failure {
  color:#F05;
}
.direct-message.dicebot-message .msg-text.is-success {
  color:#adF;
}
.direct-message.dicebot-message .msg-text.is-failure {
  color:#F66;
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
  padding-left: 2px;
}
.msg-name {
  font-weight: bolder;
}
.msg-text {
  white-space: pre-wrap;
  width: 100%
}
.is-edited {
  margin-left: 2px;
  font-size: 8px;
}
.is-edited::before {
  content: '(';
}
.is-edited::after {
  content: ')';
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
