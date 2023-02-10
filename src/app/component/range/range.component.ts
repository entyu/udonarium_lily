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
import { EventSystem } from '@udonarium/core/system';
import { RangeArea } from '@udonarium/range';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';
import { GameCharacterSheetComponent } from 'component/game-character-sheet/game-character-sheet.component';
import { RangeDockingCharacterComponent } from 'component/range-docking-character/range-docking-character.component';

import { InputHandler } from 'directive/input-handler';
import { MovableOption } from 'directive/movable.directive';
import { RotableOption } from 'directive/rotable.directive';
import { ContextMenuSeparator, ContextMenuService } from 'service/context-menu.service';
import { CoordinateService } from 'service/coordinate.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';
import { TabletopActionService } from 'service/tabletop-action.service';

import { TabletopService } from 'service/tabletop.service';
import { RangeRender, RangeRenderSetting, ClipAreaCorn, ClipAreaLine, ClipAreaSquare, ClipAreaDiamond} from './range-render'; // 注意別のコンポーネントフォルダにアクセスしてグリッドの描画を行っている
import { TableSelecter } from '@udonarium/table-selecter';
import { FilterType, GameTable, GridType } from '@udonarium/game-table';

@Component({
  selector: 'range',
  templateUrl: './range.component.html',
  styleUrls: ['./range.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RangeComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() range: RangeArea = null;
  @Input() is3D: boolean = false;
//  @Input() rotateDeg : string = ''

  @ViewChild('gridCanvas', { static: true }) gridCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('rangeCanvas', { static: true }) rangeCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('rotate') rotate: ElementRef<HTMLElement>;
  
  public get clipPathText() {
    let text = '';
    switch (this.range.type) {
      case 'LINE':
        text = this.clipLine;
        break;
      case 'CIRCLE':
        text = this.clipCircle;
        break;
      case 'SQUARE':
        text = this.clipSquare;
        break;
      case 'DIAMOND':
        text = this.clipDiamond;
        break;
      case 'CORN':
      default:
        text = this.clipCorn;
        break;
    }
    return text;
  }

  public get clipCircle() {
    let clipSize = ( this.range.length + 1.5 ) * this.gridSize;
    let circle = 'circle(' + clipSize + 'px)';
    return circle;
  }

  public get clipCorn() {
    let clipCorn = 'polygon(' + this.clipAreaCorn.clip01x + 'px ' + this.clipAreaCorn.clip01y + 'px, ';
    clipCorn += this.clipAreaCorn.clip02x + 'px ' + this.clipAreaCorn.clip02y + 'px, ';
    clipCorn += this.clipAreaCorn.clip03x + 'px ' + this.clipAreaCorn.clip03y + 'px, ';
    clipCorn += this.clipAreaCorn.clip04x + 'px ' + this.clipAreaCorn.clip04y + 'px, ';
    clipCorn += this.clipAreaCorn.clip05x + 'px ' + this.clipAreaCorn.clip05y + 'px, ';
    clipCorn += this.clipAreaCorn.clip06x + 'px ' + this.clipAreaCorn.clip06y + 'px, ';
    clipCorn += this.clipAreaCorn.clip07x + 'px ' + this.clipAreaCorn.clip07y + 'px, ';
    clipCorn += this.clipAreaCorn.clip08x + 'px ' + this.clipAreaCorn.clip08y + 'px, ';
    clipCorn += this.clipAreaCorn.clip09x + 'px ' + this.clipAreaCorn.clip09y + 'px)';
    // return this.sanitizer.bypassSecurityTrustStyle(this._polygon);
    // console.log( 'clipCorn:' + clipCorn);
    return clipCorn;
  }

  public get clipLine() {
    let clipLine = 'polygon(' + this.clipAreaLine.clip01x + 'px ' + this.clipAreaLine.clip01y + 'px, ';
    clipLine += this.clipAreaLine.clip02x + 'px ' + this.clipAreaLine.clip02y + 'px, ';
    clipLine += this.clipAreaLine.clip03x + 'px ' + this.clipAreaLine.clip03y + 'px, ';
    clipLine += this.clipAreaLine.clip04x + 'px ' + this.clipAreaLine.clip04y + 'px)';
    return clipLine;
  }

  public get clipSquare() {
    let clipSquare = 'polygon(' + this.clipAreaSquare.clip01x + 'px ' + this.clipAreaSquare.clip01y + 'px, ';
    clipSquare += this.clipAreaSquare.clip02x + 'px ' + this.clipAreaSquare.clip02y + 'px, ';
    clipSquare += this.clipAreaSquare.clip03x + 'px ' + this.clipAreaSquare.clip03y + 'px, ';
    clipSquare += this.clipAreaSquare.clip04x + 'px ' + this.clipAreaSquare.clip04y + 'px)';
    return clipSquare;
  }

  public get clipDiamond() {
    let clipDiamond = 'polygon(' + this.clipAreaDiamond.clip01x + 'px ' + this.clipAreaDiamond.clip01y + 'px, ';
    clipDiamond += this.clipAreaDiamond.clip02x + 'px ' + this.clipAreaDiamond.clip02y + 'px, ';
    clipDiamond += this.clipAreaDiamond.clip03x + 'px ' + this.clipAreaDiamond.clip03y + 'px, ';
    clipDiamond += this.clipAreaDiamond.clip04x + 'px ' + this.clipAreaDiamond.clip04y + 'px)';
    return clipDiamond;
  }


  private clipAreaCorn: ClipAreaCorn = {
    clip01x: 0, // 根本始点
    clip01y: 0,
    clip02x: 100,
    clip02y: 0,
    clip03x: 100,
    clip03y: 100,
    clip04x: 0,
    clip04y: 100,
    clip05x: 0, // 先端部
    clip05y: 0,
    clip06x: 0, // 折り返し
    clip06y: 0,
    clip07x: 0,
    clip07y: 0,
    clip08x: 0,
    clip08y: 0,
    clip09x: 0,
    clip09y: 0,
  }

  private clipAreaLine: ClipAreaLine = {
    clip01x: 0, // 左下
    clip01y: 0,
    clip02x: 0, // 左上
    clip02y: -50,
    clip03x: 100, // 右上
    clip03y: -50,
    clip04x: 100, // 右下
    clip04y: 0,
  }

  private clipAreaSquare: ClipAreaSquare = {
    clip01x: 0, // 左下
    clip01y: 0,
    clip02x: 0, // 左上
    clip02y: -50,
    clip03x: 100, // 右上
    clip03y: -50,
    clip04x: 100, // 右下
    clip04y: 0,
  }

  private clipAreaDiamond: ClipAreaDiamond = {
    clip01x: 0, // 左下
    clip01y: 0,
    clip02x: 0, // 左上
    clip02y: -50,
    clip03x: 100, // 右上
    clip03y: -50,
    clip04x: 100, // 右下
    clip04y: 0,
  }


  get tableSelecter(): TableSelecter { return this.tabletopService.tableSelecter; }
  get currentTable(): GameTable { return this.tabletopService.currentTable; }

  get name(): string { return this.range.name; }
  get width(): number { return this.adjustMinBounds(this.range.width); }
  get length(): number { return this.adjustMinBounds(this.range.length); }
  get opacity(): number { return this.range.opacity; }
  get imageFile(): ImageFile { return this.range.imageFile; }
  get isLock(): boolean { return this.range.isLock; }
  set isLock(isLock: boolean) { this.range.isLock = isLock; }

  get areaQuadrantSize(): number { 
    let w = this.width < 1 ? 1 : this.width;
    let l = this.length < 1 ? 1 : this.length;
    return Math.ceil( Math.sqrt(w * w + l * l) ) +1 ; 
  }

  get rotateDeg(): number { 
    let data2 = '0.0';
    if(!this.rotate){ return 0;}
    if(!this.rotate.nativeElement){ return 0;}
    if(!this.rotate.nativeElement.style){ return 0;}
    if(!this.rotate.nativeElement.style.transform){ return 0;}

    let data = this.rotate.nativeElement.style.transform;
    data2 = data.replace(/[^0-9\.\-]/g, '');
    if(!data2) data2 = '0.0';
    return parseFloat(data2);
  }

  get altitude(): number { return this.range.altitude; }
  set altitude(altitude: number) { this.range.altitude = altitude; }

  get isAltitudeIndicate(): boolean { return this.range.isAltitudeIndicate; }
  set isAltitudeIndicate(isAltitudeIndicate: boolean) { this.range.isAltitudeIndicate = isAltitudeIndicate; }

  gridSize: number = 50;
  math = Math;

  viewRotateX = 50;
  viewRotateZ = 10;

  movableOption: MovableOption = {};
  rotableOption: RotableOption = {};

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

    private tabletopService: TabletopService,
  ) { }

  ngOnInit() {
    EventSystem.register(this)
      .on('UPDATE_GAME_OBJECT', -1000, event => {
        let object = ObjectStore.instance.get(event.data.identifier);
        this.setRange();

        if (!this.range || !object) return;
        if (this.range === object || (object instanceof ObjectNode && this.range.contains(object))) {
          this.changeDetector.markForCheck();
        }
        if( object == this.range.followingCharctor){
          console.log('追従動作');
          this.range.following();
          this.setRange();
        }
      })
      .on('SYNCHRONIZE_FILE_LIST', event => {
        this.changeDetector.markForCheck();
      })
      .on('UPDATE_FILE_RESOURE', -1000, event => {
        this.changeDetector.markForCheck();
      })
      .on<object>('TABLE_VIEW_ROTATE', -1000, event => {
        this.ngZone.run(() => {
          this.viewRotateZ = event.data['z'];
          this.changeDetector.markForCheck();
        });
      });
    this.movableOption = {
      tabletopObject: this.range,
      transformCssOffset: 'translateZ(0.25px)',
      colideLayers: ['terrain']
    };
    this.rotableOption = {
      tabletopObject: this.range
    };
    this.setRange();
  }

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => {
      this.input = new InputHandler(this.elementRef.nativeElement);
    });
    this.input.onStart = this.onInputStart.bind(this);
    this.setRange();
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
    if (this.isLock) {
      EventSystem.trigger('DRAG_LOCKED_OBJECT', {});
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
            altitudeHande: this.range
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
            }),
        ]
      }
    )

    menuArray.push(
      this.isLock
        ? {
          name: '固定解除', action: () => {
            this.isLock = false;
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
    if(this.range.type == 'CIRCLE' || this.range.type == 'SQUARE' || this.range.type == 'DIAMOND'){
      menuArray.push(
        this.range.followingCharctor
        ? {
          name: '追従を解除', action: () => {
            SoundEffect.play(PresetSound.unlock);
            this.range.followingCharctor = null;
          }
        }
        : {
          name: 'キャラクターに追従', action: () => {
            this.dockingWindowOpen();
          }
        }
      );
    }
    menuArray.push( ContextMenuSeparator);
    menuArray.push(
      { name: '射程範囲を編集', action: () => { this.showDetail(this.range); } }
    );
    menuArray.push(
      {
        name: 'コピーを作る', action: () => {
          let cloneObject = this.range.clone();
          console.log('コピー', cloneObject);
          cloneObject.location.x += this.gridSize;
          cloneObject.location.y += this.gridSize;
          cloneObject.isLock = false;
          if (this.range.parent) this.range.parent.appendChild(cloneObject);
          SoundEffect.play(PresetSound.cardPut);
        }
      }
    );
    menuArray.push(
      {
        name: '削除する', action: () => {
          this.range.destroy();
          SoundEffect.play(PresetSound.sweep);
        }
      }
    );
    menuArray.push( ContextMenuSeparator );
    menuArray.push(
      { name: 'オブジェクト作成', action: null, subActions: this.tabletopActionService.makeDefaultContextMenuActions(objectPosition) }
    );

    this.contextMenuService.open(menuPosition, menuArray, this.name);
  }


  dockingWindowOpen() {
    let coordinate = this.pointerDeviceService.pointers[0];
    let option: PanelOption = { left: coordinate.x - 250, top: coordinate.y - 175, width: 350, height: 200 };
    option.title = 'キャラクターに追従';
    let component = this.panelService.open<RangeDockingCharacterComponent>(RangeDockingCharacterComponent, option);
    component.tabletopObject = <RangeArea>this.range;
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

  private showDetail(gameObject: RangeArea) {
    let coordinate = this.pointerDeviceService.pointers[0];
    let title = '射程範囲設定';
    if (gameObject.name.length) title += ' - ' + gameObject.name;
    let option: PanelOption = { title: title, left: coordinate.x - 200, top: coordinate.y - 150, width: 400, height: 300 };
    let component = this.panelService.open<GameCharacterSheetComponent>(GameCharacterSheetComponent, option);
    component.tabletopObject = gameObject;
  }

  private setRange() {
    let render = new RangeRender(this.gridCanvas.nativeElement,this.rangeCanvas.nativeElement);

//    this.width, this.length, this.gridSize, this.currentTable.gridType, this.currentTable.gridColor

    let setting: RangeRenderSetting = {
      areaWidth: this.areaQuadrantSize * 2,
      areaHeight: this.areaQuadrantSize * 2,
      range: this.length < 1 ? 1 : this.length,
      width: this.width < 0.1 ? 0.1 : this.width,
      centerX: this.range.location.x,
      centerY: this.range.location.y,
      gridSize: this.gridSize,
      type: this.range.type,
      gridColor: this.range.gridColor,
      rangeColor: this.range.rangeColor,
      fanDegree: 0.0,
      degree: this.rotateDeg,
      offSetX: this.range.offSetX,
      offSetY: this.range.offSetY,
      fillOutLine: this.range.fillOutLine,
      gridType: this.currentTable.gridType,
      isDocking: this.range.followingCharctor ? true : false,
    };
    console.log('this.range.location.x-y:' + this.range.location.x + ' ' + this.range.location.y);

    switch (this.range.type) {
      case 'LINE':
        this.clipAreaLine = render.renderLine(setting);
        break;
      case 'CIRCLE':
        render.renderCircle(setting);
        break;
      case 'SQUARE':
        this.clipAreaSquare = render.renderSquare(setting);
        break;
      case 'DIAMOND':
        this.clipAreaDiamond = render.renderDiamond(setting);
        break;
      case 'CORN':
      default:
        this.clipAreaCorn = render.renderCorn(setting);
        break;
    }

    let opacity: number = this.range.opacity;
    this.gridCanvas.nativeElement.style.opacity = opacity + '';

  }

}
