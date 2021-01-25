var fs = require("fs")
var path = require("path")
var relativePath = '/content/docs/main/v8.3.1';
var root = path.join(__dirname) + relativePath
readDirSync(root)

function readDirSync(path) {
  var pa = fs.readdirSync(path);
  pa.forEach(function (ele, index) {
    var info = fs.statSync(path + "\/" + ele)
    if (info.isDirectory()) {
      readDirSync(path + "\/" + ele);
    } else {
      var filePath = path + '\/' + ele;
      const fileNameReg = /\.md/g;
      let shouldFormat = fileNameReg.test(filePath);
      if (shouldFormat) {
        readFile(filePath)
      }
    }
  })
}


function readFile(filePath) {
  fs.readFile(filePath, function (err, data) {
    if (err) {
      console.log('happen an error when read file , error is ' + err)
    } else {
      var codeTxt = data.toString();
      if (!/(---[\s\S]*---)/.test(codeTxt)) {
        codeTxt = `---
title: Welcome
type: blog
layout: baseof
---\n` + codeTxt
      }
      writeFile(filePath, codeTxt);
    }
  })
}


function writeFile(_path, _txt) {
  fs.writeFile(_path, _txt, function (err) {
    if (err) {
      console.log('happen an error when write file , error is ' + err)
    } else {
      console.log("format file success :", _path);
    }
  })
}
