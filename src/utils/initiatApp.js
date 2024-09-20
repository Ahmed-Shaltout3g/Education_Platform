import { connectionDB } from "../../DB/connection.js";
import * as allRoutes from "../modules/index.routes.js";
import { changeCourseExpired, deletecodesExpired } from "./crons.js";
import { globalResponse } from "./errorHandling.js";
import cors from "cors";

export const initatApp = (express, app) => {
  const port = process.env.PORT || 5000;

  app.use(express.json());
  app.use(cors());

  connectionDB();
  app.use("/category", allRoutes.catagoryRoutes);
  app.use("/subcategory", allRoutes.subCatagoryRoutes);
  app.use("/course", allRoutes.courseRoutes);
  app.use("/lecture", allRoutes.lectureRoutes);
  app.use("/auth", allRoutes.authRoutes);
  app.use("/codes", allRoutes.codesRoutes);
  app.use("/join", allRoutes.joinRoutes);
  app.use("/assignment", allRoutes.assignmentRoutes);

  app.get("/", (req, res) => {
    res.send("hello from simple server :)");
  });
  app.all("*", (req, res) => {
    res.status(404).json({ message: "Not Found" });
  });
  app.use(globalResponse);
  // crons
  changeCourseExpired();
  deletecodesExpired();

  app.listen(port, () =>
    console.log("> Server is up and running on port : " + port)
  );
};
