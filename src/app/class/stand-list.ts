import { ImageFile } from './core/file-storage/image-file';
import { ImageStorage } from './core/file-storage/image-storage';
import { SyncObject } from './core/synchronize-object/decorator';
import { DataElement } from './data-element';

export enum StandConditionType {
    Default,
    Postfix,
    Image,
    PostfixOrImage,
    PostfixAndImage
}

@SyncObject('stand-list')
export class StandList extends DataElement {
    
  get stands(): DataElement[] {
    return this.getElementsByName('stand');
  }

  add() {
    let standElement = DataElement.create('stand');
    let fileContext = ImageFile.createEmpty('stand_no_image').toContext();
    fileContext.url = './assets/images/nc96424.png';
    let noImageFile = ImageStorage.instance.add(fileContext);

    standElement.appendChild(DataElement.create('imageIdentifier', noImageFile.identifier, { type: 'image' }, 'imageIdentifier_' + standElement.identifier));
    standElement.appendChild(DataElement.create('conditionType', StandConditionType.Default, { }, 'conditionType_' + standElement.identifier));
    standElement.appendChild(DataElement.create('postfix', '', { }, 'postfix_' + standElement.identifier));
    standElement.appendChild(DataElement.create('targetImageIdentifier', '', { }, 'targetImageIdentifier_' + standElement.identifier));
    standElement.appendChild(DataElement.create('position', 0, { type: 'numberResource', 'currentValue': '100' }, 'position_' + standElement.identifier));
    this.appendChild(standElement);
  }

  remove(stand: DataElement) {
    this.removeChild(stand);
  }
}
