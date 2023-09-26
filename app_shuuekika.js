const headlessMode = true;//false 画面あり　true 画面なし

const { chromium } = require('playwright');
const wtimeout =   1500;

//const readline = require('readline/promises');

(async () => {

   
  let koumoku      = ''
  let standfm_id   = ''
  let standfm_pass = ''
  let editstart    = 1;
  let editend      = 1;
  let category     = 1;
  let res_koumoku  = 0;  
  koumoku = process.argv[2];
  if(koumoku != ''){
    let koumokuArr = koumoku.split('\n');
    //console.log(koumokuArr);	 
    let ii = 0;
    for(let i = 0 ; i < koumokuArr.length ; i++){
      if(koumokuArr[0] != ''){
          ii = 0;
      }else{
          ii = 1;
      }

      if(i == ii){
        standfm_id = koumokuArr[i];
      }
      if(i == ii+1){
        standfm_pass = koumokuArr[i];
      }
      if(i == ii+2 && koumokuArr[i].length != 0){
        editstart = parseInt(koumokuArr[i], 10);
      }
      if(i == ii+3 && koumokuArr[i].length != 0){
        editend = parseInt(koumokuArr[i], 10);
      }
      if(i == ii+4){
        if(koumokuArr[i].length != 0){
          if(!isNaN(koumokuArr[i]) && parseInt(koumokuArr[i], 10) <= 10){
            category = parseInt(koumokuArr[i], 10);
            //console.log('1 i ' + i + ' category ' + category)
          }else{
            category = 10;//雑談　入力が無ければ雑談にする
            //console.log('2 i ' + i + ' category ' + category)
          }  
        }else{
          category = 10;//雑談　入力が無ければ雑談にする
          //console.log('3 i ' + i + ' category ' + category)
        }
      }
    }
    for(i = 0 ; i <= 50 ; i++){
      console.log('');
    }
    console.log('メルアド　　：' + standfm_id.slice(0,5)+'**********');
    console.log('パスワード　：' + standfm_pass.slice(0,1)+'**********');
    console.log('編集Start　 ：' + editstart);
    console.log('編集End　　 ：' + editend);
    let categoryname = await category_name(category);
    console.log('カテゴリ　　：' + categoryname);

    let reslogin = -1;
    let browser ;//resArr[0];//.push(browser,context,page2)
    let context ;//= resArr[1];
    let page2   ;//= resArr[2];
    let resArr  ;
    let seikou = -1;

    L1:{
      if(res_koumoku == -1){
          console.log('[NG] standfm_login前 ' + res_koumoku );
          await write_log('[NG] standfm_login前 ' + res_koumoku ,seikou);
          break L1; 
      }else if(standfm_id == ''){
          console.log('[NG] standfm_login前 standfm_id == \'\'')
          await write_log('[NG] standfm_login前 standfm_id == \'\'' ,seikou);
          break L1; 

      }else if(standfm_pass == ''){
          console.log('[NG] standfm_login前 standfm_pass == \'\'')
          await write_log('[NG] standfm_login前 standfm_pass == \'\'' ,seikou);
          break L1; 
      }
      console.log('')
      console.log('Start::::standfm_login  standfm_login')
      resArr = await standfm_login(headlessMode,standfm_id,standfm_pass);
      if(resArr != -1){
          console.log('standfm_login = OK!')    
          reslogin = 0;
      }else{
          console.log('standfm_login = NG!')
          let ngword = 'standfmログイン失敗！ メルアド or パスワード に誤りがあります！'
          console.log(ngword)
          console.log(ngword)
          await write_log(ngword ,seikou);
      }
      browser = resArr[0];//.push(browser,context,page2)
      context = resArr[1];
      page2   = resArr[2];
        
    } 



    let res_edit_rokotsu = '';
    for(let j = editstart ; j <= editend ; j++){
      if(reslogin == -1){
          break;
      }
      if(res_koumoku == -1){
          await browser.close();
          break;
      }
      if(j != 0){
        console.log('')
        console.log('Start::::露骨な表現の修正  露骨な表現の修正')
      }
      res_edit_rokotsu = await edit_rokotsu(headlessMode,j,resArr,category);
      if(res_edit_rokotsu == 0){
        console.log('===============================================')
        console.log('露骨な表現の修正 = 成功！')  
        console.log('===============================================')
        console.log('')
      }else{
        console.log('===============================================')
        console.log('露骨な表現の修正 = 失敗　手動で修正してください！')  
        console.log('===============================================')
        console.log('')
      }
      if(editend == j){
        await page2.close();  
        await context.close();
        await browser.close();
      }
    }
  }
})();

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////

async function edit_rokotsu(headlessMode,j,resArr,category){
  const standfm_listNo  = String(j);
  const browser = resArr[0];//.push(browser,context,page2)
  const context = resArr[1];
  const page2   = resArr[2];

  const timeout  = 120000;
  let username = '' ;
  let archivename = '' ;
  let noedit = 0;
  let seikou = 0;

  //await page2.goto('https://stand.fm/');

  await page2.getByRole('img', { name: 'user' }).click();
  await page2.waitForTimeout(wtimeout);

  let xpathh = '//*[@id="root"]/div/div/div/div/div[1]/div/div[4]/div[1]/a/div/div[2]/div'
  username = await page2.locator(xpathh).innerText();

  await page2.getByRole('link', { name: '放送リスト' }).click();
  await page2.waitForTimeout(wtimeout);

  await page2.getByRole('heading', { name: '放送リスト' }).click();
  for(let i = 1 ; i < parseInt(standfm_listNo, 10) ; i++){
    await page2.locator('body').press('ArrowDown');
    await page2.locator('body').press('ArrowDown');
    await page2.locator('body').press('ArrowDown');
    await page2.locator('body').press('ArrowDown');
    await page2.waitForTimeout(600);

  }
  await page2.waitForTimeout(wtimeout);

  xpathh = '//*[@id="root"]/div/div/div/div/div[2]/div/div[2]/div/div/div[2]/div[1]/div/div[' + standfm_listNo + ']/div[1]/a/div/div/div[2]/div[1]/div'
  archivename = await page2.locator(xpathh).innerText();

  noedit = archivename.indexOf('#NoEDIT');
  if(noedit != -1){
    await write_log('[OK] #NoEDITのため修正なし アーカイブ順[' + standfm_listNo + '] 露骨な表現修正なし[' + archivename + '] ユーザー名[' + username + ']' , seikou);
    console.log('#NoEDITあり! 露骨な表現を修正しませんでした。');
    console.log('アーカイブ順[' + standfm_listNo + ']');
    console.log('修正しなかったアーカイブ['+ archivename + ']');
    return 0;
  }

  //アーカイブをクリック
  xpathh = '//*[@id="root"]/div/div/div/div/div[2]/div/div[2]/div/div/div[2]/div[1]/div/div[' + standfm_listNo + ']/div[1]/a/div/div/div[2]/div[1]/div'
  await page2.locator(xpathh).click();
  await page2.waitForTimeout(wtimeout);

  //右下リンク
  xpathh = '//*[@id="root"]/div/div/div/div/div[2]/div[1]/div/div[2]/div/div/div[3]/div/div[1]/div[4]'
  await page2.locator(xpathh).click();
  await page2.waitForTimeout(wtimeout);


  //内容の編集
  await page2.getByRole('link',{ name: '放送内容の 編集'}).click();
  await page2.waitForTimeout(wtimeout);


  //カテゴリ
  //カテゴリ
  //カテゴリのbox内容
  xpathh = '//*[@id="root"]/div/div/div/div/div[2]/div/div[2]/div/div/div/div[2]/div[4]/div[2]/div/div/div[1]/div'
  //console.log(await page2.locator(xpathh).nth(0).innerText())
  let category1 = await page2.locator(xpathh).nth(0).innerText()

  if(category1 == '選択してください'){
    //console.log('カテゴリ ： 選択してください')
    await page2.locator('.css-1v8asev-control > .css-1wy0on6').first().click();
    await page2.locator('#react-select-4-option-' + String(category-1)).click();
  }else{
    //console.log('カテゴリ ： ' + category1)
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
    await page2.waitForTimeout(wtimeout+3000);
  }else if(rokotsuna == '露骨な表現を含む'){
    //露骨な表現🔽クリック
    await page2.locator('div:nth-child(5) > div:nth-child(2) > .css-b62m3t-container > .css-1v8asev-control > .css-1wy0on6').click();
    await page2.waitForTimeout(wtimeout);

    //露骨な表現内容を決定
    await page2.locator('body').press('ArrowUp');
    await page2.getByText('露骨な表現を含まない').nth(1).click();
    await page2.waitForTimeout(wtimeout);
  }else{
    seikou = 0;
    await write_log('[OK] 修正不要 アーカイブ順[' + standfm_listNo + '] 露骨な表現を含まない[' + archivename + '] ユーザー名[' + username + ']' , seikou);
    console.log('[OK] 修正不要！露骨な表現を含まない['+ archivename + ']');
    console.log('[OK] アーカイブ順[' + standfm_listNo + ']');
    return 0;
  } 



  try{
    //保存ボタン
    xpathh = '//*[@id="root"]/div/div/div/div/div[2]/div/div[2]/div/div/div/div[2]/div[10]/div/div'
    await page2.locator(xpathh).click();
    await page2.waitForTimeout(wtimeout+1000);

    //閉じる
    await page2.locator('div').filter({ hasText: /^閉じる$/ }).nth(2).click();
    await page2.waitForTimeout(wtimeout+1)

    seikou = 0;
    await write_log('[OK] 修正済み アーカイブ順[' + standfm_listNo + '] 露骨な表現を含まないに修正済み[' + archivename + '] ユーザー名[' + username + ']' , seikou);
    console.log('[OK] 露骨な表現を含まないに修正済み['+ archivename + ']');
    console.log('[OK] アーカイブ順[' + standfm_listNo + ']');

    return 0;

  } catch(e) {
    seikou = -1;
    await write_log('[NG] 修正失敗 アーカイブ順[' + standfm_listNo + '] 露骨な表現を含まないに修正を失敗したアーカイブ名[' + archivename + '] ユーザー名[' + username + ']' , seikou);
    console.log('失敗! 露骨な表現を修正できませんでした');
    console.log('[NG] アーカイブ順[' + standfm_listNo + ']');
    console.log('[NG] 露骨な表現を修正できなかったアーカイブ['+ archivename + ']');
    return -1;
  }  
}


async function standfm_login(headlessMode,standfm_id,standfm_pass){
  //const id_pass   = await get_1line(3);//id,pass
  //const id_passArr = id_pass.split(',');
  //const standfm_id   = id_passArr[0];
  //const standfm_pass = id_passArr[1];

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
  let seikou = -1;
  await write_log('[NG] standfm_login() ERR ' + e.message, seikou);
  return -1;
}

}


async function get_ymd_(){
    //const japanTime = new Date().toLocaleString({ timeZone: 'Asia/Tokyo' });
    const japanTime = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
    let today = new Date();
    let yymmdd =new Date(japanTime).getFullYear();
    //let yymmdd = today.getFullYear();
    if(parseInt(new Date(japanTime).getMonth(), 10) + 1 < 10){
      yymmdd += '0' + String(parseInt(new Date(japanTime).getMonth(), 10) + 1);
    }else{
      yymmdd += '' + String(parseInt(new Date(japanTime).getMonth(), 10) + 1);
    }
    if(new Date(japanTime).getDate() < 10){
      yymmdd += '0' + String(new Date(japanTime).getDate());
    }else{
      yymmdd += '' + String(new Date(japanTime).getDate());
    }
    if(new Date(japanTime).getHours() < 10){
      yymmdd += '_0' + String(new Date(japanTime).getHours());
    }else{
      yymmdd += '_' + String(new Date(japanTime).getHours());
    }
    if(new Date(japanTime).getMinutes() < 10){
      yymmdd += '0' + String(new Date(japanTime).getMinutes());
    }else{
      yymmdd += '' + String(new Date(japanTime).getMinutes());
    }
    if(new Date(japanTime).getSeconds() < 10){
      yymmdd += '.0' + String(new Date(japanTime).getSeconds());
    }else{
      yymmdd += '.' + String(new Date(japanTime).getSeconds());
    }
      //console.log(yymmdd)
  
    return yymmdd
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
/*
app.get('/', (req, res) => {
  res.send(text1);

  console.log('log : app.get() ' + text1);

});
*/
async function get_1line(arg1){
  const fs = require("fs");
  // ファイルをUTF-8として同期で読み込む
  const onetimepass = fs.readFileSync(process.argv[arg1],"utf8")//process.argv[2]コマンドラインパラメータ１個目
  return onetimepass
}

async function category_name(category){
  let categoryname = ''
  if(category == 1){
    categoryname = 'ミュージック'
  }else if(category == 2){
    categoryname = 'エンタメ'
  }else if(category == 3){
    categoryname = 'スポーツ'
  }else if(category == 4){
    categoryname = 'カルチャー'
  }else if(category == 5){
    categoryname = 'クリエイティブ・テック'
  }else if(category == 6){
    categoryname = 'ビジネス'
  }else if(category == 7){
    categoryname = 'ライフスタイル・生活'
  }else if(category == 8){
    categoryname = '恋愛'
  }else if(category == 9){
    categoryname = '美容・メイク'
  }else if(category == 10){
    categoryname = 'トーク・雑談'
  }else{
    categoryname = 'エラー'
  }
  return categoryname;
}

async function write_log(text,seikou){
    let fs = require("fs");
     
    // 同期で行う場合
    let ymd = await get_ymd();


    try {
      if(seikou == 0){
        fs.appendFileSync('./logfile/oklog', ymd + ' ' + text + '\n');      
      }else{
        fs.appendFileSync('./logfile/errlog', ymd + ' ' + text + '\n'); 
      }
      //console.log('write end');
    }catch(e){
      //console.log(e);
    }
    
  }

  async function regex(text){

    let JorN1 = text.slice(0,1)
    let regex ;
    
    if(!isNaN(JorN1)){//JASRAC
        //正規表現パターン（???-????-?）
        regex = new RegExp(/^[a-zA-Z0-9]{3}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{1}$/);
        //判定
        if (regex.test(text)) {
            //console.log("正規表現パターンに一致しています。 "+ text);
            return 0;
        }else{
            //console.log("正規表現パターンに一致していません。 " + text);
            return '[NG]JASRAC作品コード不一致 : ???-????-?　よく確認してください。';
        }

    }else{//NexTone
        regex = new RegExp(/^[a-zA-Z]{1}[0-9]{8}$/);
        //判定
        if (regex.test(text)) {
            //console.log("正規表現パターンに一致しています。 "+ text);
            return 0;
        }else{
            //console.log("正規表現パターンに一致していません。 " + text);
            return '[NG]NexTone作品コード不一致 : N？？？？？？？？　よく確認してください。';
        }    
    }





  }
