# This powershell script is used to get the API key from the FarmBot API.
# The API key runs out every once in a while, so this script is used to get a new one. 
# Copy the full API key from the output and replace the API key in the FarmBot API key field in the .env file
$body = @{
    user = @{
        email = ""
        password = ""
    }
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://my.farm.bot/api/tokens" -Method Post -Body $body -ContentType "application/json"

$responseJson = $response | ConvertTo-Json -Depth 100
Write-Output $responseJson