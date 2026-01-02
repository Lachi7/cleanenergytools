import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { MapPin, Zap, Grid3x3, FileText, TrendingUp, Award, Info, Download, GitCompare, X } from 'lucide-react';

const regions = [
  {
    name: "Absheron",
    P: 85, G: 90, R: 88, H: 82,
    details: { solar: "High", wind: "Excellent (coastal)", grid: "Excellent proximity", projects: "Multiple completed" }
  },
  {
    name: "Ganja-Gazakh",
    P: 78, G: 75, R: 80, H: 70,
    details: { solar: "Very High", wind: "Moderate", grid: "Good connectivity", projects: "Several ongoing" }
  },
  {
    name: "Sheki-Zagatala",
    P: 65, G: 60, R: 72, H: 55,
    details: { solar: "Moderate", wind: "Low", grid: "Limited access", projects: "Few historical" }
  },
  {
    name: "Lankaran",
    P: 72, G: 65, R: 70, H: 58,
    details: { solar: "High", wind: "Moderate (coastal)", grid: "Moderate access", projects: "Some completed" }
  },
  {
    name: "Guba-Khachmaz",
    P: 80, G: 70, R: 75, H: 65,
    details: { solar: "High", wind: "Good (coastal)", grid: "Good proximity", projects: "Moderate track record" }
  },
  {
    name: "Shirvan-Salyan",
    P: 88, G: 72, R: 78, H: 68,
    details: { solar: "Excellent", wind: "Very Good (semi-arid)", grid: "Good infrastructure", projects: "Growing portfolio" }
  },
  {
    name: "Nakhchivan",
    P: 82, G: 55, R: 68, H: 52,
    details: { solar: "Excellent", wind: "Good", grid: "Limited connectivity", projects: "Limited experience" }
  }
];

const calculateCERS = (region) => {
  return (region.P * 0.35 + region.G * 0.25 + region.R * 0.25 + region.H * 0.15).toFixed(1);
};

const getReadinessLevel = (score) => {
  if (score >= 75) return { level: "High Readiness", color: "text-green-600", bg: "bg-green-100", recommendation: "Priority for immediate public funding" };
  if (score >= 55) return { level: "Moderate Readiness", color: "text-yellow-600", bg: "bg-yellow-100", recommendation: "Conditional funding or preparatory support" };
  return { level: "Low Readiness", color: "text-red-600", bg: "bg-red-100", recommendation: "Not ready for funding; enabling actions required" };
};

export default function CleanEnergyTool() {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [view, setView] = useState('dashboard');
  const [compareMode, setCompareMode] = useState(false);
  const [compareRegions, setCompareRegions] = useState([]);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const enrichedRegions = useMemo(() => {
    return regions.map(r => ({
      ...r,
      CERS: parseFloat(calculateCERS(r)),
      readiness: getReadinessLevel(parseFloat(calculateCERS(r)))
    })).sort((a, b) => b.CERS - a.CERS);
  }, []);

  const chartData = enrichedRegions.map(r => ({
    name: r.name,
    CERS: r.CERS,
    'Renewable Potential': r.P,
    'Grid Access': r.G,
    'Regulatory': r.R,
    'Implementation': r.H
  }));

  const radarData = selectedRegion ? [
    { indicator: 'Renewable Potential (35%)', value: selectedRegion.P, fullMark: 100 },
    { indicator: 'Grid Access (25%)', value: selectedRegion.G, fullMark: 100 },
    { indicator: 'Regulatory (25%)', value: selectedRegion.R, fullMark: 100 },
    { indicator: 'Implementation (15%)', value: selectedRegion.H, fullMark: 100 }
  ] : [];

  const toggleCompareRegion = (region) => {
    if (compareRegions.find(r => r.name === region.name)) {
      setCompareRegions(compareRegions.filter(r => r.name !== region.name));
    } else if (compareRegions.length < 3) {
      setCompareRegions([...compareRegions, region]);
    }
  };

  const exportToCSV = () => {
    const headers = ['Rank', 'Region', 'CERS', 'Renewable Potential (P)', 'Grid Access (G)', 'Regulatory (R)', 'Implementation (H)', 'Readiness Level', 'Recommendation'];
    const rows = enrichedRegions.map((r, idx) => [
      idx + 1,
      r.name,
      r.CERS,
      r.P,
      r.G,
      r.R,
      r.H,
      r.readiness.level,
      r.readiness.recommendation
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clean_energy_readiness_scores.csv';
    a.click();
    setShowExportMenu(false);
  };

  const exportToJSON = () => {
    const data = enrichedRegions.map((r, idx) => ({
      rank: idx + 1,
      region: r.name,
      CERS: r.CERS,
      indicators: {
        renewablePotential: r.P,
        gridAccess: r.G,
        regulatory: r.R,
        implementation: r.H
      },
      readiness: {
        level: r.readiness.level,
        recommendation: r.readiness.recommendation
      },
      details: r.details
    }));
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clean_energy_readiness_scores.json';
    a.click();
    setShowExportMenu(false);
  };

  const exportReport = () => {
    const report = `
CLEAN ENERGY FUNDING PRIORITIZATION TOOL - REGIONAL ANALYSIS REPORT
Generated: ${new Date().toLocaleDateString()}
============================================================================

SUMMARY STATISTICS
- Total Regions Analyzed: ${enrichedRegions.length}
- High Readiness Regions (CERS ≥ 75): ${enrichedRegions.filter(r => r.CERS >= 75).length}
- Moderate Readiness Regions (CERS 55-74): ${enrichedRegions.filter(r => r.CERS >= 55 && r.CERS < 75).length}
- Low Readiness Regions (CERS < 55): ${enrichedRegions.filter(r => r.CERS < 55).length}

REGIONAL RANKINGS
============================================================================
${enrichedRegions.map((r, idx) => `
${idx + 1}. ${r.name}
   Overall CERS: ${r.CERS}
   - Renewable Potential (35%): ${r.P}
   - Grid & Infrastructure (25%): ${r.G}
   - Regulatory Readiness (25%): ${r.R}
   - Implementation History (15%): ${r.H}
   
   Readiness Level: ${r.readiness.level}
   Recommendation: ${r.readiness.recommendation}
   
   Regional Details:
   - Solar Potential: ${r.details.solar}
   - Wind Potential: ${r.details.wind}
   - Grid Status: ${r.details.grid}
   - Project Track Record: ${r.details.projects}
`).join('\n')}

METHODOLOGY
============================================================================
CERS = (P × 0.35) + (G × 0.25) + (R × 0.25) + (H × 0.15)

Where:
P = Renewable Energy Potential (35% weight)
G = Grid & Infrastructure Accessibility (25% weight)
R = Regulatory & Policy Readiness (25% weight)
H = Historical Implementation Capacity (15% weight)

SCORE INTERPRETATION
- 75-100: High Readiness → Priority for immediate public funding
- 55-74: Moderate Readiness → Conditional funding or preparatory support
- Below 55: Low Readiness → Not ready for funding; enabling actions required

============================================================================
CECECO Clean Energy Hackathon 2026
Supporting Azerbaijan's 2030 Clean Energy Goals
    `.trim();
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clean_energy_readiness_report.txt';
    a.click();
    setShowExportMenu(false);
  };

  const comparisonRadarData = compareRegions.length > 0 ? [
    { indicator: 'Renewable\nPotential', ...Object.fromEntries(compareRegions.map(r => [r.name, r.P])) },
    { indicator: 'Grid\nAccess', ...Object.fromEntries(compareRegions.map(r => [r.name, r.G])) },
    { indicator: 'Regulatory\nReadiness', ...Object.fromEntries(compareRegions.map(r => [r.name, r.R])) },
    { indicator: 'Implementation\nHistory', ...Object.fromEntries(compareRegions.map(r => [r.name, r.H])) }
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50" style={{ fontFamily: "'Open Sans', sans-serif" }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Zap className="w-6 h-6 sm:w-8 sm:h-8" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Clean Energy Funding Prioritization Tool</h1>
          </div>
          <p className="text-sm sm:text-base text-blue-100">Data-Driven Regional Investment Planning for Azerbaijan's Clean Energy Transition</p>
          <div className="mt-4 flex flex-wrap gap-2 sm:gap-4">
            <button 
              onClick={() => setView('dashboard')}
              className={`px-3 sm:px-4 py-2 rounded-lg transition text-sm sm:text-base ${view === 'dashboard' ? 'bg-white text-blue-600' : 'bg-blue-700 hover:bg-blue-800'}`}
            >
              <span className="hidden sm:inline">Regional Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </button>
            <button 
              onClick={() => setView('methodology')}
              className={`px-3 sm:px-4 py-2 rounded-lg transition text-sm sm:text-base ${view === 'methodology' ? 'bg-white text-blue-600' : 'bg-blue-700 hover:bg-blue-800'}`}
            >
              Methodology
            </button>
            <button 
              onClick={() => {
                setView('dashboard');
                setCompareMode(!compareMode);
                if (!compareMode) setCompareRegions([]);
              }}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${compareMode ? 'bg-white text-blue-600' : 'bg-blue-700 hover:bg-blue-800'}`}
            >
              <GitCompare className="w-4 h-4" />
              <span className="hidden sm:inline">Compare Regions</span>
              <span className="sm:hidden">Compare</span>
            </button>
            <div className="relative ml-auto">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-3 sm:px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition flex items-center gap-2 text-sm sm:text-base"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export Data</span>
                <span className="sm:hidden">Export</span>
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-xl z-50 border">
                  <div className="py-2">
                    <button 
                      onClick={exportToCSV}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition  text-blue-600 hover:text-blue-800"
                    >
                      Export as CSV
                    </button>
                    <button 
                      onClick={exportToJSON}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition  text-blue-600 hover:text-blue-800"
                    >
                      Export as JSON
                    </button>
                    <button 
                      onClick={exportReport}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition  text-blue-600 hover:text-blue-800"
                    >
                      <span className="hidden sm:inline">Export Full Report (TXT)</span>
                      <span className="sm:inline md:hidden">Full Report (TXT)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {view === 'dashboard' ? (
          <>
            {/* Compare Mode Banner */}
            {compareMode && (
              <div className="bg-blue-600 text-white rounded-lg shadow-lg p-3 sm:p-4 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <GitCompare className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm sm:text-base">Comparison Mode Active</p>
                      <p className="text-xs sm:text-sm text-blue-100">Select up to 3 regions ({compareRegions.length}/3)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {compareRegions.length > 0 && (
                      <button
                        onClick={() => setCompareRegions([])}
                        className="px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded text-xs sm:text-sm transition flex-1 sm:flex-initial"
                      >
                        Clear All
                      </button>
                    )}
                    <button
                      onClick={() => setCompareMode(false)}
                      className="px-3 py-1 bg-white text-blue-600 hover:bg-gray-100 rounded text-xs sm:text-sm transition flex-1 sm:flex-initial"
                    >
                      Exit Compare
                    </button>
                  </div>
                </div>
                {compareRegions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {compareRegions.map(r => (
                      <span key={r.name} className="bg-blue-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-2">
                        {r.name}
                        <button onClick={() => toggleCompareRegion(r)} className="hover:text-blue-200">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Comparison View */}
            {compareMode && compareRegions.length >= 2 && (
              <div className="bg-white rounded-lg shadow-lg mb-6 sm:mb-8">
                <div className="p-4 sm:p-6 border-b">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Regional Comparison</h2>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">Side-by-side analysis of selected regions</p>
                </div>
                
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                    {/* Comparison Chart */}
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-800">Multi-Region Radar Comparison</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <RadarChart data={comparisonRadarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="indicator" tick={{ fontSize: 9 }} />
                          <PolarRadiusAxis domain={[0, 100]} />
                          {compareRegions.map((region, idx) => {
                            const colors = ['#3b82f6', '#10b981', '#f59e0b'];
                            return (
                              <Radar
                                key={region.name}
                                name={region.name}
                                dataKey={region.name}
                                stroke={colors[idx]}
                                fill={colors[idx]}
                                fillOpacity={0.3}
                              />
                            );
                          })}
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Comparison Table */}
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-800">Detailed Metrics Comparison</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs sm:text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-2 sm:px-3 py-2 text-left font-semibold text-gray-700">Metric</th>
                              {compareRegions.map(r => (
                                <th key={r.name} className="px-2 sm:px-3 py-2 text-center font-semibold text-gray-700 text-xs">{r.name}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            <tr className="bg-blue-50">
                              <td className="px-2 sm:px-3 py-2 font-semibold">CERS Score</td>
                              {compareRegions.map(r => (
                                <td key={r.name} className="px-2 sm:px-3 py-2 text-center font-bold text-blue-600">{r.CERS}</td>
                              ))}
                            </tr>
                            <tr>
                              <td className="px-2 sm:px-3 py-2">Renewable Potential</td>
                              {compareRegions.map(r => (
                                <td key={r.name} className="px-2 sm:px-3 py-2 text-center">{r.P}</td>
                              ))}
                            </tr>
                            <tr>
                              <td className="px-2 sm:px-3 py-2">Grid Access</td>
                              {compareRegions.map(r => (
                                <td key={r.name} className="px-2 sm:px-3 py-2 text-center">{r.G}</td>
                              ))}
                            </tr>
                            <tr>
                              <td className="px-2 sm:px-3 py-2">Regulatory</td>
                              {compareRegions.map(r => (
                                <td key={r.name} className="px-2 sm:px-3 py-2 text-center">{r.R}</td>
                              ))}
                            </tr>
                            <tr>
                              <td className="px-2 sm:px-3 py-2">Implementation</td>
                              {compareRegions.map(r => (
                                <td key={r.name} className="px-2 sm:px-3 py-2 text-center">{r.H}</td>
                              ))}
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="px-2 sm:px-3 py-2 font-semibold">Readiness Level</td>
                              {compareRegions.map(r => (
                                <td key={r.name} className="px-2 sm:px-3 py-2 text-center">
                                  <span className={`px-2 py-1 rounded text-xs font-semibold ${r.readiness.bg} ${r.readiness.color}`}>
                                    {r.readiness.level.split(' ')[0]}
                                  </span>
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="mt-4 space-y-2 sm:space-y-3">
                        <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Key Differences:</h4>
                        {compareRegions.map(r => (
                          <div key={r.name} className="text-xs sm:text-sm">
                            <p className="font-medium text-gray-700">{r.name}:</p>
                            <p className="text-gray-600 ml-2 sm:ml-3">Solar: {r.details.solar}, Wind: {r.details.wind}</p>
                            <p className="text-gray-600 ml-2 sm:ml-3">{r.details.grid}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <h3 className="font-semibold text-xs sm:text-sm text-gray-700">Regions Analyzed</h3>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">{enrichedRegions.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  <h3 className="font-semibold text-xs sm:text-sm text-gray-700">High Readiness</h3>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">
                  {enrichedRegions.filter(r => r.CERS >= 75).length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                  <h3 className="font-semibold text-xs sm:text-sm text-gray-700">Moderate Readiness</h3>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-600">
                  {enrichedRegions.filter(r => r.CERS >= 55 && r.CERS < 75).length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                  <h3 className="font-semibold text-xs sm:text-sm text-gray-700">Needs Support</h3>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-red-600">
                  {enrichedRegions.filter(r => r.CERS < 55).length}
                </p>
              </div>
            </div>

            {/* Regional Ranking */}
            <div className="bg-white rounded-lg shadow-lg mb-6 sm:mb-8">
              <div className="p-4 sm:p-6 border-b">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Regional Clean Energy Readiness Score (CERS)</h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Click on any region to view detailed breakdown</p>
              </div>
              <div className="p-4 sm:p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} onClick={(data) => data && setSelectedRegion(enrichedRegions.find(r => r.name === data.activeLabel))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="CERS" fill="#3b82f6" name="Overall CERS" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Rankings Table */}
            <div className="bg-white rounded-lg shadow-lg mb-6 sm:mb-8">
              <div className="p-4 sm:p-6 border-b">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Funding Priority Rankings</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Rank</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Region</th>
                      <th className="px-3 sm:px-6 py-3 text-center text-xs sm:text-sm font-semibold text-gray-700">CERS</th>
                      <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-center text-xs sm:text-sm font-semibold text-gray-700">P (35%)</th>
                      <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-center text-xs sm:text-sm font-semibold text-gray-700">G (25%)</th>
                      <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-center text-xs sm:text-sm font-semibold text-gray-700">R (25%)</th>
                      <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-center text-xs sm:text-sm font-semibold text-gray-700">H (15%)</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {enrichedRegions.map((region, idx) => (
                      <tr 
                        key={region.name} 
                        className={`hover:bg-gray-50 cursor-pointer transition ${compareMode ? 'select-none' : ''} ${compareRegions.find(r => r.name === region.name) ? 'bg-blue-50' : ''}`}
                        onClick={() => compareMode ? toggleCompareRegion(region) : setSelectedRegion(region)}
                      >
                        <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            {compareMode && (
                              <input
                                type="checkbox"
                                checked={!!compareRegions.find(r => r.name === region.name)}
                                onChange={() => {}}
                                className="w-4 h-4"
                                disabled={!compareRegions.find(r => r.name === region.name) && compareRegions.length >= 3}
                              />
                            )}
                            #{idx + 1}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm font-medium text-gray-900">{region.name}</td>
                        <td className="px-3 sm:px-6 py-4 text-center">
                          <span className="text-base sm:text-lg font-bold text-blue-600">{region.CERS}</span>
                        </td>
                        <td className="hidden md:table-cell px-3 sm:px-6 py-4 text-center text-xs sm:text-sm text-gray-600">{region.P}</td>
                        <td className="hidden md:table-cell px-3 sm:px-6 py-4 text-center text-xs sm:text-sm text-gray-600">{region.G}</td>
                        <td className="hidden md:table-cell px-3 sm:px-6 py-4 text-center text-xs sm:text-sm text-gray-600">{region.R}</td>
                        <td className="hidden md:table-cell px-3 sm:px-6 py-4 text-center text-xs sm:text-sm text-gray-600">{region.H}</td>
                        <td className="px-3 sm:px-6 py-4">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${region.readiness.bg} ${region.readiness.color}`}>
                            <span className="hidden sm:inline">{region.readiness.level}</span>
                            <span className="sm:hidden">{region.readiness.level.split(' ')[0]}</span>
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-600">
                          {!compareMode && (
                            <button className="text-blue-600 hover:text-blue-800 font-medium">
                              <span className="hidden sm:inline">View Details →</span>
                              <span className="sm:hidden">View →</span>
                            </button>
                          )}
                          {compareMode && compareRegions.find(r => r.name === region.name) && (
                            <span className="text-blue-600 font-medium">✓ Selected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Selected Region Detail */}
            {selectedRegion && (
              <div className="bg-white rounded-lg shadow-lg mb-6 sm:mb-8">
                <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-blue-50 to-green-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{selectedRegion.name}</h2>
                      <p className="text-sm sm:text-base text-gray-600 mt-1">Detailed Implementation Readiness Analysis</p>
                    </div>
                    <button 
                      onClick={() => setSelectedRegion(null)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  <div className="mt-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Overall CERS</p>
                        <p className="text-3xl sm:text-4xl font-bold text-blue-600">{selectedRegion.CERS}</p>
                      </div>
                      <div className={`px-3 sm:px-4 py-2 rounded-lg ${selectedRegion.readiness.bg} w-full sm:w-auto`}>
                        <p className={`font-semibold text-sm sm:text-base ${selectedRegion.readiness.color}`}>{selectedRegion.readiness.level}</p>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">{selectedRegion.readiness.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-800">Indicator Breakdown</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="indicator" tick={{ fontSize: 9 }} />
                        <PolarRadiusAxis domain={[0, 100]} />
                        <Radar name={selectedRegion.name} dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-800">Regional Characteristics</h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="border-l-4 border-yellow-500 pl-3 sm:pl-4 py-2">
                        <p className="text-xs sm:text-sm font-semibold text-gray-700">Renewable Energy Potential</p>
                        <p className="text-xs sm:text-sm text-gray-600">Solar: {selectedRegion.details.solar}</p>
                        <p className="text-xs sm:text-sm text-gray-600">Wind: {selectedRegion.details.wind}</p>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-3 sm:pl-4 py-2">
                        <p className="text-xs sm:text-sm font-semibold text-gray-700">Infrastructure Status</p>
                        <p className="text-xs sm:text-sm text-gray-600">{selectedRegion.details.grid}</p>
                      </div>
                      <div className="border-l-4 border-green-500 pl-3 sm:pl-4 py-2">
                        <p className="text-xs sm:text-sm font-semibold text-gray-700">Implementation Track Record</p>
                        <p className="text-xs sm:text-sm text-gray-600">{selectedRegion.details.projects}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-4 sm:p-6 border-b">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Methodology: Clean Energy Readiness Score (CERS)</h2>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Scoring Formula</h3>
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border-l-4 border-blue-600 overflow-x-auto">
                  <p className="font-mono text-sm sm:text-lg">CERS = (P × 0.35) + (G × 0.25) + (R × 0.25) + (H × 0.15)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="border rounded-lg p-4 sm:p-5 bg-yellow-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                    <h4 className="font-semibold text-sm sm:text-base text-gray-800">Renewable Energy Potential (P) - 35%</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700">Natural suitability for renewable energy deployment including solar irradiation levels, wind resource availability, and other renewable sources.</p>
                </div>

                <div className="border rounded-lg p-4 sm:p-5 bg-blue-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Grid3x3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    <h4 className="font-semibold text-sm sm:text-base text-gray-800">Grid & Infrastructure (G) - 25%</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700">Proximity to transmission networks, grid capacity and stability, and access to transport infrastructure for project implementation.</p>
                </div>

                <div className="border rounded-lg p-4 sm:p-5 bg-green-50">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    <h4 className="font-semibold text-sm sm:text-base text-gray-800">Regulatory & Policy Readiness (R) - 25%</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700">Alignment with national renewable energy policies, presence of enabling regulations or incentives, and permitting clarity.</p>
                </div>

                <div className="border rounded-lg p-4 sm:p-5 bg-purple-50">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    <h4 className="font-semibold text-sm sm:text-base text-gray-800">Historical Implementation (H) - 15%</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700">Track record of completed or ongoing renewable energy projects, institutional experience, and evidence of timely delivery.</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Score Interpretation</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-green-50 rounded-lg border-l-4 border-green-600">
                    <div className="font-bold text-green-700 text-lg sm:text-xl">75-100</div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm sm:text-base text-gray-800">High Readiness</p>
                      <p className="text-xs sm:text-sm text-gray-600">Priority for immediate public funding</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-600">
                    <div className="font-bold text-yellow-700 text-lg sm:text-xl">55-74</div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm sm:text-base text-gray-800">Moderate Readiness</p>
                      <p className="text-xs sm:text-sm text-gray-600">Conditional funding or preparatory support</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-red-50 rounded-lg border-l-4 border-red-600">
                    <div className="font-bold text-red-700 text-lg sm:text-xl">&lt; 55</div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm sm:text-base text-gray-800">Low Readiness</p>
                      <p className="text-xs sm:text-sm text-gray-600">Not ready for funding; enabling actions required</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

     {/* Footer */}
     <div className="bg-gray-800 text-white mt-12">
  <div className="max-w-7xl mx-auto px-6 py-8">
    <div className="text-center">
      <p className="font-semibold text-xl mb-2">CECECO Clean Energy Hackathon 2026</p>
      <p className="text-gray-300 mb-4">Clean Energy Funding Prioritization Tool</p>
      <p className="text-sm text-gray-400">© 2026. All rights reserved.</p>
    </div>
  </div>
</div>
    </div>
  );
}