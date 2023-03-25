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
  ViewChild,
} from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ObjectNode } from '@udonarium/core/synchronize-object/object-node';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem, Network } from '@udonarium/core/system';
import { GameTableScratchMask } from '@udonarium/game-table-scratch-mask';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';
import { GameCharacterSheetComponent } from 'component/game-character-sheet/game-character-sheet.component';
import { InputHandler } from 'directive/input-handler';
import { MovableOption } from 'directive/movable.directive';
import { ContextMenuSeparator, ContextMenuService } from 'service/context-menu.service';
import { CoordinateService } from 'service/coordinate.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';
import { TabletopActionService } from 'service/tabletop-action.service';
import { ScratchRender, ScratchSetting} from './scratch-render';

@Component({
  selector: 'game-table-scratch-mask',
  templateUrl: './game-table-scratch-mask.component.html',
  styleUrls: ['./game-table-scratch-mask.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameTableScratchMaskComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() gameTableScratchMask: GameTableScratchMask = null;
  @Input() is3D: boolean = false;

  @ViewChild('gridCanvas', { static: true }) gridCanvas: ElementRef<HTMLCanvasElement>;

  get dispLockMark(): boolean { return this.gameTableScratchMask.dispLockMark; }
  set dispLockMark(disp: boolean) { this.gameTableScratchMask.dispLockMark = disp; }

  get name(): string { return this.gameTableScratchMask.name; }
  get width(): number { 
    let w = this.gameTableScratchMask.width <= this.gameTableScratchMask.getMaxSize() ? this.gameTableScratchMask.width : this.gameTableScratchMask.getMaxSize();
    return this.adjustMinBounds(w);
  }
  get height(): number { 
    let h = this.gameTableScratchMask.height <= this.gameTableScratchMask.getMaxSize() ? this.gameTableScratchMask.height : this.gameTableScratchMask.getMaxSize();
    return this.adjustMinBounds(h);
  }

  get opacity(): number { 
    return 100; 
  }

  get imageFile(): ImageFile { return this.gameTableScratchMask.imageFile; }
  get isLock(): boolean { return this.gameTableScratchMask.isLock; }
  set isLock(isLock: boolean) { this.gameTableScratchMask.isLock = isLock; }
  get isScratch(): boolean { return this.gameTableScratchMask.isScratch; }
  set isScratch(isScratch: boolean) { this.gameTableScratchMask.isScratch = isScratch; }

  get altitude(): number { return this.gameTableScratchMask.altitude; }
  set altitude(altitude: number) { this.gameTableScratchMask.altitude = altitude; }

  get isAltitudeIndicate(): boolean { return this.gameTableScratchMask.isAltitudeIndicate; }
  set isAltitudeIndicate(isAltitudeIndicate: boolean) { this.gameTableScratchMask.isAltitudeIndicate = isAltitudeIndicate; }

  get owner(): string { return this.gameTableScratchMask.owner; }
  set owner(owner: string) { this.gameTableScratchMask.owner = owner; }

  get isMine(): boolean { return this.gameTableScratchMask.isMine; }
  get hasOwner(): boolean { return this.gameTableScratchMask.hasOwner; }
  get ownerIsOnline(): boolean { return this.gameTableScratchMask.ownerIsOnline; }
  get ownerName(): string { return this.gameTableScratchMask.ownerName; }

  get gameTableMaskAltitude(): number {
    return +this.altitude.toFixed(1); 
  }

  gridSize: number = 50;
  math = Math;
  viewRotateZ = 10;

  movableOption: MovableOption = {};

  private input: InputHandler = null;

  constructor(
    private ngZone: NgZone,
    private tabletopActionService: TabletopActionService,
    private contextMenuService: ContextMenuService,
    private elementRef: ElementRef<HTMLElement>,
    private panelService: PanelService,
    private changeDetector: ChangeDetectorRef,
    private pointerDeviceService: PointerDeviceService,
    private coordinateService: CoordinateService,
  ) { }


  oldScratchX: number = -1;
  oldScratchY: number = -1;

  scratch( x, y, z, start){
    let gridSize = 50;
    let scratchX = Math.floor(x / gridSize);
    let scratchY = Math.floor(y / gridSize);

    if(start || scratchX != this.oldScratchX || scratchY != this.oldScratchY){
      this.oldScratchX = scratchX ;
      this.oldScratchY = scratchY ;
      this.gameTableScratchMask.reverseMapXY(scratchX, scratchY);
      this.drawScratch();
    }
  }


  ngOnInit() {
    EventSystem.register(this)
      .on('UPDATE_GAME_OBJECT', event => {
        let object = ObjectStore.instance.get(event.data.identifier);
        if (!this.gameTableScratchMask || !object) return;
        if (this.gameTableScratchMask === object || (object instanceof ObjectNode && this.gameTableScratchMask.contains(object))) {
          this.changeDetector.markForCheck();
        }
        this.drawScratch();
      })
      .on('SYNCHRONIZE_FILE_LIST', event => {
        this.changeDetector.markForCheck();
      })
      .on('UPDATE_FILE_RESOURE', event => {
        this.changeDetector.markForCheck();
      })
      .on('SCRATCH_POINTER_XYZ', event => {
        if(event.data.identifier != this.gameTableScratchMask.identifier) return;
        this.scratch( event.data.x , event.data.y , event.data.z , event.data.start);
      });
    this.movableOption = {
      tabletopObject: this.gameTableScratchMask,
      transformCssOffset: 'translateZ(0.15px)',
      colideLayers: ['terrain']
    };
    this.drawScratch();
  }

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => {
      this.input = new InputHandler(this.elementRef.nativeElement);
    });
    this.input.onStart = this.onInputStart.bind(this);
    this.drawScratch();
  }

  ngOnDestroy() {
    this.input.destroy();
    EventSystem.unregister(this);
  }

  @HostListener('dragstart', ['$event'])
  onDragstart(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  onInputStart(e: any) {
    this.input.cancel();

    // TODO:もっと良い方法考える
    if (this.isLock && !this.isScratch) {
      EventSystem.trigger('DRAG_LOCKED_OBJECT', {});
    }
  }

  contextmenuEvent(event) {
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
      if (this.isMine){
        this.scratchUpdate();
        event.stopPropagation();
        event.preventDefault();
        return;
      }
    }
    if (key_meta) console.log("metaキー");

    if (key_shift && key_alt) {
      console.log("shift+ALTキー");
    }
  }

  @HostListener('contextmenu', ['$event'])
  onContextMenu(e: Event) {

    e.stopPropagation();
    e.preventDefault();

    if (!this.pointerDeviceService.isAllowedToOpenContextMenu) return;
    let menuPosition = this.pointerDeviceService.pointers[0];
    let objectPosition = this.coordinateService.calcTabletopLocalCoordinate();
    let menuArray = [];
    menuArray.push(
      {
        name: '高度設定', action: null, subActions: [
          {
            name: '高度を0にする', action: () => {
              if (this.altitude != 0) {
                this.altitude = 0;
                SoundEffect.play(PresetSound.sweep);
              }
            },
            altitudeHande: this.gameTableScratchMask
          },
          (this.isAltitudeIndicate
            ? {
              name: '☑ 高度の表示', action: () => {
                this.isAltitudeIndicate = false;
                SoundEffect.play(PresetSound.sweep);
                EventSystem.trigger('UPDATE_INVENTORY', null);
              }
            } : {
              name: '☐ 高度の表示', action: () => {
                this.isAltitudeIndicate = true;
                SoundEffect.play(PresetSound.sweep);
                EventSystem.trigger('UPDATE_INVENTORY', null);
              }
            })
        ]
      },
      ContextMenuSeparator,
      this.isLock
        ? {
          name: '固定解除', action: () => {
            this.isLock = false;
            this.dispLockMark = true;
            SoundEffect.play(PresetSound.unlock);
          }
        }
        : {
          name: '固定する', action: () => {
            this.isLock = true;
            SoundEffect.play(PresetSound.lock);
          }
        }
      )
      if (this.isLock){
        menuArray.push(
        this.dispLockMark
          ? {
            name: '固定マーク消去', action: () => {
              this.dispLockMark = false;
              SoundEffect.play(PresetSound.lock);
            }
          }
          : {
            name: '固定マーク表示', action: () => {
              this.dispLockMark = true;
              SoundEffect.play(PresetSound.lock);
            }
          }
        );
      }
      if (!this.isMine) {
        menuArray.push({
          name: 'スクラッチ開始', action: () => {
            this.isScratch = true;
            this.gameTableScratchMask.copyMain2BackMap();
            SoundEffect.play(PresetSound.cardDraw);
            this.owner = Network.peerContext.userId;
          }
        });
      }else{
        menuArray.push({
          name: 'スクラッチ確定', action: () => {
            this.scratchUpdate();
            this.isScratch = false;
            this.owner = '';
          }
        });
      }
      if (this.isMine){
        menuArray.push(
            {
            name: 'スクラッチキャンセル', action: () => {
              this.isScratch = false;
              SoundEffect.play(PresetSound.cardDraw);
              this.owner = '';
            }
          }
        );
      }
      
      menuArray.push( ContextMenuSeparator);
      menuArray.push( 
        { name: 'スクラッチマスクを編集', action: () => { this.showDetail(this.gameTableScratchMask); } }
      );
      menuArray.push( 
        {name: 'コピーを作る', action: () => {
          let cloneObject = this.gameTableScratchMask.clone();
          console.log('コピー', cloneObject);
          cloneObject.location.x += this.gridSize;
          cloneObject.location.y += this.gridSize;
          cloneObject.isLock = false;
          if (this.gameTableScratchMask.parent) this.gameTableScratchMask.parent.appendChild(cloneObject);
          SoundEffect.play(PresetSound.cardPut);
        }
      }
      );
      menuArray.push( 
      {
        name: '削除する', action: () => {
          this.gameTableScratchMask.destroy();
          SoundEffect.play(PresetSound.sweep);
        }
      }
      );
      menuArray.push( ContextMenuSeparator);
      menuArray.push( 
        { name: 'オブジェクト作成', action: null, subActions: this.tabletopActionService.makeDefaultContextMenuActions(objectPosition) }
      );
    this.contextMenuService.open(menuPosition, menuArray, this.name);
  }

  scratchUpdate(){
    this.gameTableScratchMask.copyBack2MainMap();
    SoundEffect.play(PresetSound.cardDraw);
    
  }

  onMove() {
    SoundEffect.play(PresetSound.cardPick);
  }

  onMoved() {
    SoundEffect.play(PresetSound.cardPut);
  }

  private adjustMinBounds(value: number, min: number = 0): number {
    return value < min ? min : value;
  }

  private showDetail(gameObject: GameTableScratchMask) {
    let coordinate = this.pointerDeviceService.pointers[0];
    let title = 'スクラッチマスク設定';
    if (gameObject.name.length) title += ' - ' + gameObject.name;
    let option: PanelOption = { title: title, left: coordinate.x - 200, top: coordinate.y - 150, width: 400, height: 300 };
    let component = this.panelService.open<GameCharacterSheetComponent>(GameCharacterSheetComponent, option);
    component.tabletopObject = gameObject;
  }

  private drawScratch(){
    let render = new ScratchRender(this.gridCanvas.nativeElement);

    let setting: ScratchSetting = {
      mask: this.gameTableScratchMask,
      areaWidth: this.gameTableScratchMask.width <= this.gameTableScratchMask.getMaxSize() ? this.gameTableScratchMask.width : this.gameTableScratchMask.getMaxSize(),
      areaHeight: this.gameTableScratchMask.height <= this.gameTableScratchMask.getMaxSize() ? this.gameTableScratchMask.height : this.gameTableScratchMask.getMaxSize(),
      centerX: this.gameTableScratchMask.location.x,
      centerY: this.gameTableScratchMask.location.y,
      gridSize: this.gridSize,
      gridColor: this.isMine ? this.gameTableScratchMask.color + 'DD' : this.gameTableScratchMask.color,
      changeColor: this.gameTableScratchMask.changeColor,
      fanDegree: 0.0,
    };

    let myScratch = this.owner == Network.peerContext.userId ? true : false;

    render.renderScratch(setting, myScratch);
  }


  private makeBrush(context: CanvasRenderingContext2D, gridSize: number, gridColor: string): CanvasRenderingContext2D {
    // 座標描画用brush設定
    context.strokeStyle = gridColor;
    context.fillStyle = context.strokeStyle;
    context.lineWidth = 1;

    let fontSize: number = Math.floor(gridSize / 5);
    context.font = `bold ${fontSize}px sans-serif`;
    context.textBaseline = 'top';
    context.textAlign = 'center';
    return context
  }


}
