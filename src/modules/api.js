async function apiRequest(path, port) {
  //Headers for requests
  const headers = { headers: { "Content-Type": "application/json" } };
  const request = await fetch(`http://10.1.1.14:${port}${path}`, headers);
  const response = await request.json();
  if(request.ok && response.ErrorCode && response.ErrorCode !== 1) {
    //Error with api, might have sent bad headers.
    console.log(`Error: ${ JSON.stringify(response) }`);
  }
  else if(request.ok) {
    //Everything is ok, request was returned to sender.
    return response;
  }
  else {
    //Error in request ahhhhh!
    console.log(`Error: ${ JSON.stringify(response) }`);
  }
}

export const GetMonthlyStatus = async () => apiRequest(`/GetMonthlyStatus`, 3100);
export const GetLiveData = async () => apiRequest(`/GetLiveData`, 3100);
export const GetMonthlyRates = async () => apiRequest(`/GetMonthlyRates`, 3110);