import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { GameObject } from '@udonarium/core/synchronize-object/game-object';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem, Network } from '@udonarium/core/system';
import { StringUtil } from '@udonarium/core/system/util/string-util';
import { DataElement } from '@udonarium/data-element';
import { SortOrder } from '@udonarium/data-summary-setting';
import { GameCharacter } from '@udonarium/game-character';
import { PeerCursor } from '@udonarium/peer-cursor';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';
import { TabletopObject } from '@udonarium/tabletop-object';

import { ChatPaletteComponent } from 'component/chat-palette/chat-palette.component';
import { ConfirmationComponent, ConfirmationType } from 'component/confirmation/confirmation.component';
import { GameCharacterSheetComponent } from 'component/game-character-sheet/game-character-sheet.component';
import { OpenUrlComponent } from 'component/open-url/open-url.component';
import { StandSettingComponent } from 'component/stand-setting/stand-setting.component';
import { ContextMenuAction, ContextMenuService, ContextMenuSeparator } from 'service/context-menu.service';
import { GameObjectInventoryService } from 'service/game-object-inventory.service';
import { ModalService } from 'service/modal.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';

@Component({
  selector: 'game-object-inventory',
  templateUrl: './game-object-inventory.component.html',
  styleUrls: ['./game-object-inventory.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameObjectInventoryComponent implements OnInit, OnDestroy {
  inventoryTypes: string[] = ['table', 'common', 'graveyard'];

  selectTab: string = 'table';
  selectedIdentifier: string = '';

  isEdit: boolean = false;

  stringUtil = StringUtil;
  private sortStopTimerId = null;

  get sortTag(): string { return this.inventoryService.sortTag; }
  set sortTag(sortTag: string) { this.inventoryService.sortTag = sortTag; }
  get sortOrder(): SortOrder { return this.inventoryService.sortOrder; }
  set sortOrder(sortOrder: SortOrder) { this.inventoryService.sortOrder = sortOrder; }
  get dataTag(): string { return this.inventoryService.dataTag; }
  set dataTag(dataTag: string) { this.inventoryService.dataTag = dataTag; }
  get dataTags(): string[] { return this.inventoryService.dataTags; }

  get indicateAll(): boolean { return this.inventoryService.indicateAll; }
  set indicateAll(indicateAll: boolean) { this.inventoryService.indicateAll = indicateAll; }

  get sortOrderName(): string { return this.sortOrder === SortOrder.ASC ? '昇順' : '降順'; }

  get newLineString(): string { return this.inventoryService.newLineString; }

  get isGMMode(): boolean{ return PeerCursor.myCursor ? PeerCursor.myCursor.isGMMode : false; }

  constructor(
    private changeDetector: ChangeDetectorRef,
    private panelService: PanelService,
    private inventoryService: GameObjectInventoryService,
    private contextMenuService: ContextMenuService,
    private pointerDeviceService: PointerDeviceService,
    private modalService: ModalService
  ) { }

  ngOnInit() {
    Promise.resolve().then(() => this.panelService.title = 'インベントリ');
    EventSystem.register(this)
      .on('SELECT_TABLETOP_OBJECT', -1000, event => {
        if (ObjectStore.instance.get(event.data.identifier) instanceof TabletopObject) {
          this.selectedIdentifier = event.data.identifier;
          this.changeDetector.markForCheck();
        }
      })
      .on('SYNCHRONIZE_FILE_LIST', event => {
        if (event.isSendFromSelf) this.changeDetector.markForCheck();
      })
      .on('UPDATE_INVENTORY', event => {
        if (event.isSendFromSelf || event.data) this.changeDetector.markForCheck();
      })
      .on('OPEN_NETWORK', event => {
        this.inventoryTypes = ['table', 'common', Network.peerId, 'graveyard'];
        if (!this.inventoryTypes.includes(this.selectTab)) {
          this.selectTab = Network.peerId;
        }
      });
    this.inventoryTypes = ['table', 'common', Network.peerId, 'graveyard'];
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
    if (this.sortStopTimerId) clearTimeout(this.sortStopTimerId);
  }

  getTabTitle(inventoryType: string) {
    switch (inventoryType) {
      case 'table':
        return 'テーブル';
      case Network.peerId:
        return '個人';
      case 'graveyard':
        return '墓場';
      default:
        return '共有';
    }
  }

  getInventory(inventoryType: string) {
    switch (inventoryType) {
      case 'table':
        return this.inventoryService.tableInventory;
      case Network.peerId:
        return this.inventoryService.privateInventory;
      case 'graveyard':
        return this.inventoryService.graveyardInventory;
      default:
        return this.inventoryService.commonInventory;
    }
  }

  getGameObjects(inventoryType: string): TabletopObject[] {
    return this.getInventory(inventoryType).tabletopObjects.filter((tabletopObject) => { return inventoryType != 'table' || this.indicateAll || tabletopObject.isInventoryIndicate });
  }

  getInventoryTags(gameObject: GameCharacter): DataElement[] {
    return this.getInventory(gameObject.location.name).dataElementMap.get(gameObject.identifier);
  }

  onContextMenu(e: Event, gameObject: GameCharacter) {
    if (document.activeElement instanceof HTMLInputElement && document.activeElement.getAttribute('type') !== 'range') return;
    e.stopPropagation();
    e.preventDefault();

    if (!this.pointerDeviceService.isAllowedToOpenContextMenu) return;

    this.selectGameObject(gameObject);

    let position = this.pointerDeviceService.pointers[0];
    
    let actions: ContextMenuAction[] = [];
    if (gameObject.location.name === 'table' && (this.isGMMode || gameObject.isVisible)) {
      actions.push({
        name: 'テーブル上から探す',
        action: () => {
          if (gameObject.location.name === 'table') EventSystem.trigger('FOCUS_TABLETOP_OBJECT', { x: gameObject.location.x, y: gameObject.location.y, z: gameObject.posZ + (gameObject.altitude > 0 ? gameObject.altitude * 50 : 0) });
        },
        default: gameObject.location.name === 'table',
        disabled: gameObject.location.name !== 'table',
        selfOnly: true
      });
    }
    if (gameObject.isHideIn) {
      actions.push({ 
        name: '位置を公開する',
        action: () => {
          gameObject.owner = '';
          SoundEffect.play(PresetSound.piecePut);
          EventSystem.trigger('UPDATE_INVENTORY', null);
        }
      });
    }
    if (!gameObject.isHideIn || !gameObject.isVisible) {
      actions.push({ 
        name: '位置を自分だけ見る（ステルス）',
        action: () => {
          if (gameObject.location.name === 'table' && !GameCharacter.isStealthMode && !PeerCursor.myCursor.isGMMode) alert('あなたが位置を自分だけ見ているキャラクターが1つ以上テーブル上にある間、ステルスモードとなり、あなたのカーソル位置は他の参加者に伝わりません。');
          gameObject.owner = Network.peerContext.userId;
          SoundEffect.play(PresetSound.sweep);
          EventSystem.call('UPDATE_INVENTORY', true);
        }
      });
    }
    actions.push(ContextMenuSeparator);
    if (gameObject.imageFiles.length > 1) {
      actions.push({
        name: '画像切り替え',
        action: null,
        subActions: gameObject.imageFiles.map((image, i) => {
          return { 
            name: `${gameObject.currntImageIndex == i ? '◉' : '○'}`, 
            action: () => { 
              gameObject.currntImageIndex = i;
              SoundEffect.play(PresetSound.surprise);
              EventSystem.trigger('UPDATE_INVENTORY', null);
            }, 
            default: gameObject.currntImageIndex == i,
            icon: image
          };
        }),
      });
      actions.push(ContextMenuSeparator);
    }
    actions.push((gameObject.isUseIconToOverviewImage
      ? {
        name: '☑ オーバービューに顔ICを使用', action: () => {
          gameObject.isUseIconToOverviewImage = false;
          EventSystem.trigger('UPDATE_INVENTORY', null);
        }
      } : {
        name: '☐ オーバービューに顔ICを使用', action: () => {
          gameObject.isUseIconToOverviewImage = true;
          EventSystem.trigger('UPDATE_INVENTORY', null);
        }
      }));
    actions.push((gameObject.isShowChatBubble
      ? {
        name: '☑ 💭の表示', action: () => {
          gameObject.isShowChatBubble = false;
          EventSystem.trigger('UPDATE_INVENTORY', null);
        }
      } : {
        name: '☐ 💭の表示', action: () => {
          gameObject.isShowChatBubble = true;
          EventSystem.trigger('UPDATE_INVENTORY', null);
        }
      }));
    actions.push(
      (gameObject.isDropShadow
      ? {
        name: '☑ 影の表示', action: () => {
          gameObject.isDropShadow = false;
          EventSystem.trigger('UPDATE_INVENTORY', null);
        }
      } : {
        name: '☐ 影の表示', action: () => {
          gameObject.isDropShadow = true;
          EventSystem.trigger('UPDATE_INVENTORY', null);
        }
      })
    );
    actions.push({ name: '画像効果', action: null,  
      subActions: [
      (gameObject.isInverse
        ? {
          name: '☑ 反転', action: () => {
            gameObject.isInverse = false;
            EventSystem.trigger('UPDATE_INVENTORY', null);
          }
        } : {
          name: '☐ 反転', action: () => {
            gameObject.isInverse = true;
            EventSystem.trigger('UPDATE_INVENTORY', null);
          }
        }),
      (gameObject.isHollow
        ? {
          name: '☑ ぼかし', action: () => {
            gameObject.isHollow = false;
            EventSystem.trigger('UPDATE_INVENTORY', null);
          }
        } : {
          name: '☐ ぼかし', action: () => {
            gameObject.isHollow = true;
            EventSystem.trigger('UPDATE_INVENTORY', null);
          }
        }),
      (gameObject.isBlackPaint
        ? {
          name: '☑ 黒塗り', action: () => {
            gameObject.isBlackPaint = false;
            EventSystem.trigger('UPDATE_INVENTORY', null);
          }
        } : {
          name: '☐ 黒塗り', action: () => {
            gameObject.isBlackPaint = true;
            EventSystem.trigger('UPDATE_INVENTORY', null);
          }
        }),
        { name: 'オーラ', action: null, subActions: [ { name: `${gameObject.aura == -1 ? '◉' : '○'} なし`, action: () => { gameObject.aura = -1; EventSystem.trigger('UPDATE_INVENTORY', null) } }, ContextMenuSeparator].concat(['ブラック', 'ブルー', 'グリーン', 'シアン', 'レッド', 'マゼンタ', 'イエロー', 'ホワイト'].map((color, i) => {  
          return { name: `${gameObject.aura == i ? '◉' : '○'} ${color}`, action: () => { gameObject.aura = i; EventSystem.trigger('UPDATE_INVENTORY', null) } };
        })) },
        ContextMenuSeparator,
        {
          name: 'リセット', action: () => {
            gameObject.isInverse = false;
            gameObject.isHollow = false;
            gameObject.isBlackPaint = false;
            gameObject.aura = -1;
            EventSystem.trigger('UPDATE_INVENTORY', null);
          },
          disabled: !gameObject.isInverse && !gameObject.isHollow && !gameObject.isBlackPaint && gameObject.aura == -1
        }
      ]
    });
    actions.push(ContextMenuSeparator);
    actions.push((!gameObject.isNotRide
      ? {
        name: '☑ 他のキャラクターに乗る', action: () => {
          gameObject.isNotRide = true;
          EventSystem.trigger('UPDATE_INVENTORY', null);
        }
      } : {
        name: '☐ 他のキャラクターに乗る', action: () => {
          gameObject.isNotRide = false;
          EventSystem.trigger('UPDATE_INVENTORY', null);
        }
      }));
    actions.push(
      (gameObject.isAltitudeIndicate
      ? {
        name: '☑ 高度の表示', action: () => {
          gameObject.isAltitudeIndicate = false;
          EventSystem.trigger('UPDATE_INVENTORY', null);
        }
      } : {
        name: '☐ 高度の表示', action: () => {
          gameObject.isAltitudeIndicate = true;
          EventSystem.trigger('UPDATE_INVENTORY', null);
        }
      })
    );
    actions.push(
    {
      name: '高度を0にする', action: () => {
        if (gameObject.altitude != 0) {
          gameObject.altitude = 0;
          if (gameObject.location.name === 'table') SoundEffect.play(PresetSound.sweep);
        }
      },
      altitudeHande: gameObject
    });
    actions.push(ContextMenuSeparator);
    actions.push({ name: '詳細を表示', action: () => { this.showDetail(gameObject); } });
    //if (gameObject.location.name !== 'graveyard') {
      actions.push({ name: 'チャットパレットを表示', action: () => { this.showChatPalette(gameObject) }, disabled: gameObject.location.name === 'graveyard' });
    //}
    actions.push({ name: 'スタンド設定', action: () => { this.showStandSetting(gameObject) } });
    actions.push(ContextMenuSeparator);
    actions.push({
      name: '参照URLを開く', action: null,
      subActions: gameObject.getUrls().map((urlElement) => {
        const url = urlElement.value.toString();
        return {
          name: urlElement.name ? urlElement.name : url,
          action: () => {
            if (StringUtil.sameOrigin(url)) {
              window.open(url.trim(), '_blank', 'noopener');
            } else {
              this.modalService.open(OpenUrlComponent, { url: url, title: gameObject.name, subTitle: urlElement.name });
            } 
          },
          disabled: !StringUtil.validUrl(url),
          error: !StringUtil.validUrl(url) ? 'URLが不正です' : null,
          isOuterLink: StringUtil.validUrl(url) && !StringUtil.sameOrigin(url)
        };
      }),
      disabled: gameObject.getUrls().length <= 0
    });
    actions.push(ContextMenuSeparator);
    actions.push(gameObject.isInventoryIndicate
      ? {
        name: '☑ テーブルインベントリに表示', action: () => {
          gameObject.isInventoryIndicate = false;
          EventSystem.trigger('UPDATE_INVENTORY', null);
        }
      } : {
        name: '☐ テーブルインベントリに表示', action: () => {
          gameObject.isInventoryIndicate = true;
          EventSystem.trigger('UPDATE_INVENTORY', null);
        }
      });
    let locations = [
      { name: 'table', alias: 'テーブル' },
      { name: 'common', alias: '共有インベントリ' },
      { name: Network.peerId, alias: '個人インベントリ' },
      { name: 'graveyard', alias: '墓場' }
    ];
    actions.push({
      name: `${ (locations.find((location) => { return location.name == gameObject.location.name }) || locations[1]).alias }から移動`,
      action: null,
      subActions: locations
        .filter((location, i) => { return !(gameObject.location.name == location.name || (i == 1 && !locations.map(loc => loc.name).includes(gameObject.location.name))) })
        .map((location) => { 
          return {
            name: `${location.alias}`, 
            action: () => {
              let isStealthMode = GameCharacter.isStealthMode;
              EventSystem.call('FAREWELL_STAND_IMAGE', { characterIdentifier: gameObject.identifier });
              gameObject.setLocation(location.name);
              if (location.name === 'table' && gameObject.isHideIn && gameObject.isVisible && !isStealthMode && !PeerCursor.myCursor.isGMMode) {
                alert('あなたが位置を自分だけ見ているキャラクターが1つ以上テーブル上にある間、ステルスモードとなり、あなたのカーソル位置は他の参加者に伝わりません。');
                EventSystem.call('UPDATE_INVENTORY', true);
              }
              if (location.name == 'graveyard') {
                SoundEffect.play(PresetSound.sweep);
              } else {
                SoundEffect.play(PresetSound.piecePut);
              }
            }
          } 
        }),
      disabled: !gameObject.isVisible && !this.isGMMode
    });
    /*
    for (let location of locations) {
      if (gameObject.location.name === location.name) continue;
      actions.push({
        name: location.alias, action: () => {
          gameObject.setLocation(location.name);
          SoundEffect.play(PresetSound.piecePut);
        }
      });
    }
    */
    actions.push(ContextMenuSeparator);
    actions.push({
      name: 'コピーを作る', action: () => {
        this.cloneGameObject(gameObject);
        SoundEffect.play(PresetSound.piecePut);
      },
      disabled: !gameObject.isVisible && !this.isGMMode
    });
    actions.push({
      name: 'コピーを作る（自動採番）', action: () => {
        const cloneObject = gameObject.clone();
        const tmp = cloneObject.name.split('_');
        let baseName;
        if (tmp.length > 1 && /\d+/.test(tmp[tmp.length - 1])) {
          baseName = tmp.slice(0, tmp.length - 1).join('_');
        } else {
          baseName = tmp.join('_');
        }
        let maxIndex = 0;
        for (const character of ObjectStore.instance.getObjects(GameCharacter)) {
          if(!character.name.startsWith(baseName)) continue;
          let index = character.name.match(/_(\d+)$/) ? +RegExp.$1 : 0;
          if (index > maxIndex) maxIndex = index;
        }
        cloneObject.name = baseName + '_' + (maxIndex + 1);
        cloneObject.update();
        SoundEffect.play(PresetSound.piecePut);
      },
      disabled: !gameObject.isVisible && !this.isGMMode
    });
    if (gameObject.location.name === 'graveyard') {
      actions.push(ContextMenuSeparator);
      actions.push({
        name: '削除する（完全に削除）', action: () => {
          this.deleteGameObject(gameObject);
          SoundEffect.play(PresetSound.sweep);
        }
      });
    } else {
      actions.push(ContextMenuSeparator);
      actions.push({
        name: '削除する（墓場へ移動）', action: () => {
          EventSystem.call('FAREWELL_STAND_IMAGE', { characterIdentifier: gameObject.identifier });
          gameObject.setLocation('graveyard');
          SoundEffect.play(PresetSound.sweep);
        }
      });
    }
    this.contextMenuService.open(position, actions, gameObject.name);
  }

  toggleEdit() {
    this.isEdit = !this.isEdit;
  }

  cleanInventory() {
    let tabTitle = this.getTabTitle(this.selectTab);
    let gameObjects = this.getGameObjects(this.selectTab);
    //if (!confirm(`${tabTitle}に存在する${gameObjects.length}個の要素を完全に削除しますか？`)) return;
    this.modalService.open(ConfirmationComponent, {
      title: '墓場を空にする', 
      text: 'キャラクターを完全に削除しますか？',
      helpHtml: `<b>${ StringUtil.escapeHtml(tabTitle) }</b>に存在する <b>${ gameObjects.length }</b> 体のキャラクターを完全に削除します。`,
      type: ConfirmationType.OK_CANCEL,
      materialIcon: 'delete_forever',
      action: () => {
        for (const gameObject of gameObjects) {
          this.deleteGameObject(gameObject);
        }
        SoundEffect.play(PresetSound.sweep);
      }
    });
  }

  private cloneGameObject(gameObject: TabletopObject) {
    gameObject.clone();
  }

  private showDetail(gameObject: GameCharacter) {
    EventSystem.trigger('SELECT_TABLETOP_OBJECT', { identifier: gameObject.identifier, className: gameObject.aliasName });
    let coordinate = this.pointerDeviceService.pointers[0];
    let title = 'キャラクターシート';
    if (gameObject.name.length) title += ' - ' + gameObject.name;
    let option: PanelOption = { title: title, left: coordinate.x - 800, top: coordinate.y - 300, width: 800, height: 600 };
    let component = this.panelService.open<GameCharacterSheetComponent>(GameCharacterSheetComponent, option);
    component.tabletopObject = gameObject;
  }

  private showChatPalette(gameObject: GameCharacter) {
    let coordinate = this.pointerDeviceService.pointers[0];
    let option: PanelOption = { left: coordinate.x - 250, top: coordinate.y - 175, width: 620, height: 350 };
    let component = this.panelService.open<ChatPaletteComponent>(ChatPaletteComponent, option);
    component.character = gameObject;
  }

  selectGameObject(gameObject: GameObject) {
    EventSystem.trigger('SELECT_TABLETOP_OBJECT', { identifier: gameObject.identifier, className: gameObject.aliasName, highlighting: true });
  }

  focusGameObject(gameObject: GameCharacter, e: Event, ) {
    if (!(e.target instanceof HTMLElement)) return;
    if (new Set(['input', 'button']).has(e.target.tagName.toLowerCase())) return;
    if (gameObject.location.name !== 'table' || (!gameObject.isVisible && !this.isGMMode)) return;
    EventSystem.trigger('FOCUS_TABLETOP_OBJECT', { x: gameObject.location.x, y: gameObject.location.y, z: gameObject.posZ + (gameObject.altitude > 0 ? gameObject.altitude * 50 : 0) });
  }

  private deleteGameObject(gameObject: GameObject) {
    gameObject.destroy();
    this.changeDetector.markForCheck();
  }

  private showStandSetting(gameObject: GameCharacter) {
    let coordinate = this.pointerDeviceService.pointers[0];
    let option: PanelOption = { left: coordinate.x - 400, top: coordinate.y - 175, width: 730, height: 572 };
    let component = this.panelService.open<StandSettingComponent>(StandSettingComponent, option);
    component.character = gameObject;
  }
  
  trackByGameObject(index: number, gameObject: GameObject) {
    return gameObject ? gameObject.identifier : index;
  }

  openUrl(url, title=null, subTitle=null) {
    if (StringUtil.sameOrigin(url)) {
      window.open(url.trim(), '_blank', 'noopener');
    } else {
      this.modalService.open(OpenUrlComponent, { url: url, title: title, subTitle: subTitle  });
    }
    return false;
  }

  onInput() {
    this.inventoryService.sortStop = true;
    if (this.sortStopTimerId) clearTimeout(this.sortStopTimerId);
    this.sortStopTimerId = setTimeout(() => {
      this.inventoryService.sortStop = false;
    }, 666);
  }
}
