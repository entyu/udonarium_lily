import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { EventSystem } from '@udonarium/core/system';
import { PanelService } from 'service/panel.service';
import { DataElement } from '@udonarium/data-element';
import { GameCharacter } from '@udonarium/game-character';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { StandElementComponent } from 'component/stand-element/stand-element.component';
import { UUID } from '@udonarium/core/system/util/uuid';

@Component({
  selector: 'app-stand-setting',
  templateUrl: './stand-setting.component.html',
  styleUrls: ['./stand-setting.component.css']
})
export class StandSettingComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() character: GameCharacter = null;
　@ViewChildren(StandElementComponent) standElementComponents: QueryList<StandElementComponent>;

  panelId;

  private _intervalId;
  private isSpeaking = false;

  constructor(
    private panelService: PanelService
  ) { }

  get standElements(): DataElement[] {
    return this.character.standList.standElements;
  }

  get imageList(): ImageFile[] {
    if (!this.character) return [];
    let ret = [];
    let dupe = {};
    const tmp = this.character.imageDataElement.getElementsByName('imageIdentifier');
    const elements = tmp.concat(this.character.imageDataElement.getElementsByName('faceIcon'));
    for (let elm of elements) {
      if (dupe[elm.value]) continue;
      let file = this.imageElementToFile(elm);
      if (file) {
        dupe[elm.value] = true;
        ret.push(file);
      }
    }
    return ret;
  }

  get position(): number {
    if (!this.character || !this.character.standList) return 0;
    return this.character.standList.position;
  }

  set position(position: number) {
    if (!this.character || !this.character.standList) return;
    this.character.standList.position = position;
  }

  get height(): number {
    if (!this.character || !this.character.standList) return 0;
    return this.character.standList.height;
  }

  set height(height: number) {
    if (!this.character || !this.character.standList) return;
    this.character.standList.height = height;
  }

  get overviewIndex(): number {
    if (!this.character || !this.character.standList) return -1;
    return this.character.standList.overviewIndex;
  }

  set overviewIndex(overviewIndex: number) {
    if (!this.character || !this.character.standList) return;
    this.character.standList.overviewIndex = overviewIndex;
  }

  ngOnInit() {
    Promise.resolve().then(() => this.updatePanelTitle());
    EventSystem.register(this)
      .on('DELETE_GAME_OBJECT', -1000, event => {
        if (this.character && this.character.identifier === event.data.identifier) {
          this.panelService.close();
        }
      });
    this.panelId = UUID.generateUuid();
  }

  ngAfterViewInit() {
    this._intervalId = setInterval(() => {
      this.isSpeaking = !this.isSpeaking;
      this.standElementComponents.forEach(standElementComponent => {
        standElementComponent.isSpeaking = this.isSpeaking;
      });
    }, 3600);
  }

  ngOnDestroy() {
    clearInterval(this._intervalId)
    EventSystem.unregister(this);
  }

  updatePanelTitle() {
    this.panelService.title = this.character.name + ' のスタンド設定';
  }

  add() {
    this.character.standList.add(this.character.imageFile.identifier);
  }

  delele(standElement: DataElement, index: number) {
    if (!this.character || !this.character.standList || !window.confirm('スタンド設定を削除しますか？')) return;
    let elm = this.character.standList.removeChild(standElement);
    if (elm) {
      if (this.character.standList.overviewIndex == index) {
        this.character.standList.overviewIndex = -1;
      } else if (this.character.standList.overviewIndex > index) {
        this.character.standList.overviewIndex -= 1;
      }
    }
  }

  private imageElementToFile(dataElm: DataElement): ImageFile {
    if (!dataElm) return null;
    return ImageStorage.instance.get(<string>dataElm.value);
  }
}
