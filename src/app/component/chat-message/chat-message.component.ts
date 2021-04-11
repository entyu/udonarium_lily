import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

import { ChatMessage } from '@udonarium/chat-message';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ChatMessageService } from 'service/chat-message.service';

import { PeerCursor } from '@udonarium/peer-cursor';
import { StringUtil } from '@udonarium/core/system/util/string-util';
import { ModalService } from 'service/modal.service';
import { OpenUrlComponent } from 'component/open-url/open-url.component';
import { DiceBot } from '@udonarium/dice-bot';

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

  constructor(
    private chatMessageService: ChatMessageService,
    private modalService: ModalService
  ) { }

  stringUtil = StringUtil;

  ngOnInit() {
    let file: ImageFile = this.chatMessage.image;
    if (file) this.imageFile = file;
    let time = this.chatMessageService.getTime();
    if (time - 10 * 1000 < this.chatMessage.timestamp) this.animeState = 'active';
  }

  get isMine(): boolean {
    return this.chatMessage.isSendFromSelf;
  }

  ngAfterViewInit() {
    if (this.msgFromElm) {
      const anchor = this.msgFromElm.nativeElement.querySelector('A[href]');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (StringUtil.validUrl(href)) {
          if ((href == DiceBot.apiUrl + '/' || href == DiceBot.apiUrl) && DiceBot.adminUrl && DiceBot.adminUrl.trim() != '') {
            anchor.setAttribute('href', DiceBot.adminUrl);
            anchor.textContent = DiceBot.adminUrl;
            anchor.addEventListener('click', (e) => {
              e.stopPropagation();
              e.preventDefault();
              this.modalService.open(OpenUrlComponent, { url: DiceBot.adminUrl });
            }, true);
          } else {
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
    if (this.messageElm) {
      this.messageElm.nativeElement.querySelectorAll('A[href]').forEach(anchor => {
        const href = anchor.getAttribute('href');
        if (StringUtil.validUrl(href)) {
          anchor.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.modalService.open(OpenUrlComponent, { url: href });
          }, true);
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
}
