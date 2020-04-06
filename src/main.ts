import { readFileAsync, writeFileAsync } from "./utils/file.utils";
import { IResult } from "./models/result.interface";
import { init, InitOpts, ModuleInfos } from "license-checker";
import { promisify } from "util";

const initAsync: (options: InitOpts) => Promise<ModuleInfos> = promisify(init);

export async function convertPackageJSON(packageJSONLocation: string, outputFile: string): Promise<void> {
  console.log("about to");
  const file: ModuleInfos = await initAsync({
    start: packageJSONLocation
  });
  console.log("done");

  console.log(file);
}

export async function convertFile(inputFile: string, outputFile: string): Promise<void> {
  const results: Map<string, string[]> = new Map<string, string[]>();

  const inputData: string = await readFileAsync(inputFile, { encoding: "utf-8" });
  const dependencies: any = JSON.parse(inputData);

  for (const [key, value] of Object.entries(dependencies)) {

    const licenses: string[] = Array.isArray((value as any).licenses) ? (value as any).licenses : [ (value as any).licenses ];

    for (const licence of licenses) {
      if (!results.has(licence)) {
        results.set(licence, []);
      }

      results.get(licence)?.push(key);
    }
  }

  const result: IResult[] = [];

  for (const key of Array.from(results.keys())) {
    const resultItem: IResult = {
      licence: key,
      packages: results.get(key) || []
    };

    result.push(resultItem);
  }

  await writeFileAsync(outputFile, JSON.stringify(result, undefined, 2));
}