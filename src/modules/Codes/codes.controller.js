import { customAlphabet } from "nanoid";
import { courseModel } from "../../../DB/Models/course.model.js";
import { codesModel } from "../../../DB/Models/codes.model.js";
import { subCategoryModel } from "../../../DB/Models/subCategory.model.js";
import { ApiFeature } from "../../utils/apiFeature.js";

// +++++++++++++++++++++++++create codes+++++++++++++++++++++

export const creatCodes = async (req, res, next) => {
  const { _id } = req.user;
  const { courseId } = req.query;
  const { numberOfCodes, fromDate, toDate } = req.body;
  const course = await courseModel.findById(courseId);
  if (!course) {
    return next(new Error("invalid course id ", { cause: 404 }));
  }
  const nanoid = customAlphabet(process.env.SECRET_NANOID_ALPH, 5);
  const codes = [];
  console.log(course);

  const startString = course.slug.slice(0, 5);
  for (let i = 0; i < numberOfCodes; i++) {
    const randomPart = nanoid();
    const code = startString + randomPart;
    codes.push(code);
  }

  const courseCodes = await codesModel.findOne({ courseId });
  const newCodesObject = {
    codes,
    createdBy: _id,
    codeAssignedToCourse: [{ courseId }],
    fromDate,
    toDate,
  };
  const createNewCodes = await codesModel.create(newCodesObject);
  req.failedDocument = { model: codesModel, _id: codesModel._id };
  if (!createNewCodes) {
    return next(new Error("fail create Codes ", { cause: 500 }));
  }
  res.status(201).json({
    message: "codes created successfuly",
    codes: createNewCodes,
  });
};

// +++++++++++++++++++++++++delete codes+++++++++++++++++++++

export const deleteCodes = async (req, res, next) => {
  const { codeId } = req.query;
  const { _id } = req.user;
  const codes = await codesModel.findById(codeId);

  if (!codes) {
    return next(new Error("invalid code id ", { cause: 404 }));
  }

  const codeDelete = await codesModel.findOneAndDelete({
    _id: codeId,
    createdBy: _id,
  });

  if (!codeDelete) {
    return next(
      new Error(
        "invalid codes for this course OR you can't delete this because you are not created it ",
        { cause: 404 }
      )
    );
  }
  res.status(201).json({
    message: "Done",
  });
};

// ====================get ALL codes================
export const getAllCodes = async (req, res, next) => {
  const apiFeaturesInistant = new ApiFeature(
    codesModel.find().populate({
      path: "codeAssignedToCourse.courseId",
      select: "name",
    }),
    req.query
  )
    .paginated()
    .sort()
    .select()
    .filters()
    .search();

  const codes = await apiFeaturesInistant.mongooseQuery;
  const paginationInfo = await apiFeaturesInistant.paginationInfo;
  const all = await codesModel.find().countDocuments();
  const totalPages = Math.ceil(all / paginationInfo.perPages);
  paginationInfo.totalPages = totalPages;
  if (codes.length) {
    return res.status(200).json({
      message: "Done",
      data: codes,
      paginationInfo,
    });
  }
  res.status(200).json({
    message: "No Items yet",
  });
};

export const creatCodesForTerm = async (req, res, next) => {
  const { _id } = req.user;
  const { subCategoryId } = req.query;
  const { numberOfCodes, fromDate, toDate } = req.body;
  const subCategory = await subCategoryModel.findById(subCategoryId);
  if (!subCategory) {
    return next(new Error("invalid subCategory ", { cause: 404 }));
  }
  const coursesInSub = await courseModel.find({
    subCategoryId: subCategoryId,
  });
  if (!coursesInSub) {
    return next(new Error("No courses in this subCategory ", { cause: 404 }));
  }
  const nanoid = customAlphabet(process.env.SECRET_NANOID_ALPH, 5);
  const codes = [];
  const startString = subCategory.name.slice(0, 5);
  for (let i = 0; i < numberOfCodes; i++) {
    const randomPart = nanoid();
    const code = startString + randomPart;
    codes.push(code);
  }
  let coursesId = [];
  for (const course of coursesInSub) {
    coursesId.push({ courseId: course._id });
  }
  const newCodesObject = {
    codes,
    createdBy: _id,
    codeAssignedToCourse: coursesId,
    fromDate,
    toDate,
    subCategoryId,
  };
  const createNewCodes = await codesModel.create(newCodesObject);
  req.failedDocument = { model: codesModel, _id: codesModel._id };
  if (!createNewCodes) {
    return next(new Error("fail create Codes ", { cause: 500 }));
  }
  res.status(201).json({
    message: "codes created successfuly",
    codes: createNewCodes,
  });
};
