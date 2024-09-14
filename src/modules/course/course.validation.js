import joi from "joi";
import { generalFields } from "../../middlewares/validation.js";

export const addCourseSchema = {
  body: joi
    .object({
      name: joi.string().min(4).max(55).required(),
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
