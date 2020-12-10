import { Injectable, NgZone } from '@angular/core';
import { Card } from '@udonarium/card';
import { CardStack } from '@udonarium/card-stack';
import { ChatTab } from '@udonarium/chat-tab';
import { ChatTabList } from '@udonarium/chat-tab-list';
import { ImageContext, ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { ObjectSerializer } from '@udonarium/core/synchronize-object/object-serializer';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { DiceSymbol, DiceType } from '@udonarium/dice-symbol';
import { GameCharacter } from '@udonarium/game-character';
import { GameTable } from '@udonarium/game-table';
import { GameTableMask } from '@udonarium/game-table-mask';
import { PeerCursor } from '@udonarium/peer-cursor';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';
import { TableSelecter } from '@udonarium/table-selecter';
import { TabletopObject } from '@udonarium/tabletop-object';
import { Terrain } from '@udonarium/terrain';
import { TextNote } from '@udonarium/text-note';

import { ContextMenuAction } from './context-menu.service';
import { PointerCoordinate, PointerDeviceService } from './pointer-device.service';
//本家PR #92より
import { ImageTag } from '@udonarium/image-tag';
//
import { DataElement } from '@udonarium/data-element';
import { DiceTable } from '@udonarium/dice-table';
import { DiceTablePalette } from '@udonarium/chat-palette';
type ObjectIdentifier = string;
type LocationName = string;

@Injectable()
export class TabletopService {
  dragAreaElement: HTMLElement = document.body;

  private batchTask: Map<any, Function> = new Map();
  private batchTaskTimer: NodeJS.Timer = null;

  private _emptyTable: GameTable = new GameTable('');
  get tableSelecter(): TableSelecter { return ObjectStore.instance.get<TableSelecter>('tableSelecter'); }
  get currentTable(): GameTable {
    let table = this.tableSelecter.viewTable;
    return table ? table : this._emptyTable;
  }

  private locationMap: Map<ObjectIdentifier, LocationName> = new Map();
  private parentMap: Map<ObjectIdentifier, ObjectIdentifier> = new Map();
  private characterCache = new TabletopCache<GameCharacter>(() => ObjectStore.instance.getObjects(GameCharacter).filter(obj => obj.isVisibleOnTable));
  private cardCache = new TabletopCache<Card>(() => ObjectStore.instance.getObjects(Card).filter(obj => obj.isVisibleOnTable));
  private cardStackCache = new TabletopCache<CardStack>(() => ObjectStore.instance.getObjects(CardStack).filter(obj => obj.isVisibleOnTable));
  private tableMaskCache = new TabletopCache<GameTableMask>(() => {
    let viewTable = this.tableSelecter.viewTable;
    return viewTable ? viewTable.masks : [];
  });
  private terrainCache = new TabletopCache<Terrain>(() => {
    let viewTable = this.tableSelecter.viewTable;
    return viewTable ? viewTable.terrains : [];
  });
  private textNoteCache = new TabletopCache<TextNote>(() => ObjectStore.instance.getObjects(TextNote));
  private diceSymbolCache = new TabletopCache<DiceSymbol>(() => ObjectStore.instance.getObjects(DiceSymbol));

  get characters(): GameCharacter[] { return this.characterCache.objects; }
  get cards(): Card[] { return this.cardCache.objects; }
  get cardStacks(): CardStack[] { return this.cardStackCache.objects; }
  get tableMasks(): GameTableMask[] { return this.tableMaskCache.objects; }
  get terrains(): Terrain[] { return this.terrainCache.objects; }
  get textNotes(): TextNote[] { return this.textNoteCache.objects; }
  get diceSymbols(): DiceSymbol[] { return this.diceSymbolCache.objects; }
  get peerCursors(): PeerCursor[] { return ObjectStore.instance.getObjects<PeerCursor>(PeerCursor); }

  constructor(
    public ngZone: NgZone,
    public pointerDeviceService: PointerDeviceService,
  ) {
    console.log('円柱 constructor時');
    this.initialize();
  }

  private initialize() {
    this.refreshCacheAll();
    EventSystem.register(this)
      .on('UPDATE_GAME_OBJECT', -1000, event => {
         console.log('UPDATE_GAME_OBJECT' + event);
        if (event.data.identifier === this.currentTable.identifier || event.data.identifier === this.tableSelecter.identifier) {
          this.refreshCache(GameTableMask.aliasName);
          this.refreshCache(Terrain.aliasName);
          return;
        }

        let object = ObjectStore.instance.get(event.data.identifier);
        if (!object || !(object instanceof TabletopObject)) {
          this.refreshCache(event.data.aliasName);
        } else if (this.shouldRefreshCache(object)) {
          this.refreshCache(event.data.aliasName);
          this.updateMap(object);
        }
      })
      .on('DELETE_GAME_OBJECT', -1000, event => {
        let garbage = ObjectStore.instance.get(event.data.identifier);
         console.log('DELETE_GAME_OBJECT');
        if (garbage == null || garbage.aliasName.length < 1) {
          this.refreshCacheAll();
        } else {
          this.refreshCache(garbage.aliasName);
        }
      })
      .on('XML_LOADED', event => {
        let xmlElement: Element = event.data.xmlElement;
        // todo:立体地形の上にドロップした時の挙動
        console.log('parseXml todo:立体地形の上にドロップした時の挙動');

        let gameObject = ObjectSerializer.instance.parseXml(xmlElement);
        
        if (gameObject instanceof TabletopObject) {
          console.log('TabletopObject 追加');
          let pointer = this.calcTabletopLocalCoordinate();
          gameObject.location.x = pointer.x - 25;
          gameObject.location.y = pointer.y - 25;
          gameObject.posZ = pointer.z;
          this.placeToTabletop(gameObject);
          SoundEffect.play(PresetSound.piecePut);
        } else if (gameObject instanceof ChatTab) {

          ChatTabList.instance.addChatTab(gameObject);

        } 

        //通常版データが投下されたときに、追加が必要な要素を追加
        let objects: TabletopObject[] = ObjectStore.instance.getObjects(GameCharacter);
        for (let gameObject of objects) {
          if (gameObject instanceof GameCharacter) {
            console.log('GameCharacter Load 追加データ確認');
            let gameCharacter:GameCharacter =  gameObject;
            gameCharacter.addExtendData();
          }
        }        

      });
  }

  addBatch(task: Function, key: any = {}) {
    this.batchTask.set(key, task);
    if (this.batchTaskTimer != null) return;
    this.execBatch();
    this.batchTaskTimer = setInterval(() => {
      if (0 < this.batchTask.size) {
        this.execBatch();
      } else {
        clearInterval(this.batchTaskTimer);
        this.batchTaskTimer = null;
      }
    }, 66);
  }

  removeBatch(key: any = {}) {
    this.batchTask.delete(key);
  }

  private execBatch() {
    this.batchTask.forEach(task => task());
    this.batchTask.clear();
  }

  private findCache(aliasName: string): TabletopCache<any> {
    switch (aliasName) {
      case GameCharacter.aliasName:
        return this.characterCache;
      case Card.aliasName:
        return this.cardCache;
      case CardStack.aliasName:
        return this.cardStackCache;
      case GameTableMask.aliasName:
        return this.tableMaskCache;
      case Terrain.aliasName:
        return this.terrainCache;
      case TextNote.aliasName:
        return this.textNoteCache;
      case DiceSymbol.aliasName:
        return this.diceSymbolCache;
      default:
        return null;
    }
  }

  private refreshCache(aliasName: string) {
    let cache = this.findCache(aliasName);
    if (cache) cache.refresh();
  }

  private refreshCacheAll() {
    this.characterCache.refresh();
    this.cardCache.refresh();
    this.cardStackCache.refresh();
    this.tableMaskCache.refresh();
    this.terrainCache.refresh();
    this.textNoteCache.refresh();
    this.diceSymbolCache.refresh();
    this.clearMap();
  }

  private shouldRefreshCache(object: TabletopObject) {
    return this.locationMap.get(object.identifier) !== object.location.name || this.parentMap.get(object.identifier) !== object.parentId;
  }

  private updateMap(object: TabletopObject) {
    this.locationMap.set(object.identifier, object.location.name);
    this.parentMap.set(object.identifier, object.parentId);
  }

  private clearMap() {
    this.locationMap.clear();
    this.parentMap.clear();
  }

  private placeToTabletop(gameObject: TabletopObject) {
    switch (gameObject.aliasName) {
      case GameTableMask.aliasName:
        if (gameObject instanceof GameTableMask) gameObject.isLock = false;
      case Terrain.aliasName:
        if (gameObject instanceof Terrain) gameObject.isLocked = false;
        if (!this.tableSelecter || !this.tableSelecter.viewTable) return;
        this.tableSelecter.viewTable.appendChild(gameObject);
        break;
      default:
        gameObject.setLocation('table');
        break;
    }
  }

  calcTabletopLocalCoordinate(
    x: number = this.pointerDeviceService.pointers[0].x,
    y: number = this.pointerDeviceService.pointers[0].y,
    target: HTMLElement = this.pointerDeviceService.targetElement
  ): PointerCoordinate {
    let coordinate: PointerCoordinate = { x: x, y: y, z: 0 };
    if (target.contains(this.dragAreaElement)) {
      coordinate = PointerDeviceService.convertToLocal(coordinate, this.dragAreaElement);
      coordinate.z = 0;
    } else {
      coordinate = PointerDeviceService.convertLocalToLocal(coordinate, target, this.dragAreaElement);
    }
    return { x: coordinate.x, y: coordinate.y, z: 0 < coordinate.z ? coordinate.z : 0 };
  }

  createGameCharacter(position: PointerCoordinate): GameCharacter {
    let character = GameCharacter.create('新しいキャラクター', 1, '');
    character.location.x = position.x - 25;
    character.location.y = position.y - 25;
    character.posZ = position.z;
    return character;
  }

  createGameTableMask(position: PointerCoordinate): GameTableMask {
    let viewTable = this.tableSelecter.viewTable;
    if (!viewTable) return;

    let tableMask = GameTableMask.create('マップマスク', 5, 5, 100);
    tableMask.location.x = position.x - 25;
    tableMask.location.y = position.y - 25;
    tableMask.posZ = position.z;

    viewTable.appendChild(tableMask);
    return tableMask;
  }

  createTerrain(position: PointerCoordinate): Terrain {
    let url: string = './assets/images/tex.jpg';
    let image: ImageFile = ImageStorage.instance.get(url)

//本家PR #92より
//    if (!image) image = ImageStorage.instance.add(url);
    if (!image) {
      image = ImageStorage.instance.add(url);
      ImageTag.create(image.identifier).tag = 'default 地形';
    }
//
    let viewTable = this.tableSelecter.viewTable;
    if (!viewTable) return;

    let terrain = Terrain.create('地形', 2, 2, 2, image.identifier, image.identifier);
    terrain.location.x = position.x - 50;
    terrain.location.y = position.y - 50;
    terrain.posZ = position.z;

    viewTable.appendChild(terrain);
    return terrain;
  }

  createTextNote(position: PointerCoordinate): TextNote {
    let textNote = TextNote.create('共有メモ', 'テキストを入力してください', 5, 4, 3);
    textNote.location.x = position.x;
    textNote.location.y = position.y;
    textNote.posZ = position.z;
    return textNote;
  }

  createDiceSymbol(position: PointerCoordinate, name: string, diceType: DiceType, imagePathPrefix: string): DiceSymbol {
    let diceSymbol = DiceSymbol.create(name, diceType, 1);
    let image: ImageFile = null;

    diceSymbol.faces.forEach(face => {
      let url: string = `./assets/images/dice/${imagePathPrefix}/${imagePathPrefix}[${face}].png`;
      image = ImageStorage.instance.get(url)
      if (!image) { image = ImageStorage.instance.add(url); }
      diceSymbol.imageDataElement.getFirstElementByName(face).value = image.identifier;
    });

    diceSymbol.location.x = position.x - 25;
    diceSymbol.location.y = position.y - 25;
    diceSymbol.posZ = position.z;
    return diceSymbol;
  }

  createTrump(position: PointerCoordinate): CardStack {
    let cardStack = CardStack.create('トランプ山札');
    cardStack.location.x = position.x - 25;
    cardStack.location.y = position.y - 25;
    cardStack.posZ = position.z;

    let back: string = './assets/images/trump/z02.gif';
//本家PR #92より
//    if (!ImageStorage.instance.get(back)) {
//      ImageStorage.instance.add(back);
//    }

    if (!ImageStorage.instance.get(back)) {
      const image = ImageStorage.instance.add(back);
      ImageTag.create(image.identifier).tag = 'default トランプ';
    }
//
    let names: string[] = ['c', 'd', 'h', 's'];

    for (let name of names) {
      for (let i = 1; i <= 13; i++) {
        let trump: string = name + (('00' + i).slice(-2));
        let url: string = './assets/images/trump/' + trump + '.gif';
        if (!ImageStorage.instance.get(url)) {
//本家PR #92より
//          ImageStorage.instance.add(url);
          const image = ImageStorage.instance.add(url);
          ImageTag.create(image.identifier).tag = 'default トランプ';
//
        }
        let card = Card.create('カード', url, back);
        cardStack.putOnBottom(card);
      }
    }

    for (let i = 1; i <= 2; i++) {
      let trump: string = 'x' + (('00' + i).slice(-2));
      let url: string = './assets/images/trump/' + trump + '.gif';
      if (!ImageStorage.instance.get(url)) {
//本家PR #92より
//        ImageStorage.instance.add(url);
         const image = ImageStorage.instance.add(url);
        ImageTag.create(image.identifier).tag = 'default トランプ';
//
      }
      let card = Card.create('カード', url, back);
      cardStack.putOnBottom(card);
    }
    return cardStack;
  }

  makeDefaultTable() {
    let tableSelecter = new TableSelecter('tableSelecter');
    tableSelecter.initialize();

    let gameTable = new GameTable('gameTable');
    let testBgFile: ImageFile = null;
    let bgFileContext = ImageFile.createEmpty('testTableBackgroundImage_image').toContext();
    bgFileContext.url = './assets/images/BG10a_80.jpg';
    testBgFile = ImageStorage.instance.add(bgFileContext);
//本家PR #92より
    ImageTag.create(testBgFile.identifier).tag = '背景';    
//
    //let testDistanceFile: ImageFile = null;
    //let distanceFileContext = ImageFile.createEmpty('testTableDistanceviewImage_image').toContext();
    //distanceFileContext.url = './assets/images/BG00a1_80.jpg';
    //testDistanceFile = ImageStorage.instance.add(distanceFileContext);

//entyu_2 #92
    //ImageTag.create(testBgFile.identifier).tag = 'default テーブル';
//
    gameTable.name = '最初のテーブル';
    gameTable.imageIdentifier = testBgFile.identifier;
    //gameTable.backgroundImageIdentifier = testDistanceFile.identifier;
    gameTable.width = 20;
    gameTable.height = 15;
    gameTable.initialize();

    tableSelecter.viewTableIdentifier = gameTable.identifier;
  }

  //バフ追加
  addBuffRound(character :GameCharacter,name:string,subcom:string,round:number){
    // @ts-ignore
    if(character.buffDataElement.children){
      for (let dataElm of character.buffDataElement.children){
        dataElm.appendChild(DataElement.create(name, round , { 'type': 'numberResource', 'currentValue': subcom }, name + '_' + character.identifier ));
        return;
      }
    }
  }

  makeDefaultTabletopObjects() {
    let testCharacter: GameCharacter = null;
    let testFile: ImageFile = null;
    let fileContext: ImageContext = null;

    testCharacter = new GameCharacter('testCharacter_1');

    fileContext = ImageFile.createEmpty('testCharacter_1_image').toContext();
    fileContext.url = './assets/images/mon_052.gif';
    testFile = ImageStorage.instance.add(fileContext);
    
//本家PR #92より
    ImageTag.create(testFile.identifier).tag = 'モンスター';    
//    
    testCharacter.location.x = 5 * 50;
    testCharacter.location.y = 9 * 50;
    testCharacter.initialize();
    testCharacter.createTestGameDataElement('モンスターA', 1, testFile.identifier);
    this.addBuffRound( testCharacter ,'テストバフ1' , '防+1' , 3);

    testCharacter = new GameCharacter('testCharacter_2');

    testCharacter.location.x = 8 * 50;
    testCharacter.location.y = 8 * 50;
    testCharacter.initialize();
    testCharacter.createTestGameDataElement('モンスターB', 1, testFile.identifier);

    testCharacter = new GameCharacter('testCharacter_3');

    fileContext = ImageFile.createEmpty('testCharacter_3_image').toContext();
    fileContext.url = './assets/images/mon_128.gif';
//本家PR #92より
//    fileContext.tag = 'テスト01';
//
    testFile = ImageStorage.instance.add(fileContext);

//本家PR #92より
    ImageTag.create(testFile.identifier).tag = 'モンスター'; 
//    

    testCharacter.location.x = 4 * 50;
    testCharacter.location.y = 2 * 50;
    testCharacter.initialize();
    testCharacter.createTestGameDataElement('モンスターC', 3, testFile.identifier);

    testCharacter = new GameCharacter('testCharacter_4');

    fileContext = ImageFile.createEmpty('testCharacter_4_image').toContext();
    fileContext.url = './assets/images/mon_150.gif';
//本家PR #92より
//    fileContext.tag = 'テスト01';
//
    testFile = ImageStorage.instance.add(fileContext);

//本家PR #92より
    ImageTag.create(testFile.identifier).tag = '';
//

    testCharacter.location.x = 6 * 50;
    testCharacter.location.y = 11 * 50;
    testCharacter.initialize();
    testCharacter.createTestGameDataElement('キャラクターA', 1, testFile.identifier);
    this.addBuffRound( testCharacter ,'テストバフ2' , '攻撃+10' , 1);

    testCharacter = new GameCharacter('testCharacter_5');

    fileContext = ImageFile.createEmpty('testCharacter_5_image').toContext();
    fileContext.url = './assets/images/mon_211.gif';
    testFile = ImageStorage.instance.add(fileContext);
    
//本家PR #92より
    ImageTag.create(testFile.identifier).tag = ''; 
//
    testCharacter.location.x = 12 * 50;
    testCharacter.location.y = 12 * 50;
    testCharacter.initialize();
    testCharacter.createTestGameDataElement('キャラクターB', 1, testFile.identifier);
    this.addBuffRound( testCharacter ,'テストバフ2' , '攻撃+10' , 1);

    testCharacter = new GameCharacter('testCharacter_6');

    fileContext = ImageFile.createEmpty('testCharacter_6_image').toContext();
    fileContext.url = './assets/images/mon_135.gif';
    testFile = ImageStorage.instance.add(fileContext);
    
//本家PR #92より
    ImageTag.create(testFile.identifier).tag = '';
//     
    testCharacter.initialize();
    testCharacter.location.x = 5 * 50;
    testCharacter.location.y = 13 * 50;
    testCharacter.createTestGameDataElement('キャラクターC', 1, testFile.identifier);
    this.addBuffRound( testCharacter ,'テストバフ3' , '回避+5' , 1);
    
  }

  getContextMenuActionsForCreateObject(position: PointerCoordinate): ContextMenuAction[] {
    return [
      this.getCreateCharacterMenu(position),
      this.getCreateTableMaskMenu(position),
      this.getCreateTerrainMenu(position),
      this.getCreateTextNoteMenu(position),
      this.getCreateTrumpMenu(position),
      this.getCreateDiceSymbolMenu(position),
    ];
  }

  private getCreateCharacterMenu(position: PointerCoordinate): ContextMenuAction {
    return {
      name: 'キャラクターを作成', action: () => {
        let character = this.createGameCharacter(position);
        EventSystem.trigger('SELECT_TABLETOP_OBJECT', { identifier: character.identifier, className: character.aliasName });
        SoundEffect.play(PresetSound.piecePut);
      }
    }
  }

  private getCreateTableMaskMenu(position: PointerCoordinate): ContextMenuAction {
    return {
      name: 'マップマスクを作成', action: () => {
        this.createGameTableMask(position);
        SoundEffect.play(PresetSound.cardPut);
      }
    }
  }

  private getCreateTerrainMenu(position: PointerCoordinate): ContextMenuAction {
    return {
      name: '地形を作成', action: () => {
        this.createTerrain(position);
        SoundEffect.play(PresetSound.blockPut);
      }
    }
  }

  private getCreateTextNoteMenu(position: PointerCoordinate): ContextMenuAction {
    return {
      name: '共有メモを作成', action: () => {
        this.createTextNote(position);
        SoundEffect.play(PresetSound.cardPut);
      }
    }
  }

  private getCreateTrumpMenu(position: PointerCoordinate): ContextMenuAction {
    return {
      name: 'トランプの山札を作成', action: () => {
        this.createTrump(position);
        SoundEffect.play(PresetSound.cardPut);
      }
    }
  }

  private getCreateDiceSymbolMenu(position: PointerCoordinate): ContextMenuAction {
    let dices: { menuName: string, diceName: string, type: DiceType, imagePathPrefix: string }[] = [
      { menuName: 'D4', diceName: 'D4', type: DiceType.D4, imagePathPrefix: '4_dice' },
      { menuName: 'D6', diceName: 'D6', type: DiceType.D6, imagePathPrefix: '6_dice' },
      { menuName: 'D8', diceName: 'D8', type: DiceType.D8, imagePathPrefix: '8_dice' },
      { menuName: 'D10', diceName: 'D10', type: DiceType.D10, imagePathPrefix: '10_dice' },
      { menuName: 'D10 (00-90)', diceName: 'D10', type: DiceType.D10_10TIMES, imagePathPrefix: '100_dice' },
      { menuName: 'D12', diceName: 'D12', type: DiceType.D12, imagePathPrefix: '12_dice' },
      { menuName: 'D20', diceName: 'D20', type: DiceType.D20, imagePathPrefix: '20_dice' },
    ];
    let subMenus: ContextMenuAction[] = [];

    dices.forEach(item => {
      subMenus.push({
        name: item.menuName, action: () => {
          this.createDiceSymbol(position, item.diceName, item.type, item.imagePathPrefix);
          SoundEffect.play(PresetSound.dicePut);
        }
      });
    });
    return { name: 'ダイスを作成', action: null, subActions: subMenus };
  }
}

class TabletopCache<T extends TabletopObject> {
  private needsRefresh: boolean = true;

  private _objects: T[] = [];
  get objects(): T[] {
    if (this.needsRefresh) {
      this._objects = this.refreshCollector();
      this._objects = this._objects ? this._objects : [];
      this.needsRefresh = false;
    }
    return this._objects;
  }

  constructor(
    readonly refreshCollector: () => T[]
  ) { }

  refresh() {
    this.needsRefresh = true;
  }
}
