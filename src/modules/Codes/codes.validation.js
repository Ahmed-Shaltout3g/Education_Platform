import joi from "joi";
import { generalFields } from "../../middlewares/validation.js";

export const addCodesSchema = {
  body: joi
    .object({
      numberOfCodes: joi.number().positive().min(1).max(100).required(),
      fromDate: joi
        .date()
        .greater(Date.now() - 24 * 60 * 60 * 1000)

        .message("must today or more")
        .required(),
      toDate: joi
        .date()
        .greater(joi.ref("fromDate"))

        .message("must After from date ")
        .required(),
    })
    .required(),
  query: joi
    .object({
      courseId: generalFields._id,
    })
    .required(),
};

export const addCodesForTermSchema = {
  body: joi
    .object({
      numberOfCodes: joi.number().positive().min(1).max(100).required(),
      fromDate: joi
        .date()
        .greater(Date.now() - 24 * 60 * 60 * 1000)

        .message("must today or more")
        .required(),
      toDate: joi
        .date()
        .greater(joi.ref("fromDate"))

        .message("must After from date ")
        .required(),
    })
    .required(),
  query: joi
    .object({
      subCategoryId: generalFields._id,
    })
    .required(),
};

export const courseSchema = {
  body: joi
    .object({
      name: joi.string().min(4).max(55).required(),
    })
    .required(),
  query: joi
    .object({
      courseId: generalFields._id,
    })
    .required(),
};

export const deleteCourseSchema = {
  query: joi
    .object({
      courseId: generalFields._id,
    })
    .required(),
};
