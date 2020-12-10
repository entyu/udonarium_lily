import { Component, ElementRef,   ChangeDetectorRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';

import { ChatMessage } from '@udonarium/chat-message';
import { ChatTab } from '@udonarium/chat-tab';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { PeerCursor } from '@udonarium/peer-cursor';
import { ChatTabSettingComponent } from 'component/chat-tab-setting/chat-tab-setting.component';
import { ChatMessageService } from 'service/chat-message.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';

import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';

@Component({
  selector: 'chat-tachie',
  templateUrl: './chat-tachie.component.html',
  styleUrls: ['./chat-tachie.component.css']
})
export class ChatTachieComponent implements OnInit, OnDestroy{

  @Input() chatTabidentifier: string = '';

  @ViewChild('tachieArea', { read: ElementRef }) private tachieArea: ElementRef;  
  private _tachieAreaWidth = 0;
  

  get chatTab(): ChatTab { return ObjectStore.instance.get<ChatTab>(this.chatTabidentifier); }

  get tachieAreaWidth():number{ 
    return this._tachieAreaWidth;
  }

  public tachieHeightValue = 250;
  public minTachieSize = 100;
  public maxTachieSize = 500;
  
  chkHeight( newNum ){
    
    if( newNum <= this.minTachieSize) this.tachieHeightValue = this.minTachieSize;
    if( newNum >= this.maxTachieSize) this.tachieHeightValue = this.maxTachieSize;
    
  }
  
  get tachieAreaHeight() : number {
    if( this.chatTab ){
      if( this.chatTab.tachieDispFlag ){
        return this.tachieHeightValue;
      }
    }
    return 0;
  }
  
  private timerId;
  
//óßÇøäGï\é¶ïùéÊìæ
  ngAfterViewInit() {
    this._tachieAreaWidth = this.tachieArea.nativeElement.offsetWidth;
    this.changeDetectionRef.detectChanges();
  }  

  ngAfterViewChecked() {
    this._tachieAreaWidth = this.tachieArea.nativeElement.offsetWidth;
    this.changeDetectionRef.detectChanges();
  }  

//z-indexéÊìæ
  private _zindexOffset = 10;

  get zIndex_00(): number { return this.chatTab.tachieZindex(0) + this._zindexOffset; }
  get zIndex_01(): number { return this.chatTab.tachieZindex(1) + this._zindexOffset; }
  get zIndex_02(): number { return this.chatTab.tachieZindex(2) + this._zindexOffset; }
  get zIndex_03(): number { return this.chatTab.tachieZindex(3) + this._zindexOffset; }
  get zIndex_04(): number { return this.chatTab.tachieZindex(4) + this._zindexOffset; }
  get zIndex_05(): number { return this.chatTab.tachieZindex(5) + this._zindexOffset; }
  get zIndex_06(): number { return this.chatTab.tachieZindex(6) + this._zindexOffset; }
  get zIndex_07(): number { return this.chatTab.tachieZindex(7) + this._zindexOffset; }
  get zIndex_08(): number { return this.chatTab.tachieZindex(8) + this._zindexOffset; }
  get zIndex_09(): number { return this.chatTab.tachieZindex(9) + this._zindexOffset; }
  get zIndex_10(): number { return this.chatTab.tachieZindex(10) + this._zindexOffset; }
  get zIndex_11(): number { return this.chatTab.tachieZindex(11) + this._zindexOffset; }

  private _opacity = 0.5

  get opacity_00(): number { if( this.chatTab.tachieZindex(0) == 11 ){return 1;}else{ return this._opacity ;}  }
  get opacity_01(): number { if( this.chatTab.tachieZindex(1) == 11 ){return 1;}else{ return this._opacity ;}  }
  get opacity_02(): number { if( this.chatTab.tachieZindex(2) == 11 ){return 1;}else{ return this._opacity ;}  }
  get opacity_03(): number { if( this.chatTab.tachieZindex(3) == 11 ){return 1;}else{ return this._opacity ;}  }
  get opacity_04(): number { if( this.chatTab.tachieZindex(4) == 11 ){return 1;}else{ return this._opacity ;}  }
  get opacity_05(): number { if( this.chatTab.tachieZindex(5) == 11 ){return 1;}else{ return this._opacity ;}  }
  get opacity_06(): number { if( this.chatTab.tachieZindex(6) == 11 ){return 1;}else{ return this._opacity ;}  }
  get opacity_07(): number { if( this.chatTab.tachieZindex(7) == 11 ){return 1;}else{ return this._opacity ;}  }
  get opacity_08(): number { if( this.chatTab.tachieZindex(8) == 11 ){return 1;}else{ return this._opacity ;}  }
  get opacity_09(): number { if( this.chatTab.tachieZindex(9) == 11 ){return 1;}else{ return this._opacity ;}  }
  get opacity_10(): number { if( this.chatTab.tachieZindex(10) == 11 ){return 1;}else{ return this._opacity ;}  }
  get opacity_11(): number { if( this.chatTab.tachieZindex(11) == 11 ){return 1;}else{ return this._opacity ;}  }


//Ç±ÇÃé¿ëïÇÕå„Ç≈Ç«Ç§Ç…Ç©ÇµÇΩÇ¢
  get imageFileUrl_00(): string { 
     if( ! this.chatTab.imageIdentifier )return '';
     let image:ImageFile = ImageStorage.instance.get(this.chatTab.imageIdentifier[0]);
     if (image) return image.url;
     return '';
  }

  get imageFileUrl_01(): string { 
  if( ! this.chatTab.imageIdentifier )return '';
     let image:ImageFile = ImageStorage.instance.get(this.chatTab.imageIdentifier[1]);
     if (image) return image.url;
     return '';
  }

  get imageFileUrl_02(): string { 
  if( ! this.chatTab.imageIdentifier )return '';
     let image:ImageFile = ImageStorage.instance.get(this.chatTab.imageIdentifier[2]);
     if (image) return image.url;
     return '';
  }

  get imageFileUrl_03(): string { 
     if( ! this.chatTab.imageIdentifier )return '';
     let image:ImageFile = ImageStorage.instance.get(this.chatTab.imageIdentifier[3]);
     if (image) return image.url;
     return '';
  }

  get imageFileUrl_04(): string { 
     if( ! this.chatTab.imageIdentifier )return '';
     let image:ImageFile = ImageStorage.instance.get(this.chatTab.imageIdentifier[4]);
     if (image) return image.url;
     return '';
  }

  get imageFileUrl_05(): string { 
     if( ! this.chatTab.imageIdentifier )return '';
     let image:ImageFile = ImageStorage.instance.get(this.chatTab.imageIdentifier[5]);
     if (image) return image.url;
     return '';
  }

  get imageFileUrl_06(): string { 
     if( ! this.chatTab.imageIdentifier )return '';
     let image:ImageFile = ImageStorage.instance.get(this.chatTab.imageIdentifier[6]);
     if (image) return image.url;
     return '';
  }

  get imageFileUrl_07(): string { 
     if( ! this.chatTab.imageIdentifier )return '';
     let image:ImageFile = ImageStorage.instance.get(this.chatTab.imageIdentifier[7]);
     if (image) return image.url;
     return '';
  }

  get imageFileUrl_08(): string { 
     if( ! this.chatTab.imageIdentifier )return '';
     let image:ImageFile = ImageStorage.instance.get(this.chatTab.imageIdentifier[8]);
     if (image) return image.url;
     return '';
  }

  get imageFileUrl_09(): string { 
     if( ! this.chatTab.imageIdentifier )return '';
     let image:ImageFile = ImageStorage.instance.get(this.chatTab.imageIdentifier[9]);
     if (image) return image.url;
     return '';
  }

  get imageFileUrl_10(): string { 
     if( ! this.chatTab.imageIdentifier )return '';
     let image:ImageFile = ImageStorage.instance.get(this.chatTab.imageIdentifier[10]);
     if (image) return image.url;
     return '';
  }

  get imageFileUrl_11(): string { 
     if( ! this.chatTab.imageIdentifier )return '';
     let image:ImageFile = ImageStorage.instance.get(this.chatTab.imageIdentifier[11]);
     if (image) return image.url;
     return '';
  }


  constructor(
    public chatMessageService: ChatMessageService,
    private changeDetectionRef: ChangeDetectorRef,
    private panelService: PanelService,
    private pointerDeviceService: PointerDeviceService
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  trackByChatTab(index: number, chatTab: ChatTab) {
    return chatTab.identifier;
  }
}
