import React from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface CircularProgressBarProps {
  percentage: number;
}

const CircularProgress: React.FC<CircularProgressBarProps> = ({ percentage }) => {
  return (
    <div style={{ width: '150px', height: '150px' }}>
      <CircularProgressbar
        value={percentage}
        text={`${percentage.toFixed(2)}%`}
        strokeWidth={10}
        styles={{
          path: {
            stroke: '#4caf50',
            strokeLinecap: 'round',
          },
          trail: {
            stroke: '#d6d6d6',
          },
          text: {
            fill: '#4caf50',
            fontSize: '16px',
            fontWeight: 'bold',
          },
        }}
      />
    </div>
  );
};

export default CircularProgress;