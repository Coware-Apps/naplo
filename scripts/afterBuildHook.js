module.exports = function(ctx) {
    var fs = require("fs"),
        path = require("path"),
        rootdir = ctx.opts.projectRoot,
        androidDir = path.join(ctx.opts.projectRoot, "platforms/android");

    var filesToCopy = ["/settings.gradle", "/build-extras.gradle"];

    filesToCopy.forEach(fileName => {
        let sourceFile = rootdir + fileName;
        let destFile = androidDir + fileName;

        if (!fs.existsSync(sourceFile)) {
            console.log(sourceFile + " not found. Skipping");
            return;
        } else if (!fs.existsSync(androidDir)) {
            console.log(androidDir + " not found. Skipping");
            return;
        }

        console.log("Copy " + sourceFile + " to " + androidDir);
        fs.createReadStream(sourceFile).pipe(fs.createWriteStream(destFile));
    });
};
