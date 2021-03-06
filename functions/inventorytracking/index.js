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
    const { productName } = event.data;  
    
    // Validate the payload params
    if (!productName) {
        throw new Error(`Please provide a product name`);
    }    

    try{

        
        //9222b1ed26a7497fb80bc5c072a346ef
        const API_KEY = "9222b1ed26a7497fb80bc5c072a346ef"
        let URL = "https://api.spoonacular.com/food/products/search?query="+productName+"&apiKey="+API_KEY
        logger.info('url fetched ', URL)
          fetch(URL)
            .then(response => response.json())
            .then(result => {
                console.log(JSON.stringify(result))
                logger.info(JSON.stringify(result));
                return result
            })
            .catch(error => {
                console.log('error', error)
                logger.Error(err)
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


