// A Cron Job is is a scheduled task that runs automatically at specific times or intervals.
// * CRON Expressions -
/* "* *  * *  * *"     means "second(optional)  minute  hour  dateofmonth  month  dayofweek"
   "5 *  * *  * *"     means  runs at 5th second of every minute
   "*\5 * * * * *"     means  runs for every 5 second
*/

const cron = require("node-cron");

cron.schedule("5 * * * * *", () => {
  // "* * * * * *" = "sec(optional) min hr date month day"
  console.log("Hello World", new Date());
}); // runs at 5th second of every minute  -  00:00:05, 00:01:05, 00:02:05, ...

cron.schedule("*/5 * * * * *", () => {
  console.log("Hi", new Date());
}); // runs for every 5 secs  -  0, 5, 10, 15, 20, ...

cron.schedule("0 15 */6 * * *", () => {
  console.log("Bye", new Date());
}); // runs for every 6 hours at minute 15  -  00:15:00, 06:15:00, 12:15:00, 18:15:00, ...
