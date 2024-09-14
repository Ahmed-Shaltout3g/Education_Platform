import { codesModel } from "../../../DB/Models/codes.model.js";
import { enrollmentModel } from "../../../DB/Models/enrollmentCourse.model.js";
import { courseModel } from "./../../../DB/Models/course.model.js";
import { subCategoryModel } from "./../../../DB/Models/subCategory.model.js";

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
//     let courseFound = false;

//     // Update existing course enrollment
//     for (const course of user.courses) {
//       if (course.coursesIds.includes(codeAssignedToCourse.toString())) {
//         course.fromDate = codeDoc.fromDate;
//         course.toDate = codeDoc.toDate;
//         course.isPaid = true;
//         courseFound = true;
//         await user.save();
//         return res.status(201).json({ message: "Done", courseEnroll: user });
//       }
//     }

//     // Add new course to enrollment
//     if (!courseFound) {
//       user.courses.push({
//         coursesIds: [codeAssignedToCourse],
//         fromDate: codeDoc.fromDate,
//         toDate: codeDoc.toDate,
//         isPaid: true,
//       });
//       await user.save();
//       return res.status(201).json({ message: "Done", courseEnroll: user });
//     }
//   } else {
//     // add course to student
//     const enrollObject = {
//       userId: _id,
//       courses: {
//         coursesIds: [codeDoc.codeAssignedToCourse[0].courseId],
//         fromDate: codeDoc.fromDate,
//         toDate: codeDoc.toDate,
//         isPaid: true,
//       },
//     };

//     const enroll = await enrollmentModel.create(enrollObject);
//     req.failedDocument = { model: enrollmentModel, _id: enroll._id };
//     if (!enroll) {
//       return next(new Error("fail in DB", { cause: 500 }));
//     }

//     res.status(201).json({ message: "Done", courseEnroll: enroll });
//   }
// };
export const join = async (req, res, next) => {
  const { _id } = req.user;
  const { code } = req.body;
  const { courseId } = req.query;
  const findcourse = await courseModel.findById(courseId);
  if (!findcourse) {
    return next(new Error("Invalid  course Id", { cause: 404 }));
  }

  const codeDoc = await codesModel.findOneAndUpdate(
    {
      codes: code,
      codesStatus: "Valid",
      "codeAssignedToCourse.courseId": courseId,
    },
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
    await codesModel.findOneAndDelete({
      _id: codeDoc._id,
      codesStatus: "Expired",
    });
  }

  // Ensure codeAssignedToCourse exists and has at least one element
  if (
    !codeDoc.codeAssignedToCourse ||
    codeDoc.codeAssignedToCourse.length === 0
  ) {
    return next(new Error("No course assigned to this code", { cause: 500 }));
  }
  const codeAssignedToCourse = codeDoc.codeAssignedToCourse[0].courseId;
  // check if user have enrollment or not OR have this
  const user = await enrollmentModel.findOne({ userId: _id });
  if (user) {
    let courseFound = false;
    for (const course of user.courses) {
      if (course.coursesIds.toString() == codeAssignedToCourse.toString()) {
        if (course.toDate > Date.now() && course.isPaid == true) {
          return next(new Error("you Allready Joined", { cause: 404 }));
        }
        course.fromDate = codeDoc.fromDate;
        course.toDate = codeDoc.toDate;
        course.isPaid = true;
        courseFound = true;
        console.log("ahmed");
      }
    }
    // Add new course to enrollment
    if (!courseFound) {
      user.courses.push({
        coursesIds: courseId,
        fromDate: codeDoc.fromDate,
        toDate: codeDoc.toDate,
        isPaid: true,
      });
      console.log("whqltout");
    }
    await user.save();
    return res.status(201).json({ message: "Done", courseEnroll: user });
  } else {
    // add course to student
    const enrollObject = {
      userId: _id,
      courses: [
        {
          coursesIds: courseId,
          fromDate: codeDoc.fromDate,
          toDate: codeDoc.toDate,
          isPaid: true,
        },
      ],
    };

    const enroll = await enrollmentModel.create(enrollObject);
    req.failedDocument = { model: enrollmentModel, _id: enroll._id };
    if (!enroll) {
      return next(new Error("fail in DB", { cause: 500 }));
    }

    res.status(201).json({ message: "Done", courseEnroll: enroll });
  }
};

// ====================join term courses=================

export const joinTermCourses = async (req, res, next) => {
  const { _id } = req.user;
  const { code } = req.body;
  const { subCategory } = req.query;
  const findSubCategory = await subCategoryModel.findById(subCategory);
  if (!findSubCategory) {
    return next(new Error("Invalid  SubCategory Id", { cause: 404 }));
  }

  const codeDoc = await codesModel.findOneAndUpdate(
    {
      codes: code,
      codesStatus: "Valid",
      subCategoryId: findSubCategory._id,
    },
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
    await codesModel.findOneAndDelete({
      _id: codeDoc._id,
      codesStatus: "Expired",
    });
  }

  // Ensure codeAssignedToCourse exists and has at least one element
  if (
    !codeDoc.codeAssignedToCourse ||
    codeDoc.codeAssignedToCourse.length === 0
  ) {
    return next(new Error("No course assigned to this code", { cause: 500 }));
  }
  const codeAssignedToCourse = codeDoc.codeAssignedToCourse.courseId;
  console.log(codeAssignedToCourse);

  // check if user have enrollment or not OR have this
  const user = await enrollmentModel.findOne({ userId: _id });
  if (user) {
    let coursesIds = [];
    let courseFound = false;
    for (const course of user.courses) {
      for (const courseIdObj of codeDoc.codeAssignedToCourse) {
        if (courseIdObj.courseId.toString() === course.coursesIds.toString()) {
          coursesIds.push({
            courseId: courseIdObj.courseId || course.coursesIds,
            fromDate: codeDoc.fromDate || course.fromDate,
            toDate: codeDoc.toDate || course.toDate,
            isPaid: true,
          });
          courseFound = true;
        } else {
          coursesIds.push({
            courseId: courseIdObj.courseId,
            fromDate: codeDoc.fromDate,
            toDate: codeDoc.toDate,
            isPaid: true,
          });
        }
      }
    }

    user.courses = coursesIds;
    const saveUser = await user.save();
    if (!saveUser) {
      return next(new Error("fail in DB", { cause: 500 }));
    }
    res.status(201).json({ message: "Done", courseEnroll: user });

    // Add new course to enrollment
    // if (!courseFound) {
    //   user.courses.push({
    //     coursesIds: [{ courseId: codeAssignedToCourse || courseId }],
    //     fromDate: codeDoc.fromDate,
    //     toDate: codeDoc.toDate,
    //     isPaid: true,
    //   });
    //   await user.save();
    //   return res.status(201).json({ message: "Done", courseEnroll: user });
    // }
  } else {
    // add course to student
    const enrollObject = {
      userId: _id,
      courses: [
        {
          coursesIds: codeDoc.codeAssignedToCourse,
          fromDate: codeDoc.fromDate,
          toDate: codeDoc.toDate,
          isPaid: true,
        },
      ],
    };

    const enroll = await enrollmentModel.create(enrollObject);
    req.failedDocument = { model: enrollmentModel, _id: enroll._id };
    if (!enroll) {
      return next(new Error("fail in DB", { cause: 500 }));
    }

    res.status(201).json({ message: "Done", courseEnroll: enroll });
  }
};
