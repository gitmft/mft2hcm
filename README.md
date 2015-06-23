# MFT2HCM
A simple multi-stage REST utility for uploading files from command line or a Managed File Transfer server to Oracle HCM SaaS service. The tool uses mft-upload and provides custom templates for uploading files to Oracle UCM(WCC) followed by a notification invocation of Oracle HCM SOAP Web Services.

## Use Cases
Oracle HCM requires files to be preloaded into Oracle UCM followed by calling the Oracle HCM File Based Loader. This tool combines those into a single configuration based command line utility. The provided templates can be extended as needed once you understand the SOAP payloads.   

See the information below on the Oracle HCM File Based Laoder
https://docs.oracle.com/cloud/latest/common/FAIHM/F1415008AN10ABB.htm#F1415008AN10ABB

## Prerequisites

It is assumed you have knowledge and a working MFT server installed such as [Oracle MFT](http://bit.ly/oramft) and Oracle HCM.
The SOAP interfaces are documented in the above Oracle HCM documentation.

## Installation

npm install mft2hcm --save

## Usage

### Command Line

node mft2hcm.js file=Establishment.zip [config=mft2hcm.json]

### Config Files
The config file is the same format as what is used in mft-upload and makes use of the "cfgarr" config array to make multiple SOAP calls as shown below. It embeds and reuses the request type endpoint and authentication used by the [HTTP Request package](https://github.com/request/request). 


This is an example of the mft2hcm.json config file that uses the cfgarr property to chain to the next file and config file.
```
{
  "type": "UCM",
  "template":    "UCM-PAYLOAD",
  "cfgarr": [
        { "config": "hcm.json", "file": "HCM-PAYLOAD"}
  ],
  "request": {
    "url": "http://HOSTNAME:10613/idcws/GenericSoapPort",
    "method": "POST",
    "headers": { "Content-Type": "text/xml; charset=utf-8" },
    "auth": { "user": "USERNAME", "pass": "PASSWORD" }
  }
}
```


This is an example of the hcm.json config file that invokes the HCM File Based Loader SOAP Service
```
{
  "type": "HCM",
  "ctype": "text",
  "reqtemps": false,
  "request": {
    "rejectUnauthorized": false, // for non trusted CA's
    "url": "https://HOSTNAME:10620/hcmCommonBatchLoader/LoaderIntegrationService",
    "method": "POST",
    "headers": {
        "Content-Type": "text/xml; charset=utf-8",
        "Connection": "Keep-Alive"
        },
    "auth": { "user": "USERNAME", "pass": "PASSWORD" },
    "agentOptions": {
        "ca": "hcmcert.cer",
        "Connection": "Keep-Alive",
        "securityOptions": "SSL_OP_NO_SSLv3"
    }
  }
}
```

If a config argument is not provided, upload.js looks for one at ~/.mft/mft2hcm.json

## Testing

This package does not have it's own testing commands. See the underlying mft-upload tests.


## History

Created: June 22, 2015

## Credits

Dave Berry A.K.A (bigfiles)

## License

ISC

