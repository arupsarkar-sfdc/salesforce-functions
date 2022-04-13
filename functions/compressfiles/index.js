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
import fetch from 'node-fetch'
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
        const data = await JSON.parse(JSON.stringify(results))
        const fileURL = context.org.domainUrl + data.records[0].fields.contentdocument.LatestPublishedVersion.VersionData
        const timestamp = new Date().toISOString()
        const ref = `${timestamp}.jpg`
        const fileInput = context.org.baseUrl + data.records[0].fields.contentdocument.LatestPublishedVersion.VersionData
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

                const fileBuffer =  await sharp(`./processing/${ref}`)
                                            .webp({quality: 20})
                                            .toBuffer()
                //write to contentversion
                const userId = '005J000000EvrkhIAB'
                const versionData = fileBuffer.toString('base64')
                const body = {
                    'Title': `${timestamp}`,
                    'PathOnClient': `${timestamp} + .webp`,
                    'ContentLocation': 'S',
                    'OwnerId': userId,
                    'VersionData': versionData
                }
                const response = await fetch(context.org.baseUrl + '/services/data/v53.0/sobjects/ContentVersion',
                                                                        {
                                                                            method: 'post',
                                                                            body: JSON.stringify(body),
                                                                            headers: {
                                                                                'Content-Type': 'application/json',
                                                                                'Authorization': 'Bearer ' + accessToken
                                                                            }
                                                                        })
                const cvData = await response.json()
                logger.info(`ContentVersion Id :${cvData[0].id}`)
                logger.info(`ContentVersion Status :${cvData[0].success}`)
                logger.info(`ContentVersion Errors :${JSON.stringify(cvData[0].errors)}`)

                //attachh the file to the parent linked id
                //1. Query ContentVersion to get ContentDocumentId
                const contentDocQuery = `SELECT ContentDocumentId FROM ContentVersion WHERE Id = '${cvData[0].id}'`
                const contentDocResults = await context.org.dataApi.query(contentDocQuery) 
                logger.info(`ContentVersion Query Results :${JSON.stringify(contentDocResults)}`)
                logger.info(`${contentDocResults.records[0].contentdocumentid}`)
                const contentDocStatus = await createContentDocumentLink(contentDocResults.records[0].contentdocumentid, 
                        parentId,
                        context,
                        accessToken)
                logger.info(`${contentDocStatus}`)
                return JSON.stringify(cvData)
            })
    }catch(err) {
        logger.info(`Exception : ${err}`)
    }
}

async function createContentDocumentLink(docId, linkedId, context, accessToken) {
    const body = {
        'ContentDocumentId': `${docId}`,
        'LinkedEntityId': `${linkedId}`,
        'Visibility': 'AllUsers'
    }
    const response = await fetch(context.org.baseUrl + '/services/data/v53.0/sobjects/ContentDocumentLink',
    {
        method: 'post',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        }
    })
    const contentDocLinkData = await response.json()   
    logger.info(`${contentDocLinkData}`) 
    return contentDocLinkData
}

// helper methods below - ignore
async function getMetadata(fileRef) {
    try {
      const metadata = await sharp(fileRef).metadata();
      logger.info('---> inside function ', metadata);
      return metadata
    } catch (error) {
      logger.info(`An error occurred during processing: ${error}`);
    }
}


