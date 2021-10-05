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
 
export default async function (event, context, logger) {


    const GRAPHQL_URL = 'http://localhost:4000/graphql'

    const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            query: `query getInventory($productID: Int!) {
              inventory(id: $productID){
                product
                quantity
              }
            }`,
            variables: `{
                "productID": ${id}
            }`,
        })
    })

    const { data } = await response.json()
    console.log('---> data ' + JSON.stringify(data))

    logger.info(JSON.stringify(data));

    return data;
}


getInventory(3).then((result) => {
    console.log('---> result ' + JSON.stringify(result))
})