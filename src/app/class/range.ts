import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { DataElement } from './data-element';
import { TabletopObject } from './tabletop-object';

@SyncObject('range')
export class Range extends TabletopObject {
  @SyncVar() isLock: boolean = false;
  @SyncVar() rotate: number = 0;

  get name(): string { return this.getCommonValue('name', ''); }
  get range(): number { return this.getCommonValue('range', 1); }
  get width(): number { return this.getCommonValue('width', 1); }
  get opacity(): number {
    let element = this.getElement('opacity', this.commonDataElement);
    let num = element ? <number>element.currentValue / <number>element.value : 1;
    return Number.isNaN(num) ? 1 : num;
  }

  static create(name: string, width: number, height: number, opacity: number, identifier?: string): Range {
    let object: Range = null;

    if (identifier) {
      object = new Range(identifier);
    } else {
      object = new Range();
    }
    object.createDataElements();

    object.commonDataElement.appendChild(DataElement.create('name', name, {}, 'name_' + object.identifier));
    object.commonDataElement.appendChild(DataElement.create('range', height, {}, 'range_' + object.identifier));
    object.commonDataElement.appendChild(DataElement.create('width', width, {}, 'width_' + object.identifier));
    object.commonDataElement.appendChild(DataElement.create('opacity', opacity, { type: 'numberResource', currentValue: opacity }, 'opacity_' + object.identifier));
    object.initialize();

    return object;
  }
}
