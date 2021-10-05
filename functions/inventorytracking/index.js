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

    stores
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

        

        let requestOptions = {
            method: 'GET',
            redirect: 'follow'
          };
          
          fetch("https://api.wegmans.io/stores?Subscription-Key=430935fa3c8040088f5c5e0bc9e24ade&api-version=2018-10-18", requestOptions)
            .then(response => {
                response.text()
                logger.info(JSON.stringify(response.text()));
            })
            .then(result => {
                
                console.log(result)
                logger.info(JSON.stringify(result));
                return result
            })
            .catch(error => {
                console.log('error', error)
            });        

        //const GRAPHQL_URL = 'http://localhost:4000/graphql'
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

    } catch(err) {
        // Catch any DML errors and pass the throw an error with the message
        const errorMessage = `Failed to get inventory results . Root Cause: ${err.message}`;
        logger.error(errorMessage);
        throw new Error(errorMessage);
    }


}


