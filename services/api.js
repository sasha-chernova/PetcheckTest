export const getData = async (url = '') => {
    const response = await fetch(url, {
      method: 'GET',
    });
    return response.json();
  }
  
  export const setWalkStarting = async (body) => {
    // fake request for success response for testing
    return await getData('https://reactnative.dev/movies.json')
      .then(async (json) => {
        console.log('data sent')
        return json;
      })
      .catch(async (error) => {
        // in case of error (no internet connection in this case)
        return false;
      })
  };