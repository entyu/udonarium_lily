import { ComponentFactoryResolver, ComponentRef, Injectable, ViewContainerRef } from '@angular/core';
import { StringUtil } from '@udonarium/core/system/util/string-util';
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
  
  static nowShowingIdentifiers(): string[] {
    return this.cutInComponentRefQueue
      .filter(cutInComponentRef => cutInComponentRef && cutInComponentRef.instance && cutInComponentRef.instance.cutIn && cutInComponentRef.instance.isVisible)
      .map(cutInComponentRef => cutInComponentRef.instance.cutIn.identifier);
  }

  play(cutIn: CutIn, isSecret=false, isTest=false, sender: string=null) {
    if (!cutIn) return;
    for (const cutInComponentRef of CutInService.cutInComponentRefQueue) {
      if (cutInComponentRef && cutInComponentRef.instance) {
        const cutInComponent = cutInComponentRef.instance;
        if (cutInComponent.isEnd) {
          cutInComponentRef.destroy();
        } else {
          const tmp = cutInComponent.cutIn;
          if (cutIn.identifier === tmp.identifier || (!!cutIn.videoId && !!tmp.videoId) ||　(cutIn.tag != null && cutIn.tag.trim() != '' && tmp.tag != null && tmp.tag.trim() != '' && StringUtil.toHalfWidth(cutIn.tag).toUpperCase().trim() == StringUtil.toHalfWidth(tmp.tag).toUpperCase().trim())) {
            cutInComponent.stop();
          }
        }
      }
    }
    CutInService.cutInComponentRefQueue = CutInService.cutInComponentRefQueue.filter(cutInComponentRef => cutInComponentRef && cutInComponentRef.instance);
    const nowCutInComponentRef = CutInService.defaultParentViewContainerRef.createComponent(this.componentFactoryResolver.resolveComponentFactory(CutInComponent));
    nowCutInComponentRef.instance.cutIn = cutIn;
    nowCutInComponentRef.instance.animationType = cutIn.animationType;
    nowCutInComponentRef.instance.videoId = cutIn.videoId;
    nowCutInComponentRef.instance.playListId = cutIn.playListId;
    nowCutInComponentRef.instance.isSecret = isSecret;
    nowCutInComponentRef.instance.isTest = isTest;
    nowCutInComponentRef.instance.sender = sender;
    nowCutInComponentRef.instance.play();
    CutInService.cutInComponentRefQueue.push(nowCutInComponentRef);
  }

  stop(cutIn: CutIn | string) {
    if (!cutIn) return;
    if (cutIn instanceof CutIn) cutIn = cutIn.identifier;
    for (const cutInComponentRef of CutInService.cutInComponentRefQueue) {
      if (cutInComponentRef && cutInComponentRef.instance) {
        const cutInComponent = cutInComponentRef.instance;
        if (cutInComponent.isEnd) {
          cutInComponentRef.destroy();
        } else {
          if (cutIn === cutInComponent.cutIn.identifier) {
            cutInComponent.stop();
          }
        }
      }
    }
    CutInService.cutInComponentRefQueue = CutInService.cutInComponentRefQueue.filter(cutInComponentRef => cutInComponentRef && cutInComponentRef.instance);
  }
}
