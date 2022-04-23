import { HttpException } from '@nestjs/common';
import { GraphQLError } from 'graphql';
import { Types } from 'mongoose';
import { CreateUser, UpdateUser } from '../dto/user.dto';
import { User } from '../entity/user.entity';

export interface UserInterface {
  login(
    email: string,
    password: string
  ): Promise<string | HttpException | GraphQLError>;
  logout(): Promise<string | HttpException | GraphQLError>;
  createUser(
    createUser: CreateUser
  ): Promise<User | HttpException | GraphQLError>;
  getUser(_id: Types.ObjectId): Promise<User | HttpException | GraphQLError>;
  getAllUsers(): Promise<User[] | HttpException | GraphQLError>;
  removeUser(_id: string): Promise<User | HttpException | GraphQLError>;
  updateUser(
    user: User,
    updateUser: UpdateUser
  ): Promise<User | HttpException | GraphQLError>;
  updatePassword(
    user: User,
    currentPassword: string,
    newPassword: string
  ): Promise<User | HttpException | GraphQLError>;
}
