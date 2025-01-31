/**
 * Helper function to make REST calls to the FarmBot API
 * @param endpoint 
 * @param method // GET, POST, PUT, DELETE
 * @param headers 
 * @param body 
 * @returns 
 */
export default async function (endpoint: string, method: string, headers: any = null, body: any = null) {
        const url = `https://my.farm.bot/${endpoint}`;

        const options: any = {
            method: method,
            headers: {
                'Authorization': useRuntimeConfig().farmbotApi,
                //...headers
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
}