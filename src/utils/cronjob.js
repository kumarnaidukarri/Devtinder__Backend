// A Cron Job is is a scheduled task that runs automatically at specific times or intervals.
// * CRON Expressions -
/* "* *  * *  * *"     means "second(optional)  minute  hour  dateofmonth  month  dayofweek"
   "5 *  * *  * *"     means  runs at 5th second of every minute
   "*\5 * * * * *"     means  runs for every 5 second
*/

const cron = require("node-cron"); // 'Node-Cron' Library
const { subDays, startOfDay, endOfDay } = require("date-fns"); // 'Date-Fns' Library

// my modules
const connectionRequestModel = require("../models/connectionRequest.js"); // DB model
const { sendEmailToRemindFriendRequests } = require("./email.js"); // Email module

// Send Emails to all people who got requests the Previous Day.
cron.schedule("0 0 8 * * *", async () => {
  // "0 0 8 * * *" = "0sec 0min 8hr(8am) everyday everymonth everydayofweek". it runs once at 8th hour Every Day.
  try {
    const yesterday = subDays(new Date(), 1);
    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    const pendingRequests = await connectionRequestModel
      .find({
        status: "interested",
        createdAt: { $gte: yesterdayStart, $lt: yesterdayEnd },
      })
      .populate("fromUserId toUserId");
    // Queries  - pending requests from YesterdayStart time(00:00) and YesterdayEnd time(23:59)
    // Populate - applies on returned 'Mongoose Query Object'. populate will replace 'ObjectId references' with 'actual documents' from the referenced collection.
    console.log(pendingRequests);

    const listOfEmailsWithDuplicatesArr = pendingRequests.map(
      (req) => req.toUserId.emailId,
    );
    const listOfEmails = [...new Set(listOfEmailsWithDuplicatesArr)]; // listofEmails without Duplicates
    console.log(listOfEmails);

    // SENDING EMAILS using 'NodeMailer' module
    for (let emailId of listOfEmails) {
      try {
        /*
        const res = await sendEmailToRemindFriendRequests(
          emailId,
          "User",
          `New Friend Requests are  Pending for ${emailId}`,
          `Dear ${"User"},
        
        There are so many Friend Requests Pending. Please login to Devtinder and accept or reject them.
        Start matching and connecting with fellow developers 🚀
        
        Cheers,
        DevTinder Team
        
        You’re receiving this email because you signed up for DevTinder.
        If you did not create this account, no action is required.
        i.e, i randomly/unknowingly typed this email. 
        
        This application is a small personal project, so no worries.`,
        ); */
        // console.log(res)
      } catch (err) {
        console.error(err);
      }
    }
  } catch (err) {
    console.error(err);
  }
});

/* COMMENTS */
//cron.schedule("5 * * * * *", () => {
// "* * * * * *" = "sec(optional) min hr date month day"
//  console.log("Hello World", new Date());
//}); // runs at 5th second of every minute  -  00:00:05, 00:01:05, 00:02:05, ...

// cron.schedule("*/5 * * * * *", () => {
//  console.log("Hi", new Date());
//}); // runs for every 5 secs  -  0, 5, 10, 15, 20, ...

//cron.schedule("0 15 */6 * * *", () => {
//  console.log("Bye", new Date());
//}); // runs for every 6 hours at minute 15  -  00:15:00, 06:15:00, 12:15:00, 18:15:00, ...
