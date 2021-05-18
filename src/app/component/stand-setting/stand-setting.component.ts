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
import { ObjectSerializer } from '@udonarium/core/synchronize-object/object-serializer';

@Component({
  selector: 'app-stand-setting',
  templateUrl: './stand-setting.component.html',
  styleUrls: ['./stand-setting.component.css']
})
export class StandSettingComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() character: GameCharacter = null;
　@ViewChildren(StandElementComponent) standElementComponents: QueryList<StandElementComponent>;

  panelId: string;
  standSettingXML = '';

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
    this.standSettingXML = '';
  }

  delele(standElement: DataElement, index: number) {
    EventSystem.call('DELETE_STAND_IMAGE', {
      characterIdentifier: this.character.identifier,
      identifier: standElement.identifier
    });
    if (!this.character || !this.character.standList || !window.confirm('スタンド設定を削除しますか？')) return;
    this.standSettingXML = standElement.toXml();
    let elm = this.character.standList.removeChild(standElement);
    if (elm) {
      if (this.character.standList.overviewIndex == index) {
        this.character.standList.overviewIndex = -1;
      } else if (this.character.standList.overviewIndex > index) {
        this.character.standList.overviewIndex -= 1;
      }
    }
  }
  
  restore() {
    if (!this.standSettingXML) return;
    let restoreStand = <DataElement>ObjectSerializer.instance.parseXml(this.standSettingXML);
    this.character.standList.appendChild(restoreStand);
    this.standSettingXML = '';
  }

  upStandIndex(standElement: DataElement) {
    this.standSettingXML = '';
    let parentElement = this.character.standList;
    let index: number = parentElement.children.indexOf(standElement);
    if (0 < index) {
      let prevElement = parentElement.children[index - 1];
      parentElement.insertBefore(standElement, prevElement);
      if (this.character.standList.overviewIndex == index) {
        this.character.standList.overviewIndex -= 1;
      } else if (this.character.standList.overviewIndex == index - 1) {
        this.character.standList.overviewIndex += 1;
      } 
    }
  }

  downStandIndex(standElement: DataElement) {
    this.standSettingXML = '';
    let parentElement = this.character.standList;
    let index: number = parentElement.children.indexOf(standElement);
    if (index < parentElement.children.length - 1) {
      let nextElement = parentElement.children[index + 1];
      parentElement.insertBefore(nextElement, standElement);
      if (this.character.standList.overviewIndex == index) {
        this.character.standList.overviewIndex += 1;
      } else if (this.character.standList.overviewIndex == index + 1) {
        this.character.standList.overviewIndex -= 1;
      } 
    }
  }

  helpStandSeteing() {
    let coordinate = this.pointerDeviceService.pointers[0];
    let option: PanelOption = { left: coordinate.x, top: coordinate.y, width: 600, height: 590 };
    let textView = this.panelService.open(TextViewComponent, option);
    textView.title = 'スタンド設定ヘルプ';
    textView.text = 
`　キャラクターのスタンドの名前、位置と画像の高さ（それぞれ画面サイズに対する相対指定）、チャット送信時にスタンドが表示される条件を設定できます。

　スタンドに名前を設定した場合、チャットウィンドウ、チャットパネルのリストに表示され、選択可能になります。また、タグを設定した場合、異なるタグでは同じキャラクターであっても登場、退去のアニメーションが行われます。

　画像の位置と高さは個別指定も可能です、位置の個別指定はチェックなし、高さは0とした場合に全体の設定が使用されます。縦位置調整(AdjY)は、スタンド画像の高さに対する相対指定となります（例えば、-50%とすると画像の下半分が画面端より下に隠れます）。

　条件の「指定画像」はチャット送信時のキャラクター画像あるいは顔ICです。また、特別な条件として常に、チャットテキストの末尾が"@退去"または"@farewell"の場合は、そのキャラクターのスタンドを退去させます。

　優先順位は高いものから

　　１. "@退去"、"@farewell"による退去
　　２. チャットウィンドウ、チャットパネルのリストで選択した名前
　　３. 「指定画像 かつ チャット末尾」
　　４. 「指定画像 または チャット末尾」
　　５. 「チャット末尾」
　　６. 「指定画像」

　どの条件も満たさない場合「デフォルト」のものが使用され、同じ優先順位の条件が複数ある場合はランダムで1つが選択されます。

　チャット末尾一致を判定する際、全角半角、アルファべットの大文字小文字は区別されません。
　また、"@退去"、"@farewell"による退去時、あるいは"@笑い"のように先頭が"@"で始まる条件を設定している場合、（スタンドの有効無効、条件を満たすかに関わらず）そのキャラクターでの送信時に、条件に一致するチャットテキスト末尾の@以下は切り落とされます。`;
  }

  private imageElementToFile(dataElm: DataElement): ImageFile {
    if (!dataElm) return null;
    return ImageStorage.instance.get(<string>dataElm.value);
  }
}
