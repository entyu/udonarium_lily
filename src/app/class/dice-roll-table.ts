import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { StringUtil } from './core/system/util/string-util';

export interface DiceRollTableRow {
  range: { start: number, end: number },
  result: string
}
@SyncObject('dice-roll-table')
export class DiceRollTable extends ObjectNode {
  @SyncVar() name: string = '';
  @SyncVar() command: string = '';
  @SyncVar() dice: string = '';

  parseText(): DiceRollTableRow[] {
    if (!this.value) return [];
    return (<string>this.value).split(/[\r\n]+/).map(row => {
      row = row.trim();
      let match = null;
      if (match = row.match(/([\d０-９]+)[\s　]*[\-―－~～][\s　]*([\d０-９]+)[\s　]*[:：](.+)/)) {
        const start = +StringUtil.toHalfWidth(match[1]);
        const end = +StringUtil.toHalfWidth(match[2]);
        if (start <= end) {
          return {range: { start: start, end: end }, result: match[3]};
        } else {
          return {range: { start: end, end: start }, result: match[3]};
        }
      } else if (match = row.match(/([\d０-９]+)[\s　]*[:：](.+)/)) {
        const num = +StringUtil.toHalfWidth(match[1]);
        return {range: { start: num, end: num }, result: match[2]};
      } else {
        return null;
      }
    }).filter(elm => elm);
  }
}