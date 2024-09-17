import { Schema, model } from "mongoose";
import { systemRoles } from "./../../src/utils/systemRoles.js";
import { hashingPassword } from "../../src/utils/hashing.js";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      trim: true,
      required: [true, "fullName is required"],
      lowercase: true,
    },
    email: {
      type: String,
      trim: true,
      unique: [true, "Email is unique"],
      required: [true, "Email is required"],
      lowercase: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    phoneNumber: {
      type: String,
      required: [true, "Phone is required"],
    },
    parentsPhoneNumber: {
      type: String,
    },
    profileImage: {
      secure_url: String,
      public_id: String,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      default: systemRoles.USER,
      enum: [systemRoles.USER, systemRoles.ADMIN, systemRoles.TEACHER],
    },
    gender: {
      type: String,
      default: "Not Specifid",
      enum: ["male", "female"],
      required: [true, "gender is required"],
    },
    stage: {
      type: String,
      default: "secondary",
      enum: ["primary", "preparatory", "secondary"],
    },
    grade: {
      type: String,

      enum: ["first", "second", "third", "fourth", "fifth", "sixth"],
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    customId: String,
    isLogedIn: {
      type: Boolean,
      default: false,
    },
    code: {
      type: String,
      default: null,
    },
    changePassAt: {
      type: Date,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },

    token: {
      type: String,
    },
    updatedAt: {
      type: Date,
    },
    // teacher
    subjecTeacher: {
      type: String,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.virtual("teacher", {
  ref: "Lecture",
  localField: "_id",
  foreignField: "teacher",
});
userSchema.virtual("enrollments", {
  ref: "Enrollment",
  localField: "_id",
  foreignField: "userId",
});

userSchema.pre("save", function (next, doc) {
  this.password = hashingPassword(
    this.password,
    parseInt(process.env.SOLT_ROUNDS)
  );
  next();
});
export const userModel = model.User || model("User", userSchema);
