import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import * as cam from '@mediapipe/camera_utils';
import * as controls from '@mediapipe/control_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import * as holistics from '@mediapipe/holistic';

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const connect = window.drawConnectors;
  var camera = null;

  const onResults = async (model) => {
    if (typeof webcamRef.current !== "undefined" && webcamRef.current !== null && webcamRef.current.video.readyState === 4) {
      const video = webcamRef.current.video;

      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const ctx = canvasRef.current.getContext("2d");
      ctx.save();

      ctx.clearRect(0, 0, videoWidth, videoHeight);
      //ctx.drawImage(model.segmentationMask, 0, 0, videoWidth, videoHeight);
      ctx.globalCompositeOperation = "source-in";
      ctx.fillStyle = "#00FF00";
      ctx.fillRect(0, 0, videoWidth, videoHeight);

      ctx.globalCompositeOperation = "destination-atop";
      ctx.drawImage(model.image, 0, 0, videoWidth, videoHeight);

      ctx.globalCompositeOperation = "source-over";
      drawConnectors(ctx, model.poseLandmarks, holistics.POSE_CONNECTIONS, { color: '#C0C0C070', lineWidth: 4 });
      drawLandmarks(ctx, model.poseLandmarks, { color: '#FF0000', lineWidth: 2 });
      drawConnectors(ctx, model.faceLandmarks, holistics.FACEMESH_TESSELATION,
        { color: '#C0C0C070', lineWidth: 1 });
      drawConnectors(ctx, model.leftHandLandmarks, holistics.HAND_CONNECTIONS,
        { color: '#CC0000', lineWidth: 5 });
      drawLandmarks(ctx, model.leftHandLandmarks,
        { color: '#00FF00', lineWidth: 1 });
      drawConnectors(ctx, model.rightHandLandmarks, holistics.HAND_CONNECTIONS,
        { color: '#00CC00', lineWidth: 5 });
      drawLandmarks(ctx, model.rightHandLandmarks,
        { color: '#FF0000', lineWidth: 1 });


      ctx.restore();
    }
  };



  useEffect(() => {
    const holistic = new holistics.Holistic({locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
    }});

    holistic.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: true,
      smoothSegmentation: true,
      refineFaceLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    holistic.onResults(onResults);

    if (typeof webcamRef.current !== "undefined" && webcamRef.current !== null) {
      camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await holistic.send({ image: webcamRef.current.video })
        },
        width: 1280,
        height: 900
      });
      camera.start();
    }
  });


  return (
    <div>
      <Webcam
        ref={webcamRef}
        audio={false}
        id="img"
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zindex: 9,
          width: 1280,
          height: 900
        }}
      />

      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zindex: 9,
          width: 1280,
          height: 900
        }}
        id="myCanvas"
      />
    </div>
  );
}

export default App;
