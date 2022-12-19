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
//import { RangeDockingCharacterComponent } from 'component/range-docking-character/range-docking-character.component';

import { InputHandler } from 'directive/input-handler';
import { MovableOption } from 'directive/movable.directive';
import { RotableOption } from 'directive/rotable.directive';
import { ContextMenuAction, ContextMenuSeparator, ContextMenuService } from 'service/context-menu.service';
import { CoordinateService } from 'service/coordinate.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';
import { TabletopActionService } from 'service/tabletop-action.service';

import { TabletopService } from 'service/tabletop.service';
import { RangeRender, RangeRenderSetting, ClipAreaCorn, ClipAreaLine, ClipAreaSquare, ClipAreaDiamond} from './range-render'; // 注意別のコンポーネントフォルダにアクセスしてグリッドの描画を行っている
import { TableSelecter } from '@udonarium/table-selecter';
import { FilterType, GameTable, GridType } from '@udonarium/game-table';
import { StringUtil } from '@udonarium/core/system/util/string-util';
import { ModalService } from 'service/modal.service';
import { OpenUrlComponent } from 'component/open-url/open-url.component';
import { GameCharacter } from '@udonarium/game-character';

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
  @ViewChild('centerPunch', { static: true }) centerPunch: ElementRef<HTMLCanvasElement>;
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

  public get gripPathText() {
    let text = '';
    switch (this.range.type) {
      case 'LINE':
        text = this.gripLine;
        break;
      case 'CIRCLE':
        text = this.gripCircle;
        break;
      case 'SQUARE':
        text = this.gripSquare;
        break;
      case 'DIAMOND':
        text = this.gripDiamond;
        break;
      case 'CORN':
      default:
        text = this.gripCorn;
        break;
    }
    return text;
  }

  public get clipCircle() {
    let clipSize = ( this.rangeLength + 1.5 ) * this.gridSize;
    let circle = 'circle(' + clipSize + 'px)';
    return circle;
  }

  public get gripCircle() {
    return 'circle(' + ((this.rangeLength > 1 ? this.rangeLength : 1) * this.gridSize) + 'px)';
  }

  public get clipCorn() {
    return this.clipCornPath(this.clipAreaCorn);
  }
  public get gripCorn() {
    return this.clipCornPath(this.gripAreaCorn);
  }
  private clipCornPath(clipAreaCorn: ClipAreaCorn) {
    let clipCorn = 'polygon(' + clipAreaCorn.clip01x + 'px ' + clipAreaCorn.clip01y + 'px, ';
    clipCorn += clipAreaCorn.clip02x + 'px ' + clipAreaCorn.clip02y + 'px, ';
    clipCorn += clipAreaCorn.clip03x + 'px ' + clipAreaCorn.clip03y + 'px, ';
    clipCorn += clipAreaCorn.clip04x + 'px ' + clipAreaCorn.clip04y + 'px, ';
    clipCorn += clipAreaCorn.clip05x + 'px ' + clipAreaCorn.clip05y + 'px, ';
    clipCorn += clipAreaCorn.clip06x + 'px ' + clipAreaCorn.clip06y + 'px, ';
    clipCorn += clipAreaCorn.clip07x + 'px ' + clipAreaCorn.clip07y + 'px, ';
    clipCorn += clipAreaCorn.clip08x + 'px ' + clipAreaCorn.clip08y + 'px, ';
    clipCorn += clipAreaCorn.clip09x + 'px ' + clipAreaCorn.clip09y + 'px)';
    // return this.sanitizer.bypassSecurityTrustStyle(this._polygon);
    // console.log( 'clipCorn:' + clipCorn);
    return clipCorn;
  }

  public get clipLine() {
    return this.clipLinePath(this.clipAreaLine);
  }
  public get gripLine() {
    return this.clipLinePath(this.gripAreaLine);
  }
  private clipLinePath(clipAreaLine: ClipAreaLine) {
    let clipLine = 'polygon(' + clipAreaLine.clip01x + 'px ' + clipAreaLine.clip01y + 'px, ';
    clipLine += clipAreaLine.clip02x + 'px ' + clipAreaLine.clip02y + 'px, ';
    clipLine += clipAreaLine.clip03x + 'px ' + clipAreaLine.clip03y + 'px, ';
    clipLine += clipAreaLine.clip04x + 'px ' + clipAreaLine.clip04y + 'px)';
    return clipLine;
  }

  public get clipSquare() {
    return this.clipSquarePath(this.clipAreaSquare);
  }
  public get gripSquare() {
    return this.clipSquarePath(this.gripAreaSquare);
  }
  private clipSquarePath(clipAreaSquare: ClipAreaSquare) {
    let clipSquare = 'polygon(' + clipAreaSquare.clip01x + 'px ' + clipAreaSquare.clip01y + 'px, ';
    clipSquare += clipAreaSquare.clip02x + 'px ' + clipAreaSquare.clip02y + 'px, ';
    clipSquare += clipAreaSquare.clip03x + 'px ' + clipAreaSquare.clip03y + 'px, ';
    clipSquare += clipAreaSquare.clip04x + 'px ' + clipAreaSquare.clip04y + 'px)';
    return clipSquare;
  }

  public get clipDiamond() {
    return this.clipDiamondPath(this.clipAreaDiamond);
  }
  public get gripDiamond() {
    return this.clipDiamondPath(this.gripAreaDiamond);
  }
  private clipDiamondPath(clipAreaDiamond: ClipAreaDiamond) {
    let clipDiamond = 'polygon(' + clipAreaDiamond.clip01x + 'px ' + clipAreaDiamond.clip01y + 'px, ';
    clipDiamond += clipAreaDiamond.clip02x + 'px ' + clipAreaDiamond.clip02y + 'px, ';
    clipDiamond += clipAreaDiamond.clip03x + 'px ' + clipAreaDiamond.clip03y + 'px, ';
    clipDiamond += clipAreaDiamond.clip04x + 'px ' + clipAreaDiamond.clip04y + 'px)';
    return clipDiamond;
  }

  get gripLength() {
    return this.rangeLength > 1 ? this.rangeLength : 1;
  }

  get gripWidth() {
    if ((this.range.type == 'CIRCLE') || (this.range.type == 'SQUARE') || (this.range.type == 'DIAMOND')) {
      return this.gripLength;
    }
    return (this.range.width > this.gripLength) ? this.range.width : this.gripLength;
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
  private gripAreaCorn: ClipAreaCorn = {
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
  private gripAreaLine: ClipAreaLine = {
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
  private gripAreaSquare: ClipAreaSquare = {
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
  private gripAreaDiamond: ClipAreaDiamond = {
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
  get isLocked(): boolean { return this.range.isLocked; }
  set isLocked(isLock: boolean) { this.range.isLocked = isLock; }

  get areaQuadrantSize(): number { 
    let w = this.width < 1 ? 1 : this.width;
    let l = this.rangeLength < 1 ? 1 : this.rangeLength;
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

  get elevation(): number {
    return +((this.range.posZ + (this.altitude * this.gridSize)) / this.gridSize).toFixed(1);
  }

  get isAltitudeIndicate(): boolean { return this.range.isAltitudeIndicate; }
  set isAltitudeIndicate(isAltitudeIndicate: boolean) { this.range.isAltitudeIndicate = isAltitudeIndicate; }

  get textShadowCss(): string {
    let shadow = StringUtil.textShadowColor(this.range.rangeColor, '#f5f5f5');
    return `${shadow} 0px 0px 3px`;
  }

  get followingCharactor(): GameCharacter { return this.range.followingCharactor; }
  set followingCharactor(followingCharactor: GameCharacter) { this.range.followingCharactor = followingCharactor; }

  get dockableCharacters(): GameCharacter[] {
    let ary: GameCharacter[] = this.tabletopService.characters.filter(character => {
      if (character.location.name !== 'table' || character.isHideIn) return false;
      //if (this.range.followingCharctor && this.range.followingCharctor === character) isContainFollowing = true;
      return [
        {x: 0, y: 0},
        {x: character.size * this.gridSize, y: 0},
        {x: 0, y: character.size * this.gridSize},
        {x: character.size * this.gridSize, y: character.size * this.gridSize}
      ].some(point => {
        return (this.range.location.x - this.rangeLength * this.gridSize) <= character.location.x + point.x && character.location.x + point.x <= (this.range.location.x + this.rangeLength * this.gridSize)
        && (this.range.location.y - this.rangeLength * this.gridSize) <= character.location.y  + point.y && character.location.y + point.y <= (this.range.location.y + this.rangeLength * this.gridSize);
      });
    });
    if (this.followingCharactor && !ary.some(character => character === this.followingCharactor)) ary.push(this.followingCharactor);
    return ary.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
  }
  
  get rangeLength() {
    let length = (this.length < 1 ? 1 : this.length);
    if (this.followingCharactor && this.range.isExpandByFollowing) length += this.followingCharactor.size / 2;
    return length;
  }

  get rotateHandlesLeftPos(): number[] {
    let ret: number[] = [];
    for (let i = 1; i < Math.ceil((this.rangeLength) / 6); i++) {
      ret.push(this.rangeLength * i / Math.ceil((this.rangeLength) / 6));
    }
    ret.push(this.rangeLength);
    //console.log(ret)
    return ret;
  }

  gridSize: number = 50;
  
  movableOption: MovableOption = {};
  rotableOption: RotableOption = {};
  
  viewRotateZ = 10;
  isMoving = false;
  math = Math;

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

    private modalService: ModalService,
  ) { }

  ngOnInit() {
    EventSystem.register(this)
      .on('UPDATE_GAME_OBJECT', -1000, event => {
        let object = ObjectStore.instance.get(event.data.identifier);
        //this.setRange();
        if (!this.range || !object) return;
        let markForCheck = false;
        if (this.range === object || ((object instanceof ObjectNode && this.range.contains(object)))) {
          this.ngZone.run(() => {
            //if (this.range.followingCharctor) this.range.following();
            this.setRange();
          });
          markForCheck = true;
        }
        if (this.followingCharactor) {
          if (object.identifier === this.followingCharactor.identifier) {
            //console.log('追従動作');
            this.ngZone.run(() => {
              this.range.following();
              this.setRange();
            });
            markForCheck = true;
          } else if (object instanceof ObjectNode) {
            if (this.followingCharactor.contains(object)) {
              this.ngZone.run(() => {
                this.range.following();
                this.setRange();
              });
              markForCheck = true;
            }
          }
        }
        if (markForCheck) this.changeDetector.markForCheck();
      })
      .on('SYNCHRONIZE_FILE_LIST', event => {
        this.changeDetector.markForCheck();
      })
      .on('UPDATE_FILE_RESOURE', -1000, event => {
        this.changeDetector.markForCheck();
      }).on<object>('TABLE_VIEW_ROTATE', -1000, event => {
        this.ngZone.run(() => {
          this.viewRotateZ = event.data['z'];
          this.changeDetector.markForCheck();
        });
      });
    this.movableOption = {
      tabletopObject: this.range,
      transformCssOffset: 'translateZ(0.25px)',
      colideLayers: ['terrain', 'text-note']
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
    queueMicrotask(() =>{
      this.changeDetector.markForCheck();
    });
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

    let menuArray = [];
    menuArray.push(
      this.isLocked
        ? {
          name: '☑ 固定', action: () => {
            this.isLocked = false;
            SoundEffect.play(PresetSound.unlock);
          }
        }
        : {
          name: '☐ 固定', action: () => {
            this.isLocked = true;
            SoundEffect.play(PresetSound.lock);
          }
        }
    )
    menuArray.push(
      {
        name: '影響グリッドの判定方法', action: null, 
        subActions: [
          { name: `${this.range.fillType == 0 ? '◉' : '○'} 判定なし (輪郭内を塗りつぶす)`, action: () => { this.range.fillType = 0; } },
          ContextMenuSeparator,
          { name: `${this.range.fillType == 1 ? '◉' : '○'} グリッドの中心を覆う`, action: () => { this.range.fillType = 1; } },
          { name: `${this.range.fillType == 2 ? '◉' : '○'} グリッドの一部でも覆う`, action: () => { this.range.fillType = 2; } },
          { name: `${this.range.fillType == 3 ? '◉' : '○'} グリッドの半分以上を覆う`, action: () => { this.range.fillType = 3; } },
          { name: `${this.range.fillType == 4 ? '◉' : '○'} グリッド全体を覆う`, action: () => { this.range.fillType = 4; } },
        ]
      }
    );
    menuArray.push(ContextMenuSeparator);

    if (this.range.type == 'CIRCLE' || this.range.type == 'SQUARE' || this.range.type == 'DIAMOND') {
      let menu: ContextMenuAction[] = this.dockableCharacters.length <= 0
        ? this.followingCharactor ? [] : [{ name: 'キャラクターがいません', action: null, disabled: true, center: true }] 
        : this.dockableCharacters.map(character => {
          return {
            name: `${this.followingCharactor && this.followingCharactor.identifier === character.identifier ? '◉' : '○'} ${character.name}`,
            action: () => {
              this.followingCharactor = character;
              this.ngZone.run(() => {
                this.range.following();
                //this.setRange();
              });
              SoundEffect.play(PresetSound.lock);
            }
          };
        });
      if (this.followingCharactor) {
        if (menu.length != 0) menu.push(ContextMenuSeparator);
        menu.push({
            name: '追従を解除する', action: () => {
              SoundEffect.play(PresetSound.unlock);
              this.followingCharactor = null;
            }
          });
      }
      menuArray.push({
          name: '付近のキャラクターに追従', action: null, 
          subActions: menu
        });
      menuArray.push(
        this.range.isExpandByFollowing
        ? {
          name: '☑ 追従時サイズに合わせて拡大', action: () => {
            this.range.isExpandByFollowing = false;
          }
        }
        : {
          name: '☐ 追従時サイズに合わせて拡大', action: () => {
            this.range.isExpandByFollowing = true;
          }
        });
        menuArray.push(
          this.range.isFollowAltitude
          ? {
            name: '☑ 高度にも追従', action: () => {
              this.range.isFollowAltitude = false;
            }
          }
          : {
            name: '☐ 高度にも追従', action: () => {
              this.range.isFollowAltitude = true;
              if (this.followingCharactor) this.range.following();
            }
          });
    } else {
      menuArray.push(
        this.range.subDivisionSnapPolygonal
        ? {
          name: '☑ 細かい角度で回転', action: () => {
            this.range.subDivisionSnapPolygonal = false;
          }
        } :
        {
          name: '☐ 細かい角度で回転', action: () => {
            this.range.subDivisionSnapPolygonal = true;
          }
        }
      );
    }

/*
    menuArray.push(
      {
        name: 'グリッド表示をずらす', action: null, 
        subActions: [
          this.range.offSetX 
          ? { name: '☑ 横(左右) 方向', action: () => { this.range.offSetX = false; } }
          : { name: '☐ 横(左右) 方向', action: () => { this.range.offSetX = true; }},
          this.range.offSetY 
          ? { name: `☑ 縦(上下) 方向`, action: () => { this.range.offSetY = false; } }
          : { name: `☐ 縦(上下) 方向`, action: () => { this.range.offSetY = true; } },
        ],
        disabled: this.range.fillType == 0
      }
    );
*/
    menuArray.push(this.isAltitudeIndicate
      ? {
        name: '☑ 高度の表示', action: () => {
          this.isAltitudeIndicate = false;
        }
      } : {
        name: '☐ 高度の表示', action: () => {
          this.isAltitudeIndicate = true;
        }
      });
    menuArray.push({
      name: '高度を0にする', action: () => {
        if (this.altitude != 0) {
          this.altitude = 0;
          SoundEffect.play(PresetSound.sweep);
        }
      },
      altitudeHande: this.range
    });
    menuArray.push(ContextMenuSeparator);
    menuArray.push(
      { name: '射程・範囲を編集', action: () => { this.showDetail(this.range); } }
    );
    if (this.range.getUrls().length > 0) {
      menuArray.push(
        {
          name: '参照URLを開く', action: null,
          subActions: this.range.getUrls().map((urlElement) => {
            const url = urlElement.value.toString();
            return {
              name: urlElement.name ? urlElement.name : url,
              action: () => {
                if (StringUtil.sameOrigin(url)) {
                  window.open(url.trim(), '_blank', 'noopener');
                } else {
                  this.modalService.open(OpenUrlComponent, { url: url, title: this.range.name, subTitle: urlElement.name });
                } 
              },
              disabled: !StringUtil.validUrl(url),
              error: !StringUtil.validUrl(url) ? 'URLが不正です' : null,
              isOuterLink: StringUtil.validUrl(url) && !StringUtil.sameOrigin(url)
            };
          })
        }
      );
      menuArray.push(ContextMenuSeparator);
    }
    menuArray.push(
      {
        name: 'コピーを作る', action: () => {
          let cloneObject = this.range.clone();
          console.log('コピー', cloneObject);
          cloneObject.location.x += this.gridSize;
          cloneObject.location.y += this.gridSize;
          cloneObject.isLocked = false;
          cloneObject.followingCharctorIdentifier = null;
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

/*
  dockingWindowOpen() {
    let coordinate = this.pointerDeviceService.pointers[0];
    let option: PanelOption = { left: coordinate.x - 250, top: coordinate.y - 175, width: 350, height: 200 };
    option.title = 'キャラクターに追従';
    let component = this.panelService.open<RangeDockingCharacterComponent>(RangeDockingCharacterComponent, option);
    component.tabletopObject = <RangeArea>this.range;
  }
*/

  onMove() {
    this.isMoving = true;
    SoundEffect.play(PresetSound.cardPick);
  }

  onMoved() {
    this.isMoving = false;
    SoundEffect.play(PresetSound.cardPut);
  }

  private adjustMinBounds(value: number, min: number = 0): number {
    return value < min ? min : value;
  }

  private showDetail(gameObject: RangeArea) {
    let coordinate = this.pointerDeviceService.pointers[0];
    let title = '射程・範囲設定';
    if (gameObject.name.length) title += ' - ' + gameObject.name;
    let option: PanelOption = { title: title, left: coordinate.x - 200, top: coordinate.y - 150, width: 400, height: 390 };
    let component = this.panelService.open<GameCharacterSheetComponent>(GameCharacterSheetComponent, option);
    component.tabletopObject = gameObject;
  }

  private setRange() {
    let render = new RangeRender(this.gridCanvas.nativeElement,this.rangeCanvas.nativeElement, this.centerPunch.nativeElement);

//    this.width, this.length, this.gridSize, this.currentTable.gridType, this.currentTable.gridColor

    let setting: RangeRenderSetting = {
      areaWidth: this.areaQuadrantSize * 2,
      areaHeight: this.areaQuadrantSize * 2,
      range: this.rangeLength,
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
      //fillOutLine: this.range.fillOutLine,
      gridType: this.currentTable.gridType,
      isDocking: this.followingCharactor ? true : false,
      fillType: this.range.fillType
    };
    //console.log('this.range.location.x-y:' + this.range.location.x + ' ' + this.range.location.y);

    switch (this.range.type) {
      case 'LINE':
        this.clipAreaLine = render.renderLine(setting);
        this.gripAreaLine = RangeRender.gripAreaPathLine(setting);
        break;
      case 'CIRCLE':
        render.renderCircle(setting);
        break;
      case 'SQUARE':
        this.clipAreaSquare = render.renderSquare(setting);
        this.gripAreaSquare = RangeRender.gripAreaPathSquare(setting);
        break;
      case 'DIAMOND':
        this.clipAreaDiamond = render.renderDiamond(setting);
        this.gripAreaDiamond = RangeRender.gripAreaPathDiamond(setting);
        break;
      case 'CORN':
      default:
        this.clipAreaCorn = render.renderCorn(setting);
        this.gripAreaCorn = RangeRender.gripAreaPathCorn(setting);
        break;
    }

    let opacity: number = this.range.opacity;
    this.gridCanvas.nativeElement.style.opacity = opacity + '';

  }

}
