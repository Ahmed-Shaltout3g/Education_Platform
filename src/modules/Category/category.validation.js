import joi from "joi";
import { generalFields } from "./../../middlewares/validation.js";

export const categorySchema = {
  body: joi
    .object({
      name: joi
        .string()
        .min(4)
        .valid("primary", "preparatory", "secondary")
        .max(55)
        .required(),
    })
    .required(),
};
export const categoryUpdateSchema = {
  body: joi
    .object({
      name: joi
        .string()
        .min(4)
        .valid("primary", "preparatory", "secondary")
        .max(55)
        .required(),
    })
    .required(),
  query: joi
    .object({
      categoryId: generalFields._id,
    })
    .required(),
};

export const categoryDeleteSchema = {
  query: joi
    .object({
      categoryId: generalFields._id,
    })
    .required(),
};
