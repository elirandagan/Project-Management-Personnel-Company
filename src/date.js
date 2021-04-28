
let currentDate;

  function getCurrentDate() {
  let today = new Date()
  let day = today.getUTCDate();
  let month = today.getUTCMonth() + 1;
  let year = today.getUTCFullYear();
  currentDate = day + '/' + month + '/' + year
  return currentDate;
}

exports.getCurrentDate = getCurrentDate;