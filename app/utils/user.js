import { baseHttpUrl, postBody } from './common';
import { getDeviceToken } from './device';

const baseUserUrl = `${baseHttpUrl}/user`;

export const getUserFromDeviceToken = async () => {
  const token = await getDeviceToken();
  const response = await fetch(`${baseUserUrl}/${token}`);
  return response.json();
};

export const createUser = async (user) => {
	const deviceToken = await getDeviceToken();

	const response = await fetch(`${baseUserUrl}`, {
		method: 'POST',
    ...postBody({ ...user, deviceToken })
	});
	return response.json();
};

export const getUsers = async () => {
  const response = await fetch(`${baseUserUrl}s/`);
  return response.json();
};

export const updateUser = async (user) => {
  const response = await fetch(`${baseUserUrl}/${user.deviceToken}`, {
    method: 'PUT',
    ...postBody(user)
  });
};

export const deleteUser = async (user) => {
  const response = await fetch(`${baseUserUrl}/${user.deviceToken}`, {
    method: 'DELETE',
    ...postBody(user)
  });
};
