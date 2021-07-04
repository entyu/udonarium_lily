import { AfterViewInit, ChangeDetectorRef, Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FileArchiver } from '@udonarium/core/file-storage/file-archiver';

import { ModalService } from 'service/modal.service';
import { PanelOption, PanelService } from 'service/panel.service';

import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { ObjectSerializer } from '@udonarium/core/synchronize-object/object-serializer';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem, Network } from '@udonarium/core/system';

import { animate, keyframes, style, transition, trigger } from '@angular/animations';

import { PeerMenuComponent } from 'component/peer-menu/peer-menu.component';


@Component({
  selector: 'app-vote-window',
  templateUrl: './vote-window.component.html',
  styleUrls: ['./vote-window.component.css']

})
export class VoteWindowComponent implements AfterViewInit,OnInit, OnDestroy {

  left : number = 0;
  top : number = 0;
  width : number = 200;
  height : number = 150;
  
  minSize: number = 10;
  maxSize: number = 1200;

  private lazyUpdateTimer: NodeJS.Timer = null;
  private cutInTimeOut = null ;
  

  startCutIn(){
/*
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
*/
  }

  stopCutIn(){
/*
     this.audioPlayer.stop();
*/
  }
  

  constructor(
    private modalService: ModalService,
    private panelService: PanelService,
    private changeDetectionRef: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    EventSystem.register(this)
      .on('START_VOTE', event => { 
        console.log('投票開始 ');
/*
        if( this.cutIn ){
          if( this.cutIn.identifier == event.data.cutIn.identifier || this.cutIn.tagName == event.data.cutIn.tagName){
            this.panelService.close();
          }
        }
*/
      })
      .on('STOP_VOTE', event => { 
        console.log('古い投票を破棄:');
/*
        if( this.cutIn ){
          if( this.cutIn.identifier == event.data.cutIn.identifier ){
            this.panelService.close();
          }
        }
*/
      });
  }
    
  ngAfterViewInit() {
/*
    if( this.cutIn ){
      setTimeout(() => {
        this.moveCutInPos();
      },0);
    }
*/
  }

  moveCutInPos(){
/*    
    if( this.cutIn ){
      
      let cutin_w = this.cutIn.width;
      let cutin_h = this.cutIn.height;

      let margin_w = window.innerWidth - cutin_w ;
      let margin_h = window.innerHeight - cutin_h - 25 ;
    
      if( margin_w < 0 )margin_w = 0 ;
      if( margin_h < 0 )margin_h = 0 ;
    
      let margin_x = margin_w * this.cutIn.x_pos / 100;
      let margin_y = margin_h * this.cutIn.y_pos / 100;

      this.width = cutin_w ;
      this.height = cutin_h + 25 ;
      this.left = margin_x ;
      this.top = margin_y;
    }else{
      
      console.log("カットインが未定義で再生された");
    }
  

    this.panelService.width = this.width ;
    this.panelService.height = this.height ;
    this.panelService.left = this.left ;
    this.panelService.top = this.top ;
*/
  }

  ngOnDestroy() {
/*
      if( this.cutInTimeOut ){
        clearTimeout(this.cutInTimeOut);
        this.cutInTimeOut = null;
      }
*/
      this.stopCutIn();
      EventSystem.unregister(this);
  }

  private lazyNgZoneUpdate() {
/*
    if (this.lazyUpdateTimer !== null) return;
    this.lazyUpdateTimer = setTimeout(() => {
      this.lazyUpdateTimer = null;
      this.ngZone.run(() => { });
    }, 100);
*/
  }

 
}
