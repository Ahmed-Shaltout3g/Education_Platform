import moment from "moment-timezone";
import { scheduleJob } from "node-schedule";
import { enrollmentModel } from "../../DB/Models/enrollmentCourse.model.js";
import { codesModel } from "./../../DB/Models/codes.model.js";

export const changeCourseExpired = async () => {
  scheduleJob("0 3 * * *", async function () {
    const now = new Date();

    const result = await enrollmentModel.updateMany(
      { "courses.toDate": { $lte: now }, "courses.isPaid": true },
      { $set: { "courses.$[elem].isPaid": false } },
      { arrayFilters: [{ "elem.toDate": { $lte: now }, "elem.isPaid": true }] }
    );

    console.log("CronJop Expired courses updated successfully.");
  });
};

export const deletecodesExpired = async () => {
  scheduleJob("0 3 * * *", async function () {
    const now = new Date();

    const codes = await codesModel.findOneAndDelete({
      toDate: { $lte: now },
    });

    console.log(" cron job deleteCodesExpried is running .....");
  });
};
