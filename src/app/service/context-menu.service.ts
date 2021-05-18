import { ComponentFactoryResolver, ComponentRef, Injectable, ViewContainerRef } from '@angular/core';
import { TabletopObject } from '@udonarium/tabletop-object';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { PeerCursor } from '@udonarium/peer-cursor';

interface ContextMenuPoint {
  x: number,
  y: number
}

export enum ContextMenuType {
  ACTION = 'action',
  SEPARATOR = 'separator',
}

export const ContextMenuSeparator: ContextMenuAction = {
  name: '',
  disabled: true,
  type: ContextMenuType.SEPARATOR
}

export interface ContextMenuAction {
  name: string,
  action?: Function,
  disabled?: boolean,
  type?: ContextMenuType,
  subActions?: ContextMenuAction[],
  altitudeHande?: TabletopObject,
  default?: boolean,
  icon?: ImageFile,
  error?: string,
  materialIcon?: string,
  isOuterLink?: boolean,
  selfOnly?: boolean
}

@Injectable()
export class ContextMenuService {
  /* Todo */
  static defaultParentViewContainerRef: ViewContainerRef;
  static ContextMenuComponentClass: { new(...args: any[]): any } = null;

  private panelComponentRef: ComponentRef<any>

  title: string = '';
  actions: ContextMenuAction[] = [];
  position: ContextMenuPoint = { x: 0, y: 0 };
  titleColor: string = PeerCursor.CHAT_DEFAULT_COLOR;
  titleBold: boolean = false;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver
  ) { }

  get isShow(): boolean {
    return this.panelComponentRef ? true : false;
  }

  open(position: ContextMenuPoint, actions: ContextMenuAction[], title?: string, parentViewContainerRef?: ViewContainerRef, titleColor?: string, titleBold?: boolean) {
    this.close();
    if (!parentViewContainerRef) {
      parentViewContainerRef = ContextMenuService.defaultParentViewContainerRef;
      console.log('Context Open');
    }
    let panelComponentRef: ComponentRef<any>;

    const injector = parentViewContainerRef.injector;
    const panelComponentFactory = this.componentFactoryResolver.resolveComponentFactory(ContextMenuService.ContextMenuComponentClass);

    panelComponentRef = parentViewContainerRef.createComponent(panelComponentFactory, parentViewContainerRef.length, injector);

    const childPanelService: ContextMenuService = panelComponentRef.injector.get(ContextMenuService);

    childPanelService.panelComponentRef = panelComponentRef;
    if (actions) {
      childPanelService.actions = actions;
    }
    if (position) {
      childPanelService.position.x = position.x;
      childPanelService.position.y = position.y;
    }
    if (titleColor) {
      childPanelService.titleColor = titleColor;
    } else {
      childPanelService.titleColor = PeerCursor.CHAT_DEFAULT_COLOR;
    }
    childPanelService.titleBold = titleBold;

    childPanelService.title = title != null ? title : '';

    panelComponentRef.onDestroy(() => {
      childPanelService.panelComponentRef = null;
    });
  }

  close() {
    if (this.panelComponentRef) {
      this.panelComponentRef.destroy();
      this.panelComponentRef = null;
    }
  }
}