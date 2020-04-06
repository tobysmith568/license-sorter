
import * as fs from "fs";
import { promisify } from "util";

export const statAsync: (path: fs.PathLike) => Promise<fs.Stats> = promisify(fs.stat);

export async function doesFileExist(path: string): Promise<boolean> {
	try {
		const stats: fs.Stats = await statAsync(path);
		return stats.isFile();
	} catch {
		return false;
	}
}
