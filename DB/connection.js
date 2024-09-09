import mongoose from "mongoose";

export const connectionDB = async () => {
  return await mongoose
    .connect(process.env.DB_URL_LOCAL)
    .then(() => {
      console.log("connection DB success");
    })
    .catch(() => {
      console.log("connection DB faild");
    });
};
console.log();
