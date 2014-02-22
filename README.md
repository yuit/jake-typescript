# jake-typescript

Helpers to compile [TypeScript](http://www.typescriptlang.org) using [Jake](https://github.com/mde/jake).

## function batchFiles

* name: string -- The name of the resulting task.
* prereqs: string[] -- Task prerequisites. Can contain both TypeScript files and other prerequisites.
* opts?: BatchCompileOptions - Compile options.

Returns a task that compiles a set of TypeScript files.

## function singleFile

* name: string -- The name of the resulting file.
* prereqs: string[] -- Task prerequisites. Can contain both TypeScript files and other prerequisites.
* opts?: BatchCompileOptions - Compile options.

Returns a file task that compiles a set of TypeScript files and combines them into a single file.

## interface CompileOptions

* generateDeclarationFile?: boolean -- Whether a `.d.ts` file should be generated.
* moduleKind?: ModuleKind -- The kind of module to generate.
* noImplicitAny?: boolean -- Whether inferring an implicit any should be allowed.
* removeComments?: boolean -- Whether comments should be stripped from the output.
* generateSourceMap?: boolean -- Whether a source map should be generated.
* sourceRoot?: string -- The root for the sources.
* mapRoot?: string - The root for the map files.
* targetVersion?: ESVersion -- The target JS version to use.

## interface BatchCompileOptions

* outputDirectory?: string -- The output directory for the batch compile.

Extends CompileOptions.

## enum ModuleKind

* commonjs
* amd

## enum ESVersion

* ES3
* ES5

