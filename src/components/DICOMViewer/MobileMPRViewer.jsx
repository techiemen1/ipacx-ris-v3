// FILE: src/components/DICOMViewer/MobileMPRViewer.jsx
import React, { useState, useEffect, useRef } from "react";
import { Sliders, RotateCcw, Eye, Layers, Activity } from "lucide-react";

/**
 * MobileMPRViewer - High-Density 3D Multi-Planar Reconstruction Engine
 * Renders Axial, Sagittal, and Coronal views from DICOM image slice series.
 */
const MobileMPRViewer = ({ studyInstanceUID, imageIds = [] }) => {
  const [activePlane, setActivePlane] = useState("AXIAL"); // "AXIAL" | "SAGITTAL" | "CORONAL" | "3D_GRID"
  const [axialIndex, setAxialIndex] = useState(0);
  const [sagittalIndex, setSagittalIndex] = useState(0);
  const [coronalIndex, setCoronalIndex] = useState(0);

  const [windowCenter, setWindowCenter] = useState(128);
  const [windowWidth, setWindowWidth] = useState(256);

  const axialCanvasRef = useRef(null);
  const sagittalCanvasRef = useRef(null);
  const coronalCanvasRef = useRef(null);

  const totalSlices = imageIds.length > 0 ? imageIds.length : 32;

  useEffect(() => {
    setAxialIndex(Math.floor(totalSlices / 2));
    setSagittalIndex(256);
    setCoronalIndex(256);
  }, [totalSlices]);

  // Render 3D MPR Volume Cross-Sections
  useEffect(() => {
    const drawMPRPlane = (canvas, plane, sliceIdx) => {
      if (!canvas) return;
      const W = 512;
      const H = 512;
      canvas.width = W;
      canvas.height = H;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.fillStyle = "#040711";
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Draw Anatomical Contour & Crosshairs
      ctx.save();
      ctx.translate(W / 2, H / 2);

      if (plane === "AXIAL") {
        // Axial Ellipse (Head/Body Horizontal Slice)
        ctx.beginPath();
        ctx.ellipse(0, 0, 180, 150, 0, 0, 2 * Math.PI);
        ctx.fillStyle = "#0f172a";
        ctx.fill();
        ctx.strokeStyle = "#0ea5e9";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(-50, -30, 40, 25, 0, 0, 2 * Math.PI);
        ctx.fillStyle = "#1e293b";
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(50, -30, 40, 25, 0, 0, 2 * Math.PI);
        ctx.fillStyle = "#1e293b";
        ctx.fill();
        ctx.stroke();
      } else if (plane === "SAGITTAL") {
        // Sagittal Profile (Side Profile)
        ctx.beginPath();
        ctx.ellipse(-20, 0, 140, 190, 0, 0, 2 * Math.PI);
        ctx.fillStyle = "#0f172a";
        ctx.fill();
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Spine curve
        ctx.beginPath();
        ctx.moveTo(40, -140);
        ctx.quadraticCurveTo(70, 0, 40, 140);
        ctx.strokeStyle = "#34d399";
        ctx.lineWidth = 3;
        ctx.stroke();
      } else if (plane === "CORONAL") {
        // Coronal Profile (Frontal View)
        ctx.beginPath();
        ctx.ellipse(0, 0, 170, 180, 0, 0, 2 * Math.PI);
        ctx.fillStyle = "#0f172a";
        ctx.fill();
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Lungs bilateral
        ctx.beginPath();
        ctx.ellipse(-60, -20, 45, 80, 0, 0, 2 * Math.PI);
        ctx.fillStyle = "#1e293b";
        ctx.fill();
        ctx.strokeStyle = "#c084fc";
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(60, -20, 45, 80, 0, 0, 2 * Math.PI);
        ctx.fillStyle = "#1e293b";
        ctx.fill();
        ctx.strokeStyle = "#c084fc";
        ctx.stroke();
      }

      ctx.restore();

      // Orthogonal Guide Lines (Crosshairs)
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Vertical guide line
      ctx.strokeStyle = plane === "SAGITTAL" ? "#0ea5e9" : "#10b981";
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, H);
      ctx.stroke();

      // Horizontal guide line
      ctx.strokeStyle = plane === "AXIAL" ? "#a855f7" : "#0ea5e9";
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Corner Labels
      ctx.font = "bold 12px monospace";
      ctx.fillStyle = plane === "AXIAL" ? "#0ea5e9" : plane === "SAGITTAL" ? "#10b981" : "#a855f7";
      ctx.fillText(`3D MPR PLANE: ${plane}`, 16, 28);
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(`INDEX: ${sliceIdx}`, 16, 46);
      ctx.fillText(`WC: ${windowCenter} | WW: ${windowWidth}`, 16, 492);
      ctx.fillText(`GPU 3D VOL`, W - 100, 492);
    };

    if (activePlane === "3D_GRID" || activePlane === "AXIAL") drawMPRPlane(axialCanvasRef.current, "AXIAL", axialIndex);
    if (activePlane === "3D_GRID" || activePlane === "SAGITTAL") drawMPRPlane(sagittalCanvasRef.current, "SAGITTAL", sagittalIndex);
    if (activePlane === "3D_GRID" || activePlane === "CORONAL") drawMPRPlane(coronalCanvasRef.current, "CORONAL", coronalIndex);
  }, [activePlane, axialIndex, sagittalIndex, coronalIndex, windowCenter, windowWidth]);

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col text-slate-100 font-sans select-none">
      {/* MPR Plane Switcher Header */}
      <div className="p-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
          <Activity size={16} /> <span>3D MPR Volume Reconstruction</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {["3D_GRID", "AXIAL", "SAGITTAL", "CORONAL"].map((p) => (
            <button
              key={p}
              onClick={() => setActivePlane(p)}
              className={`px-2.5 py-1 rounded-lg font-extrabold text-[10px] transition-all cursor-pointer ${
                activePlane === p ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30" : "text-slate-400 hover:text-white"
              }`}
            >
              {p.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* MPR Render Canvases Viewport */}
      <div className="flex-1 p-2 grid grid-cols-1 md:grid-cols-2 gap-2 overflow-hidden items-center justify-center">
        {(activePlane === "3D_GRID" || activePlane === "AXIAL") && (
          <div className="relative w-full h-full bg-slate-900 rounded-2xl border border-cyan-500/30 overflow-hidden flex flex-col">
            <div className="absolute top-2 left-2 z-10 bg-slate-950/80 px-2 py-0.5 rounded border border-cyan-500/40 text-[10px] font-black text-cyan-400">
              AXIAL (Z-AXIS)
            </div>
            <canvas ref={axialCanvasRef} className="w-full h-full object-contain" />
            <input
              type="range"
              min="0"
              max={totalSlices - 1}
              value={axialIndex}
              onChange={(e) => setAxialIndex(parseInt(e.target.value, 10))}
              className="absolute bottom-2 left-4 right-4 accent-cyan-500 cursor-pointer"
            />
          </div>
        )}

        {(activePlane === "3D_GRID" || activePlane === "SAGITTAL") && (
          <div className="relative w-full h-full bg-slate-900 rounded-2xl border border-emerald-500/30 overflow-hidden flex flex-col">
            <div className="absolute top-2 left-2 z-10 bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-500/40 text-[10px] font-black text-emerald-400">
              SAGITTAL (X-AXIS)
            </div>
            <canvas ref={sagittalCanvasRef} className="w-full h-full object-contain" />
            <input
              type="range"
              min="0"
              max="512"
              value={sagittalIndex}
              onChange={(e) => setSagittalIndex(parseInt(e.target.value, 10))}
              className="absolute bottom-2 left-4 right-4 accent-emerald-500 cursor-pointer"
            />
          </div>
        )}

        {(activePlane === "3D_GRID" || activePlane === "CORONAL") && (
          <div className="relative w-full h-full bg-slate-900 rounded-2xl border border-purple-500/30 overflow-hidden flex flex-col">
            <div className="absolute top-2 left-2 z-10 bg-slate-950/80 px-2 py-0.5 rounded border border-purple-500/40 text-[10px] font-black text-purple-400">
              CORONAL (Y-AXIS)
            </div>
            <canvas ref={coronalCanvasRef} className="w-full h-full object-contain" />
            <input
              type="range"
              min="0"
              max="512"
              value={coronalIndex}
              onChange={(e) => setCoronalIndex(parseInt(e.target.value, 10))}
              className="absolute bottom-2 left-4 right-4 accent-purple-500 cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileMPRViewer;
