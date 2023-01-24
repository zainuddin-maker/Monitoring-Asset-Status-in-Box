import { useState } from "react";
import axios from "axios";
import { LoadingUploadFile } from "../../ComponentReuseable/index";
import { getToken } from "../../TokenParse/TokenParse";
const UploadFile = () => {
    const [file, setFile] = useState(null);
    const [progressBarUpload, setProgressBarUpload] = useState();

    const onChange = (e) => {
        const { files } = e.target;
        if (files.length > 0) {
            setFile(e.target.files[0]);
        } else {
            setFile(null);
        }
    };

    const upload = async () => {
        if (file !== null) {
            try {
                const formData = new FormData();
                formData.append("pathFile", file.name);
                formData.append("file", file);
                const config = {
                    method: "post",
                    url: "https://192.168.7.121:1111/api/uploadFileRepository",
                    data: formData,
                    headers: { authorization: getToken() },
                    onUploadProgress: (data) =>
                        setProgressBarUpload(
                            Math.round((data.loaded / data.total) * 100)
                        ),
                };
                const result = await axios(config);
                setProgressBarUpload(0);
            } catch (e) {
                console.log(e.toString());
                setProgressBarUpload(0);
            }
        }
    };
    return (
        <div style={{ position: "relative", height: "100%" }}>
            <LoadingUploadFile percentage={progressBarUpload} />
            <input type='file' onChange={onChange} />
            <button onClick={upload}>Upload</button>
        </div>
    );
};

export default UploadFile;
