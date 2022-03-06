
//export const baseHttpUrl = 'http://thenagapp.ngrok.io';
export const baseHttpUrl = 'http://a911-97-116-77-45.ngrok.io';

export const postBody = (body) => ({
  headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
});

