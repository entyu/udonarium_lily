import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { EventSystem } from '@udonarium/core/system';
import { PanelOption, PanelService } from 'service/panel.service';
import { DataElement } from '@udonarium/data-element';
import { GameCharacter } from '@udonarium/game-character';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { StandElementComponent } from 'component/stand-element/stand-element.component';
import { UUID } from '@udonarium/core/system/util/uuid';
import { PointerDeviceService } from 'service/pointer-device.service';
import { TextViewComponent } from 'component/text-view/text-view.component';

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
    private panelService: PanelService,
    private pointerDeviceService: PointerDeviceService,
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

  helpStandSeteing() {
    let coordinate = this.pointerDeviceService.pointers[0];
    let option: PanelOption = { left: coordinate.x, top: coordinate.y, width: 600, height: 440 };
    let textView = this.panelService.open(TextViewComponent, option);
    textView.title = 'スタンド設定ヘルプ';
    textView.text = 
`　チャット送信時にスタンドが表示される条件を設定できます。　
　スタンドに名前を設定した場合、チャットウィンドウ、チャットパネルのリストに表示され、選択可能になります。
　また、特別な条件として常に、チャットテキストの末尾が"@退去"または"@farewell"の場合は、そのキャラクターのスタンドを退去させます。

　優先順位は高いものから

　　１. "@退去"、"@farewell"による退去
　　２. チャットウィンドウ、チャットパネルのリストによる選択
　　３. 「指定画像 かつ チャット末尾」
　　４. 「指定画像 または チャット末尾」
　　５. 「チャット末尾」
　　６. 「指定画像」

　どの条件も満たさない場合「デフォルト」のものが使用され、同じ優先順位の条件が複数ある場合はランダムで1つが選択されます。

　チャット末尾一致を判定する際、全角半角、アルファべットの大文字小文字は区別されません。
　また、"@退去"、"@farewell"による退去時、あるいは"@笑い"のように先頭が"@"で始まる条件を設定している場合、そのキャラクターでの送信時に、条件に一致するチャットテキスト末尾の@以下は切り落とされます。`;
  }

  private imageElementToFile(dataElm: DataElement): ImageFile {
    if (!dataElm) return null;
    return ImageStorage.instance.get(<string>dataElm.value);
  }
}
