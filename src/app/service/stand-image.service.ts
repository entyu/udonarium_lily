import { ComponentFactoryResolver, Injectable, ViewContainerRef } from '@angular/core';
import { DataElement } from '@udonarium/data-element';
import { GameCharacter } from '@udonarium/game-character';
import { StandImageComponent } from 'component/stand-image/stand-image.component';

@Injectable({
  providedIn: 'root'
})
export class StandImageService {

  static defaultParentViewContainerRef: ViewContainerRef;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver
  ) { }
  
  show(gameCharacter: GameCharacter, standElement: DataElement) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(StandImageComponent);
    let standImageComponentRef = StandImageService.defaultParentViewContainerRef.createComponent(componentFactory);
    standImageComponentRef.instance.gameCharacter = gameCharacter;
    standImageComponentRef.instance.standElement = standElement;
    return standImageComponentRef;
  }
}
    
