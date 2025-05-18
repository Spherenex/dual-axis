import React, { useState, useEffect } from 'react';
import { database } from '../firebase'; // Adjust the import path as necessary
import { ref, onValue } from 'firebase/database';
import './ElectricalDashboard.css';

const ElectricalDashboard = () => {
  const [current, setCurrent] = useState(0); // Amps
  const [voltage, setVoltage] = useState(0); // Volts
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const environmentDataRef = ref(database, 'Environment_Data1');
    
    const unsubscribe = onValue(environmentDataRef, (snapshot) => {
      setLoading(true);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.Current !== undefined) setCurrent(data.Current);
        if (data.Voltage !== undefined) setVoltage(data.Voltage);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError("No data available in Firebase");
        console.error("No data available in Firebase");
      }
      
      setLoading(false);
    }, (error) => {
      setError("Error fetching data: " + error.message);
      console.error("Error fetching data:", error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const calculateBatteryPercentage = (volts) => {
    return 100;
  };

  const batteryPercentage = calculateBatteryPercentage(voltage);

  const currentRotation = (current / 0.5) * 180; // 0-0.5 Amps maps to 0-180 degrees
  const voltageRotation = (voltage / 1) * 180; // 0-1 Volts maps to 0-180 degrees

  const getBatteryColor = (percentage) => {
    if (percentage <= 20) return '#ff4d4d';
    if (percentage <= 50) return '#ffaa00';
    return '#44cc44';
  };

  const batteryColor = getBatteryColor(batteryPercentage);
  const batteryWidth = `${batteryPercentage * 1.12}px`;

  return (
    <div className="dashboard">
      <div className="header">
        <h1>Dashboard</h1>
      </div>
      
      <div className="metrics-container">
        {/* Current Metric Card */}
        <div className="metric-card">
          <div className="metric-title">
            <i className="fas fa-bolt metric-icon"></i> Current
          </div>
          <div className="gauge">
            <div className="gauge-background"></div>
            <div 
              className="gauge-fill current-gauge"
              style={{ transform: `rotate(${currentRotation}deg)` }}
            ></div>
            <div className="gauge-cover"></div>
            <div className="gauge-center"></div>
          </div>
          <div className="metric-value">{current.toFixed(2)}</div>
          <div className="metric-unit">Amps</div>
        </div>
        
        {/* Voltage Metric Card */}
        <div className="metric-card">
          <div className="metric-title">
            <i className="fas fa-plug metric-icon"></i> Voltage
          </div>
          <div className="gauge">
            <div className="gauge-background"></div>
            <div 
              className="gauge-fill voltage-gauge"
              style={{ transform: `rotate(${voltageRotation}deg)` }}
            ></div>
            <div className="gauge-cover"></div>
            <div className="gauge-center"></div>
          </div>
          <div className="metric-value">{voltage.toFixed(2)}</div>
          <div className="metric-unit">Volts</div>
        </div>
        
        {/* Battery Percentage Card */}
        <div className="metric-card">
          <div className="metric-title">
            <i className="fas fa-battery-full metric-icon"></i> Battery Level
          </div>
          <div className="battery-container">
            <div className="battery-body"></div>
            <div className="battery-tip"></div>
            <div 
              className="battery-fill"
              style={{
                width: batteryWidth,
                backgroundColor: batteryColor
              }}
            ></div>
          </div>
          <div className="metric-value">100</div>
          <div className="metric-unit">Percent</div>
        </div>
      </div>
    </div>
  );
};

export default ElectricalDashboard;