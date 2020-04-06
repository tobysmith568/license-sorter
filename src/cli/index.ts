import arg from "arg";
import { validArguments } from "./valid-arguments";
import { IArguments } from "./arguments.interface";
import inquirer, { Answers, PromptModule } from "inquirer";
import { doesFileExist } from "../utils/file.utils";
import { convertFile, convertPackageJSON } from "../main";

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
  const questions: any[] = [];

  if (options.foundPackageJSON === true) {
    questions.push({
      type: "confirm",
      name: "usepackageJSON",
      message: "Detected a package.json file. Would you like to use it?"
    });
  }

  if (!options.input) {
    questions.push({
      type: "input",
      name: "input",
      message: "Please give the location of the input JSON file:",
      validate: async (input: any, answers?: Answers | undefined): Promise<string | boolean> => {
        return (await doesFileExist(input)) ? true : "That is not a valid file";
      },
      when: (answers: Answers): boolean => {
        return answers.usepackageJSON !== true;
      }
    });
  }

  if (!options.output) {
    questions.push({
      type: "input",
      name: "output",
      message: "Please give the location of the output JSON file:",
      validate: (input: any, answers?: Answers | undefined): string | boolean => {
        return ("" + input).length !== 0 ? true : "You need to enter an output file location";
      }
    });
  }

  questions.push({
    type: "confirm",
    name: "overwriteOutput",
    message: "The given output file already exists and will be overwritten. Is this OK?",
    when: async (answers: Answers): Promise<boolean> => {
      return await doesFileExist(answers.output);
    }
  });

  const prompt: PromptModule = inquirer.createPromptModule();
  const results: any = await prompt(questions);

  return {
    ...options,
    input: options.input || results.input,
    output: options.output || results.output,
    overwriteOutput: options.overwriteOutput || results.overwriteOutput,
    usepackageJSON: options.usepackageJSON || results.usepackageJSON
  };
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

  try {

    if (options.usepackageJSON) {
      console.log("Will use packageJSON");
      await convertPackageJSON("./", options.output);
    } else {
      await convertFile(options.input, options.output);
    }

  } catch (e) {
    console.error("\x1b[31m", "Unexpected Failure!", "\x1b[0m", e);
    process.exit(1);
  }
}
