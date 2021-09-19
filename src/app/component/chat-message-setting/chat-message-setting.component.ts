import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { EventSystem, Network } from '@udonarium/core/system';
import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';
import { TabletopObject } from '@udonarium/tabletop-object';
import { GameCharacter } from '@udonarium/game-character';
import { PeerCursor } from '@udonarium/peer-cursor';
import { ChatTabList } from '@udonarium/chat-tab-list';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';

@Component({
  selector: 'chat-message-setting',
  templateUrl: './chat-message-setting.component.html',
  styleUrls: ['./chat-message-setting.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatMessageSettingComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() isAllowedEmpty: boolean = false;
  @Input() tabletopObject: GameCharacter = null;

  get myPeer(): PeerCursor { return PeerCursor.myCursor; }

  get chatTabList(): ChatTabList { return ObjectStore.instance.get<ChatTabList>('ChatTabList'); }


  constructor(
    private changeDetector: ChangeDetectorRef,
    private panelService: PanelService,
    private modalService: ModalService
//    private chatTabList: ChatTabList
  ) {
    
  }

  changeDispFlagTime(){
    EventSystem.trigger('RE_DRAW_CHAT', {  });
    //中身なし
  }

  changeDispFlagUserId(){
    EventSystem.trigger('RE_DRAW_CHAT', {  });
    //中身なし
  }

  changeTachieInWindow(){
    //中身なし
  }

  changeKeepTachieOutWindow(){
    //中身なし
  }
  
  ngOnInit() {
  }
  
  
  ngAfterViewInit() {
  }

  ngOnDestroy() {
  }

}
