const date = require("../date");
// async function monthlySignedupChart() {

// };
// async function monthlyHiredChart() {

// };
// async function monthlyExpertiseChart() {

// };

function getSignedUps(signedUpArr) {
  console.log('** in stats.js **');
  console.log('****');
  console.log(signedUpArr);
  console.log('****');

  signUps = new Array(date.getDaysInMonth()).fill(0); //create array of zeros

  for (let i = 0, d = date.getFirstDateOfMonth(); i <= signedUpArr.length; i++, d.setDate(d.getDate() + 1)) {
    nextDate = new Date(d.getDate() + 1)
    if (d<=signedUpArr[i].creteAt<= nextDate)
      ++signUps[i];
  }
  console.log('^$^$%$^%$^%$');
  console.log(signUps);
  console.log('^$^$%$^%$^%$');
};

exports.getSignedUps = getSignedUps;