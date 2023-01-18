import { AfterViewInit, Component, NgZone, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { NgSelectConfig } from '@ng-select/ng-select';

import { ChatTabList } from '@udonarium/chat-tab-list';
import { Config } from '@udonarium/config';

import { AudioPlayer } from '@udonarium/core/file-storage/audio-player';
import { AudioSharingSystem } from '@udonarium/core/file-storage/audio-sharing-system';
import { AudioStorage } from '@udonarium/core/file-storage/audio-storage';
import { FileArchiver } from '@udonarium/core/file-storage/file-archiver';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageSharingSystem } from '@udonarium/core/file-storage/image-sharing-system';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { ObjectFactory } from '@udonarium/core/synchronize-object/object-factory';
import { ObjectSerializer } from '@udonarium/core/synchronize-object/object-serializer';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { ObjectSynchronizer } from '@udonarium/core/synchronize-object/object-synchronizer';
import { EventSystem, Network } from '@udonarium/core/system';
import { DataSummarySetting } from '@udonarium/data-summary-setting';
import { DiceBot } from '@udonarium/dice-bot';
import { Jukebox } from '@udonarium/Jukebox';
import { PeerCursor } from '@udonarium/peer-cursor';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';
import { ReloadCheck } from '@udonarium/reload-check';
import { TableSelecter } from '@udonarium/table-selecter';
import { MarkDown } from '@udonarium/mark-down';

import { CutIn } from '@udonarium/cut-in';
import { CutInLauncher } from '@udonarium/cut-in-launcher';
import { Vote, VoteContext } from '@udonarium/vote';
import { Alarm, AlarmContext } from '@udonarium/alarm';

import { ChatWindowComponent } from 'component/chat-window/chat-window.component';
import { ContextMenuComponent } from 'component/context-menu/context-menu.component';
import { FileStorageComponent } from 'component/file-storage/file-storage.component';
import { GameCharacterGeneratorComponent } from 'component/game-character-generator/game-character-generator.component';
import { GameCharacterSheetComponent } from 'component/game-character-sheet/game-character-sheet.component';
import { GameObjectInventoryComponent } from 'component/game-object-inventory/game-object-inventory.component';
import { GameTableSettingComponent } from 'component/game-table-setting/game-table-setting.component';
import { JukeboxComponent } from 'component/jukebox/jukebox.component';
import { ModalComponent } from 'component/modal/modal.component';
import { PeerMenuComponent } from 'component/peer-menu/peer-menu.component';
import { TextViewComponent } from 'component/text-view/text-view.component';
import { UIPanelComponent } from 'component/ui-panel/ui-panel.component';
import { AppConfig, AppConfigService } from 'service/app-config.service';
import { ChatMessageService } from 'service/chat-message.service';
import { ContextMenuService } from 'service/context-menu.service';
import { ModalService } from 'service/modal.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';
import { SaveDataService } from 'service/save-data.service';

import { CutInWindowComponent } from 'component/cut-in-window/cut-in-window.component';
import { DiceTableSettingComponent } from 'component/dice-table-setting/dice-table-setting.component';
import { VoteWindowComponent } from 'component/vote-window/vote-window.component';
import { AlarmWindowComponent } from 'component/alarm-window/alarm-window.component';
import { ChatMessageFixComponent } from 'component/chat-message-fix/chat-message-fix.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnDestroy {

  @ViewChild('modalLayer', { read: ViewContainerRef, static: true }) modalLayerViewContainerRef: ViewContainerRef;

  get reloadCheck(): ReloadCheck { return ObjectStore.instance.get<ReloadCheck>('ReloadCheck'); }
  networkService = Network;

  private immediateUpdateTimer: NodeJS.Timer = null;
  private lazyUpdateTimer: NodeJS.Timer = null;
  private openPanelCount = 0;
  isSaveing = false;
  progresPercent = 0;
  dispcounter = 10 ; // 表示更新用ダミーカットインを閉じるときに無理やり更新させている。


  constructor(
    private modalService: ModalService,
    private panelService: PanelService,
    private pointerDeviceService: PointerDeviceService,
    private chatMessageService: ChatMessageService,
    private appConfigService: AppConfigService,
    private saveDataService: SaveDataService,
    private ngSelectConfig: NgSelectConfig,
    private ngZone: NgZone
  ) {

    this.ngZone.runOutsideAngular(() => {
      EventSystem;
      Network;
      FileArchiver.instance.initialize();
      ImageSharingSystem.instance.initialize();
      ImageStorage.instance;
      AudioSharingSystem.instance.initialize();
      AudioStorage.instance;
      ObjectFactory.instance;
      ObjectSerializer.instance;
      ObjectStore.instance;
      ObjectSynchronizer.instance.initialize();
    });
    this.appConfigService.initialize();
    this.pointerDeviceService.initialize();
    this.ngSelectConfig.appendTo = 'body';

    TableSelecter.instance.initialize();
    ChatTabList.instance.initialize();

    Config.instance.initialize();

    DataSummarySetting.instance.initialize();

    let diceBot: DiceBot = new DiceBot('DiceBot');
    diceBot.initialize();
    DiceBot.getHelpMessage('').then(() => this.lazyNgZoneUpdate(true));

    let jukebox: Jukebox = new Jukebox('Jukebox');
    jukebox.initialize();

    let markdown: MarkDown = new MarkDown('markdwon');
    markdown.initialize();

    let cutInLauncher = new CutInLauncher('CutInLauncher');
    cutInLauncher.initialize();

    let vote = new Vote('Vote');
    vote.initialize();

    let alarm = new Alarm('Alarm');
    alarm.initialize();

    let reloadCheck = new ReloadCheck('ReloadCheck');
    reloadCheck.initialize();

    let soundEffect: SoundEffect = new SoundEffect('SoundEffect');
    soundEffect.initialize();

    ChatTabList.instance.addChatTab('メインタブ', 'MainTab');
    ChatTabList.instance.addChatTab('サブタブ', 'SubTab');

    let fileContext = ImageFile.createEmpty('none_icon').toContext();
    fileContext.url = './assets/images/ic_account_circle_black_24dp_2x.png';
    let noneIconImage = ImageStorage.instance.add(fileContext);

    AudioPlayer.resumeAudioContext();
    PresetSound.dicePick = AudioStorage.instance.add('./assets/sounds/soundeffect-lab/shoulder-touch1.mp3').identifier;
    PresetSound.dicePut = AudioStorage.instance.add('./assets/sounds/soundeffect-lab/book-stack1.mp3').identifier;
    PresetSound.diceRoll1 = AudioStorage.instance.add('./assets/sounds/on-jin/spo_ge_saikoro_teburu01.mp3').identifier;
    PresetSound.diceRoll2 = AudioStorage.instance.add('./assets/sounds/on-jin/spo_ge_saikoro_teburu02.mp3').identifier;
    PresetSound.cardDraw = AudioStorage.instance.add('./assets/sounds/soundeffect-lab/card-turn-over1.mp3').identifier;
    PresetSound.cardPick = AudioStorage.instance.add('./assets/sounds/soundeffect-lab/shoulder-touch1.mp3').identifier;
    PresetSound.cardPut = AudioStorage.instance.add('./assets/sounds/soundeffect-lab/book-stack1.mp3').identifier;
    PresetSound.cardShuffle = AudioStorage.instance.add('./assets/sounds/soundeffect-lab/card-open1.mp3').identifier;
    PresetSound.piecePick = AudioStorage.instance.add('./assets/sounds/soundeffect-lab/shoulder-touch1.mp3').identifier;
    PresetSound.piecePut = AudioStorage.instance.add('./assets/sounds/soundeffect-lab/book-stack1.mp3').identifier;
    PresetSound.blockPick = AudioStorage.instance.add('./assets/sounds/tm2/tm2_pon002.wav').identifier;
    PresetSound.blockPut = AudioStorage.instance.add('./assets/sounds/tm2/tm2_pon002.wav').identifier;
    PresetSound.lock = AudioStorage.instance.add('./assets/sounds/tm2/tm2_switch001.wav').identifier;
    PresetSound.unlock = AudioStorage.instance.add('./assets/sounds/tm2/tm2_switch001.wav').identifier;
    PresetSound.sweep = AudioStorage.instance.add('./assets/sounds/tm2/tm2_swing003.wav').identifier;
    PresetSound.alarm = AudioStorage.instance.add('./assets/sounds/alarm/alarm.mp3').identifier;

    AudioStorage.instance.get(PresetSound.dicePick).isHidden = true;
    AudioStorage.instance.get(PresetSound.dicePut).isHidden = true;
    AudioStorage.instance.get(PresetSound.diceRoll1).isHidden = true;
    AudioStorage.instance.get(PresetSound.diceRoll2).isHidden = true;
    AudioStorage.instance.get(PresetSound.cardDraw).isHidden = true;
    AudioStorage.instance.get(PresetSound.cardPick).isHidden = true;
    AudioStorage.instance.get(PresetSound.cardPut).isHidden = true;
    AudioStorage.instance.get(PresetSound.cardShuffle).isHidden = true;
    AudioStorage.instance.get(PresetSound.piecePick).isHidden = true;
    AudioStorage.instance.get(PresetSound.piecePut).isHidden = true;
    AudioStorage.instance.get(PresetSound.blockPick).isHidden = true;
    AudioStorage.instance.get(PresetSound.blockPut).isHidden = true;
    AudioStorage.instance.get(PresetSound.lock).isHidden = true;
    AudioStorage.instance.get(PresetSound.unlock).isHidden = true;
    AudioStorage.instance.get(PresetSound.sweep).isHidden = true;
    AudioStorage.instance.get(PresetSound.alarm).isHidden = true;

    PeerCursor.createMyCursor();
    PeerCursor.myCursor.name = 'プレイヤー';
    PeerCursor.myCursor.imageIdentifier = noneIconImage.identifier;

    EventSystem.register(this)
      .on('ALARM_TIMEUP_ORIGIN', event => {
        this.alarmTimeUpOrigin( event.data.text );
      })
      .on('ALARM_POP', event => {
        this.alarmPop( event.data.title , event.data.time );
      })
      .on('START_VOTE', event => {
        this.startVote();
      })
      .on('FINISH_VOTE', event => {
        this.finishVote( event.data.text );
      })
      .on('START_CUT_IN', event => {
        this.startCutIn( event.data.cutIn );
      })
      .on('STOP_CUT_IN', event => {
        if ( ! event.data.cutIn ) return;
        console.log('カットインイベント_ストップ'  + event.data.cutIn.name );

      })
      .on('UPDATE_GAME_OBJECT', event => { this.lazyNgZoneUpdate(event.isSendFromSelf); })
      .on('DELETE_GAME_OBJECT', event => { this.lazyNgZoneUpdate(event.isSendFromSelf); })
      .on('SYNCHRONIZE_AUDIO_LIST', event => { if (event.isSendFromSelf) this.lazyNgZoneUpdate(false); })
      .on('SYNCHRONIZE_FILE_LIST', event => { if (event.isSendFromSelf) this.lazyNgZoneUpdate(false); })
      .on<AppConfig>('LOAD_CONFIG', event => {
        console.log('LOAD_CONFIG !!!');
        Network.setApiKey(event.data.webrtc.key);
        Network.open();
      })
      .on<File>('FILE_LOADED', event => {
        this.lazyNgZoneUpdate(false);
      })
      .on('OPEN_NETWORK', event => {
        console.log('OPEN_NETWORK', event.data.peerId);
        PeerCursor.myCursor.peerId = Network.peerContext.peerId;
        PeerCursor.myCursor.userId = Network.peerContext.userId;
      })
      .on('NETWORK_ERROR', event => {
        console.log('NETWORK_ERROR', event.data.peerId);
        let errorType: string = event.data.errorType;
        let errorMessage: string = event.data.errorMessage;

        this.ngZone.run(async () => {
          //SKyWayエラーハンドリング
          let quietErrorTypes = ['peer-unavailable'];
          let reconnectErrorTypes = ['disconnected', 'socket-error', 'unavailable-id', 'authentication', 'server-error'];

          if (quietErrorTypes.includes(errorType)) return;
          await this.modalService.open(TextViewComponent, { title: 'ネットワークエラー', text: errorMessage });

          if (!reconnectErrorTypes.includes(errorType)) return;
          await this.modalService.open(TextViewComponent, { title: 'ネットワークエラー', text: 'このウィンドウを閉じると再接続を試みます。' });
          Network.open();
        });
      })
      .on('CONNECT_PEER', event => {
        if (event.isSendFromSelf) this.chatMessageService.calibrateTimeOffset();
        this.lazyNgZoneUpdate(event.isSendFromSelf);
      })
      .on('DISCONNECT_PEER', event => {
        this.lazyNgZoneUpdate(event.isSendFromSelf);
      });
  }

  ngAfterViewInit() {
    PanelService.defaultParentViewContainerRef = ModalService.defaultParentViewContainerRef = ContextMenuService.defaultParentViewContainerRef = this.modalLayerViewContainerRef;
    setTimeout(() => {
      this.panelService.open(PeerMenuComponent, { width: 500, height: 450, left: 100 });
      this.panelService.open(ChatWindowComponent, { width: 700, height: 400, left: 100, top: 450 });
    }, 0);
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  alarmTimeUpOrigin(text: string){
    let alarm = ObjectStore.instance.get<Alarm>('Alarm');
    this.chatMessageService.sendSystemMessageLastSendCharactor(text);
  }

  alarmTimeUpTarget(text: string){
    let alarm = ObjectStore.instance.get<Alarm>('Alarm');
    this.chatMessageService.sendSystemMessageLastSendCharactor(text);
  }

  startVote(){
    console.log( '点呼/投票イベント_スタート' );
    let vote = ObjectStore.instance.get<Vote>('Vote');
    if (!vote.chkToMe() )return;

    let option: PanelOption = { left: 0, top: 0, width: 450, height: 400 };
    option.title = '点呼/投票';

    let margin_w = (window.innerWidth - option.width) / 2;
    let margin_h = (window.innerHeight - option.height) / 2 ;
    if ( margin_w < 0 )margin_w = 0 ;
    if ( margin_h < 0 )margin_h = 0 ;
    option.left = margin_w ;
    option.top = margin_h;
    let component = this.panelService.open(VoteWindowComponent, option);
  }

  finishVote(text: string){
    console.log( '投票集計完了' );
    this.chatMessageService.sendSystemMessageLastSendCharactor(text);
  }

  alarmPop(title: string, time: string){
    console.log( 'ポップアップ_スタート' + title );
    let winH = 100;
    let winW = 200;
    let option: PanelOption = { width: winW, height: winH, left: 300 , top: 100};
    option.title = 'アラーム ' + title;

    console.log( 'POP画面領域 w:' + window.innerWidth + ' h:' + window.innerHeight );
    console.log( 'POPサイズ w:' + winW + ' h:' + winH );

    let margin_w = window.innerWidth - winW ;
    let margin_h = window.innerHeight - winH - 25 ;

    if ( margin_w < 0 )margin_w = 0 ;
    if ( margin_h < 0 )margin_h = 0 ;

    let margin_x = margin_w * 0.5;
    let margin_y = margin_h * 0.5;

    option.width = winW ;
    option.height = winH + 25 ;
    option.left = margin_x ;
    option.top = margin_y;

    let component = this.panelService.open(AlarmWindowComponent, option);
    component.title = title;
    component.time = time;

  }

  startCutIn( cutIn: CutIn ){
    if ( ! cutIn ) return;
    console.log( 'カットインイベント_スタート' + cutIn.name );
    let option: PanelOption = { width: 200, height: 100, left: 300 , top: 100};
    option.title = 'カットイン : ' + cutIn.name ;

    console.log( '画面領域 w:' + window.innerWidth + ' h:' + window.innerHeight );

    let cutin_w = cutIn.width;
    let cutin_h = cutIn.height;

    console.log( '画像サイズ w:' + cutin_w + ' h:' + cutin_h );

    let margin_w = window.innerWidth - cutin_w ;
    let margin_h = window.innerHeight - cutin_h - 25 ;

    if ( margin_w < 0 )margin_w = 0 ;
    if ( margin_h < 0 )margin_h = 0 ;

    let margin_x = margin_w * cutIn.x_pos / 100;
    let margin_y = margin_h * cutIn.y_pos / 100;

    option.width = cutin_w ;
    option.height = cutin_h + 25 ;
    option.left = margin_x ;
    option.top = margin_y;
    option.isCutIn = true;
    option.cutInIdentifier = cutIn.identifier;


    let component = this.panelService.open(CutInWindowComponent, option);
    component.cutIn = cutIn;
    component.startCutIn();

  }

  open(componentName: string) {
    let component: { new(...args: any[]): any } = null;
    let option: PanelOption = { width: 450, height: 600, left: 100 }
    switch (componentName) {
      case 'PeerMenuComponent':
        component = PeerMenuComponent;
        break;
      case 'ChatWindowComponent':
        component = ChatWindowComponent;
        option.width = 700;
        break;
      case 'GameTableSettingComponent':
        component = GameTableSettingComponent;
        option = { width: 630, height: 500, left: 100 };
        break;
      case 'FileStorageComponent':
        component = FileStorageComponent;
        break;
      case 'GameCharacterSheetComponent':
        component = GameCharacterSheetComponent;
        break;
      case 'JukeboxComponent':
        component = JukeboxComponent;
        break;
      case 'GameCharacterGeneratorComponent':
        component = GameCharacterGeneratorComponent;
        option = { width: 500, height: 300, left: 100 };
        break;
      case 'GameObjectInventoryComponent':
        component = GameObjectInventoryComponent;
        break;
    }
    if (component) {
      option.top = (this.openPanelCount % 10 + 1) * 20;
      option.left = 100 + (this.openPanelCount % 20 + 1) * 5;
      this.openPanelCount = this.openPanelCount + 1;
      this.panelService.open(component, option);
    }
  }

  async save() {
    if (this.isSaveing) return;
    this.isSaveing = true;
    this.progresPercent = 0;

    let roomName = Network.peerContext && 0 < Network.peerContext.roomName.length
      ? Network.peerContext.roomName
      : 'ルームデータ';
    await this.saveDataService.saveRoomAsync(roomName, percent => {
      this.progresPercent = percent;
    });

    setTimeout(() => {
      this.isSaveing = false;
      this.progresPercent = 0;
    }, 500);
  }

  handleFileSelect(event: Event) {
    let input = <HTMLInputElement>event.target;
    let files = input.files;

    this.reloadCheck.reloadCheckStart(this.networkService.peerContext.roomName != '');

    if (files.length) FileArchiver.instance.load(files);
    input.value = '';
  }

  private lazyNgZoneUpdate(isImmediate: boolean) {
    if (isImmediate) {
      if (this.immediateUpdateTimer !== null) return;
      this.immediateUpdateTimer = setTimeout(() => {
        this.immediateUpdateTimer = null;
        if (this.lazyUpdateTimer != null) {
          clearTimeout(this.lazyUpdateTimer);
          this.lazyUpdateTimer = null;
        }
        this.ngZone.run(() => { });
      }, 0);
    } else {
      if (this.lazyUpdateTimer !== null) return;
      this.lazyUpdateTimer = setTimeout(() => {
        this.lazyUpdateTimer = null;
        if (this.immediateUpdateTimer != null) {
          clearTimeout(this.immediateUpdateTimer);
          this.immediateUpdateTimer = null;
        }
        this.ngZone.run(() => { });
      }, 100);
    }
  }
}

PanelService.UIPanelComponentClass = UIPanelComponent;
ContextMenuService.ContextMenuComponentClass = ContextMenuComponent;
ModalService.ModalComponentClass = ModalComponent;
