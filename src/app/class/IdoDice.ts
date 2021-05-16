// original version from
// https://gist.github.com/h-mikisato/b5753689483b02b19585365b8ce5940f
// and
// https://github.com/blhsrwznrghfzpr/bcdice-js/blob/extend-samlpe/examples/ts/custom_dicebot.ts


import Base from 'bcdice/lib/base';
import Result from 'bcdice/lib/result';

import { BaseInstance } from 'bcdice/lib/internal/types/base';

export default class IdoDice extends Base {
  static readonly ID = 'IdoDice';
  static readonly NAME = 'イドの証明';
  static readonly SORT_KEY = 'いとのしょうめい';
  static readonly COMMAND_PATTERN = /^S?([+\-(]*\d+|\d+B\d+|C[+\-(]*\d+|choice|D66|(repeat|rep|x)\d+|\d+R\d+|\d+U\d+|BCDiceVersion|ID\d*<=[+\-(]*\d+|RES\([\+\-\d\(\)\/\*CR]+\)|CBR\(\d+,\d+\))/i;
// 下記は標準ダイスのコマンドパターンマッチするように書き加える
/*
  /^S?([+\-(]*\d+|\d+B\d+|C[+\-(]*\d+|choice|D66|(repeat|rep|x)\d+|\d+R\d+|\d+U\d+|BCDiceVersion)/i
*/
  static readonly HELP_MESSAGE = `
・円柱の身内用に作成したカスタムダイス
1d100と目標値による成功度を算出します。

・CoCとは似ていますが判定基準細部が異なります。

・F値(標準96)以上＞ファンブル
・目標値を超える＞失敗
・目標値を以下＞成功
・1/S値(標準1/5)以下＞スペシャル
・C値(標準5)以下＞クリティカル

・専用命令(ID<=x(オプション文字：省略可))
  使用例)技能値200で判定する場合
  ID<=200 :1d100<=200と同じ
  (ID<=200) → 31 → スペシャル
  ■追加文字定義
    Fn：F値nで判定 無指定はn=96扱い
      ID<=200F90
      (ID<=200F90) F90 → 91 → 致命的失敗
    Sn：S値を1/nに変更する 無指定n=5扱い
      ID<=200S3
      (ID<=200S3) S3 → 65 → スペシャル
    Cn：C値をnに変更する 無指定n=5扱い
      ID<=200C10
      (ID<=200C10) C10 → 10 → 決定的成功/スペシャル
    P：パーフェクトオーダー状態S値1/4、C10で判定(S4C10と同じ)
      ID<=200P
      (ID<=200P) S4 C10 → 41 → スペシ ャル
    B：ボスフラグF値100で判定(F100と同じ)
    ID<=200B
    (ID<=200B) F100 → 99 → 成功
    複数種同時定義可能
      ID<=200BC20S3　ボスがC値20S1/3で判定
      (ID<=200BC20S3) S3 C20 F100 → 15 → 決定的成功/スペシャル

・複数判定(IDy<=x(オプション文字：省略可)):オプションは前述の書式と同様

    y回の判定結果を
    C（クリティカル）S（スペシャル）1C（1クリ）F（ファンブル）
    100F（100ファンブル）N（通常成功）X（失敗）で表示

    IDy<=x で目標値xでy回判定
      ID4<=85　　修験律動4人掛け等
      (ID4<=85) → 73,60,12,64 → N,N,S,N

    オプション文字指定例
      ID3<=120PB パフェオボス乱槍
      (ID3<=120PB) S4 C10 F100 → 4,81,21 → C,N,S
`.trim();

  private commandWithoutRepeat: string;

  private dispCommandId: string;
  private dispCommandRes: string;
  private dispCommandCbr: string;

  private repeat: number;
  private option: string;
  private target: number;

  private critical: number;
  private famble: number;
  private special: number;
  private dicenum: number;

  static eval(command: string): Result | null {
    return new IdoDice(command).eval();
  }

  constructor(command: string, internal?: BaseInstance) {
    const found = command.replace(/^repeat/i, 'x').replace(/^rep/i, 'x').match(/^x([0-9]+)\s+(.*)$/i);
    let commandWithoutRepeat: string;
    let repeat: number;
    if (found !== null) {
      repeat = parseInt(found[1], 10);
      if (repeat <= 0) { repeat = 1; }
      commandWithoutRepeat = found[2];
    } else {
      repeat = 1;
      commandWithoutRepeat = command;
    }
    let changeText = '';
// IDxコマンド
    const regExp = /^([S]?)ID(\d*)<=([\d\-\+\*\/\(\)CR]+)(.*)$/i;
    let matchResult = commandWithoutRepeat.match(regExp);
    if ( matchResult ){
      let dicenum = matchResult[2] == '' ? '1' : matchResult[2]; // IDx x省略時は1
      let commandDiceNum = matchResult[2];
      if ( parseInt(dicenum, 10) < 1){
        dicenum = '1';
        commandDiceNum = '';
      }
      changeText = matchResult[1] + dicenum + 'b100<=' + matchResult[3]; // シークレットの場合はSをつけてxb100をロール
      if (repeat > 1) {
        super(`x${repeat} ${changeText}`, internal);
      } else {
        super(changeText, internal);
      }

      console.log('matchResult' + matchResult);
      this.commandWithoutRepeat = commandWithoutRepeat;
      this.repeat = repeat;
      this.dicenum = parseInt(dicenum, 10);
      this.option = matchResult[4].split(/\s/)[0]; // IDx<=n以降のオプション部分切り出し
      this.optionCommand(this.option);
      this.dispCommandId = matchResult[1] + 'ID' + commandDiceNum + '<=';
      return;
    }

// 1d100コマンド
    const regExpD100 = /^([S]?)1d100<=([\d\-\+\*\/\(\)CR]+)(.*)$/i;
    matchResult = commandWithoutRepeat.match(regExpD100);
    if ( matchResult ){
      if ( matchResult[3].split(/\s/)[0] == '' ){// マッチ部分以降が空であるかスペース区切りのコメントかチェック
        console.log('matchResult' + matchResult);

        const dicenum = '1';
        changeText = matchResult[1] + '1d100<=' + matchResult[2];
        if (repeat > 1) {
          super(`x${repeat} ${changeText}`, internal);
        } else {
          super(changeText, internal);
        }

        console.log('matchResult' + matchResult);
        this.commandWithoutRepeat = matchResult[1] + '1d100<=' + matchResult[2];
        this.repeat = repeat;
        this.dicenum = 1;
        this.dispCommandId = '1d100<=';
        return;
      }
    }


// RES(X-Y)コマンド
    const regExpRes = /^([S]?)RES\(([\d\-\+\*\/\(\)CR]+)\)(.*)$/i;
    matchResult = commandWithoutRepeat.match(regExpRes);
    if ( matchResult ){
      if ( matchResult[3].split(/\s/)[0] == '' ){// マッチ部分以降が空であるかスペース区切りのコメントかチェック
        changeText = matchResult[1] + '1d100<=(' + matchResult[2] + ')*5+50';
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

// CBR(X,Y)コマンド
    const regExpCbr = /^([S]?)CBR\((\d+),(\d+)\)(.*)$/i;
    matchResult = commandWithoutRepeat.match(regExpCbr);
    if ( matchResult ){
      if ( matchResult[4].split(/\s/)[0] == '' ){// マッチ部分以降が空であるかスペース区切りのコメントかチェック
        const val1 = parseInt(matchResult[2], 10);
        const val2 = parseInt(matchResult[3], 10);
        const val = val1 < val2 ? val1 : val2;
        changeText = matchResult[1] + '1d100<=' + val;
        console.log('val1:' + val1 + ' val2:' + val2 + ' text:' + changeText);
        if (repeat > 1) {
          super(`x${repeat} ${changeText}`, internal);
        } else {
          super(changeText, internal);
        }
        console.log('matchResult' + matchResult);
        this.commandWithoutRepeat = commandWithoutRepeat;
        this.repeat = repeat;
        this.dispCommandCbr = '1d100<=' + matchResult[2] + ',' + matchResult[3];
        return;
      }
    }

// 専用コマンド不一致の場合通常ダイス
    changeText = commandWithoutRepeat;
    if (repeat > 1) {
      super(`x${repeat} ${changeText}`, internal);
    } else {
      super(changeText, internal);
    }
    this.commandWithoutRepeat = commandWithoutRepeat;
    this.repeat = repeat;
    this.dispCommandId = '';
    return;
  }

  eval(): Result | null {
    if (this.commandWithoutRepeat.match(/^S?ID/i)) {
      return this.chkOptionCommand(this.option) ? this.custom_dice_id() : null;
    }
    if (this.dispCommandId.match(/^1d100<=/i)) {
      return this.custom_dice_d100();
    }
    if (this.commandWithoutRepeat.match(/^S?RES/i)) {
      return this.custom_dice_res();
    }
    if (this.commandWithoutRepeat.match(/^S?CBR/i)) {
      return this.custom_dice_cbr();
    }

    return super.eval();
  }

// オプションコマンドの書式チェック
  private chkOptionCommand(command: string): boolean{
    const optionReplace = command.replace(/P/i, 'S4C10').replace(/S\d+/i, '').replace(/C\d+/i, '').replace(/F\d+|B/i, '');
    return optionReplace == '' ? true : false;
  }

// オプションコマンドの解釈C,F,S倍率を変更
  private optionCommand(command: string): null{
    this.critical = 5;
    this.famble = 96;
    this.special = 5;

    const matchCritical = command.match(/C(\d+)/i);
    if (matchCritical){
      this.critical = parseInt(matchCritical[1], 10);
    }

    const matchFamble = command.match(/F(\d+)/i);
    if (matchFamble){
      this.famble = parseInt(matchFamble[1], 10);
    }

    const matchSpecial = command.match(/S(\d+)/i);
    if (matchSpecial){
      this.special = parseInt(matchSpecial[1], 10);
    }

    const matchBoss = command.match(/B/i);
    if (matchBoss){
      this.famble = 100;
    }

    const matchParfect = command.match(/P/i);
    if (matchParfect){
      this.special = 4;
      this.critical = 10;
    }
    console.log( 'C:' + this.critical + ' F:' + this.famble + ' S:' + this.special);
    return;
  }

// IDn<=xコマンド結果テキスト記述
  private diceResultTextSingleId( diceValue: number[]): string{
    let resultText = '(' + this.dispCommandId.toUpperCase() + this.target + ')';

    if ( this.special != 5){
      resultText += ' S' + this.special;
    }
    if ( this.critical != 5){
      resultText += ' C' + this.critical;
    }
    if ( this.famble != 96){
      resultText += ' F' + this.famble;
    }
    resultText += ' ＞ ';

    if ( diceValue.length == 1){
      resultText += diceValue[0] + ' ＞ ';
      if ( diceValue[0] >= this.famble){
        resultText += '致命的失敗';
      }else if ( diceValue[0] > this.target ){
        resultText += '失敗';
      }else if ( diceValue[0] <= this.critical && diceValue[0] <= (this.target / this.special) ){
        resultText += '決定的成功/スペシャル';
      }else if ( diceValue[0] <= this.critical){
        resultText += '決定的成功';
      }else if ( diceValue[0] <= (this.target / this.special)){
        resultText += 'スペシャル';
      }else{
        resultText += '成功';
      }
    }else{
      for (let i = 0; i < diceValue.length ; i++) {
        if ( i != 0 ){
          resultText += ',';
        }
        resultText += diceValue[i];
      }
      resultText += ' ＞ ';
      for (let i = 0; i < diceValue.length ; i++) {
        if ( i != 0 ){
          resultText += ',';
        }
        if ( diceValue[i] >= 100){
          resultText += '100F';
        }else if ( diceValue[i] >= this.famble){
          resultText += 'F';
        }else if ( diceValue[i] > this.target ){
          resultText += 'X';
        }else if ( diceValue[i] <= 1){
          resultText += '1C';
        }else if ( diceValue[i] <= this.critical){
          resultText += 'C';
        }else if ( diceValue[i] <= (this.target / this.special)){
          resultText += 'S';
        }else{
          resultText += 'N';
        }
      }
    }
    return resultText;
  }

// IDn<=xコマンド結果処理
  private custom_dice_id(): Result | null {
    const result = super.eval();
    if (result == null) {
      return null;
    }
    console.log( 'result:' + result.text);

    // BCDice結果から演算済みの目標値を取り出す
    const target = result.text.match(/b100<=(\d+)/i);
    if ( !target ){ return null; }
    this.target = parseInt( target[1], 10);

    // 書式が特殊なため自力書き出し
    let newResultText = '';
    for (let i = 0; i < this.repeat; i++) {
      const dice: number[] = [];

      // 1リピート分のダイスを取得
      for (let j = 0; j < this.dicenum; j++) {
        dice.push( result.detailedRands[this.dicenum * i + j].value );
      }
      // 結果のテキストを作成
      if ( this.repeat > 1){
        if ( i > 0 ){
          newResultText += '\n\n';
        }
        newResultText += '#' + (i + 1) + '\n' + this.diceResultTextSingleId(dice);
      }else{
        newResultText += this.diceResultTextSingleId(dice);
      }
    }

    const text = newResultText;
    return {
      ...result,
      text,
    };
  }

// 1d100<=xコマンド結果テキスト記述
  private diceResultTextSingleD100( diceValue: number): string{
    let resultText = '(' + this.dispCommandId.toUpperCase() + this.target + ')';

    this.critical = 5;
    this.famble = 96;
    this.special = 5;

    resultText += ' ＞ ' + diceValue + ' ＞ ';
    if ( diceValue >= this.famble){
      resultText += '致命的失敗';
    }else if ( diceValue > this.target ){
      resultText += '失敗';
    }else if ( diceValue <= this.critical && diceValue <= (this.target / this.special) ){
      resultText += '決定的成功/スペシャル';
    }else if ( diceValue <= this.critical){
      resultText += '決定的成功';
    }else if ( diceValue <= (this.target / this.special)){
      resultText += 'スペシャル';
    }else{
      resultText += '成功';
    }
    return resultText;
  }

// 1d100<=xコマンド結果処理
  private custom_dice_d100(): Result | null {
    const result = super.eval();
    if (result == null) {
      return null;
    }
    console.log( 'result:' + result.text);

    // BCDice結果から演算済みの目標値を取り出す
    const target = result.text.match(/1d100<=(\d+)/i);
    if ( !target ){ return null; }
    this.target = parseInt( target[1], 10);
    console.log( 'target:' + target);

    // 自力書き出し
    let newResultText = '';
    for (let i = 0; i < this.repeat; i++) {
      let dice: number;
      dice = result.detailedRands[i].value;
      // 結果のテキストを作成
      if ( this.repeat > 1){
        if ( i > 0 ){
          newResultText += '\n\n';
        }
        newResultText += '#' + (i + 1) + '\n' + this.diceResultTextSingleD100(dice);
      }else{
        newResultText += this.diceResultTextSingleD100(dice);
      }
    }

    const text = newResultText;
    return {
      ...result,
      text,
    };
  }

// RESコマンド結果テキスト記述
  private diceResultTextSingleRes( diceValue: number , target: number): string{
    let resultText: string = '(1D100<=' + target + ')' + ' ＞ ';
    if ( target >= 100 ){
      resultText += '自動成功';
    }else if ( target <= 0 ){
      resultText += '自動失敗';
    }else if ( diceValue <= target ){
      resultText += diceValue + ' ＞ ';
      resultText += '成功';
    }else{
      resultText += diceValue + ' ＞ ';
      resultText += '失敗';
    }
    return resultText;
  }

// RESコマンド結果処理
  private custom_dice_res(): Result | null {
    const result = super.eval();
    if (result == null) {
      return null;
    }
    console.log( 'result:' + result.text);

    // BCDice結果から演算済みの目標値を取り出す
    const target = result.text.match(/1d100<=(\d+)/i);
    if ( !target ){ return null; }
    const targetNum: number = parseInt(target[1], 10);

    let newResultText = '';
    for (let i = 0; i < this.repeat; i++) {
      const value = result.detailedRands[i].value;
      console.log( 'dice value:' + value);

      if ( this.repeat > 1){
        if ( i > 0 ){
          newResultText += '\n\n';
        }
        newResultText += '#' + (i + 1) + '\n' + this.diceResultTextSingleRes(value , targetNum);
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

// CBRコマンド結果テキスト記述
  private diceResultTextSingleCbr( diceValue: number , target: number): string{
    let resultText: string = '(' + this.dispCommandCbr + ')' + ' ＞ ';

    this.target = target;
    this.critical = 5;
    this.special = 5;
    this.famble = 96;

    resultText += diceValue + ' ＞ ';
    if ( diceValue >= this.famble){
      resultText += '致命的失敗';
    }else if ( diceValue > this.target ){
      resultText += '失敗';
    }else if ( diceValue <= this.critical && diceValue <= (this.target / this.special) ){
      resultText += '決定的成功/スペシャル';
    }else if ( diceValue <= this.critical){
      resultText += '決定的成功';
    }else if ( diceValue <= (this.target / this.special)){
      resultText += 'スペシャル';
    }else{
      resultText += '成功';
    }
    return resultText;
  }

// RESコマンド結果処理
  private custom_dice_cbr(): Result | null {
    const result = super.eval();
    if (result == null) {
      return null;
    }
    console.log( 'result:' + result.text);

    // BCDice結果から演算済みの目標値を取り出す
    const target = result.text.match(/1d100<=(\d+)/i);
    if ( !target ){ return null; }
    const targetNum: number = parseInt(target[1], 10);

    let newResultText = '';
    for (let i = 0; i < this.repeat; i++) {
      const value = result.detailedRands[i].value;
      console.log( 'dice value:' + value);

      if ( this.repeat > 1){
        if ( i > 0 ){
          newResultText += '\n\n';
        }
        newResultText += '#' + (i + 1) + '\n' + this.diceResultTextSingleCbr(value , targetNum);
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
