const { body, validationResult } = require("express-validator");

const validateCourse = [
  body("name").trim().notEmpty().withMessage("Course name is required"),

  body("description")
    .optional({ checkFalsy: true })
    .trim()
    .isString()
    .withMessage("Description must be a string"),

  body("duration").trim().notEmpty().withMessage("Duration is required"),

  body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status must be ACTIVE or INACTIVE"),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    next();
  },
];

module.exports = validateCourse;
