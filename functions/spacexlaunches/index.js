/**
 * Describe Spacexlaunches here.
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
 import fetch from "node-fetch";

 
 export default async function (event, context, logger) {
     logger.info(`Invoking Spacexlaunches with payload ${JSON.stringify(event.data || {})}`);
 
     const { limit } = event.data
     logger.info(limit)
 
     if (!limit) {
         throw new Error(`Please provide a limit`);
     }     
 
         try{
             const GRAPHQL_URL = 'https://api.spacex.land/graphql/'
             const response = await fetch(GRAPHQL_URL, {
                 method: 'POST',
                 headers: {
                     'content-type': 'application/json',
                     'Access-Control-Allow-Origin': '*'
                 },
                 body: JSON.stringify({
                     query: ` query getRockets($limit: Int!) {
                         rockets(limit: $limit){
                         name
                         success_rate_pct
                             engines {
                                 type
                             }
                         }
                     }`,
                     variables: `{
                         "limit": ${limit}
                     }`,                  
                 })
             })        
 
         const { data } = await response.json()
         logger.info(data)
         return data
     }catch(err) {
         // Catch any DML errors and pass the throw an error with the message
         const errorMessage = `Failed to get spacex results . Root Cause: ${err.message}`;
         logger.error(errorMessage);
         throw new Error(errorMessage);
     }
 
 }
 