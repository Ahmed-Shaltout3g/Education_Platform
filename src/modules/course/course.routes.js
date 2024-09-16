import { Router } from "express";
import { myMulter } from "../../services/multer.js";
import allowedExtensions from "../../utils/allowedExtention.js";
import { asyncHandler } from "../../utils/errorHandling.js";
const router = Router();
import * as courseController from "./course.controller.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import {
  addCourseSchema,
  courseSchema,
  deleteCourseSchema,
} from "./course.validation.js";
import { Auth, authorization } from "../../middlewares/Auth.js";
import { systemRoles } from "../../utils/systemRoles.js";

router.post(
  "/create",
  Auth(),
  authorization([systemRoles.ADMIN, systemRoles.TEACHER]),
  myMulter(allowedExtensions.Image).single("image"),
  validationCoreFunction(addCourseSchema),
  asyncHandler(courseController.createCourse)
);

router.put(
  "/update",
  Auth(),
  authorization([systemRoles.ADMIN, systemRoles.TEACHER]),
  myMulter(allowedExtensions.Image).single("image"),
  validationCoreFunction(courseSchema),
  asyncHandler(courseController.updateCourse)
);

router.delete(
  "/delete",
  Auth(),
  authorization([systemRoles.ADMIN, systemRoles.TEACHER]),
  validationCoreFunction(deleteCourseSchema),
  asyncHandler(courseController.deleteCourse)
);
router.get("/", asyncHandler(courseController.getAllCourses));
router.get("/usersJoin", asyncHandler(courseController.getAllUsersForCourse));

export default router;
