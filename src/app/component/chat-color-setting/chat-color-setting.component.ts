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

@Component({
  selector: 'chat-color-setting',
  templateUrl: './chat-color-setting.component.html',
  styleUrls: ['./chat-color-setting.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatColorSettingComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() isAllowedEmpty: boolean = false;
  @Input() tabletopObject: GameCharacter = null;

  get myPeer(): PeerCursor { return PeerCursor.myCursor; }

  changeColor( event , num ){
    
    if( this.tabletopObject ){
      this.tabletopObject.chatColorCode[num] = event;

      if( this.tabletopObject.syncDummyCounter < 2 ){
        this.tabletopObject.syncDummyCounter = this.tabletopObject.syncDummyCounter + 1;
      }else{
        this.tabletopObject.syncDummyCounter = 0;
      }
      console.log('changeColor:count:'+this.tabletopObject.syncDummyCounter);
    }else{
      this.myPeer.chatColorCode[num] = event;
    }
  }

  constructor(
    private changeDetector: ChangeDetectorRef,
    private panelService: PanelService,
    private modalService: ModalService
  ) {
    this.isAllowedEmpty = this.modalService.option && this.modalService.option.isAllowedEmpty ? true : false;
  }

  ngOnInit() {
  }
  
  chatColorCode( num : number){
    if( this.tabletopObject ){
      return this.tabletopObject.chatColorCode[num];
    }else{
      return this.myPeer.chatColorCode[num];
    }

  }
  
  ngAfterViewInit() {
  }

  ngOnDestroy() {
//    EventSystem.unregister(this);
  }

}
