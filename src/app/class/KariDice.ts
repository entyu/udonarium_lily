import Base from "bcdice/lib/base";
import Result from "bcdice/lib/result";

import { BaseInstance } from "bcdice/lib/internal/types/base";
import { GameSystemInfo } from 'bcdice/lib/bcdice/game_system_list.json';

export default class KariDice extends Base {
  static readonly gameSystemInfo : GameSystemInfo = {
    id: 'KariDice' ,
    name: '仮ダイス' ,
    className: 'KariDice' ,
    sortKey: 'かりたいす'
  };

  static readonly ID = "KariDice";
  static readonly NAME = "仮ダイス";
  static readonly SORT_KEY = "かりたいす";
  static readonly HELP_MESSAGE = `
・KD
ゾロ目かどうかを判定します
`.trim();

  private command: string;
  private commandWithoutRepeat: string;
  private repeat: number;

  static eval(command: string): Result | null {
    return new KariDice(command).eval();
  }

  constructor(command: string, internal?: BaseInstance) {
    const found = command.replace(/^repeat/i,'x').replace(/^rep/i,'x').match(/^x([0-9]+)\s+(.*)/i);
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
    const changeText = commandWithoutRepeat.replace(/^KD/i, "2D6");
    if (repeat > 1) {
      super(`x${repeat} ${changeText}`, internal);
    } else {
      super(changeText, internal);
    }
    this.command = command
    this.commandWithoutRepeat = commandWithoutRepeat;
    this.repeat = repeat;
  }

  eval(): Result | null {
    if (this.commandWithoutRepeat.match(/^KD/i)) {
      return this.custom_dice();
    }
    return super.eval();
  }

  private custom_dice(): Result | null {
    const result = super.eval();
    if (result == null) {
      return null;
    }
    let zorome = 0;
    for (let i = 0; i < this.repeat; i++) {
      const val1 = result.detailedRands[2*i].value;
      const val2 = result.detailedRands[2*i+1].value;
      if (val1 === val2) {
        zorome += 1;
      }
    }

    let zoromeText: string;
    if (this.repeat == 1 && zorome == 1) {
      zoromeText = " ＞ ゾロ目！";
    } else if (zorome >= 1) {
      zoromeText = `\n\n＞ ゾロ目${zorome}個！`;
    } else {
      zoromeText = "";
    }

    let text = result.text + zoromeText;

    return {
      ...result,
      text,
    };
  }
}
