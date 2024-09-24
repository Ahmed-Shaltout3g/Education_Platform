import { userModel } from "../../DB/Models/user.model.js";
import { asyncHandler } from "../utils/errorHandling.js";
import { decodeToken, generateToken } from "../utils/tokenFunctions.js";

const authFunction = async (req, res, next) => {
  const { token } = req.headers;
  if (!token) {
    return next(
      new Error("In_valid token ,please login first", { cause: 400 })
    );
  }
  if (!token.startsWith("online__")) {
    return next(new Error("Wrong Prefix", { cause: 401 }));
  }
  const separaedToken = token.split("online__")[1];

  try {
    const decode = decodeToken({ payload: separaedToken });

    if (!decode?._id) {
      return next(new Error("fail decode", { cause: 500 }));
    }

    const user = await userModel
      .findById(decode._id)
      .select("email _id userName changePassAt role ");
    if (!user) {
      return next(new Error("please signUp first", { cause: 401 }));
    }

    if (decode.iat < user.changePassAt / 1000) {
      return next(
        new Error("token is expired, plese login first", { cause: 401 })
      );
    }

    req.user = user;
    next();
  } catch (error) {
    // refresh token

    if (
      error.name === "TokenExpiredError" ||
      error === "TokenExpiredError: jwt expired"
    ) {
      console.log(error);

      const user = await userModel.findOne({ token: separaedToken });
      if (!user) {
        return next(new Error("wrong  token", { cause: 401 }));
      }

      const refreshToken = generateToken({
        payload: {
          _id: user._id,
          fullName: user.fullName,
          role: user.role,
          email: user.email,
          isLogedIn: true,
          isConfirmed: user.isConfirmed,
        },
        signature: process.env.TOKEN_KEY,
        expiresIn: "10h",
      });
      console.log(refreshToken);

      if (!refreshToken) {
        return next(
          new Error("token generation fail, payload canot be empty", {
            cause: 400,
          })
        );
      }

      // user.token = refreshToken;
      // await user.save();
      // await userModel.findOneAndUpdate(
      //   { token: separaedToken },
      //   { token: refreshToken }
      // );

      res.status(200).json({ message: "Refresh token", refreshToken });
    }
    return next(new Error("invalid token", error, { cause: 500 }));
  }
};

export const Auth = () => {
  return asyncHandler(authFunction);
};

export const authorization = (accessPoint) => {
  return (req, res, next) => {
    const { role } = req.user;
    if (!accessPoint.includes(role)) {
      return next(new Error("NO_Authorized", { cause: 403 }));
    }
    next();
  };
};
