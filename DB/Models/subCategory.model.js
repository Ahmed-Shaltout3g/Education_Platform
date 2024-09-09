import { Schema, model } from "mongoose";

const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    nameForStudent: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Uesr",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "Uesr",
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

subCategorySchema.virtual("Course", {
  ref: "Course",
  localField: "_id",
  foreignField: "subCategoryId",
});

export const subCategoryModel =
  model.SubCategory || model("SubCategory", subCategorySchema);
