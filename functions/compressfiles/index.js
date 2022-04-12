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
import fetch from 'node-fetch'
// import { request } from 'http'
import request from 'request'
 
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
        console.log('---> content document id ', data.records[0].fields.contentdocumentid)
        console.log('---> content version data ', data.records[0].fields.contentdocument.LatestPublishedVersion.VersionData)
        const fileURL = context.org.domainUrl + data.records[0].fields.contentdocument.LatestPublishedVersion.VersionData
        console.log('---> new file url ', fileURL)
        const timestamp = new Date().toISOString()
        const ref = `${timestamp}.webp`
        console.log('---> new file name ', ref)


        await request
            .get(
                context.org.baseUrl + data.records[0].fields.contentdocument.LatestPublishedVersion.VersionData
            )
            .auth(null, null, true, context.org.dataApi.accessToken)
            .on("error", (err) => {
                if(err){
                    console.log("Exception : ", err)
                }
            })
            .pipe(
                fs.createWriteStream("./outbound/modified.jpg", { encoding: "utf8" })            
            )
            .on("finish", (data) => {
                console.log("---> process finished ", data)
            })

        // fetch(fileURL, { method: 'get', headers: {
        //                 'Authorization' : 'Bearer ' + accessToken,
        //                 'content-type': 'application/octetstream'}})
        //     .then(data => {
        //         console.log('---> data ', data)
        //         return data
        //     })
        //     .then(async (response) => {
        //         console.log('---> buffer body ', response.body)
        //         const input = './inbound/kate-laine-aqMloFwABoc-unsplash.jpg'
        //         const metadata = await getMetadata(input)
        //         console.log('---> returned meta data ', metadata)
        //         const result = await compressImage(data.records[0].fields.contentdocument.LatestPublishedVersion.VersionData,
        //                                 context,
        //                                 logger)
        //         // const result = await resizeImage(input)

        //         // await sharp(input)
        //         //     .webp({quality: 20})
        //         //     .toFile(`./outbound/${ref}`, (err) => {
        //         //         if(err) {
        //         //             console.log('---> error in sharp compression', err)
        //         //         }else {
        //         //             console.log('---> compressed success')
        //         //             const link = `http://localhost:8080/${ref}`
        //         //             console.log('---> compressed image link ', link)                            
        //         //         }
        //         //     }) 
                

        //     })
        //     .catch(err => {
        //         console.error("---> fetch error: " + err);
        //     })
        //await compress(data.records[0].fields.versiondata, originalname)
    }catch(err) {
        console.error('---> Error', err)
    }


    return results
}

async function compressImage(fileRef, context, logger) {
    console.log('---> version data ', fileRef)
    await request
        .get(
            context.org.baseUrl + fileRef
        )
        .auth(null, null, true, context.org.dataApi.accessToken)
        .on("error", (err) => {
            if(err){
                console.log("Exception : ", err)
            }
        })
        .pipe(
            fs.createWriteStream("./output/modified.jpg", { encoding: "utf8" })            
        )
        .on("finish", (data) => {
            console.log("---> process finished ", data)
        })

}

async function resizeImage(fileRef) {
    try{
        await sharp(fileRef)
                .resize({
                    width: 150,
                    height: 97
                })
                .toBuffer()
                    .then(data => {
                        const fd = fs.openSync("/outbound", "r");
                        fs.fchmodSync(fd, 0o777);                        
                        fs.createWriteStream('/outbound/modified-file.jpg').write(data.buffer)
                    })
                    .catch(err => {
                        console.err(err)
                    }) 


    }catch(err) {
        console.log(error)
    }
}

async function getMetadata(fileRef) {
    try {
      const metadata = await sharp(fileRef).metadata();
      console.log('---> inside function ', metadata);
      return metadata
    } catch (error) {
      console.log(`An error occurred during processing: ${error}`);
    }
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
