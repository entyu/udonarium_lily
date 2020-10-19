import { ImageFile } from './core/file-storage/image-file';
import { ImageStorage } from './core/file-storage/image-storage';
import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { DataElement } from './data-element';
import { GameCharacter } from './game-character';

export enum StandConditionType {
    Default,
    Postfix,
    Image,
    PostfixOrImage,
    PostfixAndImage,
    NotConditionStandUp
}

@SyncObject('stand-list')
export class StandList extends DataElement {
  @SyncVar() position = 0;
  @SyncVar() height = 30;

  get standElements(): DataElement[] {
    return this.getElementsByName('stand');
  }

  add() {
    let imageFile = null;
    let standElement = DataElement.create('stand');
    if (this.parent instanceof GameCharacter) {
      imageFile = this.parent.imageFile
    }
    if (!imageFile || imageFile == ImageFile.Empty) {
      let fileContext = ImageFile.createEmpty('stand_no_image').toContext();
      fileContext.url = './assets/images/nc96424.png';
      imageFile = ImageStorage.instance.add(fileContext);
    }
    standElement.appendChild(DataElement.create('name', '', { }, 'name_' + standElement.identifier));
    standElement.appendChild(DataElement.create('imageIdentifier', imageFile.identifier, { type: 'image' }, 'imageIdentifier_' + standElement.identifier));
    standElement.appendChild(DataElement.create('conditionType', StandConditionType.Default, { }, 'conditionType_' + standElement.identifier));
    standElement.appendChild(DataElement.create('height', 0, { }, 'height_' + standElement.identifier));
    standElement.appendChild(DataElement.create('applyImageEffect', '', { }, 'applyImageEffect_' + standElement.identifier));
    standElement.appendChild(DataElement.create('postfix', '', { }, 'postfix_' + standElement.identifier));
    standElement.appendChild(DataElement.create('position', 0, { 'currentValue': '' }, 'position_' + standElement.identifier));
    this.appendChild(standElement);
  }

  remove(stand: DataElement) {
    this.removeChild(stand);
  }
}
