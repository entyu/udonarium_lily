import Base from "bcdice/lib/base";
import Result from "bcdice/lib/result";

import { BaseInstance } from "bcdice/lib/internal/types/base";

export default class IdoDice extends Base {
  static readonly ID = "IdoDice";
  static readonly NAME = "イドの証明";
  static readonly SORT_KEY = "いとのしょうめい";
  static readonly COMMAND_PATTERN = /^S?([+\-(]*\d+|\d+B\d+|C[+\-(]*\d+|choice|D66|(repeat|rep|x)\d+|\d+R\d+|\d+U\d+|BCDiceVersion|ID\d*<=[+\-(]*\d+|RES\([\+\-\d\(\)\/\*CR]+\)|CBR\(\d+,\d+\))/i;
/*
// 下記は標準ダイスのコマンドパターンマッチするように書き加える
  /^S?([+\-(]*\d+|\d+B\d+|C[+\-(]*\d+|choice|D66|(repeat|rep|x)\d+|\d+R\d+|\d+U\d+|BCDiceVersion)/i
*/
  static readonly HELP_MESSAGE = `
・専用命令(ID<=x(追加文字))
  使用例 ）技能値200で判定する場合
  ID<=200（1d100<=200と同じ）
  (ID<=200) → 31 → スペシャル
  ■追加文字定義
    Fx：F値xで判定
      ID<=200F90
      (ID<=200F90) F90 → 91 → 致命的失敗
    Sx：S値を1/xに変更する
      ID<=200S3
      (ID<=200S3) S3 → 65 → スペシャル
    Cx：C値をxに変更する
      ID<=200C10
      (ID<=200C10) C10 → 10 → 決定的成功/スペシャル
    P：パーフェクトオーダーS値1/4、C10で判定(S4C10と同じ)
      ID<=200P
      (ID<=200P) S4 C10 → 41 → スペシ ャル
    B：ボスフラグF値100で判定(F100と同じ)
    ID<=200B
    (ID<=200B) F100 → 99 → 成功
    複数種同時定義可能
      ID<=200BC20S3　ボスがC値20S1/3で判定
      (ID<=200BC20S3) S3 C20 F100 → 15 → 決定的成功/スペシャル

  ■複数判定
    複数回の判定結果を
    C（クリティカル）S（スペシャル）1C（1クリ）F（ファンブル）
    100F（100ファンブル）N（通常成功）X（失敗）で表示

    IDn<=x　で目標値xでn回判定
      ID4<=85　　修験律動4人掛け等
      (ID4<=85) 目標値85 判定数4 → 73,60,12,64 → N,N,S,N

    追加文字定義可能
      ID3<=120PB パフェオボス乱槍
      (ID3<=120PB) S4 C10 F100 目標値120 判定数3 → 4,81,21 → C,N,S
`.trim();

  private command: string;
  private commandWithoutRepeat: string;
  private preCommand: string;
  private repeat: number;
  private option: string;
  private target: number;

  private cbrValue1: string;
  private cbrValue2: string;

  private critical: number;
  private famble: number;
  private special: number;
  private dicenum: number;

  static eval(command: string): Result | null {
    return new IdoDice(command).eval();
  }

  constructor(command: string, internal?: BaseInstance) {
    const found = command.replace(/^repeat/i,'x').replace(/^rep/i,'x').match(/^x([0-9]+)\s+(.*)$/i);
    let commandWithoutRepeat: string;
    let repeat: number;
    if (found !== null) {
      repeat = parseInt(found[1]);
      if (repeat <= 0) { repeat = 1; }
      commandWithoutRepeat = found[2];
    } else {
      repeat = 1;
      commandWithoutRepeat = command;
    }

    const regExp = /^([S]?)ID(\d*)<=([\d\-\+\*\/\(\)CR]+)(.*)$/i;
    let matchResult = commandWithoutRepeat.match(regExp);
    if( matchResult ){
      if( matchResult[4].split(/\s/)[0] == '' ){
        const dicenum = matchResult[2] == ''? '1' : matchResult[2];
        const changeText = matchResult[1] + dicenum + 'b100<=' + matchResult[3];
        if (repeat > 1) {
          super(`x${repeat} ${changeText}`, internal);
        } else {
          super(changeText, internal);
        }

        console.log('matchResult' + matchResult);
        this.command = command
        this.commandWithoutRepeat = commandWithoutRepeat;
        this.repeat = repeat;
        this.dicenum = parseInt(dicenum,10);
        this.option = matchResult[4].split(/\s/)[0];
        this.optionCommand(this.option);
        this.preCommand = matchResult? matchResult[1] + 'ID' + matchResult[2] + '<=' : '';
        return;
      }
    }

    const regExpRes = /^([S]?)RES\(([\d\-\+\*\/\(\)CR]+)\)(.*)$/i;
    matchResult = commandWithoutRepeat.match(regExpRes);
    if( matchResult ){
      if( matchResult[3].split(/\s/)[0] == '' ){
        const changeText = matchResult[1] + '1d100<=(' + matchResult[2] + ')*5+50';
        if (repeat > 1) {
          super(`x${repeat} ${changeText}`, internal);
        } else {
          super(changeText, internal);
        }
        console.log('matchResult' + matchResult);
        this.commandWithoutRepeat = commandWithoutRepeat;
        this.repeat = repeat;
        return;
      }
    }

    const regExpCbr = /^([S]?)CBR\((\d+),(\d+)\)(.*)$/i;
    matchResult = commandWithoutRepeat.match(regExpCbr);
    if( matchResult ){
      if( matchResult[4].split(/\s/)[0] == '' ){
        const val1 = parseInt(matchResult[2],10);
        const val2 = parseInt(matchResult[3],10);
        const val = val1 < val2? val1 :val2;
        const changeText = matchResult[1] + '1d100<=' + val;
        console.log('val1:'+val1+' val2:'+val2 + ' text:' + changeText);
        if (repeat > 1) {
          super(`x${repeat} ${changeText}`, internal);
        } else {
          super(changeText, internal);
        }
        console.log('matchResult' + matchResult);
        this.commandWithoutRepeat = commandWithoutRepeat;
        this.repeat = repeat;
        this.cbrValue1 = matchResult[2];
        this.cbrValue2 = matchResult[3];
        return;
      }
    }

    const changeText = commandWithoutRepeat;
    if (repeat > 1) {
      super(`x${repeat} ${changeText}`, internal);
    } else {
      super(changeText, internal);
    }
    this.commandWithoutRepeat = commandWithoutRepeat;
    this.repeat = repeat;
    return;
  }

  eval(): Result | null {
    if (this.commandWithoutRepeat.match(/^S?ID/i)) {
      return this.chkOptionCommand(this.option)? this.custom_dice(): null;
    }
    if (this.commandWithoutRepeat.match(/^S?RES/i)) {
      return this.custom_dice_res();
    }
    if (this.commandWithoutRepeat.match(/^S?CBR/i)) {
      return this.custom_dice_cbr();
    }

    return super.eval();
  }

  private chkOptionCommand(command: string):boolean{
    const optionReplace = command.replace(/C\d+/i,'').replace(/S\d+|P/i,'').replace(/F\d+|B/i,'');
    return optionReplace == ''? true: false;
  }

  private optionCommand(command: string){
    this.critical = 5;
    this.famble = 96;
    this.special = 5;

    const matchCritical = command.match(/C(\d+)/i);
    if(matchCritical){
      this.critical = parseInt(matchCritical[1],10);
    }

    const matchFamble = command.match(/F(\d+)/i);
    if(matchFamble){
      this.famble = parseInt(matchFamble[1],10);
    }

    const matchSpecial = command.match(/S(\d+)/i);
    if(matchSpecial){
      this.special = parseInt(matchSpecial[1],10);
    }

    const matchBoss = command.match(/B/i);
    if(matchBoss){
      this.famble = 100;
    }

    const matchParfect = command.match(/P/i);
    if(matchParfect){
      this.special = 4;
    }
    console.log( 'C:' + this.critical + ' F:' + this.famble + ' S:' + this.special);
  }

  private diceResultTextSingle( diceValue :number[]): string{
    let resultText = '(' + this.preCommand.toUpperCase() + this.target +')';
    if( this.special != 5){
      resultText += ' S'+this.special;
    }
    if( this.critical != 5){
      resultText += ' C'+this.critical;
    }
    if( this.famble != 96){
      resultText += ' F'+this.famble;
    }
    resultText += ' ＞ ';
    
    if( diceValue.length == 1){
      resultText += diceValue[0] + ' ＞ ';
      if( diceValue[0] >= this.famble){
        resultText += '致命的失敗';
      }else if( diceValue[0] > this.target ){
        resultText += '失敗';
      }else if( diceValue[0] <= this.critical && diceValue[0] <= (this.target / this.special) ){
        resultText += '決定的成功/スペシャル';
      }else if( diceValue[0] <= this.critical){
        resultText += '決定的成功';
      }else if( diceValue[0] <= (this.target / this.special)){
        resultText += 'スペシャル';
      }else{
        resultText += '成功';
      }
    }else{
      for (let i = 0; i < diceValue.length ; i++) {
        if( i != 0 ){
          resultText += ',';
        }
        resultText += diceValue[i];
      }
      resultText += ' ＞ ';
      for (let i = 0; i < diceValue.length ; i++) {
        if( i != 0 ){
          resultText += ',';
        }
        if( diceValue[i] >= 100){
          resultText += '100F';
        }else if( diceValue[i] >= this.famble){
          resultText += 'F';
        }else if( diceValue[i] > this.target ){
          resultText += 'X';
        }else if( diceValue[i] <= 1){
          resultText += '1C';
        }else if( diceValue[i] <= this.critical){
          resultText += 'C';
        }else if( diceValue[i] <= (this.target / this.special)){
          resultText += 'S';
        }else{
          resultText += 'N';
        }
      }
    }
    return resultText;
  }

  private custom_dice(): Result | null {
    const result = super.eval();
    if (result == null) {
      return null;
    }
    console.log( 'result:' + result.text);

    let target = result.text.match(/B100<=(\d+)/i);
    if( !target ){ return null;}
    this.target = parseInt( target[1],10);
    let newResultText: string = '';
    for (let i = 0; i < this.repeat; i++) {
      let dice :number[] = [];
      for (let j = 0; j < this.dicenum; j++) {
        dice.push( result.detailedRands[this.dicenum*i+j].value );
      }
      if( this.repeat > 1){
        if( i > 0 ){
          newResultText += '\n\n';
        }
        newResultText += '#' + (i+1) + '\n' + this.diceResultTextSingle(dice);
      }else{
        newResultText += this.diceResultTextSingle(dice);
      }
    }

    const text = newResultText;
    return {
      ...result,
      text,
    };
  }

  private diceResultTextSingleRes( diceValue :number , target :number): string{
    let resultText:string = '(1d100<=' + target + ')' + ' ＞ ';
    resultText += diceValue + ' ＞ ';
    if( target >= 100 ){
      resultText += '自動成功';
    }else if( target <= 0 ){
      resultText += '自動失敗';
    }else if( diceValue <= target ){
      resultText += '成功';
    }else{
      resultText += '失敗';
    }
    return resultText;
  }

  private custom_dice_res(): Result | null {
    const result = super.eval();
    if (result == null) {
      return null;
    }
    console.log( 'result:' + result.text);

    const target = result.text.match(/1d100<=(\d+)/i);
    if( !target ){ return null;}
    const targetNum: number= parseInt(target[1],10);

    let newResultText: string = '';
    for (let i = 0; i < this.repeat; i++) {
      const value = result.detailedRands[i].value;
      console.log( 'dice value:' + value);

      if( this.repeat > 1){
        if( i > 0 ){
          newResultText += '\n\n';
        }
        newResultText += '#' + (i+1) + '\n' + this.diceResultTextSingleRes(value , targetNum);
      }else{
        newResultText += this.diceResultTextSingleRes(value , targetNum);
      }
    }

    const text = newResultText;
    return {
      ...result,
      text,
    };
  }

  private diceResultTextSingleCbr( diceValue :number , target :number): string{
    let resultText:string = '(1d100<=' + this.cbrValue1 + ',' + this.cbrValue2 + ')' + ' ＞ ';

    this.target = target;
    this.critical = 5;
    this.special = 5;
    this.famble = 96;

    resultText += diceValue + ' ＞ ';
    if( diceValue >= this.famble){
      resultText += '致命的失敗';
    }else if( diceValue > this.target ){
      resultText += '失敗';
    }else if( diceValue <= this.critical && diceValue <= (this.target / this.special) ){
      resultText += '決定的成功/スペシャル';
    }else if( diceValue <= this.critical){
      resultText += '決定的成功';
    }else if( diceValue <= (this.target / this.special)){
      resultText += 'スペシャル';
    }else{
      resultText += '成功';
    }
    return resultText;
  }

  private custom_dice_cbr(): Result | null {
    const result = super.eval();
    if (result == null) {
      return null;
    }
    console.log( 'result:' + result.text);

    const target = result.text.match(/1d100<=(\d+)/i);
    if( !target ){ return null;}
    const targetNum: number= parseInt(target[1],10);

    let newResultText: string = '';
    for (let i = 0; i < this.repeat; i++) {
      const value = result.detailedRands[i].value;
      console.log( 'dice value:' + value);

      if( this.repeat > 1){
        if( i > 0 ){
          newResultText += '\n\n';
        }
        newResultText += '#' + (i+1) + '\n' + this.diceResultTextSingleCbr(value , targetNum);
      }else{
        newResultText += this.diceResultTextSingleCbr(value , targetNum);
      }
    }

    const text = newResultText;
    return {
      ...result,
      text,
    };
  }

}
