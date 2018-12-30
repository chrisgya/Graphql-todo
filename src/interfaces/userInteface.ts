import {Document} from "mongoose";

/**
 * This is interface for user
 * @interface
 * @extends {Document}
 */

   // tslint:disable:semicolon
export interface IUser extends Document {
  username: string,
  password: string,
  _id: any,
  name: string,
}
