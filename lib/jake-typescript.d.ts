/// <reference path="../typings/jake/jake.d.ts" />

declare module "jake-typescript"
{
    export enum ModuleKind
    {
        commonjs = 0,
        amd = 1,
    }

    export enum ESVersion
    {
        ES3 = 0,
        ES5 = 1,
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

    export function singleFile(name: string, prereqs: string[], opts?: CompileOptions): jake.FileTask;
    export function batchFiles(name: string, prereqs: string[], opts?: BatchCompileOptions): jake.Task;
}