import Loader from 'bcdice/lib/loader/loader';
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

interface ResourceEdit {
  target: string;
  targetHalfWidth: string;
  operator: string;
  command: string;

  hitName: string;
  calcAns: number;
  detaElm : DataElement;
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

  static diceBotInfos: GameSystemInfo[] = DiceBot.loader.listAvailableGameSystems().sort(
    (a, b) => {
      let aKey: string = a.sortKey;
      let bKey: string = b.sortKey;
      if (aKey < bKey) {
        return -1;
      }
      if (aKey > bKey) {
        return 1;
      }
      return 0
    }
  );

  getDiceTables(): DiceTable[] {
    return ObjectStore.instance.getObjects(DiceTable);
  }

  // GameObject Lifecycle
  onStoreAdded() {
    super.onStoreAdded();
    EventSystem.register(this)
      .on('SEND_MESSAGE', async event => {
        let chatMessage = ObjectStore.instance.get<ChatMessage>(event.data.messageIdentifier);
        if (!chatMessage || !chatMessage.isSendFromSelf || chatMessage.isSystem) return;

        let text: string = StringUtil.toHalfWidth(chatMessage.text);
        let gameType: string = chatMessage.tag;
        
        try {
//          let regArray = /^((\d+)?\s+)?([^\s]*)?/ig.exec(text);
          let regArray = /^((\d+)?\s+)?(.*)?/ig.exec(text);
          let repeat: number = (regArray[2] != null) ? Number(regArray[2]) : 1;
          let rollText: string = (regArray[3] != null) ? regArray[3] : text;
          if (!rollText || repeat < 1) return;
          // 繰り返しコマンドに変換
          if (repeat > 1) {
            rollText = `x${repeat} ${rollText}`
          }

          let rollResult = await DiceBot.diceRollAsync(rollText, gameType);
          if (!rollResult.result) return;
          
          rollResult.result = rollResult.result.replace(/\n?(#\d+)\n/ig,"$1 ");//繰り返しロールを詰める

          this.sendResultMessage(rollResult, chatMessage);
        } catch (e) {
          console.error(e);
        }
        return;
      })
      .on('DICE_TABLE_MESSAGE', async event => {
        console.log('ダイス表判定');

        let chatMessage = ObjectStore.instance.get<ChatMessage>(event.data.messageIdentifier);
        if (!chatMessage || !chatMessage.isSendFromSelf || chatMessage.isSystem) return;

        let text: string = StringUtil.toHalfWidth(chatMessage.text);
        let splitText = text.split(/\s/);
        let gameType: string = chatMessage.tag;

        let diceTable = this.getDiceTables() ;
        if( !diceTable )return;
        if( splitText.length == 0 )return;
        
        console.log('コマンド候補:' + splitText[0] );
        
        let rollDice = null ;
        let rollTable = null;
        for( let table of diceTable){
          if( table.command == splitText[0] ){
            rollTable = table;
          }
        }
        if( !rollTable ) return;
        
        try {
          let regArray = /^((\d+)?\s+)?([^\s]*)?/ig.exec(rollTable.dice);
          let repeat: number = (regArray[2] != null) ? Number(regArray[2]) : 1;
          let rollText: string = (regArray[3] != null) ? regArray[3] : text;
          let finalResult: DiceRollResult = { result: '', isSecret: false };
          for (let i = 0; i < repeat && i < 32; i++) {
            let rollResult = await DiceBot.diceRollAsync(rollText, rollTable.diceTablePalette.dicebot);
            if (rollResult.result.length < 1) break;

            finalResult.result += rollResult.result;
            finalResult.isSecret = finalResult.isSecret || rollResult.isSecret;
            if (1 < repeat) finalResult.result += ` #${i + 1}`;
          }

          let rolledDiceNum = finalResult.result.match(/\d+$/);
          let tableAns = "ダイス目の番号が表にありません";
          if( rolledDiceNum ){
            console.log('rolledDiceNum:' + rolledDiceNum[0] );
            
            let tablePalette = rollTable.diceTablePalette.getPalette();
              console.log('tablePalette:' + tablePalette );
            for( let i in tablePalette ){
              console.log('oneTable:' + tablePalette[i] );
              
              let splitOneTable = tablePalette[i].split(/[:：,，\s]/);
              if( splitOneTable[0] == rolledDiceNum[0] ){
                tableAns = tablePalette[i];
              }
            }
            
          }
          finalResult.result += '\n'+tableAns;
          this.sendResultMessage(finalResult , chatMessage);

        } catch (e) {
          console.error(e);
        }
        return;
      })
      .on('RESOURCE_EDIT_MESSAGE', async event => {
        let chatMessage = ObjectStore.instance.get<ChatMessage>(event.data.messageIdentifier);
        if (!chatMessage || !chatMessage.isSendFromSelf || chatMessage.isSystem) return;

        let text: string = StringUtil.toHalfWidth(chatMessage.text);
        let gameType: string = chatMessage.tag;
        
        this.checkResourceEditCommand( chatMessage );
        

        return;
      })

      //ダイスからぶりによる擬似的なダイス交換を行う
      
      //注※
      //空振り処理は実装しているが
      //数学上　実行によって実行後の判定の成功率やダイスの偏りに影響は及ぼさない

      //コードを実装した円柱は、採用しているユドナリウムリリィのダイスの乱数発生器にχ二乗検定による統計的検証は行い、
      //乱数性質に問題がないことは確認、理解した上で作っている

      //あくまで　
      //『ダイスを交換したり　悪い出目が偶然続いたときに　ダイスを空振りしてお祓いをしたくなる　今日のダイスは偏っている気がする』など
      //人間の心理をターゲートとしたコマンドである  

      //このコマンドでダイスロール時に表示されるアイコンが変更されるがこれは視覚上演出であり
      //空振りした回数やダイスの乱数とは無関係に差し替えている

      //別のオンラインセッションツールの「どどんとふむせる」のまそっぷ機能のオマージュであり(細部実装は異なる)

      //性質上　2021年エイプリールフールコマンドとして実装した
      //実装意図はユーモアであることを記しておく
      
      .on('APRIL_MESSAGE', async event => {
//        console.log('えいぷりる実行判定');

        let chatMessage = ObjectStore.instance.get<ChatMessage>(event.data.messageIdentifier);
        if (!chatMessage || !chatMessage.isSendFromSelf || chatMessage.isSystem) return;

        let text: string = StringUtil.toHalfWidth(chatMessage.text);
        let splitText = text.split(/\s/);
        let gameType: string = chatMessage.tag;

        let diceTable = this.getDiceTables() ;
        if( !diceTable )return;
        if( splitText.length == 0 )return;
        
        if( splitText[0] == '#まそっぷ' || splitText[0] == '#エイプリル'){
          setTimeout(() => { this.alertAprilMessage(chatMessage); },10);
          return;
        }
        if( splitText[0] != '#えいぷりる') return;
        
        console.log('えいぷりる実行:' + splitText[0] + ":" + splitText[1] +":" + splitText.length);
        
        let diceType : string = "2d6";
        let rollDiceType : string = "d6";

        if( splitText.length >= 2){
          let chkType = splitText[1].toLowerCase();
          if( chkType == "1d4" || chkType == "4")       {diceType = "1d4";  rollDiceType = "d4";}
          if( chkType == "1d6" || chkType == "6")       {diceType = "1d6";  rollDiceType = "d6";}
          if( chkType == "2d6")                         {diceType = "2d6";  rollDiceType = "d6";}
          if( chkType == "1d8"  || chkType == "8")      {diceType = "1d8";  rollDiceType = "d8";}
          if( chkType == "1d10"  || chkType == "10")    {diceType = "1d10"; rollDiceType = "d10";}
          if( chkType == "1d12"  || chkType == "12")    {diceType = "1d12"; rollDiceType = "d12";}
          if( chkType == "1d20"  || chkType == "20")    {diceType = "1d20"; rollDiceType = "d20";}
          if( chkType == "1d100"  || chkType == "100")  {diceType = "1d100";rollDiceType = "d100";}
          if( chkType == "0" ) diceType = "";
        }
        
        console.log('えいぷりる ダイスタイプ:' + diceType);
        
        let nowDiceImageIndex = PeerCursor.myCursor.diceImageIndex;
        let newDiceImageIndex = 0;
        
        let imageIndexMax = 3;
        if( nowDiceImageIndex < 0){//画像のランダム決定は標準乱数つかう
          newDiceImageIndex = Math.floor(Math.random() * ( imageIndexMax + 1) );
        }else{
          newDiceImageIndex = Math.floor(Math.random() * ( imageIndexMax ) );
          if( nowDiceImageIndex <= newDiceImageIndex )
            newDiceImageIndex ++;
        }
        
        PeerCursor.myCursor.diceImageType = diceType;
        if( diceType == "" ){
          PeerCursor.myCursor.diceImageIndex = -1;
          setTimeout(() => { this.unDispDiceAprilMessage(chatMessage); },10);
          return;
        }else{
          PeerCursor.myCursor.diceImageIndex = newDiceImageIndex;
        }
//        console.log('えいぷりる ダイスImage:' + PeerCursor.myCursor.diceImageIdentifier);
        
        let changeFate0 = 100;
        
        let changeFate1 = Math.floor(Math.random()*100)+1;//一度のロール量上限100による
        if( changeFate1 < 1) changeFate1 = 1;
        if( changeFate1 > 100) changeFate1 = 100;

        let changeFate2 = Math.floor(Math.random()*100)+1;//一度のロール量上限100による
        if( changeFate2 < 1) changeFate2 = 1;
        if( changeFate2 > 100) changeFate2 = 100;
        
        let aprilRollDice = "";
        
        if( diceType == "2d6" ){
          aprilRollDice = changeFate0 + rollDiceType + "+" + changeFate0 + rollDiceType + "+" + 
                              changeFate1 + rollDiceType + "+" + changeFate1 + rollDiceType + "+" + 
                              changeFate2 + rollDiceType + "+" + changeFate2 + rollDiceType ;
        }else{
          aprilRollDice = changeFate0 + rollDiceType + "+" + changeFate1 + rollDiceType + "+" + changeFate2 + rollDiceType ;          
        }
        try {
          let regArray = /^((\d+)?\s+)?([^\s]*)?/ig.exec( aprilRollDice );
          let rollText: string = (regArray[3] != null) ? regArray[3] : text;

          let rollResult = await DiceBot.diceRollAsync(rollText, gameType);
          if (!rollResult.result) return;
          
          this.sendAprilMessage(rollResult, changeFate0 + changeFate1 + changeFate2 ,chatMessage);
        } catch (e) {
          console.error(e);
        }
        
        return;
      });
  }

  private alertAprilMessage( originalMessage: ChatMessage) {
    let text = '「ちゃんと『#えいぷりる』ってよんでください！ダイス運下げますよっ！？」';

    let aprilMessage: ChatMessageContext = {
      identifier: '',
      tabIdentifier: originalMessage.tabIdentifier,
      originFrom: originalMessage.from,
      from: 'System',
      timestamp: originalMessage.timestamp + 1,
      imageIdentifier: 'april[01]',
      tag: 'system',
      name: '<えいぷりる>' ,
      text: text,
      messColor: originalMessage.messColor,
      imagePos: originalMessage.imagePos ? originalMessage.imagePos : null
    };

    let chatTab = ObjectStore.instance.get<ChatTab>(originalMessage.tabIdentifier);
    if (chatTab) chatTab.addMessage(aprilMessage);
  }


  private unDispDiceAprilMessage( originalMessage: ChatMessage) {
    let text = 'ダイス画像をデフォルト(非表示)にしました';

    let aprilMessage: ChatMessageContext = {
      identifier: '',
      tabIdentifier: originalMessage.tabIdentifier,
      originFrom: originalMessage.from,
      from: 'System',
      timestamp: originalMessage.timestamp + 1,
      imageIdentifier: 'april[00]',
      tag: 'system',
      name: '<えいぷりる>' ,
      text: text,
      messColor: originalMessage.messColor
    };

    let chatTab = ObjectStore.instance.get<ChatTab>(originalMessage.tabIdentifier);
    if (chatTab) chatTab.addMessage(aprilMessage);
  }
  
  private sendAprilMessage(rollResult: DiceRollResult, roollNum: number , originalMessage: ChatMessage) {
    let result: string = rollResult.result;
    let isSecret: boolean = rollResult.isSecret;

    if (result.length < 1) return;
    console.log("result.length:" +result.length);
    
    let totalFate = result.match(/\d+$/);
    let text = "「まそっぷ！」えいぷりるは炎の剣で " +roollNum+ " 連続でダイスを突いた → " + totalFate + " 運命が変わったかもしれない"
    
    let diceBotMessage: ChatMessageContext = {
      identifier: '',
      tabIdentifier: originalMessage.tabIdentifier,
      originFrom: originalMessage.from,
      from: 'System-BCDice',
      timestamp: originalMessage.timestamp + 1,
      imageIdentifier: 'april[00]',
      tag: 'system',
      name: '<BCDice：' + 'えいぷりる' + '>' ,
      text: text,
      messColor: originalMessage.messColor,
      imagePos: originalMessage.imagePos ? originalMessage.imagePos : null
    };
    
    if (originalMessage.to != null && 0 < originalMessage.to.length) {
      diceBotMessage.to = originalMessage.to;
      if (originalMessage.to.indexOf(originalMessage.from) < 0) {
        diceBotMessage.to += ' ' + originalMessage.from;
      }
    }
    let chatTab = ObjectStore.instance.get<ChatTab>(originalMessage.tabIdentifier);
    if (chatTab) chatTab.addMessage(diceBotMessage);
  }
  
  private checkResourceEditCommand( originalMessage: ChatMessage ){
    let splitText = originalMessage.text.split(/\s/);
    let result = null;
    
    let allEditList : ResourceEdit[] = null;
    
    console.log( "checkResourceEditCommand"+splitText);

    for( let chktxt of splitText ){
      console.log( "chktxt" + chktxt);
      if( chktxt.match(/^[:：].+/gi) ){
        console.log( "checkResourceEditCommand 2");
        
        result = chktxt.match(/[:：][^:：]+/gi);
        if( result ){
          this.resourceEditProcess( result , originalMessage );
        }
      }
    }

  }
   
  async resourceEditProcess( result: string[] , originalMessage: ChatMessage){

    let object = ObjectStore.instance.get<GameCharacter>(originalMessage.sendFrom);
    if (object instanceof GameCharacter) {
      console.log( "object.location.name" + object.location.name );
    }else{
      console.log("キャラクタじゃないので操作できません");
      return;
    }
    
    let allEditList : ResourceEdit[] = [];
    let data : DataElement ;
    let gameType = originalMessage.tag;

    let oneResourceEdit : ResourceEdit = {
      target: "",
      targetHalfWidth: "",
      operator: "",
      command: "",
      hitName: "",
      calcAns: 0,
      detaElm : null
    }
     
    for( let oneText of result ){
      
      console.log(oneText);
      if( ! oneText.match(/[:：]([^-+=－＋＝]+)([-+=－＋＝])(.+)/) ) return ;
      
      if( oneText.match(/[:：]([^-+=－＋＝]+)([-+=－＋＝])(.+)/) ){
        oneResourceEdit.target =  RegExp.$1 ;                                     //操作対象検索文字タイプ生値
        oneResourceEdit.targetHalfWidth = StringUtil.toHalfWidth(RegExp.$1) ;     //操作対象検索文字半角化
        oneResourceEdit.operator = StringUtil.toHalfWidth(RegExp.$2) ;            //演算符号
        oneResourceEdit.command = StringUtil.toHalfWidth(RegExp.$3)+"+(1d1-1)";   //操作量　C()とダイスロールが必要な場合分けをしないために+(1d1-1)を付加してダイスロール命令にしている
        
//        console.log( "円柱chkpoint 01");
        
        //操作対象検索
        data =  object.detailDataElement.getFirstElementByName(oneResourceEdit.target);
        if( data ){
          oneResourceEdit.hitName = oneResourceEdit.target;
          oneResourceEdit.detaElm = data;
        }else{
          data =  object.detailDataElement.getFirstElementByName(oneResourceEdit.targetHalfWidth);
          if( data ){
            oneResourceEdit.hitName = oneResourceEdit.targetHalfWidth;
            oneResourceEdit.detaElm = data;
          }else{
            //検索リソースヒットせず
            return ;//実行失敗
          }
        }
        
        //ダイスロール及び四則演算
        try {
          let rollResult = await DiceBot.diceRollAsync(oneResourceEdit.command, gameType);
          if (!rollResult.result) return null;
          console.log("rollResult.result>"+rollResult.result);

          rollResult.result.match(/(\d+)$/); //計算結果だけ格納
          console.log( "rollResult.result " + rollResult.result + "  calcAns:"+ RegExp.$1);
          
          oneResourceEdit.calcAns = parseInt(RegExp.$1);
        } catch (e) {
          console.error(e);
        }
        console.log( "円柱chkpoint 25");
      }
      console.log( "target:"+oneResourceEdit.target + " operator:"+oneResourceEdit.operator + " command:" + oneResourceEdit.command + " ans:"+oneResourceEdit.calcAns);
      allEditList.push( oneResourceEdit );
    }
    
    eesourceEdit( allEditList , originalMessage);
    return;
  }

  private eesourceEdit( allEditList:ResourceEdit[] ,originalMessage: ChatMessage){
    let text = "";
    for( let edit of allEditList){
/*
      if( edit.detaElm )
      
      
      edit.hitName + '[' + +'＞' + +'] '
      
      console.log( "target:"+test.target + " operator:"+test.operator + " command:" + test.command + " ans:"+test.calcAns);
*/
    }
  }

  
  private sendResultMessage(rollResult: DiceRollResult, originalMessage: ChatMessage) {
    let result: string = rollResult.result;
    let isSecret: boolean = rollResult.isSecret;

    if (result.length < 1) return;
    console.log("result.length:" +result.length);
    result = result.replace(/[＞]/g, s => '→').trim();

    let diceBotMessage: ChatMessageContext = {
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
    let chatTab = ObjectStore.instance.get<ChatTab>(originalMessage.tabIdentifier);
    if (chatTab) chatTab.addMessage(diceBotMessage);
  }

  static diceRollAsync(message: string, gameType: string): Promise<DiceRollResult> {
    return DiceBot.queue.add((async () => {
      try {
        const bcdice = await DiceBot.loader.dynamicLoad(gameType);
        const result = bcdice.eval(message);
        if (result) {
          console.log('diceRoll!!!', result.text);
          console.log('isSecret!!!', result.secret);
          return { result: result.text, isSecret: result.secret };
        }
      } catch (e) {
        console.error(e);
      }
      return { result: '', isSecret: false };
    })());
  }

  static getHelpMessage(gameType: string): Promise<string> {
    return DiceBot.queue.add((async () => {
      let help = '';
      try {
        const bcdice = await DiceBot.loader.dynamicLoad(gameType);
        help = bcdice.HELP_MESSAGE;
      } catch (e) {
        console.error(e);
      }
      return help;
    })());
  }

  // GameObject Lifecycle
  onStoreRemoved() {
    super.onStoreRemoved();
    EventSystem.unregister(this);
  }

}
