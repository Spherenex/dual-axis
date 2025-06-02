// import React, { useState, useEffect } from 'react';
// import { database } from '../firebase'; // Adjust the import path as necessary
// import { ref, onValue } from 'firebase/database';
// import './ElectricalDashboard.css';

// const ElectricalDashboard = () => {
//   const [current, setCurrent] = useState(0); // Amps
//   const [voltage, setVoltage] = useState(0); // Volts
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [lastUpdated, setLastUpdated] = useState(null);

//   useEffect(() => {
//     const environmentDataRef = ref(database, 'Environment_Data1');
    
//     const unsubscribe = onValue(environmentDataRef, (snapshot) => {
//       setLoading(true);
      
//       if (snapshot.exists()) {
//         const data = snapshot.val();
//         if (data.Current !== undefined) setCurrent(data.Current);
//         if (data.Voltage !== undefined) setVoltage(data.Voltage);
//         setLastUpdated(new Date());
//         setError(null);
//       } else {
//         setError("No data available in Firebase");
//         console.error("No data available in Firebase");
//       }
      
//       setLoading(false);
//     }, (error) => {
//       setError("Error fetching data: " + error.message);
//       console.error("Error fetching data:", error);
//       setLoading(false);
//     });
    
//     return () => unsubscribe();
//   }, []);

//   const calculateBatteryPercentage = (volts) => {
//     return 100;
//   };

//   const batteryPercentage = calculateBatteryPercentage(voltage);

//   const currentRotation = (current / 0.5) * 180; // 0-0.5 Amps maps to 0-180 degrees
//   const voltageRotation = (voltage / 1) * 180; // 0-1 Volts maps to 0-180 degrees

//   const getBatteryColor = (percentage) => {
//     if (percentage <= 20) return '#ff4d4d';
//     if (percentage <= 50) return '#ffaa00';
//     return '#44cc44';
//   };

//   const batteryColor = getBatteryColor(batteryPercentage);
//   const batteryWidth = `${batteryPercentage * 1.12}px`;

//   return (
//     <div className="dashboard">
//       <div className="header">
//         <h1>Dashboard</h1>
//       </div>
      
//       <div className="metrics-container">
//         {/* Current Metric Card */}
//         <div className="metric-card">
//           <div className="metric-title">
//             <i className="fas fa-bolt metric-icon"></i> Current
//           </div>
//           <div className="gauge">
//             <div className="gauge-background"></div>
//             <div 
//               className="gauge-fill current-gauge"
//               style={{ transform: `rotate(${currentRotation}deg)` }}
//             ></div>
//             <div className="gauge-cover"></div>
//             <div className="gauge-center"></div>
//           </div>
//           <div className="metric-value">{current.toFixed(2)}</div>
//           <div className="metric-unit">Amps</div>
//         </div>
        
//         {/* Voltage Metric Card */}
//         <div className="metric-card">
//           <div className="metric-title">
//             <i className="fas fa-plug metric-icon"></i> Voltage
//           </div>
//           <div className="gauge">
//             <div className="gauge-background"></div>
//             <div 
//               className="gauge-fill voltage-gauge"
//               style={{ transform: `rotate(${voltageRotation}deg)` }}
//             ></div>
//             <div className="gauge-cover"></div>
//             <div className="gauge-center"></div>
//           </div>
//           <div className="metric-value">{voltage.toFixed(2)}</div>
//           <div className="metric-unit">Volts</div>
//         </div>
        
//         {/* Battery Percentage Card */}
//         <div className="metric-card">
//           <div className="metric-title">
//             <i className="fas fa-battery-full metric-icon"></i> Battery Level
//           </div>
//           <div className="battery-container">
//             <div className="battery-body"></div>
//             <div className="battery-tip"></div>
//             <div 
//               className="battery-fill"
//               style={{
//                 width: batteryWidth,
//                 backgroundColor: batteryColor
//               }}
//             ></div>
//           </div>
//           <div className="metric-value">100</div>
//           <div className="metric-unit">Percent</div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ElectricalDashboard;

import React, { useState, useEffect } from 'react';
import { database } from '../firebase'; // Adjust the import path as necessary
import { ref, onValue } from 'firebase/database';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './ElectricalDashboard.css';

const ElectricalDashboard = () => {
  const [current, setCurrent] = useState(0); // Amps
  const [voltage, setVoltage] = useState(0); // Volts
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [historicalData, setHistoricalData] = useState([]);
  
  // Solar information (these would ideally come from an API)
  const [sunrise, setSunrise] = useState(new Date().setHours(6, 30, 0));
  const [sunset, setSunset] = useState(new Date().setHours(18, 45, 0));

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const environmentDataRef = ref(database, 'Environment_Data1');
    
    const unsubscribe = onValue(environmentDataRef, (snapshot) => {
      setLoading(true);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Limit the current to 1A maximum
        const newCurrent = data.Current !== undefined ? Math.min(data.Current, 1) : current;
        // Limit the voltage to 12V maximum
        const newVoltage = data.Voltage !== undefined ? Math.min(data.Voltage, 12) : voltage;
        
        setCurrent(newCurrent);
        setVoltage(newVoltage);
        
        // Calculate power (watts)
        const power = newCurrent * newVoltage;
        
        // Add new data point to historical data (limit to last 20 points)
        const timestamp = new Date().toLocaleTimeString();
        setHistoricalData(prevData => {
          const newData = [
            ...prevData,
            {
              time: timestamp,
              voltage: newVoltage,
              current: newCurrent,
              power: power
            }
          ];
          
          // Keep only last 20 data points
          if (newData.length > 20) {
            return newData.slice(newData.length - 20);
          }
          return newData;
        });
        
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
  }, [current, voltage]);

  const calculateBatteryPercentage = (volts) => {
    return 100;
  };

  const batteryPercentage = calculateBatteryPercentage(voltage);

  // Adjust rotation calculations to use the capped values
  // For current: 0-1 Amps maps to 0-180 degrees
  const currentRotation = (Math.min(current, 1) / 1) * 180;
  // For voltage: 0-12 Volts maps to 0-180 degrees
  const voltageRotation = (Math.min(voltage, 12) / 12) * 180;
  
  // Calculate power (watts) using the actual values (even if display is capped)
  const power = current * voltage;

  const getBatteryColor = (percentage) => {
    if (percentage <= 20) return '#e74c3c';
    if (percentage <= 50) return '#f39c12';
    return '#2ecc71';
  };

  const batteryColor = getBatteryColor(batteryPercentage);
  const batteryWidth = `${batteryPercentage}%`;
  
  // Solar tracking visualization
  const getDayProgress = () => {
    const now = currentTime;
    const sunriseTime = new Date(sunrise);
    const sunsetTime = new Date(sunset);
    
    // If it's before sunrise or after sunset, it's night time
    if (now < sunriseTime || now > sunsetTime) {
      return 'night';
    }
    
    // Calculate percentage of day passed
    const dayLength = sunsetTime - sunriseTime;
    const timePassedSinceSunrise = now - sunriseTime;
    const percentOfDayPassed = (timePassedSinceSunrise / dayLength) * 100;
    
    return {
      percentOfDayPassed,
      isDaytime: true
    };
  };
  
  const dayProgress = getDayProgress();
  
  // Format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format sunrise/sunset times
  const formattedSunrise = formatTime(new Date(sunrise));
  const formattedSunset = formatTime(new Date(sunset));

  // Function to get display values with caps
  const getDisplayValue = (value, max) => {
    return Math.min(value, max).toFixed(2);
  };

  return (
    <div className="dashboard">
      <div className="header">
        <h1>Solar Energy Dashboard</h1>
        <div className="realtime-clock">
          <div className="clock-time">{currentTime.toLocaleTimeString()}</div>
          <div className="clock-date">{currentTime.toLocaleDateString()}</div>
        </div>
        
        {loading && <div className="loading-indicator">Updating data...</div>}
        {error && <div className="error-message">{error}</div>}
        {lastUpdated && !loading && (
          <div className="last-updated">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>
      
      <div className="solar-tracking-section">
        <h2>Real-Time Solar Tracking</h2>
        <div className="sun-position-container">
          <div className="sun-path">
            <div 
              className="sun-indicator" 
              style={{ 
                left: typeof dayProgress === 'object' ? `${dayProgress.percentOfDayPassed}%` : '0%',
                display: typeof dayProgress === 'object' ? 'block' : 'none'
              }}
            ></div>
            <div className="horizon-line"></div>
            <div className="sunrise-marker">
              <div className="marker"></div>
              <div className="time">{formattedSunrise}</div>
            </div>
            <div className="sunset-marker">
              <div className="marker"></div>
              <div className="time">{formattedSunset}</div>
            </div>
          </div>
          <div className="day-status">
            {typeof dayProgress === 'object' ? 'Daytime' : 'Nighttime'}
          </div>
        </div>
      </div>
      
      <div className="metrics-container">
        {/* Current Metric Card */}
        <div className="metric-card">
          <div className="metric-title">Current</div>
          <div className="gauge">
            <div className="gauge-background"></div>
            <div 
              className="gauge-fill current-gauge"
              style={{ transform: `rotate(${currentRotation}deg)` }}
            ></div>
            <div className="gauge-cover"></div>
            <div className="gauge-center"></div>
          </div>
          <div className="metric-value">{getDisplayValue(current, 1)}</div>
          <div className="metric-unit">Amps</div>
          <div className="data-source">Live Feed</div>
        </div>
        
        {/* Voltage Metric Card */}
        <div className="metric-card">
          <div className="metric-title">Voltage</div>
          <div className="gauge">
            <div className="gauge-background"></div>
            <div 
              className="gauge-fill voltage-gauge"
              style={{ transform: `rotate(${voltageRotation}deg)` }}
            ></div>
            <div className="gauge-cover"></div>
            <div className="gauge-center"></div>
          </div>
          <div className="metric-value">{getDisplayValue(voltage, 12)}</div>
          <div className="metric-unit">Volts</div>
          <div className="data-source">Live Feed</div>
        </div>
        
        {/* Power (Watts) Metric Card */}
        <div className="metric-card">
          <div className="metric-title">Power</div>
          <div className="power-display">
            <div className="power-value">{power.toFixed(2)}</div>
            <div className="power-unit">Watts</div>
          </div>
          <div className="calculation-note">Calculated from current × voltage</div>
          <div className="data-source">Calculated Value</div>
        </div>
        
        {/* Battery Percentage Card */}
        <div className="metric-card">
          <div className="metric-title">Battery Level</div>
          <div className="battery-container">
            <div className="battery-body"></div>
            <div className="battery-tip"></div>
            <div 
              className="battery-fill"
              style={{
                width: 85,
                backgroundColor: batteryColor
              }}
            ></div>
          </div>
          <div className="metric-value">85</div>
          <div className="metric-unit">Percent</div>
          <div className="data-source">Live Feed</div>
        </div>
      </div>
      
      {/* Graphs Section */}
      <div className="graphs-container">
        <div className="graph-card">
          <h3>Voltage History</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="voltage" 
                stroke="#2ecc71" 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="graph-card">
          <h3>Current History</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="current" 
                stroke="#3498db" 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="graph-card">
          <h3>Power Generation</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="power" 
                stroke="#f39c12" 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ElectricalDashboard;