import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectContext } from './core/synchronize-object/game-object';
import { ObjectNode } from './core/synchronize-object/object-node';
import { StringUtil } from './core/system/util/string-util';

import { DataElement } from './data-element';
import { PeerCursor } from './peer-cursor';

export interface PaletteLine {
  palette: string;
}

export interface PaletteVariable {
  name: string;
  value: string;
}

@SyncObject('chat-palette')
export class ChatPalette extends ObjectNode {
  @SyncVar() dicebot: string = '';
  @SyncVar() paletteColor: string = '';
  //TODO: キャラシ項目のコピー

  get color() {
    if (this.paletteColor && this.paletteColor != '#ffffff') {
      return this.paletteColor;
    }
    if (window.localStorage 
      && localStorage.getItem(PeerCursor.CHAT_MY_COLOR_LOCAL_STORAGE_KEY) 
      && localStorage.getItem(PeerCursor.CHAT_MY_COLOR_LOCAL_STORAGE_KEY) != '#ffffff') {
      return localStorage.getItem(PeerCursor.CHAT_MY_COLOR_LOCAL_STORAGE_KEY);
    }
    return PeerCursor.CHAT_DEFAULT_COLOR;
  }
  set color(color: string) {
    this.paletteColor = color;
  }

  get paletteLines(): PaletteLine[] {
    if (!this.isAnalized) this.parse(<string>this.value);
    return this._paletteLines;
  }

  get paletteVariables(): PaletteVariable[] {
    if (!this.isAnalized) this.parse(<string>this.value);
    return this._paletteVariables;
  }

  private _palettes: string[] = [];
  private _paletteLines: PaletteLine[] = [];
  private _paletteVariables: PaletteVariable[] = [];
  private isAnalized: boolean = false;

  getPalette(): string[] {
    if (!this.isAnalized) this.parse(<string>this.value);
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
        //name = StringUtil.toHalfWidth(name).toLocaleLowerCase();
        let ret: number|string = '';
        for (let variable of this.paletteVariables) {
          if (variable.name == name) ret = variable.value;
        }
        if (extendVariables) {
          let element = extendVariables.getFirstElementByName(name);
          if (element) {
            ret = element.isNumberResource ? element.currentValue
              : element.isCheckProperty ? (element.currentValue + '').split(/[|｜]/g)[ element.value ? 0 : 1 ]
              : element.isAbilityScore ? element.calcAbilityScore()
              : element.value;
            if (ret == null) ret = '';
          } else {
            if ((
              element = extendVariables.getFirstElementByName(name.replace(/^最大/, ''))
              || extendVariables.getFirstElementByName(name.replace(/^Max[\:\_\-\s]?/i, ''))
              || extendVariables.getFirstElementByName(name.replace(/^基本/, ''))
              || extendVariables.getFirstElementByName(name.replace(/^初期/, ''))
              || extendVariables.getFirstElementByName(name.replace(/^原/, ''))
              || extendVariables.getFirstElementByName(name.replace(/基本値$/, ''))
              || extendVariables.getFirstElementByName(name.replace(/初期値$/, ''))
              || extendVariables.getFirstElementByName(name.replace(/原点$/, ''))
            ) && (element.isNumberResource || element.isAbilityScore)) {
              ret = element.value;
            }
            if ((element = extendVariables.getFirstElementByName(name.replace(/修正値?$/, ''))
              || extendVariables.getFirstElementByName(name.replace(/\s*Mod(ifier|\.)?$/i, ''))
              || extendVariables.getFirstElementByName(name.replace(/ボーナス$/, ''))
            ) && element.isAbilityScore) {
              ret = element.calcAbilityScore();
            }
          }
          return ret + '';
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
