import { Schema, model } from "mongoose";

// const enrollmentSchema = new Schema(
//   {
//     userId: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     courses: [
//       {
//         coursesIds: [
//           { type: Schema.Types.ObjectId, ref: "Course", required: true },
//         ],

//         fromDate: {
//           type: Date,
//           required: true,
//         },
//         toDate: {
//           type: Date,
//           required: true,
//         },
//         isPaid: {
//           type: Boolean,
//           default: false,
//         },
//       },
//     ],
//   },
//   { timestamps: true }
// );

const enrollmentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    courses: [
      {
        coursesIds: {
          type: Schema.Types.ObjectId,
          ref: "Course",
          required: true,
        },

        fromDate: {
          type: Date,
          required: true,
        },
        toDate: {
          type: Date,
          required: true,
        },
        isPaid: {
          type: Boolean,
          default: false,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);
export const enrollmentModel =
  model.Enrollment || model("Enrollment", enrollmentSchema);
