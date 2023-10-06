//npx playwright codegen
const headlessMode = false;//false 画面あり　true 画面なし
const testmode     = false;//false [する]楽曲申請・投稿設定更新　true [しない]楽曲申請・投稿設定更新

const { chromium } = require('playwright');
const express = require('express');
const app = express();
const wtimeout =   500;


/*
// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`- - - - - - - - - - - - - - - - - - - - - - - - `);
  console.log(`Server listening on port ${PORT}...`);
});

let text1 = `Server listening on port ${PORT}...`;
*/



const readline = require('readline/promises');

(async () => {

  
/*
  const readInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
*/
  let koumoku      = ''
  let standfm_id   = ''
  let standfm_pass = ''
  //let gakkyoku     = '090-9686-8,1\n'//090-9686-8,1
  let gakkyoku     = '';//'N00501449,10\n'
  koumoku = process.argv[2];
  //console.log(koumoku);
  if(koumoku != ''){
    let koumokuArr = koumoku.split('\n');
    //console.log(koumokuArr);	    
    for(let i = 0 ; i < koumokuArr.length ; i++){
      if(i == 0){
        standfm_id = koumokuArr[i];
      }
      if(i == 1){
        standfm_pass = koumokuArr[i];
      }
      if(i > 1){
        gakkyoku += koumokuArr[i] + '\n';
      }
    }
    for(i = 0 ; i < 30 ; i++){
      console.log('')
    }
    console.log('メルアド　　：' + standfm_id.slice(0,5) + '**********');
    console.log('パスワード　：' + standfm_pass.slice(0,1) + '**********');
    let gakkArr = gakkyoku.split('\n')
    //console.log(gakkArr);
    for(i = 0 ; i < gakkArr.length ; i++){
      if(gakkArr[i] != ''){
        console.log('作品コード等：' + gakkArr[i]);
      }
    }
    //break;
  }else{
      console.log('必要項目が入力されていません！もう一度入力してください。')
  }


  console.log('')
  console.log('Start::::standfm_login  standfm_login')
  let reslogin = 0;
  let resArr = await standfm_login(headlessMode,standfm_id,standfm_pass);
  if(resArr != -1){
    console.log('standfm_login = OK!')    
  }else{
    console.log('standfm_login = NG!')
    console.log('standfmログイン失敗！ メルアド or パスワード に誤りがあります！')
    console.log('standfmログイン失敗！ メルアド or パスワード に誤りがあります！')
    reslogin = -1;
  }
  let browser = resArr[0];//.push(browser,context,page2)
  let context = resArr[1];
  let page2   = resArr[2];
  const gakkyokuArr = gakkyoku.split('\n');
  let gakuArr =[];
  for(i = 0 ; i < gakkyokuArr.length ; i++){
    if(gakkyokuArr[i] != ''){
      gakuArr.push( gakkyokuArr[i].split(','));
    }
  }
  //console.log('gakuArr ' + gakuArr);

  let res_gakkyokushinsei = "";
  let JorN1 = '';
  let JorN  = '';
  let startTime = performance.now(); // 開始時間
  let endTime = performance.now(); // 終了時間
  let res_gakkyoku;
  for(let j = 0 ; j < gakuArr.length ; j++){
    const standfm_listNo  = String(gakuArr[j][1]);
    if(reslogin == -1){
        break;
    }
      //console.log('gakuArr.length ' + gakuArr.length + ' j ' + j);
      JorN1 = gakuArr[j][0].slice(0,1)
      if(!isNaN(JorN1)){
        JorN = 'J';
      }else{
        JorN = 'N';
      }
      if(JorN == 'J' ){
        startTime = performance.now(); // 開始時間
        if(j != 0 && gakuArr[j][0] == gakuArr[j-1][0]){
          console.log('')
          console.log('JASRAC検索不要！　作品コードが前回と同じ')
        }else{
          console.log('')
          console.log('Start::::JASRAC  JASRAC')
          res_gakkyoku = await jasracdata(headlessMode,gakuArr,j);  
        }
        if(res_gakkyoku != -1){
            console.log('['+standfm_listNo + ']配信状況 = 配信OK')
            console.log('['+standfm_listNo + ']JASRACデータ = ' + res_gakkyoku)
        }else{
            console.log('['+standfm_listNo + ']配信状況 = 配信NG 配信NG よく確認してください。')
            console.log('['+standfm_listNo + ']JASRACデータ = ' + res_gakkyoku)
        }
        if(res_gakkyoku != -1){
          console.log('')
          console.log('Start::::楽曲申請(JASRAC)')
          res_gakkyokushinsei = await gakkyokushinsei(headlessMode,testmode,gakuArr,j,res_gakkyoku,resArr,JorN,standfm_id);
          if(gakuArr.length == 1){
            await page2.close();  
            await context.close();
            await browser.close();
          }
          endTime = performance.now(); // 終了時間
          if(res_gakkyokushinsei == 0){
            console.log('==================================================')
            console.log('JASRAC = ' + res_gakkyoku)
            console.log('[OK] ['+standfm_listNo + ']楽曲申請成功！ = ' + res_gakkyokushinsei + ' 楽曲申請成功！')  
            console.log('処理時間 : ' + ((endTime - startTime)/1000).toFixed(1) + ' 秒'); // 何ミリ秒かかったかを表示する
            console.log('==================================================')
          }else{
            console.log('==================================================')
            console.log('JASRAC = ' + res_gakkyoku)
            console.log('[NG] ['+standfm_listNo + ']楽曲申請失敗！ = ' + res_gakkyokushinsei + ' 楽曲申請失敗！失敗！手動で楽曲申請してください！')  
            console.log('処理時間 : ' + ((endTime - startTime)/1000).toFixed(1) + ' 秒'); // 何ミリ秒かかったかを表示する
            console.log('==================================================')
            await page2.close();  
            await context.close();
            await browser.close();

            if(gakuArr.length -1 != j){
              console.log('')
              console.log('Start::::standfm_login  standfm_login')
              reslogin = 0;
              resArr = await standfm_login(headlessMode,standfm_id,standfm_pass);
              if(resArr != -1){
                console.log('standfm_login = OK!')   
                browser = resArr[0];//.push(browser,context,page2)
                context = resArr[1];
                page2   = resArr[2]; 
                reslogin = 0;
              }else{
                console.log('standfm_login = NG!')
                console.log('standfmログイン失敗！ メルアド or パスワード に誤りがあります！')
                console.log('standfmログイン失敗！ メルアド or パスワード に誤りがあります！')
                reslogin = -1;
              }
            }

          }
        }else{
          console.log('==================================================')
          console.log('JASRAC = ' + res_gakkyoku)
          console.log('この曲は楽曲申請できません。「配信」可能か確認してください。')
          console.log('楽曲申請不可能 : ' + gakuArr[j])
          console.log('==================================================')
        }
      }else{
        startTime = performance.now(); // 開始時間
        if(j != 0 && gakuArr[j][0] == gakuArr[j-1][0]){
          console.log('')
          console.log('NexTone検索不要！　作品コードが前回と同じ')
        }else{
          console.log('')
          console.log('Start::::NexTone NexTone')
          res_gakkyoku = await nextonedata(headlessMode,gakuArr,j);
        }
        if(res_gakkyoku != -1){
            console.log('配信状況 = 配信OK')
            console.log('NexToneデータ = ' + res_gakkyoku)
        }else{
            console.log('配信状況 = 配信NG 配信NG よく確認してください。')
            console.log('NexToneデータ = ' + res_gakkyoku)
        }
        if(res_gakkyoku != -1){
          console.log('')
          console.log('Start::::楽曲申請(NexTone)')
          res_gakkyokushinsei = await gakkyokushinsei(headlessMode,testmode,gakuArr,j,res_gakkyoku,resArr,JorN,standfm_id);
          if(gakuArr.length == 1){
            await page2.close();  
            await context.close();
            await browser.close();
          }
          endTime = performance.now(); // 終了時間
          if(res_gakkyokushinsei == 0){
            console.log('==================================================')
            console.log('NexTone = ' + res_gakkyoku)
            console.log('[OK] ['+standfm_listNo + ']楽曲申請成功！ = ' + res_gakkyokushinsei + ' 楽曲申請成功！')  
            console.log('処理時間 : ' + ((endTime - startTime)/1000).toFixed(1) + ' 秒'); // 何ミリ秒かかったかを表示する
            console.log('==================================================')
          }else{
            console.log('==================================================')
            console.log('NexTone = ' + res_gakkyoku)
            console.log('[NG] ['+standfm_listNo + ']楽曲申請失敗！ = ' + res_gakkyokushinsei + ' 楽曲申請失敗！失敗！手動で楽曲申請してください！')  
            console.log('処理時間 : ' + ((endTime - startTime)/1000).toFixed(1) + ' 秒'); // 何ミリ秒かかったかを表示する
            console.log('==================================================')
            await page2.close();  
            await context.close();
            await browser.close();

            if(gakuArr.length -1 != j){
              console.log('')
              console.log('Start::::standfm_login  standfm_login')
              reslogin = 0;
              resArr = await standfm_login(headlessMode,standfm_id,standfm_pass);
              if(resArr != -1){
                console.log('standfm_login = OK!')   
                browser = resArr[0];//.push(browser,context,page2)
                context = resArr[1];
                page2   = resArr[2]; 
                reslogin = 0;
              }else{
                console.log('standfm_login = NG!')
                console.log('standfmログイン失敗！ メルアド or パスワード に誤りがあります！')
                console.log('standfmログイン失敗！ メルアド or パスワード に誤りがあります！')
                reslogin = -1;
              }
            }

          }
        }else{
          console.log('==================================================')
          console.log('NexTone = ' + res_gakkyoku)
          console.log('この曲は楽曲申請できません。「配信」可能か確認してください。')
          console.log('楽曲申請不可能 : ' + gakuArr[j])
          console.log('==================================================')
        }
      }

    }
})();




///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////

async function jasracdata(headlessMode,gakuArr,j){
  let urlnow = ''

  const browser = await chromium.launch({
    //headless: true  //false 画面あり　true 画面なし
    headless: headlessMode //false 画面あり　true 画面なし
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  const timeout  = 10000;
  //wtimeout =   2000;
  page.setDefaultTimeout(timeout);
  
  try{

    await page.goto('https://www2.jasrac.or.jp/eJwid/');
    await page.locator('#main_contents').click();
    await page.waitForTimeout(wtimeout);

    await page.getByRole('button', { name: '上記の内容に了承して 検索に進む' }).click();
    await page.waitForTimeout(wtimeout);

    await page.locator('input[name="IN_WORKS_CD"]').click();
    await page.waitForTimeout(wtimeout);

    await page.locator('input[name="IN_WORKS_CD"]').fill(gakuArr[j][0]);
    await page.waitForTimeout(wtimeout);
    
    await page.locator('body').press('PageDown');
    await page.waitForTimeout(wtimeout);
    const page1Promise = page.waitForEvent('popup');
    await page.waitForTimeout(wtimeout);
    await page.getByRole('button', { name: '検索' }).click();
    const page1 = await page1Promise;
    await page1.waitForTimeout(wtimeout);

    await page1.getByRole('link', { name: '配信' }).click();
    await page1.waitForTimeout(1000);

    await page1.locator('section').filter({ hasText: 'アーティスト名一覧' }).getByRole('link').nth(1).click();
    await page1.waitForTimeout(1000);

    let res_text = ""
    res_text = await page1.locator('.detail_iPhone_link').innerText();//作品コード  
    res_text += ',' + await page1.locator('.baseinfo--name').innerText();//作品名
    res_text += ',' + (await page1.locator('.content-block').nth(21).innerText()).split('\n')[2].split('\t')[1];//アーティスト
    text2 = await page1.$('//*[@id="tab-00-07"]/section/div[2]/div[1]/table/tbody');
    sakuArr = (await text2.innerText()).split('\n')
    let sakushi = 'なし';
    let sakukyoku = 'なし';
    for(i = 2 ; i < sakuArr.length ; i++){
      if(sakuArr[i].split('\t')[2] == '作詞'){
        sakushi = sakuArr[i].split('\t')[1]
        break;
      }
    }
    for(i = 2 ; i < sakuArr.length ; i++){
      if(sakuArr[i].split('\t')[2] == '作曲'){
        sakukyoku = sakuArr[i].split('\t')[1]
        break;
      }
    }

    res_text += ',' + sakushi
    res_text += ',' + sakukyoku


    let aaa = (await page1.$('//*[@id="main_contents"]/main/div[2]/div[2]/dl/dd/ul/li[2]'));//配信ボタンの色
    let haishinclass = (await aaa.innerHTML()).split('class=')[1].split('\"')[1]

    let res_haishin = -1;
    let haishin = (await page1.locator('.consent').nth(10).innerText()).split('\n');//配信
    if(haishin[0] == '配信' && haishin[2] == 'この利用分野は、JASRACが著作権を管理しています。'){
      if(haishinclass == 'field small purple on'){
        res_haishin = 0;
      }
    }


    await page.close();
    await page1.close();
    await context.close();
    await browser.close();

    if(res_haishin == 0){
      return res_text;
    }else{
      return -1;
    }

  } catch(e) {
    //await page.close();
    //await page1.close();
    //await context.close();
    await browser.close();

    console.error( "エラー：", e.message );

    return -1;
  }

}

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////

async function nextonedata(headlessMode,gakuArr,j){
  let urlnow = ''

  const browser = await chromium.launch({
    //headless: true  //false 画面あり　true 画面なし
    headless: headlessMode //false 画面あり　true 画面なし
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  const timeout  = 10000;
  //const wtimeout =   2000;
  page.setDefaultTimeout(timeout);
  
try{

  await page.goto('https://search.nex-tone.co.jp/terms;jsessionid=0161D3432E96D461116D25240D70CDEE?0');
  await page.waitForTimeout(wtimeout);
  await page.getByRole('button', { name: '以上に同意の上、作品データベースを利用する' }).click();
  await page.waitForTimeout(wtimeout);
  await page.locator('input[name="detail-condition-container\\:conditionPieceCd"]').click();
  await page.waitForTimeout(wtimeout);
  await page.locator('input[name="detail-condition-container\\:conditionPieceCd"]').fill(gakuArr[j][0]);
  await page.waitForTimeout(wtimeout);
  await page.getByRole('button', { name: '検索', exact: true }).click();
  await page.waitForTimeout(wtimeout);
  const page1Promise = page.waitForEvent('popup');
  await page.waitForTimeout(wtimeout);
  await page.locator('.result-value' ).nth(0).click();
  await page.waitForTimeout(wtimeout);
  const page1 = await page1Promise;
  await page1.waitForTimeout(wtimeout);

  //console.log('log-NexTone')
  let res_text = ""
  res_text  = await page1.locator('.piece-info-result-value').nth(0).innerHTML();//作品コード
  res_text += ',' + await page1.locator('.piece-info-result-value-title').nth(0).innerHTML();//作品名

  let artist = await page1.$('//*[@id="basic"]/div/div[4]/div[2]/div/div/table/tbody/tr/td[2]/span')//アーティスト名
  //console.log((await artist.innerText()))
  //  res_text += ',' + await page1.locator('.detail-common-info-result-value').nth(3).innerHTML();//アーティスト名
  res_text += ',' + (await artist.innerText())
  res_text += ',' + await page1.locator('#id20').nth(0).innerText();//作詞
  res_text += ',' + await page1.locator('#id21').nth(0).innerText();//作曲
  //console.log('作品コード,作品名,アーティスト名,作詞,作曲')
  //console.log(text2)

  let hai_uta   = await page1.$('//*[@id="basic"]/div/div[3]/div/div/table/tbody/tr[1]/td[9]')
  hai_uta = ((await hai_uta.innerHTML()).split('class=')[1].split('\"')[1])
  let hai_kyoku = await page1.$('//*[@id="basic"]/div/div[3]/div/div/table/tbody/tr[2]/td[9]')
  hai_kyoku = ((await hai_kyoku.innerHTML()).split('class=')[1].split('\"')[1])
 

  let res_haishin = -1;
  if(hai_uta == 'subright subright-manage' && hai_kyoku == 'subright subright-manage'){
    res_haishin = 0;
  }

  /*
  if(res_haishin == 0){
    console.log('配信状況 = ' + res_haishin + ' 配信OK')
  }else{
    console.log('配信状況 = ' + res_haishin + ' 配信NG NG NG')
  }
  */
  await context.close();
  await browser.close();

  if(res_haishin == 0){
    return res_text;
  }else{
    return -1;
  }

} catch(e) {
  //await page.close();
  //await page1.close();
  await context.close();
  await browser.close();

  console.error( "エラー：", e.message );

  return -1;
}

}



///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////

async function gakkyokushinsei(headlessMode,testmode,gakuArr,j,res_gakkyoku,resArr,JorN,standfm_id){
  let startTime = performance.now(); // 開始時間
  let endTime = performance.now(); // 終了時間


  let gakkyokuArr = res_gakkyoku.split(',')
  const code      = gakkyokuArr[0]
  const title     = gakkyokuArr[1]
  const artist    = gakkyokuArr[2]
  const sakushi   = gakkyokuArr[3]
  const sakukyoku = gakkyokuArr[4]
  const standfm_listNo  = String(gakuArr[j][1]);
  let browser = resArr[0];//.push(browser,context,page2)
  let context = resArr[1];
  let page2   = resArr[2];

  const timeout  = 10000;
  page2.setDefaultTimeout(timeout);


  let JASRACorNextone = '-1'
  let seikou = 0;
  //console.log('gakkyoku JorN ' + JorN)
  if(JorN == 'J'){
    JASRACorNextone =  'JASRAC'
  }else if(JorN == 'N'){
    JASRACorNextone =  'NexTone'
  }else{
    console.log('エラー！！ JASRACかNexToneが分かりません。')
  }

  //const timeout  = 120000;


  await page2.getByRole('img', { name: 'user' }).click();
  await page2.waitForTimeout(wtimeout);

  let xpathh = '//*[@id="root"]/div/div/div/div/div[1]/div/div[4]/div[1]/a/div/div[2]/div'
  let username = await page2.locator(xpathh).innerText();

  await page2.getByRole('link', { name: '放送リスト' }).click();
  await page2.waitForTimeout(wtimeout);

  await page2.getByRole('heading', { name: '放送リスト' }).click();
  for(let i = 1 ; i < parseInt(standfm_listNo, 10) ; i++){
    await page2.locator('body').press('ArrowDown');
    await page2.locator('body').press('ArrowDown');
    await page2.locator('body').press('ArrowDown');
    //await page2.locator('body').press('ArrowDown');
    await page2.waitForTimeout(500);

  }
  await page2.waitForTimeout(wtimeout);

  xpathh = '//*[@id="root"]/div/div/div/div/div[2]/div/div[2]/div/div/div[2]/div[1]/div/div[' + standfm_listNo + ']/div[1]/a/div/div/div[2]/div[1]/div'
  let archivename = await page2.locator(xpathh).innerText();

  
  xpathh = '//*[@id="root"]/div/div/div/div/div[2]/div/div[2]/div/div/div[2]/div[1]/div/div[' + standfm_listNo + ']/div[1]/a'
  //console.log('xpathh')
  //console.log(xpathh)
  await page2.locator(xpathh).click();
  await page2.waitForTimeout(wtimeout);
  xpathh = '//*[@id="root"]/div/div/div/div/div[2]/div[1]/div/div[2]/div/div/div[3]/div/div[1]/div[4]'
  await page2.locator(xpathh).click();
  const page3Promise = page2.waitForEvent('popup');
  await page2.waitForTimeout(wtimeout);
  await page2.locator('div:nth-child(7) > .css-175oi2r > svg').click();
  await page2.waitForTimeout(wtimeout);
  const page3 = await page3Promise;


  if(testmode == true){
    console.log('testmode 楽曲申請しません！ [' + standfm_listNo + '] コード[' + code + '] タイトル[' + title + '] アーカイブ['+ archivename + ']');
    await page3.close();
  }else{
    try{
      await page3.waitForTimeout(wtimeout);
      await page3.getByText('* 必須の質問です').click();
      await page3.locator('body').press('PageDown');
      await page3.locator('body').press('ArrowDown');
      await page3.getByRole('textbox', { name: 'メールアドレス' }).click();
      await page3.getByRole('textbox', { name: 'メールアドレス' }).fill(standfm_id);
      await page3.waitForTimeout(wtimeout);
      await page3.locator('body').press('PageDown');
      await page3.getByRole('radio', { name: JASRACorNextone }).click();
      await page3.waitForTimeout(wtimeout);
      await page3.getByRole('button', { name: '次へ' }).click();
      await page3.waitForTimeout(wtimeout);
      await page3.getByRole('textbox', { name: '①作品コード 必須の質問' }).click();
      await page3.getByRole('textbox', { name: '①作品コード 必須の質問' }).fill(code);
      await page3.getByRole('heading', { name: '①作品コード 必須の質問' }).click();
      await page3.waitForTimeout(wtimeout);
      await page3.getByRole('textbox', { name: '②作品タイトル 必須の質問' }).click();
      await page3.getByRole('textbox', { name: '②作品タイトル 必須の質問' }).fill(title);
      await page3.getByRole('heading', { name: '②作品タイトル 必須の質問' }).click();
      await page3.waitForTimeout(wtimeout);
      await page3.getByRole('textbox', { name: '③アーティスト名 必須の質問' }).click();
      await page3.getByRole('textbox', { name: '③アーティスト名 必須の質問' }).fill(artist);
      await page3.getByRole('heading', { name: '③アーティスト名 必須の質問' }).click();
      await page3.locator('body').press('PageDown');
      await page3.waitForTimeout(wtimeout);
      await page3.getByRole('textbox', { name: '④作詞者 必須の質問' }).click();
      await page3.getByRole('textbox', { name: '④作詞者 必須の質問' }).fill(sakushi);
      await page3.getByRole('heading', { name: '④作詞者 必須の質問' }).click();
      await page3.waitForTimeout(wtimeout);
      await page3.getByRole('textbox', { name: '⑤作曲者 必須の質問' }).click();
      await page3.getByRole('textbox', { name: '⑤作曲者 必須の質問' }).fill(sakukyoku);
      await page3.getByRole('heading', { name: '⑤作曲者 必須の質問' }).click();
      await page3.waitForTimeout(wtimeout);
      await page3.locator('body').press('ArrowDown');
      await page3.locator('body').press('ArrowDown');
      await page3.locator('body').press('ArrowDown');
      await page3.waitForTimeout(wtimeout);
      await page3.getByRole('button', { name: '次へ' }).click();
      await page3.waitForTimeout(wtimeout);
      await page3.getByText('* 必須の質問です').click();
      await page3.locator('body').press('PageDown');
      await page3.waitForTimeout(wtimeout);
      await page3.getByRole('checkbox', { name: '回答のコピーを自分宛に送信する' }).click();
      await page3.waitForTimeout(wtimeout);

      await page3.getByRole('button', { name: '送信' }).click();
      await page3.waitForTimeout(wtimeout);
      await page3.getByRole('heading', { name: 'stand.fm楽曲利用申請' }).click();
      await page3.waitForTimeout(wtimeout);
      seikou = 0;
      await write_log('[OK] [' + standfm_listNo + '] コード[' + code + '] タイトル[' + title + '] アーカイブ['+ archivename + ']',seikou);
      console.log('[OK] [' + standfm_listNo + '] コード[' + code + '] タイトル[' + title + '] アーカイブ['+ archivename + ']');
      await page3.close();
    }catch (e){
      if(gakuArr.length -1 == j){
        await page3.close();
        await page2.close();
        await context.close();
        await browser.close();
      }else{
        await page3.close();
        await page2.waitForTimeout(wtimeout)
        await page2.getByRole('dialog').locator('g path').first().click();  
      }
      console.log('[NG] [' + standfm_listNo + '] コード[' + code + '] タイトル[' + title + '] アーカイブ['+ archivename + ']');
      return -1;
    }
  }



  try{

    //内容の編集
    await page2.waitForTimeout(wtimeout);
    await page2.getByRole('link',{ name: '放送内容の 編集'}).click();

    //放送の概要・ハッシュタグ・補足情報など
    await page2.waitForTimeout(wtimeout);
    await page2.getByPlaceholder('放送の概要・ハッシュタグ・補足情報など').click();
    await page2.waitForTimeout(wtimeout);
    await page2.getByPlaceholder('放送の概要・ハッシュタグ・補足情報など').press('Home');
    await page2.getByPlaceholder('放送の概要・ハッシュタグ・補足情報など').press(' ');
    await page2.getByPlaceholder('放送の概要・ハッシュタグ・補足情報など').press('Meta+a');
    await page2.getByPlaceholder('放送の概要・ハッシュタグ・補足情報など').press('Meta+c');
    await page2.getByPlaceholder('放送の概要・ハッシュタグ・補足情報など').fill('APP楽曲申請済み [' + code + '🌸' +title + ']\n');
    await page2.getByPlaceholder('放送の概要・ハッシュタグ・補足情報など').press('Meta+v');
    await page2.waitForTimeout(2000);

    await page2.waitForTimeout(wtimeout);    
    await page2.getByPlaceholder('タイトルを入力').click();
    await page2.waitForTimeout(wtimeout);
    await page2.getByPlaceholder('タイトルを入力').press('Meta+a');//Ctrl + a
    await page2.getByPlaceholder('タイトルを入力').press('Meta+c');//Ctrl + c
    await page2.getByPlaceholder('タイトルを入力').fill(' [楽曲申請済み]');
    await page2.getByPlaceholder('タイトルを入力').press('ArrowUp');
    await page2.getByPlaceholder('タイトルを入力').press('Meta+v');//Ctrl + V
    //await page2.getByPlaceholder('公開範囲').click();
    //await page2.locator('div').filter({ hasText: /^全体に公開$/ }).nth(2).click();
    await page2.getByText('公開範囲必須').click();
    //    await page2.locator('body').press('ArrowDown');
    //  await page2.locator('body').press('ArrowDown');
    //await page2.locator('body').press('ArrowDown');
    await page2.waitForTimeout(2000);


/////////////////////////////  
/////////////////////////////  
/////////////////////////////  

  //カテゴリ
  //カテゴリ
  //カテゴリのbox内容
  xpathh = '//*[@id="root"]/div/div/div/div/div[2]/div/div[2]/div/div/div/div[2]/div[4]/div[2]/div/div/div[1]/div'
  //console.log(await page2.locator(xpathh).nth(0).innerText())
  let category1 = await page2.locator(xpathh).nth(0).innerText()

  if(category1 == '選択してください'){
    //console.log('カテゴリ ： 選択してください')
    await page2.locator('.css-1v8asev-control > .css-1wy0on6').first().click();
    await page2.waitForTimeout(wtimeout);
    await page2.locator('body').press('Enter');
    category1 = await page2.locator(xpathh).nth(0).innerText()
    console.log('     修正済みカテゴリ[' + category1 +']')
      //await page2.locator('#react-select-4-option-' + String(category-1)).click();
  }else{
    category1 = await page2.locator(xpathh).nth(0).innerText()
    console.log('     修正不要カテゴリ[' + category1 +']')
  }


  //露骨な表現
  //露骨な表現
  //露骨な表現のbox内容
  xpathh = '//*[@id="root"]/div/div/div/div/div[2]/div/div[2]/div/div/div/div[2]/div[5]/div[2]/div/div/div[1]/div'
  //console.log(await page2.locator(xpathh).nth(0).innerText())
  let rokotsuna = await page2.locator(xpathh).nth(0).innerText()


  if(rokotsuna == '選択してください'){
    //露骨な表現🔽クリック
    await page2.locator('div:nth-child(5) > div:nth-child(2) > .css-b62m3t-container > .css-1v8asev-control > .css-1wy0on6').click();
    await page2.waitForTimeout(wtimeout);

    //露骨な表現内容を決定
    await page2.getByText('露骨な表現を含まない').nth(1).click();
    await page2.waitForTimeout(wtimeout);
    rokotsuna = await page2.locator(xpathh).nth(0).innerText()
    //console.log('[OK] 修正済み[' + rokotsuna +']')

  }else if(rokotsuna == '露骨な表現を含む'){
    //露骨な表現🔽クリック
    await page2.locator('div:nth-child(5) > div:nth-child(2) > .css-b62m3t-container > .css-1v8asev-control > .css-1wy0on6').click();
    await page2.waitForTimeout(wtimeout);

    //露骨な表現内容を決定
    await page2.locator('body').press('ArrowUp');
    await page2.getByText('露骨な表現を含まない').nth(1).click();
    await page2.waitForTimeout(wtimeout);
    rokotsuna = await page2.locator(xpathh).nth(0).innerText()
    endTime = performance.now(); // 終了時間
    console.log('     経過時間 : ' + ((endTime - startTime)/1000).toFixed(1) + ' 秒'); // 何ミリ秒かかったかを表示する
      //console.log('[OK] 修正済み[' + rokotsuna +']')
  }else{
    seikou = 0;
    await write_log('[OK][' + standfm_listNo + '] 修正不要[' + archivename + '] ユーザー名[' + username + ']' , seikou);
    rokotsuna = await page2.locator(xpathh).nth(0).innerText()
    console.log('[OK] 修正不要！[' + rokotsuna +']');
    console.log('[OK] ['+ archivename + ']');
    console.log('[OK] アーカイブ順[' + standfm_listNo + ']');
    rokotsuna = await page2.locator(xpathh).nth(0).innerText()
    endTime = performance.now(); // 終了時間
    console.log('     経過時間 : ' + ((endTime - startTime)/1000).toFixed(1) + ' 秒'); // 何ミリ秒かかったかを表示する
  } 

/////////////////////////////  
/////////////////////////////  
/////////////////////////////  


    
    if(testmode == true){
      console.log('testmode 放送内容を更新なし [' + standfm_listNo + '] コード[' + code + '] タイトル[' + title + '] アーカイブ['+ archivename + ']');

    }else{
      //保存ボタン
      let xpathh = '//*[@id="root"]/div/div/div/div/div[2]/div/div[2]/div/div/div/div[2]/div[10]/div/div'
      await page2.locator(xpathh).click();
      await page2.waitForTimeout(wtimeout);
      //閉じる
      await page2.locator('div').filter({ hasText: /^閉じる$/ }).nth(2).click();
      await page2.waitForTimeout(wtimeout)
      await write_log('[OK] [' + standfm_listNo + '] 放送の概要へ記載済み コード[' + code + '] タイトル[' + title + '] アーカイブ['+ archivename + ']',seikou);
      console.log('[OK] [' + standfm_listNo + '] 放送の概要へ記載済み => APP楽曲申請済み [' + code + '] アーカイブ['+ archivename + ']');
    }

    if(gakuArr.length -1 == j){
      //await page3.close();
      await page2.close();
      await context.close();
      await browser.close();
    }

    return 0;

  } catch(e) {

    if(gakuArr.length -1 == j){
      await page3.close();
      await page2.close();
      await context.close();
      await browser.close();
    }else{
      await page3.close();
      await page2.waitForTimeout(wtimeout)
      //await page2.getByRole('dialog').locator('g path').first().click();
    }

    seikou = -1;
    await write_log('[NG] [' + standfm_listNo + '] 楽曲申請失敗 コード[' + code + '] タイトル[' + title + '] アーカイブ['+ archivename + ']',seikou);
    console.log('[NG] [' + standfm_listNo + '] 楽曲申請失敗 コード[' + code + '] タイトル[' + title + '] アーカイブ['+ archivename + ']');

    return -1;
  }  
}


async function standfm_login(headlessMode,standfm_id,standfm_pass){
  const browser = await chromium.launch({
    //headless: true  //false 画面あり　true 画面なし
    headless: headlessMode //false 画面あり　true 画面なし
  });
  const context = await browser.newContext();
  const page2 = await context.newPage();
  const timeout  = 120000;

try{  

  await page2.goto('https://stand.fm/');
  await page2.waitForTimeout(wtimeout);
  await page2.getByRole('link', { name: '新規登録・ログイン' }).click();
  await page2.waitForTimeout(wtimeout);
  await page2.getByRole('heading', { name: 'ログイン' }).click();
  await page2.locator('body').press('ArrowDown');
  await page2.locator('body').press('ArrowDown');
  await page2.locator('body').press('ArrowDown');
  await page2.getByPlaceholder('メールアドレス').click();
  await page2.getByPlaceholder('メールアドレス').fill(standfm_id);
  await page2.getByPlaceholder('パスワード').click();
  await page2.getByPlaceholder('パスワード').fill(standfm_pass);
  await page2.waitForTimeout(wtimeout);
  await page2.locator('div').filter({ hasText: /^ログイン$/ }).nth(1).click();
  await page2.waitForTimeout(wtimeout);

  await page2.getByRole('img', { name: 'user' }).click();
  await page2.goto('https://stand.fm/');

  resArr = [];
  resArr.push(browser,context,page2)
  if(resArr.length != 0 ){
    return resArr;
  }else{
    await browser.close();
    retrun -1;
  }
}catch(e){
  await browser.close();
  return -1;
}

}




async function get_ymd(){
    //const japanTime = new Date().toLocaleString({ timeZone: 'Asia/Tokyo' });
    const japanTime = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
    let today = new Date();
    let yymmdd =new Date(japanTime).getFullYear();
    //let yymmdd = today.getFullYear();
    if(parseInt(new Date(japanTime).getMonth(), 10) + 1 < 10){
      yymmdd += '/0' + String(parseInt(new Date(japanTime).getMonth(), 10) + 1);
    }else{
      yymmdd += '/' + String(parseInt(new Date(japanTime).getMonth(), 10) + 1);
    }
    if(new Date(japanTime).getDate() < 10){
      yymmdd += '/0' + String(new Date(japanTime).getDate());
    }else{
      yymmdd += '/' + String(new Date(japanTime).getDate());
    }
    if(new Date(japanTime).getHours() < 10){
      yymmdd += ' 0' + String(new Date(japanTime).getHours());
    }else{
      yymmdd += ' ' + String(new Date(japanTime).getHours());
    }
    if(new Date(japanTime).getMinutes() < 10){
      yymmdd += ':0' + String(new Date(japanTime).getMinutes());
    }else{
      yymmdd += ':' + String(new Date(japanTime).getMinutes());
    }
    if(new Date(japanTime).getSeconds() < 10){
      yymmdd += ':0' + String(new Date(japanTime).getSeconds());
    }else{
      yymmdd += ':' + String(new Date(japanTime).getSeconds());
    }
      //console.log(yymmdd)
  
    return yymmdd
}

app.get('/', (req, res) => {
  res.send(text1);

  console.log('log : app.get() ' + text1);

});

async function get_1line(arg1){
  const fs = require("fs");
  // ファイルをUTF-8として同期で読み込む
  const onetimepass = fs.readFileSync(process.argv[arg1],"utf8")//process.argv[2]コマンドラインパラメータ１個目
  return onetimepass
}

async function write_log(text,seikou){
  let fs = require("fs");
   
  // 同期で行う場合
  let ymd = await get_ymd();


  try {
    if(seikou == 0){
      fs.appendFileSync('./logfile/g_oklog', ymd + ' ' + text + '\n');      
    }else{
      fs.appendFileSync('./logfile/g_errlog', ymd + ' ' + text + '\n'); 
    }
    //console.log('write end');
  }catch(e){
    //console.log(e);
  }
  
}