import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ObjectNode } from '@udonarium/core/synchronize-object/object-node';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem, Network } from '@udonarium/core/system';
import { GameCharacter } from '@udonarium/game-character';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';
import { ChatPaletteComponent } from 'component/chat-palette/chat-palette.component';
import { GameCharacterSheetComponent } from 'component/game-character-sheet/game-character-sheet.component';
import { InputHandler } from 'directive/input-handler';
import { MovableOption } from 'directive/movable.directive';
import { RotableOption } from 'directive/rotable.directive';
import { ContextMenuSeparator, ContextMenuService } from 'service/context-menu.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';
import { RemoteControllerComponent } from 'component/remote-controller/remote-controller.component';
import { GameCharacterBuffViewComponent } from 'component/game-character-buff-view/game-character-buff-view.component';

@Component({
  selector: 'game-character',
  templateUrl: './game-character.component.html',
  styleUrls: ['./game-character.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('bounceInOut', [
      transition('void => *', [
        animate('600ms ease', keyframes([
          style({ transform: 'scale3d(0, 0, 0)', offset: 0 }),
          style({ transform: 'scale3d(1.5, 1.5, 1.5)', offset: 0.5 }),
          style({ transform: 'scale3d(0.75, 0.75, 0.75)', offset: 0.75 }),
          style({ transform: 'scale3d(1.125, 1.125, 1.125)', offset: 0.875 }),
          style({ transform: 'scale3d(1.0, 1.0, 1.0)', offset: 1.0 })
        ]))
      ]),
      transition('* => void', [
        animate(100, style({ transform: 'scale3d(0, 0, 0)' }))
      ])
    ])
  ]
})
export class GameCharacterComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() gameCharacter: GameCharacter = null;
  @Input() is3D: boolean = false;
  @ViewChild('root') rootElementRef: ElementRef<HTMLElement>;

  get isLock(): boolean { return this.gameCharacter.isLock; }
  set isLock(isLock: boolean) { this.gameCharacter.isLock = isLock; }

  get name(): string { return this.gameCharacter.name; }
  get size(): number { return this.adjustMinBounds(this.gameCharacter.size); }
  get imageFile(): ImageFile { return this.gameCharacter.imageFile; }
  get rotate(): number { return this.gameCharacter.rotate; }
  set rotate(rotate: number) { this.gameCharacter.rotate = rotate; }
  get roll(): number { return this.gameCharacter.roll; }
  set roll(roll: number) { this.gameCharacter.roll = roll; }

  private foldingBuff: boolean = false;
  gridSize: number = 50;

  movableOption: MovableOption = {};
  private input: InputHandler = null;

  rotableOption: RotableOption = {};

  private highlightTimer: NodeJS.Timer;
  private unhighlightTimer: NodeJS.Timer;

  constructor(
    private ngZone: NgZone,
    private contextMenuService: ContextMenuService,
    private elementRef: ElementRef<HTMLElement>,
    private panelService: PanelService,
    private changeDetector: ChangeDetectorRef,
    private pointerDeviceService: PointerDeviceService,
  ) { }

  ngOnInit() {
    EventSystem.register(this)
      .on('UPDATE_GAME_OBJECT', -1000, event => {
        let object = ObjectStore.instance.get(event.data.identifier);
        if (!this.gameCharacter || !object) return;
        if (this.gameCharacter === object || (object instanceof ObjectNode && this.gameCharacter.contains(object))) {
          this.changeDetector.markForCheck();
        }
      })
      .on('SYNCHRONIZE_FILE_LIST', event => {
        this.changeDetector.markForCheck();
      })
      .on('UPDATE_FILE_RESOURE', -1000, event => {
        this.changeDetector.markForCheck();
      })
      .on('CHK_TARGET_CHANGE', -1000, event => {
        let objct = ObjectStore.instance.get(event.data.identifier);
        if (objct == this.gameCharacter) {
          this.changeDetector.detectChanges();
        }
      })

      .on('HIGHTLIGHT_TABLETOP_OBJECT', event => {
        if (this.gameCharacter.identifier !== event.data.identifier) { return; }
        if (this.gameCharacter.location.name != "table") { return; }

        console.log(`recv focus event to ${this.gameCharacter.name}`);
        // アニメーション開始のタイマーが既にあってアニメーション開始前（ごくわずかな間）ならば何もしない
        if (this.highlightTimer != null) { return; }

        // アニメーション中であればアニメーションを初期化
        if (this.rootElementRef.nativeElement.classList.contains('focused')) {
          clearTimeout(this.unhighlightTimer);
          this.rootElementRef.nativeElement.classList.remove('focused');
        }

        // アニメーション開始処理タイマー
        this.highlightTimer = setTimeout(() => {
          this.highlightTimer = null;
          this.rootElementRef.nativeElement.classList.add('focused');
        }, 0);

        // アニメーション終了処理タイマー
        this.unhighlightTimer = setTimeout(() => {
          this.unhighlightTimer = null;
          this.rootElementRef.nativeElement.classList.remove('focused');
        }, 1010);
      });
    this.movableOption = {
      tabletopObject: this.gameCharacter,
      transformCssOffset: 'translateZ(1.0px)',
      colideLayers: ['terrain']
    };
    this.rotableOption = {
      tabletopObject: this.gameCharacter
    };
  }

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => {
      this.input = new InputHandler(this.elementRef.nativeElement);
    });
    this.input.onStart = this.onInputStart.bind(this);
  }

  ngOnDestroy() {
    this.input.destroy();
    EventSystem.unregister(this);
  }

  @HostListener('dragstart', ['$event'])
  onDragstart(e: any) {
    console.log('Dragstart Cancel !!!!');
    e.stopPropagation();
    e.preventDefault();
  }


  onInputStart(e: any) {
    this.input.cancel();

    // TODO:もっと良い方法考える
    if (this.isLock) {
      EventSystem.trigger('DRAG_LOCKED_OBJECT', {});
    }
  }


  @HostListener('contextmenu', ['$event'])
  onContextMenu(e: Event) {
    e.stopPropagation();
    e.preventDefault();

    if (!this.pointerDeviceService.isAllowedToOpenContextMenu) return;

    let position = this.pointerDeviceService.pointers[0];
    this.contextMenuService.open(position, [
      { name: '詳細を表示', action: () => { this.showDetail(this.gameCharacter); } },
      { name: 'チャットパレットを表示', action: () => { this.showChatPalette(this.gameCharacter) } },
      { name: 'リモコンを表示', action: () => { this.showRemoteController(this.gameCharacter) } },
      { name: 'バフ編集', action: () => { this.showBuffEdit(this.gameCharacter) } },
      ContextMenuSeparator,
      {
        name: '共有イベントリに移動', action: () => {
          this.gameCharacter.setLocation('common');
          SoundEffect.play(PresetSound.piecePut);
        }
      },
      {
        name: '個人イベントリに移動', action: () => {
          this.gameCharacter.setLocation(Network.peerId);
          SoundEffect.play(PresetSound.piecePut);
        }
      },
      {
        name: '墓場に移動', action: () => {
          this.gameCharacter.setLocation('graveyard');
          SoundEffect.play(PresetSound.sweep);
        }
      },
      ContextMenuSeparator,
      (this.isLock
        ? {
          name: '固定解除', action: () => {
            this.isLock = false;
            SoundEffect.play(PresetSound.unlock);
          }
        } : {
          name: '固定する', action: () => {
            this.isLock = true;
            SoundEffect.play(PresetSound.lock);
          }
        }),
      ContextMenuSeparator,
      {
        name: 'コピーを作る', action: () => {
          let cloneObject = this.gameCharacter.clone();
          cloneObject.location.x += this.gridSize;
          cloneObject.location.y += this.gridSize;
          cloneObject.update();
          SoundEffect.play(PresetSound.piecePut);
        }
      },
    ], this.name);
  }

  onMove() {
    SoundEffect.play(PresetSound.piecePick);
  }

  onMoved() {
    SoundEffect.play(PresetSound.piecePut);
  }

  checkKey(event) {
    //イベント処理
    let key_event = event || window.event;
    let key_shift = (key_event.shiftKey);
    let key_ctrl = (key_event.ctrlKey);
    let key_alt = (key_event.altKey);
    let key_meta = (key_event.metaKey);
    //キーに対応した処理
    
    if (key_shift) console.log("shiftキー");
    if (key_ctrl) console.log("ctrlキー");
    if (key_alt) {
      console.log("altキー");
      this.gameCharacter.targeted = this.gameCharacter.targeted ? false : true;
    }
    if (key_meta) console.log("metaキー");
    //出力
  }

  private adjustMinBounds(value: number, min: number = 0): number {
    return value < min ? min : value;
  }

  private showDetail(gameObject: GameCharacter) {
    let coordinate = this.pointerDeviceService.pointers[0];
    let title = 'キャラクターシート';
    if (gameObject.name.length) title += ' - ' + gameObject.name;
    let option: PanelOption = { title: title, left: coordinate.x - 400, top: coordinate.y - 300, width: 800, height: 600 };
    let component = this.panelService.open<GameCharacterSheetComponent>(GameCharacterSheetComponent, option);
    component.tabletopObject = gameObject;
  }

  private showChatPalette(gameObject: GameCharacter) {
    let coordinate = this.pointerDeviceService.pointers[0];
    let option: PanelOption = { left: coordinate.x - 250, top: coordinate.y - 175, width: 615, height: 350 };
    let component = this.panelService.open<ChatPaletteComponent>(ChatPaletteComponent, option);
    component.character = gameObject;
  }

  private showRemoteController(gameObject: GameCharacter) {
    let coordinate = this.pointerDeviceService.pointers[0];
    let option: PanelOption = { left: coordinate.x - 250, top: coordinate.y - 175, width: 700, height: 600 };
    let component = this.panelService.open<RemoteControllerComponent>(RemoteControllerComponent, option);
    component.character = gameObject;
  }

  private showBuffEdit(gameObject: GameCharacter) {
    let coordinate = this.pointerDeviceService.pointers[0];
    let option: PanelOption = { left: coordinate.x, top: coordinate.y, width: 420, height: 300 };
    option.title = gameObject.name + 'のバフ編集';
    let component = this.panelService.open<GameCharacterBuffViewComponent>(GameCharacterBuffViewComponent, option);
    component.character = gameObject;
  }

  private foldingBuffFlag(flag: boolean){
    console.log('private foldingBuffFlag');
    this.foldingBuff = flag;
  }

  get buffNum(): number{
    if ( this.gameCharacter.buffDataElement.children.length == 0){
      return 0;
    }
    return this.gameCharacter.buffDataElement.children[0].children.length;
  }
}
