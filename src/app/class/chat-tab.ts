import { ChatMessage, ChatMessageContext } from './chat-message';
import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { InnerXml, ObjectSerializer } from './core/synchronize-object/object-serializer';
import { EventSystem } from './core/system';

import { ImageFile } from './core/file-storage/image-file';
import { ImageStorage } from './core/file-storage/image-storage';

import { PeerCursor } from '@udonarium/peer-cursor';
import { Network } from '@udonarium/core/system';
import { PeerContext } from '@udonarium/core/system/network/peer-context';


@SyncObject('chat-tab')
export class ChatTab extends ObjectNode implements InnerXml {
  @SyncVar() name: string = 'タブ';

  @SyncVar() pos_num: number = -1;
  @SyncVar() imageIdentifier: string[] = ['a','b','c','d','e','f','g','h','i','j','k','l'];
  @SyncVar() imageCharactorName: string[] = ['#0','#1','#2','#3','#4','#5','#6','#7','#8','#9','#10','#11'];
  @SyncVar() imageIdentifierZpos: number[] = [0,1,2,3,4,5,6,7,8,9,10,11];

  @SyncVar() count:number = 0;
  @SyncVar() imageIdentifierDummy: string = 'test';//通信開始ために使わなくても書かなきゃだめっぽい後日見直し

//  imageDispFlag: boolean[] = [false,false,false,false,false,false,false,false,false,false,false,false];
  imageDispFlag: boolean[] = [true,true,true,true,true,true,true,true,true,true,true,true];

  get chatMessages(): ChatMessage[] { return <ChatMessage[]>this.children; }

  get imageZposList( ): number[] {
    let ret:number[] = this.imageIdentifierZpos.slice();
    return ret;
  }

  getImageCharactorPos(name:string){
    for (let i = 0; i < this.imageCharactorName.length ; i++) {
      if( name == this.imageCharactorName[i] ){
        return i;
      }
    }
    return -1;
  }

  tachiePosHide( pos :number ){
    this.imageDispFlag[pos] = false;
    console.log( this.imageDispFlag );
  }

  tachiePosIsDisp( pos :number ):boolean{
    return this.imageDispFlag[pos];
  }

  tachieZindex( toppos : number ):number {
    let index = this.imageIdentifierZpos.indexOf( Number(toppos) );
    return index;
  }

  public chatSimpleDispFlag = 0;
  public tachieDispFlag = 1;

  replaceTachieZindex( toppos : number ){
    let index = this.imageIdentifierZpos.indexOf( Number(toppos) );
    if( index >= 0 ){
      this.imageIdentifierZpos.splice(index,1);
      this.imageIdentifierZpos.push( Number(toppos) );
      console.log( 'imageIdentifierZpos = ' + this.imageIdentifierZpos ); 
    }
  }

  private _dispCharctorIcon: boolean = true;
  get dispCharctorIcon(): boolean { return this._dispCharctorIcon; }
  set dispCharctorIcon( flag : boolean) { this._dispCharctorIcon = flag; }

  private _unreadLength: number = 0;
  get unreadLength(): number { return this._unreadLength; }
  get hasUnread(): boolean { return 0 < this.unreadLength; }

  get latestTimeStamp(): number {
    let lastIndex = this.chatMessages.length - 1;
    return lastIndex < 0 ? 0 : this.chatMessages[lastIndex].timestamp;
  }
  
  // ObjectNode Lifecycle
  onChildAdded(child: ObjectNode) {
    super.onChildAdded(child);
    if (child.parent === this && child instanceof ChatMessage && child.isDisplayable) {
      if(this.children.length == 1){ //ログデリート時
        this._unreadLength = 1;
      }else{
        this._unreadLength++;
      }

      if ( child.to != null && child.to !== '') {
        // 秘話時に立ち絵の更新をかけない(処理なし)
      }else{
        //マウスクリック非表示を復帰する
        this.imageDispFlag[child.imagePos] = true;
//        console.log("立ち絵テスト3 this.imageDispFlag[child.imagePos]" + child.imagePos + " / "+this.imageDispFlag[child.imagePos] + ":");
      }

      EventSystem.trigger('MESSAGE_ADDED', { tabIdentifier: this.identifier, messageIdentifier: child.identifier });
    }
  }
  
  addMessage(message: ChatMessageContext): ChatMessage {
    message.tabIdentifier = this.identifier;

    let chat = new ChatMessage();
    for (let key in message) {
      console.log('addMessage:'+key);
      if (key === 'identifier') continue;
      if (key === 'tabIdentifier') continue;
      
      if (key === 'text') {
        chat.value = message[key];
        continue;
      }
      if (message[key] == null || message[key] === '') continue;

      if (key === 'imagePos') {
        if (message['to'] != null && message['to'] !== '') { continue; } // 秘話時に立ち絵の更新をかけない
        this.pos_num = message[key];
        if( 0 <= this.pos_num && this.pos_num < this.imageIdentifier.length ){
           let oldpos = this.getImageCharactorPos(message['name']);
           if( oldpos >= 0 ){ //同名キャラの古い位置を消去
              this.imageIdentifier[oldpos] = '';
              this.imageCharactorName[oldpos] = '';
              this.imageDispFlag[oldpos] = false;
           }
           //非表示コマンド\s
           
           let splitMessage = message['text'].split(/\s+/);
           let hideCommand = null;
           console.log('splitMessage' + splitMessage);
           if( splitMessage ){
             hideCommand = splitMessage[ splitMessage.length -1 ].match(new RegExp('[@＠][HhＨｈ][IiＩｉ][DdＤｄ][EeＥｅ]$'));
             console.log('hideCommand' + hideCommand);
           }
           if( hideCommand ){
             //事前に古い立ち絵は消す処理をしているため処理なし
           }else{
           
             this.imageIdentifier[this.pos_num] = message['imageIdentifier'];
             this.imageCharactorName[this.pos_num] =message['name'];
             this.replaceTachieZindex(this.pos_num);
             this.imageDispFlag[this.pos_num] = true;

             chat.setAttribute(key, message[key]);
           }
           this.imageIdentifierDummy = message['imageIdentifier'];//同期方法が無理やり感がある、後日
           
        }
        continue;
      }

      chat.setAttribute(key, message[key]);
    }
    chat.initialize();
 
    EventSystem.trigger('SEND_MESSAGE', { tabIdentifier: this.identifier, messageIdentifier: chat.identifier });

    EventSystem.trigger('DICE_TABLE_MESSAGE', { tabIdentifier: this.identifier, messageIdentifier: chat.identifier });

    this.appendChild(chat);
    return chat;
  }

  markForRead() {
    this._unreadLength = 0;
  }

  innerXml(): string {
    let xml = '';
    for (let child of this.children) {
      if (child instanceof ChatMessage && !child.isDisplayable) continue;
      xml += ObjectSerializer.instance.toXml(child);
    }
    return xml;
  };
  
  //ChatMessageに入れるか考えたがログ以外に使わないのでここにおく
  messageHtml( isTime : boolean , tabName : string, message : ChatMessage ): string{
    let str :string = '';
    if( message ) {
      
      if( tabName ) str += "[" + tabName + "]";
      
      if( isTime ){
        let date = new Date( message.timestamp );
        str += ( '00' + date.getHours() ).slice( -2 ) + ":" +  ( '00' + date.getMinutes()).slice( -2 ) + "：";
      }
      
      str += "<font color='";
      if( message.messColor ) str += message.messColor.toLowerCase();
      str += "'>";

      str += "<b>";
      if( message.name ) str += message.name;
      str += "</b>";
      
      str += "：";
      if( message.text ) str += message.text;
      str += "</font><br>";
      
      str += '\n';
    }
    return str;
  }

  logHtml( ): string {
    
    let head : string =     
    "<?xml version='1.0' encoding='UTF-8'?>"+'\n'+
    "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>"+'\n'+
    "<html xmlns='http://www.w3.org/1999/xhtml' lang='ja'>"+'\n'+
    "  <head>"+'\n'+
    "    <meta http-equiv='Content-Type' content='text/html; charset=UTF-8' />"+'\n'+
    "    <title>チャットログ：" + this.name + "</title>"+'\n'+
    "  </head>"+'\n'+
    "  <body>"+'\n';

    let last : string =
    ""+'\n'+
    "  </body>"+'\n'+
    "</html>";

    let main : string = "";


    for (let mess of this.chatMessages ) {
      let to = mess.to;
      let from = mess.from;
      let myId = Network.peerContext.id;
      console.log( "from:" + mess.from
                  + " To:" + mess.to + "myId:" + myId);
      if( to ){
        if( ( to != myId) && ( from != myId) ){
          continue;
        }
      }

      main += this.messageHtml( true , '' , mess );
    }
    let str :string = head + main + last;
    
    return str;
  }

  parseInnerXml(element: Element) {
    return super.parseInnerXml(element);
  };
}
