import Loader from 'bcdice/lib/loader/loader';
import GameSystemClass from 'bcdice/lib/game_system';
import { GameSystemInfo } from 'bcdice/lib/bcdice/game_system_list.json';

import { ChatMessage, ChatMessageContext } from './chat-message';
import { ChatTab } from './chat-tab';
import { SyncObject } from './core/synchronize-object/decorator';
import { GameObject } from './core/synchronize-object/game-object';
import { GameCharacter } from './game-character';
import { DataElement } from './data-element';

import { ObjectStore } from './core/synchronize-object/object-store';
import { EventSystem } from './core/system';
import { PromiseQueue } from './core/system/util/promise-queue';
import { StringUtil } from './core/system/util/string-util';
import { DiceTable } from './dice-table';
import { DiceTablePalette } from './chat-palette';

import { PeerCursor } from './peer-cursor';

import KariDice from './KariDice';
import IdoDice from './IdoDice';
// 追加カスタムダイスは下記追記
//import *** from './***';


interface ResourceEdit {
  target: string;
  targetHalfWidth: string;
  operator: string;
  diceResult: string;
  command: string;
  isDiceRoll: boolean;

  hitName: string;
  calcAns: number;
  detaElm: DataElement;
}

interface DiceRollResult {
  result: string;
  isSecret: boolean;
}

// bcdice-js custom loader class
class WebpackLoader extends Loader {
  async dynamicImport(className: string): Promise<void> {
    await import(
      /* webpackChunkName: "[request]"  */
      /* webpackInclude: /\.js$/ */
      `bcdice/lib/bcdice/game_system/${className}`
    );
  }
}

@SyncObject('dice-bot')
export class DiceBot extends GameObject {
  private static loader: WebpackLoader = new WebpackLoader();
  private static queue: PromiseQueue = new PromiseQueue('DiceBotQueue');

  static diceBotInfos: GameSystemInfo[] = DiceBot.listAvailableGameSystems().sort(
    (a, b) => {
      const aKey: string = a.sortKey;
      const bKey: string = b.sortKey;
      if (aKey < bKey) {
        return -1;
      }
      if (aKey > bKey) {
        return 1;
      }
      return 0;
    }
  );
  
  static getCustomGameSystemInfo(ststem:GameSystemClass): GameSystemInfo{
    const gameSystemInfo: GameSystemInfo = {
      id: ststem.ID,
      name: ststem.NAME,
      className: ststem.ID,
      sortKey: ststem.SORT_KEY
    };
    return gameSystemInfo;
  }

  static listAvailableGameSystems(): GameSystemInfo[]{
    let diceBotInfos: GameSystemInfo[] = DiceBot.loader.listAvailableGameSystems();
    diceBotInfos.push( this.getCustomGameSystemInfo( <GameSystemClass>KariDice ));
    diceBotInfos.push( this.getCustomGameSystemInfo( <GameSystemClass>IdoDice ));
    // 追加カスタムダイスは下記追記
    // diceBotInfos.push( getCustomGameSystemInfo( *** ));
    return diceBotInfos;
  }
  
  static diceRollAsync(message: string, gameSystem: GameSystemClass): Promise<DiceRollResult> {
    return DiceBot.queue.add(() => {
      try {
        const result = gameSystem.eval(message);
        if (result) {
          console.log('diceRoll!!!', result.text);
          console.log('isSecret!!!', result.secret);
          return {
            result: `${gameSystem.ID} : ${result.text}`,
            isSecret: result.secret,
          };
        }
      } catch (e) {
        console.error(e);
      }
      return { result: '', isSecret: false };
    });
  }

  static getHelpMessage(gameType: string): Promise<string> {
    return DiceBot.queue.add(async (resolve, reject) => {
      let help = '';
      try {
        const gameSystem = await DiceBot.loadGameSystemAsync(gameType);
        help = gameSystem.HELP_MESSAGE;
      } catch (e) {
        console.error(e);
      }
      resolve(help);
      return;
    });
  }

  static loadCustomGameSystem(gameType: string):any{
    if( gameType == 'KariDice') return KariDice;
    if( gameType == 'IdoDice') return IdoDice;
    // 追加カスタムダイスは下記追記
    // if( gameType == '***') return ***; 
    
    return null;
  }
  
  static loadGameSystemAsync(gameType: string): Promise<any> {

    const id = this.diceBotInfos.some((info) => info.id === gameType)
      ? gameType
      : 'DiceBot';
    
    return new Promise( (resolve) => {
      let system = this.loadCustomGameSystem( gameType );
      if( !system ){
        system = DiceBot.loader.dynamicLoad(id);
      }
      resolve( system );
    });
  }

  getDiceTables(): DiceTable[] {
    return ObjectStore.instance.getObjects(DiceTable);
  }

  // 繰り返しコマンドを除去し、sより後ろがCOMMAND_PATTERNにマッチするか確認
  checkSecretDiceCommand(gameSystem: GameSystemClass, chatText: string): boolean {
    const text: string = StringUtil.toHalfWidth(chatText).toLowerCase();
    const nonRepeatText = text.replace(/^(\d+)?\s+/, 'repeat1 ').replace(/^x(\d+)?\s+/, 'repeat1 ').replace(/repeat(\d+)?\s+/, '');
    const regArray = /^s(.*)?/ig.exec(nonRepeatText);
    console.log('checkSecretDiceCommand:' + chatText + ' gameSystem.name:' + gameSystem.name);

    if( gameSystem.COMMAND_PATTERN ){
      return regArray && gameSystem.COMMAND_PATTERN.test(regArray[1]);
    }
    console.log('checkSecretDiceCommand:' + false);
    return false;
  }

  // GameObject Lifecycle
  onStoreAdded() {
    super.onStoreAdded();
    EventSystem.register(this)
      .on('SEND_MESSAGE', async event => {
        const chatMessage = ObjectStore.instance.get<ChatMessage>(event.data.messageIdentifier);
        if (!chatMessage || !chatMessage.isSendFromSelf || chatMessage.isSystem) { return; }

        const text: string = StringUtil.toHalfWidth(chatMessage.text);
        const gameType: string = chatMessage.tags ? chatMessage.tags[0] : '';

        try {
          const regArray = /^((\d+)?\s+)?(.*)?/ig.exec(text);
          const repeat: number = (regArray[2] != null) ? Number(regArray[2]) : 1;
          let rollText: string = (regArray[3] != null) ? regArray[3] : text;
          console.log('SEND_MESSAGE gameType :'+ gameType);
          const gameSystem = await DiceBot.loadGameSystemAsync(gameType);
          if( gameSystem.COMMAND_PATTERN ){
            if( !gameSystem.COMMAND_PATTERN.test(rollText)) { return; }
          }
          if (!rollText || repeat < 1 ) { return; }

          // 繰り返しコマンドに変換
          if (repeat > 1) {
            rollText = `x${repeat} ${rollText}`;
          }

          const rollResult = await DiceBot.diceRollAsync(rollText, gameSystem);
          if (!rollResult.result) { return; }

          rollResult.result = rollResult.result.replace(/\n?(#\d+)\n/ig, '$1 '); // 繰り返しロールを詰める

          this.sendResultMessage(rollResult, chatMessage);
        } catch (e) {
          console.error(e);
        }
        return;
      })
      .on('DICE_TABLE_MESSAGE', async event => {
        console.log('ダイス表判定');

        const chatMessage = ObjectStore.instance.get<ChatMessage>(event.data.messageIdentifier);
        if (!chatMessage || !chatMessage.isSendFromSelf || chatMessage.isSystem) { return; }

        const text: string = StringUtil.toHalfWidth(chatMessage.text);
        const splitText = text.split(/\s/);

        const diceTable = this.getDiceTables() ;
        if ( !diceTable ) {return; }
        if ( splitText.length == 0 ) {return; }

        console.log('コマンド候補:' + splitText[0] );

        const rollDice = null ;
        let rollTable = null;
        for ( const table of diceTable){
          if ( table.command == splitText[0] ){
            rollTable = table;
          }
        }
        if ( !rollTable ) { return; }

        try {
          const regArray = /^((\d+)?\s+)?([^\s]*)?/ig.exec(rollTable.dice);
          const repeat: number = (regArray[2] != null) ? Number(regArray[2]) : 1;
          const rollText: string = (regArray[3] != null) ? regArray[3] : text;
          const finalResult: DiceRollResult = { result: '', isSecret: false };
          for (let i = 0; i < repeat && i < 32; i++) {
            const gameSystem = await DiceBot.loadGameSystemAsync(rollTable.diceTablePalette.dicebot);
            const rollResult = await DiceBot.diceRollAsync(rollText, gameSystem);
            if (rollResult.result.length < 1) { break; }

            finalResult.result += rollResult.result;
            finalResult.isSecret = finalResult.isSecret || rollResult.isSecret;
            if (1 < repeat) { finalResult.result += ` #${i + 1}`; }
          }

          const rolledDiceNum = finalResult.result.match(/\d+$/);
          let tableAns = 'ダイス目の番号が表にありません';
          if ( rolledDiceNum ){
            console.log('rolledDiceNum:' + rolledDiceNum[0] );

            const tablePalette = rollTable.diceTablePalette.getPalette();
            console.log('tablePalette:' + tablePalette );
            for ( const i in tablePalette ){
              console.log('oneTable:' + tablePalette[i] );

              const splitOneTable = tablePalette[i].split(/[:：,，\s]/);
              if ( splitOneTable[0] == rolledDiceNum[0] ){
                tableAns = tablePalette[i];
              }
            }

          }
          finalResult.result += '\n' + tableAns;
          this.sendResultMessage(finalResult , chatMessage);

        } catch (e) {
          console.error(e);
        }
        return;
      })
      .on('RESOURCE_EDIT_MESSAGE', async event => {
        const chatMessage = ObjectStore.instance.get<ChatMessage>(event.data.messageIdentifier);
        if (!chatMessage || !chatMessage.isSendFromSelf || chatMessage.isSystem) { return; }

        const text: string = StringUtil.toHalfWidth(chatMessage.text);
        const gameType: string = chatMessage.tags ? chatMessage.tags[0] : '';

        this.checkResourceEditCommand( chatMessage );


        return;
      })

      // ダイスからぶりによる擬似的なダイス交換を行う

      // 注※
      // 空振り処理は実装しているが
      // 数学上　実行によって実行後の判定の成功率やダイスの偏りに影響は及ぼさない

      // コードを実装した円柱は、採用しているユドナリウムリリィのダイスの乱数発生器にχ二乗検定による統計的検証は行い、
      // 乱数性質に問題がないことは確認、理解した上で作っている

      // あくまで
      // 『ダイスを交換したり　悪い出目が偶然続いたときに　ダイスを空振りしてお祓いをしたくなる　今日のダイスは偏っている気がする』など
      // 人間の心理をターゲートとしたコマンドである

      // このコマンドでダイスロール時に表示されるアイコンが変更されるがこれは視覚上演出であり
      // 空振りした回数やダイスの乱数とは無関係に差し替えている

      // 別のオンラインセッションツールの「どどんとふむせる」のまそっぷ機能のオマージュであり(細部実装は異なる)

      // 性質上　2021年エイプリールフールコマンドとして実装した
      // 実装意図はユーモアであることを記しておく

      .on('APRIL_MESSAGE', async event => {
//        console.log('えいぷりる実行判定');

        const chatMessage = ObjectStore.instance.get<ChatMessage>(event.data.messageIdentifier);
        if (!chatMessage || !chatMessage.isSendFromSelf || chatMessage.isSystem) { return; }

        const text: string = StringUtil.toHalfWidth(chatMessage.text);
        const splitText = text.split(/\s/);
        const gameSystem = await DiceBot.loadGameSystemAsync(chatMessage.tags ? chatMessage.tags[0] : '');

        const diceTable = this.getDiceTables() ;
        if ( !diceTable ) {return; }
        if ( splitText.length == 0 ) {return; }

        if ( splitText[0] == '#まそっぷ' || splitText[0] == '#エイプリル'){
          setTimeout(() => { this.alertAprilMessage(chatMessage); }, 10);
          return;
        }
        if ( splitText[0] != '#えいぷりる') { return; }

        console.log('えいぷりる実行:' + splitText[0] + ':' + splitText[1] + ':' + splitText.length);

        let diceType = '2d6';
        let rollDiceType = 'd6';

        if ( splitText.length >= 2){
          const chkType = splitText[1].toLowerCase();
          if ( chkType == '1d4' || chkType == '4')       {diceType = '1d4';  rollDiceType = 'd4'; }
          if ( chkType == '1d6' || chkType == '6')       {diceType = '1d6';  rollDiceType = 'd6'; }
          if ( chkType == '2d6')                         {diceType = '2d6';  rollDiceType = 'd6'; }
          if ( chkType == '1d8'  || chkType == '8')      {diceType = '1d8';  rollDiceType = 'd8'; }
          if ( chkType == '1d10'  || chkType == '10')    {diceType = '1d10'; rollDiceType = 'd10'; }
          if ( chkType == '1d12'  || chkType == '12')    {diceType = '1d12'; rollDiceType = 'd12'; }
          if ( chkType == '1d20'  || chkType == '20')    {diceType = '1d20'; rollDiceType = 'd20'; }
          if ( chkType == '1d100'  || chkType == '100')  {diceType = '1d100'; rollDiceType = 'd100'; }
          if ( chkType == '0' ) { diceType = ''; }
        }

        console.log('えいぷりる ダイスタイプ:' + diceType);

        const nowDiceImageIndex = PeerCursor.myCursor.diceImageIndex;
        let newDiceImageIndex = 0;

        const imageIndexMax = 3;
        if ( nowDiceImageIndex < 0){// 画像のランダム決定は標準乱数つかう
          newDiceImageIndex = Math.floor(Math.random() * ( imageIndexMax + 1) );
        }else{
          newDiceImageIndex = Math.floor(Math.random() * ( imageIndexMax ) );
          if ( nowDiceImageIndex <= newDiceImageIndex ) {
            newDiceImageIndex ++;
          }
        }

        PeerCursor.myCursor.diceImageType = diceType;
        if ( diceType == '' ){
          PeerCursor.myCursor.diceImageIndex = -1;
          setTimeout(() => { this.unDispDiceAprilMessage(chatMessage); }, 10);
          return;
        }else{
          PeerCursor.myCursor.diceImageIndex = newDiceImageIndex;
        }
//        console.log('えいぷりる ダイスImage:' + PeerCursor.myCursor.diceImageIdentifier);

        const changeFate0 = 100;

        let changeFate1 = Math.floor(Math.random() * 100) + 1; // 一度のロール量上限100による
        if ( changeFate1 < 1) { changeFate1 = 1; }
        if ( changeFate1 > 100) { changeFate1 = 100; }

        let changeFate2 = Math.floor(Math.random() * 100) + 1; // 一度のロール量上限100による
        if ( changeFate2 < 1) { changeFate2 = 1; }
        if ( changeFate2 > 100) { changeFate2 = 100; }

        let aprilRollDice = '';

        if ( diceType == '2d6' ){
          aprilRollDice = changeFate0 + rollDiceType + '+' + changeFate0 + rollDiceType + '+' +
                              changeFate1 + rollDiceType + '+' + changeFate1 + rollDiceType + '+' +
                              changeFate2 + rollDiceType + '+' + changeFate2 + rollDiceType ;
        }else{
          aprilRollDice = changeFate0 + rollDiceType + '+' + changeFate1 + rollDiceType + '+' + changeFate2 + rollDiceType ;
        }
        try {
          const regArray = /^((\d+)?\s+)?([^\s]*)?/ig.exec( aprilRollDice );
          const rollText: string = (regArray[3] != null) ? regArray[3] : text;

          const rollResult = await DiceBot.diceRollAsync(rollText, gameSystem);
          if (!rollResult.result) { return; }

          this.sendAprilMessage(rollResult, changeFate0 + changeFate1 + changeFate2 , chatMessage);
        } catch (e) {
          console.error(e);
        }

        return;
      });
  }

  private alertAprilMessage( originalMessage: ChatMessage) {
    const text = '「ちゃんと『#えいぷりる』ってよんでください！ダイス運下げますよっ！？」';

    const aprilMessage: ChatMessageContext = {
      identifier: '',
      tabIdentifier: originalMessage.tabIdentifier,
      originFrom: originalMessage.from,
      from: 'System',
      timestamp: originalMessage.timestamp + 1,
      imageIdentifier: 'april[01]',
      tag: 'system',
      name: '<えいぷりる>' ,
      text,
      messColor: originalMessage.messColor,
      imagePos: originalMessage.imagePos ? originalMessage.imagePos : null
    };

    const chatTab = ObjectStore.instance.get<ChatTab>(originalMessage.tabIdentifier);
    if (chatTab) { chatTab.addMessage(aprilMessage); }
  }


  private unDispDiceAprilMessage( originalMessage: ChatMessage) {
    const text = 'ダイス画像をデフォルト(非表示)にしました';

    const aprilMessage: ChatMessageContext = {
      identifier: '',
      tabIdentifier: originalMessage.tabIdentifier,
      originFrom: originalMessage.from,
      from: 'System',
      timestamp: originalMessage.timestamp + 1,
      imageIdentifier: 'april[00]',
      tag: 'system',
      name: '<えいぷりる>' ,
      text,
      messColor: originalMessage.messColor
    };

    const chatTab = ObjectStore.instance.get<ChatTab>(originalMessage.tabIdentifier);
    if (chatTab) { chatTab.addMessage(aprilMessage); }
  }

  private sendAprilMessage(rollResult: DiceRollResult, roollNum: number , originalMessage: ChatMessage) {
    const result: string = rollResult.result;
    const isSecret: boolean = rollResult.isSecret;

    if (result.length < 1) { return; }
    console.log('result.length:' + result.length);

    const totalFate = result.match(/\d+$/);
    const text = '「まそっぷ！」えいぷりるは炎の剣で ' + roollNum + ' 連続でダイスを突いた → ' + totalFate + ' 運命が変わったかもしれない';

    const diceBotMessage: ChatMessageContext = {
      identifier: '',
      tabIdentifier: originalMessage.tabIdentifier,
      originFrom: originalMessage.from,
      from: 'System-BCDice',
      timestamp: originalMessage.timestamp + 1,
      imageIdentifier: 'april[00]',
      tag: 'system',
      name: '<BCDice：' + 'えいぷりる' + '>' ,
      text,
      messColor: originalMessage.messColor,
      imagePos: originalMessage.imagePos ? originalMessage.imagePos : null
    };

    if (originalMessage.to != null && 0 < originalMessage.to.length) {
      diceBotMessage.to = originalMessage.to;
      if (originalMessage.to.indexOf(originalMessage.from) < 0) {
        diceBotMessage.to += ' ' + originalMessage.from;
      }
    }
    const chatTab = ObjectStore.instance.get<ChatTab>(originalMessage.tabIdentifier);
    if (chatTab) { chatTab.addMessage(diceBotMessage); }
  }

  private checkResourceEditCommand( originalMessage: ChatMessage ){
    const splitText = originalMessage.text.split(/\s/);
    let result = null;

    const allEditList: ResourceEdit[] = null;

    console.log( 'checkResourceEditCommand' + splitText);

    for (const chktxt of splitText) {
      console.log('chktxt' + chktxt);
      if (chktxt.match(/^[:：].+/gi)) {
        console.log( 'checkResourceEditCommand 2');

        result = chktxt.match(/[:：][^:：]+/gi);
        if ( result ){
          this.resourceEditProcess( result , originalMessage );
        }
      }
    }

  }

  async resourceEditProcess( result: string[] , originalMessage: ChatMessage){

    const object = ObjectStore.instance.get<GameCharacter>(originalMessage.sendFrom);
    if (object instanceof GameCharacter) {
      console.log( 'object.location.name' + object.location.name );
    }else{
      console.log('キャラクタじゃないので操作できません');
      return;
    }

    const allEditList: ResourceEdit[] = [];
    let data: DataElement ;
    const gameSystem = await DiceBot.loadGameSystemAsync(originalMessage.tags ? originalMessage.tags[0] : '');


    for ( const oneText of result ){
      const oneResourceEdit: ResourceEdit = {
        target: '',
        targetHalfWidth: '',
        operator: '',
        diceResult: '',
        command: '',
        isDiceRoll: false,
        hitName: '',
        calcAns: 0,
        detaElm : null
      };

      const replaceText = oneText.replace('：', ':').replace('＋', '+').replace('－', '-').replace('＝', '=');

      console.log('リソース変更：' + replaceText);
      const resourceEditRegExp = /[:]([^-+=]+)([-+=])(.+)/;
      const resourceEditResult = replaceText.match(resourceEditRegExp);
      if (!resourceEditResult) { return ; }

      const reg1: string = resourceEditResult[1];
      const reg2: string = resourceEditResult[2];
      const reg3: string = resourceEditResult[3];

      console.log( reg1 + '/' + reg2 + '/' + reg3 );

      oneResourceEdit.target = reg1;                                                       // 操作対象検索文字タイプ生値
      oneResourceEdit.targetHalfWidth = StringUtil.toHalfWidth(reg1);                    // 操作対象検索文字半角化
      oneResourceEdit.operator = reg2;                                                 // 演算符号
      const commandPrefix = reg2 == '-' ? '-' : '';
      oneResourceEdit.command = commandPrefix + StringUtil.toHalfWidth(reg3) + '+(1d1-1)';
      // 操作量C()とダイスロールが必要な場合分けをしないために+(1d1-1)を付加してダイスロール命令にしている

      if (StringUtil.toHalfWidth(reg3).match(/\d[dD]/)) {
        oneResourceEdit.isDiceRoll = true;
      } else {
        oneResourceEdit.isDiceRoll = false;
      }

      // 操作対象検索
      data = object.detailDataElement.getFirstElementByName(oneResourceEdit.target);
      if (data) {
        oneResourceEdit.hitName = oneResourceEdit.target;
        oneResourceEdit.detaElm = data;
      } else {
        data =  object.detailDataElement.getFirstElementByName(oneResourceEdit.targetHalfWidth);
        if (data) {
          oneResourceEdit.hitName = oneResourceEdit.targetHalfWidth;
          oneResourceEdit.detaElm = data;
        } else {
          // 検索リソースヒットせず
          return ; // 実行失敗
        }
      }
      console.log('oneResourceEdit.detaElm :V' + oneResourceEdit.detaElm.value + ' cV ' + oneResourceEdit.detaElm.currentValue);

      // ダイスロール及び四則演算
      try {
        const rollResult = await DiceBot.diceRollAsync(oneResourceEdit.command, gameSystem);
        if (!rollResult.result) { return null; }

        const splitResult = rollResult.result.split(' ＞ ');
        oneResourceEdit.diceResult = splitResult[splitResult.length - 2].replace(/\+\(1\[1\]\-1\)$/, '');

        const resultMatch = rollResult.result.match(/([-+]?\d+)$/); // 計算結果だけ格納
        console.log( 'calcAns:' + resultMatch[1]);

        oneResourceEdit.calcAns = parseInt(resultMatch[1], 10);
      } catch (e) {
        console.error(e);
      }
      console.log( 'target:' + oneResourceEdit.target + ' operator:' + oneResourceEdit.operator + ' command:' + oneResourceEdit.command + ' ans:' + oneResourceEdit.calcAns);
      allEditList.push( oneResourceEdit );
    }

    this.resourceEdit( allEditList , originalMessage);
    return;
  }

  private resourceEdit( allEditList: ResourceEdit[] , originalMessage: ChatMessage){
    let text = '';
    let oldValueS = '';
    const oldValue = 0;

    let calc = 0;
    let isDiceRoll = false;
    for ( const edit of allEditList) {
      if (edit.detaElm.type == 'numberResource') {
        oldValueS = (edit.detaElm.currentValue as string) ;

        if (edit.operator == '=') {
          calc = edit.calcAns;
        } else {
          calc = parseInt(oldValueS, 10) + edit.calcAns;
        }
        edit.detaElm.currentValue = calc;

      } else if (edit.detaElm.type != 'note') {
        oldValueS = (edit.detaElm.value as string) ;

        if (edit.operator == '=') {
          calc = edit.calcAns;
        } else {
          calc = parseInt(oldValueS, 10) + edit.calcAns;
        }
        edit.detaElm.value = calc;
      }
      /*
      let textoperator;
      if( edit.operator == '='){
        textoperator = ' ＞ ';
      }else{
        textoperator = edit.operator;
      }
      */
      const operatorText = edit.operator == '-' ? '' : edit.operator;
      text += edit.hitName + ':' + oldValueS + operatorText + edit.diceResult + '＞' + calc + '    ';
      if ( edit.isDiceRoll ) { isDiceRoll = true; }
    }
    text = text.replace(/\s\s\s\s$/, '');

    console.log( 'text:' + text);
    let fromText;
    let nameText;
    if ( isDiceRoll ){
      fromText = 'System-BCDice';
      nameText = '<BCDice：' + originalMessage.name + '>';
    }else{
      fromText = 'System';
      nameText = originalMessage.name;
    }
    const resourceMessage: ChatMessageContext = {
      identifier: '',
      tabIdentifier: originalMessage.tabIdentifier,
      originFrom: originalMessage.from,
      from: fromText,
      timestamp: originalMessage.timestamp + 2,
      imageIdentifier: PeerCursor.myCursor.diceImageIdentifier ,
      tag: 'system',
      name: nameText,
      text,
      messColor: originalMessage.messColor
    };

    const chatTab = ObjectStore.instance.get<ChatTab>(originalMessage.tabIdentifier);
    if (chatTab) { chatTab.addMessage(resourceMessage); }

  }

  private sendResultMessage(rollResult: DiceRollResult, originalMessage: ChatMessage) {
    let result: string = rollResult.result;
    const isSecret: boolean = rollResult.isSecret;

    if (result.length < 1) { return; }
    console.log('result.length:' + result.length);
    result = result.replace(/[＞]/g, s => '→').trim();

    const diceBotMessage: ChatMessageContext = {
      identifier: '',
      tabIdentifier: originalMessage.tabIdentifier,
      originFrom: originalMessage.from,
      from: 'System-BCDice',
      timestamp: originalMessage.timestamp + 1,
      imageIdentifier: PeerCursor.myCursor.diceImageIdentifier ,
      tag: isSecret ? 'system secret' : 'system',
      name: isSecret ? '<Secret-BCDice：' + originalMessage.name + '>' : '<BCDice：' + originalMessage.name + '>',
      text: result,
      messColor: originalMessage.messColor
    };

    if (originalMessage.to != null && 0 < originalMessage.to.length) {
      diceBotMessage.to = originalMessage.to;
      if (originalMessage.to.indexOf(originalMessage.from) < 0) {
        diceBotMessage.to += ' ' + originalMessage.from;
      }
    }
    const chatTab = ObjectStore.instance.get<ChatTab>(originalMessage.tabIdentifier);
    if (chatTab) { chatTab.addMessage(diceBotMessage); }
  }

  // GameObject Lifecycle
  onStoreRemoved() {
    super.onStoreRemoved();
    EventSystem.unregister(this);
  }

}
