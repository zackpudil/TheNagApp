import { baseHttpUrl, postBody } from "./common";

const baseNagsUrl = `${baseHttpUrl}/nag`;

export const getNags = async (url) => {
  const nags = await fetch(`${baseNagsUrl}s/${url}`);
  return nags.json();
};

export const createNag = async (nag, image) => {
  const data = new FormData();
  data.append('nag', JSON.stringify(nag));
  data.append('nagImage', {
    uri: image.uri,
    name: `nag.jpg`,
    type: 'image/jpeg'
  });
  data.append('Content-Type', 'image/jpeg');

  const response = await fetch(baseNagsUrl, {
    method: 'POST',
    body: data,
    headers: {
      'Content-Type': 'multipart/form-data;'
    }
  });

  return response.json();
};

export const doTheNag = async (nag, image) => {
  const data = new FormData();
  data.append('nagImage', {
    uri: image.uri,
    name: 'nag.jpg',
    type: 'image/jpep'
  });
  data.append('Content-Type', 'image/jpeg');

  const response = await fetch(`${baseNagsUrl}/${nag._id}/do`, {
    method: 'PUT',
    body: data,
    headers: {
      'Content-Type': 'multipart/form-data;'
    }
  });

  return response.json();
}

export const approveNag = async (nagId) => {
  const response = await fetch(`${baseNagsUrl}/${nagId}/approve`, {
    method: 'DELETE'
  });

  return response.json();
};

export const denyNag = async (nagId) => {
  const response = await fetch(`${baseNagsUrl}/${nagId}/deny`, {
    method: 'PUT'
  });

  return response.json();
};

export const deleteNag = async (nagId) => {
  const response = await fetch(`${baseNagsUrl}/${nagId}`, {
    method: 'DELETE',
  });

  return response.json();
};

export const assignNag = async (nagId, deviceToken) => {
  const response = await fetch(`${baseNagsUrl}/${nagId}/assign/${deviceToken}`, {
    method: 'PUT',
    ...postBody({})
  });

  return response.json();
};

export const alertAllNags = async () => {
  const response = await fetch(`${baseNagsUrl}s/alert`, {
    method: 'POST',
    ...postBody({})
  });

  return response.json();
};

export const alertNag = async (nagId) => {
  const response = await fetch(`${baseNagsUrl}/${nagId}/alert`, {
    method: 'POST',
    ...postBody({})
  });

  return response.json();
};

const choreImages = {
  counter: require('../assets/counter.jpg'),
  fridge: require("../assets/fridge.jpg"),
  hallway: require('../assets/hallway.jpg'),
  livingroom: require('../assets/livingroom.jpg'),
  microwave: require('../assets/microwave.jpg'),
  office: require('../assets/office.jpg'),
  trashk: require('../assets/trashk.jpg'),
  trashl: require('../assets/trashl.jpg'),
  vents: require('../assets/vents.jpg'),
  water: require('../assets/water.jpg')
};

export const getChoreImage = (choreDesc) => {
  const c = choreDesc.toLowerCase();
  if (c.includes('trash')) {
    if (c.includes('kitchen')) return choreImages.trashk;
    else return choreImages.trashl;
  }
  else if (c.includes('fridge')) return choreImages.fridge;
  else if (c.includes('living')) return choreImages.livingroom;
  else if (c.includes('counter')) return choreImages.counter;
  else if (c.includes('kitchen')) return choreImages.counter;
  else if (c.includes('office')) return choreImages.office;
  else if (c.includes('water')) return choreImages.water;
  else if (c.includes('vent')) return choreImages.vents;
  else if (c.includes('hallway')) return choreImages.hallway;
  else return choreImages.microwave;
}