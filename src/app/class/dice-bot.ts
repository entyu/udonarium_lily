import { ChatMessageService } from 'service/chat-message.service';
import { ChatMessage, ChatMessageContext } from './chat-message';
import { ChatTab } from './chat-tab';
import { SyncObject } from './core/synchronize-object/decorator';
import { GameObject } from './core/synchronize-object/game-object';
import { ObjectStore } from './core/synchronize-object/object-store';
import { EventSystem } from './core/system';
import { Network } from './core/system';
import { PromiseQueue } from './core/system/util/promise-queue';
import { StringUtil } from './core/system/util/string-util';
import { DataElement } from './data-element';
import { GameCharacter } from './game-character';
import { PeerCursor } from './peer-cursor';
import { StandConditionType } from './stand-list';

import * as lzbase62 from 'lzbase62/lzbase62.min.js';
import { DiceRollTableList } from './dice-roll-table-list';

declare var Opal

export interface DiceBotInfo {
  script: string;
  game: string;
  lang?: string;
  sort_key?: string;
}

export interface DiceBotInfosIndexed {
  index: string;
  infos: DiceBotInfo[];
}

interface DiceRollResult {
  result: string;
  isSecret: boolean;
  isDiceRollTable?: boolean;
  tableName?: string;
}

@SyncObject('dice-bot')
export class DiceBot extends GameObject {
  private static loadedDiceBots: { [gameType: string]: boolean } = {};
  private static queue: PromiseQueue = new PromiseQueue('DiceBotQueue');

  public static apiUrl: string = null;

  public static diceBotInfos: DiceBotInfo[] = [
    { script: 'EarthDawn', game: 'アースドーン' },
    { script: 'EarthDawn3', game: 'アースドーン3版' },
    { script: 'EarthDawn4', game: 'アースドーン4版' },
    { script: 'Airgetlamh', game: '朱の孤塔のエアゲトラム' },
    { script: 'AFF2e', game: 'ADVANCED FIGHTING FANTASY 2nd Edition' },
    { script: 'AnimaAnimus', game: 'アニマアニムス' },
    { script: 'Amadeus', game: 'アマデウス' },
    { script: 'Arianrhod', game: 'アリアンロッドRPG' },
    { script: 'OrgaRain', game: '在りて遍くオルガレイン' },
    { script: 'Alshard', game: 'アルシャード' },
    { script: 'ArsMagica', game: 'アルスマギカ' },
    { script: 'AlterRaise', game: 'アルトレイズ' },
    { script: 'IthaWenUa', game: 'イサー・ウェン＝アー' },
    { script: 'YearZeroEngine', game: 'YearZeroEngine' },
    { script: 'Insane', game: 'インセイン' },
    { script: 'VampireTheMasquerade5th', game: 'Vampire: The Masquerade 5th Edition' },
    { script: 'WitchQuest', game: 'ウィッチクエスト' },
    { script: 'Warhammer', game: 'ウォーハンマー' },
    { script: 'Utakaze', game: 'ウタカゼ' },
    { script: 'Alsetto', game: '詩片のアルセット' },
    { script: 'AceKillerGene', game: 'エースキラージーン' },
    { script: 'EclipsePhase', game: 'エクリプス・フェイズ' },
    { script: 'EmbryoMachine', game: 'エムブリオマシンRPG' },
    { script: 'Elysion', game: 'エリュシオン' },
    { script: 'Elric', game: 'エルリック！' },
    { script: 'EndBreaker', game: 'エンドブレイカー！' },
    { script: 'Oukahoushin3rd', game: '央華封神RPG 第三版' },
    { script: 'OracleEngine', game: 'オラクルエンジン' },
    { script: 'GardenOrder', game: 'ガーデンオーダー' },
    { script: 'CardRanker', game: 'カードランカー' },
    { script: 'Gurps', game: 'ガープス' },
    { script: 'GurpsFW', game: 'ガープスフィルトウィズ' },
    { script: 'ChaosFlare', game: 'カオスフレア' },
    { script: 'OneWayHeroics', game: '片道勇者TRPG' },
    { script: 'Kamigakari', game: '神我狩' },
    { script: 'Garako', game: 'ガラコと破界の塔' },
    { script: 'KanColle', game: '艦これRPG' },
    { script: 'Gundog', game: 'ガンドッグ' },
    { script: 'GundogZero', game: 'ガンドッグゼロ' },
    { script: 'GundogRevised', game: 'ガンドッグ・リヴァイズド' },
    { script: 'KillDeathBusiness', game: 'キルデスビジネス' },
    { script: 'StellarKnights', game: '銀剣のステラナイツ' },
    { script: 'Cthulhu', game: 'クトゥルフ神話TRPG' },
    { script: 'CthulhuTech', game: 'クトゥルフテック' },
    { script: 'KurayamiCrying', game: 'クラヤミクライン' },
    { script: 'GranCrest', game: 'グランクレストRPG' },
    { script: 'GeishaGirlwithKatana', game: 'ゲイシャ・ガール・ウィズ・カタナ' },
    { script: 'GehennaAn', game: 'ゲヘナ・アナスタシス' },
    { script: 'KemonoNoMori', game: '獸ノ森' }, 
    { script: 'Illusio', game: '晃天のイルージオ' },
    { script: 'CodeLayerd', game: 'コード：レイヤード' },
    { script: 'Avandner', game: '黒絢のアヴァンドナー' },
    { script: 'GoblinSlayer', game: 'ゴブリンスレイヤーTRPG' },
    { script: 'Gorilla', game: 'ゴリラTRPG' },
    { script: 'ColossalHunter', game: 'コロッサルハンター' },
    { script: 'Postman', game: '壊れた世界のポストマン' },
    { script: 'Satasupe', game: 'サタスペ' },
    { script: 'SamsaraBallad', game: 'サンサーラ・バラッド' },
    { script: 'SharedFantasia', game: 'Shared†Fantasia' },
    { script: 'JamesBond', game: 'ジェームズ・ボンド007' },
    { script: 'LiveraDoll', game: '紫縞のリヴラドール' },
    { script: 'ShinobiGami', game: 'シノビガミ' },
    { script: 'ShadowRun', game: 'シャドウラン' },
    { script: 'ShadowRun4', game: 'シャドウラン 4th Edition' },
    { script: 'ShadowRun5', game: 'シャドウラン 5th Edition' },
    { script: 'ShoujoTenrankai', game: '少女展爛会TRPG' },
    { script: 'ShinkuuGakuen', game: '真空学園' },
    { script: 'Cthulhu7th', game: '新クトゥルフ神話TRPG' },
    { script: 'ShinMegamiTenseiKakuseihen', game: '真・女神転生TRPG 覚醒篇' },
    { script: 'Skynauts', game: '歯車の塔の探空士' },
    { script: 'ScreamHighSchool', game: 'スクリームハイスクール' },
    { script: 'SRS', game: 'スタンダードRPGシステム' },
    { script: 'SteamPunkers', game: 'スチームパンカーズ' },
    { script: 'SterileLife', game: 'ステラーライフTRPG' },
    { script: 'StratoShout', game: 'ストラトシャウト' },
    { script: 'TherapieSein', game: 'セラフィザイン' },
    { script: 'EtrianOdysseySRS', game: '世界樹の迷宮SRS' },
    { script: 'ZettaiReido', game: '絶対隷奴' },
    { script: 'SevenFortressMobius', game: 'セブン＝フォートレス メビウス' },
    { script: 'Villaciel', game: '蒼天のヴィラシエル' },
    { script: 'SwordWorld', game: 'ソード・ワールドRPG' },
    { script: 'SwordWorld2_0', game: 'ソード・ワールド2.0' },
    { script: 'SwordWorld2_5', game: 'ソード・ワールド2.5' },
    { script: 'DarkSouls', game: 'ダークソウルTRPG' },
    { script: 'DarkDaysDrive', game: 'ダークデイズドライブ' },
    { script: 'DarkBlaze', game: 'ダークブレイズ' },
    { script: 'DiceOfTheDead', game: 'ダイス・オブ・ザ・デッド' },
    { script: 'DoubleCross', game: 'ダブルクロス2nd, 3rd' },
    { script: 'DungeonsAndDragons', game: 'ダンジョンズ＆ドラゴンズ' },
    { script: 'Paradiso', game: 'チェレステ色のパラディーゾ' },
    { script: 'StrangerOfSwordCity', game: '剣の街の異邦人TRPG' },
    { script: 'Chill', game: 'Chill' },
    { script: 'Chill3', game: 'Chill 3rd Edition' },
    { script: 'CrashWorld', game: '墜落世界' },
    { script: 'DetatokoSaga', game: 'でたとこサーガ' },
    { script: 'DeadlineHeroes', game: 'デッドラインヒーローズRPG' },
    { script: 'DemonParasite', game: 'デモンパラサイト' },
    { script: 'TokyoGhostResearch', game: '東京ゴーストリサーチ' },
    { script: 'TokyoNova', game: 'トーキョーN◎VA' },
    { script: 'Torg', game: 'トーグ' },
    { script: 'Torg1_5', game: 'トーグ1.5版' },
    { script: 'TorgEternity', game: 'TORG Eternity' },
    { script: 'TokumeiTenkousei', game: '特命転攻生' },
    { script: 'Dracurouge', game: 'ドラクルージュ' },
    { script: 'TrinitySeven', game: 'トリニティセブンRPG' },
    { script: 'TwilightGunsmoke', game: 'トワイライトガンスモーク' },
    { script: 'TunnelsAndTrolls', game: 'トンネルズ＆トロールズ' },
    { script: 'NightWizard', game: 'ナイトウィザード The 2nd Edition' },
    { script: 'NightWizard3rd', game: 'ナイトウィザード The 3rd Edition' },
    { script: 'NightmareHunterDeep', game: 'ナイトメアハンター＝ディープ' },
    { script: 'NinjaSlayer', game: 'ニンジャスレイヤーTRPG' },
    { script: 'NjslyrBattle', game: 'NJSLYRBATTLE' },
    { script: 'Nuekagami', game: '鵺鏡' },
    { script: 'Nechronica', game: 'ネクロニカ' },
    { script: 'NeverCloud', game: 'ネバークラウドTRPG' },
    { script: 'HarnMaster', game: 'ハーンマスター' },
    { script: 'Pathfinder', game: 'Pathfinder' },
    { script: 'BadLife', game: 'バッドライフ' },
    { script: 'HatsuneMiku', game: '初音ミクTRPG ココロダンジョン' },
    { script: 'BattleTech', game: 'バトルテック' },
    { script: 'ParasiteBlood', game: 'パラサイトブラッドRPG' },
    { script: 'Paranoia', game: 'パラノイア' },
    { script: 'ParanoiaRebooted', game: 'パラノイア リブーテッド' },
    { script: 'BarnaKronika', game: 'バルナ・クロニカ' },
    { script: 'PulpCthulhu', game: 'パルプ・クトゥルフ' },
    { script: 'Raisondetre', game: '叛逆レゾンデートル' },
    { script: 'HuntersMoon', game: 'ハンターズ・ムーン' },
    { script: 'Peekaboo', game: 'ピーカーブー' },
    { script: 'BeastBindTrinity', game: 'ビーストバインド トリニティ' },
    { script: 'BBN', game: 'BBNTRPG' },
    { script: 'Hieizan', game: '比叡山炎上' },
    { script: 'BeginningIdol', game: 'ビギニングアイドル' },
    { script: 'PhantasmAdventure', game: 'ファンタズム・アドベンチャー' },
    { script: 'Fiasco', game: 'フィアスコ' },
    { script: 'FilledWith', game: 'フィルトウィズ' },
    { script: 'FutariSousa', game: 'フタリソウサ' },
    { script: 'BlindMythos', game: 'ブラインド・ミトスRPG' },
    { script: 'BloodCrusade', game: 'ブラッド・クルセイド' },
    { script: 'BloodMoon', game: 'ブラッド・ムーン' },
    { script: 'FullMetalPanic', game: 'フルメタル・パニック！RPG' },
    { script: 'BladeOfArcana', game: 'ブレイド・オブ・アルカナ' },
    { script: 'Strave', game: '碧空のストレイヴ' },
    { script: 'Pendragon', game: 'ペンドラゴン' },
    { script: 'HouraiGakuen', game: '蓬莱学園の冒険!!' },
    { script: 'MagicaLogia', game: 'マギカロギア' },
    { script: 'InfiniteFantasia', game: '無限のファンタジア' },
    { script: 'MeikyuKingdom', game: '迷宮キングダム' },
    { script: 'MeikyuKingdomBasic', game: '迷宮キングダム 基本ルールブック' },
    { script: 'MeikyuDays', game: '迷宮デイズ' },
    { script: 'MetallicGuardian', game: 'メタリックガーディアンRPG' },
    { script: 'MetalHead', game: 'メタルヘッド' },
    { script: 'MetalHeadExtream', game: 'メタルヘッドエクストリーム' },
    { script: 'MonotoneMuseum', game: 'モノトーンミュージアムRPG' },
    { script: 'YankeeYogSothoth', game: 'ヤンキー＆ヨグ＝ソトース' },
    { script: 'GoldenSkyStories', game: 'ゆうやけこやけ' },
    { script: 'Ryutama', game: 'りゅうたま' },
    { script: 'RyuTuber', game: 'リューチューバーとちいさな奇跡' },
    { script: 'RuneQuest', game: 'ルーンクエスト' },
    { script: 'RecordOfSteam', game: 'Record of Steam' },
    { script: 'RecordOfLodossWar', game: 'ロードス島戦記RPG' },
    { script: 'RoleMaster', game: 'ロールマスター' },
    { script: 'LogHorizon', game: 'ログ・ホライズンTRPG' },
    { script: 'RokumonSekai2', game: '六門世界RPG セカンドエディション' },
    { script: 'LostRecord', game: 'ロストレコード' },
    { script: 'LostRoyal', game: 'ロストロイヤル' },
    { script: 'WaresBlade', game: 'ワースブレイド' },
    { script: 'WARPS', game: 'ワープス' },
    { script: 'WorldOfDarkness', game: 'ワールド・オブ・ダークネス' },
    { script: 'Cthulhu_ChineseTraditional', game: '克蘇魯的呼喚', lang: '正體中文' },
    { script: 'Cthulhu7th_ChineseTraditional', game: '克蘇魯的呼喚 第七版', lang: '正體中文' },
    { script: 'KillDeathBusiness_Korean', game: 'Kill Death Business (한국어)', lang: '한국어' },
    { script: 'Nechronica_Korean', game: '네크로니카', lang: '한국어' },
    { script: 'DoubleCross_Korean', game: '더블크로스2nd, 3rd', lang: '한국어' },
    { script: 'DetatokoSaga_Korean', game: '데타토코 사가', lang: '한국어' },
    { script: 'FutariSousa_Korean', game: '둘이서 수사(후타리소우사)', lang: '한국어' },
    { script: 'Dracurouge_Korean', game: '드라크루주', lang: '한국어' },
    { script: 'LogHorizon_Korean', game: '로그 호라이즌', lang: '한국어' },
    { script: 'MonotoneMuseum_Korean', game: '모노톤 뮤지엄', lang: '한국어' },
    { script: 'BeginningIdol_Korean', game: '비기닝 아이돌', lang: '한국어' },
    { script: 'StratoShout_Korean', game: '스트라토 샤우트', lang: '한국어' },
    { script: 'Amadeus_Korean', game: '아마데우스', lang: '한국어' },
    { script: 'Insane_Korean', game: '인세인', lang: '한국어' },
    { script: 'Kamigakari_Korean', game: '카미가카리', lang: '한국어' },
    { script: 'Cthulhu7th_Korean', game: '크툴루의 부름 7판', lang: '한국어' },
    { script: 'Cthulhu_Korean', game: '크툴루', lang: '한국어' },
    { script: 'Fiasco_Korean', game: '피아스코', lang: '한국어' },
  ];

  public static diceBotInfosIndexed: DiceBotInfosIndexed[] = [];

  public static extratablesTables: string[] = [
    'BloodCrusade_TD2T.txt',
    'BloodCrusade_TD3T.txt',
    'BloodCrusade_TD4T.txt',
    'BloodCrusade_TD5T.txt',
    'BloodCrusade_TD6T.txt',
    'BloodCrusade_TDHT.txt',
    'BloodMoon_ID2T.txt',
    'BloodMoon_IDT.txt',
    'BloodMoon_RAT.txt',
    'CardRanker_BFT.txt',
    'CardRanker_CDT.txt',
    'CardRanker_CST.txt',
    'CardRanker_DT.txt',
    'CardRanker_GDT.txt',
    'CardRanker_OST.txt',
    'CardRanker_SST.txt',
    'CardRanker_ST.txt',
    'CardRanker_TDT.txt',
    'CardRanker_WT.txt',
    'Elysion_EBT.txt',
    'Elysion_GIT.txt',
    'Elysion_HBT.txt',
    'Elysion_HT.txt',
    'Elysion_IT.txt',
    'Elysion_JH.txt',
    'Elysion_KT.txt',
    'Elysion_NA.txt',
    'Elysion_NT.txt',
    'Elysion_OJ1.txt',
    'Elysion_OJ2.txt',
    'Elysion_TBT.txt',
    'Elysion_UBT.txt',
    'Elysion_UT1.txt',
    'Elysion_UT2.txt',
    'Elysion_UT3.txt',
    'Elysion_UT4.txt',
    'HuntersMoon_DS1ET.txt',
    'HuntersMoon_DS2ET.txt',
    'HuntersMoon_DS3ET.txt',
    'HuntersMoon_EE1ET.txt',
    'HuntersMoon_EE2ET.txt',
    'HuntersMoon_EE3ET.txt',
    'HuntersMoon_ERT.txt',
    'HuntersMoon_ET1ET.txt',
    'HuntersMoon_ET2ET.txt',
    'HuntersMoon_ET3ET.txt',
    'HuntersMoon_MST.txt',
    'HuntersMoon_TK1ET.txt',
    'HuntersMoon_TK2ET.txt',
    'HuntersMoon_TK3ET.txt',
    'Kamigakari_ET.txt',
    'Kamigakari_KT.txt',
    'Kamigakari_NT.txt',
    'KanColle_BT2.txt',
    'KanColle_BT3.txt',
    'KanColle_BT4.txt',
    'KanColle_BT5.txt',
    'KanColle_BT6.txt',
    'KanColle_BT7.txt',
    'KanColle_BT8.txt',
    'KanColle_BT9.txt',
    'KanColle_BT10.txt',
    'KanColle_BT11.txt',
    'KanColle_BT12.txt',
    'KanColle_ETIT.txt',
    'KanColle_LFDT.txt',
    'KanColle_LFVT.txt',
    'KanColle_LSFT.txt',
    'KanColle_WPCN.txt',
    'KanColle_WPFA.txt',
    'KanColle_WPMC.txt',
    'KanColle_WPMCN.txt',
    'KillDeathBusiness_ANSPT.txt',
    'KillDeathBusiness_MASPT.txt',
    'KillDeathBusiness_MOSPT.txt',
    'KillDeathBusiness_PASPT.txt',
    'KillDeathBusiness_POSPT.txt',
    'KillDeathBusiness_UMSPT.txt',
    'Oukahoushin3rd_BKT.txt',
    'Oukahoushin3rd_KKT.txt',
    'Oukahoushin3rd_NHT.txt',
    'Oukahoushin3rd_SDT.txt',
    'Oukahoushin3rd_SKT.txt',
    'Oukahoushin3rd_STT.txt',
    'Oukahoushin3rd_UKT.txt',
    'ShinobiGami_AKST.txt',
    'ShinobiGami_CLST.txt',
    'ShinobiGami_DXST.txt',
    'ShinobiGami_HC.txt',
    'ShinobiGami_HK.txt',
    'ShinobiGami_HLST.txt',
    'ShinobiGami_HM.txt',
    'ShinobiGami_HO.txt',
    'ShinobiGami_HR.txt',
    'ShinobiGami_HS.txt',
    'ShinobiGami_HT.txt',
    'ShinobiGami_HY.txt',
    'ShinobiGami_NTST.txt',
    'ShinobiGami_OTKRT.txt',
    'ShinobiGami_PLST.txt',
    'BloodCrusade_BDST.txt',
    'BloodCrusade_CYST.txt',
    'BloodCrusade_DMST.txt',
    'BloodCrusade_MNST.txt',
    'BloodCrusade_SLST.txt',
    'BloodCrusade_TD1T.txt'
  ];

  public static replaceData: [string, string, string?][] = [
    ['新クトゥルフ', 'シンクトウルフシンワTRPG', '新クトゥルフ神話TRPG'],
    ['クトゥルフ神話TRPG', 'クトウルフシンワTRPG', '(旧) クトゥルフ神話TRPG'],
    ['克蘇魯神話', '克蘇魯的呼喚', '克蘇魯的呼喚'],
    ['克蘇魯神話第7版', '克蘇魯的呼喚 第七版', '克蘇魯的呼喚 第七版'],
    ['トーグ', 'トオク', 'TORG'],
    ['ワープス', 'ワアフス', 'WARPS'],
    ['トーグ1.5版', 'トオク1.5ハン', 'TORG 1.5版'],
    ['心衝想機TRPGアルトレイズ', 'シンシヨウソウキTRPGアルトレイス', '心衝想機TRPG アルトレイズ'],
    ['犯罪活劇RPGバッドライフ', 'ハンサイカツケキRPGハツトライフ', '犯罪活劇RPGバッドライフ'],
    ['晃天のイルージオ', 'コウテンノイルウシオ', '晃天のイルージオ'],
    ['歯車の塔の探空士', 'ハクルマノトウノスカイノオツ', '歯車の塔の探空士'],
    ['在りて遍くオルガレイン', 'アリテアマネクオルカレイン', '在りて遍くオルガレイン'],
    ['Pathfinder', 'ハスフアインタアRPG', 'パスファインダーRPG'],
    ['真・女神転生TRPG　覚醒編', 'シンメカミテンセイTRPGカクセイヘン', '真・女神転生TRPG 覚醒篇'],
    ['真・女神転生TRPG　覚醒篇', 'シンメカミテンセイTRPGカクセイヘン', '真・女神転生TRPG 覚醒篇'],
    ['YearZeroEngine', 'イヤアセロエンシン', 'Year Zero Engine'],
    ['Year Zero Engine', 'イヤアセロエンシン', 'Year Zero Engine'],
    ['ADVANCED FIGHTING FANTASY 2nd Edition', 'アトハンストファイテインクファンタシイタイ2ハン', 'アドバンスト・ファイティング・ファンタジー 第2版'],
    ['Vampire: The Masquerade 5th Edition', 'ウアンハイアサマスカレエトタイ5ハン', 'ヴァンパイア：ザ・マスカレード 第5版'],
    ['ワールドオブダークネス', 'ワアルトオフタアクネス', 'ワールド・オブ・ダークネス'],
    ['モノトーン・ミュージアム', 'モノトオンミユウシアム', 'モノトーンミュージアム'],
    ['剣の街の異邦人TRPG', 'ツルキノマチノイホウシンTRPG', '剣(つるぎ)の街の異邦人TRPG'],
    ['壊れた世界のポストマン', 'コワレタセカイノホストマン', '壊れた世界のポストマン'],
    ['紫縞のリヴラドール', 'シシマノリフラトオル', '紫縞のリヴラドール'],
    ['SRS汎用(改造版)', 'スタンタアトRPGシステムオルタナテイフハン', 'SRS汎用 オルタナティヴ'],
    ['Standard RPG System', 'スタンタアトRPGシステム', 'スタンダードRPGシステム（SRS）'],
    ['スタンダードRPGシステム', 'スタンタアトRPGシステム', 'スタンダードRPGシステム（SRS）'],
    ['NJSLYRBATTLE', 'ニンシヤスレイヤアハトル'],
    ['Record of Steam', 'レコオトオフスチイム'],
    ['詩片のアルセット', 'ウタカタノアルセツト'],
    ['Shared†Fantasia', 'シエアアトフアンタシア'],
    ['真・女神転生', 'シンメカミテンセイ'],
    ['女神転生', 'メカミテンセイ'],
    ['覚醒篇', 'カクセイヘン'],
    ['Chill', 'チル'],
    ['BBNTRPG', 'ヒイヒイエヌTRPG', 'BBNTRPG (Black Black Network TRPG)'],
    ['TORG Eternity', 'トオクエタアニテイ'],
    ['ガープス', 'カアフス', 'GURPS'],
    ['ガープスフィルトウィズ', 'カアフスフイルトウイス', 'GURPSフィルトウィズ'],
    ['絶対隷奴', 'セツタイレイト'],
    ['セラフィザイン', 'セイシユンシツカンTRPGセラフィサイン', '青春疾患TRPG セラフィザイン'],
    ['艦これ', 'カンコレ'],
    ['神我狩', 'カミカカリ'],
    ['鵺鏡', 'ヌエカカミ'],
    ['トーキョー', 'トオキヨウ'],
    ['Ｎ◎ＶＡ', 'ノウア'],
    ['初音ミク', 'ハツネミク'],
    ['朱の孤塔', 'アケノコトウ'],
    ['在りて遍く', 'アリテアマネク'],
    ['央華封神', 'オウカホウシン'],
    ['心衝想機', 'シンシヨウソウキ'],
    ['胎より想え', 'ハラヨリオモエ'],
    ['展爛会', 'テンランカイ'],
    ['壊れた', 'コワレタ'],
    ['比叡山', 'ヒエイサン'],
    ['世界樹', 'セカイシユ'],
    ['異邦人', 'イホウシン'],
    ['転攻生', 'テンコウセイ'],
    ['探空士', 'スカイノオツ'],
    ['剣の街', 'ツルキノマチ'],
    ['黒絢', 'コツケン'],
    ['紫縞', 'シシマ'],
    ['破界', 'ハカイ'],
    ['銀剣', 'キンケン'],
    ['東京', 'トウキヨウ'],
    ['片道', 'カタミチ'],
    ['勇者', 'ユウシヤ'],
    ['少女', 'シヨウシヨ'],
    ['真空', 'シンクウ'],
    ['学園', 'カクエン'],
    ['世界', 'セカイ'],
    ['青春', 'セイシユン'],
    ['疾患', 'シツカン'],
    ['迷宮', 'メイキユウ'],
    ['歯車', 'ハクルマ'],
    ['蒼天', 'ソウテン'],
    ['墜落', 'ツイラク'],
    ['特命', 'トクメイ'],
    ['晃天', 'コウテン'],
    ['叛逆', 'ハンキヤク'],
    ['犯罪', 'ハンサイ'],
    ['活劇', 'カツケキ'],
    ['碧空', 'ヘキクウ'],
    ['蓬莱', 'ホウライ'],
    ['冒険', 'ホウケン'],
    ['六門', 'ロクモン'],
    ['炎上', 'エンシヨウ'],
    ['無限', 'ムケン'],
    ['塔', 'トウ'],
    ['獣', 'ケモノ'],
    ['獸', 'ケモノ'],
    ['森', 'モリ'],
    ['&', 'アント'],
    ['＆', 'アント'],
    ['ヴァ', 'ハ'],
    ['ヴィ', 'ヒ'],
    ['ヴェ', 'ヘ'],
    ['ヴォ', 'ホ'],
    ['ヴ', 'フ'],
    ['ァ', 'ア'],
    ['ィ', 'イ'],
    ['ゥ', 'ウ'],
    ['ェ', 'エ'],
    ['ォ', 'オ'],
    ['ャ', 'ヤ'],
    ['ュ', 'ユ'],
    ['ョ', 'ヨ'],
    ['ッ', 'ツ'],  
    ['ヲ', 'オ'],
    ['ガ', 'カ'],
    ['ギ', 'キ'],
    ['グ', 'ク'],
    ['ゲ', 'ケ'],
    ['ゴ', 'コ'],
    ['ザ', 'サ'],
    ['ジ', 'シ'],
    ['ズ', 'ス'],
    ['ゼ', 'セ'],
    ['ゾ', 'ソ'],
    ['ダ', 'タ'],
    ['ヂ', 'チ'],
    ['ヅ', 'ツ'],
    ['デ', 'テ'],
    ['ド', 'ト'],
    ['バ', 'ハ'],
    ['ビ', 'ヒ'],
    ['ブ', 'フ'],
    ['ベ', 'ヘ'],
    ['ボ', 'ホ'],
    ['パ', 'ハ'],
    ['ピ', 'ヒ'],
    ['プ', 'フ'],
    ['ペ', 'ヘ'],
    ['ポ', 'ホ']
  ];
  // GameObject Lifecycle
  onStoreAdded() {
    super.onStoreAdded();
    DiceBot.queue.add(DiceBot.loadScriptAsync('./assets/cgiDiceBot.js'));
    EventSystem.register(this)
      .on('SEND_MESSAGE', async event => {
        let chatMessage = ObjectStore.instance.get<ChatMessage>(event.data.messageIdentifier);
        if (!chatMessage || !chatMessage.isSendFromSelf || chatMessage.isSystem) return;

        let text: string = StringUtil.toHalfWidth(chatMessage.text);
        let gameType: string = chatMessage.tag;

        try {
          let regArray = /^((\d+)?\s+)?([^\s]*)?/ig.exec(text);
          let repeat: number = (regArray[2] != null) ? Number(regArray[2]) : 1;
          let rollText: string = (regArray[3] != null) ? regArray[3] : text;
          // すべてBCDiceに投げずに回数が1回未満かchoice[]が含まれるか英数記号以外は門前払い
          if (!rollText || repeat < 1 || !(/choice\[.*\]/i.test(rollText) || /^[a-zA-Z0-9!-/:-@¥[-`{-~\}]+$/.test(rollText))) {
            return;
          }
          let finalResult: DiceRollResult = { result: '', isSecret: false, isDiceRollTable: false };
          
          //ダイスボット表
          let isDiceRollTableMatch = false;
          for (const diceRollTable of DiceRollTableList.instance.diceRollTables) {
            let isSecret = false;
            const command = StringUtil.toHalfWidth(diceRollTable.command);
            if (command && rollText.trim().toUpperCase() === 'S' + command.trim().toUpperCase()) {
              isDiceRollTableMatch = true;
              isSecret = true;
            } else if (command && rollText.trim().toUpperCase() === command.trim().toUpperCase()) {
              isDiceRollTableMatch = true;
            }
            if (isDiceRollTableMatch) {
              finalResult.isDiceRollTable = true;
              finalResult.tableName = (diceRollTable.name && diceRollTable.name.length > 0) ? diceRollTable.name : '(無名のダイスボット表)';
              finalResult.isSecret = isSecret;
              const diceRollTableRows = diceRollTable.parseText();
              for (let i = 0; i < repeat && i < 32; i++) {
                let rollResult = await DiceBot.diceRollAsync(StringUtil.toHalfWidth(diceRollTable.dice), 'DiceBot', 1);
                if (rollResult.result) rollResult.result = rollResult.result.replace('DiceBot : ', '').replace(/[＞]/g, s => '→').trim();
                let rollResultNumber = 0;
                let match = null;
                if (rollResult.result.length > 0 && (match = rollResult.result.match(/\s→\s(?:成功数)?(\-?\d+)$/))) {
                  rollResultNumber = +match[1];
                }
                let isRowMatch = false;
                for (const diceRollTableRow of diceRollTableRows) {
                  if ((diceRollTableRow.range.start === null || diceRollTableRow.range.start <= rollResultNumber) 
                    && (diceRollTableRow.range.end === null || rollResultNumber <= diceRollTableRow.range.end)) {
                    //finalResult.result += (`[${rollResultNumber}] ` + StringUtil.cr(diceRollTableRow.result));
                    finalResult.result += ('🎲 ' + rollResult.result + "\n" + StringUtil.cr(diceRollTableRow.result));
                    isRowMatch = true;
                    break;
                  }
                }
                if (!isRowMatch) finalResult.result += ('🎲 ' + rollResult.result + "\n" + '(結果なし)');
                if (1 < repeat) finalResult.result += ` #${i + 1}\n`;
              }
              break;
            }
          }
          if (!isDiceRollTableMatch) {
            //TODO システムダイスも並列に
            if (DiceBot.apiUrl) {
              finalResult = await DiceBot.diceRollAsync(rollText, gameType, repeat);
            } else {
              for (let i = 0; i < repeat && i < 32; i++) {
                let rollResult = await DiceBot.diceRollAsync(rollText, gameType, repeat);
                if (rollResult.result.length < 1) break;

                finalResult.result += rollResult.result;
                finalResult.isSecret = finalResult.isSecret || rollResult.isSecret;
                if (1 < repeat) finalResult.result += ` #${i + 1}`;
              }
            }
          }
          this.sendResultMessage(finalResult, chatMessage);
        } catch (e) {
          console.error(e);
        }
        return;
      });
  }

  // GameObject Lifecycle
  onStoreRemoved() {
    super.onStoreRemoved();
    EventSystem.unregister(this);
  }

  private sendResultMessage(rollResult: DiceRollResult, originalMessage: ChatMessage) {
    let result: string = rollResult.result;
    let isSecret: boolean = rollResult.isSecret;

    if (result.length < 1) return;
    if (!rollResult.isDiceRollTable) result = result.replace(/[＞]/g, s => '→').trim();

    let diceBotMessage: ChatMessageContext = {
      identifier: '',
      tabIdentifier: originalMessage.tabIdentifier,
      originFrom: originalMessage.from,
      from: rollResult.isDiceRollTable ? 'Dice-Roll Table' : DiceBot.apiUrl ? `BCDice-API(${DiceBot.apiUrl})` : 'System-BCDice',
      timestamp: originalMessage.timestamp + 1,
      imageIdentifier: '',
      tag: isSecret ? 'system secret' : 'system',
      name: rollResult.isDiceRollTable ? 
        isSecret ? '<' + rollResult.tableName + ' (Secret)：' + originalMessage.name + '>' : '<' + rollResult.tableName + '：' + originalMessage.name + '>' :
        isSecret ? '<Secret-BCDice：' + originalMessage.name + '>' : '<BCDice：' + originalMessage.name + '>' ,
      text: result,
      color: originalMessage.color,
      isUseStandImage: originalMessage. isUseStandImage
    };

    // ダイスボットへのスタンドの反応
    if (!isSecret && !originalMessage.standName && originalMessage.isUseStandImage) {
      const gameCharacter = ObjectStore.instance.get(originalMessage.characterIdentifier);
      if (gameCharacter instanceof GameCharacter) {
        const standInfo = gameCharacter.standList.matchStandInfo(result, originalMessage.imageIdentifier);
        if (standInfo.farewell) {
          const sendObj = {
            characterIdentifier: gameCharacter.identifier
          };
          if (originalMessage.to) {
            // ほんとにこれでええんか？
            const targetId = Network.peerContext.room ?
              originalMessage.to + Network.peerContext.room + lzbase62.compress(Network.peerContext.roomName) + '-' + lzbase62.compress(Network.peerContext.password)
              : originalMessage.to;
            EventSystem.call('FAREWELL_STAND_IMAGE', sendObj, targetId);
            EventSystem.call('FAREWELL_STAND_IMAGE', sendObj, PeerCursor.myCursor.peerId);
          } else {
            EventSystem.call('FAREWELL_STAND_IMAGE', sendObj);
          }
        } else if (standInfo && standInfo.standElementIdentifier) {
          const diceBotMatch = <DataElement>ObjectStore.instance.get(standInfo.standElementIdentifier);
          if (diceBotMatch && diceBotMatch.getFirstElementByName('conditionType')) {
            const conditionType = +diceBotMatch.getFirstElementByName('conditionType').value;
            if (conditionType == StandConditionType.Postfix || conditionType == StandConditionType.PostfixOrImage || conditionType == StandConditionType.PostfixAndImage) {
              const sendObj = {
                characterIdentifier: gameCharacter.identifier, 
                standIdentifier: standInfo.standElementIdentifier, 
                color: originalMessage.color,
                secret: originalMessage.to ? true : false
              };
              if (sendObj.secret) {
                // いろいろとこれでええの？
                const targetId = Network.peerContext.room ?
                  originalMessage.to + Network.peerContext.room + lzbase62.compress(Network.peerContext.roomName) + '-' + lzbase62.compress(Network.peerContext.password)
                  : originalMessage.to;
                EventSystem.call('POPUP_STAND_IMAGE', sendObj, targetId);
                EventSystem.call('POPUP_STAND_IMAGE', sendObj, PeerCursor.myCursor.peerId);
              } else {
                EventSystem.call('POPUP_STAND_IMAGE', sendObj);
              }
            }
          }
        }
        if (standInfo.matchMostLongText && diceBotMessage.text) {
          diceBotMessage.text = diceBotMessage.text.slice(0, diceBotMessage.text.length - standInfo.matchMostLongText.length);
        }
      }
    }

    if (originalMessage.to != null && 0 < originalMessage.to.length) {
      diceBotMessage.to = originalMessage.to;
      if (originalMessage.to.indexOf(originalMessage.from) < 0) {
        diceBotMessage.to += ' ' + originalMessage.from;
      }
    }
    let chatTab = ObjectStore.instance.get<ChatTab>(originalMessage.tabIdentifier);
    if (chatTab) chatTab.addMessage(diceBotMessage);
  }

  static diceRollAsync(message: string, gameType: string, repeat: number = 1): Promise<DiceRollResult> {
    if (DiceBot.apiUrl) {
      const request = DiceBot.apiUrl + '/v1/diceroll?system=' + (gameType ? encodeURIComponent(gameType) : 'DiceBot') + '&command=' + encodeURIComponent(message);
      const promisise = [];
      for (let i = 1; i <= repeat; i++) {
        promisise.push(
          fetch(request, {mode: 'cors'})
            .then(response => {
              if (response.ok) {
                return response.json();
              }
              throw new Error(response.statusText);
            })
            .then(json => {
              return { result: (gameType ? gameType : 'DiceBot') + json.result + (repeat > 1 ? ` #${i}\n` : ''), isSecret: json.secret };
            })
            .catch(e => {
              //console.error(e);
              return { result: '', isSecret: false };
            })
        );
      }
      return DiceBot.queue.add(
        Promise.all(promisise)
          .then(results => { return results.reduce((ac, cv) => {
            let result = ac.result + cv.result;
            let isSecret = ac.isSecret || cv.isSecret;
            return { result: result, isSecret: isSecret };
          }, { result: '', isSecret: false }) })
      );
    } else {
      DiceBot.queue.add(DiceBot.loadDiceBotAsync(gameType));
      return DiceBot.queue.add(() => {
          if ('Opal' in window === false) {
            console.warn('Opal is not loaded...');
            return { result: '', isSecret: false };
          }
          let result = [];
          let dir = [];
          let diceBotTablePrefix = 'diceBotTable_';
          let isNeedResult = true;
          try {
            Opal.gvars.isDebug = false;
            let cgiDiceBot = Opal.CgiDiceBot.$new();
            result = cgiDiceBot.$roll(message, gameType, dir, diceBotTablePrefix, isNeedResult);
            console.log('diceRoll!!!', result);
            console.log('isSecret!!!', cgiDiceBot.isSecret);
            return { result: result[0], isSecret: cgiDiceBot.isSecret };
          } catch (e) {
            console.error(e);
          }
          return { result: '', isSecret: false };
      });
    }
  }

  static getHelpMessage(gameType: string): Promise<string|string[]> {
    if (DiceBot.apiUrl) {
      const promisise = [
        fetch(DiceBot.apiUrl + '/v1/systeminfo?system=DiceBot', {mode: 'cors'})
          .then(response => { return response.json() })
      ];
      if (gameType && gameType != 'DiceBot') {
        promisise.push(
          fetch(DiceBot.apiUrl + '/v1/systeminfo?system=' + encodeURIComponent(gameType), {mode: 'cors'})
            .then(response => { return response.json() })
        );
      }
      return Promise.all(promisise)
        .then(jsons => { 
          return jsons.map(json => {
            if (json.systeminfo && json.systeminfo.info) {
              return json.systeminfo.info.replace('このダイスボットは部屋のシステム名表示用となります', 'このダイスボットはチャットパレットなどのシステム名表示用となります');
            } else {
              return 'ダイスボット情報がありません。';
            }                
          }) 
        });
    } else {
      DiceBot.queue.add(DiceBot.loadDiceBotAsync(gameType));
      return DiceBot.queue.add(() => {
        if ('Opal' in window === false) {
          console.warn('Opal is not loaded...');
          return '';
        }
        let help = ['【ダイスボット】チャットにダイス用の文字を入力するとダイスロールが可能\n'
          + '入力例）２ｄ６＋１　攻撃！\n'
          + '出力例）2d6+1　攻撃！\n'
          + '　　　　  diceBot: (2d6) → 7\n'
          + '上記のようにダイス文字の後ろに空白を入れて発言する事も可能。\n'
          + '以下、使用例\n'
          + '　3D6+1>=9 ：3d6+1で目標値9以上かの判定\n'
          + '　1D100<=50 ：D100で50％目標の下方ロールの例\n'
          + '　3U6[5] ：3d6のダイス目が5以上の場合に振り足しして合計する(上方無限)\n'
          + '　3B6 ：3d6のダイス目をバラバラのまま出力する（合計しない）\n'
          + '　10B6>=4 ：10d6を振り4以上のダイス目の個数を数える\n'
          + '　(8/2)D(4+6)<=(5*3)：個数・ダイス・達成値には四則演算も使用可能\n'
          + '　C(10-4*3/2+2)：C(計算式）で計算だけの実行も可能\n'
          + '　choice[a,b,c]：列挙した要素から一つを選択表示。ランダム攻撃対象決定などに\n'
          + '　S3d6 ： 各コマンドの先頭に「S」を付けると他人に結果の見えないシークレットロール\n'
          + '　3d6/2 ： ダイス出目を割り算（切り捨て）。切り上げは /2U、四捨五入は /2R。\n'
          + '　D66 ： D66ダイス。順序はゲームに依存。D66N：そのまま、D66S：昇順。'];
        try {
          let bcdice = Opal.CgiDiceBot.$new().$newBcDice();
          bcdice.$setGameByTitle(gameType);
          const specialHelp = bcdice.diceBot.$getHelpMessage();
          if (specialHelp) help.push(specialHelp);
        } catch (e) {
          console.error(e);
        }
        return help;
      });
    }
  }

  static loadDiceBotAsync(gameType: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      console.log('loadDiceBotAsync');
      gameType = gameType.replace(/\./g, s => '_');

      if ((!gameType && gameType.length < 1) || DiceBot.loadedDiceBots[gameType]) {
        console.log(gameType + ' is loaded');
        resolve();
        return;
      }

      DiceBot.loadedDiceBots[gameType] = false;

      let promises: Promise<void>[] = [];
      let scriptPath = './assets/dicebot/' + gameType + '.js';

      promises.push(DiceBot.loadScriptAsync(scriptPath));

      for (let table of DiceBot.extratablesTables) {
        if (!table.indexOf(gameType)) {
          let path = './assets/extratables/' + table;
          promises.push(DiceBot.loadExtratablesAsync(path, table));
        }
      }

      Promise.all(promises).then(() => {
        DiceBot.loadedDiceBots[gameType] = true;
        resolve();
      });
    });
  }

  private static loadScriptAsync(path: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let head = document.head;
      let script = document.createElement('script');
      script.src = path;
      head.appendChild(script);

      script.onload = (e) => {
        if (head && script.parentNode) head.removeChild(script);
        console.log(path + ' is loading OK!!!');
        resolve();
      };

      script.onabort = script.onerror = (e) => {
        if (head && script.parentNode) head.removeChild(script);
        console.error(e);
        resolve();
      }
    });
  }

  private static loadExtratablesAsync(path: string, table: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      fetch(path)
        .then(response => {
          if (response.ok) return response.text();
          throw new Error('Network response was not ok.');
        })
        .then(text => {
          let array = /((.+)_(.+)).txt$/ig.exec(table);
          Opal.TableFileData.$setVirtualTableData(array[1], array[2], array[3], text);
          console.log(table + ' is loading OK!!!');
          resolve();
        })
        .catch(error => {
          console.warn('There has been a problem with your fetch operation: ', error.message);
          resolve();
        });
    });
  }
}
