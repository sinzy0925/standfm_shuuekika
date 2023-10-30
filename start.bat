rem @echo off
setlocal EnableDelayedExpansion
rem set LF=^

rem 処理後に、自分のメルアドに、楽曲申請ができた旨のメールが来たことを確認してください。
rem 処理後に、log.logファイルを確認してください。
rem 1行目変更不可 cd %USERPROFILE%\standfm_shuuekika
rem 2行目変更不可 node app_gakkyokushinsei_win_1.js ^
rem 3行目^と^の間にメルアド記入
rem 4行目^と^の間にパスワード記入
rem 5行目以降^"と"^の間に 作品コード,アーカイブ順,//曲名/歌手名 を記入 ※^"と"^で囲むこと
rem 変更不可 " > %USERPROFILE%\standfm_shuuekika\log.log"


cd %USERPROFILE%\standfm_shuuekika
node app_gakkyokushinsei_win_1.js ^
^mail^
^pass^
^"096-5892-1,1,//super star/長渕剛"^
^"096-5892-1,1,//super star/長渕剛"^
" > %USERPROFILE%\standfm_shuuekika\log.log"
