public with sharing class FunctionApex2 {
    public static void test() {
        System.debug('Invoking inventory tracking');
        String testData = '{"productName": "yogurt"}';

        functions.Function myFunction = functions.Function.get('SalesforceFunctionsController.inventorytracking');
        functions.FunctionInvocation invocation = myFunction.invoke(testData);
        String jsonResponse = invocation.getResponse();

        System.debug('Response from myfunction ' + jsonResponse);
    }
}
