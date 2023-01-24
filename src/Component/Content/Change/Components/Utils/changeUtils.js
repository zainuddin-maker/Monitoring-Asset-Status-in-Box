import axios from "axios";

export const requestAPI = (config) => {
    return new Promise(async (resolve, reject) => {
        try {
            let result = await axios(config);
            resolve(result.data);
        } catch (error) {
            reject(error);
        }
    });
};
