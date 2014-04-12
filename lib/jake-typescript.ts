/// <reference path="../typings/jake/jake.d.ts" />

import fs = require("fs");
import path = require("path");

export enum ModuleKind {
    commonjs,
    amd
}

export enum ESVersion {
    ES3,
    ES5
}

export interface CompileOptions {
    generateDeclarationFile?: boolean;
    moduleKind?: ModuleKind;
    noImplicitAny?: boolean;
    removeComments?: boolean;
    generateSourceMap?: boolean;
    sourceRoot?: string;
    mapRoot?: string;
    targetVersion?: ESVersion;
}

export interface BatchCompileOptions extends CompileOptions {
    outputDirectory?: string;
}

export function isTsDeclarationFile(filename: string): boolean {
    return filename.indexOf(".d.ts", filename.length - 5) !== -1;
}

export function isTsFile(filename: string): boolean {
    return filename.indexOf(".ts", filename.length - 3) !== -1;
}

var switchToForwardSlashesRegEx = /\\/g;
function switchToForwardSlashes(path: string) {
    return path.replace(switchToForwardSlashesRegEx, "/");
}

function extractSources(prereqs: string[]): string[]{
    return prereqs.filter((prereq: string): boolean=> {
        return isTsFile(prereq);
    });
}

function convertOptions(options: CompileOptions): string {
    if (!options) {
        return "";
    }

    var optionString: string = "";

    if (options.generateDeclarationFile) {
        optionString += "--declaration ";
    }

    switch (options.moduleKind) {
        case ModuleKind.amd:
            optionString += "--module amd ";
            break;

        case ModuleKind.commonjs:
            optionString += "--module commonjs ";
            break;

        default:
            break;
    }

    if (options.noImplicitAny) {
        optionString += "--noImplicitAny ";
    }

    if (options.generateSourceMap) {
        optionString += "--sourceMap ";
    }

    if (options.mapRoot) {
        optionString += "--mapRoot " + options.mapRoot + " ";
    }

    if (options.removeComments) {
        optionString += "--removeComments ";
    }

    if (options.sourceRoot) {
        optionString += "--sourceRoot " + options.sourceRoot + " ";
    }

    switch (options.targetVersion) {
        case ESVersion.ES3:
            optionString += "--target ES3 ";
            break;

        case ESVersion.ES5:
            optionString += "--target ES5 ";
            break;

        default:
            break;
    }

    return optionString;
}

function executeTsc(name: string, outFiles: string[], commandLine: string, failure: () => void): void {
    var cmd = "tsc " + commandLine;
    console.log(cmd + "\n");

    var ex: jake.Exec = jake.createExec([cmd]);

    ex.addListener("stdout", (output: string) => {
        process.stdout.write(output);
    });

    ex.addListener("stderr", (error: string) => {
        process.stderr.write(error);
    });

    ex.addListener("cmdEnd", () => {
        complete();
    });

    ex.addListener("error", () => {
        failure();
        console.log("Compilation of " + name + " failed.");
    });

    ex.run();
}

// This compiles a set of TypeScript files into a single JavaScript file
export function singleFile(name: string, prereqs: string[], opts?: CompileOptions): jake.FileTask {
    var sources: string[] = extractSources(prereqs);
    var commandLine: string = convertOptions(opts);

    commandLine += "--out " + name + " " + sources.join(" ");

    var jakeOptions: jake.FileTaskOptions = { async: true };
    var task: jake.FileTask = file(name, prereqs,
        () => {
            executeTsc(name, [name], commandLine,
                () => {
                    if (fs.existsSync(name)) {
                        fs.unlinkSync(name);
                    }
                });
        }, jakeOptions);

    return task;
}

export function batchFiles(name: string, prereqs: string[], opts?: BatchCompileOptions): jake.Task {
    var sources: string[] = extractSources(prereqs);
    var commandLine: string = convertOptions(opts);

    if (opts.outputDirectory) {
        commandLine += "--outDir " + opts.outputDirectory + " ";
    }

    commandLine += sources.join(" ");

    var builtFiles: string[] = [];

    sources.forEach((source: string): void=> {
        if (!isTsDeclarationFile(source)) {
            var builtFile: string = path.normalize((opts.outputDirectory || "./") + source.substr(0, source.length - 3) + ".js");
            // On Windows, normalize will use backslashes, which will mess up jake's matching
            builtFile = switchToForwardSlashes(builtFile);
            file(builtFile, prereqs, () => {
                batchCompileTask.invoke();
            });
            builtFiles.push(builtFile);
        }
    });

    var jakeOptions: jake.FileTaskOptions = { async: true };
    var batchCompileName: string = "batchCompile" + name;
    var batchCompileTask: jake.Task;
    namespace("jake-typescript", () => {
        desc("A task to do batch TypeScript compilation.");
        batchCompileTask = task(batchCompileName,
            () => {
                executeTsc(name, sources, commandLine,
                    () => {
                        builtFiles.forEach((outFile: string): void=> {
                            if (fs.existsSync(outFile)) {
                                fs.unlinkSync(outFile);
                            }
                        });
                    });
            }, jakeOptions);
    });

    return task(name, builtFiles);
}