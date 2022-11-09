import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { ChatMessage } from '@udonarium/chat-message';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ChatMessageService } from 'service/chat-message.service';

import { ChatTabList } from '@udonarium/chat-tab-list';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { PanelOption, PanelService } from 'service/panel.service';

import { PointerDeviceService } from 'service/pointer-device.service';
import { ChatMessageFixComponent } from 'component/chat-message-fix/chat-message-fix.component';

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
    ])
  ],
  changeDetection: ChangeDetectionStrategy.Default
})

export class ChatMessageComponent implements OnInit, AfterViewInit {
  @Input() chatMessage: ChatMessage;

  @Input() simpleDispFlagTime: boolean = false;
  @Input() simpleDispFlagUserId: boolean = false;
  @Input() chatSimpleDispFlag: boolean = false;

  imageFile: ImageFile = ImageFile.Empty;
  animeState: string = 'inactive';

  get chatTabList(): ChatTabList { return ObjectStore.instance.get<ChatTabList>('ChatTabList'); }
  
  constructor(
    private chatMessageService: ChatMessageService,
    private pointerDeviceService: PointerDeviceService,
    private panelService: PanelService,
  ) { }

  ngOnInit() {
    let file: ImageFile = this.chatMessage.image;
    if (file) this.imageFile = file;
    let time = this.chatMessageService.getTime();
    if (time - 10 * 1000 < this.chatMessage.timestamp) this.animeState = 'active';
  }

  ngAfterViewInit() {
  }

  discloseMessage() {
    this.chatMessage.tag = this.chatMessage.tag.replace('secret', '');
  }

  clickFix(){
    console.log('clickFix');
    let coordinate = this.pointerDeviceService.pointers[0];
    let option: PanelOption = { width: 700, height: 120, left: coordinate.x , top: coordinate.y};
    option.title = 'チャット編集';
    let component = this.panelService.open(ChatMessageFixComponent, option);
    component.chatMessage = this.chatMessage;
    component.text = this.chatMessage.text;
  }

  escapeHtmlAndRuby(text) {
    // ルビ機能 ハーメルン記法を参考 半角全角|始まり。振られる側にスペースは不可。
    // 記入例：|永遠力暴風雪《エターナルフォースブリザード》
    // 振られる側に《スキル名》は有効：|《約束された勝利の剣》《エクスカリバー》
    let escapeText = this.escapeHtml(text);
    return escapeText.replace(/[\|｜]([^\|｜\s]+?)《(.+?)》/g, '<ruby style="white-space:normal;">$1<rt>$2</rt></ruby>').replace(/\\s/g,' ');
  }

  escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
               .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
}
