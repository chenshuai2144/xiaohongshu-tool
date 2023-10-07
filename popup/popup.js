const getCommentListToCSV = () => {
  function formatDate(date, format, day) {
    const map = {
      mm: date.getMonth() + 1,
      dd: date.getDate() - day || 0,
      yyyy: date.getFullYear(),
    };

    return format.replace(/mm|dd|yyyy/gi, (matched) => map[matched]);
  }

  const today = formatDate(new Date(), 'yyyy-mm-dd');
  const yesDay = formatDate(new Date(), 'yyyy-mm-dd', 1);
  const qianDay = formatDate(new Date(), 'yyyy-mm-dd', 2);

  const getCommentListData = (doc, parentClassName) => {
    let list = [];

    doc
      .querySelectorAll(parentClassName + '.list-container>.comment-item')
      .forEach((childrenItem) => {
        const text = childrenItem.querySelector('.right .content').textContent;
        const name = childrenItem.querySelector(
          '.right .author .name'
        ).textContent;
        const time =
          childrenItem.querySelector('.right .info span').textContent;
        const location = childrenItem.querySelector(
          '.right .info .location'
        ).textContent;

        const itemData = {
          名称: name,
          内容: text,
          回复时间: time
            .replace('今天', today + '(今天)')
            .replace('昨天', yesDay + '(昨天)')
            .replace('前天', qianDay + '(前天)'),
          区域: location,
        };

        if (childrenItem.querySelector('.reply-container')) {
          itemData.回复 = getCommentListData(
            childrenItem.querySelector('.reply-container'),
            '.reply-container>'
          );
        }

        list.push(itemData);
      });

    return list;
  };
  function convertToCsv(arr, hideHeader) {
    if (!arr[0]) return '';

    var header = Object.keys(arr[0]).join() + '\n';
    var body = arr
      .filter((item) => !!item)
      .map((item) => {
        return Object.values(item).join() + '\n';
      })
      .join('');

    if (hideHeader) {
      return body;
    }
    return header + body;
  }

  document.querySelectorAll('.show-more').forEach((item) => {
    item.click();
  });

  const list = getCommentListData(document, '.comments-container>')
    .map((item) => {
      if (item.回复) {
        const l = [...item.回复];
        delete item.回复;
        return [
          { 回复: '', ...item },
          ...l.map((subItem) => {
            delete subItem.回复;
            return { 回复: '回复->' + item.名称, ...subItem };
          }),
        ];
      }
    })
    .flat(1);

  var csvData = '\ufeff' + convertToCsv(list);
  var blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  var downloadUrl = URL.createObjectURL(blob);

  var link = document.createElement('a');
  link.href = downloadUrl;
  link.download = location.pathname.split('/').pop() + '.csv';
  link.click();
};

const getCommentListToHTML = () => {
  function formatDate(date, format, day) {
    const map = {
      mm: date.getMonth() + 1,
      dd: date.getDate() - day || 0,
      yyyy: date.getFullYear(),
    };

    return format.replace(/mm|dd|yyyy/gi, (matched) => map[matched]);
  }

  const today = formatDate(new Date(), 'yyyy-mm-dd');
  const yesDay = formatDate(new Date(), 'yyyy-mm-dd', 1);
  const qianDay = formatDate(new Date(), 'yyyy-mm-dd', 2);
  const getHtmlCommentListData = (doc, parentClassName) => {
    const innerList = [];

    doc
      .querySelectorAll(parentClassName + '.list-container>.comment-item')
      .forEach((childrenItem) => {
        const avatar = childrenItem.querySelector(
          '.avatar>a>img.avatar-item'
        ).src;
        const text =
          childrenItem.querySelector('.right .content').innerHTML ||
          childrenItem.querySelector('.right .comment-picture').innerHTML;
        const name = childrenItem.querySelector(
          '.right .author .name'
        ).innerHTML;
        const time = childrenItem.querySelector('.right .info span').innerHTML;
        const location = childrenItem.querySelector(
          '.right .info .location'
        ).innerHTML;

        const itemData = {
          名称: name,
          内容: text,
          头像: avatar,
          子回复: '',
          回复时间: time
            .replace('今天', today + '(今天)')
            .replace('昨天', yesDay + '(昨天)')
            .replace('前天', qianDay + '(前天)'),
          区域: location,
        };

        if (childrenItem.querySelector('.reply-container')) {
          itemData.子回复 = getHtmlCommentListData(
            childrenItem.querySelector('.reply-container'),
            '.reply-container>'
          );
        } else {
          delete itemData.子回复;
        }

        innerList.push(itemData);
      });
    return innerList;
  };

  document.querySelectorAll('.show-more').forEach((item) => {
    item.click();
  });

  const list = getHtmlCommentListData(document, '.comments-container>');

  const renderToItem = (subList, subIndex) => {
    const list = subList.map((item, index) => {
      return `
    <li class="media"> 
    <div class="media-left">
      <a href="#" one-link-mark="yes">
        <img class="media-object"  alt="64x64" style="width: 32px; height: 32px;" src="${
          item.头像
        }" data-holder-rendered="true">
      </a>
    </div>
    <div class="media-body">
      <h4 class="media-heading">${item.名称}</h4>
      <p>${item.内容}</p>
      <p>${item.回复时间} ${item.区域}</p>
    
      ${item.子回复?.length ? renderToItem(item.子回复, index + 1) : ''}
    </div>
    </li>`;
    });
    return `  ${
      subIndex
        ? `<p><a class="exx-comment" style="cursor: pointer;" id="item-${subIndex}">收起回复</a></p>`
        : ''
    }
    <ul class="media-list" id=${subIndex}> 
      ${list.join('\n')}
  </ul>`;
  };

  var htmlData = renderToItem(list);
  var imgList = [];
  document
    .querySelectorAll('.swiper-slide')
    .forEach((item) =>
      imgList.push(
        item.style['backgroundImage'].replace('url("', '').replace('")', '')
      )
    );

  if (imgList.length === 0) {
    document
      .querySelectorAll('xgplayer-poster')
      .forEach((item) =>
        imgList.push(
          item.style['backgroundImage'].replace('url("', '').replace('")', '')
        )
      );
  }
  imgList = [...new Set(imgList)];

  var blob = new Blob(
    [
      '\ufeff' +
        `<html lang="en">
  <head>
     <title>${document.title}</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <link rel="stylesheet" href="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">
    <style>.note-content-emoji{width: 20px;height: 20px;}</style>
  </head>
  <body>
    <div class="container-fluid">
      <div class="page-header" style="display:flex;gap:12px;flex-direction: column;">
       ${document.title}
       <div style="display:flex;gap:8px">
       ${imgList.map((item) => `<img width="200px" src="${item}" />`).join('')}
       </div>

       <div>
       ${document.querySelector('.desc').innerHTML}
       </div>

       <div>
       ${document.querySelector('.bottom-container').innerHTML}
       </div>
      </div>
      <div class="panel panel-default"><div class="panel-body">${htmlData}</panel-body></div>
    </div>
  </body>
  <script>
  document.querySelectorAll('.exx-comment').forEach(item=>{
      item.onclick=function(){
        const id = this.id;
        const subIndex = id.split('-')[1];
        const subItem = document.getElementById(subIndex);
        if(subItem){
          subItem.style.display = subItem.style.display === 'none' ? 'block' : 'none';
          this.innerHTML = subItem.style.display === 'none' ? '查看回复' : '收起回复';
        }
      }
   })
  </script>
</html>
`,
    ],
    { type: 'text/html;charset=utf-8;' }
  );
  var downloadUrl = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href = downloadUrl;
  link.download = location.pathname.split('/').pop() + '.html';
  link.click();
};

const showMoreCommentList = () => {
  document.querySelectorAll('.show-more').forEach((item) => {
    item.click();
  });
};

document.getElementById('showMoreComment').onclick = function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      args: [],
      func: showMoreCommentList,
    });
  });
};

document.getElementById('sendmessageid').onclick = function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      args: [],
      func: getCommentListToCSV,
    });
  });
};

document.getElementById('saveForHtml').onclick = function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      args: [],
      func: getCommentListToHTML,
    });
  });
};

const addImgList = () => {
  document.querySelectorAll('.mask').forEach(async (item) => {
    const img = document.createElement('img');
    img.src = item.style['backgroundImage']
      .replace('url("', '')
      .replace('")', '');

    document.body.appendChild(img);
  });
};

document.getElementById('saveMaskList').onclick = function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      args: [],
      func: addImgList,
    });
  });
};

const openImgList = () => {
  const downloadFile = (blob, filename) => {
    let url = window.URL.createObjectURL(blob);
    // 创建隐藏的可下载链接
    let link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
  };
  const fetchUrl = (doc_url) =>
    fetch(doc_url)
      // record.doc_url为文件url地址
      .then((res) => res.blob())
      .then((blob) => {
        downloadFile(blob, doc_url.split('/').pop());
      });

  document.querySelectorAll('.mask').forEach(async (item) => {
    fetchUrl(
      item.style['backgroundImage'].replace('url("', '').replace('")', '')
    );
  });
};

document.getElementById('openMaskList').onclick = function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      args: [],
      func: openImgList,
    });
  });
};
