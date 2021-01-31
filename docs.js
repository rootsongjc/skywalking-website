var fs = require("fs");
var path = require("path");
const dirTree = require("directory-tree");
const YAML = require('json-to-pretty-yaml');


const srcPath = "/tmp/skywalking/docs";
const tarPath = "/content/docs/main/v8.3.0";
const root = path.join(__dirname, tarPath);

// copyFile(srcPath, tarPath);
readDirSync(root);

let filteredTree = dirTree(root, {extensions: /\.md/});
handleJson(filteredTree)


const json = JSON.stringify(filteredTree, null, 4)


setTimeout(() => {
  writeFile('docMenu.yaml', YAML.stringify(filteredTree));
}, 3 * 1000)
// writeFile('docMenu.json', json);

function readDirSync(path) {
  var pa = fs.readdirSync(path);
  pa.forEach(function (ele, index) {
    var info = fs.statSync(path + "/" + ele);
    if (info.isDirectory()) {
      readDirSync(path + "/" + ele);
    } else {
      var filePath = path + "/" + ele;
      const fileNameReg = /\.md/g;
      let shouldFormat = fileNameReg.test(filePath);
      if (shouldFormat) {
        readFile(filePath);
      }
    }
  });
}

function readFile(filePath) {
  fs.readFile(filePath, function (err, data) {
    if (err) {
      console.log("happen an error when read file , error is " + err);
    } else {
      var codeTxt = data.toString();

      if (!/(---[\s\S]*---)/.test(codeTxt)) {
        let title = codeTxt.split('\n')[0]
        title = title.match(/(?<=([ ])).*/g)[0];

        codeTxt =
            `---
title: ${title}
type: projectDoc
layout: baseof
---\n` + codeTxt;
        codeTxt = codeTxt
            .replace(/(\[[\s\S]*?\])\(([\s\S]*?)\)/g, function (match, p1, p2) {
              if (p2 && p2.startsWith('http')) {
                return match
              }
              const str = p2
                  .replace(/README.md/gi, 'readme')
                  .replace(/\.md/g, '')
              if (filePath.includes('README')&&!str.startsWith('#')) {
                return `${p1}(../${str})`
              }
              return `${p1}(${str})`

            })


      }

      if (filePath.indexOf('scope') > -1) {
        console.log(codeTxt.slice(0,100));
      }


      writeFile(filePath, codeTxt);
    }
  });
}

function writeFile(_path, _txt) {
  fs.writeFile(_path, _txt, function (err) {
    if (err) {
      console.log("happen an error when write file , error is " + err);
    } else {
      // console.log("format file success :", _path);
    }
  });
}

function copyFile(srcPath, tarPath, excludeList = []) {
  fs.readdir(srcPath, function (err, files) {
    console.log(files);
    if (err === null) {
      files.forEach(function (filename) {
        let filedir = path.join(srcPath, filename);
        let filterFlag = excludeList.some((item) => item === filename);
        if (!filterFlag) {
          fs.stat(filedir, function (errs, stats) {
            let isFile = stats.isFile();
            if (isFile) {
              const destPath = path.join(tarPath, filename);
              fs.copyFile(filedir, destPath, (err) => {
              });
            } else {
              let tarFiledir = path.join(tarPath, filename);
              fs.mkdir(tarFiledir, (err) => {
                console.log(err);
              });
              copyFile(filedir, tarFiledir, excludeList);
            }
          });
        }
      });
    } else {
      if (err) console.error(err);
    }
  });
}

function handleJson(data) {
  data.path = data.path.split('/content')[1];
  data.path = data.path.toLowerCase().replace('.md', '').replace('README', 'readme');
  data.name = data.name.split('.')[0];
  if (data.name !== 'FAQ') {
    data.name = data.name.toLowerCase()
  }
  if (data.children) {
    data.children.forEach(item => {
      handleJson(item)
    })
  }
}