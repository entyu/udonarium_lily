import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { GameCharacter } from '@udonarium/game-character';
import { TabletopObject } from './tabletop-object';

@SyncObject('reload-check')
export class ReloadCheck extends TabletopObject {

  private reloadOK : boolean = true;
  private isAnswer : boolean = false;

  reloadCheckStart(isOnline: boolean){
    if(isOnline){
      this.reloadOK = true;
      this.isAnswer = false;
    }else{
      this.reloadOK = true;
      this.isAnswer = true;
    }
  }

  answerCheck(): boolean{
    if( this.isAnswer == false){
      this.reloadOK = window.confirm('プレイ中にルーム根幹設定を含むデータが入力されました\nこのデータを本当に読み込んでいいですか？ 古いデータは上書きされます');
      this.isAnswer = true;
    }
    return this.reloadOK;
  }

  isLoadOk(): boolean{
    console.log('isLoadOk :' + this.reloadOK);
    return this.reloadOK;
  }

}
