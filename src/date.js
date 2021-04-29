
let currentDate;
let daysInMonth;
var firstday;
let today = new Date();

function getCurrentDate() {
  let day = today.getUTCDate();
  let month = today.getUTCMonth() + 1;
  let year = today.getUTCFullYear();
  currentDate = day + '-' + month + '-' + year;
  console.log('*** getCurrentDate() = ' + currentDate + ' ****');
  return currentDate;
}

function getFirstDateOfMonth() {
  let month = today.getUTCMonth() + 1;
  let year = today.getUTCFullYear();
  firstday = '01' + '-' + month + '-' + year;
  console.log('*** getFirstDateOfMonth() = ' + firstday + ' ****');
  return firstday;
}

function getLastDateOfMonth() {
  let month = today.getUTCMonth() + 1;
  let year = today.getUTCFullYear();
  lastDay =  (getDaysInMonth())+ '-' + month + '-' + year;
  console.log('*** getLastDateOfMonth() = ' + lastDay+'');
  return lastDay;
}

function getDaysInMonth() {
  var dt = new Date();
  var month = dt.getMonth() + 1;
  var year = dt.getFullYear();
  daysInMonth = new Date(year, month, 0).getDate();
  console.log('*** getDaysInMonth() = ' + daysInMonth + '');
  return daysInMonth;
}

exports.getCurrentDate = getCurrentDate;
exports.getFirstDateOfMonth = getFirstDateOfMonth;
exports.getLastDateOfMonth = getLastDateOfMonth;
exports.getDaysInMonth = getDaysInMonth;