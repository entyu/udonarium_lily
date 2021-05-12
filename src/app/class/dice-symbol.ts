import { ImageFile } from './core/file-storage/image-file';
import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { Network } from './core/system';
import { DataElement } from './data-element';
import { PeerCursor } from './peer-cursor';
import { TabletopObject } from './tabletop-object';

export enum DiceType {
  D2,
  D4,
  D6,
  D8,
  D10,
  D10_10TIMES,
  D12,
  D20
}

@SyncObject('dice-symbol')
export class DiceSymbol extends TabletopObject {
  @SyncVar() face: string = '0';
  @SyncVar() owner: string = '';
  @SyncVar() rotate: number = 0;
  @SyncVar() isDropShadow: boolean = true;
  @SyncVar() isLock: boolean = false;
  
  get name(): string { return this.getCommonValue('name', ''); }
  set name(name: string) { this.setCommonValue('name', name); }
  get size(): number { return this.getCommonValue('size', 1); }
  set size(size: number) { this.setCommonValue('size', size); }

  get faces(): string[] { return this.imageDataElement.children.filter(element => (element as DataElement).currentValue != 'nothing').map(element => (element as DataElement).name); }
  get imageFile(): ImageFile {
    return this.isVisible ?
      this.getImageFile(this.face)
      : this.faces.length
        ? this.getImageFile(this.faces[0])
        : null;
  }
  get backFaceImageFile(): ImageFile {
    if (!this.isCoin) return this.imageFile;
    return this.isVisible ?
    this.getImageFile(this.face == '表' ? '裏' : '表')
    : this.getImageFile(this.faces[1])
  }
  get nothingFaces(): string[] { return this.imageDataElement.children.filter(element => (element as DataElement).currentValue == 'nothing').map(element => (element as DataElement).name); }

  get ownerName(): string {
    let object = PeerCursor.findByUserId(this.owner);
    return object ? object.name : '';
  }

  get ownerColor(): string {
    let object = PeerCursor.findByUserId(this.owner);
    return object ? object.color : '#444444';
  }
  
  get hasOwner(): boolean { return 0 < this.owner.length; }
  get isMine(): boolean { return Network.peerContext.userId === this.owner; }
  get isVisible(): boolean { return !this.hasOwner || this.isMine; }
  get isCoin(): boolean { return this.faces.length === 2; }

  diceRoll(): string {
    let faces = this.faces;
    this.face = 0 < faces.length ? faces[Math.floor(Math.random() * faces.length)] : '';
    return this.face;
  }

  setDicetype(type: DiceType) {
    this.makeDiceFace(type);
  }

  private makeDiceFace(type: DiceType, identifierSuffix?: string): DataElement[] {
    let sided: number = 1;
    let faces: DataElement[] = [];
    let faceGeneratorFunc: (index: number) => string = index => (index + 1) + '';

    switch (type) {
      case DiceType.D2:
        sided = 2;
        faceGeneratorFunc = index => (index === 0) ? '表' : '裏';
        break;
      case DiceType.D4:
        sided = 4;
        break;
      case DiceType.D6:
        sided = 6;
        let identifier = identifierSuffix != null ? 'nothing_' + identifierSuffix : null;
        faces.push(DataElement.create('なし', '', { type: 'image', currentValue: 'nothing' }, identifier));
        break;
      case DiceType.D8:
        sided = 8;
        break;
      case DiceType.D10_10TIMES:
        faceGeneratorFunc = index => (index + 1) + '0';
      case DiceType.D10:
        sided = 10;
        break;
      case DiceType.D12:
        sided = 12;
        break;
      case DiceType.D20:
        sided = 20;
        break;
      default:
        sided = 2;
        break;
    }

    for (let i = 0; i < sided; i++) {
      let faceName = faceGeneratorFunc(i);
      let identifier = identifierSuffix != null ? faceName + '_' + identifierSuffix : null;
      faces.push(DataElement.create(faceName, '', { type: 'image' }, identifier));
    }

    this.imageDataElement.children.forEach(element => element.destroy());
    faces.forEach(element => this.imageDataElement.appendChild(element));
    this.face = this.faces[0];

    return faces;
  }

  static create(name: string, type: DiceType, size: number, identifier?: string): DiceSymbol {
    let object: DiceSymbol = identifier ? new DiceSymbol(identifier) : new DiceSymbol();

    object.createDataElements();
    object.commonDataElement.appendChild(DataElement.create('name', name, {}, 'name_' + object.identifier));
    object.commonDataElement.appendChild(DataElement.create('size', size, {}, 'size_' + object.identifier));

    object.makeDiceFace(type, object.identifier);
    object.initialize();
    return object;
  }
}
