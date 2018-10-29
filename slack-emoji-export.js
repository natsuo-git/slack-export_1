'use strict';
const Slack = require('slack-node');
const request = require('request');
const fs = require('fs');

// 最初にimageフォルダ作成
try {
  fs.mkdirSync('image');
} catch (e) {
  // ignore
}

const apiToken = '<your Token>'; // ここにAPIトークンを貼り付ける。
const slack = new Slack(apiToken);
const intervalMillisec = 200;

slack.api('emoji.list', (err, response) => {
  const emoji = response.emoji;
  const keys = [];
  for (let k in emoji) {
    keys.push(k);
  }
  let index = 0;

  function storeNextEmoji() {
    const key = keys[index];
    index++;

    // keyがなければ終了
    if (!key) {
      console.log('Finished.');
      return;
    }

    const url = emoji[key];

    // 存在しない場合やエイリアスは無視
    if (!url || url.match(/alias/)) {
      storeNextEmoji();
      return;
    }

    console.log('Downloading:');
    console.log(key);
    console.log(url);

    const extention = url.match(/\.[^\.]+$/);

    request
      .get(url)
      .on('response', response => {
        console.log('StatusCode:');
        console.log(response.statusCode);
        setTimeout(storeNextEmoji, intervalMillisec);
      })
      .on('error', error => {
        if (error) {
          console.log('Error:');
          console.log(error);
        }
      })
      .pipe(fs.createWriteStream('image/' + key + extention));
  }

  storeNextEmoji();
});
