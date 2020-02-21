module.exports = function(ctx) {
    var fs = require("fs"),
        path = require("path"),
        rootdir = ctx.opts.projectRoot,
        android_dir = path.join(ctx.opts.projectRoot, "platforms/android");

    var filesToCopy = ["/settings.gradle", "/build-extras.gradle"];

    filesToCopy.forEach(fileName => {
        sourceFile = rootdir + fileName;
        destFile = android_dir + fileName;

        if (!fs.existsSync(sourceFile)) {
            console.log(sourceFile + " not found. Skipping");
            return;
        } else if (!fs.existsSync(android_dir)) {
            console.log(android_dir + " not found. Skipping");
            return;
        }

        console.log("Copy " + sourceFile + " to " + android_dir);
        fs.createReadStream(sourceFile).pipe(fs.createWriteStream(destFile));
    });
};
