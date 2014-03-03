/// <reference path="typings/jake/jake.d.ts" />

import fs = require("fs");

directory("lib");

file("lib/jake-typescript.js", ["lib", "lib/jake-typescript.ts"], ()=>
{
    var cmd = "tsc --removeComments --module commonjs --noImplicitAny lib/jake-typescript.ts";
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

    ex.addListener("cmdEnd", ()=>
    {
        complete();
    });

    ex.addListener("error", ()=>
    {
        fs.unlinkSync("lib/jake-typescript.js");
        console.log("Compilation of " + name + " failed.");
    });

    ex.run();
}, { async: true });

task("default", ["lib/jake-typescript.js"]);

npmPublishTask('jake-typescript', function ()
{
    this.packageFiles.include([
        'jakefile.js',
        'jakefile.ts',
        'LICENSE',
        'makejakefile.cmd',
        'package.json',
        'README.md',
        'lib/jake-typescript.d.ts',
        'lib/jake-typescript.js',
        'lib/jake-typescript.ts',
        'typings/**'
    ]);
    this.needTarGz = true;
    this.needTarBz2 = true;
});
