import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { InnerXml } from './core/synchronize-object/object-serializer';

@SyncObject('dice-roll-table')
export class DiceRollTable extends ObjectNode implements InnerXml {
    @SyncVar() name: string = '';
    @SyncVar() command: string = '';
    @SyncVar() dice: string = '';
    @SyncVar() table: string = '';


}