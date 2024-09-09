import { Router } from "express";
const router = Router();
import { myMulter } from "./../../services/multer.js";
import allowedExtensions from "../../utils/allowedExtention.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import * as subCategoryController from "./subcategory.controller.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import {
  subCategoryDeleteSchema,
  subCategorySchema,
  subCategoryUpdateSchema,
} from "./subCategory.validation.js";
import { Auth, authorization } from "../../middlewares/Auth.js";
import { systemRoles } from "../../utils/systemRoles.js";

router.post(
  "/create",
  Auth(),
  authorization([systemRoles.ADMIN, systemRoles.TEACHER]),
  validationCoreFunction(subCategorySchema),
  asyncHandler(subCategoryController.createSubCategory)
);
router.put(
  "/update",
  Auth(),
  authorization([systemRoles.ADMIN, systemRoles.TEACHER]),
  validationCoreFunction(subCategoryUpdateSchema),
  asyncHandler(subCategoryController.updateSubCategory)
);

router.delete(
  "/delete",
  Auth(),
  authorization([systemRoles.ADMIN, systemRoles.TEACHER]),
  validationCoreFunction(subCategoryDeleteSchema),
  asyncHandler(subCategoryController.deleteSubCategory)
);

router.get("/", asyncHandler(subCategoryController.getAllSubCategories));

export default router;
