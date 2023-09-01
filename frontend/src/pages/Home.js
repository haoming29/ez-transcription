import React, { useState, useMemo, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { InboxOutlined } from "@ant-design/icons";
import { Button, message, Upload, Skeleton, Input, Modal } from "antd";
import { uploadFile, getTranscrption } from "../services/api";
import { copyToClipboard } from "../utils";
import styles from "./Home.module.css";

const { Dragger } = Upload;

const modalConfig = {
  title: "Do you want to start over?",
  content: (
    <>
      <p>You have already uploaded a file, do you want to start over?</p>
      <p>Upon confirmation, existing transcript and changes will be cleared.</p>
      <p>Please save the transcript first.</p>
    </>
  ),
};

const Home = () => {
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploaded, setUploaded] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcription, setTranscription] = useState(undefined);
  const [speakers, setSpeakers] = useState([]);
  const [sepakersCount, setSepakersCount] = useState(0);

  const transcriptTextElement = useRef(null);

  const [modal, contextHolder] = Modal.useModal();

  const resetTranscription = () => {
    setTranscription(undefined);
    setSpeakers([]);
    setSepakersCount(0);
    setUploaded(false);
    setUploadFileName("");
  };

  const handleBeforeUpload = async (file, fileList) => {
    if (uploadFileName && file) {
      const confirmed = await modal.confirm(modalConfig);
      if (confirmed) {
        resetTranscription();
        return true;
      } else {
        return Upload.LIST_IGNORE;
      }
    }
    resetTranscription();
    return true;
  };

  const fileUploadHandler = async ({
    file,
    onSuccess,
    onError,
    onProgress,
  }) => {
    if (file === undefined) {
      message.error("File cannot be empty.");
      console.error("File cannot be empty.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await uploadFile(formData);
      setUploadFileName(uploadRes.fileName);
      setUploaded(true);
      onSuccess(uploadRes);
    } catch (error) {
      console.log(error);
      onError("Error uploading the file.");
    }
  };

  const onTranscribe = async () => {
    try {
      setTranscription(undefined);
      setSpeakers([]);
      setSepakersCount(0);
      setTranscribing(true);
      const res = await getTranscrption(uploadFileName);
      setTranscription(res);
      setTranscribing(false);
      if (res?.paragraphs.length > 0) {
        let numSpeakers = 0;
        res.paragraphs.forEach((item) => {
          if (item.speaker > numSpeakers) {
            numSpeakers = item.speaker;
          }
        });
        setSpeakers(
          Array.from({ length: numSpeakers + 1 }, (v, i) => ({
            shown: false,
            title: "",
            firstname: "",
            lastname: "",
          }))
        );
        setSepakersCount(numSpeakers + 1);
      }
    } catch (error) {
      console.log(error);
      message.error("Error in transcription.");
      setTranscribing(false);
    }
  };

  const formattedTranscript = useMemo(() => {
    let curSpeaker = -1;
    if (!transcription?.paragraphs || transcription.paragraphs.length < 1) {
      return [];
    }
    const result = [];
    let buffer = "";
    transcription.paragraphs.forEach((para) => {
      if (curSpeaker !== para.speaker) {
        if (curSpeaker !== -1) {
          // change of speaker
          let speakerContent = "";
          if (
            !speakers[curSpeaker].firstname &&
            !speakers[curSpeaker].lastname
          ) {
            speakerContent = "Speaker " + curSpeaker;
          } else {
            if (speakers[curSpeaker].title) {
              speakerContent += speakers[curSpeaker].title + " ";
            }
            if (speakers[curSpeaker].firstname) {
              speakerContent += speakers[curSpeaker].firstname;
              if (speakers[curSpeaker].lastname) {
                speakerContent += " ";
              }
            }
            if (speakers[curSpeaker].lastname) {
              speakerContent += speakers[curSpeaker].lastname;
            }
          }
          const paraElement = (
            <p key={uuidv4()}>
              <b>{speakerContent}</b>
              {`: ${buffer}\n\n`}
            </p>
          );
          result.push(paraElement);
          buffer = "";
        }
        curSpeaker = para.speaker;
        buffer += para.content;
        buffer += " ";
      } else {
        buffer += para.content;
        buffer += " ";
      }
    });

    return result;
  }, [transcription?.paragraphs, speakers]);

  const handleCopy = () => {
    try {
      copyToClipboard(transcriptTextElement?.current.textContent);
      message.success("Transcript copied to clipbord.");
    } catch (error) {
      message.error("Error during copying.");
      console.log("Error during copying.\n" + error);
    }
  };

  const updateSpeakerArray = (idxToModify, value) => {
    const newSpeakers = speakers.map((item, idx) => {
      if (idxToModify === idx) {
        return value;
      } else {
        return item;
      }
    });
    setSpeakers(newSpeakers);
  };

  return (
    <div className={styles.page}>
      <div>{contextHolder}</div>
      <h1 className={styles.title}>Easy Transcription</h1>
      <Dragger
        multiple={false}
        customRequest={fileUploadHandler}
        beforeUpload={handleBeforeUpload}
        onChange={(info) => {
          const { status } = info.file;
          if (status === "done") {
            message.success(`${info.file.name} uploaded successfully.`);
          } else if (status === "error") {
            message.error(`${info.file.name} upload failed.`);
          }
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">
          Support for a single audio file upload. File size should be less than
          100MB.
        </p>
      </Dragger>
      <div className={styles.transcribeButtonContainer}>
        <Button
          type="primary"
          onClick={onTranscribe}
          disabled={!uploaded}
          loading={transcribing}
        >
          Transcribe
        </Button>
      </div>
      {sepakersCount > 0 && (
        <div className={styles.speakerFormContainer}>
          {Array.apply(null, Array(sepakersCount)).map((val, idx) => {
            return (
              <div key={idx} className={styles.speakerInputContainer}>
                <div className={styles.speakerNumber}>Speaker {idx}</div>
                <label>Title: </label>
                <Input
                  className={styles.speakerInput}
                  type="text"
                  value={speakers[idx].title || ""}
                  onChange={(e) => {
                    updateSpeakerArray(idx, {
                      ...speakers[idx],
                      title: e.target.value,
                    });
                  }}
                />
                <label>First name: </label>
                <Input
                  className={styles.speakerInput}
                  type="text"
                  value={speakers[idx].firstname || ""}
                  onChange={(e) => {
                    updateSpeakerArray(idx, {
                      ...speakers[idx],
                      firstname: e.target.value,
                    });
                  }}
                />
                <label>Last name: </label>
                <Input
                  className={styles.speakerInput}
                  type="text"
                  value={speakers[idx].lastname || ""}
                  onChange={(e) => {
                    updateSpeakerArray(idx, {
                      ...speakers[idx],
                      lastname: e.target.value,
                    });
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
      <Skeleton
        active
        loading={transcribing}
        paragraph={{ rows: 10 }}
        className={styles.skeleton}
      />
      {transcription && (
        <div className={styles.transcription}>
          <div className={styles.transcriptHeading}>
            <div className={styles.transcriptTitle}>Transcript</div>
            <Button onClick={handleCopy} disabled={!transcription}>
              Copy to Clipbord
            </Button>
          </div>
          <div ref={transcriptTextElement}>
            {formattedTranscript.map((item) => item)}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
