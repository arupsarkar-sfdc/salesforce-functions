public with sharing class FunctionApex {
    public static void test() {
        System.debug('Invoking myfunction');
        String testData = '{"latitude": "36.169090","longitude": "-115.140579","length": 5}';

        functions.Function myFunction = functions.Function.get('SalesforceFunctionsController.foofunction');
        functions.FunctionInvocation invocation = myFunction.invoke(testData);
        String jsonResponse = invocation.getResponse();

        System.debug('Response from myfunction ' + jsonResponse);
    }
}
