import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { GameCharacter } from '@udonarium/game-character';
import { TabletopObject } from './tabletop-object';

@SyncObject('reload-check')
export class ReloadCheck extends TabletopObject {

  private reloadOK : boolean = true;
  private isAnswer : boolean = false;

  reloadCheckStart(isOnline: boolean){
    console.log('てすとですreloadCheckStart');
    if(isOnline){
      this.reloadOK = false;
      this.isAnswer = false;
    }else{
      this.reloadOK = true;
      this.isAnswer = true;
    }
  }

  answerCheck(): boolean{
    console.log('てすとです');
    if( this.isAnswer == false){
      this.reloadOK = window.confirm('プレイ中にルーム根幹設定を含むデータが入力されました\nこのデータを本当に読み込んでいいですか？ 古いデータは上書きされます');
      this.isAnswer = true;
    }
    return this.reloadOK;
  }

}
