# ユドナリウムリリィ

このプロジェクトはユドナリウムをカスタマイズするために分岐し作成しました

ユドナリウム（Udonarium）はWebブラウザで動作するボードゲームオンラインセッション支援ツールです。
本家ユドナリウムの開発範囲は本家に著作権が有り、
追加したコードは私円柱(entyu)あるいは私が組み込んだソースの作者に著作権があります。
いずれにせよライセンスは本家のMITを引き継ぎます。
名前混同を避けるため本開発版名称はudonarium_lily　ユドナリウムリリィとします。

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/TK11235/udonarium/blob/master/LICENSE)


■立ち絵

■発言に色を付ける

■ログの書き出し、消去機能

■カウンターリモコン

■バフデバフ表示

■ダイス表

■画像タグ

■ポップアップ等のUI調整機能

を追加実装しています。

![lily_sample](https://user-images.githubusercontent.com/61339319/95869259-26b41380-0da6-11eb-96fa-1e6c6858c531.png)


---------以下本家からの一部抜粋です---------------

https://github.com/TK11235/udonarium

## サーバ設置
ユーザ自身でWebサーバを用意し、そのサーバにユドナリウムリリィを設置して利用することができます。  
以下のファイルをダウンロードして解凍し、Webサーバに配置してください。  
v1.05.0からYouTubeカットイン機能があります。YouTubeの規約もご確認ください。

最新版v1.09.1

https://github.com/entyu/udonarium_lily/releases/download/v1.09.1/udonarium_lily-v1.09.1.zip

旧バージョン

https://github.com/entyu/udonarium_lily/releases/download/v1.09.0/udonarium_lily-v1.09.0.zip

https://github.com/entyu/udonarium_lily/releases/download/v1.08.1/udonarium_lily-v1.08.1.zip

https://github.com/entyu/udonarium_lily/releases/download/v1.08.0/udonarium_lily-v1.08.0.zip

https://github.com/entyu/udonarium_lily/releases/download/v1.07.0/udonarium_lily-v1.07.0.zip

https://github.com/entyu/udonarium_lily/releases/download/v1.06.0/udonarium_lily-v1.06.0.zip

https://github.com/entyu/udonarium_lily/releases/download/v1.05.0/udonarium_lily-v1.05.0.zip

https://github.com/entyu/udonarium_lily/releases/download/%EF%BD%961.04.0/udonarium_lily-v1.04.0.zip

https://github.com/entyu/udonarium_lily/releases/download/v1.03.0/udonarium_lily-v1.03.0.zip

https://github.com/entyu/udonarium_lily/releases/download/v1.02.2/udonarium_lily-v1.02.2.zip

https://github.com/entyu/udonarium_lily/releases/download/v1.02.1/udonarium_lily-v1.02.1.zip


**開発者向けのソースコードをダウンロードしないように注意して下さい。**
1. [SkyWay](https://webrtc.ecl.ntt.com/)のAPIキーを取得し、APIキー情報を`assets/config.yaml`に記述します。
1. サーバに配置したユドナリウムの`index.html`にアクセスして動作することを確認してみてください。  
ユドナリウムリリィはサーバーサイドの処理を持たないので、CGIやデータベースは必要はありません。

#### SkyWay
このアプリケーションは通信処理にWebRTCを使用しています。  
WebRTC向けのシグナリングサーバとして[SkyWay](https://webrtc.ecl.ntt.com/)を利用しているため、動作確認のためにSkyWayのAPIキーが必要です。
取得したAPIキーの情報は`src/assets/config.yaml`に記述します。

#### そのほか難しいこと
本家と同じなので本家の udonarium の説明を参照してください。
自力コンパイルするかたへｖ1.02.0より--prodで自動生成される 3rdpartylicenses.txt にソフト内リンクが貼られるようにしてあります。
つけないと生成されずlicensesへのリンクが切れるのでご注意ください。


