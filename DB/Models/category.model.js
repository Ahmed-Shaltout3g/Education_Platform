import { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      enum: ["primary", "preparatory", "secondary"],
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
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

categorySchema.virtual("subCategory", {
  ref: "SubCategory",
  localField: "_id",
  foreignField: "categoryId",
});

categorySchema.virtual("Course", {
  ref: "Course",
  localField: "_id",
  foreignField: "categoryId",
});
categorySchema.virtual("lecture", {
  ref: "Lecture",
  localField: "_id",
  foreignField: "categoryId",
});

export const categoryModel =
  model.Category || model("Category", categorySchema);
