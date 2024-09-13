import { codesModel } from "../../../DB/Models/codes.model.js";
import { enrollmentModel } from "../../../DB/Models/enrollmentCourse.model.js";
import { courseModel } from "./../../../DB/Models/course.model.js";

// =================join for one course================
// export const join = async (req, res, next) => {
//   const { _id } = req.user;
//   const { code } = req.body;
//   const { courseId } = req.query;
//   const findcourse = await courseModel.findById(courseId);
//   if (!findcourse) {
//     return next(new Error("Invalid  course Id", { cause: 404 }));
//   }

//   const codeDoc = await codesModel.findOneAndUpdate(
//     {
//       codes: code,
//       codesStatus: "Valid",
//       "codeAssignedToCourse.courseId": courseId,
//     },
//     { $pull: { codes: code } },
//     { new: true }
//   );
//   console.log(codeDoc);

//   if (!codeDoc) {
//     return next(new Error("Invalid or expired code", { cause: 404 }));
//   }

//   if (codeDoc.codes.length === 0) {
//     codeDoc.codesStatus = "Expired";
//     await codeDoc.save();
//     await codesModel.findOneAndDelete({
//       _id: codeDoc._id,
//       codesStatus: "Expired",
//     });
//   }

//   // Ensure codeAssignedToCourse exists and has at least one element
//   if (
//     !codeDoc.codeAssignedToCourse ||
//     codeDoc.codeAssignedToCourse.length === 0
//   ) {
//     return next(new Error("No course assigned to this code", { cause: 500 }));
//   }
//   const codeAssignedToCourse = codeDoc.codeAssignedToCourse[0].courseId;
//   // check if user have enrollment or not OR have this
//   const user = await enrollmentModel.findOne({ userId: _id });
//   if (user) {
//     console.log(user);

//     let flag = false;
//     for (const course of user.courses.coursesIds) {
//       if (course.courseId.toString() == codeAssignedToCourse.toString()) {
//         user.courses.isPaid = true;
//         user.courses.fromDate = codeDoc.fromDate;
//         user.courses.toDate = codeDoc.toDate;
//         flag = true;
//         await user.save();
//         return res.status(201).json({ message: "Done", courseEnroll: user });
//       }
//     }
//     if (!flag) {
//       const courseId = codeDoc.codeAssignedToCourse[0].courseId;
//       user.courses.push({
//         fromDate: codeDoc.fromDate,
//         toDate: codeDoc.toDate,
//         coursesIds: [{ courseId: courseId }],
//       });
//       await user.save();
//       res.status(201).json({ message: "Done", courseEnroll: user });
//     }

//     if (!user) {
//       // add course to student
//       const enrollObject = {
//         userId: _id,
//         courses: {
//           coursesIds: [{ courseId: codeDoc.codeAssignedToCourse[0].courseId }],
//           fromDate: codeDoc.fromDate,
//           toDate: codeDoc.toDate,
//           isPaid: true,
//         },
//       };

//       const enroll = await enrollmentModel.create(enrollObject);
//       req.failedDocument = { model: enrollmentModel, _id: enroll._id };
//       if (!enroll) {
//         return next(new Error("fail in DB", { cause: 500 }));
//       }

//       res.status(201).json({ message: "Done", courseEnroll: enroll });
//     }
//   }
// };

const { _id } = req.user;
    const { code } = req.body;
    const { courseId } = req.query;

    // Validate course ID
    const findcourse = await courseModel.findById(courseId);
    if (!findcourse) {
      return next(new Error("Invalid course Id", { cause: 404 }));
    }

    // Find and update the code document
    const codeDoc = await codesModel.findOneAndUpdate(
      {
        codes: code,
        codesStatus: "Valid",
        "codeAssignedToCourse.courseId": courseId,
      },
      { $pull: { codes: code } },
      { new: true }
    );

    if (!codeDoc) {
      return next(new Error("Invalid or expired code", { cause: 404 }));
    }

    // Update code status to expired if all codes are used
    if (codeDoc.codes.length === 0) {
      codeDoc.codesStatus = "Expired";
      await codeDoc.save();
      await codesModel.findOneAndDelete({ _id: codeDoc._id, codesStatus: "Expired" });
    }

    // Ensure codeAssignedToCourse exists and has at least one element
    if (!codeDoc.codeAssignedToCourse || codeDoc.codeAssignedToCourse.length === 0) {
      return next(new Error("No course assigned to this code", { cause: 500 }));
    }

    const codeAssignedToCourse = codeDoc.codeAssignedToCourse[0].courseId.toString();

    // Find user enrollment
    let userEnrollment = await enrollmentModel.findOne({ userId: _id });
    if (userEnrollment) {
      // Iterate over each course in the user's enrollment
      let courseUpdated = false;
      for (const course of userEnrollment.courses) {
        for (const courseId of course.coursesIds) {
          if (courseId.courseId.toString() === codeAssignedToCourse) {
            if (course.isPaid) {
              return next(new Error("You have already joined this course", { cause: 500 }));
            }
            course.isPaid = true;
            course.fromDate = codeDoc.fromDate;
            course.toDate = codeDoc.toDate;
            courseUpdated = true;
            break;
          }
        }
        if (courseUpdated) break;
      }

      if (!courseUpdated) {
        // Add new course to the user's enrollment
        userEnrollment.courses.push({
          fromDate: codeDoc.fromDate,
          toDate: codeDoc.toDate,
          coursesIds: [{ courseId: codeAssignedToCourse }],
          isPaid: true,
        });
      }

      await userEnrollment.save();
      return res.status(201).json({ message: "Done", courseEnroll: userEnrollment });
    } else {
      // Create new enrollment if user doesn't have one
      const enrollObject = {
        userId: _id,
        courses: [{
          coursesIds: [{ courseId: codeAssignedToCourse }],
          fromDate: codeDoc.fromDate,
          toDate: codeDoc.toDate,
          isPaid: true,
        }],
      };

      const newEnrollment = await enrollmentModel.create(enrollObject);
      req.failedDocument = { model: enrollmentModel, _id: newEnrollment._id };

      if (!newEnrollment) {
        return next(new Error("Failed to enroll in the course", { cause: 500 }));
      }

      return res.status(201).json({ message: "Done", courseEnroll: newEnrollment });
    }




// ====================join term courses=================

// export const joinForTerm = async (req, res, next) => {
//   const { _id } = req.user;
//   const { code } = req.body;

//   const codeDoc = await codesModel.findOneAndUpdate(
//     { codes: code, codesStatus: "Valid" },
//     { $pull: { codes: code } },
//     { new: true }
//   );
//   console.log(codeDoc);

//   if (!codeDoc) {
//     return next(new Error("Invalid or expired code", { cause: 404 }));
//   }

//   if (codeDoc.codes.length === 0) {
//     codeDoc.codesStatus = "Expired";
//     await codeDoc.save();
//   }

//   // check if user have enrollment or not OR have this
//   const user = await enrollmentModel.findOne({ userId: _id });
//   if (user) {
//     let flag = false;
//     for (const course of user.coursesIds) {
//       if (course.courseId.toString() == codeDoc.codeAssignedToCourse.courseId) {
//         user.courses.isPaid = true;
//         flag = true;
//       }
//     }
//     if (!flag) {
//       const courseId = codeDoc.codeAssignedToCourse[0].courseId;
//       user.courses.fromDate = codeDoc.fromDate;
//       user.courses.toDate = codeDoc.toDate;
//       user.courses.coursesIds = [{ courseId: courseId }];
//       await user.save();
//     }
//   }

//   // add course to student
//   const enrollObject = {
//     userId: _id,
//     courses: {
//       coursesIds: [{ courseId: codeDoc.codeAssignedToCourse[0].courseId }],
//       fromDate: codeDoc.fromDate,
//       toDate: codeDoc.toDate,
//       isPaid: true,
//     },
//   };

//   const enroll = await enrollmentModel.create(enrollObject);
//   req.failedDocument = { model: enrollmentModel, _id: enroll._id };
//   if (!enroll) {
//     return next(new Error("fail in DB", { cause: 500 }));
//   }
//   res.status(201).json({ message: "Done", courseEnroll: enroll });
// };
