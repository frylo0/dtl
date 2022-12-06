export default async function (argv) {
    try {
        checkTemplateExists(argv.templateName);

        await instantiate.bind(argv.folderName)(
            getTemplatePath(argv.templateName),
            process.cwd()
        );

        logOk(`\nSuccessfully!\n`);
    } catch (err) {
        if (!ERROR.matchAny(err.message))
            throw err;
        console.log();
    }

    process.exit();
};