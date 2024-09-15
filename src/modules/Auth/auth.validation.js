import joi from "joi";
import { generalFields } from "../../middlewares/validation.js";

export const signUpVaildation = {
  body: joi
    .object()
    .required()
    .keys({
      fullName: joi.string().min(3).max(1000).required(),
      email: generalFields.email,
      password: generalFields.password,
      repassword: joi.string().valid(joi.ref("password")).required(),
      gender: joi.string().valid("male", "female").required(),
      phoneNumber: joi
        .string()
        .regex(/^\+20[0-9]{10}$/)
        .messages({
          "string.pattern.base": "enter valid phone number",
        })
        .required(),
      parentsPhoneNumber: joi
        .string()
        .regex(/^\+20[0-9]{10}$/)
        .messages({
          "string.pattern.base": "enter valid phone number",
        })
        .required(),
      stage: joi
        .string()
        .valid("primary", "preparatory", "secondary")
        .required(),
      grade: joi
        .string()
        .valid("first", "second", "third", "fourth", "fifth", "sixth")
        .required(),
    }),
};
export const addTeacherValidation = {
  body: joi
    .object()
    .required()
    .keys({
      fullName: joi.string().min(3).max(1000).required(),
      email: generalFields.email,
      password: generalFields.password,
      repassword: joi.string().valid(joi.ref("password")).required(),
      gender: joi.string().valid("male", "female").required(),
      phoneNumber: joi
        .string()
        .regex(/^\+20[0-9]{10}$/)
        .messages({
          "string.pattern.base": "enter valid phone number",
        })
        .required(),
      stage: joi
        .string()
        .valid("primary", "preparatory", "secondary")
        .required(),
      subjecTeacher: joi.string().min(3).max(1000).required(),
    }),
};

export const confirmationEmailValidation = () => {
  params: joi.object().required().keys({
    token: joi.string().required(),
  });
};

export const signInVaildation = {
  body: joi.object().required().keys({
    email: generalFields.email,
    password: generalFields.password,
  }),
};

export const forgetPassVaildation = {
  body: joi.object().required().keys({
    email: generalFields.email,
  }),
};

export const resetPassVaildation = {
  body: joi.object().required().keys({
    newPassword: generalFields.password,
  }),
};

export const deleteTeacherValidation = {
  body: joi.object().required().keys({
    email: generalFields.email,
  }),
  query: joi
    .object({
      teacherId: generalFields._id,
    })
    .required()
    .options({ presence: "required" }),
};
