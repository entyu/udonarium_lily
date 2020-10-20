import { ComponentFactoryResolver, ComponentRef, Injectable, ViewContainerRef } from '@angular/core';
import { DataElement } from '@udonarium/data-element';
import { GameCharacter } from '@udonarium/game-character';
import { StandImageComponent } from 'component/stand-image/stand-image.component';

@Injectable({
  providedIn: 'root'
})
export class StandImageService {

  static defaultParentViewContainerRef: ViewContainerRef;
  static CurrentStandImageShowing: {} = {};

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver
  ) { }
  
  show(gameCharacter: GameCharacter, standElement: DataElement, color: string=null) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(StandImageComponent);
    if (StandImageService.CurrentStandImageShowing[gameCharacter.identifier]) {
      StandImageService.CurrentStandImageShowing[gameCharacter.identifier].destroy();
      delete StandImageService.CurrentStandImageShowing[gameCharacter.identifier];
    }
    if (gameCharacter.location.name != 'graveyard') {
      for (let [key, value] of Object.entries(StandImageService.CurrentStandImageShowing)) {
        if (value) {
          (<ComponentRef<StandImageComponent>>value).instance.toGhostly();
        }
      }
      let standImageComponentRef = StandImageService.defaultParentViewContainerRef.createComponent(componentFactory);
      standImageComponentRef.instance.gameCharacter = gameCharacter;
      standImageComponentRef.instance.standElement = standElement;
      standImageComponentRef.instance.color = color ? color : gameCharacter.chatPalette.color;
      StandImageService.CurrentStandImageShowing[gameCharacter.identifier] = standImageComponentRef;
    }
    //return standImageComponentRef;
  }
}
    
