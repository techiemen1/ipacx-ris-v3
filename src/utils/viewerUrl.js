export const getOhifViewerUrl = (studyOrUid) => {
  const host = typeof window !== "undefined" && window.location.hostname ? window.location.hostname : "localhost";
  const port = typeof window !== "undefined" && window.location.port ? window.location.port : "5000";
  const studyUid = typeof studyOrUid === "object"
    ? (studyOrUid?.study_uid || studyOrUid?.study_instance_uid || studyOrUid?.studyInstanceUid || studyOrUid?.id || studyOrUid?.accession_no || "")
    : (studyOrUid || "");

  let template = "http://{host}:{port}/ohif/viewer?StudyInstanceUIDs={studyUID}";

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

  return url.replace(/{host}/g, host).replace(/{port}/g, port);
};


