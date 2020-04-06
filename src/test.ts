
import { init, InitOpts, ModuleInfos } from "license-checker";
import { promisify } from "util";

const initAsync: (arg1: InitOpts) => Promise<ModuleInfos> = promisify(init);

(async () => {
	const file: ModuleInfos = await initAsync({
		start: "./"
	});
	console.log(file);
})();
