/**
 * Describe Inventorytracking here.
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

    logger.info(
        `Invoking inventorytracking Function with payload ${JSON.stringify(
          event.data || {}
        )}`
      ); 
      
    // Extract Properties from Payload
    const { productID } = event.data;  
    
    // Validate the payload params
    if (!productID) {
        throw new Error(`Please provide a product id`);
    }    

    try{
        //const GRAPHQL_URL = 'http://localhost:4000/graphql'
        const WEGMANS_URL = 'https://api.wegmans.io/stores/'

        const response = await fetch(WEGMANS_URL, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache',
                'Subscription-Key': '430935fa3c8040088f5c5e0bc9e24ade'
            }
        })    

        // const response = await fetch(GRAPHQL_URL, {
        //     method: 'POST',
        //     headers: {
        //         'content-type': 'application/json',
        //         'Access-Control-Allow-Origin': '*'
        //     },
        //     body: JSON.stringify({
        //         query: `query getInventory($productID: Int!) {
        //           inventory(id: $productID){
        //             product
        //             quantity
        //           }
        //         }`,
        //         variables: `{
        //             "productID": ${productID}
        //         }`,
        //     })
        // })    
        
        const { data } = await response.json()
        logger.info(JSON.stringify(data));
        return data;            

    } catch(err) {
        // Catch any DML errors and pass the throw an error with the message
        const errorMessage = `Failed to get inventory results . Root Cause: ${err.message}`;
        logger.error(errorMessage);
        throw new Error(errorMessage);
    }


}


