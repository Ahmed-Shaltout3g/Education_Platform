import { Schema, model } from "mongoose";

const courseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    photo: {
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    customId: String,
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

courseSchema.virtual("lectures", {
  ref: "Lecture",
  localField: "_id",
  foreignField: "courseId",
});

courseSchema.virtual("enrolledUsers", {
  ref: "Enrollment",
  localField: "_id",
  foreignField: "courses.coursesIds",
});

export const courseModel = model.Course || model("Course", courseSchema);
