import joi from "joi";
import { generalFields } from "../../middlewares/validation.js";

export const addLectureScheme = {
  body: joi
    .object({
      title: joi.string().min(4).max(55).required(),
      videoURL: joi.string().min(4).required(),
    })
    .required(),
  query: joi
    .object({
      categoryId: generalFields._id,
      subCategoryId: generalFields._id,
      courseId: generalFields._id,
    })
    .required()
    .options({ presence: "required" }),
};
