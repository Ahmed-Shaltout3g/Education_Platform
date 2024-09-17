import { codesModel } from "../../../DB/Models/codes.model.js";
import { enrollmentModel } from "../../../DB/Models/enrollmentCourse.model.js";
import { ApiFeature } from "../../utils/apiFeature.js";
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

// ====================join term courses========================

export const joinTermCourses = async (req, res, next) => {
  const { _id } = req.user;
  const { code } = req.body;
  const { subCategory } = req.query;

  // Find subcategory by ID
  const findSubCategory = await subCategoryModel.findById(subCategory);
  if (!findSubCategory) {
    return next(new Error("Invalid SubCategory Id", { cause: 404 }));
  }

  // Find and update code document
  const codeDoc = await codesModel.findOneAndUpdate(
    {
      codes: code,
      codesStatus: "Valid",
      subCategoryId: findSubCategory._id,
    },
    { $pull: { codes: code } },
    { new: true }
  );

  if (!codeDoc) {
    return next(new Error("Invalid or expired code", { cause: 404 }));
  }

  // Update code status if no codes left
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

  const courseUpdates = codeDoc.codeAssignedToCourse.map((course) => ({
    coursesIds: course.courseId,
    fromDate: codeDoc.fromDate,
    toDate: codeDoc.toDate,
    isPaid: true,
  }));

  const user = await enrollmentModel.findOne({ userId: _id });

  if (user) {
    // Remove old courses that match the new codeAssignedToCourses
    user.courses = user.courses.filter(
      (course) =>
        !codeDoc.codeAssignedToCourse.some(
          (assignedCourse) =>
            assignedCourse.courseId.toString() === course.coursesIds.toString()
        )
    );
    // Update existing user's courses
    user.courses.push(...courseUpdates);
    await user.save();
  } else {
    // Create new enrollment for the user
    const newEnrollment = new enrollmentModel({
      userId: _id,
      courses: courseUpdates,
    });

    await newEnrollment.save();
    req.failedDocument = { model: enrollmentModel, _id: newEnrollment._id };
  }

  res
    .status(201)
    .json({ message: "Done", courseEnroll: user || newEnrollment });
};

// ===============delete course from enrollMent=================
export const deleteCourseFromUser = async (req, res, next) => {
  const { _id } = req.user;
  const { courseId } = req.query;

  // Find the user's enrollment
  const userEnrollment = await enrollmentModel.findOne({ userId: _id });

  if (!userEnrollment) {
    return next(new Error("User did not have enrollment", { cause: 404 }));
  }

  // Filter out the course to be deleted
  const initialCourseCount = userEnrollment.courses.length;
  userEnrollment.courses = userEnrollment.courses.filter(
    (course) => course.coursesIds.toString() !== courseId
  );

  // If no course was removed, return an error
  if (userEnrollment.courses.length === initialCourseCount) {
    return next(new Error("Course not found for the user", { cause: 404 }));
  }

  // Save the updated user enrollment
  const saveEnrollment = await userEnrollment.save();
  if (!saveEnrollment) {
    return next(new Error("Fail in DB", { cause: 500 }));
  }

  return res.status(200).json({
    message: "Course deleted successfully",
    updatedCourses: userEnrollment.courses,
  });
};

export const getUserEnrollments = async (req, res, next) => {
  const apiFeaturesInistant = new ApiFeature(enrollmentModel.find(), req.query)
    .paginated()
    .sort()
    .select()
    .filters()
    .search();

  const enrollments = await apiFeaturesInistant.mongooseQuery
    .populate({
      path: "courses.coursesIds",
      select: "name slug photo teacher",
      populate: {
        path: "teacher",
        select: "fullName phoneNumber photo subjecTeacher",
      },
    })
    .populate({
      path: "userId",
      select: "fullName email",
    });
  const paginationInfo = await apiFeaturesInistant.paginationInfo;
  const all = await enrollmentModel.find().countDocuments();
  const totalPages = Math.ceil(all / paginationInfo.perPages);
  paginationInfo.totalPages = totalPages;
  if (enrollments.length) {
    return res.status(200).json({
      message: "Done",
      data: enrollments,
      paginationInfo,
    });
  }
  res.status(200).json({
    message: "No Items yet",
  });
};
