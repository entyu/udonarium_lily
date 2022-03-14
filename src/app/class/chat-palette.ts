import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectContext } from './core/synchronize-object/game-object';
import { ObjectNode } from './core/synchronize-object/object-node';
import { StringUtil } from './core/system/util/string-util';
import { DataElement } from './data-element';

export interface PaletteLine {
  palette: string;
}

export interface PaletteIndex {
  name: string;
  line: number;
}

export interface PaletteMatch {
  text: string;
  line: number;
}

export interface PaletteVariable {
  name: string;
  value: string;
}

@SyncObject('chat-palette')
export class ChatPalette extends ObjectNode {
  @SyncVar() dicebot: string = 'DiceBot';
  //TODO: キャラシ項目のコピー

  get paletteLines(): PaletteLine[] {
    if (!this.isAnalized) this.parse(<string> this.value);
    return this._paletteLines;
  }

  get paletteVariables(): PaletteVariable[] {
    if (!this.isAnalized) this.parse(<string> this.value);
    return this._paletteVariables;
  }

  isPaletteIndex( line: string , no: number): PaletteIndex{
    let index: PaletteIndex = {
      name: '',
      line: 0,
    };

    // コマ作成サイト(ユドナリウムのキャラコマを作るやつ様)の標準的な見出し区切りの書式から見出し語を抜き出す
    let matchRes1 = line.match(/^\/\/--[-]+(.*)$/);
    let matchRes2 = line.match(/^◆(.*)$/);
    if (matchRes1){
      index.name = matchRes1[1].replace(/-+$/,'');
      index.line = no;
      return index;
    }

    if (matchRes2){
      index.name = matchRes2[1];
      index.line = no;
      return index;
    }

    return null;
  }

  get paletteIndex(): PaletteIndex[]{
    let count = 0;
    let ret;
    let indexList: PaletteIndex[] = [];
    let palettString = <string> this.value;
    let palettes = palettString.split('\n');

    for (let line of palettes ){
      ret = this.isPaletteIndex(line, count);
      if (ret){
        indexList.push(ret);
      }
      count++;
    }
    return indexList;
  }

  paletteMatch(text: string): string[]{
    let count = 0;
    let matchList: string[] = [];

    let palettString = <string> this.value;
    let palettes = palettString.split('\n');

    for (let line of palettes ){
      if (line.indexOf(text) >= 0){
        matchList.push(line);
      }
      count++;
    }
    return matchList;
  }

  paletteMatchLine(text: string ,nth :number): number{
    let matchCount = 0;
    let lineNo = 0;
    let palettString = <string> this.value;
    let palettes = palettString.split('\n');

    for (let line of palettes ){
      if (line.indexOf(text) >= 0){
        if(matchCount == nth){
          return lineNo;
        }
        matchCount++;
      }
      lineNo++;
    }
    return -1;
  }

  private _palettes: string[] = [];
  private _paletteLines: PaletteLine[] = [];
  private _paletteVariables: PaletteVariable[] = [];
  private isAnalized: boolean = false;

  getPalette(): string[] {
    if (!this.isAnalized) this.parse(<string> this.value);
    return this._palettes;
  }

  setPalette(paletteSource: string) {
    this.value = paletteSource;
    this.isAnalized = false;
  }

  evaluate(line: PaletteLine, extendVariables?: DataElement): string
  evaluate(line: string, extendVariables?: DataElement): string
  evaluate(line: any, extendVariables?: DataElement): string {
    let evaluate: string = '';
    if (typeof line === 'string') {
      evaluate = line;
    } else {
      evaluate = line.palette;
    }

    console.log(evaluate);
    let limit = 128;
    let loop = 0;
    let isContinue = true;
    while (isContinue) {
      loop++;
      isContinue = false;
      evaluate = evaluate.replace(/[{｛]\s*([^{}｛｝]+)\s*[}｝]/g, (match, name) => {
        name = StringUtil.toHalfWidth(name);
        console.log(name);
        isContinue = true;
        for (let variable of this.paletteVariables) {
          if (variable.name == name) return variable.value;
        }
        if (extendVariables) {
          let element = extendVariables.getFirstElementByName(name);
          if (element) return element.isNumberResource ? element.currentValue + '' : element.value + '';
        }
        return '';
      });
      if (limit < loop) isContinue = false;
    }
    return evaluate;
  }

  private parse(paletteSource: string) {
    this._palettes = paletteSource.split('\n');

    this._paletteLines = [];
    this._paletteVariables = [];

    for (let palette of this._palettes) {
      let variable = this.parseVariable(palette);
      if (variable) {
        this._paletteVariables.push(variable);
        continue;
      }
      let line: PaletteLine = { palette: palette };
      this._paletteLines.push(line);
    }
    this.isAnalized = true;
  }

  private parseVariable(palette: string): PaletteVariable {
    let array = /^\s*[/／]{2}([^=＝{}｛｝\s]+)\s*[=＝]\s*(.+)\s*/gi.exec(palette);
    if (!array) return null;
    let variable: PaletteVariable = {
      name: StringUtil.toHalfWidth(array[1]),
      value: array[2]
    }
    return variable;
  }

  // override
  apply(context: ObjectContext) {
    super.apply(context);
    this.isAnalized = false;
  }
}

@SyncObject('buff-palette')
export class BuffPalette extends ChatPalette {
}


@SyncObject('dice-table-palette')
export class DiceTablePalette extends ChatPalette {
}
