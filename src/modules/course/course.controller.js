import slugify from "slugify";
import { subCategoryModel } from "../../../DB/Models/subCategory.model.js";
import { nanoid } from "nanoid";
import cloudinary from "../../utils/cloudinaryConfigration.js";
import { categoryModel } from "../../../DB/Models/category.model.js";
import { courseModel } from "../../../DB/Models/course.model.js";
import { lectureModel } from "../../../DB/Models/lecture.model.js";
import { ApiFeature } from "../../utils/apiFeature.js";

// ========================create brand==================

export const createCourse = async (req, res, next) => {
  const { _id } = req.user;
  const { subCategoryId } = req.query;
  const { name } = req.body;
  const subCategory = await subCategoryModel.findById(subCategoryId);
  if (!subCategory) {
    return next(new Error("invalid subCategory id ", { cause: 404 }));
  }

  const category = await categoryModel.findById(subCategory.categoryId);
  if (!category) {
    return next(new Error("invalid Category id ", { cause: 404 }));
  }

  const slug = slugify(name, {
    replacement: "_",
    lower: true,
    trim: true,
  });
  if (!req.file) {
    return next(new Error("please upload course image", { cause: 400 }));
  }
  const customId = nanoid(5);

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.ONLINE_PLATFORM_FOLDER}/${category.name}/${subCategory.name}/Courses/${customId}`,
    }
  );

  req.ImagePath = `${process.env.ONLINE_PLATFORM_FOLDER}/${category.name}/${subCategory.name}/Courses/${customId}`;

  const courseObject = {
    name,
    slug,
    customId,
    categoryId: subCategory.categoryId,
    subCategoryId,
    photo: { secure_url, public_id },
    createdBy: _id,
    teacher: _id,
  };

  const course = await courseModel.create(courseObject);
  req.failedDocument = { model: courseModel, _id: course._id };

  if (!course) {
    await cloudinary.uploader.destroy(public_id);
    await cloudinary.api.delete_folder(
      `${process.env.ONLINE_PLATFORM_FOLDER}/${category.name}/${subCategory.name}/Courses/${customId}`
    );

    return next(new Error("fail", { cause: 400 }));
  }
  res.status(201).json({
    message: "course created successfuly",
    course,
  });
};

//  ======================update course==============

export const updateCourse = async (req, res, next) => {
  const { courseId } = req.query;
  const { _id } = req.user;
  const course = await courseModel.findById(courseId);
  if (!course) {
    return next(new Error("invalid course id ", { cause: 404 }));
  }

  const subcategory = await subCategoryModel.findById(course.subCategoryId);
  if (!subcategory) {
    return next(new Error("invalid subcategory id ", { cause: 404 }));
  }
  const category = await categoryModel.findById(subcategory.categoryId);
  if (!category) {
    return next(new Error("invalid category id ", { cause: 404 }));
  }
  // name equal old name
  const { name } = req.body;
  if (name) {
    if (course.name == name.toLowerCase()) {
      return next(
        new Error("new name same old name please enter anothe name ", {
          cause: 404,
        })
      );
    }

    // change  slug
    const slug = slugify(name, {
      replacement: "_",
      lower: true,
      trim: true,
    });
    // add changes in DB
    course.slug = slug;
    course.name = name;
  }
  // change image

  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.ONLINE_PLATFORM_FOLDER}/${category.name}/${subcategory.name}/Courses/${course.customId}`,
      }
    );

    // delete old image from host

    await cloudinary.uploader.destroy(course.photo.public_id);

    //  add change image  in DB
    course.photo = { secure_url, public_id };
  }

  // save changes in DB
  course.updatedBy = _id;
  await course.save();

  res.status(200).json({
    message: "subCategory update successfuly",
    course,
  });
};

// =================delete course =================

export const deleteCourse = async (req, res, next) => {
  const { courseId } = req.query;
  const { _id } = req.user;
  const course = await courseModel.findOneAndDelete({
    _id: courseId,
    createdBy: _id,
  });

  if (!course) {
    return next(
      new Error(
        "invalid course id or you can't delete this because you are not created it ",
        { cause: 404 }
      )
    );
  }
  const subcategory = await subCategoryModel.findById(course.subCategoryId);
  if (!subcategory) {
    return next(new Error("invalid subcategory id ", { cause: 404 }));
  }
  const category = await categoryModel.findById(course.categoryId);
  if (!category) {
    return next(new Error("invalid category id ", { cause: 404 }));
  }

  //  delete product related course
  //  delete product link with this category
  const lecture = await lectureModel.findOne({ courseId });
  if (lecture) {
    const deleteLectures = await lectureModel.deleteMany({
      courseId,
    });

    if (!deleteLectures.deletedCount) {
      return next(
        new Error("fail delete lectures please try again", { cause: 500 })
      );
    }
  }
  // delete form host
  await cloudinary.api.delete_resources_by_prefix(
    `${process.env.ONLINE_PLATFORM_FOLDER}/${category.name}/${subcategory.name}/Courses/${course.customId}`
  );
  await cloudinary.api.delete_folder(
    `${process.env.ONLINE_PLATFORM_FOLDER}/${category.name}/${subcategory.name}/Courses/${course.customId}`
  );
  res.status(200).json({
    message: "course delete successfuly",
  });
};

//================== get all courses===================

// export const getAllCourses = async (req, res, next) => {
//   const courses = await courseModel
//     .find()
//     .populate({
//       path: "categoryId",
//       select: "name",
//     })
//     .populate({
//       path: "subCategoryId",
//       select: "name",
//     })
//     .populate({
//       path: "lectures",
//     });
//   if (courses.length) {
//     return res.status(200).json({
//       message: "Done",
//       courses,
//     });
//   }
//   res.status(200).json({
//     message: "No Items",
//   });
// };

// export const getCategoryDetails = async (req, res, next) => {
//   const { categoryId } = req.params;
//   const category = await categoryModel.findById(categoryId).populate({
//     path: "subCategory",
//     select: "name",
//     populate: {
//       path: "Course",
//       select: "name",
//       populate: {
//         path: "lectures",
//         select: "title photo",
//       },
//     },
//   });

//   if (category) {
//     return res.status(200).json({
//       message: "Done",
//       category,
//     });
//   }
//   return next(new Error("Invalid category Id ", { cause: 500 }));
// };

export const getAllCourses = async (req, res, next) => {
  const apiFeaturesInistant = new ApiFeature(courseModel.find(), req.query)
    .paginated()
    .sort()
    .select()
    .filters()
    .search();

  const courses = await apiFeaturesInistant.mongooseQuery
    .populate({
      path: "categoryId",
      select: "name slug ",
    })
    .populate({
      path: "subCategoryId",
      select: "name slug ",
    })

    .populate({
      path: "teacher",
      select: "fullName moreInfo subjecTeacher gender phoneNumber stage",
    })
    .populate({
      path: "lectures",
      select: "title",
    });
  const paginationInfo = await apiFeaturesInistant.paginationInfo;
  const all = await courseModel.find().countDocuments();
  const totalPages = Math.ceil(all / paginationInfo.perPages);
  paginationInfo.totalPages = totalPages;
  if (courses.length) {
    return res.status(200).json({
      message: "Done",
      data: courses,
      paginationInfo,
    });
  }
  res.status(200).json({
    message: "No Items yet",
  });
};

// get all user joine to this course

export const getAllUsersForCourse = async (req, res, next) => {
  const { courseId } = req.query;

  // Find the course and populate enrolled users
  const course = await courseModel.findById(courseId).populate({
    path: "enrolledUsers",
    populate: {
      path: "userId",
      select: "fullName parentsPhoneNumber email phoneNumber",
    },
  });

  if (!course) {
    return res.status(404).json({
      message: "Course not found",
    });
  }

  // Extract the enrolled users
  const enrolledUsers = course.enrolledUsers.map(
    (enrollment) => enrollment.userId
  );

  if (!enrolledUsers) {
    return res.status(200).json({
      message: "No user",
    });
  }
  res.status(200).json({
    message: "Enrolled users fetched successfully",
    data: enrolledUsers,
  });
};
