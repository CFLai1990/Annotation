import MsgBox from "components/MsgBox";
import * as d3 from "d3";
import Data from "data/constants";

// Message box
const msg = new MsgBox("DATA_LOADER");
// Sync function
const trySync = func => {
  return (...parms) => {
    return new Promise((resolve, reject) => {
      try {
        resolve(func(...parms));
      } catch (err) {
        reject(err);
      }
    });
  };
};
// Async function
const tryAsync = func => {
  return (...parms) => {
    return new Promise((resolve, reject) => {
      func(...parms)
        .then(rsp => {
          if (rsp.ok) {
            resolve(rsp.text());
          } else {
            rsp.text().then(errMsg => {
              reject(
                `${errMsg ? errMsg : "Unkowned Error"} (Status Code: ${
                  rsp.status
                })`
              );
            });
          }
        })
        .catch(err => {
          reject(err);
        });
    });
  };
};

/* dataFetcher:
* Fetch local or remote data
*/
class dataFetcher {
  constructor(dataInfo) {
    this.source = dataInfo.source;
    this.url = dataInfo.url;
    this.dataRaw = null;
  }

  async fetch() {
    switch (this.source) {
      case "local":
        this.dataRaw = await this.localFetch();
        break;
      case "remote":
        this.dataRaw = await this.remoteFetch();
        break;
      default:
        this.dataRaw = null;
        break;
    }
    return this.dataRaw;
  }

  async localFetch() {
    return await Data[this.url];
  }

  async remoteFetch() {
    return await tryAsync(fetch)(this.url);
  }
}

/* dataParser:
* Parse the data according to its type
*/
class dataParser {
  constructor(dataInfo) {
    this.type = dataInfo.type;
    this.data = null;
  }

  async parse(dataRaw) {
    switch (this.type) {
      case "csv":
        this.data = await this.csv(dataRaw);
        break;
      case "json":
        this.data = await this.json(dataRaw);
        break;
      case "xml":
        this.data = await this.xml(dataRaw);
        break;
      case "text":
        this.data = await this.text(dataRaw);
      default:
        break;
    }
    return this.data;
  }

  /* CSV Parser:
* Local: an array of rows
* Remote: a string
*/
  csv = trySync(dataRaw => {
    return d3.csvParse(
      typeof dataRaw === "object" ? dataRaw.join("\n") : dataRaw
    );
  });

  /* JSON Parser:
* Local: the json object
* Remote: a json string
*/
  json = trySync(dataRaw => {
    return typeof dataRaw === "object" ? dataRaw : JSON.parse(dataRaw);
  });

  /* XML Parser:
* Local & Remote: the xml string
*/
  xml = trySync(dataRaw => {
    return new DOMParser().parseFromString(dataRaw, "text/xml");
  });

  /* XML Parser:
* Local & Remote: the xml string
*/
  text = trySync(dataRaw => {
    return dataRaw;
  });
}

const fetchData = async function(dataInfo, dataSelection) {
  msg.groupStart(`Fetching Data '${dataSelection || dataInfo.url}'`);
  try {
    let fetcher = new dataFetcher(dataInfo);
    let parser = new dataParser(dataInfo);
    let dataRaw = await fetcher.fetch();
    let data = await parser.parse(dataRaw);
    msg.info(`Data ready`);
    msg.groupEnd();
    return data;
  } catch (err) {
    msg.error(`Fetching error: ${err}`);
    msg.groupEnd();
    throw err;
  }
};

export { fetchData };
