/**
 * @copyright 2009-2017 Vanilla Forums Inc.
 * @license MIT
 * @module utility
 */

import path from "path";
import fs from "fs";
import chalk from "chalk";
import detectPort from "detect-port";
import { spawn, SpawnOptions } from "child_process";

const defaultSpawnOptions: SpawnOptions = {
    stdio: "inherit",
};

/**
 * Get a json file from
 *
 * @param directory - The directory to look in.
 * @param jsonName - the name of the json file wihtout .json
 *
 * @return {Object} The file contents as an object.
 */
export function getJsonFileForDirectory(directory: string, jsonName: string) {
    const jsonPath = path.resolve(directory, `${jsonName}.json`);
    if (!fs.existsSync(jsonPath)) {
        printError(`Unable to require JSON file ${chalk.yellow(jsonPath)}. Does not exist`);
    }

    return JSON.parse(fs.readFileSync(jsonPath, "utf8"));
}

/**
 * Spawn a child build process. Wraps child_process.spawn.
 *
 * @param command - The command to start.
 * @param args - Arguments for the command.
 * @param options - Options to pass to `child_process.spawn`.
 *
 * @returns Return if the process exits cleanly.
 */
export function spawnChildProcess(
    command: string,
    args: string[],
    options: SpawnOptions = defaultSpawnOptions,
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const task = spawn(command, args, options);

        task.on("close", code => {
            if (code !== 0) {
                reject(new Error(`command "${command} exited with a non-zero status code."`));
            }
            return resolve(true);
        });

        task.on("error", err => {
            return reject(err);
        });
    });
}

/**
 * Conditionally add an 's' to the end of a word.
 *
 * @param word - The word to pluralize.
 * @param count - The number of items.
 *
 * @returns The pluralized word.
 */
export function pluralize(word: string, count: number): string {
    const plural = count === 1 ? word : word + "s";
    return plural;
}

/**
 * Convert a string to camelcase.
 *
 * @param str - The string to convert.
 */
export function camelize(str: string): string {
    return str.replace(/[_.-](\w|$)/g, (substring, word) => {
        return word.toUpperCase();
    });
}

/**
 * Log something to STDOUT. Use this instead of console.log();
 *
 * @param contents - What to print out.
 */
export function print(contents: string) {
    if (process.env.NODE_ENV !== "test") {
        // tslint:disable-next-line:no-console
        console.log(contents);
    }
}

/**
 * Log something to STDOUT only if the verbose option is set. Use this instead of console.log();
 *
 * @param contents - What to print out.
 */
export function printVerbose(contents: string) {
    // @ts-ignore
    const isVerbose = global.verbose || false;

    if (isVerbose) {
        print(contents);
    }
}

/**
 * Log an error to STDERR. Colored red if ANSI codes are supported.
 *
 * @param error - The error or string to print out.
 */
export function printError(error: any) {
    // tslint:disable-next-line:no-console
    console.error(chalk.bold.red(error.toString()));
    throw error;
}

/**
 * Log an error to STDERR. Colored red if ANSI codes are supported.
 *
 * @param error - The error or string to print out.
 */
export function fail(error: any) {
    // tslint:disable-next-line:no-console
    console.error(chalk.bold.red(error.toString()));
    process.exit(1);
}

/**
 * Pause for the given amount of milliseconds.
 *
 * @param milliseconds - The time to pause for.
 */
export function sleep(milliseconds: number) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, milliseconds);
    });
}

/**
 * Check to see if the livereload port is already taken. If it is, fail with a warning.
 */
export async function checkLiveReloadPort() {
    const port = 35729;

    try {
        const portResult = await detectPort(port);
        if (portResult === port) {
            return;
        } else {
            fail(
                `Unable to start LiveReload server. Port ${port} is currently in use. You likely have another build tool currently in watch mode. Quit that process, then try running this command again.`,
            );
        }
    } catch (err) {
        fail(err);
    }
}
