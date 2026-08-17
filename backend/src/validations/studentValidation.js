const { body, validationResult } = require("express-validator");

const validateStudent = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email"),

  body("phone")
    .trim()
    .isLength({ min: 10, max: 10 })
    .withMessage("Phone number must be 10 digits"),

  body("gender")
    .isIn(["MALE", "FEMALE", "OTHER"])
    .withMessage("Gender must be MALE, FEMALE or OTHER"),

  body("courseId")
    .isInt({ min: 1 })
    .withMessage("Valid course ID is required"),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array()
      });
    }

    next();
  }
];

module.exports = validateStudent;