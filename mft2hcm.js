#!/usr/local/node/bin/node
var upload= require('mft-upload');

// BEGIN MAIN

// copied from mft-upload/upload.js
// MAIN processing
// utilize the upload convenience function to invoke functions upload.getRequestConfig and upload.uploadFile
// support chained requests using config.cfgarr object to invoke multiple services
/* chaining example
  {
    "type": "SOAP",
    "cfgarr": [
          { "config": ".tmp/wsa.json", "file": ".tmp/soap2.json"},
          { "config": ".tmp/wsa.json", "file": ".tmp/soap.json"}
    ],
    "request": {
      "url": "http://HOSTNAME:7901/mftapp/services/transfer/SOAP2File",
      "method": "POST",
      "headers": { "Content-Type": "text/xml; charset=utf-8" },
      "body": "",
      "auth": { "user": "USERNAME", "pass": "PASSWORD" }
    }
  }

*/

//console.log('MFT2HCM: Invoking Upload');
upload.upload(process.argv, function(err, respcode, jcfg, stats) {
  //console.log('MFT2HCM: Upload stats: 0', stats);
  if (err) {
    //console.log('Upload Error: ' +err);
    console.trace('MFT2HCM Error: ' +err);
    //process.exit(1);
  } else {
    //console.log('MFT2HCM Upload JCFG: ', jcfg);
    //console.log('MFT2HCM: File stats: ', stats);
    // total hack. using stats as context to communicate UCM Get Filepath for MFT RunScript 'newfile' File Injection 
    if (stats && stats.ucmfilepath) 
      console.log('newfile=' +stats.ucmfilepath +' ');
  };
});

// END MAIN

process.on('uncaughtException', function(err) {
  // print the uncaught error and exit;
  console.log('uncaughtException:' +err);
  console.trace();
  process.exit(1);
});

