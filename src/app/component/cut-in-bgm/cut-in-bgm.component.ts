import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';

import { AudioFile } from '@udonarium/core/file-storage/audio-file';
import { AudioPlayer, VolumeType } from '@udonarium/core/file-storage/audio-player';
import { AudioStorage } from '@udonarium/core/file-storage/audio-storage';
import { FileArchiver } from '@udonarium/core/file-storage/file-archiver';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { Jukebox } from '@udonarium/Jukebox';

import { ModalService } from 'service/modal.service';

import { PointerDeviceService } from 'service/pointer-device.service';
import { PanelOption, PanelService } from 'service/panel.service';

@Component({
  selector: 'app-cut-in-bgm',
  templateUrl: './cut-in-bgm.component.html',
  styleUrls: ['./cut-in-bgm.component.css']
})
export class CutInBgmComponent implements OnInit, OnDestroy {

  get volume(): number { return AudioPlayer.volume; }
  set volume(volume: number) { AudioPlayer.volume = volume; }

  get auditionVolume(): number { return AudioPlayer.auditionVolume; }
  set auditionVolume(auditionVolume: number) { AudioPlayer.auditionVolume = auditionVolume; }

  get audios(): AudioFile[] { return AudioStorage.instance.audios.filter(audio => !audio.isHidden); }
  get jukebox(): Jukebox { return ObjectStore.instance.get<Jukebox>('Jukebox'); }

  readonly auditionPlayer: AudioPlayer = new AudioPlayer();
  private lazyUpdateTimer: NodeJS.Timer = null;


  constructor(
    private modalService: ModalService,
    private panelService: PanelService,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    Promise.resolve().then(() => this.modalService.title = this.panelService.title = 'カットインBGM選択');
    this.auditionPlayer.volumeType = VolumeType.AUDITION;
    EventSystem.register(this)
      .on('*', event => {
      });
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
    this.stop();
  }

  play(audio: AudioFile) {
    this.auditionPlayer.play(audio);
  }

  stop() {
    this.auditionPlayer.stop();
  }
  
  
  selectBgm(file: AudioFile) {
    if( !file )return; 
    console.log('onSelectedFile', file);
    
    console.log('file.identifier' + file.identifier);
    console.log('file.name' + file.name);
    
    this.modalService.resolve(file.identifier);
  }
  
  
  handleFileSelect(event: Event) {
    let files = (<HTMLInputElement>event.target).files;
    if (files.length) FileArchiver.instance.load(files);
  }

  private lazyNgZoneUpdate() {
    if (this.lazyUpdateTimer !== null) return;
    this.lazyUpdateTimer = setTimeout(() => {
      this.lazyUpdateTimer = null;
      this.ngZone.run(() => { });
    }, 100);
  }


}
