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
// import https from 'https'
// import fetch from 'node-fetch'
// import { request } from 'http'
import request from 'request'
 
export default async function (event, context, logger) {
    logger.info(`Invoking Compressfiles with payload ${JSON.stringify(event.data || {})}`)
    //const results = await context.org.dataApi.query('SELECT Id, Name FROM Account');
    const parentId = '001J000002jkWs6IAE'
    const query = `SELECT Id, ContentDocumentId, ContentDocument.LatestPublishedVersionId, ContentDocument.LatestPublishedVersion.VersionData FROM ContentDocumentLink WHERE LinkedEntityId ='${parentId}'`
    logger.info(`Query -> ${query}`)
    const results = await context.org.dataApi.query(query)  
    const accessToken = await context.org.dataApi.accessToken
    try {
        logger.info(JSON.stringify(results))
        const data = await JSON.parse(JSON.stringify(results))
        logger.info(`Access Token : ${accessToken}`)
        logger.info(`Content Document Link Id: ${data.records[0].fields.id}`)
        logger.info(`Content Document Id: ${data.records[0].fields.contentdocumentid}`)
        logger.info(`Content VersionData URL: ${data.records[0].fields.contentdocument.LatestPublishedVersion.VersionData}`)
        const fileURL = context.org.domainUrl + data.records[0].fields.contentdocument.LatestPublishedVersion.VersionData
        logger.info(`Domain File URL: ${fileURL}`)
        const timestamp = new Date().toISOString()
        const ref = `${timestamp}.jpg`
        logger.info(`filename: ${ref}`)
        const fileInput = context.org.baseUrl + data.records[0].fields.contentdocument.LatestPublishedVersion.VersionData
        logger.info(`Base File URL: ${fileInput}`)        
        await request
            .get(
                fileInput
            )
            .auth(null, null, true, accessToken)
            .on('error', (err) => {
                if(err){
                    logger.info(`Auth Error: ${err}`)        
                }
            })
            .pipe(
                fs.createWriteStream(`./processing/${ref}`, { encoding: "utf8" })
                    .on('error', error => {
                        if(error) {
                            logger.info(`Error in create stream : ${error.message}`)
                        }else {
                            logger.info(`Success`)
                        }
                    })
            )
            .on('finish', async(data) => {
                logger.info(`Finish: ${data}`)
            })
        // await request
        //     .get(
        //         fileInput
        //     )
        //     .auth(null, null, true, accessToken)
        //     .on("error", (err) => {
        //         if(err){
        //             logger.info("Exception : ", err)
        //         }
        //     })
        //     .pipe(
        //         fs.createWriteStream(`./processing/${ref}`, { encoding: "utf8" })
        //             .then(info => {
        //                 logger.info('---> create stream ',info)
        //             })
        //             .catch(error => {
        //                 logger.error('---> create stream ',error)
        //             })
        //     )
        //     .on('finish', async (data) => {
        //         logger.info('---> finish data ', data)
        //         await sharp(`./processing/${ref}`)
        //             .webp({quality: 20})
        //             .toFile(`./outbound/${timestamp} + .webp`)
        //                 .then((info) => {
        //                     logger.info('---> sharp info ', info)
        //                 })
        //                 .catch(err => {
        //                     logger.info('---> sharp err ', err)
        //                 })
        //         logger.info("---> process finished ", data)
        //     })
    }catch(err) {
        logger.info(`Exception : ${err}`)
    }


    return results
}
// helper methods below - ignore
async function compressImage(fileRef, context, logger) {
    logger.info('---> version data ', fileRef)
    await request
        .get(
            context.org.baseUrl + fileRef
        )
        .auth(null, null, true, context.org.dataApi.accessToken)
        .on("error", (err) => {
            if(err){
                logger.info("Exception : ", err)
            }
        })
        .pipe(
            fs.createWriteStream("./output/modified.jpg", { encoding: "utf8" })            
        )
        .on("finish", (data) => {
            logger.info("---> process finished ", data)
        })

}

async function getMetadata(fileRef) {
    try {
      const metadata = await sharp(fileRef).metadata();
      logger.info('---> inside function ', metadata);
      return metadata
    } catch (error) {
      logger.info(`An error occurred during processing: ${error}`);
    }
}


