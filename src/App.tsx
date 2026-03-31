import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sprout, Search, Bell, User, LayoutDashboard, Map as MapIcon, FileText, Settings, HelpCircle } from 'lucide-react';
import MapView from './components/MapView';
import Weather from './components/Weather';
import InputPanel from './components/InputPanel';
import Prediction from './components/Prediction';
import Report from './components/Report';
import { generateAgroReport, generateSatelliteImage } from './services/gemini';

export default function App() {
  const [location, setLocation] = useState({ lat: 37.7749, lng: -122.4194, address: 'San Francisco, CA' });
  const [weather, setWeather] = useState({ temp: 24, humidity: 65, rainfall: 12, condition: 'Partly Cloudy' });
  const [soil, setSoil] = useState({ n: 80, p: 45, k: 40, ph: 6.5, moist: 45, crop: 'Corn', fertilizer: 'Urea' });
  const [satellite, setSatellite] = useState({
    vegetation: 65,
    water: 10,
    soil: 20,
    urban: 5
  });
  const [area, setArea] = useState<number | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        setLocation({ lat: newLat, lng: newLng, address: display_name });
        
        // Also update weather for new location
        const weatherRes = await fetch(`/api/weather?lat=${newLat}&lng=${newLng}`);
        const weatherData = await weatherRes.json();
        setWeather(weatherData);

        // Simulate satellite data change based on location
        setSatellite({
          vegetation: Math.floor(Math.random() * 40) + 40,
          water: Math.floor(Math.random() * 20),
          soil: Math.floor(Math.random() * 30),
          urban: Math.floor(Math.random() * 15)
        });
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const fetchInitialData = async () => {
    try {
      const locRes = await fetch('/api/location');
      const locData = await locRes.json();
      setLocation(locData);

      const weatherRes = await fetch(`/api/weather?lat=${locData.lat}&lng=${locData.lng}`);
      const weatherData = await weatherRes.json();
      setWeather(weatherData);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const handlePredict = async () => {
    setLoading(true);
    setShowReport(false);
    try {
      // Mapping logic for the RTX-Trained Cloud Model
      const cropMapping: Record<string, number> = { 'Corn': 15, 'Wheat': 1, 'Rice': 2, 'Soybean': 3 };
      const fertMapping: Record<string, number> = { 'Urea': 2, 'DAP': 1, 'NPK 10-26-26': 3, 'Organic': 4 };
      
      const payload = {
        n: soil.n,
        p: soil.p,
        k: soil.k,
        temp: weather.temp,
        ph: soil.ph,
        rain: weather.rainfall,
        moist: soil.moist,
        fert: fertMapping[soil.fertilizer] || 2,
        soil: 1, // Defaulting to 1 (Sandy/Loamy) as per user example
        crop: cropMapping[soil.crop] || 15
      };

      const predRes = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const rawData = await predRes.json();
      
      if (rawData.error) {
        throw new Error(rawData.error);
      }
      
      // Transform API response to match UI expectations
      const predData = {
        yield: Math.round(rawData.yield * 100),
        risk: rawData.risk > 0.7 ? 'High' : rawData.risk > 0.4 ? 'Medium' : 'Low',
        efficiency: Math.round((1 - rawData.risk) * 100), // Derived efficiency
        engine: rawData.engine
      };

      setPrediction(predData);

      // Generate AI Report using Gemini
      const aiReport = await generateAgroReport({
        location,
        soil,
        weather,
        prediction: predData,
        satellite,
        area,
      });

      // Generate Satellite Image using Gemini
      const satelliteImage = await generateSatelliteImage({
        location,
        soil,
        ai: aiReport,
      });

      setReportData({
        location,
        soil,
        weather,
        prediction: predData,
        ai: aiReport,
        satellite,
        image: satelliteImage,
      });
      setShowReport(true);
    } catch (error) {
      console.error('Prediction error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-brand-bg text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 border-r border-white/10 flex flex-col items-center lg:items-stretch py-8 px-4 gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-brand-green rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <Sprout className="text-brand-bg w-6 h-6" />
          </div>
          <span className="hidden lg:block text-xl font-black tracking-tighter">AGRO<span className="text-brand-green">TWIN</span></span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { icon: LayoutDashboard, label: 'Dashboard', active: true },
            { icon: MapIcon, label: 'Farm Maps' },
            { icon: FileText, label: 'Reports' },
            { icon: Settings, label: 'Settings' },
            { icon: HelpCircle, label: 'Support' },
          ].map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${item.active ? 'bg-white/10 text-brand-green' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="hidden lg:block font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="lg:glass-card p-4 rounded-2xl hidden lg:block">
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">System Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
            <span className="text-xs font-medium">AI Engine Online</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 shrink-0">
          <form onSubmit={handleSearch} className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-full border border-white/10 w-96 focus-within:border-brand-green/50 transition-all">
            <Search className="w-4 h-4 text-white/30" />
            <input 
              type="text" 
              placeholder="Search farm locations..." 
              className="bg-transparent border-none outline-none text-sm w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-white/40 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-red rounded-full border-2 border-brand-bg" />
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold">Mohammed K.</p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Premium Plan</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-brand-green p-[2px]">
                <div className="w-full h-full rounded-full bg-brand-bg flex items-center justify-center overflow-hidden">
                  <User className="w-6 h-6 text-white/40" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Scroll Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left: Map */}
              <div className="lg:w-[60%] h-[500px] lg:h-auto min-h-[500px]">
                <MapView
                  lat={location.lat}
                  lng={location.lng}
                  onLocationSelect={(lat, lng) => setLocation(prev => ({ ...prev, lat, lng }))}
                  onAreaSelect={(a) => setArea(a)}
                />
              </div>

              {/* Right: Controls & Weather */}
              <div className="lg:w-[40%] space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Weather data={weather} />
                  
                  {/* Satellite Indicators Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-4 flex flex-col justify-between min-h-[120px]"
                  >
                    <div className="flex items-center gap-2 text-brand-blue text-[10px] font-bold uppercase tracking-widest mb-3">
                      <MapIcon className="w-4 h-4" />
                      Satellite Indicators
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {[
                        { label: 'Veg', value: satellite.vegetation, color: 'bg-brand-green' },
                        { label: 'Water', value: satellite.water, color: 'bg-brand-blue' },
                        { label: 'Soil', value: satellite.soil, color: 'bg-brand-yellow' },
                        { label: 'Urban', value: satellite.urban, color: 'bg-white/40' },
                      ].map((item) => (
                        <div key={item.label} className="space-y-1">
                          <div className="flex justify-between text-[8px] uppercase text-white/40">
                            <span>{item.label}</span>
                            <span className="text-white">{item.value}%</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${item.color}`} 
                              style={{ width: `${item.value}%` }} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                <InputPanel
                  values={soil}
                  onChange={(name, val) => setSoil(prev => ({ ...prev, [name]: val }))}
                  onPredict={handlePredict}
                  loading={loading}
                />
                {prediction && <Prediction data={prediction} />}
              </div>
            </div>

            {/* AI Report Section */}
            <Report data={reportData} visible={showReport} />
          </div>
        </div>
      </main>
    </div>
  );
}
