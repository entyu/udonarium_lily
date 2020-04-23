import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { ChatMessage } from '@udonarium/chat-message';
import { ImageFile } from '@udonarium/core/file-storage/image-file';

import { PeerCursor } from '@udonarium/peer-cursor';

@Component({
  selector: 'chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.css'],
  animations: [
    trigger('flyInOut', [
      transition('void => *', [
        animate('200ms ease', keyframes([
          style({ transform: 'translateX(100px)', opacity: '0', offset: 0 }),
          style({ transform: 'translateX(0)', opacity: '1', offset: 1.0 })
        ]))
      ]),
      transition('* => void', [
        animate(100, style({ transform: 'translateX(100%)' }))
      ])
    ])
  ],
  changeDetection: ChangeDetectionStrategy.Default
})

export class ChatMessageComponent implements OnInit, AfterViewInit {
  @Input() chatMessage: ChatMessage;
  @Output() onInit: EventEmitter<null> = new EventEmitter();
  imageFile: ImageFile = ImageFile.Empty;

  ngOnInit() {
    let file: ImageFile = this.chatMessage.image;
    if (file) this.imageFile = file;
  }

  get isMine(): boolean {
    return PeerCursor.myCursor.peerId.substring(0, 5) == this.chatMessage.from.substring(0, 5)
    || PeerCursor.myCursor.peerId.substring(0, 5) == this.chatMessage.originFrom.substring(0, 5); 
  }

  ngAfterViewInit() {
    this.onInit.emit();
  }

  discloseMessage() {
    this.chatMessage.tag = this.chatMessage.tag.replace('secret', '');
  }
}
