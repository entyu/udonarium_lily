import { ComponentFactoryResolver, ComponentRef, Injectable, ViewContainerRef } from '@angular/core';
import { DataElement } from '@udonarium/data-element';
import { GameCharacter } from '@udonarium/game-character';
import { StandImageComponent } from 'component/stand-image/stand-image.component';

@Injectable({
  providedIn: 'root'
})
export class StandImageService {

  static defaultParentViewContainerRef: ViewContainerRef;
  static currentStandImageShowing: {} = {};

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver
  ) { }
  
  show(gameCharacter: GameCharacter, standElement: DataElement, color: string=null) {
    let isNewbee = true;
    for (let [identifier, standImageComponentRef] of Object.entries(StandImageService.currentStandImageShowing)) {
      if (!standImageComponentRef) continue;
      const instance = (<ComponentRef<StandImageComponent>>standImageComponentRef).instance;
      if (instance.isVisible && gameCharacter.identifier != identifier) {
        instance.toGhostly();
      } else if (gameCharacter.identifier == identifier && gameCharacter.location.name != 'graveyard') {
        instance.standElement = standElement;
        instance.color = color ? color : gameCharacter.chatPalette.color;
        instance.toFront();
        isNewbee = false;
      } else {
        (<ComponentRef<StandImageComponent>>standImageComponentRef).destroy();
        delete StandImageService.currentStandImageShowing[identifier];
      }
    }
    if (isNewbee) {
      const standImageComponentRef = StandImageService.defaultParentViewContainerRef.createComponent(this.componentFactoryResolver.resolveComponentFactory(StandImageComponent));
      standImageComponentRef.instance.gameCharacter = gameCharacter;
      standImageComponentRef.instance.standElement = standElement;
      standImageComponentRef.instance.color = color ? color : gameCharacter.chatPalette.color;
      StandImageService.currentStandImageShowing[gameCharacter.identifier] = standImageComponentRef;
    }
  }

  farewell(identifier: GameCharacter | string) {
    if (identifier instanceof GameCharacter) identifier = identifier.identifier;
    const standImageComponentRef = StandImageService.currentStandImageShowing[identifier];
    if (standImageComponentRef && standImageComponentRef.instance) {
      standImageComponentRef.instance.isVisible = false;
    }
  }

  destroyAll() {
    for (let [identifier, standImageComponentRef] of Object.entries(StandImageService.currentStandImageShowing)) {
      if (!standImageComponentRef) continue;
      (<ComponentRef<StandImageComponent>>standImageComponentRef).destroy();
      delete StandImageService.currentStandImageShowing[identifier];
    }
  }
}
    
