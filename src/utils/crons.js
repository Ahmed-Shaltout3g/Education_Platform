import moment from "moment-timezone";
import { scheduleJob } from "node-schedule";
import { enrollmentModel } from "../../DB/Models/enrollmentCourse.model.js";

export const changeCouponStatus = async () => {
  scheduleJob("0 * * * *", async function () {
    const enrollments = await enrollmentModel.find();

    for (const enrollment of enrollments) {
      let updated = false;
      for (const course of enrollment.courses) {
        if (
          moment(course.toDate)
            .tz("Africa/Cairo")
            .isBefore(moment().tz("Africa/Cairo"))
        ) {
          course.isPaid = false;
          updated = true;
        }
      }

      // If there are changes, save the updated enrollment
      if (updated) {
        await enrollment.save();
      }
    }
  });
};

export const deleteCouponExpired = async () => {
  scheduleJob("0 0 */10 * *", async function () {
    const coupons = await couponModel.findOneAndDelete({
      couponStatus: "Expired",
    });

    console.log(" cron job deleteCouponExpried is running .....");
  });
};
