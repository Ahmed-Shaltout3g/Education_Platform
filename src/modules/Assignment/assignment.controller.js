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
import { AssignmentModel } from "./../../../DB/Models/assignment.model.js";

// // =================create lecture=================

export const createAssignment = async (req, res, next) => {
  const { title, description } = req.body;
  const { file } = req;

  if (!file) {
    return res.status(400).json({ message: "PDF file is required" });
  }
  const { lectureId } = req.query;
  const { _id } = req.user;
  const lecture = await lectureModel.findById(lectureId);
  if (!lecture) {
    return next(new Error("invalid lectureId id ", { cause: 404 }));
  }
  const course = await courseModel.findById(lecture.courseId);
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

  if (!req.file) {
    return next(new Error("please upload course image", { cause: 400 }));
  }
  const customId = nanoid(5);

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.ONLINE_PLATFORM_FOLDER}/${category.name}/${subCategory.name}/Courses/${course.customId}/Lectures/${lecture.customId}/Assignment/${customId}`,
    }
  );

  req.ImagePath = `${process.env.ONLINE_PLATFORM_FOLDER}/${category.name}/${subCategory.name}/Courses/${course.customId}/Lectures/${lecture.customId}/Assignment/${customId}`;

  const assigmentObject = {
    pdf: { secure_url, public_id },
    title,
    description,
    lectureId,
    courseId: lecture.courseId,
    createdBy: _id,
  };

  const createAssigment = await AssignmentModel.create(assigmentObject);
  req.failedDocument = { model: AssignmentModel, _id: createAssigment._id };

  if (!createAssigment) {
    await cloudinary.api.delete_resources_by_prefix(
      `${process.env.ONLINE_PLATFORM_FOLDER}/${category.name}/${subCategory.name}/Courses/${course.customId}/Lectures/${lecture.customId}/Assignment/${customId}` ///delete folder  'api.delete'
    ); //delete the image
    await cloudinary.api.delete_folder(
      `${process.env.ONLINE_PLATFORM_FOLDER}/${category.name}/${subCategory.name}/Courses/${course.customId}/Lectures/${lecture.customId}/Assignment/${customId}` ///delete folder  'api.delete'
    );
    return next(new Error("fail", { cause: 400 }));
  }
  res.status(201).json({
    message: " created successfuly",
    Assignment: createAssigment,
  });
};

// // ============================update lecture ====================

export const updateAssignment = async (req, res, next) => {
  const { title, description } = req.body;
  const { assignmentId } = req.query;

  const assignment = await AssignmentModel.findById(assignmentId);

  if (!assignment) {
    return next(new Error("Assignment not found", { cause: 404 }));
  }

  // Update fields
  if (title) assignment.title = title;
  if (description) assignment.description = description;

  // If there's a new file, upload it and delete the old one
  if (req.file) {
    const folderPath = assignment.pdf.public_id
      .split("/")
      .slice(0, -1)
      .join("/");

    await cloudinary.uploader.destroy(assignment.pdf.public_id);

    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: folderPath,
      }
    );

    assignment.pdf = { secure_url, public_id };
  }

  await assignment.save();

  res.status(200).json({
    message: "Assignment updated successfully",
    assignment,
  });
};

// // ======================delete lecture ==================

export const deleteAssignment = async (req, res, next) => {
  const { assignmentId } = req.query;

  const assignment = await AssignmentModel.findById(assignmentId);

  if (!assignment) {
    return next(new Error("Assignment not found", { cause: 404 }));
  }

  // Delete the associated files from Cloudinary
  await cloudinary.uploader.destroy(assignment.pdf.public_id);

  // Delete the assignment from the database
  await AssignmentModel.findByIdAndDelete(assignmentId);

  res.status(200).json({
    message: "Assignment deleted successfully",
  });
};
// ===================get All lecture==============

export const getAllAssignments = async (req, res, next) => {
  const apiFeaturesInistant = new ApiFeature(AssignmentModel.find(), req.query)
    .paginated()
    .sort()
    .select()
    .filters()
    .search();

  const assignment = await apiFeaturesInistant.mongooseQuery
    .populate({
      path: "lectureId",
      select: "title slug ",
    })

    .populate({
      path: "courseId",
      select: "name",
    })
    .populate({
      path: "createdBy",
      select: "fullName  phoneNumber ",
    });
  const paginationInfo = await apiFeaturesInistant.paginationInfo;
  const all = await AssignmentModel.find().countDocuments();
  const totalPages = Math.ceil(all / paginationInfo.perPages);
  paginationInfo.totalPages = totalPages;
  if (assignment.length) {
    return res.status(200).json({
      message: "Done",
      data: assignment,
      paginationInfo,
    });
  }
  res.status(200).json({
    message: "No Items yet",
  });
};
