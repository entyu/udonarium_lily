import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewChild, ElementRef
} from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ObjectNode } from '@udonarium/core/synchronize-object/object-node';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem, Network } from '@udonarium/core/system';
import { GameCharacter } from '@udonarium/game-character';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';
import { ChatPaletteComponent } from 'component/chat-palette/chat-palette.component';
import { GameCharacterSheetComponent } from 'component/game-character-sheet/game-character-sheet.component';
import { MovableOption } from 'directive/movable.directive';
import { RotableOption } from 'directive/rotable.directive';
import { ContextMenuSeparator, ContextMenuService } from 'service/context-menu.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';
import { PeerCursor } from '@udonarium/peer-cursor';

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

  get name(): string { return this.gameCharacter.name; }
  get size(): number { return this.adjustMinBounds(this.gameCharacter.size); }
  get altitude(): number { return this.gameCharacter.altitude; }
  set altitude(altitude: number) { this.gameCharacter.altitude = altitude; }
  get imageFile(): ImageFile { return this.gameCharacter.imageFile; }
  get rotate(): number { return this.gameCharacter.rotate; }
  set rotate(rotate: number) { this.gameCharacter.rotate = rotate; }
  get roll(): number { return this.gameCharacter.roll; }
  set roll(roll: number) { this.gameCharacter.roll = roll; }
  get isDropShadow(): boolean { return this.gameCharacter.isDropShadow; }
  set isDropShadow(isDropShadow: boolean) { this.gameCharacter.isDropShadow = isDropShadow; }
  get isAltitudeIndicate(): boolean { return this.gameCharacter.isAltitudeIndicate; }
  set isAltitudeIndicate(isAltitudeIndicate: boolean) { this.gameCharacter.isAltitudeIndicate = isAltitudeIndicate; }

  get elevation(): number {
    return +((this.gameCharacter.posZ + (this.altitude * this.gridSize)) / this.gridSize).toFixed(1);
  }

  gridSize: number = 50;

  @ViewChild('characterImage', { static: false }) characterImage: ElementRef;
  @ViewChild('chatBubble', { static: false }) chatBubble: ElementRef;
  
  balloonInterval = null;
  math = Math;

  get characterImageHeight(): number {
    if (!this.characterImage) return 0;
    const height = this.chatBubble.nativeElement.offsetHeight + (this.characterImage.nativeElement.offsetHeight + (this.name ? this.gridSize / 2 : 0)) * Math.cos(this.roll * Math.PI / 180) - this.gridSize * this.size;
    return this.chatBubble.nativeElement.offsetHeight > height ? this.chatBubble.nativeElement.offsetHeight : height;
  }

  get isListen(): boolean {
    if (this.gameCharacter && this.gameCharacter.dialog) {
      if (!this.gameCharacter.dialog.to) return true;
      return PeerCursor.myCursor && (PeerCursor.myCursor.peerId == this.gameCharacter.dialog.from || PeerCursor.myCursor.peerId == this.gameCharacter.dialog.to);
    } 
    return false;
  }

  get isWhisper(): boolean {
    return (this.gameCharacter && this.gameCharacter.dialog && this.gameCharacter.dialog.to && this.gameCharacter.dialog.to.length > 0);
  }

  movableOption: MovableOption = {};
  rotableOption: RotableOption = {};

  constructor(
    private contextMenuService: ContextMenuService,
    private panelService: PanelService,
    private changeDetector: ChangeDetectorRef,
    private pointerDeviceService: PointerDeviceService,

  ) { }

  viewRotateZ = 0;
  
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
      .on<number>('TABLE_VIEW_ROTATE_Z', -1000, event => {
        this.viewRotateZ = event.data;
        this.changeDetector.markForCheck();
      })
      .on<GameCharacter>('CHAT_BUBBLE', event => {
        if (this.chatBubble && this.gameCharacter && this.gameCharacter === event.data && event.data.dialog) {
          this.changeDetector.markForCheck();
        }
      });
    this.movableOption = {
      tabletopObject: this.gameCharacter,
      transformCssOffset: 'translateZ(1.0px)',
      colideLayers: ['terrain', 'text-note', 'character']
    };
    this.rotableOption = {
      tabletopObject: this.gameCharacter
    };

    if (this.gameCharacter) this.gameCharacter.dialogData = null;

    // もっといい方法ないか    
    this.balloonInterval = setInterval(() => {
      if (this.chatBubble && this.gameCharacter && this.gameCharacter.dialog) {
        this.changeDetector.markForCheck();
      }
    }, 150);
    
  }

  ngAfterViewInit() { }

  ngOnDestroy() {
    if (this.balloonInterval) clearInterval(this.balloonInterval);
    EventSystem.unregister(this);
  }

  @HostListener('dragstart', ['$event'])
  onDragstart(e: any) {
    console.log('Dragstart Cancel !!!!');
    e.stopPropagation();
    e.preventDefault();
  }

  @HostListener('contextmenu', ['$event'])
  onContextMenu(e: Event) {
    e.stopPropagation();
    e.preventDefault();

    if (!this.pointerDeviceService.isAllowedToOpenContextMenu) return;

    let position = this.pointerDeviceService.pointers[0];
    this.contextMenuService.open(position, [
      (this.isDropShadow
        ? {
          name: '影を落とさない', action: () => {
            this.isDropShadow = false;
          }
        } : {
          name: '影を落とす', action: () => {
            this.isDropShadow = true;
          }
        }),
      ContextMenuSeparator,
      (this.isAltitudeIndicate
        ? {
          name: '高度を表示しない', action: () => {
            this.isAltitudeIndicate = false;
          }
        } : {
          name: '高度を表示する', action: () => {
            this.isAltitudeIndicate = true;
          }
        }),
      {
        name: '高度を0にする', action: () => {
          if (this.altitude != 0) {
            this.altitude = 0;
            SoundEffect.play(PresetSound.sweep);
          }
        },
        altitudeHande: this.gameCharacter
      },
      ContextMenuSeparator,
      { name: '詳細を表示', action: () => { this.showDetail(this.gameCharacter); } },
      { name: 'チャットパレットを表示', action: () => { this.showChatPalette(this.gameCharacter) } },
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
    if (this.gameCharacter && this.gameCharacter.dialog) {
      this.gameCharacter.dialog = null;
    }
    SoundEffect.play(PresetSound.piecePut);
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
}
