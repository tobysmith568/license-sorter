import { readFileAsync, writeFileAsync } from "./utils/file.utils";
import { IResult } from "./models/result.interface";
import { InitOpts, ModuleInfos, init } from "license-checker";
import { promisify } from "util";

const initAsync: (options: InitOpts) => Promise<ModuleInfos> = promisify(init);

export async function convertPackageJSON(packageJSONLocation: string, outputFile: string): Promise<void> {
  const file: ModuleInfos = await initAsync({
    start: packageJSONLocation
	});

	await convert(file, outputFile);
}

export async function convertFile(inputFile: string, outputFile: string): Promise<void> {

  const inputData: string = await readFileAsync(inputFile, { encoding: "utf-8" });
  const dependencies: any = JSON.parse(inputData);

	await convert(dependencies, outputFile);
}

async function convert(dependencies: any, outputFile: string): Promise<void> {
	const results: Map<string, string[]> = new Map<string, string[]>();

	for (const [key, value] of Object.entries(dependencies)) {

		const licenses: string[] = Array.isArray((value as any).licenses) ? (value as any).licenses : [ (value as any).licenses ];

		for (const license of licenses) {
			if (!results.has(license)) {
				results.set(license, []);
			}

			results.get(license)?.push(key);
		}
	}

	const result: IResult[] = [];

	for (const key of Array.from(results.keys())) {
		const resultItem: IResult = {
      license: key,
      packages: results.get(key) || []
    };

		result.push(resultItem);
	}

	await writeFileAsync(outputFile, JSON.stringify(result, undefined, 2));
}
