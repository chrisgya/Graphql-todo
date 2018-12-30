import { Response } from "../models";

export const completeRequest = async (promise: Promise<Response>) => {

  try {
    const res = await promise;
    return {
      code: res.code,
      message: res.message,
      data: res.data,
    };
  } catch (errorRes) {
    return {
      code: errorRes.code,
      message: errorRes.message,
      data: errorRes.data,
    };
  }

};
