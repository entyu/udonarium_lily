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
} from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ObjectNode } from '@udonarium/core/synchronize-object/object-node';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { StringUtil } from '@udonarium/core/system/util/string-util';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';
import { SlopeDirection, Terrain, TerrainViewState } from '@udonarium/terrain';
import { GameCharacterSheetComponent } from 'component/game-character-sheet/game-character-sheet.component';
import { OpenUrlComponent } from 'component/open-url/open-url.component';
import { InputHandler } from 'directive/input-handler';
import { MovableOption } from 'directive/movable.directive';
import { RotableOption } from 'directive/rotable.directive';
import { ContextMenuSeparator, ContextMenuService } from 'service/context-menu.service';
import { ModalService } from 'service/modal.service';
import { CoordinateService } from 'service/coordinate.service';
import { ImageService } from 'service/image.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';
import { TabletopActionService } from 'service/tabletop-action.service';

@Component({
  selector: 'terrain',
  templateUrl: './terrain.component.html',
  styleUrls: ['./terrain.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TerrainComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() terrain: Terrain = null;
  @Input() is3D: boolean = false;

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
  get isSurfaceShading(): boolean { return this.terrain.isSurfaceShading; }
  set isSurfaceShading(isSurfaceShading: boolean) { this.terrain.isSurfaceShading = isSurfaceShading; }

  get isInteract(): boolean { return this.terrain.isInteract; }
  set isInteract(isInteract: boolean) { this.terrain.isInteract = isInteract; }

  get isSlope(): boolean { return this.terrain.isSlope; }
  set isSlope(isSlope: boolean) {
    this.terrain.isSlope = isSlope;
    if (!isSlope) this.terrain.slopeDirection = SlopeDirection.NONE;
  }

  get slopeDirection(): number {
    if (!this.terrain.isSlope) return SlopeDirection.NONE;
    if (this.terrain.isSlope && this.terrain.slopeDirection === SlopeDirection.NONE) return SlopeDirection.BOTTOM;
    return this.terrain.slopeDirection;
  }
  set slopeDirection(slopeDirection: number) {
    this.terrain.isSlope = (slopeDirection != SlopeDirection.NONE);
    this.terrain.slopeDirection = slopeDirection;
  }
  
  get isAltitudeIndicate(): boolean { return this.terrain.isAltitudeIndicate; }
  set isAltitudeIndicate(isAltitudeIndicate: boolean) { this.terrain.isAltitudeIndicate = isAltitudeIndicate; }

  get isVisibleFloor(): boolean { return 0 < this.width * this.depth; }
  get isVisibleWallTopBottom(): boolean { return 0 < this.width * this.height; }
  get isVisibleWallLeftRight(): boolean { return 0 < this.depth * this.height; }

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
    private modalService: ModalService,
    private coordinateService: CoordinateService,
  ) { }

  viewRotateZ = 10;

  ngOnInit() {
    EventSystem.register(this)
      .on('UPDATE_GAME_OBJECT', -1000, event => {
        let object = ObjectStore.instance.get(event.data.identifier);
        if (!this.terrain || !object) return;
        if (this.terrain === object || (object instanceof ObjectNode && this.terrain.contains(object))) {
          this.changeDetector.markForCheck();
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
      (this.isLocked
        ? {
          name: '☑ 固定', action: () => {
            this.isLocked = false;
            SoundEffect.play(PresetSound.unlock);
          }
        } : {
          name: '☐ 固定', action: () => {
            this.isLocked = true;
            SoundEffect.play(PresetSound.lock);
          }
        }),
      ContextMenuSeparator,
      /*
      (this.isSlope
        ? {
          name: '☑ 傾斜', action: () => {
            this.isSlope = false;
          }
        } : {
          name: '☐ 傾斜', action: () => {
            this.isSlope = true;
          }
        }),
      */
      { name: '傾斜', action: null, subActions: [
        {
          name: `${ this.slopeDirection == SlopeDirection.NONE ? '◉' : '○' } なし`, action: () => {
            this.slopeDirection = SlopeDirection.NONE;
          }
        },
        ContextMenuSeparator,
        {
          name: `${ this.slopeDirection == SlopeDirection.TOP ? '◉' : '○' } 上（北）`, action: () => {
            this.slopeDirection = SlopeDirection.TOP;
          }
        },
        {
          name: `${ this.slopeDirection == SlopeDirection.BOTTOM ? '◉' : '○' } 下（南）`, action: () => {
            this.slopeDirection = SlopeDirection.BOTTOM;
          }
        },
        {
          name: `${ this.slopeDirection == SlopeDirection.LEFT ? '◉' : '○' } 左（西）`, action: () => {
            this.slopeDirection = SlopeDirection.LEFT;
          }
        },
        {
          name: `${ this.slopeDirection == SlopeDirection.RIGHT ? '◉' : '○' } 右（東）`, action: () => {
            this.slopeDirection = SlopeDirection.RIGHT;
          }
        }
      ]},
      { name: '壁の表示', action: null, subActions: [
        {
          name: `${ this.hasWall && this.isSurfaceShading ? '◉' : '○' } 通常`, action: () => {
            this.mode = TerrainViewState.ALL;
            this.isSurfaceShading = true;
          }
        },
        {
          name: `${ this.hasWall && !this.isSurfaceShading ? '◉' : '○' } 陰影なし`, action: () => {
            this.mode = TerrainViewState.ALL;
            this.isSurfaceShading = false;
          }
        },
        {
          name: `${ !this.hasWall ? '◉' : '○' } 非表示`, action: () => {
            this.mode = TerrainViewState.FLOOR;
            if (this.depth * this.width === 0) {
              this.terrain.width = this.width <= 0 ? 1 : this.width;
              this.terrain.depth = this.depth <= 0 ? 1 : this.depth;
            }
          }
        },
      ]},
      ContextMenuSeparator,
      /*
      (this.isInteract
        ? {
          name: '☑ 他の地形に乗る', action: () => {
            this.isInteract = false;
            SoundEffect.play(PresetSound.unlock);
          }
        } : {
          name: '☐ 他の地形に乗る', action: () => {
            this.isInteract = true;
            SoundEffect.play(PresetSound.lock);
          }
        }),
      ContextMenuSeparator,
      */
      (this.isDropShadow
        ? {
          name: '☑ 影を落とす', action: () => {
            this.isDropShadow = false;
          }
        } : {
          name: '☐ 影を落とす', action: () => {
            this.isDropShadow = true;
          }
        }),
      (this.isAltitudeIndicate
        ? {
          name: '☑ 高度の表示', action: () => {
            this.isAltitudeIndicate = false;
          }
        } : {
          name: '☐ 高度の表示', action: () => {
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
        altitudeHande: this.terrain
      },
      ContextMenuSeparator,
      { name: '地形設定を編集', action: () => { this.showDetail(this.terrain); } },
      (this.terrain.getUrls().length <= 0 ? null : {
        name: '参照URLを開く', action: null,
        subActions: this.terrain.getUrls().map((urlElement) => {
          const url = urlElement.value.toString();
          return {
            name: urlElement.name ? urlElement.name : url,
            action: () => {
              if (StringUtil.sameOrigin(url)) {
                window.open(url.trim(), '_blank', 'noopener');
              } else {
                this.modalService.open(OpenUrlComponent, { url: url, title: this.terrain.name, subTitle: urlElement.name });
              } 
            },
            disabled: !StringUtil.validUrl(url),
            error: !StringUtil.validUrl(url) ? 'URLが不正です' : null,
            isOuterLink: StringUtil.validUrl(url) && !StringUtil.sameOrigin(url)
          };
        })
      }),
      (this.terrain.getUrls().length <= 0 ? null : ContextMenuSeparator),
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

  get floorModCss() {
    let ret = '';
    let tmp = 0;
    switch (this.slopeDirection) {
      case SlopeDirection.TOP:
        tmp = Math.atan(this.height / this.depth);
        ret = ' rotateX(' + tmp + 'rad) scaleY(' + (1 / Math.cos(tmp)) + ')';
        break;
      case SlopeDirection.BOTTOM:
        tmp = Math.atan(this.height / this.depth);
        ret = ' rotateX(' + -tmp + 'rad) scaleY(' + (1 / Math.cos(tmp)) + ')';
        break;
      case SlopeDirection.LEFT:
        tmp = Math.atan(this.height / this.width);
        ret = ' rotateY(' + -tmp + 'rad) scaleX(' + (1 / Math.cos(tmp)) + ')';
        break;
      case SlopeDirection.RIGHT:
        tmp = Math.atan(this.height / this.width);
        ret = ' rotateY(' + tmp + 'rad) scaleX(' + (1 / Math.cos(tmp)) + ')';
        break;
    }
    return ret;
  }

  get floorBrightness() {
    let ret = 1.0;
    if (!this.isSurfaceShading) return ret;
    switch (this.slopeDirection) {
      case SlopeDirection.TOP:
        ret = 0.4;
        break;
      case SlopeDirection.BOTTOM:
        ret = 1.0;
        break;
      case SlopeDirection.LEFT:
        ret = 0.6;
        break;
      case SlopeDirection.RIGHT:
        ret = 0.9;
        break;
    }
    return ret;
  }

  private adjustMinBounds(value: number, min: number = 0): number {
    return value < min ? min : value;
  }

  private showDetail(gameObject: Terrain) {
    EventSystem.trigger('SELECT_TABLETOP_OBJECT', { identifier: gameObject.identifier, className: gameObject.aliasName });
    let coordinate = this.pointerDeviceService.pointers[0];
    let title = '地形設定';
    if (gameObject.name.length) title += ' - ' + gameObject.name;
    let option: PanelOption = { title: title, left: coordinate.x - 250, top: coordinate.y - 150, width: 550, height: 380 };
    let component = this.panelService.open<GameCharacterSheetComponent>(GameCharacterSheetComponent, option);
    component.tabletopObject = gameObject;
  }
}
