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

//entyu
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
//
@Component({
  selector: 'chat-tachie',
  templateUrl: './chat-tachie.component.html',
  styleUrls: ['./chat-tachie.component.css']
})
export class ChatTachieComponent implements OnInit, OnDestroy{

  @Input() chatTabidentifier: string = '';

  @ViewChild('tachieArea', { read: ElementRef }) tachieArea: ElementRef;  
  private _tachieAreaWidth = 0;
  

  get chatTab(): ChatTab { return ObjectStore.instance.get<ChatTab>(this.chatTabidentifier); }

  get tachieAreaWidth():number{ 
    return this._tachieAreaWidth;
  }

  private timerId;
  
//óßÇøäGï\é¶ïùéÊìæ
  ngAfterViewInit() {
//    console.log('ngAfterViewInit()' + this.tachieArea.nativeElement.offsetWidth);
    this._tachieAreaWidth = this.tachieArea.nativeElement.offsetWidth;
    this.changeDetectionRef.detectChanges();
  }  

  ngAfterViewChecked() {
//    console.log('ngAfterViewChecked()'  + this.tachieArea.nativeElement.offsetWidth);
    this._tachieAreaWidth = this.tachieArea.nativeElement.offsetWidth;
    this.changeDetectionRef.detectChanges();
  }  
 
//
//Ç±ÇÃé¿ëïÇÕÇ«Ç§Ç…Ç©ÇµÇΩÇ¢
  get imageFileUrl(): string {  
     let image:ImageFile = ImageStorage.instance.get(this.chatTab.imageIdentifierTest);
     if (image) return image.url;
     return '';;
  }

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

//


  constructor(
    public chatMessageService: ChatMessageService,
    private changeDetectionRef: ChangeDetectorRef,
    private panelService: PanelService,
    private pointerDeviceService: PointerDeviceService
  ) { }

  ngOnInit() {
//    this.timerId = setInterval(this.ngAfterViewChecked, 200);
  }

  ngOnDestroy() {
//    clearInterval(this.timerId);
    EventSystem.unregister(this);
  }

  trackByChatTab(index: number, chatTab: ChatTab) {
    return chatTab.identifier;
  }
}
