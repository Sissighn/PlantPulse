import React from "react";
import "./PixelBot.css";

export const PixelBot = () => {
  return (
    <div className="bot-container">
      <div className="bot">
        <div className="head">
          <div className="sprout">
            <div className="leaf left"></div>
            <div className="leaf right"></div>
            <div className="stem"></div>
          </div>
          <div className="face">
            <div className="eyes-container">
              <div className="eye left">
                <div className="eye-glare"></div>
              </div>
              <div className="eye right">
                <div className="eye-glare"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="body-section">
          <div className="arm left"></div>
          <div className="torso">
            <div className="chest-detail"></div>
          </div>
          <div className="arm right waving-arm"></div>
        </div>

        <div className="feet-section">
          <div className="foot"></div>
          <div className="foot"></div>
        </div>
      </div>
    </div>
  );
};
