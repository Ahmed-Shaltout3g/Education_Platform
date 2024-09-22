import { Router } from "express";
import * as allRoutes from "./auth.controller.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import * as validations from "./auth.validation.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import { Auth, authorization } from "../../middlewares/Auth.js";
import { myMulter } from "../../services/multer.js";
import allowedExtensions from "../../utils/allowedExtention.js";
import { systemRoles } from "../../utils/systemRoles.js";

const router = Router();
router.post(
  "/signup",
  validationCoreFunction(validations.signUpVaildation),
  asyncHandler(allRoutes.signUp)
);
router.post(
  "/signin",
  validationCoreFunction(validations.signInVaildation),
  asyncHandler(allRoutes.login)
);
router.get(
  "/confirmEmail/:token",
  validationCoreFunction(validations.confirmationEmailValidation),
  asyncHandler(allRoutes.confirmEmail)
);

router.post(
  "/forget",
  validationCoreFunction(validations.forgetPassVaildation),
  asyncHandler(allRoutes.forgetPass)
);

router.post(
  "/resetPass/:token",
  validationCoreFunction(validations.resetPassVaildation),
  asyncHandler(allRoutes.resetPassword)
);
router.patch(
  "/profile",
  Auth(),
  myMulter().single("image"),
  asyncHandler(allRoutes.uploadProfilePicture)
);
router.patch(
  "/changePass",
  Auth(),

  asyncHandler(allRoutes.changePass)
);
router.post(
  "/addTeacher",
  Auth(),
  authorization([systemRoles.ADMIN]),
  validationCoreFunction(validations.addTeacherValidation),
  asyncHandler(allRoutes.addTeacher)
);
router.delete(
  "/deleteTeacher",
  Auth(),
  authorization([systemRoles.ADMIN]),
  validationCoreFunction(validations.deleteTeacherValidation),
  asyncHandler(allRoutes.deleteTeacher)
);

router.patch("/update", asyncHandler(allRoutes.updateUser));

router.get("/teachers", asyncHandler(allRoutes.getTeacher));

export default router;
