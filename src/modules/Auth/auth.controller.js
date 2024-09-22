import { userModel } from "../../../DB/Models/user.model.js";
import { sendEmail } from "../../services/sendEmail.js";
import { comparePassword, hashingPassword } from "../../utils/hashing.js";
import { decodeToken, generateToken } from "../../utils/tokenFunctions.js";
import bcrypt from "bcrypt";
import { emailTemplate } from "./../../utils/emailTemplate.js";
import { nanoid } from "nanoid";
import { decryptText, encryptText } from "../../utils/encryptionFunction.js";
import { systemRoles } from "../../utils/systemRoles.js";
import { courseModel } from "../../../DB/Models/course.model.js";
import { ApiFeature } from "../../utils/apiFeature.js";
import cloudinary from "../../utils/cloudinaryConfigration.js";
export const signUp = async (req, res, next) => {
  const {
    fullName,
    email,
    password,
    repassword,
    phoneNumber,
    gender,
    parentsPhoneNumber,
    stage,
    grade,
  } = req.body;
  if (password == repassword) {
    const user = await userModel.findOne({ email });
    if (user) {
      next(new Error("Email Already Exist", { cause: 401 }));
    } else {
      // const newUser = await new userModel({

      // });
      const encryptPassword = encryptText(
        password,
        process.env.CRYPTO_SECRET_KEY
      );

      const token = generateToken({
        payload: {
          fullName,
          email,
          password: encryptPassword,
          gender,
          phoneNumber,
          parentsPhoneNumber,
          stage,
          grade,
        },
      });
      if (token) {
        const confirmationLink = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}`;
        // const message = `<a href=${confirmationLink}>click here</a>`;
        const emailSent = await sendEmail({
          to: email,
          subject: "Confirmation email",
          message: emailTemplate({
            link: confirmationLink,
            linkData: "Click to Confirm",
            subject: "confirmation email ",
          }),
        });
        console.log(emailSent);
        if (emailSent) {
          // await newUser.save();
          return res
            .status(201)
            .json({ message: "Sign up success please confirm email" });
        } else {
          next(new Error("Send Email Fail please try again", { cause: 500 }));
        }
      } else {
        next(new Error("Token generastion fail", { cause: 400 }));
      }
    }
  } else {
    next(new Error("password must match repassword", { cause: 401 }));
  }
};

// _____________________confirmEmail________________________;

export const confirmEmail = async (req, res, next) => {
  const { token } = req.params;
  const decode = decodeToken({ payload: token });
  if (decode) {
    const confirmTwice = await userModel.findOne({
      email: decode.email,
      isConfirmed: true,
    });
    if (confirmTwice) {
      return next(new Error("already confirmed", { cause: 400 }));
    }
    const decryptPass = decryptText(
      decode?.password,
      process.env.CRYPTO_SECRET_KEY
    );
    decode.isConfirmed = true;
    decode.password = decryptPass;
    const confirmUser = new userModel({
      ...decode,
    });
    await confirmUser.save();
    // res.redirect(`${process.env.FRONTEND_URL}#/login`);
    res
      .status(200)
      .json({ message: "Confirmation success ,please try to Login" });
  } else {
    next(new Error("unknown error ,please try again", { cause: 500 }));
  }
};

// ______________________________login________________________________

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email, isConfirmed: true });
  if (!user) {
    return next(new Error("In-valid email or password", { cause: 400 }));
  }
  const match = bcrypt.compareSync(password, user.password);
  if (!match) {
    return next(new Error("In-valid email or password", { cause: 401 }));
  }
  const token = generateToken({
    payload: {
      _id: user._id,
      fullName: user.fullName,
      role: user.role,
      email: user.email,
      isLogedIn: true,
      isConfirmed: user.isConfirmed,
    },
  });
  // user.token = token;
  // await userModel.save();
  const Loggenin = await userModel.findByIdAndUpdate(
    { _id: user._id },
    { isLogedIn: true, token }
  );
  if (!Loggenin) {
    return next(new Error("please logged in again "));
  }
  res.status(200).json({ message: "login success", token });
};

// ________________________forgetPassword_______________________________--

export const forgetPass = async (req, res, next) => {
  const { email } = req.body;
  const emailExist = await userModel.findOne({ email });
  if (!emailExist) {
    return next(new Error("In-valid Email ", { cause: 401 }));
  }
  const code = nanoid(5);
  const codeHash = hashingPassword(code, parseInt(process.env.SALT_ROUNDS));
  const token = generateToken({
    payload: {
      email: emailExist.email,
      code: codeHash,
      changePassAt: Date.now(),
    },
  });

  if (!token) {
    return next(
      new Error("Token generastion fail plrase try again", { cause: 500 })
    );
  }
  const restPasswordURL = `${req.protocol}://${req.headers.host}/auth/resetPass/${token}`;

  const emailSent = await sendEmail({
    to: emailExist.email,
    subject: "Reset Password",
    message: emailTemplate({
      link: restPasswordURL,
      linkData: "Click To Reset",
      subject: "Reset Password",
    }),
  });

  if (!emailSent) {
    return next(
      new Error(" Fail send email ! please try again", { cause: 409 })
    );
  }
  const userUpdate = await userModel.findOneAndUpdate(
    { email },
    { code: codeHash },
    { changePassAt: Date.now() },
    { new: true }
  );
  res.status(201).json({ message: "Please check your email", restPasswordURL });
};

// ________________________ResetPassword_______________________________--

export const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  const decode = decodeToken({ payload: token });

  if (!decode?.code) {
    return next(new Error("decode fail ,please try again", { cause: 500 }));
  }
  const user = await userModel.findOne({
    email: decode?.email,
    code: decode?.code,
  });
  if (!user) {
    return next(
      new Error("You Already Reset Password , Please Try To Login  ", {
        cause: 401,
      })
    );
  }

  user.password = newPassword;
  user.code = null;
  user.token = null;

  user.changePassAt = Date.now();
  const userSave = await user.save();

  if (!userSave) {
    return next(
      new Error(" fail to reset your password ,please try again", {
        cause: 500,
      })
    );
  }
  res.status(200).json({ message: "Done , please try to login" });
};

// ------------------------------change password-----------------
export const changePass = async (req, res, next) => {
  const { _id } = req.user;
  const { oldPass, newPass } = req.body;
  if (oldPass == newPass) {
    return next(new Error("old password equal new password ", { cause: 400 }));
  }
  const user = await userModel.findById({ _id });
  if (!user) {
    return next(new Error("Not found please try to login ", { cause: 400 }));
  }
  const match = comparePassword(oldPass, user.password);
  if (!match) {
    return next(new Error("Wrong old password ", { cause: 400 }));
  }

  user.password = newPass;
  const save = await user.save();

  if (!save) {
    return next(new Error("fail please try again ", { cause: 500 }));
  }
  res.status(200).json({ message: "Done, please try to login " });
};
// _______________________profile_image___________________

export const uploadProfilePicture = async (req, res, next) => {
  const { _id } = req.user;
  if (!req.file) {
    return next(new Error("please upload profile image", { cause: 400 }));
  }
  const user = await userModel.findById({ _id });

  // Delete old profile image if exists
  if (user.profileImage && user.profileImage.public_id) {
    await cloudinary.uploader.destroy(user.profileImage.public_id);
  }

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.ONLINE_PLATFORM_FOLDER}/Profile/${user.fullName}/${user.email}`,
    }
  );
  req.ImagePath = `${process.env.ONLINE_PLATFORM_FOLDER}/Profile/${user.fullName}/${user.email}`;

  const updatedUser = await userModel.findByIdAndUpdate(
    { _id },
    { profileImage: { secure_url, public_id } },
    { new: true }
  );

  if (!updatedUser) {
    return next(new Error("upload fail ,please try again", { cause: 500 }));
  }
  res.status(200).json({ message: "Done " });
};

// ====================update user and teacher============

export const updateUser = async (req, res, next) => {
  const { userId } = req.query;
  const { fullName, stage, subjecTeacher } = req.body;

  const user = await userModel.findById(userId);
  if (!user) {
    return next(new Error("invalid user id please try again ", { cause: 404 }));
  }
  const updateFields = {};

  // Update user fields if they are provided in the request body
  if (fullName) {
    updateFields.fullName = fullName;
  }
  if (stage) {
    updateFields.stage = stage;
  }
  if (subjecTeacher) {
    updateFields.subjecTeacher = subjecTeacher;
  }

  updateFields.updatedAt = new Date();

  const updatedUser = await userModel.findByIdAndUpdate(
    userId,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    return next(new Error("fail", { cause: 401 }));
  }

  res.status(200).json({
    message: "User updated successfully",
    user: updatedUser,
  });
};

// =============================TEACHER======================
// ======================add teacher=======================
export const addTeacher = async (req, res, next) => {
  const { _id } = req.user;
  const {
    fullName,
    email,
    password,
    repassword,
    phoneNumber,
    gender,
    subjecTeacher,
    stage,
  } = req.body;
  const { courseId } = req.query;

  if (password == repassword) {
    const user = await userModel.findOne({ email });
    if (user) {
      next(new Error("Email Already Exist", { cause: 401 }));
    } else {
      const course = await courseModel.findById(courseId);
      if (!course) {
        return next(new Error("invalid Course Id", { cause: 401 }));
      }

      const confirmUser = new userModel({
        fullName,
        email,
        password,
        phoneNumber,
        gender,
        subjecTeacher,
        courseId,
        stage,
        isConfirmed: true,
        role: systemRoles.TEACHER,
      });
      await confirmUser.save();
      res.status(200).json({ message: "Done,please try to Login" });
    }
  } else {
    next(new Error("password must match repassword", { cause: 401 }));
  }
};

// ================deleteTeacher==================
export const deleteTeacher = async (req, res, next) => {
  const { _id } = req.user;
  const { email } = req.body;
  const { teacherId } = req.query;
  const user = await userModel.findOneAndDelete({
    email: email,
    _id: teacherId,
    role: "Teacher",
  });

  if (!user) {
    return next(new Error("Invalid Email Or Id ", { cause: 401 }));
  }
  res.status(200).json({ message: "Done" });
};

// get all teachers

export const getTeacher = async (req, res, next) => {
  const apiFeaturesInistant = new ApiFeature(userModel.find(), req.query)
    .paginated()
    .sort()
    .select()
    .filters()
    .search();

  const teachers = await apiFeaturesInistant.mongooseQuery.populate({
    path: "courseId",
    select: "name slug createdAt",
  });
  const paginationInfo = await apiFeaturesInistant.paginationInfo;
  const all = await userModel.find().countDocuments();
  const totalPages = Math.ceil(all / paginationInfo.perPages);
  paginationInfo.totalPages = totalPages;
  if (teachers.length) {
    return res.status(200).json({
      message: "Done",
      data: teachers,
      paginationInfo,
    });
  }
  res.status(200).json({
    message: "No Items yet",
  });
};

// _________________________get user data___________________

export const userData = async (req, res, next) => {
  const { _id } = req.body;
  const user = await userModel.findById(_id);
  if (!user) {
    return next(new Error("In-valid _id", { cause: 401 }));
  }
  res.status(200).json({ message: "Done ", userData });
};
