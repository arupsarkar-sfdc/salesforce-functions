/**
 * Describe Compressfiles here.
 *
 * The exported method is the entry point for your code when the function is invoked. 
 *
 * Following parameters are pre-configured and provided to your function on execution: 
 * @param event: represents the data associated with the occurrence of an event, and  
 *                 supporting metadata about the source of that occurrence.
 * @param context: represents the connection to Functions and your Salesforce org.
 * @param logger: logging handler used to capture application logs and trace specifically
 *                 to a given execution of a function.
 */
import sharp from 'sharp'
import fs from 'fs'
 
export default async function (event, context, logger) {
    logger.info(`Invoking Compressfiles with payload ${JSON.stringify(event.data || {})}`)
    fs.access("./uploads", (error) => {
        if (error) {
          fs.mkdirSync("./uploads");
        }
      })

    //const results = await context.org.dataApi.query('SELECT Id, Name FROM Account');
    const results = await context.org.dataApi.query('SELECT Title, VersionData from ContentVersion')
    const { originalname } = results.records[0].fields.title
    // const { buffer } = results.records.fields.VersionData
    // const timestamp = new Date().toISOString()
    // const ref = `${timestamp}-${originalname}.webp`
    // await sharp(buffer)
    //     .webp({quality: 20})
    //     .toFile("./uploads/" + ref)
    console.log('---> original file name', originalname)
    console.log(JSON.stringify(results))

    return results
}
