import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const createDir = (dir: string) => {
  return fs.promises.mkdir(dir, {
    recursive: true
  });
}

export const saveFile = async (dir: string, file: string, buffer: Buffer): Promise<void> => {
  const fullPath = path.join(dir, file);
  await createDir(dir);
  return fs.promises.writeFile(fullPath, buffer);
}

export const saveFileWithId = async (dir: string, extension: string, buffer: Buffer): Promise<string> => {
  const id = uuidv4();
  await saveFile(dir, `${id}.${extension}`, buffer);
  return id;
}


export const removeFile = async(filePath: string): Promise<void> => {
  return fs.promises.rm(filePath, {
    recursive: true,
    force: true
  });
}

export const removeDir = async (dirPath: string): Promise<void> => {
  return removeFile(dirPath);

}