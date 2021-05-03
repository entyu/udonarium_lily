import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

import { ChatMessage } from '@udonarium/chat-message';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ChatMessageService } from 'service/chat-message.service';

import { StringUtil } from '@udonarium/core/system/util/string-util';
import { ModalService } from 'service/modal.service';
import { OpenUrlComponent } from 'component/open-url/open-url.component';
import { EventSystem } from '@udonarium/core/system';

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
  changeDetection: ChangeDetectionStrategy.Default
})

export class ChatMessageComponent implements OnInit, AfterViewInit {
  @Input() chatMessage: ChatMessage;
  @ViewChild('msgFrom') msgFromElm: ElementRef;
  @ViewChild('message') messageElm: ElementRef;

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

  ngAfterViewInit() {
    if (this.msgFromElm && this.msgFromElm.nativeElement) {
      const anchor = this.msgFromElm.nativeElement.querySelector('A[href]');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (StringUtil.validUrl(href)) {
          if (!StringUtil.sameOrigin(href)) {
            anchor.classList.add('outer-link');
            anchor.addEventListener('click', (e) => {
              e.stopPropagation();
              e.preventDefault();
              this.modalService.open(OpenUrlComponent, { url: href });
            }, true);
          }
        } else {
          anchor.removeAttribute('href');
          anchor.removeAttribute('target');
        }
      }
    }
    if (this.messageElm && this.messageElm.nativeElement) {
      this.messageElm.nativeElement.querySelectorAll('A[href]').forEach(anchor => {
        const href = anchor.getAttribute('href');
        if (StringUtil.validUrl(href)) {
          if (!StringUtil.sameOrigin(href)) {
            anchor.classList.add('outer-link');
            anchor.addEventListener('click', (e) => {
              e.stopPropagation();
              e.preventDefault();
              this.modalService.open(OpenUrlComponent, { url: href });
            }, true);
          }
        } else {
          anchor.removeAttribute('href');
          anchor.removeAttribute('target');
        }
      });
    }
  }

  discloseMessage() {
    this.chatMessage.tag = this.chatMessage.tag.replace('secret', '');
  }

  editStart() {
    EventSystem.trigger('MESSAGE_EDITING_START', { messageIdentifier: this.chatMessage.identifier });
    this.editingText = this.chatMessage.text;
    this.isEditing = true
  }

  editEnd(event: KeyboardEvent=null) {
    if (event) event.preventDefault();
    if (event && event.keyCode !== 13) return;

    if (this.isEditable && this.editingText.trim().length > 0 && this.chatMessage.text != this.editingText) {
      if (!this.chatMessage.isSecret) this.chatMessage.lastUpdate = Date.now();
      this.chatMessage.text = this.editingText;
      this.isEditing = false;
      setTimeout(() => {
        this.messageElm.nativeElement.querySelectorAll('A[href]').forEach(anchor => {
          const href = anchor.getAttribute('href');
          if (StringUtil.validUrl(href)) {
            if (!StringUtil.sameOrigin(href)) {
              anchor.classList.add('outer-link');
              anchor.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.modalService.open(OpenUrlComponent, { url: href });
              }, true);
            }
          } else {
            anchor.removeAttribute('href');
            anchor.removeAttribute('target');
          }
        });
      });
    } else {
      this.editCancel();
    }
  }

  editCancel() {
    this.isEditing = false;
  }

  caltEditHeightCss() {
    const match = this.editingText.match(/\n/g);
    const lines = match ? match.length : 0;
    console.log(lines)
    return `calc(1.3em * ${lines + 1})`;
  }
}
