import { Router } from "express";
const router = Router();
import * as codeslectureController from "./codes.controller.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { myMulter } from "../../services/multer.js";
import allowedExtensions from "../../utils/allowedExtention.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import { Auth, authorization } from "../../middlewares/Auth.js";
import { systemRoles } from "../../utils/systemRoles.js";
import { addCodesForTermSchema, addCodesSchema } from "./codes.validation.js";

router.post(
  "/create",
  Auth(),
  authorization([systemRoles.ADMIN, systemRoles.TEACHER]),
  myMulter(allowedExtensions.Image).single("image"),
  validationCoreFunction(addCodesSchema),
  asyncHandler(codeslectureController.creatCodes)
);

router.post(
  "/createForTerm",
  Auth(),
  authorization([systemRoles.ADMIN, systemRoles.TEACHER]),
  myMulter(allowedExtensions.Image).single("image"),
  validationCoreFunction(addCodesForTermSchema),
  asyncHandler(codeslectureController.creatCodesForTerm)
);

router.delete(
  "/delete",
  Auth(),
  authorization([systemRoles.ADMIN, systemRoles.TEACHER]),

  asyncHandler(codeslectureController.deleteCodes)
);

router.get(
  "/",

  asyncHandler(codeslectureController.getAllCodes)
);

export default router;
