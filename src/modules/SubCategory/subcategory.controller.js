import { nanoid } from "nanoid";
import { subCategoryModel } from "../../../DB/Models/subCategory.model.js";
import cloudinary from "../../utils/cloudinaryConfigration.js";
import slugify from "slugify";
import { categoryModel } from "../../../DB/Models/category.model.js";
import { courseModel } from "./../../../DB/Models/course.model.js";
import { lectureModel } from "../../../DB/Models/lecture.model.js";

// =============================craete Subcategory======================
export const createSubCategory = async (req, res, next) => {
  // ===take category Id and check if it found or not ===
  const { categoryId } = req.query;
  const { name } = req.body;
  const { _id } = req.user;
  const category = await categoryModel.findById(categoryId);
  if (!category) {
    return next(new Error("invalid category id ", { cause: 404 }));
  }
  // === take name and check if dublicated
  const isNameDublicated = await subCategoryModel.findOne({
    name,
    categoryId,
  });
  console.log(isNameDublicated);

  if (isNameDublicated) {
    return next(
      new Error("subCategory name is duplicated! please enter Another name", {
        cause: 404,
      })
    );
  }
  const slug = slugify(name, "_"); // slug the name

  const subCategoryObject = {
    name,
    slug,
    categoryId,
    createdBy: _id,
  };
  const createSubCtegory = await subCategoryModel.create(subCategoryObject);
  req.failedDocument = { model: subCategoryModel, _id: createSubCtegory._id };

  res.status(201).json({
    message: "sub-category created successfuly",
    subCategory: createSubCtegory,
  });
};

// ===================== update subCategory ======================

export const updateSubCategory = async (req, res, next) => {
  const { subCategoryId } = req.query;
  const { _id } = req.user;
  const subCategory = await subCategoryModel.findById(subCategoryId);
  if (!subCategory) {
    return next(new Error("invalid subCategory id ", { cause: 404 }));
  }

  const category = await categoryModel.findById(subCategory.categoryId);
  if (!category) {
    return next(new Error("invalid category id ", { cause: 404 }));
  }
  // name equal old name
  const { name } = req.body;
  if (subCategory.name == name.toLowerCase) {
    return next(
      new Error("new name same old name please enter anothe name ", {
        cause: 404,
      })
    );
  }

  if (
    !(
      name == "first" ||
      name == "second" ||
      name == "third" ||
      name == "sixth" ||
      name == "fifth" ||
      name == "fourth"
    )
  ) {
    return next(
      new Error(
        "new name should equal [first, second, third, fourth, fifth, sixth]",
        {
          cause: 404,
        }
      )
    );
  }
  // name is not dublicated

  const isDublicated = await subCategoryModel.findOne({
    name,
    categoryId: subCategory.categoryId,
  });
  if (isDublicated) {
    return next(
      new Error("new name is dublicated please enter anothe name ", {
        cause: 404,
      })
    );
  }

  // change  slug
  const slug = slugify(name, {
    replacement: "_",
    lower: true,
    trim: true,
  });
  // add changes in DB
  subCategory.slug = slug;
  subCategory.name = name;

  // save changes in DB
  subCategory.updatedBy = _id;
  await subCategory.save();

  res.status(200).json({
    message: "subCategory update successfuly",
    subCategory,
  });
};

// ================== Delete subCategory ================
export const deleteSubCategory = async (req, res, next) => {
  const { subCategoryId } = req.query;
  const { _id } = req.user;
  const subCategory = await subCategoryModel.findOneAndDelete({
    _id: subCategoryId,
    createdBy: _id,
  });
  if (!subCategory) {
    return next(
      new Error("invalid subCategory id OR you are not created it ", {
        cause: 404,
      })
    );
  }

  const category = await categoryModel.findById(subCategory.categoryId);
  if (!category) {
    return next(new Error("invalid category id ", { cause: 404 }));
  }
  // delete form DB

  //  delete course link with this subCategoryId
  const course = await courseModel.findOne({ subCategoryId });
  if (course) {
    const deleteCourses = await courseModel.deleteMany({
      subCategoryId,
    });
    if (!deleteCourses.deletedCount) {
      return next(
        new Error("fail delete courses please try again", { cause: 500 })
      );
    }
  }

  //  delete product link with this category
  const lecture = await lectureModel.findOne({ subCategoryId });
  if (lecture) {
    const deleteLectures = await lectureModel.deleteMany({
      subCategoryId,
    });

    if (!deleteLectures.deletedCount) {
      return next(
        new Error("fail delete lectures please try again", { cause: 500 })
      );
    }
  }
  // delete form host

  res.status(200).json({
    message: "Done",
  });
};

// ========== get All Subcategory ================

export const getAllSubCategories = async (req, res, next) => {
  const Subcategories = await subCategoryModel
    .find() //get parent
    .populate({
      path: "categoryId",
      select: "name",
    })
    //get children
    .populate({
      path: "Course",
      select: "name",
      populate: {
        path: "lectures",
        select: "title ",
      },
    });
  if (Subcategories.length) {
    return res.status(200).json({
      message: "Done",
      Subcategories,
    });
  }
  res.status(200).json({
    message: "No Items",
  });
};

// export const generateCodes = async (req, res, next) => {
//   const { _id } = req.user;
//   const categoryId = req.query;
//   const numberOfCodes = req.body;
//   const subCategory = await subCategoryModel.findById(categoryId);
//   if (!subCategory) {
//     return next(new Error("Invalid subCategoty Id", { cause: 400 }));
//   }
//   const count = await subCategoryModel.find().count();
//   const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
//   const nanoid = customAlphabet(characters, 6);
//   let codes = [];
//   for (let i = 0; i <= numberOfCodes; i++) {
//     number = count + nanoid;
//     codes.push(number);
//   }
//   subCategory.codes = codes;
//   const saveCodes = await subCategoryModel.save();
//   if (!saveCodes) {
//     return next(new Error("Error please try again", { cause: 500 }));
//   }
//   res.status(200).json({
//     message: "Done",
//     codes,
//   });
// };
