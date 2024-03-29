import { Card } from './card';
import { CardStack } from './card-stack';
import { SyncObject } from './core/synchronize-object/decorator';
import { GameObject } from './core/synchronize-object/game-object';
import { InnerXml, ObjectSerializer } from './core/synchronize-object/object-serializer';
import { ObjectStore } from './core/synchronize-object/object-store';
import { DiceSymbol } from './dice-symbol';
import { GameCharacter } from './game-character';
import { GameTable } from './game-table';
import { GameTableMask } from './game-table-mask';
import { GameTableScratchMask } from './game-table-scratch-mask';

import { RangeArea } from './range';
import { Terrain } from './terrain';
import { TextNote } from './text-note';

import { CutIn } from './cut-in';
import { DiceTable } from './dice-table';

import { ReloadCheck } from '@udonarium/reload-check';


@SyncObject('room')
export class Room extends GameObject implements InnerXml {
  // GameObject Lifecycle
  onStoreAdded() {
    super.onStoreAdded();
    ObjectStore.instance.remove(this); // ObjectStoreには登録しない
  }

  get reloadCheck(): ReloadCheck { return ObjectStore.instance.get<ReloadCheck>('ReloadCheck'); }

  innerXml(): string {
    let xml = '';
    let objects: GameObject[] = [];
    objects = objects.concat(ObjectStore.instance.getObjects(GameTable));
    objects = objects.concat(ObjectStore.instance.getObjects(GameCharacter));
    objects = objects.concat(ObjectStore.instance.getObjects(RangeArea));
    objects = objects.concat(ObjectStore.instance.getObjects(TextNote));
    objects = objects.concat(ObjectStore.instance.getObjects(CardStack));
    objects = objects.concat(ObjectStore.instance.getObjects(Card).filter((obj) => { return obj.parent === null }));
    objects = objects.concat(ObjectStore.instance.getObjects(DiceSymbol));
    objects = objects.concat(ObjectStore.instance.getObjects(CutIn));
    objects = objects.concat(ObjectStore.instance.getObjects(DiceTable));

    for (let object of objects) {
      
      xml += object.toXml();
      
    }
    return xml;
  }

  parseInnerXml(element: Element) {
    let objects: GameObject[] = [];
    objects = objects.concat(ObjectStore.instance.getObjects(GameTable));
    objects = objects.concat(ObjectStore.instance.getObjects(GameTableMask));
    objects = objects.concat(ObjectStore.instance.getObjects(GameTableScratchMask));
    objects = objects.concat(ObjectStore.instance.getObjects(Terrain));
    objects = objects.concat(ObjectStore.instance.getObjects(GameCharacter));
    objects = objects.concat(ObjectStore.instance.getObjects(RangeArea));
    objects = objects.concat(ObjectStore.instance.getObjects(TextNote));
    objects = objects.concat(ObjectStore.instance.getObjects(CardStack));
    objects = objects.concat(ObjectStore.instance.getObjects(Card));
    objects = objects.concat(ObjectStore.instance.getObjects(DiceSymbol));

    objects = objects.concat(ObjectStore.instance.getObjects(CutIn));
    objects = objects.concat(ObjectStore.instance.getObjects(DiceTable));

    let reLoadOk = true;
    reLoadOk = this.reloadCheck.answerCheck();
    if(reLoadOk){
      for (let object of objects) {
        object.destroy();
      }
      for (let i = 0; i < element.children.length; i++) {
        ObjectSerializer.instance.parseXml(element.children[i]);
      }
    }
  }
}
