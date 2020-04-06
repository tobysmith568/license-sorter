import arg from "arg";
import { validArguments } from "./valid-arguments";
import { IArguments } from "./arguments.interface";
import inquirer, { Question, Answers } from "inquirer";
import { doesFileExist } from "../utils/file.utils";
import { convertFile } from "../main";

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
  const questions: Question[] = [];

  if (!options.input) {
    questions.push({
      type: "input",
      name: "input",
      message: "Please give the location of the input JSON file:",
      validate: async (input: any, answers?: Answers | undefined): Promise<string | boolean> => {
        return (await doesFileExist(input)) ? true : "That is not a valid file";
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

  const results: any = await inquirer.prompt(questions);

  return {
    ...options,
    input: options.input || results.input,
    output: options.output || results.output,
    overwriteOutput: options.overwriteOutput || results.overwriteOutput,
  };
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
