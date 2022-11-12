import { ChatPalette,BuffPalette } from './chat-palette';

import { ImageFile } from './core/file-storage/image-file';
import { ImageStorage } from './core/file-storage/image-storage';
import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { DataElement } from './data-element';
import { TabletopObject } from './tabletop-object';

//import { GameObjectInventoryService } from 'service/game-object-inventory.service';
import { ObjectStore } from './core/synchronize-object/object-store';

@SyncObject('character')
export class GameCharacter extends TabletopObject {
  @SyncVar() isLock: boolean = false;

  @SyncVar() rotate: number = 0;
  @SyncVar() roll: number = 0;

  @SyncVar() hideInventory: boolean = false;
  @SyncVar() nonTalkFlag: boolean = false;
  @SyncVar() overViewWidth: number = 270;
  @SyncVar() overViewMaxHeight: number = 250;

  @SyncVar() specifyKomaImageFlag: boolean = false;
  @SyncVar() komaImageHeignt: number = 100;

  @SyncVar() chatColorCode: string[]  = ["#000000","#FF0000","#0099FF"];
  @SyncVar() syncDummyCounter: number = 0;

  _targeted: boolean = false;
  get targeted(): boolean {
    return this._targeted;
  }
  set targeted( flag: boolean) {
    this._targeted = flag;
  }

  _selectedTachieNum: number = 0;
  get selectedTachieNum(): number {
    if( this._selectedTachieNum > ( this.imageDataElement.children.length - 1) ){
      this._selectedTachieNum = this.imageDataElement.children.length - 1;
    }
    if( this._selectedTachieNum < 0 ){
      this._selectedTachieNum = 0;
    }

    return this._selectedTachieNum;
  }

  set selectedTachieNum(num : number){
    console.log("set selectedTachieNum NUM=" + num +" len" + this.imageDataElement.children.length);

    if( num > ( this.imageDataElement.children.length - 1 ) ){
      num = this.imageDataElement.children.length - 1;
    }
    if( num < 0 ){
      num = 0;
    }
    this._selectedTachieNum = num
    console.log("set selectedTachieNum" + this._selectedTachieNum);

  }

  private getIconNumElement(): DataElement {
    const iconNum = this.detailDataElement.getFirstElementByName('ICON');
    if (!iconNum || !iconNum.isNumberResource) return null;
    return iconNum;
  }

  get imageFile(): ImageFile {
    if (!this.imageDataElement) return ImageFile.Empty;

    const iconNum = this.getIconNumElement();
    if (!iconNum) {
      const image: DataElement = this.imageDataElement.getFirstElementByName('imageIdentifier');
      const file = ImageStorage.instance.get(<string>image.value);
      return file ? file : ImageFile.Empty;
    } else {
      let n = <number>iconNum.currentValue;
      if (n > this.imageDataElement.children.length - 1) n = this.imageDataElement.children.length - 1;
      const image = this.imageDataElement.children[n];
      const file = ImageStorage.instance.get(<string>image.value);
      return file ? file : ImageFile.Empty;
    }
  }

  get name(): string { return this.getCommonValue('name', ''); }
  get size(): number { return this.getCommonValue('size', 1); }

  get chatPalette(): ChatPalette {
    for (let child of this.children) {
      if (child instanceof ChatPalette) return child;
    }
    return null;
  }

  set name(value:string) { this.setCommonValue('name', value); }

  TestExec() {
    console.log('TestExec');

  }
  get remoteController(): BuffPalette {
    for (let child of this.children) {
      if (child instanceof BuffPalette){
        return child;
      }
    }
    return null;
  }

  static create(name: string, size: number, imageIdentifier: string ): GameCharacter {
    let gameCharacter: GameCharacter = new GameCharacter();
    gameCharacter.createDataElements();
    gameCharacter.initialize();

    gameCharacter.createTestGameDataElement(name, size, imageIdentifier);

    return gameCharacter;
  }

  addExtendData(){

    this.addBuffDataElement();

    let istachie = this.detailDataElement.getElementsByName('立ち絵位置');
    if( istachie.length == 0 ){
      let testElement: DataElement = DataElement.create('立ち絵位置', '', {}, '立ち絵位置' + this.identifier);
      this.detailDataElement.appendChild(testElement);
      testElement.appendChild(DataElement.create('POS', 11, { 'type': 'numberResource', 'currentValue': '0' }, 'POS_' + this.identifier));
    }

    let iconNum = this.detailDataElement.getElementsByName('コマ画像');
    if( iconNum.length == 0 ){
      let elementKoma: DataElement = DataElement.create('コマ画像', '', {}, 'コマ画像' + this.identifier);
      this.detailDataElement.appendChild(elementKoma);

      //コマ画像作成時は立ち絵の次に差し込み
      let tachies = this.detailDataElement.getElementsByName('立ち絵位置');
      if( tachies.length != 0 ){
        let parentElement = tachies[0].parent;
        let index: number = parentElement.children.indexOf(tachies[0]);
        console.log("立ち絵の次に差し込み INdex" + index);
        if (index < parentElement.children.length - 1) {
          let nextElement = parentElement.children[index + 1];
          console.log("立ち絵の次に差し込み nextElement" + nextElement);
          
          parentElement.insertBefore(elementKoma, nextElement);
        }
      }
      elementKoma.appendChild(DataElement.create(
        'ICON',
        this.imageDataElement.children.length - 1,
        { 'type': 'numberResource', 'currentValue': 0 },
        'ICON_' + this.identifier
      ));
    }

    let isbuff = this.buffDataElement.getElementsByName('バフ/デバフ');
    if( isbuff.length == 0 ){
      let buffElement: DataElement = DataElement.create('バフ/デバフ', '', {}, 'バフ/デバフ' + this.identifier);
      this.buffDataElement.appendChild(buffElement);
    }
    if( this.remoteController == null){
      let controller: BuffPalette = new BuffPalette('RemotController_' + this.identifier);
      controller.setPalette(`コントローラ入力例：
マッスルベアー DB+2 3
クリティカルレイ A 18
セイクリッドウェポン 命+1攻+2 18`);
      controller.initialize();
      this.appendChild(controller);
    }
  }

  clone() :this {
    let cloneObject = super.clone();

    let objectname:string;
    let reg = new RegExp('^(.*)_([0-9]+)$');
    let res = cloneObject.name.match(reg);

    let cloneNumber:number = 0;
    if(res != null && res.length == 3) {
      objectname = res[1];
      cloneNumber = parseInt(res[2]) + 1;
    } else {
      objectname = cloneObject.name ;
      cloneNumber = 2;
    }

    let list = ObjectStore.instance.getObjects(GameCharacter);
    for (let character of list ) {
      if( character.location.name == 'graveyard' ) continue;

      res = character.name.match(reg);
      if(res != null && res.length == 3 && res[1] == objectname) {
        let numberChk = parseInt(res[2]) + 1 ;
        if( cloneNumber <= numberChk ){
          cloneNumber = numberChk
        }
      }
    }

    cloneObject.name = objectname + '_' + cloneNumber;
    cloneObject.update();

    return cloneObject;

  }

  createTestGameDataElement(name: string, size: number, imageIdentifier: string) {
    this.createDataElements();

    let nameElement: DataElement = DataElement.create('name', name, {}, 'name_' + this.identifier);
    let sizeElement: DataElement = DataElement.create('size', size, {}, 'size_' + this.identifier);

    if (this.imageDataElement.getFirstElementByName('imageIdentifier')) {
      this.imageDataElement.getFirstElementByName('imageIdentifier').value = imageIdentifier;
    }

    let resourceElement: DataElement = DataElement.create('リソース', '', {}, 'リソース' + this.identifier);
    let hpElement: DataElement = DataElement.create('HP', 200, { 'type': 'numberResource', 'currentValue': '200' }, 'HP_' + this.identifier);
    let mpElement: DataElement = DataElement.create('MP', 100, { 'type': 'numberResource', 'currentValue': '100' }, 'MP_' + this.identifier);
//    let sanElement: DataElement = DataElement.create('SAN', 60, { 'type': 'numberResource', 'currentValue': '48' }, 'SAN_' + this.identifier);

    this.commonDataElement.appendChild(nameElement);
    this.commonDataElement.appendChild(sizeElement);

    this.detailDataElement.appendChild(resourceElement);
    resourceElement.appendChild(hpElement);
    resourceElement.appendChild(mpElement);
//    resourceElement.appendChild(sanElement);

    //TEST
    let testElement: DataElement = DataElement.create('情報', '', {}, '情報' + this.identifier);
    this.detailDataElement.appendChild(testElement);
    testElement.appendChild(DataElement.create('説明', 'ここに説明を書く\nあいうえお', { 'type': 'note' }, '説明' + this.identifier));
    testElement.appendChild(DataElement.create('メモ', '任意の文字列\n１\n２\n３\n４\n５', { 'type': 'note' }, 'メモ' + this.identifier));

    //TEST
    testElement = DataElement.create('能力', '', {}, '能力' + this.identifier);
    this.detailDataElement.appendChild(testElement);
    testElement.appendChild(DataElement.create('器用度', 24, {}, '器用度' + this.identifier));
    testElement.appendChild(DataElement.create('敏捷度', 24, {}, '敏捷度' + this.identifier));
    testElement.appendChild(DataElement.create('筋力', 24, {}, '筋力' + this.identifier));
    testElement.appendChild(DataElement.create('生命力', 24, {}, '生命力' + this.identifier));
    testElement.appendChild(DataElement.create('知力', 24, {}, '知力' + this.identifier));
    testElement.appendChild(DataElement.create('精神力', 24, {}, '精神力' + this.identifier));

    //TEST
    testElement = DataElement.create('戦闘特技', '', {}, '戦闘特技' + this.identifier);
    this.detailDataElement.appendChild(testElement);
    testElement.appendChild(DataElement.create('Lv1', '全力攻撃', {}, 'Lv1' + this.identifier));
    testElement.appendChild(DataElement.create('Lv3', '武器習熟/ソード', {}, 'Lv3' + this.identifier));
    testElement.appendChild(DataElement.create('Lv5', '武器習熟/ソードⅡ', {}, 'Lv5' + this.identifier));
    testElement.appendChild(DataElement.create('Lv7', '頑強', {}, 'Lv7' + this.identifier));
    testElement.appendChild(DataElement.create('Lv9', '薙ぎ払い', {}, 'Lv9' + this.identifier));
    testElement.appendChild(DataElement.create('自動', '治癒適正', {}, '自動' + this.identifier));

    //
    let domParser: DOMParser = new DOMParser();
    let gameCharacterXMLDocument: Document = domParser.parseFromString(this.rootDataElement.toXml(), 'application/xml');

    let palette: ChatPalette = new ChatPalette('ChatPalette_' + this.identifier);
    palette.setPalette(`チャットパレット入力例：
2d6+1 ダイスロール
１ｄ２０＋{敏捷}＋｛格闘｝　{name}の格闘！

自己バフ、リソース操作コマンド例：
&マッスルベアー/筋B+2/3
:MP-3
&マッスルベアー/筋B+2/3:MP-3

//敏捷=10+{敏捷A}
//敏捷A=10
//格闘＝１`);
    palette.initialize();
    this.appendChild(palette);

    this.addExtendData();
  }


  createTestGameDataElementExtendSample(name: string, size: number, imageIdentifier: string) {
    this.createDataElements();

    let nameElement: DataElement = DataElement.create('name', name, {}, 'name_' + this.identifier);
    let sizeElement: DataElement = DataElement.create('size', size, {}, 'size_' + this.identifier);

    if (this.imageDataElement.getFirstElementByName('imageIdentifier')) {
      this.imageDataElement.getFirstElementByName('imageIdentifier').value = imageIdentifier;
    }

//    let resourceElement: DataElement = DataElement.create('リソース', '', {}, 'リソース' + this.identifier);
//    let hpElement: DataElement = DataElement.create('HP', 200, { 'type': 'numberResource', 'currentValue': '200' }, 'HP_' + this.identifier);
//    let mpElement: DataElement = DataElement.create('MP', 100, { 'type': 'numberResource', 'currentValue': '100' }, 'MP_' + this.identifier);

    this.commonDataElement.appendChild(nameElement);
    this.commonDataElement.appendChild(sizeElement);

//    this.detailDataElement.appendChild(resourceElement);
//    resourceElement.appendChild(hpElement);
//    resourceElement.appendChild(mpElement);

    //TEST
    let testElement: DataElement = DataElement.create('情報', '', {}, '情報' + this.identifier);
    this.detailDataElement.appendChild(testElement);
    testElement.appendChild(DataElement.create('説明',
`このキャラクターはキャラクターBの補助用のコマを作るときのサンプルです。
まず、このキャラクターはキャラクターシートの設定で「テーブルインベントリ非表示」「発言をしない」のチェックが入っています。
このように設定したキャラクターは「非表示」で足元のサークルの色が青に変わり、テーブルインベントリやリリィ追加機能のカウンターリモコンに表示されなくなります。
戦闘非参加キャラを立ち絵やコマのためにテーブルに出したい場合に使用できます。
また、プロフ等の追加情報を表示するためのコマ等、発言が不要な場合、「発言をしない」のチェックを入れることでチャットタブ等のリストに表示されなくなります。
部位数が10あるモンスターの駒を出したけど頭だけ喋ればいい、等の場合に使います。このチェックをONにするとコマの上のキャラ名が白地に黒文字に変わります。
次に、ポップアップのサイズ設定です。リリィではキャラクターシートからポップアップの横幅、最大縦幅を変更可能な様に拡張しています。
これで遊ぶ仲間が許してくれれば、数千文字のプロフィールを書いても大丈夫です。\n
なお、ポップアップする項目の設定は インベントリ＞設定＞表示項目 で行います。
リリィでは説明のため初期の項目に情報をに追加しているので、情報の子項目のこの文章である「説明」と「持ち物」が表示されています。
定義されていても持っていない項目は表示されないのでこのコマからはHPや能力値を削っています。
ゲームごとに使いやすいように使ってください。
`, { 'type': 'note' }, '説明' + this.identifier));
    testElement.appendChild(DataElement.create('持ち物',
`こういった文章も見やすくなります。
アイテム1：3個　効果〇〇
アイテム2：3個　効果パーティ内一人のHPをXXする
アイテム3：3個　効果敵一人の魔法を△する
アイテム4：3個　効果A
アイテム5：3個　効果B`,
 { 'type': 'note' }, '持ち物' + this.identifier));

    let domParser: DOMParser = new DOMParser();
    let gameCharacterXMLDocument: Document = domParser.parseFromString(this.rootDataElement.toXml(), 'application/xml');

    let palette: ChatPalette = new ChatPalette('ChatPalette_' + this.identifier);
    palette.setPalette(`チャットパレット入力例：
2d6+1 ダイスロール
１ｄ２０＋{敏捷}＋｛格闘｝　{name}の格闘！
//敏捷=10+{敏捷A}
//敏捷A=10
//格闘＝１`);
    palette.initialize();
    this.appendChild(palette);
    this.addExtendData();
  }

  deleteBuff(name: string):boolean{
    if (this.buffDataElement.children){
      const dataElm = this.buffDataElement.children[0];
      const data = (dataElm as DataElement).getFirstElementByName(name);
      if(!data)return false;
      data.destroy();
      return true;
    }
    return false;
  }

  decreaseBuffRound(){
    if (this.buffDataElement.children){
      const dataElm = this.buffDataElement.children[0];
      for (const data  of dataElm.children){
        let oldNumS = '';
        let sum: number;
        oldNumS = (data.value as string);
        sum = parseInt(oldNumS);
        sum = sum - 1;
        data.value = sum;
      }
    }
  }

  increaseBuffRound(){
    if (this.buffDataElement.children){
      const dataElm = this.buffDataElement.children[0];
      for (const data  of dataElm.children){
        let oldNumS = '';
        let sum: number;
        oldNumS = (data.value as string);
        sum = parseInt(oldNumS);
        sum = sum + 1;
        data.value = sum;
      }
    }
  }

  deleteZeroRoundBuff(){
    if (this.buffDataElement.children){
      const dataElm = this.buffDataElement.children[0];
      for (const data  of dataElm.children){
        let oldNumS = '';
        let num: number;
        oldNumS = (data.value as string);
        num = parseInt(oldNumS);
        if ( num <= 0){
        data.destroy();
        }
      }
    }
  }

  addBuffRound(name: string, _info?: string , _round?: number){
    let info = '';
    let round = 3;
    if(_info ){
      info = _info;
    }
    if(_round != null){
      round = _round;
    }
    if(this.buffDataElement.children){
      let dataElm = this.buffDataElement.children[0];
      let data = this.buffDataElement.getFirstElementByName( name );
      if ( data ){
        data.value = round;
        data.currentValue = info;
      }else{
        dataElm.appendChild(DataElement.create(name, round , { type: 'numberResource', currentValue: info }, ));
      }
    }
  }


  chkChangeStatusName(name: string): boolean{
    const data = this.detailDataElement.getFirstElementByName(name);
    if(!data)return false;
    if(data.type == 'numberResource'){ return true;}
    if(data.type == ''){ return true;}
    if(data.type == 'note'){ return true;}
    return false;
  }

  chkChangeStatus(name: string, nowOrMax: string): boolean{
    const data = this.detailDataElement.getFirstElementByName(name);
    if(!data)return false;
    if(data.type == 'numberResource'){
      if(nowOrMax == 'now' || nowOrMax =='max'){
        return true;
      }
    }else if(data.type == ''){
      if(nowOrMax == 'now'){
        return true;
      }
    }else if(data.type == 'note'){
      if(nowOrMax == 'now'){
        return true;
      }
    }
    return false;
  }

  getStatusType(name: string, nowOrMax: string): string{
    let type = '';
    const data = this.detailDataElement.getFirstElementByName(name);
    if(!data)return null;
    
    if(data.type == 'numberResource'){
      if(nowOrMax == 'now'){
        type = 'currentValue';
      }else if(nowOrMax == 'max'){
        type = 'value';
      }
    }else if(data.type == ''){
      if(nowOrMax == 'now'){
        type = 'value';
      }else{
        return null;
      }
    }else{
      return null;
    }
    return type;
  }

  getStatusTextType(name: string): string{
    let type = '';
    const data = this.detailDataElement.getFirstElementByName(name);
    if(!data)return null;
    
    if(data.type == 'numberResource'){
      type = 'currentValue';
    }else{
      type = 'value';
    }
    return type;
  }

  getStatusValue(name: string, nowOrMax: string): number{
    const data = this.detailDataElement.getFirstElementByName(name);
    if(!data)return null;
    let type = this.getStatusType(name, nowOrMax);
    if(type == null) return null;

    let oldNumS = '';
    let newNum: number;
    let sum: number;
    console.log('getStatusValue type' + type);

    if ( type == 'value') {
      oldNumS = (data.value as string);
    }
    if ( type == 'currentValue'){
      oldNumS = (data.currentValue as string);
    }
    return parseInt(oldNumS);
  }

  setStatusValue(name: string, nowOrMax: string, setValue: number): boolean{
    const data = this.detailDataElement.getFirstElementByName(name);
    if(!data)return false;
    let type = this.getStatusType(name, nowOrMax);
    if(type == null) return false;

    if ( type == 'value') {
      data.value = setValue;
    }
    if ( type == 'currentValue'){
      data.currentValue = setValue;
    }
    return true;
  }

  setStatusText(name: string, text: string): boolean{
    const data = this.detailDataElement.getFirstElementByName(name);
    if(!data)return false;
    let type = this.getStatusTextType(name);
    if(type == null) return false;
    if ( type == 'value') {
      data.value = text;
    }
    if ( type == 'currentValue'){
      data.currentValue = text;
    }
    return true;
  }


  changeStatusValue(name: string, nowOrMax: string, addValue: number, limitMin ?: boolean ,limitMax ?: boolean ): string{
    const data = this.detailDataElement.getFirstElementByName(name);
    let text = '';
    let type = this.getStatusType(name, nowOrMax);
    if(!data)return text;

    let newNum: number;
    let oldNum :number = this.getStatusValue(name,nowOrMax);
    if(oldNum == null) return text;
    let sum = oldNum + addValue;

    let maxRecoveryMess = '';
    if ( type == 'value') {
      if ( limitMin && sum <= 0 && limitMin){
        maxRecoveryMess = '(最小)';
        sum = 0;
      }
      this.setStatusValue(name, nowOrMax, sum);
    }
    if ( type == 'currentValue'){
      if ( sum >= data.value && limitMax){
        maxRecoveryMess = '(最大)';
        sum = this.getStatusValue(name,'max');
      }
      if ( limitMin && sum <= 0 && limitMin){
        maxRecoveryMess = '(最小)';
        sum = 0;
      }
      this.setStatusValue(name, nowOrMax, sum);
    }
    text = text + '[' + this.name + ' ' + oldNum + '>' + sum + maxRecoveryMess + '] ';
    return text;
  }

}
