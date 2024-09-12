import { Router } from "express";
const router = Router();
import * as enrollController from "./enrollment.controller.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { myMulter } from "../../services/multer.js";
import allowedExtensions from "../../utils/allowedExtention.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import { Auth, authorization } from "../../middlewares/Auth.js";
import { systemRoles } from "../../utils/systemRoles.js";

router.post("/joincourse", Auth(), asyncHandler(enrollController.join));

// router.post(
//   "/createForTerm",
//   Auth(),
//   authorization([systemRoles.ADMIN, systemRoles.TEACHER]),
//   myMulter(allowedExtensions.Image).single("image"),
//   validationCoreFunction(addCodesForTermSchema),
//   asyncHandler(codeslectureController.creatCodesForTerm)
// );

// router.delete(
//   "/delete",
//   Auth(),
//   authorization([systemRoles.ADMIN, systemRoles.TEACHER]),

//   asyncHandler(codeslectureController.deleteCodes)
// );

// router.get(
//   "/",

//   asyncHandler(codeslectureController.getAllCodes)
// );

export default router;
