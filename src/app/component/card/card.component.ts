import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
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
import { Card, CardState } from '@udonarium/card';
import { CardStack } from '@udonarium/card-stack';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ObjectNode } from '@udonarium/core/synchronize-object/object-node';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem, Network } from '@udonarium/core/system';
import { StringUtil } from '@udonarium/core/system/util/string-util';
import { PeerCursor } from '@udonarium/peer-cursor';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';
import { GameCharacterSheetComponent } from 'component/game-character-sheet/game-character-sheet.component';
import { OpenUrlComponent } from 'component/open-url/open-url.component';
import { InputHandler } from 'directive/input-handler';
import { MovableOption } from 'directive/movable.directive';
import { RotableOption } from 'directive/rotable.directive';
import { ContextMenuSeparator, ContextMenuService } from 'service/context-menu.service';
import { ImageService } from 'service/image.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';
import { TabletopService } from 'service/tabletop.service';
import { ModalService } from 'service/modal.service';

@Component({
  selector: 'card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('inverse', [
      state('inverse', style({ transform: '' })),
      transition(':increment, :decrement', [
        animate('200ms ease', keyframes([
          style({ transform: 'scale3d(1.0, 1.0, 1.0)', offset: 0 }),
          style({ transform: 'scale3d(0.6, 1.2, 1.2)', offset: 0.5 }),
          style({ transform: 'scale3d(0, 0.75, 0.75)', offset: 0.75 }),
          style({ transform: 'scale3d(0.5, 1.125, 1.125)', offset: 0.875 }),
          style({ transform: 'scale3d(1.0, 1.0, 1.0)', offset: 1.0 })
        ]))
      ])
    ]),
    trigger('flipOpen', [
      transition(':enter', [
        animate('200ms ease', keyframes([
          style({ transform: 'scale3d(0, 1.0, 1.0)', offset: 0 }),
          style({ transform: 'scale3d(0, 1.2, 1.2)', offset: 0.5 }),
          style({ transform: 'scale3d(0, 0.75, 0.75)', offset: 0.75 }),
          style({ transform: 'scale3d(0.5, 1.125, 1.125)', offset: 0.875 }),
          style({ transform: 'scale3d(1.0, 1.0, 1.0)', offset: 1.0 })
        ]))
      ])
    ]),
    trigger('slidInOut', [
      transition('void => *', [
        animate('200ms ease', keyframes([
          style({ 'transform-origin': 'left center', transform: 'scale3d(0, 1.0, 1.0)', offset: 0 }),
          style({ 'transform-origin': 'left center', transform: 'scale3d(1.0, 1.0, 1.0)', offset: 1.0 })
        ]))
      ]),
      transition('* => void', [
        animate(100, style({ 'transform-origin': 'left center', transform: 'scale3d(0, 1.0, 1.0)' }))
      ])
    ])
  ]
})
export class CardComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() card: Card = null;
  @Input() is3D: boolean = false;

  get name(): string { return this.card.name; }
  get state(): CardState { return this.card.state; }
  set state(state: CardState) { this.card.state = state; }
  get rotate(): number { return this.card.rotate; }
  set rotate(rotate: number) { this.card.rotate = rotate; }
  get owner(): string { return this.card.owner; }
  set owner(owner: string) { this.card.owner = owner; }
  get zindex(): number { return this.card.zindex; }
  get size(): number { return this.adjustMinBounds(this.card.size); }

  get fontSize(): number { return this.card.fontsize; }
  set fontSize(fontSize: number) { this.card.fontsize = fontSize; }
  get text(): string { return this.card.text; }
  set text(text: string) { this.card.text = text; }
  get color(): string { return this.card.color; }
  set color(color: string) { this.card.color = color; }

  get isHand(): boolean { return this.card.isHand; }
  get isFront(): boolean { return this.card.isFront; }
  get isVisible(): boolean { return this.card.isVisible; }
  get hasOwner(): boolean { return this.card.hasOwner; }
  get ownerName(): string { return this.card.ownerName; }
  get ownerColor(): string { return this.card.ownerColor; }

  get imageFile(): ImageFile { return this.imageService.getSkeletonOr(this.card.imageFile); }
  get frontImage(): ImageFile { return this.imageService.getSkeletonOr(this.card.frontImage); }
  get backImage(): ImageFile { return this.imageService.getSkeletonOr(this.card.backImage); }

  private iconHiddenTimer: NodeJS.Timer = null;
  get isIconHidden(): boolean { return this.iconHiddenTimer != null };

  gridSize: number = 50;

  movableOption: MovableOption = {};
  rotableOption: RotableOption = {};

  private doubleClickTimer: NodeJS.Timer = null;
  private doubleClickPoint = { x: 0, y: 0 };

  private input: InputHandler = null;

  constructor(
    private ngZone: NgZone,
    private contextMenuService: ContextMenuService,
    private panelService: PanelService,
    private elementRef: ElementRef<HTMLElement>,
    private changeDetector: ChangeDetectorRef,
    private tabletopService: TabletopService,
    private imageService: ImageService,
    private pointerDeviceService: PointerDeviceService,
    private modalService: ModalService
  ) { }

  ngOnInit() {
    EventSystem.register(this)
      .on('UPDATE_GAME_OBJECT', -1000, event => {
        let object = ObjectStore.instance.get(event.data.identifier);
        if (!this.card || !object) return;
        if ((this.card === object)
          || (object instanceof ObjectNode && this.card.contains(object))
          || (object instanceof PeerCursor && object.userId === this.card.owner)) {
          this.changeDetector.markForCheck();
        }
      })
      .on('SYNCHRONIZE_FILE_LIST', event => {
        this.changeDetector.markForCheck();
      })
      .on('UPDATE_FILE_RESOURE', -1000, event => {
        this.changeDetector.markForCheck();
      })
      .on('DISCONNECT_PEER', event => {
        let cursor = PeerCursor.findByPeerId(event.data.peerId);
        if (!cursor || this.card.owner === cursor.userId) this.changeDetector.markForCheck();
      });
    this.movableOption = {
      tabletopObject: this.card,
      transformCssOffset: 'translateZ(0.15px)',
      colideLayers: ['terrain', 'text-note']
    };
    this.rotableOption = {
      tabletopObject: this.card
    };
  }

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => {
      this.input = new InputHandler(this.elementRef.nativeElement);
    });
    this.input.onStart = e => this.ngZone.run(() => this.onInputStart(e));
  }

  ngOnDestroy() {
    this.input.destroy();
    EventSystem.unregister(this);
  }

  @HostListener('carddrop', ['$event'])
  onCardDrop(e) {
    if (this.card === e.detail || (e.detail instanceof Card === false && e.detail instanceof CardStack === false)) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();

    if (e.detail instanceof CardStack) {
      let cardStack: CardStack = e.detail;
      let distance: number = (cardStack.location.x - this.card.location.x) ** 2 + (cardStack.location.y - this.card.location.y) ** 2 + (cardStack.posZ - this.card.posZ) ** 2;
      if (distance < 25 ** 2) {
        cardStack.location.x = this.card.location.x;
        cardStack.location.y = this.card.location.y;
        cardStack.posZ = this.card.posZ;
        cardStack.putOnBottom(this.card);
      }
    }
  }

  startDoubleClickTimer(e) {
    if (!this.doubleClickTimer) {
      this.stopDoubleClickTimer();
      this.doubleClickTimer = setTimeout(() => this.stopDoubleClickTimer(), e.touches ? 500 : 300);
      this.doubleClickPoint = this.input.pointer;
      return;
    }

    if (e.touches) {
      this.input.onEnd = this.onDoubleClick.bind(this);
    } else {
      this.onDoubleClick();
    }
  }

  stopDoubleClickTimer() {
    clearTimeout(this.doubleClickTimer);
    this.doubleClickTimer = null;
    this.input.onEnd = null;
  }

  onDoubleClick() {
    this.stopDoubleClickTimer();
    let distance = (this.doubleClickPoint.x - this.input.pointer.x) ** 2 + (this.doubleClickPoint.y - this.input.pointer.y) ** 2;
    if (distance < 10 ** 2) {
      console.log('onDoubleClick !!!!');
      if (this.hasOwner && !this.isHand) return;
      this.state = this.isVisible && !this.isHand ? CardState.BACK : CardState.FRONT;
      this.owner = '';
      SoundEffect.play(PresetSound.cardDraw);
    }
  }

  @HostListener('dragstart', ['$event'])
  onDragstart(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  onInputStart(e: MouseEvent | TouchEvent) {
    this.startDoubleClickTimer(e);
    this.card.toTopmost();
    this.startIconHiddenTimer();
  }

  @HostListener('contextmenu', ['$event'])
  onContextMenu(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    if (!this.pointerDeviceService.isAllowedToOpenContextMenu) return;
    let position = this.pointerDeviceService.pointers[0];
    this.contextMenuService.open(position, [
      (!this.isVisible || this.isHand
        ? {
          name: this.isHand ? '表向きで出す（公開する）' : this.hasOwner ? '表にする（公開する）' : '表にする', action: () => {
            this.card.faceUp();
            SoundEffect.play(PresetSound.cardDraw);
          }, default: !this.hasOwner || this.isHand
        }
        : {
          name: '裏にする', action: () => {
            this.card.faceDown();
            SoundEffect.play(PresetSound.cardDraw);
          }, default: !this.hasOwner || this.isHand
        }
      ),
      (this.isHand
        ? {
          name: '裏向きで出す', action: () => {
            this.card.faceDown();
            SoundEffect.play(PresetSound.cardDraw);
          }
        }
        : {
          name: '自分だけ見る（手札にする）', action: () => {
            SoundEffect.play(PresetSound.cardDraw);
            this.card.faceDown();
            this.owner = Network.peerContext.userId;
          }
        }),
      ContextMenuSeparator,
      {
        name: '重なったカードで山札を作る', action: () => {
          this.createStack();
          SoundEffect.play(PresetSound.cardPut);
        }
      },
      ContextMenuSeparator,
      { name: 'カードを編集', action: () => { this.showDetail(this.card); } },
      (this.isVisible && this.card.getUrls().length > 0 ? {
        name: '参照URLを開く', action: null,
        subActions: this.card.getUrls().map((urlElement) => {
          const url = urlElement.value.toString();
          return {
            name: urlElement.name ? urlElement.name : url,
            action: () => {
              if (StringUtil.sameOrigin(url)) {
                window.open(url.trim(), '_blank', 'noopener');
              } else {
                this.modalService.open(OpenUrlComponent, { url: url, title: this.card.name, subTitle: urlElement.name });
              } 
            },
            disabled: !StringUtil.validUrl(url),
            error: !StringUtil.validUrl(url) ? 'URLが不正です' : null,
            isOuterLink: StringUtil.validUrl(url) && !StringUtil.sameOrigin(url)
          };
        })
      } : null),
      (this.isVisible && this.card.getUrls().length > 0 ? ContextMenuSeparator : null),
      {
        name: 'コピーを作る', action: () => {
          let cloneObject = this.card.clone();
          cloneObject.location.x += this.gridSize;
          cloneObject.location.y += this.gridSize;
          cloneObject.toTopmost();
          SoundEffect.play(PresetSound.cardPut);
        }
      },
      {
        name: '削除する', action: () => {
          this.card.destroy();
          SoundEffect.play(PresetSound.sweep);
        }
      },
    ], this.isVisible ? this.name : 'カード');
  }

  onMove() {
    this.input.cancel();
    SoundEffect.play(PresetSound.cardPick);
  }

  onMoved() {
    SoundEffect.play(PresetSound.cardPut);
    this.ngZone.run(() => this.dispatchCardDropEvent());
  }

  private createStack() {
    let cardStack = CardStack.create('山札');
    cardStack.location.x = this.card.location.x;
    cardStack.location.y = this.card.location.y;
    cardStack.posZ = this.card.posZ;
    cardStack.location.name = this.card.location.name;
    cardStack.rotate = this.rotate;
    cardStack.zindex = this.card.zindex;

    let cards: Card[] = this.tabletopService.cards.filter(card => {
      let distance: number = (card.location.x - this.card.location.x) ** 2 + (card.location.y - this.card.location.y) ** 2 + (card.posZ - this.card.posZ) ** 2;
      return distance < 100 ** 2;
    });

    cards.sort((a, b) => {
      if (a.zindex < b.zindex) return 1;
      if (a.zindex > b.zindex) return -1;
      return 0;
    });

    for (let card of cards) {
      cardStack.putOnBottom(card);
    }
  }

  private dispatchCardDropEvent() {
    console.log('dispatchCardDropEvent');
    let element: HTMLElement = this.elementRef.nativeElement;
    let parent = element.parentElement;
    let children = parent.children;
    let event = new CustomEvent('carddrop', { detail: this.card, bubbles: true });
    for (let i = 0; i < children.length; i++) {
      children[i].dispatchEvent(event);
    }
  }

  private startIconHiddenTimer() {
    clearTimeout(this.iconHiddenTimer);
    this.iconHiddenTimer = setTimeout(() => {
      this.iconHiddenTimer = null;
      this.changeDetector.markForCheck();
    }, 300);
    this.changeDetector.markForCheck();
  }

  private adjustMinBounds(value: number, min: number = 0): number {
    return value < min ? min : value;
  }

  private showDetail(gameObject: Card) {
    EventSystem.trigger('SELECT_TABLETOP_OBJECT', { identifier: gameObject.identifier, className: gameObject.aliasName });
    let coordinate = this.pointerDeviceService.pointers[0];
    let title = 'カード設定';
    if (gameObject.name.length) title += ' - ' + gameObject.name;
    let option: PanelOption = { title: title, left: coordinate.x - 300, top: coordinate.y - 300, width: 600, height: 600 };
    let component = this.panelService.open<GameCharacterSheetComponent>(GameCharacterSheetComponent, option);
    component.tabletopObject = gameObject;
  }
}