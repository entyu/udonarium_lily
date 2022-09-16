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
import { InputHandler } from 'directive/input-handler';
import { MovableOption } from 'directive/movable.directive';
import { RotableOption } from 'directive/rotable.directive';
import { ContextMenuSeparator, ContextMenuService } from 'service/context-menu.service';
import { CoordinateService } from 'service/coordinate.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';
import { TabletopActionService } from 'service/tabletop-action.service';

import { TabletopService } from 'service/tabletop.service';
import { RangeRender, RangeRenderSetting, ClipAreaCorn} from './range-render'; // 注意別のコンポーネントフォルダにアクセスしてグリッドの描画を行っている
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
    return Math.ceil( Math.sqrt(this.width * this.width + this.length * this.length) ) +1 ; 
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

  gridSize: number = 50;

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
      })
      .on('SYNCHRONIZE_FILE_LIST', event => {
        this.changeDetector.markForCheck();
      })
      .on('UPDATE_FILE_RESOURE', -1000, event => {
        this.changeDetector.markForCheck();
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
    this.contextMenuService.open(menuPosition, [
      (this.isLock
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
      ),
      ContextMenuSeparator,
      { name: '射程範囲を編集', action: () => { this.showDetail(this.range); } },
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
      },
      {
        name: '削除する', action: () => {
          this.range.destroy();
          SoundEffect.play(PresetSound.sweep);
        }
      },
      ContextMenuSeparator,
      { name: 'オブジェクト作成', action: null, subActions: this.tabletopActionService.makeDefaultContextMenuActions(objectPosition) }
    ], this.name);
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
      range: this.length,
      width: this.width,
      centerX: this.range.location.x,
      centerY: this.range.location.y,
      gridSize: this.gridSize,
      type: 'CORN',
      gridColor: '#FFFF00e6',
      rangeColor: '#FF0000e6',
      fanDegree: 0.0,
      degree: this.rotateDeg,
    };

    this.clipAreaCorn = render.renderCorn(setting);
    let opacity: number = 0.75;
    this.gridCanvas.nativeElement.style.opacity = opacity + '';

/*
    render.renderCorn(width, height, gridSize, gridType);
    let opacity2: number = 1.0;
    this.rangeCanvas.nativeElement.style.opacity = opacity2 + '';
*/
  }

}
