import arg from "arg";
import { validArguments } from "./valid-arguments";
import { IArguments } from "./arguments.interface";
import { doesFileExist } from "../utils/file.utils";
import { convertFile } from "../main";
import { prompt } from "enquirer";
import * as os from "os";

function parseArgumentsIntoOptions(rawArgs: string[]): IArguments {
 const args: arg.Result<any> = arg(validArguments, {
    argv: rawArgs.slice(2),
  });

 return {
   input: args["--input"] || undefined,
   output: args["--output"] || undefined,
   overwriteOutput: args["--overwrite"] || undefined
 };
}

async function promptForAnswers(options: IArguments): Promise<IArguments> {

  let inputMessage: string = "Please give the location of the input JSON file:";
  while (!options.input || !await doesFileExist(options.input)) {
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
  options = await promptForAnswers(options);

  if (options.overwriteOutput === false) {
    console.error("\x1b[31m", "Exiting the application to avoid overwriting the existing output file!", "\x1b[0m");
    process.exit(1);
  }

  try {
    await convertFile(options.input, options.output);
  } catch (e) {
    console.error("\x1b[31m", "Unexpected Failure!", "\x1b[0m", e);
    process.exit(1);
  }
}
