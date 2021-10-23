import { Attributes } from './core/synchronize-object/attributes';
import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';

@SyncObject('data')
export class DataElement extends ObjectNode {
  @SyncVar() name: string;
  @SyncVar() type: string;
  @SyncVar() currentValue: number | string;

  get isSimpleNumber(): boolean { return this.type != null && this.type === 'simpleNumber'; }
  get isNumberResource(): boolean { return this.type != null && this.type === 'numberResource'; }
  get isCheckProperty(): boolean { return this.type != null && this.type === 'checkProperty'; }
  get isNote(): boolean { return this.type != null && this.type === 'note'; }
  get isAbilityScore(): boolean { return this.type != null && this.type === 'abilityScore'; }
  get isUrl(): boolean { return this.type != null && this.type === 'url'; }

  public static create(name: string, value: number | string = '', attributes: Attributes = {}, identifier: string = ''): DataElement {
    let dataElement: DataElement;
    if (identifier && 0 < identifier.length) {
      dataElement = new DataElement(identifier);
    } else {
      dataElement = new DataElement();
    }
    dataElement.attributes = attributes;
    dataElement.name = name;
    dataElement.value = value;
    dataElement.initialize();

    return dataElement;
  }

  getElementsByName(name: string): DataElement[] {
    let children: DataElement[] = [];
    for (let child of this.children) {
      if (child instanceof DataElement) {
        if (child.getAttribute('name') === name) children.push(child);
        Array.prototype.push.apply(children, child.getElementsByName(name));
      }
    }
    return children;
  }

  getElementsByType(type: string): DataElement[] {
    let children: DataElement[] = [];
    for (let child of this.children) {
      if (child instanceof DataElement) {
        if (child.getAttribute('type') === type) children.push(child);
        Array.prototype.push.apply(children, child.getElementsByType(type));
      }
    }
    return children;
  }

  getFirstElementByName(name: string): DataElement {
    for (let child of this.children) {
      if (child instanceof DataElement) {
        if (child.getAttribute('name') === name) return child;
        let match = child.getFirstElementByName(name);
        if (match) return match;
      }
    }
    return null;
  }

  calcAbilityScore(): number {
    if (!this.isAbilityScore || !this.value) return 0;
    let match;
    if (match = this.currentValue.toString().match(/^div(\d+)$/)) {
      return Math.floor(+this.value / +match[1]);
    // 現状3.0以降のみ
    } else if (match = this.currentValue.toString().match(/^DnD/)) {
      return Math.floor((+this.value - 10) / 2);
    } else {
      return +this.value;
    }
  }
}
