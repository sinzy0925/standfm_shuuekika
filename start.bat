rem @echo off
setlocal EnableDelayedExpansion
rem set LF=^

rem ������ɁA�����̃����A�h�ɁA�y�Ȑ\�����ł����|�̃��[�����������Ƃ��m�F���Ă��������B
rem ������ɁAlog.log�t�@�C�����m�F���Ă��������B
rem 1�s�ڕύX�s�� cd %USERPROFILE%\standfm_shuuekika
rem 2�s�ڕύX�s�� node app_gakkyokushinsei_win_1.js ^
rem 3�s��^��^�̊ԂɃ����A�h�L��
rem 4�s��^��^�̊ԂɃp�X���[�h�L��
rem 5�s�ڈȍ~^"��"^�̊Ԃ� ��i�R�[�h,�A�[�J�C�u��,//�Ȗ�/�̎薼 ���L�� ��^"��"^�ň͂ނ���
rem �ύX�s�� " > %USERPROFILE%\standfm_shuuekika\log.log"


cd %USERPROFILE%\standfm_shuuekika
node app_gakkyokushinsei_win_1.js ^
^mail^
^pass^
^"096-5892-1,1,//super star/������"^
^"096-5892-1,1,//super star/������"^
" > %USERPROFILE%\standfm_shuuekika\log.log"
