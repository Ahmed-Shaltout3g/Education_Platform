import { Schema, model } from "mongoose";

const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["first", "second", "third", "fourth", "fifth", "sixth"],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
