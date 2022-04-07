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
import https from 'https'
 
export default async function (event, context, logger) {
    logger.info(`Invoking Compressfiles with payload ${JSON.stringify(event.data || {})}`)
    fs.access("./uploads", (error) => {
        if (error) {
          fs.mkdirSync("./uploads");
        }
      })

    //const results = await context.org.dataApi.query('SELECT Id, Name FROM Account');
    const results = await context.org.dataApi.query('SELECT Title, VersionData from ContentVersion')
    
    try {
        console.log(JSON.stringify(results))
        const data = await JSON.parse(JSON.stringify(results))
        console.log('---> title ', data.records[0].fields.title)
        console.log('---> version data ', data.records[0].fields.versiondata)
        const { originalname } = data.records[0].fields.title
        const { buffer } = data.records[0].fields.versiondata
        const timestamp = new Date().toISOString()
        const ref = `${timestamp}-${originalname}.webp`
        console.log('---> new file name ', ref)
        await compress(buffer, originalname)
    }catch(err) {
        console.error('---> Error', err)
    }


    return results
}

async function compress(url, filename) {
    console.log('---> file url ', url)
    https.get(url, async (res) => {
        const file = fs.createWriteStream(filename);
        await sharp(file)
            .webp({quality: 20})
            .toFile("./uploads/" + filename)
        
        const link = `http://localhost:8080/${filename}` 
        console.log('---> compressed file url ', link)           
    })
    .on('error', (err) => {
        console.log("---> compress Error: ", err.message);
    })
}
