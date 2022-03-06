import { baseHttpUrl, postBody } from "./common";


export const getChores = async () => {
    const response = await fetch(`${baseHttpUrl}/chores`);
    return response.json();
}

export const createChore = async (chore) => {
    const response = await fetch(`${baseHttpUrl}/chore`, {
        method: 'POST',
        ...postBody(chore)
    });

    return response.json();
};

export const deleteChore = async (choreId) => {
    const response = await fetch(`${baseHttpUrl}/chore/${choreId}`, {
        method: 'DELETE',
        ...postBody({})
    });

    return response.json();
};