module.exports = function(refresh=false) {

    const path = require('path')
    const fs = require('fs')
    const utils = require('./utils')
    const store = require('../translation-store')

    const sdgMetadataConvert = require('sdg-metadata-convert')
    const sdmxOutput = new sdgMetadataConvert.SdmxOutput()
    const wordTemplateInput = new sdgMetadataConvert.WordTemplateInput({
        debug: true,
        cheerio: { decodeEntities: false },
    })

    if (refresh) {
        store.refresh()
    }

    const sourceFolder = 'indicators'
    const targetFolder = path.join('translations', 'pt')
    const extensions = ['.docx', '.docm']
    const files = fs.readdirSync(sourceFolder).filter(file => {
        return extensions.includes(path.extname(file).toLowerCase());
    })
    const conversions = files.map(sourceFile => {
        const sourcePath = path.join(sourceFolder, sourceFile)
        const targetFile = convertFilename(sourceFile)
        const targetPath = path.join(targetFolder, targetFile)
        return [sourcePath, targetPath]
    })

    importIndicators()

    async function importIndicators() {
        for (const conversion of conversions) {
            const [inputFile, outputFile] = conversion
            try {
                const metadata = await wordTemplateInput.read(inputFile)
                await yamlOutput.write(metadata, outputFile)
                console.log(`Converted ${inputFile} to ${outputFile}.`);
            } catch(e) {
                console.log(e)
            }
        }
    }

    // Compile arrays of source -> target conversions.
    const sdmxConversions = []
    for (const language of store.getLanguages()) {
        const sourceLangFolder = language
        const sourceExtension = '.'
        const sourceFolder = path.join('translations', sourceLangFolder)
        const files = fs.readdirSync(sourceFolder).filter(file => {
            return path.extname(file).toLowerCase() === sourceExtension
        })
        for (const sourceFile of files) {
            const sourcePath = path.join(sourceFolder, sourceFile)
            const targetFolder = utils.createFolder(['www', 'documents', language])
            const pdfFile = sourceFile.replace(sourceExtension, '.pdf')
            const pdfPath = path.join(targetFolder, pdfFile)
            sdmxConversions.push([sourcePath, pdfPath])
        }
    }
    convertPdfs()

    async function convertPdfs() {
        for (const conversion of pdfConversions) {
            const [inputFile, outputFile] = conversion
            try {
                const metadata = await yamlInput.read(inputFile)
                await pdfOutput.write(metadata, outputFile)
                console.log(`Converted ${inputFile} to ${outputFile}.`);
            } catch(e) {
                console.log(e)
            }
        }
    }
}
