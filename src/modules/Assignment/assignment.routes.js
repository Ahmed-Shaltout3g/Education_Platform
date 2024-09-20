import { Router } from "express";
const router = Router();
import * as assignmentController from "./assignment.controller.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { myMulter } from "../../services/multer.js";
import allowedExtensions from "../../utils/allowedExtention.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import { addAssignmentScheme } from "./assignment.validation.js";
import { Auth, authorization } from "../../middlewares/Auth.js";
import { systemRoles } from "../../utils/systemRoles.js";

router.post(
  "/create",
  Auth(),
  authorization([systemRoles.ADMIN, systemRoles.TEACHER]),
  myMulter({
    customValidation: allowedExtensions.Files,
  }).single("application"),
  validationCoreFunction(addAssignmentScheme),
  asyncHandler(assignmentController.createAssignment)
);
// router.put(
//   "/update",
//   Auth(),
//   authorization([systemRoles.ADMIN, systemRoles.TEACHER]),
//   myMulter(allowedExtensions.Image).array("image", 3),
//   asyncHandler(lectureController.updateLecture)
// );
// router.delete(
//   "/delete",
//   Auth(),
//   authorization([systemRoles.ADMIN, systemRoles.TEACHER]),

//   asyncHandler(lectureController.deleteLecture)
// );
// router.get(
//   "/",

//   asyncHandler(lectureController.getAllLectures)
// );

export default router;
