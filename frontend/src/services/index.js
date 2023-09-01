import axios from "axios";

const service = axios.create({
  baseURL: process.env.PUBLIC_URL + "/api",
});

if (process.env.NODE_ENV === "development") {
  service.defaults.baseURL = process.env.REACT_APP_BACKEND_URL + "/api";
}

service.interceptors.response.use(
  async (response) => {
    const { data } = response;
    return Promise.resolve(data);
  },
  async (error) => {
    if (!error.response) {
      console.error(error.toString());
      return Promise.reject({ error });
    }
    const { data, status, statusText } = error.response;
    if (status < 400) {
      return Promise.resolve(data);
    }
    console.error(`Error: ${status} ${data.name ?? statusText}`);
    return Promise.reject({ status, statusText });
  }
);

export default service;
