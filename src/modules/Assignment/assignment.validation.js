import joi from "joi";
import { generalFields } from "../../middlewares/validation.js";

export const addAssignmentScheme = {
  body: joi
    .object({
      title: joi.string().min(4).max(55).required(),
      description: joi.string().min(4).max(1000).required(),
    })
    .required(),
  query: joi
    .object({
      lectureId: generalFields._id,
    })
    .required()
    .options({ presence: "required" }),
};
