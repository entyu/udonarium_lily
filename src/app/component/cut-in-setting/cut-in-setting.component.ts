import { AfterViewInit, Component, ElementRef, EventEmitter, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CutInList } from '@udonarium/cut-in-list';
import { CutIn } from '@udonarium/cut-in';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { ObjectSerializer } from '@udonarium/core/synchronize-object/object-serializer';
import { PointerDeviceService } from 'service/pointer-device.service';
import { ModalService } from 'service/modal.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { SaveDataService } from 'service/save-data.service';
import { EventSystem } from '@udonarium/core/system';
import { TextViewComponent } from 'component/text-view/text-view.component';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { ImageTag } from '@udonarium/image-tag';
import { FileSelecterComponent } from 'component/file-selecter/file-selecter.component';
import { CutInService } from 'service/cut-in.service';
import { PeerCursor } from '@udonarium/peer-cursor';
import { AudioFile } from '@udonarium/core/file-storage/audio-file';
import { AudioStorage } from '@udonarium/core/file-storage/audio-storage';
import { UUID } from '@udonarium/core/system/util/uuid';
import { OpenUrlComponent } from 'component/open-url/open-url.component';
import { CutInComponent } from 'component/cut-in/cut-in.component';


@Component({
  selector: 'app-cut-in-setting',
  templateUrl: './cut-in-setting.component.html',
  styleUrls: ['./cut-in-setting.component.css']
})
export class CutInSettingComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('cutInSelecter') cutInSelecter: ElementRef<HTMLSelectElement>;
  readonly minSize: number = 0;
  readonly maxSize: number = 100;

  panelId: string;

  isShowHideImages = false;
  selectedCutIn: CutIn = null;
  selectedCutInXml: string = '';

  get cutIns(): CutIn[] { return CutInList.instance.cutIns; }

  get cutInName(): string { return this.selectedCutIn.name; }
  set cutInName(cutInName: string) { if (this.isEditable) this.selectedCutIn.name = cutInName; }

  get cutInTag(): string { return this.selectedCutIn.tag; }
  set cutInTag(cutInTag: string) { if (this.isEditable) this.selectedCutIn.tag = cutInTag; }

  get cutInDuration(): number { return this.selectedCutIn.duration; }
  set cutInDuration(cutInDuration: number) { if (this.isEditable) this.selectedCutIn.duration = cutInDuration; }

  get cutInCond(): string { return this.selectedCutIn.value + ''; }
  set cutInCond(cutInCond: string) { if (this.isEditable) this.selectedCutIn.value = cutInCond; }

  get cutInIsPreventOutBounds(): boolean { return this.selectedCutIn.isPreventOutBounds; }
  set cutInIsPreventOutBounds(isPreventOutBounds: boolean) { if (this.isEditable) this.selectedCutIn.isPreventOutBounds = isPreventOutBounds; }

  get cutInWidth(): number { return this.selectedCutIn.width; }
  set cutInWidth(cutInWidth: number) { if (this.isEditable) this.selectedCutIn.width = cutInWidth; }

  get cutInHeight(): number { return this.selectedCutIn.height; }
  set cutInHeight(cutInHeight: number) { if (this.isEditable) this.selectedCutIn.height = cutInHeight; }

  get objectFitType(): number { return this.selectedCutIn.objectFitType; }
  set objectFitType(objectFitType: number) { if (this.isEditable) this.selectedCutIn.objectFitType = objectFitType; }

  get cutInPosX(): number { return this.selectedCutIn.posX; }
  set cutInPosX(cutInPosX: number) { if (this.isEditable) this.selectedCutIn.posX = cutInPosX; }

  get cutInPosY(): number { return this.selectedCutIn.posY; }
  set cutInPosY(cutInPosY: number) { if (this.isEditable) this.selectedCutIn.posY = cutInPosY; }

  get cutInZIndex(): number { return this.selectedCutIn.zIndex; }
  set cutInZIndex(cutInZIndex: number) { if (this.isEditable) this.selectedCutIn.zIndex = cutInZIndex; }

  get cutInIsFrontOfStand(): boolean { return this.selectedCutIn.isFrontOfStand; }
  set cutInIsFrontOfStand(isFrontOfStand: boolean) { if (this.isEditable) this.selectedCutIn.isFrontOfStand = isFrontOfStand; }

  get cutInAudioIdentifier(): string { return this.selectedCutIn.audioIdentifier; }
  set cutInAudioIdentifier(audioIdentifier: string) { if (this.isEditable) this.selectedCutIn.audioIdentifier = audioIdentifier; }
  
  get cutInAudioFileName(): string { return this.selectedCutIn.audioFileName; }
  set cutInAudioFileName(audioFileName: string) { if (this.isEditable) this.selectedCutIn.audioFileName = audioFileName; }

  get cutInSEIsLoop(): boolean { return this.selectedCutIn.isLoop; }
  set cutInSEIsLoop(isLoop: boolean) { if (this.isEditable) this.selectedCutIn.isLoop = isLoop; }

  get cutInType(): number { return this.selectedCutIn.animationType; }
  set cutInType(cutInType: number) { if (this.isEditable) this.selectedCutIn.animationType = cutInType; }

  get borderStyle(): number { return this.selectedCutIn.borderStyle; }
  set borderStyle(borderStyle: number) { if (this.isEditable) this.selectedCutIn.borderStyle = borderStyle; }

  get isEmpty(): boolean { return this.cutIns.length < 1; }
  get isDeleted(): boolean { return this.selectedCutIn ? ObjectStore.instance.get(this.selectedCutIn.identifier) == null : false; }
  get isEditable(): boolean { return !this.isEmpty && !this.isDeleted; }

  get cutInIsVideo(): boolean { return this.selectedCutIn.isVideoCutIn; }
  set cutInIsVideo(isVideo: boolean) { if (this.isEditable) this.selectedCutIn.isVideoCutIn = isVideo; }

  get cutInVideoURL(): string { return this.selectedCutIn.videoUrl; }
  set cutInVideoURL(videoUrl: string) { if (this.isEditable) this.selectedCutIn.videoUrl = videoUrl; }

  get cutInisSoundOnly(): boolean { return this.selectedCutIn.isSoundOnly; }
  set cutInisSoundOnly(isSoundOnly: boolean) { if (this.isEditable)  this.selectedCutIn.isSoundOnly = isSoundOnly; }

  get cutInVideoId(): string {
    if (!this.selectedCutIn) return '';
    return this.selectedCutIn.videoId;
  }

  get cutInPlayListId(): string {
    if (!this.cutInVideoId) return '';
    return this.selectedCutIn.playListId;
  }

  get cutInImage(): ImageFile {
    if (!this.selectedCutIn) return ImageFile.Empty;
    let file = ImageStorage.instance.get(this.selectedCutIn.imageIdentifier);
    return file ? file : ImageFile.Empty;
  }
  
  get cutInImageUrl(): string {
    if (!this.selectedCutIn) return ImageFile.Empty.url;
    return (!this.selectedCutIn.videoId || this.cutInisSoundOnly) ? this.cutInImage.url : `https://img.youtube.com/vi/${this.selectedCutIn.videoId}/hqdefault.jpg`;
  }

  get isPlaying(): boolean {
    if (!this.selectedCutIn) return false;
    return CutInService.nowShowingIdentifiers().includes(this.selectedCutIn.identifier);
  }

  isPlayingNow(cutIn: CutIn): boolean {
    if (!cutIn) return false;
    return CutInService.nowShowingIdentifiers().includes(cutIn.identifier);
  }

  get isValidAudio(): boolean {
    if (!this.selectedCutIn) return true;
    return this.selectedCutIn.isValidAudio;
  }
  
  get myPeer(): PeerCursor { return PeerCursor.myCursor; }
  get otherPeers(): PeerCursor[] { return ObjectStore.instance.getObjects(PeerCursor); }

  get myColor(): string {
    if (PeerCursor.myCursor
      && PeerCursor.myCursor.color
      && PeerCursor.myCursor.color != PeerCursor.CHAT_TRANSPARENT_COLOR) {
      return PeerCursor.myCursor.color;
    }
    return PeerCursor.CHAT_DEFAULT_COLOR;
  }

  get sendToColor(): string {
    let object = ObjectStore.instance.get(this.sendTo);
    if (object instanceof PeerCursor) {
      return object.color;
    }
    return PeerCursor.CHAT_DEFAULT_COLOR;
  }

  get audios(): AudioFile[] { return AudioStorage.instance.audios.filter(audio => !audio.isHidden); }

  sendTo: string = '';
  isSaveing: boolean = false;
  progresPercent: number = 0;

  constructor(
    private pointerDeviceService: PointerDeviceService,
    private modalService: ModalService,
    private panelService: PanelService,
    private saveDataService: SaveDataService
  ) { }

  ngOnInit(): void {
    Promise.resolve().then(() => this.modalService.title = this.panelService.title = 'カットイン設定');
    EventSystem.register(this)
      .on('SYNCHRONIZE_AUDIO_LIST', -1000, event => {
        this.onAudioFileChange();
      });
    this.panelId = UUID.generateUuid();
  }

  ngAfterViewInit() {
    if (this.cutIns.length > 0) {
      setTimeout(() => {
        this.onChangeCutIn(this.cutIns[0].identifier);
        this.cutInSelecter.nativeElement.selectedIndex = 0;
      });
    }
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  onChangeCutIn(identifier: string) {
    this.selectedCutIn = ObjectStore.instance.get<CutIn>(identifier);
    this.selectedCutInXml = '';
  }

  create(name: string = 'カットイン'): CutIn {
    return CutInList.instance.addCutIn(name)
  }

  add() {
    const cutIn = this.create();
    cutIn.imageIdentifier = 'stand_no_image';
    setTimeout(() => {
      this.onChangeCutIn(cutIn.identifier);
      this.cutInSelecter.nativeElement.value = cutIn.identifier;
    })
  }
  
  async save() {
    if (!this.selectedCutIn || this.isSaveing) return;
    this.isSaveing = true;
    this.progresPercent = 0;

    let fileName: string = 'fly_cutIn_' + this.selectedCutIn.name;

    await this.saveDataService.saveGameObjectAsync(this.selectedCutIn, fileName, percent => {
      this.progresPercent = percent;
    });

    setTimeout(() => {
      this.isSaveing = false;
      this.progresPercent = 0;
    }, 500);
  }

  delete() {
    if (!this.selectedCutIn) return;
    EventSystem.call('STOP_CUT_IN', { 
      identifier: this.selectedCutIn.identifier
    });
    if (!this.isEmpty) {
      this.selectedCutInXml = this.selectedCutIn.toXml();
      this.selectedCutIn.destroy();
    }
  }

  restore() {
    if (this.selectedCutIn && this.selectedCutInXml) {
      let restoreCutIn = <CutIn>ObjectSerializer.instance.parseXml(this.selectedCutInXml);
      CutInList.instance.addCutIn(restoreCutIn);
      this.selectedCutInXml = '';
      setTimeout(() => {
        const cutIns = this.cutIns;
        this.onChangeCutIn(cutIns[cutIns.length - 1].identifier);
        this.cutInSelecter.nativeElement.selectedIndex = cutIns.length - 1;
      });
    }
  }

  getHidden(image: ImageFile): boolean {
    const imageTag = ImageTag.get(image.identifier);
    return imageTag ? imageTag.hide : false;
  }

  upTabIndex() {
    if (!this.selectedCutIn) return;
    let parentElement = this.selectedCutIn.parent;
    let index: number = parentElement.children.indexOf(this.selectedCutIn);
    if (0 < index) {
      let prevElement = parentElement.children[index - 1];
      parentElement.insertBefore(this.selectedCutIn, prevElement);
    }
  }

  downTabIndex() {
    if (!this.selectedCutIn) return;
    let parentElement = this.selectedCutIn.parent;
    let index: number = parentElement.children.indexOf(this.selectedCutIn);
    if (index < parentElement.children.length - 1) {
      let nextElement = parentElement.children[index + 1];
      parentElement.insertBefore(nextElement, this.selectedCutIn);
    }
  }

  openModal() {
    if (this.isDeleted) return;
    let currentImageIdentifires: string[] = [];
    if (this.selectedCutIn && this.selectedCutIn.imageIdentifier) currentImageIdentifires = [this.selectedCutIn.imageIdentifier];
    this.modalService.open<string>(FileSelecterComponent, { currentImageIdentifires: currentImageIdentifires }).then(value => {
      if (!this.selectedCutIn || !value) return;
      this.selectedCutIn.imageIdentifier = value;
    });
  }

  onShowHiddenImages($event: Event) {
    if (this.isShowHideImages) {
      this.isShowHideImages = false;
    } else {
      if (window.confirm("非表示設定の画像を表示します（ネタバレなどにご注意ください）。\nよろしいですか？")) {
        this.isShowHideImages = true;
      } else {
        this.isShowHideImages = false;
        $event.preventDefault();
      }
    }
  }

  playCutIn() {
    if (!this.selectedCutIn) return;
    const sendObj = {
      identifier: this.selectedCutIn.identifier,
      secret: this.sendTo ? true : false,
      sender: PeerCursor.myCursor.peerId
    };
    if (sendObj.secret) {
      const targetPeer = ObjectStore.instance.get<PeerCursor>(this.sendTo);
      if (targetPeer) {
        if (targetPeer.peerId != PeerCursor.myCursor.peerId) EventSystem.call('PLAY_CUT_IN', sendObj, targetPeer.peerId);
        EventSystem.call('PLAY_CUT_IN', sendObj, PeerCursor.myCursor.peerId);
      }
    } else {
      EventSystem.call('PLAY_CUT_IN', sendObj);
    }
  }

  stopCutIn() {
    if (!this.selectedCutIn) return;
    const sendObj = {
      identifier: this.selectedCutIn.identifier,
      secret: this.sendTo ? true : false,
      sender: PeerCursor.myCursor.peerId
    };
    if (sendObj.secret) {
      const targetPeer = ObjectStore.instance.get<PeerCursor>(this.sendTo);
      if (targetPeer) {
        if (targetPeer.peerId != PeerCursor.myCursor.peerId) EventSystem.call('STOP_CUT_IN', sendObj, targetPeer.peerId);
        EventSystem.call('STOP_CUT_IN', sendObj, PeerCursor.myCursor.peerId);
      }
    } else {
      EventSystem.call('STOP_CUT_IN', sendObj);
    }
  }

  testCutIn() {
    if (!this.selectedCutIn) return;
    setTimeout(() => {
      EventSystem.trigger('PLAY_CUT_IN', { 
        identifier: this.selectedCutIn.identifier, 
        test: true
      });
    });
  }

  onAudioFileChange(identifier: string='') {
    if (!identifier && this.selectedCutIn) identifier = this.selectedCutIn.audioIdentifier;
    if (identifier == '') {
      this.cutInAudioFileName = '';
      return;
    }
    const audio = AudioStorage.instance.get(identifier);
    this.cutInAudioFileName = audio ? audio.name : '';
  }

  openYouTubeTerms() {
    this.modalService.open(OpenUrlComponent, { url: 'https://www.youtube.com/terms', title: 'YouTube 利用規約' });
    return false;
  }

  helpCutIn() {
    let coordinate = this.pointerDeviceService.pointers[0];
    let option: PanelOption = { left: coordinate.x, top: coordinate.y, width: 600, height: 620 };
    let textView = this.panelService.open(TextViewComponent, option);
    textView.title = 'カットインヘルプ';
    textView.text = 
`　カットインの名前、表示時間、位置と幅と高さ（それぞれ画面サイズに対する相対指定）、チャット送信時にカットインが表示される条件を設定できます。また、動画を再生する場合および「見切れ防止」にチェックを入れた場合、画面内に収まるように位置とサイズが調整されます。
　
　横位置（PosX）と縦位置（PosY）は、画面の左上隅からカットインの中心位置までの距離となります。サイズの幅（Width）と高さ（Height）のどちらかを0とした場合、元画像の縦横比を保って拡大縮小します（ただし、カットインの最小幅、高さは${CutInComponent.MIN_SIZE}ピクセルとなります）。
　
　動画を再生するカットインは必ず前面、その他は後から表示されるカットイン画像がより前面になりますが、重なり順（Z-Index）を指定することで制御可能です。同じカットイン、動画を再生するカットイン、同じタグが指定されたカットインを再生する場合は、以前のものは停止します。また、チャット末尾条件を満たすカットインが複数ある場合、

　　・タグが設定されていないものはすべて
　　・タグが設定されたものは、同じタグのものの中からランダムに1つ
　　・動画を再生するカットインは上記の中からランダムに1つを選択

となります。

　カットインはドラッグによって移動可能です（動画を再生するカットインは端をドラッグ）。またダブルクリックで閉じる（自分だけ停止）、右クリックでコンテキストメニューから操作が可能です（「閉じる」「ウィンドウの背面に表示」「最小化」が可能、動画を再生するカットインは端で受付）。

　アップロードされた音楽ファイルをカットイン表示時の効果音として設定できます。音量にはジュークボックスの設定（「テスト (自分だけ見る)」の場合は試聴音量）が使用されます。表示時間や手動操作によってカットインが停止した際には、途中であっても音声も停止します。カットインや部屋のセーブデータ（zip）には音楽ファイルは含まれませんので、必要でしたら別途アップロードしてください（カットインと音楽ファイルのリンクはファイルの内容によります、同名の別ファイルをアップロードしても再リンクされません）。

　カットインに動画を使用する場合、URLは現在YouTubeのもののみ有効です。動画を利用する際は権利者およびYouTubeの定めた利用規約を参照し、順守してください。`;
  }
}