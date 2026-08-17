require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("./src/config/prisma");

const resetPassword = async () => {
  try {
    const hashedPassword = await bcrypt.hash("Nandeesha@123", 10);

    await prisma.user.update({
      where: {
        email: "nandeesha@example.com"
      },
      data: {
        password: hashedPassword
      }
    });

    console.log("Password reset successfully");

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
};

resetPassword();