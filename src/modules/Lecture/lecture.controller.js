import slugify from "slugify";
import { categoryModel } from "../../../DB/Models/category.model.js";
import { subCategoryModel } from "../../../DB/Models/subCategory.model.js";
import { courseModel } from "./../../../DB/Models/course.model.js";
import { nanoid } from "nanoid";
import cloudinary from "../../utils/cloudinaryConfigration.js";
import { lectureModel } from "./../../../DB/Models/lecture.model.js";
import { pagination } from "../../utils/pagination.js";
import { ApiFeature } from "../../utils/apiFeature.js";
import { encryptText } from "../../utils/encryptionFunction.js";

// // =================create lecture=================

export const createLecture = async (req, res, next) => {
  const { title, videoURL } = req.body;
  const { courseId } = req.query;
  const { _id } = req.user;
  const course = await courseModel.findById(courseId);
  if (!course) {
    return next(new Error("invalid course id ", { cause: 404 }));
  }
  const subCategory = await subCategoryModel.findById(course.subCategoryId);
  if (!subCategory) {
    return next(new Error("invalid subCategory id ", { cause: 404 }));
  }

  const category = await categoryModel.findById(course.categoryId);
  if (!category) {
    return next(new Error("invalid category id ", { cause: 404 }));
  }

  const slug = slugify(title, {
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
      folder: `${process.env.ONLINE_PLATFORM_FOLDER}/${category.name}/${subCategory.name}/Courses/${course.customId}/Lectures/${customId}`,
    }
  );

  req.ImagePath = `${process.env.ONLINE_PLATFORM_FOLDER}/${category.name}/${subCategory.name}/Courses/${course.customId}/Lectures/${customId}`;

  // video URL encription
  const encryptVideoURL = encryptText(videoURL, process.env.CRYPTO_SECRET_KEY);
  const lectureObject = {
    title,
    slug,
    videoURL: encryptVideoURL,
    customId,
    photo: { secure_url, public_id },
    categoryId: course.categoryId,
    subCategoryId: course.subCategoryId,
    courseId,
    createdBy: _id,
    teacher: _id,
  };

  const createlecture = await lectureModel.create(lectureObject);
  req.failedDocument = { model: lectureModel, _id: createlecture._id };

  if (!createlecture) {
    await cloudinary.api.delete_resources_by_prefix(
      `${process.env.ONLINE_PLATFORM_FOLDER}/${category.name}/${subCategory.name}/Courses/${course.customId}/Lectures/${customId}` ///delete folder  'api.delete'
    ); //delete the image
    await cloudinary.api.delete_folder(
      `${process.env.ONLINE_PLATFORM_FOLDER}/${category.name}/${subCategory.name}/Courses/${course.customId}/Lectures/${customId}` ///delete folder  'api.delete'
    );
    return next(new Error("fail", { cause: 400 }));
  }
  res.status(201).json({
    message: " created successfuly",
    lectures: createlecture,
  });
};

// // ============================update lecture ====================

export const updateLecture = async (req, res, next) => {
  const { title, videoURL } = req.body;
  const { lectureId, categoryId, courseId, subCategoryId } = req.query;
  const { _id } = req.user;
  const lecture = await lectureModel.findById(lectureId);
  if (!lecture) {
    return next(new Error("invalid lecture id ", { cause: 404 }));
  }

  const category = await categoryModel.findById(
    categoryId || lecture.categoryId
  );
  if (categoryId) {
    if (!category) {
      return next(new Error("invalid category id ", { cause: 404 }));
    }
    lecture.categoryId = categoryId;
  }
  const subCategory = await categoryModel.findById(
    categoryId || lecture.subCategory
  );

  if (subCategoryId) {
    if (!subCategory) {
      return next(new Error("invalid subCategory id ", { cause: 404 }));
    }
    lecture.subCategoryId = subCategoryId;
  }
  const course = await courseModel.findById(courseId || lecture.courseId);
  if (courseId) {
    if (!course) {
      return next(new Error("invalid course id ", { cause: 404 }));
    }
    lecture.courseId = courseId;
  }

  if (title) {
    const slug = slugify(title, {
      replacement: "_",
      lower: true,
      trim: true,
    });
    lecture.title = title;
    lecture.slug = slug;
  }

  //   =============change image==============

  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.ONLINE_PLATFORM_FOLDER}/${category.name}/${subCategory.name}/Courses/${course.customId}/Lectures/${lecture.customId}`,
      }
    );

    // delete old image from host

    await cloudinary.uploader.destroy(lecture.photo.public_id);

    //  add change image  in DB
    lecture.photo = { secure_url, public_id };
  }

  if (videoURL) {
    const encryptVideoURL = encryptText(
      videoURL,
      process.env.CRYPTO_SECRET_KEY
    );

    lecture.desc = encryptVideoURL;
  }
  lecture.updatedBy = _id;

  // save all changes
  await lecture.save();

  res.status(200).json({
    message: "Done",
    lecture,
  });
};

// // ======================delete lecture ==================

export const deleteLecture = async (req, res, next) => {
  const { lectureId } = req.query;
  const { _id } = req.user;
  console.log();

  const lecture = await lectureModel.findOneAndDelete({
    _id: lectureId,
    createdBy: _id,
  });
  if (!lecture) {
    return next(
      new Error("invalid lecture id Or you are not create this lecture ", {
        cause: 404,
      })
    );
  }

  const category = await categoryModel.findById(lecture.categoryId);
  if (!category) {
    return next(new Error("invalid category id ", { cause: 404 }));
  }
  const subCategory = await subCategoryModel.findById(lecture.subCategoryId);
  if (!subCategory) {
    return next(new Error("invalid subCategory id ", { cause: 404 }));
  }
  const course = await courseModel.findById(lecture.courseId);
  if (!course) {
    return next(new Error("invalid course id ", { cause: 404 }));
  }

  // ===delete from host ===
  await cloudinary.api.delete_resources_by_prefix(
    `${process.env.ONLINE_PLATFORM_FOLDER}/${category.name}/${subCategory.name}/Courses/${course.customId}/Lectures/${lecture.customId}` ///delete images  'api.delete'
  );
  await cloudinary.api.delete_folder(
    `${process.env.ONLINE_PLATFORM_FOLDER}/${category.name}/${subCategory.name}/Courses/${course.customId}/Lectures/${lecture.customId}` ///delete images  'api.delete'
  );

  res.status(200).json({
    message: "Done",
  });
};

// ===================get All lecture==============

// export const getAlllectures = async (req, res, next) => {
//   const { page, size } = req.query;

//   const { perPages, skip, currentPage, nextPage, prePage } = pagination({
//     page,
//     size,
//   });
//   const all = await lectureModel.find().count();
//   const lectures = await lectureModel.find().limit(perPages).skip(skip);
//   const totalPages = Math.ceil(all / perPages);

//   if (lectures.length) {
//     return res.status(200).json({
//       message: "Done",
//       data: lectures,
//       perPages,
//       currentPage,
//       nextPage,
//       prePage,
//       totalPages,
//     });
//   }
//   res.status(200).json({
//     message: "No Items yet",
//   });
// };

export const getAllLectures = async (req, res, next) => {
  const apiFeaturesInistant = new ApiFeature(lectureModel.find(), req.query)
    .paginated()
    .sort()
    .select()
    .filters()
    .search();

  const lectures = await apiFeaturesInistant.mongooseQuery
    .populate({
      path: "categoryId",
      select: "name slug ",
    })
    .populate({
      path: "subCategoryId",
      select: "name slug ",
    })
    .populate({
      path: "courseId",
      select: "name",
    })
    .populate({
      path: "teacher",
      select: "fullName moreInfo subjecTeacher phoneNumber stage",
    });
  const paginationInfo = await apiFeaturesInistant.paginationInfo;
  const all = await lectureModel.find().countDocuments();
  const totalPages = Math.ceil(all / paginationInfo.perPages);
  paginationInfo.totalPages = totalPages;
  if (lectures.length) {
    return res.status(200).json({
      message: "Done",
      data: lectures,
      paginationInfo,
    });
  }
  res.status(200).json({
    message: "No Items yet",
  });
};
