import {RES_CODE, RES_MESSAGE} from "../constant";

export interface IResult<T> {
  data?: T
  code?: number
  message?: string
}

export const Result = {
  success<T>(option: IResult<T> = {}): IResult<T> {
    const {
      data = null,
      code = RES_CODE.Success,
      message = RES_MESSAGE.Success
    } = option
    return {
      code,
      data,
      message
    }
  },
  error<T>(option: IResult<T> = {}): IResult<T> {
    const {data = null, code = RES_CODE.CommFail, message = RES_MESSAGE.CommFail} = option
    return {
      code,
      data,
      message
    }
  }
}


