import { NextFunction, Request, Response } from "express";
import { prismaClient } from "../prisma/client";
import { hashSync, compareSync } from "bcrypt";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secret";
import { BadRequestsException } from "../exceptions/bad-requests";
import { ErrorCode } from "../exceptions/root";

export const handleSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    body: { name, email, password },
  } = req;

  const findUser = await prismaClient.user.findUnique({
    where: { email },
  });

  if (findUser)
    return next(
      new BadRequestsException(
        "User already exists",
        ErrorCode.USER_ALREADY_EXISTS
      )
    );

  const hashPassword = hashSync(password, 10);

  try {
    const user = await prismaClient.user.create({
      data: {
        name,
        email,
        password: hashPassword,
      },
    });

    if (!user) throw Error("User creation fail!");

    return res.status(201).send("User created successfully");
  } catch (error) {
    return res.sendStatus(500);
  }
};

export const handleLogin = async (req: Request, res: Response) => {
  const {
    body: { email, password },
  } = req;

  const findUser = await prismaClient.user.findUnique({
    where: { email },
  });

  if (!findUser) return res.status(400).send("User not found");

  const passwordMatch = compareSync(password, findUser.password);

  if (!passwordMatch) res.status(400).send("Invalid credentials");

  const token = jwt.sign(
    {
      userId: findUser.id,
    },
    JWT_SECRET!
  );

  return res.status(200).json({
    user: {
      id: findUser.id,
      name: findUser.name,
      email: findUser.email,
      createdAt: findUser.createAt,
      updatedAt: findUser.updatedAt,
    },
    token,
  });
};
