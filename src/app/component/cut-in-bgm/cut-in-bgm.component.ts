import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';

import { AudioFile } from '@udonarium/core/file-storage/audio-file';
import { AudioPlayer, VolumeType } from '@udonarium/core/file-storage/audio-player';
import { AudioStorage } from '@udonarium/core/file-storage/audio-storage';
import { FileArchiver } from '@udonarium/core/file-storage/file-archiver';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { Jukebox } from '@udonarium/Jukebox';

import { ModalService } from 'service/modal.service';


//entyu_30
//import { PanelService } from 'service/panel.service';

import { CutInListComponent } from 'component/cut-in-list/cut-in-list.component';
import { PointerDeviceService } from 'service/pointer-device.service';
import { PanelOption, PanelService } from 'service/panel.service';
//

@Component({
  selector: 'app-cut-in-bgm',
  templateUrl: './cut-in-bgm.component.html',
  styleUrls: ['./cut-in-bgm.component.css']
})
export class CutInBgmComponent implements OnInit, OnDestroy {

  get audios(): AudioFile[] { return AudioStorage.instance.audios.filter(audio => !audio.isHidden); }
  get jukebox(): Jukebox { return ObjectStore.instance.get<Jukebox>('Jukebox'); }

  constructor(
    private modalService: ModalService,
    private panelService: PanelService,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    Promise.resolve().then(() => this.modalService.title = this.panelService.title = 'カットインBGM選択');
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  handleFileSelect(event: Event) {
    let files = (<HTMLInputElement>event.target).files;
    if (files.length) FileArchiver.instance.load(files);
  }

  onSelectedFile(file: AudioFile) {
    console.log('onSelectedFile', file);
    EventSystem.call('SELECT_FILE', { fileIdentifier: file.identifier }, Network.peerId);
    this.modalService.resolve(file.identifier);
  }

  private lazyNgZoneUpdate() {
    if (this.lazyUpdateTimer !== null) return;
    this.lazyUpdateTimer = setTimeout(() => {
      this.lazyUpdateTimer = null;
      this.ngZone.run(() => { });
    }, 100);
  }


}
