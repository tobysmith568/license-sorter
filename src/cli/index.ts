import arg from "arg";
import { validArguments } from "./valid-arguments";
import { IArguments } from "./arguments.interface";
import { doesFileExist } from "../utils/file.utils";
import { convertFile, convertPackageJSON } from "../main";
import { prompt } from "enquirer";
import * as os from "os";
import ora, { Ora } from "ora";
import { dots } from "cli-spinners";

function parseArgumentsIntoOptions(rawArgs: string[]): IArguments {
 const args: arg.Result<any> = arg(validArguments, {
    argv: rawArgs.slice(2),
  });

 return {
   input: args["--input"] || undefined,
   output: args["--output"] || undefined,
   overwriteOutput: args["--overwrite"] || undefined,
   foundPackageJSON: undefined,
   usepackageJSON: undefined
 };
}

async function promptForAnswers(options: IArguments): Promise<IArguments> {

  if (options.foundPackageJSON === true) {
    const answer: any = await prompt({
      type: "select",
      name: "usePackageSJON",
      choices: [ "Use dependencies in detected package.json", "Give the path to a licenses json file"],
      message: "Detected a package.json - would you like to scan it's dependancies for licenses?"
    });

    options.usepackageJSON = answer.usePackageSJON === "Use dependencies in detected package.json";
  }

  let inputMessage: string = "Please give the location of the input JSON file:";
  while (!options.usepackageJSON && (!options.input || !await doesFileExist(options.input))) {
    const answer: any = await prompt({
      type: "input",
      name: "input",
      initial: "",
      message: inputMessage
    });

    options.input = answer.input;
    inputMessage = "That file does not exist!" + os.EOL + "Please give the location of the input JSON file:";
  }

  while (!options.output || options.overwriteOutput === false) {
    const answer: any = await prompt({
      type: "input",
      name: "output",
      initial: "",
      message: "Please give the location of the output JSON file:"
    });

    options.output = answer.output;

    if (await doesFileExist(options.output)) {
      const yesNoAnswer: any = await prompt({
        type: "confirm",
        name: "overwriteOutput",
        message: "The given output file already exists and will be overwritten. Is this OK?"
      });

      options.overwriteOutput = yesNoAnswer.overwriteOutput;
    }
  }

  return options;
}

export async function cli(args: string[]): Promise<void> {
  let options: IArguments = parseArgumentsIntoOptions(args);

  if (!options.input) {
    options.foundPackageJSON = await doesFileExist("./package.json");
    options.usepackageJSON = false;
  }

  options = await promptForAnswers(options);

  if (options.overwriteOutput === false) {
    console.error("\x1b[31m", "Exiting the application to avoid overwriting the existing output file!", "\x1b[0m");
    process.exit(1);
  }

  const spinner: Ora = ora({
    spinner: dots,
    text: "Resolving licenses..."
  });
  spinner.start();

  try {
    if (options.usepackageJSON) {
      await convertPackageJSON("./", options.output);
    } else {
      await convertFile(options.input, options.output);
    }
  } catch (e) {
    console.error("\x1b[31m", "Unexpected Failure!", "\x1b[0m", e);
    process.exit(1);
  }

  spinner.stop();
}
