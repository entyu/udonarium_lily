import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { AudioFile } from '@udonarium/core/file-storage/audio-file';
import { AudioPlayer, VolumeType } from '@udonarium/core/file-storage/audio-player';
import { AudioStorage } from '@udonarium/core/file-storage/audio-storage';
import { FileArchiver } from '@udonarium/core/file-storage/file-archiver';

import { ModalService } from 'service/modal.service';
import { PanelOption, PanelService } from 'service/panel.service';

import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { ObjectSerializer } from '@udonarium/core/synchronize-object/object-serializer';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem, Network } from '@udonarium/core/system';
import { CutIn } from '@udonarium/cut-in';
import { CutInLauncher } from '@udonarium/cut-in-launcher';

//import { FileSelecterComponent } from 'component/file-selecter/file-selecter.component';
//import { CutInBgmComponent } from 'component/cut-in-bgm/cut-in-bgm.component';
//import { ModalService } from 'service/modal.service';
//import { PanelService } from 'service/panel.service';
//import { SaveDataService } from 'service/save-data.service';

//import { PointerDeviceService } from 'service/pointer-device.service';

import { PeerMenuComponent } from 'component/peer-menu/peer-menu.component';


@Component({
  selector: 'app-cut-in-window',
  templateUrl: './cut-in-window.component.html',
  styleUrls: ['./cut-in-window.component.css']
})
export class CutInWindowComponent implements OnInit, OnDestroy {
  
  minSize: number = 10;
  maxSize: number = 1200;

  private lazyUpdateTimer: NodeJS.Timer = null;
  readonly audioPlayer: AudioPlayer = new AudioPlayer();
  private cutInTimeOut = null ;
  
  cutIn: CutIn = null;

  get audios(): AudioFile[] { return AudioStorage.instance.audios.filter(audio => !audio.isHidden); }
  get cutInLauncher(): CutInLauncher { return ObjectStore.instance.get<CutInLauncher>('CutInLauncher'); }

  getCutIns(): CutIn[] {
    return ObjectStore.instance.getObjects(CutIn);
  }
  
  startCutIn(){
    if( !this.cutIn )return;
    console.log('CutInWin ' + this.cutIn.name );
    
    let audio = this.cutIn.audio ;
    if( audio ){
      this.audioPlayer.loop = this.cutIn.isLoop;
      this.audioPlayer.play( audio );
    }
    
    if( this.cutIn.outTime > 0){
      this.cutInTimeOut = setTimeout(() => {
        this.cutInTimeOut = null;
        this.panelService.close();
      }, this.cutIn.outTime * 1000);
    }
  }

  stopCutIn(){
     this.audioPlayer.stop();
  }
  

  constructor(
    private modalService: ModalService,
    private panelService: PanelService,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    EventSystem.register(this)
      .on('START_CUT_IN', event => { 
        console.log('カットインウィンドウ>Event:START_CUT_IN ' + this.cutIn.name );
        if( this.cutIn ){
          if( this.cutIn.identifier == event.data.cutIn.identifier || this.cutIn.tagName == event.data.cutIn.tagName){
            this.panelService.close();
          }
        }
      })
      .on('STOP_CUT_IN', event => { 
        console.log('カットインウィンドウ>Event: ' + this.cutIn.name );
        if( this.cutIn ){
          if( this.cutIn.identifier == event.data.cutIn.identifier ){
            this.panelService.close();
          }
        }
      });

  }

  ngOnDestroy() {
      if( this.cutInTimeOut ){
        clearTimeout(this.cutInTimeOut);
        this.cutInTimeOut = null;
      }
      
      this.stopCutIn();
      EventSystem.unregister(this);
      
  }

  private lazyNgZoneUpdate() {
    if (this.lazyUpdateTimer !== null) return;
    this.lazyUpdateTimer = setTimeout(() => {
      this.lazyUpdateTimer = null;
      this.ngZone.run(() => { });
    }, 100);
  }

 
}
