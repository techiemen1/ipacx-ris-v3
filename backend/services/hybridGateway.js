// FILE: backend/services/hybridGateway.js
const axios = require("axios");
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "pacsdb",
  password: process.env.DB_PASSWORD || "postgres",
  port: parseInt(process.env.DB_PORT || "5432", 10),
});

let cachedOrthancUrl = null;
let cachedDcm4cheeNode = null;
let lastDiscoveryTime = 0;

/**
 * Discovers active Orthanc DICOM Node
 */
async function getOrthancUrl() {
  const now = Date.now();
  if (cachedOrthancUrl && now - lastDiscoveryTime < 30000) {
    return cachedOrthancUrl;
  }

  const candidates = [
    process.env.ORTHANC_URL,
    "http://Orthanc:8042/",
    "http://localhost:8042/",
    "http://127.0.0.1:8042/",
    "http://host.docker.internal:8042/"
  ].filter(Boolean);

  const auth = {
    username: process.env.ORTHANC_USER || "orthanc",
    password: process.env.ORTHANC_PASSWORD || process.env.ORTHANC_PASS || "orthanc"
  };

  for (const url of candidates) {
    const cleanUrl = url.endsWith("/") ? url : `${url}/`;
    try {
      await axios.get(`${cleanUrl}system`, { auth, timeout: 800 });
      cachedOrthancUrl = cleanUrl;
      lastDiscoveryTime = now;
      console.log(`[v3 Hybrid Gateway] Selected active Orthanc URL: ${cleanUrl}`);
      return cleanUrl;
    } catch (e) {}
  }

  const fallback = "http://localhost:8042/";
  cachedOrthancUrl = fallback;
  return fallback;
}

/**
 * Discovers active DCM4CHEE ARC PACS Node
 */
async function getWorkingDcm4cheeNode() {
  const now = Date.now();
  if (cachedDcm4cheeNode && now - lastDiscoveryTime < 30000) {
    return cachedDcm4cheeNode;
  }

  const candidates = [
    { host: process.env.DCM4CHEE_HOST || "localhost", port: 8080, aet: "DCM4CHEE" },
    { host: "dcm4chee-arc", port: 8080, aet: "DCM4CHEE" },
    { host: "127.0.0.1", port: 8080, aet: "DCM4CHEE" },
    { host: "host.docker.internal", port: 8080, aet: "DCM4CHEE" }
  ];

  const auth = {
    username: process.env.DCM4CHEE_USER || "pacs",
    password: process.env.DCM4CHEE_PASS || "pacs"
  };

  for (const node of candidates) {
    const testUrl = `http://${node.host}:${node.port}/dcm4chee-arc/aets/${node.aet}/rs/studies?limit=1`;
    try {
      await axios.get(testUrl, { auth, timeout: 800, headers: { Accept: "application/dicom+json" } });
      cachedDcm4cheeNode = node;
      lastDiscoveryTime = now;
      console.log(`[v3 Hybrid Gateway] Selected active DCM4CHEE node: ${node.host}:${node.port}`);
      return node;
    } catch (e) {}
  }

  return null;
}

/**
 * Universal Multi-PACS DICOM Series & Instance Retriever
 * Prevents MR truncation using limit=9999&includefield=all
 */
async function fetchHybridSeriesAndInstances(studyUID) {
  if (!studyUID) return [];

  // 1. Try Orthanc PACS Query
  try {
    const orthancUrl = await getOrthancUrl();
    const auth = {
      username: process.env.ORTHANC_USER || "orthanc",
      password: process.env.ORTHANC_PASSWORD || process.env.ORTHANC_PASS || "orthanc"
    };

    const findRes = await axios.post(
      `${orthancUrl}tools/find`,
      { Level: "Study", Query: { StudyInstanceUID: studyUID } },
      { auth, timeout: 4000 }
    ).catch(() => null);

    if (findRes?.data && findRes.data.length > 0) {
      const orthancStudyId = findRes.data[0];
      const { data: studyData } = await axios.get(`${orthancUrl}studies/${orthancStudyId}`, { auth, timeout: 5000 });

      if (studyData && Array.isArray(studyData.Series)) {
        const seriesPromises = studyData.Series.map(async (seriesId, sIdx) => {
          const { data: sData } = await axios.get(`${orthancUrl}series/${seriesId}`, { auth, timeout: 6000 });
          const sDesc = sData?.MainDicomTags?.SeriesDescription || `Series ${sIdx + 1}`;
          const sNum = parseInt(sData?.MainDicomTags?.SeriesNumber || sIdx + 1, 10);
          const sModality = sData?.MainDicomTags?.Modality || "CR";

          const { data: expInstances } = await axios.get(`${orthancUrl}series/${seriesId}/instances?expand`, { auth, timeout: 12000 }).catch(() => ({ data: [] }));

          let instances = [];
          if (Array.isArray(expInstances) && expInstances.length > 0) {
            expInstances.sort((a, b) => {
              const numA = parseInt(a.MainDicomTags?.InstanceNumber || a.IndexInSeries || 0, 10);
              const numB = parseInt(b.MainDicomTags?.InstanceNumber || b.IndexInSeries || 0, 10);
              return numA - numB;
            });

            const total = expInstances.length;
            instances = expInstances.map((inst, iIdx) => {
              const instId = inst.ID || inst;
              const sliceNum = parseInt(inst.MainDicomTags?.InstanceNumber || iIdx + 1, 10);
              return {
                id: instId,
                instance_id: instId,
                sop_instance_uid: inst.MainDicomTags?.SOPInstanceUID || instId,
                slice_number: sliceNum,
                instance_number: sliceNum,
                preview_url: `/api/v3/pacs/instance-preview/${instId}`,
                caption: `${sDesc} | Slice ${sliceNum}/${total}`
              };
            });
          }

          return {
            series_id: sData.ID || seriesId,
            series_instance_uid: sData.MainDicomTags?.SeriesInstanceUID || seriesId,
            series_description: sDesc,
            series_number: sNum,
            modality: sModality,
            total_slices: instances.length,
            instances
          };
        });

        const seriesList = (await Promise.all(seriesPromises)).filter(Boolean);
        seriesList.sort((a, b) => a.series_number - b.series_number);
        if (seriesList.length > 0) return seriesList;
      }
    }
  } catch (err) {
    console.warn("[v3 Gateway] Orthanc query warning:", err.message);
  }

  // 2. Try DCM4CHEE ARC PACS Query (Fallback)
  try {
    const dNode = await getWorkingDcm4cheeNode();
    if (dNode) {
      const auth = {
        username: process.env.DCM4CHEE_USER || "pacs",
        password: process.env.DCM4CHEE_PASS || "pacs"
      };
      const seriesUrl = `http://${dNode.host}:${dNode.port}/dcm4chee-arc/aets/${dNode.aet}/rs/studies/${studyUID}/series?includefield=all&limit=9999`;
      const sRes = await axios.get(seriesUrl, { auth, headers: { Accept: "application/dicom+json" }, timeout: 8000 });

      if (Array.isArray(sRes.data) && sRes.data.length > 0) {
        const seriesList = [];
        for (let sIdx = 0; sIdx < sRes.data.length; sIdx++) {
          const serObj = sRes.data[sIdx];
          const seriesUid = serObj["0020000E"]?.Value?.[0];
          const seriesDesc = serObj["0008103E"]?.Value?.[0] || `Series ${sIdx + 1}`;
          const seriesNum = parseInt(serObj["00200011"]?.Value?.[0] || sIdx + 1, 10);
          const sModality = serObj["00080060"]?.Value?.[0] || "CR";

          if (!seriesUid) continue;

          const instUrl = `http://${dNode.host}:${dNode.port}/dcm4chee-arc/aets/${dNode.aet}/rs/studies/${studyUID}/series/${seriesUid}/instances?includefield=all&limit=9999`;
          const iRes = await axios.get(instUrl, { auth, headers: { Accept: "application/dicom+json" }, timeout: 8000 }).catch(() => ({ data: [] }));

          let instances = [];
          if (Array.isArray(iRes.data) && iRes.data.length > 0) {
            const total = iRes.data.length;
            instances = iRes.data.map((inst, iIdx) => {
              const sopUid = inst["00080018"]?.Value?.[0];
              const sliceNum = parseInt(inst["00200013"]?.Value?.[0] || iIdx + 1, 10);
              return {
                id: sopUid,
                instance_id: sopUid,
                sop_instance_uid: sopUid,
                slice_number: sliceNum,
                instance_number: sliceNum,
                preview_url: `/api/v3/pacs/instance-preview/${sopUid}?studyUID=${encodeURIComponent(studyUID)}&seriesUID=${encodeURIComponent(seriesUid)}`,
                caption: `${seriesDesc} | Slice ${sliceNum}/${total}`
              };
            });
          }

          seriesList.push({
            series_id: seriesUid,
            series_instance_uid: seriesUid,
            series_description: seriesDesc,
            series_number: seriesNum,
            modality: sModality,
            total_slices: instances.length,
            instances
          });
        }
        if (seriesList.length > 0) return seriesList;
      }
    }
  } catch (err) {
    console.warn("[v3 Gateway] DCM4CHEE query warning:", err.message);
  }

  return [];
}

/**
 * Universal DICOM Image Frame Buffer Fetcher
 */
async function fetchHybridInstanceBuffer(studyUID, seriesUID, instanceId, frameNumber = null) {
  if (!instanceId) return null;

  const orthancUrl = await getOrthancUrl();
  const auth = {
    username: process.env.ORTHANC_USER || "orthanc",
    password: process.env.ORTHANC_PASSWORD || process.env.ORTHANC_PASS || "orthanc"
  };

  const frameNumInt = frameNumber !== null && !isNaN(parseInt(frameNumber, 10)) ? parseInt(frameNumber, 10) : null;

  // 1. Try Multi-frame Orthanc Rendered
  if (frameNumInt && frameNumInt > 1) {
    try {
      const res = await axios.get(`${orthancUrl}instances/${instanceId}/frames/${frameNumInt - 1}/rendered`, { auth, responseType: "arraybuffer", timeout: 4000 });
      if (res?.data && res.data.byteLength > 500) return Buffer.from(res.data);
    } catch (e) {}
  }

  // 2. Try Single-frame Orthanc Rendered
  try {
    const res = await axios.get(`${orthancUrl}instances/${instanceId}/rendered`, { auth, responseType: "arraybuffer", timeout: 4000 });
    if (res?.data && res.data.byteLength > 500) return Buffer.from(res.data);
  } catch (e) {}

  return null;
}

module.exports = {
  getOrthancUrl,
  getWorkingDcm4cheeNode,
  fetchHybridSeriesAndInstances,
  fetchHybridInstanceBuffer
};
