import { Router } from "express";
const router = Router();
import * as enrollController from "./enrollment.controller.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import { Auth, authorization } from "../../middlewares/Auth.js";
import { systemRoles } from "../../utils/systemRoles.js";

router.post("/joincourse", Auth(), asyncHandler(enrollController.join));

router.post(
  "/joinForTerm",
  Auth(),
  asyncHandler(enrollController.joinTermCourses)
);

router.delete(
  "/delete",
  Auth(),
  asyncHandler(enrollController.deleteCourseFromUser)
);

router.get(
  "/",

  asyncHandler(enrollController.getUserEnrollments)
);

export default router;
