
// let currentDate;
let daysInMonth;
var firstdate;
let today = new Date();

// function getCurrentDate() {
//   let day = today.getUTCDate();
//   let month = today.getUTCMonth() + 1;
//   let year = today.getUTCFullYear();
//   currentDate = day + '-' + month + '-' + year;
//   // console.log('*** getCurrentDate() = ' + currentDate + ' ****');
//   return currentDate;
// }

function getFirstDateOfMonth() {
  var firstdate = new Date(today.getFullYear(), today.getMonth(), 1);
  // console.log('*** getFirstDateOfMonth() = ' + firstdate + ' ****');
  return firstdate;
}

function getLastDateOfMonth() {
  var lastDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  // console.log('%%%' + new Date(today.getFullYear(), today.getMonth() + 1, 0) +'%%%%');
  // console.log('*** getLastDateOfMonth() = ' + lastDate + '');
  return lastDate;
}

function getDaysInMonth() {
  var month = today.getMonth() + 1;
  var year = today.getFullYear();
  daysInMonth = new Date(year, month, 0).getDate();
  // console.log('*** getDaysInMonth() = ' + daysInMonth + '');
  return daysInMonth;
}

// exports.getCurrentDate = getCurrentDate;
exports.getFirstDateOfMonth = getFirstDateOfMonth;
exports.getLastDateOfMonth = getLastDateOfMonth;
exports.getDaysInMonth = getDaysInMonth;