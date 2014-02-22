# jake-typescript -- Jake helpers for TypeScript

Helpers to compile [TypeScript](http://www.typescriptlang.org) using [Jake](https://github.com/mde/jake).

## function batchFiles(name: string, prereqs: string[], opts?: BatchCompileOptions): jake.Task

Compiles a set of TypeScript files. `batchFiles` returns a regular task since it can produce multiple
file outputs. `prereqs` can contain both TypeScript files and other prerequisites. `opts` indicates
compile options for the compilation.

## function singleFile(name: string, prereqs: string[], opts?: CompileOptions): jake.FileTask

Compiles a set of TypeScript files and combines them into a single file. `singleFile` returns a 
Jake file task that produces `name`. `prereqs` can contain both TypeScript files and other prerequisites.
`opts` indicates compile options for the compilation.

## interface CompileOptions

* generateDeclarationFile?: boolean -- Whether a `.d.ts` file should be generated.
* moduleKind?: ModuleKind -- The kind of module to generate.
* noImplicitAny?: boolean -- Whether inferring an implicit any should be allowed.
* removeComments?: boolean -- Whether comments should be stripped from the output.
* generateSourceMap?: boolean -- Whether a source map should be generated.
* sourceRoot?: string -- The root for the sources.
* mapRoot?: string - The root for the map files.
* targetVersion?: ESVersion -- The target JS version to use.

## interface BatchCompileOptions extends CompileOptions

* outputDirectory?: string -- The output directory for the batch compile.

## enum ModuleKind

* commonjs
* amd

## enum ESVersion

* ES3
* ES5


