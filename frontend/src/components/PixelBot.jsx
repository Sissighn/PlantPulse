import React from "react";
import "./PixelBot.css"; // Wir brauchen das dazugehörige CSS

export const PixelBot = () => {
  return (
    <div className="bot-container">
      <div className="bot">
        {/* Der Kopf */}
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

        {/* Der Körper */}
        <div className="body-section">
          {/* Linker Arm (statisch hängend) */}
          <div className="arm left"></div>
          {/* Der Rumpf */}
          <div className="torso">
            <div className="chest-detail"></div>
          </div>
          {/* Rechter Arm (winkend - jetzt höher positioniert) */}
          <div className="arm right waving-arm"></div>
        </div>

        {/* Füße */}
        <div className="feet-section">
          <div className="foot"></div>
          <div className="foot"></div>
        </div>
      </div>
    </div>
  );
};
