const clientContextParser = (data) => {
// Client Context for follow-on requests
let contextBeginning = data.indexOf('"client":');
let contextEnd = data.indexOf('"user":');

let contextLastString = data.substring(
  contextBeginning - 1,
  contextEnd - 1
);

let searchClientContext = JSON.parse(contextLastString + "}");
return searchClientContext;
}

module.exports = {clientContextParser}