import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

import { ChatMessage } from '@udonarium/chat-message';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ChatMessageService } from 'service/chat-message.service';

import { StringUtil } from '@udonarium/core/system/util/string-util';
import { ModalService } from 'service/modal.service';
import { OpenUrlComponent } from 'component/open-url/open-url.component';
import { EventSystem } from '@udonarium/core/system';

import { COMPOSITION_BUFFER_MODE } from '@angular/forms'
import Autolinker from 'autolinker';

@Component({
  selector: 'chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.css'],
  animations: [
    trigger('flyInOut', [
      transition('* => active', [
        animate('200ms ease-out', keyframes([
          style({ transform: 'translateX(100px)', opacity: '0', offset: 0 }),
          style({ transform: 'translateX(0)', opacity: '1', offset: 1.0 })
        ]))
      ]),
      transition('void => *', [
        animate('200ms ease-out', keyframes([
          style({ opacity: '0', offset: 0 }),
          style({ opacity: '1', offset: 1.0 })
        ]))
      ])
    ]),
    trigger('flyInOutMe', [
      transition('* => active', [
        animate('200ms ease-out', keyframes([
          style({ transform: 'translateX(-100px)', opacity: '0', offset: 0 }),
          style({ transform: 'translateX(0)', opacity: '1', offset: 1.0 })
        ]))
      ]),
      transition('void => *', [
        animate('200ms ease-out', keyframes([
          style({ opacity: '0', offset: 0 }),
          style({ opacity: '1', offset: 1.0 })
        ]))
      ])
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [
    { provide: COMPOSITION_BUFFER_MODE, useValue: false }
  ]
})

export class ChatMessageComponent implements OnInit {
  @Input() chatMessage: ChatMessage;
  @Input() compact: boolean = false;
  @ViewChild('edit', { static: false }) editElm: ElementRef<HTMLTextAreaElement>;

  imageFile: ImageFile = ImageFile.Empty;
  animeState: string = 'inactive';
  isEditing = false;
  editingText = '';

  constructor(
    private chatMessageService: ChatMessageService,
    private modalService: ModalService
  ) { }

  stringUtil = StringUtil;

  ngOnInit() {
    EventSystem.register(this)
    .on('MESSAGE_EDITING_START', -1000, event => {
      if (event.isSendFromSelf && (!event.data || event.data.messageIdentifier !== this.chatMessage.identifier)) {
        this.editCancel();
      }
    });

    let file: ImageFile = this.chatMessage.image;
    if (file) this.imageFile = file;
    let time = this.chatMessageService.getTime();
    if (time - 10 * 1000 < this.chatMessage.timestamp) this.animeState = 'active';
  }

  get isMine(): boolean {
    return this.chatMessage.isSendFromSelf;
  }

  get isEditable(): boolean {
    return this.chatMessage.isEditable;
  }

  get isCompact(): boolean {
    return this.compact || this.chatMessage.isOperationLog;
    //return this.compact || this.chatMessage.isOperationLog || this.chatMessage.isDicebot;
  }

  get htmlEscapedFrom():string  {
    return this._htmlEscapeLinking(this.chatMessage.from, true);
  } 

  get htmlEscapedText():string  {
    let text = this._htmlEscapeLinking(this.chatMessage.text, false, !this.chatMessage.isOperationLog);
    if (this.chatMessage.isDicebot) text = ChatMessage.decorationDiceResult(text);
    return text;
  }

  private _htmlEscapeLinking(str, shorten=false, ruby=false): string {
    str = StringUtil.escapeHtml(str);
    if (ruby) str = StringUtil.rubyToHtml(str);
    return Autolinker.link(this.lastNewLineAdjust(str), {
      urls: {schemeMatches: true, wwwMatches: true, tldMatches: false}, 
      truncate: {length: 48, location: 'end'}, 
      decodePercentEncoding: shorten, 
      stripPrefix: shorten, 
      stripTrailingSlash: shorten, 
      email: false, 
      phone: false,
      replaceFn : function(m) {
        if (m.getType() == 'url' && StringUtil.validUrl(m.getAnchorHref())) {
          if (StringUtil.sameOrigin(m.getAnchorHref())) {
            return true;
          } else {
            const tag = m.buildTag();
            tag.setAttr('rel', 'nofollow');
            tag.addClass('outer-link');
            return tag;
          }
        }
        return false;
      }
    });
  }

  discloseMessage() {
    this.chatMessage.tag = this.chatMessage.tag.replace('secret', '');
  }

  editStart() {
    EventSystem.trigger('MESSAGE_EDITING_START', { messageIdentifier: this.chatMessage.identifier });
    this.editingText = this.chatMessage.text;
    this.isEditing = true;
    setTimeout(() => {
      if (this.editElm.nativeElement) this.editElm.nativeElement.focus();
    });
  }

  editEnd(event: KeyboardEvent=null) {
    if (event) event.preventDefault();
    if (event && event.keyCode !== 13) return;

    if (this.isEditable && this.editingText.trim().length > 0 && this.chatMessage.text != this.editingText) {
      if (!this.chatMessage.isSecret) this.chatMessage.lastUpdate = Date.now();
      this.chatMessage.text = this.editingText;
      this.isEditing = false;
    } else {
      this.editCancel();
    }
  }

  editCancel() {
    this.isEditing = false;
  }

  // 表示の調整
  lastNewLineAdjust(str: string): string {
    if (str == null) return '';
    return ((this.isEditing || !(this.chatMessage.isEdited || this.chatMessage.isSecret)) && str.lastIndexOf("\n") == str.length - 1) ? str + "\n" : str;
  }

  onLinkClick($event) {
    //console.log($event.target.tagName);
    if ($event && $event.target.tagName == 'A') {
      const href = $event.target.getAttribute('href');
      if (!StringUtil.sameOrigin(href)) {
        $event.preventDefault();
        this.modalService.open(OpenUrlComponent, { url: $event.target.getAttribute('href') });
        return false;
      }
    }
    return true;
  }
}
