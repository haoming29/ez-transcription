import service from ".";

export const getTranscrption = async (fileName) => {
  return service.post("/transcribe", { fileName });
};

export const uploadFile = async (file) => {
  return service.post("/upload", file, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
