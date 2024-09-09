import { Schema, model } from "mongoose";

const lectureSchema = new Schema(
  {
    // ================text section===============
    title: {
      type: String,
      trim: true,
      required: true,
      lowerCase: true,
    },
    slug: {
      type: String,
      required: true,
    },

    videoURL: {
      type: String,
      required: [true, "videoURL is required"],
    },
    photo: {
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    // =================ids section ===============
    customId: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Uesr",
      required: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "Uesr",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "Uesr",
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "Uesr",
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Cource",
      required: true,
    },

    //  ============= specifiction section========

    // to field
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const lectureModel = model.Lecture || model("Lecture", lectureSchema);
