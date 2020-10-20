import { ImageFile } from './core/file-storage/image-file';
import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { DataElement } from './data-element';

export enum StandConditionType {
    Default = 1,
    Postfix = 2,
    Image = 3,
    PostfixOrImage = 4,
    PostfixAndImage = 5,
    NotConditionStandUp = 6
}

@SyncObject('stand-list')
export class StandList extends DataElement {
  @SyncVar() position = 5;
  @SyncVar() height = 35;

  get standElements(): DataElement[] {
    return this.getElementsByName('stand');
  }

  add(identifier: string) {
    let condition = this.getFirstElementByName('stand') ? StandConditionType.NotConditionStandUp : StandConditionType.Default;
    let standElement = DataElement.create('stand');
    standElement.appendChild(DataElement.create('name', '', { }, 'name_' + standElement.identifier));
    standElement.appendChild(DataElement.create('imageIdentifier', identifier && identifier != ImageFile.Empty.identifier ? identifier : 'stand_no_image', { type: 'image' }, 'imageIdentifier_' + standElement.identifier));
    standElement.appendChild(DataElement.create('conditionType', condition, { }, 'conditionType_' + standElement.identifier));
    standElement.appendChild(DataElement.create('height', 0, { }, 'height_' + standElement.identifier));
    standElement.appendChild(DataElement.create('applyImageEffect', '', { }, 'applyImageEffect_' + standElement.identifier));
    standElement.appendChild(DataElement.create('applyRoll', '', { }, 'applyRoll_' + standElement.identifier));
    standElement.appendChild(DataElement.create('postfix', '', { }, 'postfix_' + standElement.identifier));
    standElement.appendChild(DataElement.create('position', 0, { 'currentValue': '' }, 'position_' + standElement.identifier));
    this.appendChild(standElement);
  }

  remove(stand: DataElement) {
    this.removeChild(stand);
  }
}
