# MFT2HCM
A simple REST utility for uploading or downloading files from command line or a Managed File Transfer server callout to Oracle WebCenter and HCM SaaS service. The tool utilizes the node "mft-upload" package and provides SOAP substitution templates for WebCenter(UCM) and Oracle HCM. File delivery to HCM for import use case is a 2 phase web service process to upload the file to WCC/UCM followed by a notification invocation of the Oracle HCM SOAP Web Services. Additionally HCM files can be exported into UCM and downloaded for HCM extract use case. 

See the information below on the Oracle HCM File Based Laoder
https://docs.oracle.com/cloud/latest/common/FAIHM/F1415008AN10ABB.htm#F1415008AN10ABB

## Use Cases

### HCM Load
The MFT server receives files from any Source protocol such as SFTP, SOAP, local file system or a back end integration process. The file can be decrypted, uncompressed or validated before a Source or Target pre-processing callout uploads it to UCM then notifies HCM to initiate the batch load. Finally the original file is backed up into the local file system, remote SFTP server or an cloud based storage service. An optional notification can also be delivered to the caller using a Target post-processing callout upon successful completion. The MFT server can live in either on premise or a cloud iPaaS hosted environment. Configuration files for this use case are shown below.

### HCM Extract
An external event or schedule triggers the MFT server to search for a file in UCM using a  search query. Once a document id is indentified, it is retrived using a Source Pre-Processing callout which injects the retrieved file into the MFT Transfer. The file can then be decrypted, validated, decompressed before being sent to an MFT Target of any protocol such as SFTP, File system, SOAP Web Service or a back end interation process. Finally the original file is backed up into the local file system, remote SFTP server or an cloud based storage service. An optional notification can also be delivered to the caller using a Target post-processing callout upon successful completion. The MFT server can live in either on premise or a cloud iPaaS hosted environment. Configuration files for this use case are shown below.


## Prerequisites

It is assumed you have knowledge and a working MFT server installed such as [Oracle MFT](http://bit.ly/oramft) Oracle WebCeneter(UCM), Oracle HCM.
The SOAP interfaces are documented in the above Oracle HCM documentation.

## Installation

create HCM_HOME home folder. Ex: mkdir /app/hcm

create node_modules subfolder. Ex: mkdir /app/hcm/node_modules

go to HCM_HOME. Ex: cd /app/hcm

npm install mft2hcm 

## Quick Start

### HCM Load 

Edit [mft2hcm.json](mft2hcm.json) then change request.url, request.auth information to match your UCM/WCC environment.

Edit [hcm.json](hcm.json) then change request.url, request.auth information to match your HCM environment.

Execute command: mft2hcm.js config=mft2hcm.json file=<HCM_ZIP_FILE> Welcome1' dir=<LOCAL_DIR>

### HCM Extract 

Edit [ucmsearch.json](ucmsearch.json) then change request.url, request.auth information to match your UCM/WCC environment.

Edit [ucmget.json](ucmget.json) then change request.url, request.auth information to match your UCM/WCC environment.

Execute command: node mft2hcm.js config=ucmsearch.json file=UCM-PAYLOAD-SEARCH searchfile=<DOC TITLE> dir=<LOCAL DIR>

## Usage

### Command Line

node mft2hcm.js file=[FILE SPEC] | [config=mft2hcm.json searchfile=[SEARCH SPEC] passwords='PASS1 PASS2' dir=[FILE LOCATION] businessobject=<HCM OBJECT TYPE]

### Config Files
The config file is the same format as what is used in mft-upload and makes use of the "cfgarr" config array to make multiple SOAP calls as shown below. It embeds and reuses the request type endpoint and authentication used by the [HTTP Request package](https://github.com/request/request). 


The following 2 files are used together to implement the "Load and Notify" HCM Import use case. The first is an example of the mft2hcm.json config file that uses the cfgarr property to chain to the next config file that notifies the HCM server..
```
mft2hcm.json
{
  "type": "UCM",
  "template":    "UCM-PAYLOAD-PUT",
  "cfgarr": [
        { "config": "hcm.json", "file": "HCM-PAYLOAD"}
  ],
  "request": {
    "url": "http://HOSTNAME:10613/idcws/GenericSoapPort",
    "method": "POST",
    "headers": { "Content-Type": "text/xml; charset=utf-8" },
    "auth": { "user": "USERNAME", "pass": "" }
  }
}
```

This is an example of the hcm.json config file that invokes the HCM File Based Loader SOAP Service
```
hcm.json
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
    "auth": { "user": "USERNAME", "pass": "" },
    "agentOptions": {
        "ca": "hcmcert.cer",
        "Connection": "Keep-Alive",
        "securityOptions": "SSL_OP_NO_SSLv3"
    }
  }
}
```

These 2 config files are used together to implement the "Search and Get" HCM Export use case. The first is an example of the ucmsearch.json config file that links to the ucmget.json config file once the search is successfully completed.
```
ucmsearch.json
{
  "type": "UCMSEARCH",
  "ctype": "text",
  "reqtemps": false,
  "cfgarr": [
        { "config": "ucmget.json", "file": "UCM-PAYLOAD-GET"}
  ],
  "request": {
    "url": "http://HOSTNAME:10613/idcws/GenericSoapPort",
    "method": "POST",
    "headers": { "Content-Type": "text/xml; charset=utf-8" },
    "auth": { "user": "USERNAME", "pass": "PASSWORD" }
  }
}
```

```
ucmget.json
{ 
  "type": "UCMGET",
  "ctype": "text",
  "reqtemps": false,
  "request": {
    "url": "http://HOSTNAME:10613/idcws/GenericSoapPort",
    "method": "POST",
    "encoding": "binary",
    "headers": { "Content-Type": "text/xml; charset=utf-8" },
    "auth": { "user": "USERNAME", "pass": "PASSWORD" }
  }
}
```

## Config File Notes

- If the config argument is not provided, mft2hcm.js looks for one at $HOME/.mft/mft2hcm.json
- Passwords in the request config file are overridden by the "passwords" space delimited cmd line argument.
- Config types of UCMSEARCH and HCM send the template as the payload as shown by the '"reqtemps": false' property

## Template Files

### UCM-PAYLOAD-SEARCH

[UCM-PAYLOAD-SEARCH](UCM-PAYLOAD-SEARCH) is used for the first step of Search/Get use case and uses the following substitution variables.
```
%%USERNAME%%, %%PASSWORD%%, %%ISOTIME%%, %%SEARCHFILE%%
```

### UCM-PAYLOAD-GET

[UCM-PAYLOAD-GET](UCM-PAYLOAD-GET) is used for the second step of Search/Get use case and uses the following substitution variables.
```
%%USERNAME%%, %%PASSWORD%%, %%ISOTIME%%, %%DOCID%%
```

### UCM-PAYLOAD-PUT

[UCM-PAYLOAD-PUT](UCM-PAYLOAD-PUT) is used for the first step of Load and Notify use case and uses the following substitution variables.
```
%%USERNAME%%, %%PASSWORD%%, %%ISOTIME%%, %%FILEBASE%%, %%FILEBODY%%
```

### HCM-PAYLOAD

[HCM-PAYLOAD](HCM-PAYLOAD) is used for the first step of Load and Notify use case and uses the following substitution variables.
```
%%USERNAME%%, %%PASSWORD%%, %%ISOTIME%%, %%BUSINESSOBJECT%%
```


## Testing

This package does not have it's own testing commands. See the underlying mft-upload tests and uses the following substitution variables.


## History

Created: June 22, 2015

## Credits

Dave Berry A.K.A (bigfiles)

## License

ISC

