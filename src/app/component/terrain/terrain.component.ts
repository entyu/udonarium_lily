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
import { EventSystem } from '@udonarium/core/system';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';
import { SlopeDirection, Terrain, TerrainViewState } from '@udonarium/terrain';
import { GameCharacterSheetComponent } from 'component/game-character-sheet/game-character-sheet.component';
import { InputHandler } from 'directive/input-handler';
import { MovableOption } from 'directive/movable.directive';
import { RotableOption } from 'directive/rotable.directive';
import { ContextMenuSeparator, ContextMenuService } from 'service/context-menu.service';
import { CoordinateService } from 'service/coordinate.service';
import { ImageService } from 'service/image.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';
import { TabletopActionService } from 'service/tabletop-action.service';

import { TabletopService } from 'service/tabletop.service';
import { GridLineRender } from 'component/game-table/grid-line-render'; // 注意別のコンポーネントフォルダにアクセスしてグリッドの描画を行っている
import { TableSelecter } from '@udonarium/table-selecter';
import { FilterType, GameTable, GridType } from '@udonarium/game-table';

import { Config } from '@udonarium/config';

@Component({
  selector: 'terrain',
  templateUrl: './terrain.component.html',
  styleUrls: ['./terrain.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TerrainComponent implements OnInit, OnDestroy, AfterViewInit{
  
  @Input() terrain: Terrain = null;
  @Input() is3D: boolean = false;
  @ViewChild('gridCanvas', { static: true }) gridCanvas: ElementRef<HTMLCanvasElement>;

  get tableSelecter(): TableSelecter { return this.tabletopService.tableSelecter; }
  get currentTable(): GameTable { return this.tabletopService.currentTable; }

  get name(): string { return this.terrain.name; }
  get mode(): TerrainViewState { return this.terrain.mode; }
  set mode(mode: TerrainViewState) { this.terrain.mode = mode; }

  get isLocked(): boolean { return this.terrain.isLocked; }
  set isLocked(isLocked: boolean) { this.terrain.isLocked = isLocked; }
  get hasWall(): boolean { return this.terrain.hasWall; }
  get hasFloor(): boolean { return this.terrain.hasFloor; }

  get wallImage(): ImageFile { return this.imageService.getSkeletonOr(this.terrain.wallImage); }
  get floorImage(): ImageFile { return this.imageService.getSkeletonOr(this.terrain.floorImage); }

  get height(): number { return this.adjustMinBounds(this.terrain.height); }
  get width(): number { return this.adjustMinBounds(this.terrain.width); }
  get depth(): number { return this.adjustMinBounds(this.terrain.depth); }
  get altitude(): number { return this.terrain.altitude; }
  set altitude(altitude: number) { this.terrain.altitude = altitude; }

  get isDropShadow(): boolean { return this.terrain.isDropShadow; }
  set isDropShadow(isDropShadow: boolean) { this.terrain.isDropShadow = isDropShadow; }

  get isSlope(): boolean { return this.terrain.isSlope; }
  set isSlope(isSlope: boolean) {
    this.terrain.isSlope = isSlope;
    if (!isSlope) this.terrain.slopeDirection = SlopeDirection.NONE;
  }

  get isAltitudeIndicate(): boolean { return this.terrain.isAltitudeIndicate; }
  set isAltitudeIndicate(isAltitudeIndicate: boolean) { this.terrain.isAltitudeIndicate = isAltitudeIndicate; }

  get isVisibleFloor(): boolean { return 0 < this.width * this.depth; }
  get isVisibleWallTopBottom(): boolean { return 0 < this.width * this.height; }
  get isVisibleWallLeftRight(): boolean { return 0 < this.depth * this.height; }

  get roomGridDispAlways(): boolean { 
    let conf = ObjectStore.instance.get<Config>('Config');
    return conf? conf.roomGridDispAlways : false ;
  }

  set roomGridDispAlways(disp: boolean){
    let conf = ObjectStore.instance.get<Config>('Config');
    if(conf) conf.roomGridDispAlways = disp;
  }

  gridSize: number = 50;

  get isWallExist(): boolean {
    return this.hasWall && this.wallImage && this.wallImage.url && this.wallImage.url.length > 0;
  }

  get terreinAltitude(): number {
    let ret = this.altitude;
    if (this.altitude < 0 || (!this.isSlope && !this.isWallExist)) ret += this.height;
    return ret;
  }

  movableOption: MovableOption = {};
  rotableOption: RotableOption = {};

  math = Math;
  slopeDirectionState = SlopeDirection;

  private input: InputHandler = null;

  constructor(
    private ngZone: NgZone,
    private imageService: ImageService,
    private tabletopActionService: TabletopActionService,
    private contextMenuService: ContextMenuService,
    private elementRef: ElementRef<HTMLElement>,
    private panelService: PanelService,
    private changeDetector: ChangeDetectorRef,
    private pointerDeviceService: PointerDeviceService,
    private coordinateService: CoordinateService,

    private tabletopService: TabletopService,
  ) { }

  viewRotateZ = 10;

  ngOnInit() {
    EventSystem.register(this)
      .on('UPDATE_GAME_OBJECT', event => {
        let object = ObjectStore.instance.get(event.data.identifier);
        if (!this.terrain || !object) return;
        if (this.terrain === object || (object instanceof ObjectNode && this.terrain.contains(object))) {
          this.changeDetector.markForCheck();
        }
        if (event.data.identifier !== this.currentTable.identifier 
         && event.data.identifier !== this.tableSelecter.identifier
         && event.data.identifier !== this.terrain.identifier) return;
        this.setGameTableGrid(this.width, this.depth, this.gridSize, this.currentTable.gridType, this.currentTable.gridColor);
      })
      .on('DISP_TERRAIN_GRID', event => {
        let opacity: number = 0.0;
        if (this.terrain.isGrid){
          opacity = 1.0;
        }
        this.gridCanvas.nativeElement.style.opacity = opacity + '';
      })
      .on('DISP_TERRAIN_GRID_END', event => {
        let opacity: number = 0.0;
        if (this.terrain.isGrid){
          if (this.roomGridDispAlways){
            opacity = 1.0;
          }
          if (this.tableSelecter.gridShow){
            opacity = 1.0;
          }
        }
        this.gridCanvas.nativeElement.style.opacity = opacity + '';
      })
      .on('SYNCHRONIZE_FILE_LIST', event => {
        this.changeDetector.markForCheck();
      })
      .on('UPDATE_FILE_RESOURE', event => {
        this.changeDetector.markForCheck();
      })
      .on<object>('TABLE_VIEW_ROTATE', -1000, event => {
        this.ngZone.run(() => {
          this.viewRotateZ = event.data['z'];
          this.changeDetector.markForCheck();
        });
      });
    this.movableOption = {
      tabletopObject: this.terrain,
      colideLayers: ['terrain']
    };
    this.rotableOption = {
      tabletopObject: this.terrain
    };
  }

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => {
      this.input = new InputHandler(this.elementRef.nativeElement);
    });
    this.input.onStart = this.onInputStart.bind(this);
    this.setGameTableGrid(this.width, this.depth, this.gridSize, this.currentTable.gridType, this.currentTable.gridColor);
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
    if (this.isLocked) {
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
      {
        name: '高度設定', action: null, subActions: [
          {
            name: '高度を0にする', action: () => {
              if (this.altitude != 0) {
                this.altitude = 0;
                SoundEffect.play(PresetSound.sweep);
              }
            },
            altitudeHande: this.terrain
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
          (this.isDropShadow
            ? {
              name: '☑ 影の表示', action: () => {
                this.isDropShadow = false;
                SoundEffect.play(PresetSound.sweep);
               EventSystem.trigger('UPDATE_INVENTORY', null);
               }
            } : {
              name: '☐ 影の表示', action: () => {
               this.isDropShadow = true;
                SoundEffect.play(PresetSound.sweep);
                EventSystem.trigger('UPDATE_INVENTORY', null);
              },
            })
        ]
      },
      ContextMenuSeparator,
      (this.isLocked
        ? {
          name: '固定解除', action: () => {
            this.isLocked = false;
            SoundEffect.play(PresetSound.unlock);
          }
        } : {
          name: '固定する', action: () => {
            this.isLocked = true;
            SoundEffect.play(PresetSound.lock);
          }
        }),
      ContextMenuSeparator,
      (this.hasWall
        ? {
          name: '壁を非表示', action: () => {
            this.mode = TerrainViewState.FLOOR;
            if (this.depth * this.width === 0) {
              this.terrain.width = this.width <= 0 ? 1 : this.width;
              this.terrain.depth = this.depth <= 0 ? 1 : this.depth;
            }
          }
        } : {
          name: '壁を表示', action: () => {
            this.mode = TerrainViewState.ALL;
          }
        }),
        (this.isDropShadow
          ? {
            name: '影を非表示', action: () => {
              this.isDropShadow = false;
              SoundEffect.play(PresetSound.sweep);
            }
          } : {
            name: '影を表示', action: () => {
              this.isDropShadow = true;
              SoundEffect.play(PresetSound.sweep);
            }
          }),
      ContextMenuSeparator,
      { name: '地形設定を編集', action: () => { this.showDetail(this.terrain); } },
      {
        name: 'コピーを作る', action: () => {
          let cloneObject = this.terrain.clone();
          cloneObject.location.x += this.gridSize;
          cloneObject.location.y += this.gridSize;
          cloneObject.isLocked = false;
          if (this.terrain.parent) this.terrain.parent.appendChild(cloneObject);
          SoundEffect.play(PresetSound.blockPut);
        }
      },
      {
        name: '削除する', action: () => {
          this.terrain.destroy();
          SoundEffect.play(PresetSound.sweep);
        }
      },
      ContextMenuSeparator,
      { name: 'オブジェクト作成', action: null, subActions: this.tabletopActionService.makeDefaultContextMenuActions(objectPosition) }
    ], this.name);
  }

  onMove() {
    SoundEffect.play(PresetSound.blockPick);
  }

  onMoved() {
    SoundEffect.play(PresetSound.blockPut);
  }

  private adjustMinBounds(value: number, min: number = 0): number {
    return value < min ? min : value;
  }

  private showDetail(gameObject: Terrain) {
    EventSystem.trigger('SELECT_TABLETOP_OBJECT', { identifier: gameObject.identifier, className: gameObject.aliasName });
    let coordinate = this.pointerDeviceService.pointers[0];
    let title = '地形設定';
    if (gameObject.name.length) title += ' - ' + gameObject.name;
    let option: PanelOption = { title: title, left: coordinate.x - 250, top: coordinate.y - 150, width: 600, height: 300 };
    let component = this.panelService.open<GameCharacterSheetComponent>(GameCharacterSheetComponent, option);
    component.tabletopObject = gameObject;
  }

  private setGameTableGrid(width: number, height: number, gridSize: number = 50, gridType: GridType = GridType.SQUARE, gridColor: string = '#000000e6') {

    let render = new GridLineRender(this.gridCanvas.nativeElement);
    render.render(width, height, gridSize, gridType, gridColor);
    let opacity: number = 0.0;
    setTimeout(() => { // 他PL操作で表示条件変更時、情報更新されてからUpdate処理をするため
      if (this.terrain.isGrid){
        if (this.roomGridDispAlways){
          opacity = 1.0;
        }
        if (this.tableSelecter.gridShow){
          opacity = 1.0;
        }
      }
      this.gridCanvas.nativeElement.style.opacity = opacity + '';
    },0);
  }

}
