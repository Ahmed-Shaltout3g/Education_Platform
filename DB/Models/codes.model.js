import { Schema, model } from "mongoose";

const codesSchema = new Schema(
  {
    codes: {
      type: [String],
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    codeAssignedToCourse: [
      {
        courseId: {
          type: Schema.Types.ObjectId,
          ref: "Course",
        },
      },
    ],
    fromDate: {
      type: Date,
      required: true,
    },
    toDate: {
      type: Date,
      required: true,
    },
    codesStatus: {
      type: String,
      required: true,
      enum: ["Expired", "Valid"],
      default: "Valid",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export const codesModel = model.Codes || model("Codes", codesSchema);
