
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
  firstdate = new Date(today.getFullYear(), today.getMonth(), 1);
  // console.log('*** getFirstDateOfMonth() = ' + firstdate + ' ****');
  return firstdate;
}

function getLastDateOfMonth() {
  lastDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  // console.log('%%%' + new Date(today.getFullYear(), today.getMonth() + 1, 0) +'%%%%');
  // console.log('*** getLastDateOfMonth() = ' + lastDate + '');
  return lastDate;
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