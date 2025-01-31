/**
 * @api {get} /photoOverlay/:name Get photo overlay image. Serves the folder photoGridData
 */
import fs from "fs";
import path from "path";

export default defineEventHandler(async (event) => {
  const base = "photoGridData";
  const filePath = path.join(base, event.context.params.name);

  return sendStream(event, fs.createReadStream(filePath));
});