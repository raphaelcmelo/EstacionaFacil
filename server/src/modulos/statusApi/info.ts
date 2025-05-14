import packageJson from "../../../package.json";

import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";

const getServerPackageVersion = () => packageJson.version;
const getServerPackageName = () => packageJson.name;
const getAuthor = () => packageJson.author;

export const infoStatus = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    res.status(status.OK).json({
      name: getServerPackageName(),
      author: getAuthor(),
      api: "v1",
      packageVersion: getServerPackageVersion(),
    });
  }
);
