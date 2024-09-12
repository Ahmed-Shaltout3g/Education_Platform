import { enrollmentModel } from "../../../DB/Models/enrollmentCourse.model";

export const join = async (req, res, next) => {
  const { _id } = req.user;
  const { code } = req.body;

  const codeDoc = await CodesModel.findOne(
    { codes: code },
    { codesStatus: "Valid" }
  );
  if (!codeDoc) {
    return next(new Error("Invalid or expired code", { cause: 404 }));
  }

  if (codeDoc.codes.length === 0) {
    codeDoc.codesStatus = "Expired";
    await codeDoc.save();
  }

  // check if user have enrollment or not OR have this
  const user = await enrollmentModel.findOne({ userId: _id });
  if (user) {
    let flag = false;
    for (const course of user.coursesIds) {
      if (course.courseId.toString() == codeDoc.codeAssignedToCourse.courseId) {
        user.courses.isPaid = true;
        flag = true;
      }
    }
    if (!flag) {
      user.coursesIds;
    }
  }

  // add course to student
  const enrollObject = {
    userId: _id,
    courses: {
      coursesId,
    },
  };
};
