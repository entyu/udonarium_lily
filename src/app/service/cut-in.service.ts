import { ComponentFactoryResolver, ComponentRef, Injectable, ViewContainerRef } from '@angular/core';
import { CutIn } from '@udonarium/cut-in';
import { CutInComponent } from 'component/cut-in/cut-in.component';

@Injectable({
  providedIn: 'root'
})
export class CutInService {

  static defaultParentViewContainerRef: ViewContainerRef;
  static cutInComponentRefQueue: ComponentRef<CutInComponent>[] = [];

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver
  ) { }
  
  play(cutIn: CutIn, isSecret=false, isTest=false) {
    if (!cutIn) return;
    for (const cutInComponentRef of CutInService.cutInComponentRefQueue) {
      if (cutInComponentRef && cutInComponentRef.instance) {
        const cutInComponent = cutInComponentRef.instance;
        if (cutInComponent.isEnd) {
          cutInComponentRef.destroy();
        } else if (cutInComponent.cutIn) {
          const tmp = cutInComponent.cutIn;
          if (cutIn.identifier === tmp.identifier || (cutIn.tag != null && cutIn.tag.trim() != '' && tmp.tag != null && tmp.tag.trim() != '' && cutIn.tag.trim() == tmp.tag.trim())) {
            cutInComponent.stop();
          }
        }
      }
    }
    CutInService.cutInComponentRefQueue = CutInService.cutInComponentRefQueue.filter(cutInComponentRef => cutInComponentRef && cutInComponentRef.instance);
    const nowCutInComponentRef = CutInService.defaultParentViewContainerRef.createComponent(this.componentFactoryResolver.resolveComponentFactory(CutInComponent));
    nowCutInComponentRef.instance.cutIn = cutIn;
    nowCutInComponentRef.instance.isSecret = isSecret;
    nowCutInComponentRef.instance.isTest = isTest;
    nowCutInComponentRef.instance.play();
    CutInService.cutInComponentRefQueue.push(nowCutInComponentRef);
  }

  stop(cutIn: CutIn) {
    if (!cutIn) return;
    for (const cutInComponentRef of CutInService.cutInComponentRefQueue) {
      if (cutInComponentRef && cutInComponentRef.instance) {
        const cutInComponent = cutInComponentRef.instance;
        if (cutInComponent.isEnd) {
          cutInComponentRef.destroy();
        } else if (cutInComponent.cutIn) {
          if (cutIn.identifier === cutInComponent.cutIn.identifier) {
            cutInComponent.stop();
          }
        }
      }
    }
    CutInService.cutInComponentRefQueue = CutInService.cutInComponentRefQueue.filter(cutInComponentRef => cutInComponentRef && cutInComponentRef.instance);
  }
}
