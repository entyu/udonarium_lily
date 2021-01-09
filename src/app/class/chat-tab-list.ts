import { ChatTab } from './chat-tab';
import { SyncObject } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { InnerXml } from './core/synchronize-object/object-serializer';

@SyncObject('chat-tab-list')
export class ChatTabList extends ObjectNode implements InnerXml {
  private static _instance: ChatTabList;
  static get instance(): ChatTabList {
    if (!ChatTabList._instance) {
      ChatTabList._instance = new ChatTabList('ChatTabList');
      ChatTabList._instance.initialize();
    }
    return ChatTabList._instance;
  }

  get chatTabs(): ChatTab[] { return this.children as ChatTab[]; }
  
  //チャット簡易表示フラグ、拡張余地のため整数型
  private simpleDispFlagTime_ : number = 0;
  set simpleDispFlagTime( flag : number ){
    this.simpleDispFlagTime_ = flag;
  }
  
  get simpleDispFlagTime(): number{
    return this.simpleDispFlagTime_;
  }
  
  private simpleDispFlagUserId_ : number = 0;
  set simpleDispFlagUserId(flag : number){
    this.simpleDispFlagUserId_ = flag;
  }
  get simpleDispFlagUserId(): number{
    return this.simpleDispFlagUserId_;
  }
  
  addChatTab(chatTab: ChatTab)
  addChatTab(tabName: string, identifier?: string)
  addChatTab(...args: any[]) {
    let chatTab: ChatTab = null;
    if (args[0] instanceof ChatTab) {
      chatTab = args[0];
    } else {
      let tabName: string = args[0];
      let identifier: string = args[1];
      chatTab = new ChatTab(identifier);
      chatTab.name = tabName;
      chatTab.initialize();
    }
    this.appendChild(chatTab);
  }

  parseInnerXml(element: Element) {
    // XMLからの新規作成を許可せず、既存のオブジェクトを更新する
    for (let child of ChatTabList.instance.children) {
      child.destroy();
    }

    let context = ChatTabList.instance.toContext();
    context.syncData = this.toContext().syncData;
    ChatTabList.instance.apply(context);
    ChatTabList.instance.update();

    super.parseInnerXml.apply(ChatTabList.instance, [element]);
    this.destroy();
  }

  logHtml( ): string {
    
    
    let head : string =     
    "<?xml version='1.0' encoding='UTF-8'?>"+'\n'+
    "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>"+'\n'+
    "<html xmlns='http://www.w3.org/1999/xhtml' lang='ja'>"+'\n'+
    "  <head>"+'\n'+
    "    <meta http-equiv='Content-Type' content='text/html; charset=UTF-8' />"+'\n'+
    "    <title>チャットログ：" + "全タブ" + "</title>"+'\n'+
    "  </head>"+'\n'+
    "  <body>"+'\n';

    let last : string =
    ""+'\n'+
    "  </body>"+'\n'+
    "</html>";

    let main : string = "";
    
    //泥臭くやる
    if( this.chatTabs ){
      let tabNum = this.chatTabs.length;
      let indexList : number[] = [] ;
      console.log( 'tabNum :' + tabNum );
      for( let i = 0 ; i < tabNum ;i++){
        indexList.push(0);
      }
      
      let fastTabIndex : number = null;
      let chkTimestamp : number = null;

      while( 1 ){
        fastTabIndex = -1;
        chkTimestamp = -1;

        for( let i = 0 ; i < tabNum ; i++){
//          console.log( "num:" + tabNum + " length:"+this.chatTabs[i].chatMessages.length  );
          if( this.chatTabs[i].chatMessages.length <= indexList[i] ) continue;

          if( chkTimestamp == -1){
            chkTimestamp = this.chatTabs[i].chatMessages[indexList[i]].timestamp ;
            fastTabIndex = i;
          }
          if( chkTimestamp > this.chatTabs[i].chatMessages[indexList[i]].timestamp ){
            chkTimestamp = this.chatTabs[i].chatMessages[indexList[i]].timestamp;
            fastTabIndex = i;
          }
        }
        if( fastTabIndex == -1)break;
        
//        console.log( 'tab:' + fastTabIndex + ' message :' + indexList[ fastTabIndex ] );
        main += this.chatTabs[ fastTabIndex ].messageHtml( true , this.chatTabs[ fastTabIndex ].name , this.chatTabs[ fastTabIndex ].chatMessages[ indexList[fastTabIndex] ] );
        indexList[ fastTabIndex ] ++;
      }
    }

    let str :string = head + main + last;
    
    return str;
  }



}