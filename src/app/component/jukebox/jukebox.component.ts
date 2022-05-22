import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';

import { AudioFile } from '@udonarium/core/file-storage/audio-file';
import { AudioPlayer, VolumeType } from '@udonarium/core/file-storage/audio-player';
import { AudioStorage } from '@udonarium/core/file-storage/audio-storage';
import { FileArchiver } from '@udonarium/core/file-storage/file-archiver';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { Jukebox } from '@udonarium/Jukebox';
import { Config } from '@udonarium/config';
import { ModalService } from 'service/modal.service';

import { CutInListComponent } from 'component/cut-in-list/cut-in-list.component';
import { PointerDeviceService } from 'service/pointer-device.service';
import { PanelOption, PanelService } from 'service/panel.service';

import { CutInLauncher } from '@udonarium/cut-in-launcher';

@Component({
  selector: 'app-jukebox',
  templateUrl: './jukebox.component.html',
  styleUrls: ['./jukebox.component.css']
})
export class JukeboxComponent implements OnInit, OnDestroy {

  get roomVolume(): number { 
    let conf = ObjectStore.instance.get<Config>('Config');
//    console.log("roomVolume()" + conf +" "+ conf.roomVolume);
    return conf? conf.roomVolume : 1 ;
  }

  set roomVolume(volume: number){
    let conf = ObjectStore.instance.get<Config>('Config');
    if(conf) conf.roomVolume = volume;
    this.jukebox.setNewVolume();
  }

  get volume(): number { return this.jukebox.volume; }
  set volume(volume: number) { 
    this.jukebox.volume = volume;
    AudioPlayer.volume = volume * this.roomVolume;
    EventSystem.trigger('CHANGE_JUKEBOX_VOLUME', null);
  }

  get auditionVolume(): number { return this.jukebox.auditionVolume; }
  set auditionVolume(auditionVolume: number) { 
    this.jukebox.auditionVolume = auditionVolume;
    AudioPlayer.auditionVolume = auditionVolume * this.roomVolume;
    EventSystem.trigger('CHANGE_JUKEBOX_VOLUME', null); 
  }

  get audios(): AudioFile[] { return AudioStorage.instance.audios.filter(audio => !audio.isHidden); }
  get jukebox(): Jukebox { return ObjectStore.instance.get<Jukebox>('Jukebox'); }

  get cutInLauncher(): CutInLauncher { return ObjectStore.instance.get<CutInLauncher>('CutInLauncher'); }

  readonly auditionPlayer: AudioPlayer = new AudioPlayer();
  private lazyUpdateTimer: NodeJS.Timer = null;

  constructor(
    private modalService: ModalService,
    private panelService: PanelService,
    private pointerDeviceService: PointerDeviceService,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    Promise.resolve().then(() => this.modalService.title = this.panelService.title = 'ジュークボックス');
    this.auditionPlayer.volumeType = VolumeType.AUDITION;
    EventSystem.register(this)
      .on('*', event => {
        if (event.eventName.startsWith('FILE_')) this.lazyNgZoneUpdate();
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

  playBGM(audio: AudioFile) { //memoこっちが全体
    
    //タグなしのBGM付きカットインはジュークボックスと同時に鳴らさないようにする
    //BGM駆動のためのインスタンスを別にしているため現状この処理で止める
    this.cutInLauncher.stopBlankTagCutIn();
    
    this.jukebox.play(audio.identifier, true);
    
  }

  stopBGM(audio: AudioFile) {
    if (this.jukebox.audio === audio) this.jukebox.stop();
  }

  handleFileSelect(event: Event) {
    let input = <HTMLInputElement>event.target;
    let files = input.files;
    if (files.length) FileArchiver.instance.load(files);
    input.value = '';
  }

  private lazyNgZoneUpdate() {
    if (this.lazyUpdateTimer !== null) return;
    this.lazyUpdateTimer = setTimeout(() => {
      this.lazyUpdateTimer = null;
      this.ngZone.run(() => { });
    }, 100);
  }

  openCutInList() {
    let coordinate = this.pointerDeviceService.pointers[0];
    let option: PanelOption = { left: coordinate.x+25, top: coordinate.y+25, width: 650, height: 740 };
    this.panelService.open<CutInListComponent>(CutInListComponent, option);
  }

}
