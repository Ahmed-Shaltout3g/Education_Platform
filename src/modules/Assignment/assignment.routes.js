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
router.patch(
  "/update",
  Auth(),
  authorization([systemRoles.ADMIN, systemRoles.TEACHER]),
  myMulter({
    customValidation: allowedExtensions.Files,
  }).single("application"),
  asyncHandler(assignmentController.updateAssignment)
);
router.delete(
  "/delete",
  Auth(),
  authorization([systemRoles.ADMIN, systemRoles.TEACHER]),

  asyncHandler(assignmentController.deleteAssignment)
);
router.get(
  "/",

  asyncHandler(assignmentController.getAllAssignments)
);

export default router;
