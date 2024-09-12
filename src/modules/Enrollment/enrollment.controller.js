import { codesModel } from "../../../DB/Models/codes.model.js";
import { enrollmentModel } from "../../../DB/Models/enrollmentCourse.model.js";
codesModel;
export const join = async (req, res, next) => {
  const { _id } = req.user;
  const { code } = req.body;

  const codeDoc = await codesModel.findOneAndUpdate(
    { codes: code, codesStatus: "Valid" },
    { $pull: { codes: code } },
    { new: true }
  );
  console.log(codeDoc);

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
      const courseId = codeDoc.codeAssignedToCourse[0].courseId;
      user.courses.fromDate = codeDoc.fromDate;
      user.courses.toDate = codeDoc.toDate;
      user.courses.coursesIds = [{ courseId: courseId }];
      await user.save();
    }
  }

  // add course to student
  const enrollObject = {
    userId: _id,
    courses: {
      coursesIds: [{ courseId: codeDoc.codeAssignedToCourse[0].courseId }],
      fromDate: codeDoc.fromDate,
      toDate: codeDoc.toDate,
      isPaid: true,
    },
  };

  const enroll = await enrollmentModel.create(enrollObject);
  req.failedDocument = { model: enrollmentModel, _id: enroll._id };
  if (!enroll) {
    return next(new Error("fail in DB", { cause: 500 }));
  }
  res.status(201).json({ message: "Done", courseEnroll: enroll });
};
