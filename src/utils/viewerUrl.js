// FILE: src/utils/viewerUrl.js

export const getOhifViewerUrl = (studyOrUid) => {
  const host = typeof window !== "undefined" && window.location.hostname ? window.location.hostname : "localhost";
  const studyUid = typeof studyOrUid === "object" ? (studyOrUid?.study_uid || studyOrUid?.id || "") : (studyOrUid || "");

  let template = "http://{host}:8042/ohif/viewer?StudyInstanceUIDs={studyUID}";

  try {
    const saved = localStorage.getItem("ipacx_hospital_config");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.ohifViewerUrl && parsed.ohifViewerUrl.trim()) {
        template = parsed.ohifViewerUrl.trim();
      }
    }
  } catch (e) {}

  let url = template;
  if (url.includes("{studyUID}")) {
    url = url.replace("{studyUID}", encodeURIComponent(studyUid));
  } else {
    url = url.includes("?")
      ? `${url}&StudyInstanceUIDs=${encodeURIComponent(studyUid)}`
      : `${url}?StudyInstanceUIDs=${encodeURIComponent(studyUid)}`;
  }

  return url.replace(/{host}/g, host);
};
