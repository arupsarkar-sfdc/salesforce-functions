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
    
    const parentId = '001J000002jkWs6IAE'
    const query = `SELECT Id, ContentDocumentId, ContentDocument.LatestPublishedVersionId, ContentDocument.LatestPublishedVersion.VersionData FROM ContentDocumentLink WHERE LinkedEntityId ='${parentId}'`
    console.log('---> query ', query)
    const results = await context.org.dataApi.query(query)  
    const accessToken = await context.org.dataApi.accessToken
    try {
        console.log(JSON.stringify(results))
        const data = await JSON.parse(JSON.stringify(results))
        console.log('---> accessToken ', accessToken)
        console.log('---> id ', data.records[0].fields.id)
        console.log('---> id ', data.records[0].fields.id)
        console.log('---> content document id ', data.records[0].fields.contentdocumentid)
        console.log('---> content version data ', data.records[0].fields.contentdocument.LatestPublishedVersion.VersionData)
        const timestamp = new Date().toISOString()
        const ref = `${timestamp}.webp`
        console.log('---> new file name ', ref)
        //await compress(data.records[0].fields.versiondata, originalname)
    }catch(err) {
        console.error('---> Error', err)
    }


    return results
}

async function compress(url, filename) {

    const fileURL = 'https://fun-enterprise-5282-dev-ed.cs10.my.salesforce.com'+url
    
    console.log('---> file url ', fileURL)
    console.log('---> file name ', filename)    
    
    https.get(fileURL, async (res) => {
        const file = fs.createWriteStream(filename);
        res.pipe(file)
        file.on('finish', async () => {
            await sharp(file)
                .webp({quality: 20})
                .toFile(filename)
        
        const link = `http://localhost:8080/${filename}` 
        console.log('---> compressed file url ', link)           
        })

    })
    .on('error', (err) => {
        console.log("---> compress Error: ", err.message);
    })
}
