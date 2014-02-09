/// <reference path="../typings/jake/jake.d.ts" />

export enum ModuleKind
{
    commonjs,
    amd
}

export enum ESVersion
{
    ES3,
    ES5
}

export interface CompileOptions extends jake.FileTaskOptions
{
    generateDeclarationFile?: boolean;
    moduleKind?: ModuleKind;
    noImplicitAny?: boolean;
    removeComments?: boolean;
    generateSourceMap?: boolean;
    sourceRoot?: string;
    mapRoot?: string;
    targetVersion?: ESVersion;
}

export interface BatchCompileOptions extends CompileOptions
{
    outputDirectory?: string;
}

function isTsDeclarationFile(value: string): boolean
{
    return value.indexOf(".d.ts", value.length - 5) !== -1;
}

function isTsFile(value: string): boolean
{
    return value.indexOf(".ts", value.length - 3) !== -1;
}

function extractSources(prereqs: string[]): string[]
{
    return prereqs.filter((prereq: string): boolean=>
    {
        return isTsFile(prereq);
    });
}

function convertOptions(options: CompileOptions): string
{
    if (!options)
    {
        return "";
    }

    var optionString: string = "";

    if (options.generateDeclarationFile)
    {
        optionString += "--declaration ";
    }

    switch (options.moduleKind)
    {
    case ModuleKind.amd:
        optionString += "--module amd ";
        break;

    case ModuleKind.commonjs:
        optionString += "--module commonjs ";
        break;

    default:
        break;
    }

    if (options.noImplicitAny)
    {
        optionString += "--noImplicitAny ";
    }

    if (options.generateSourceMap)
    {
        optionString += "--sourceMap ";
    }

    if (options.mapRoot)
    {
        optionString += "--mapRoot " + options.mapRoot + " ";
    }

    if (options.sourceRoot)
    {
        optionString += "--sourceRoot " + options.sourceRoot + " ";
    }

    switch (options.targetVersion)
    {
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

function executeTsc(name: string, commandLine: string): void
{
    var cmd = "tsc " + commandLine;
    console.log(cmd + "\n");

    var ex: jake.Exec = jake.createExec([cmd]);

    ex.addListener("stdout", output=>
    {
        process.stdout.write(output);
    });

    ex.addListener("stderr", error=>
    {
        process.stderr.write(error);
    });

    ex.addListener("cmdEnd", () =>
    {
        complete();
    });

    ex.addListener("error", () =>
    {
        console.log("Compilation of " + name + " failed.");
    });

    ex.run();
}

// This compiles a set of TypeScript files into a single JavaScript file
export function singleFile(name: string, prereqs: string[], opts?: CompileOptions): jake.FileTask
{
    var sources: string[] = extractSources(prereqs);
    var commandLine: string = convertOptions(opts);

    commandLine += "--out " + name + " " + sources.join(" ");

    var jakeOptions: jake.FileTaskOptions = { async: opts.async };
    var task: jake.FileTask = file(name, prereqs, ()=> { executeTsc(name, commandLine); }, jakeOptions);

    return task;
}

export function batchFiles(name: string, prereqs: string[], opts?: BatchCompileOptions): jake.Task
{
    var sources: string[] = extractSources(prereqs);
    var commandLine: string = convertOptions(opts);

    if (opts.outputDirectory)
    {
        commandLine += "--outDir " + opts.outputDirectory;
    }

    commandLine += sources.join(" ");

    var jakeOptions: jake.FileTaskOptions = { async: opts.async };
    var batchCompileName: string = "batchCompile" + name;
    var batchCompileTask: jake.Task;
    namespace("jake-typescript", ()=>
    {
        desc("A task to do batch TypeScript compilation.");
        batchCompileTask = task(batchCompileName, ()=> { executeTsc(name, commandLine); }, jakeOptions);
    });

    var builtFiles: string[] = [];

    sources.forEach((source: string): void=>
    {
        if (!isTsDeclarationFile(source))
        {
            var builtFile: string = source.substr(0, source.length - 3) + ".js";
            file(builtFile, prereqs, ()=>
            {
                batchCompileTask.invoke();
            });
            builtFiles.push(builtFile);
        }
    });

    return task(name, builtFiles);
}