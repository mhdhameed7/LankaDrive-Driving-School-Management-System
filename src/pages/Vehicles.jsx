import React, { useState, useEffect } from 'react';
import { 
  CarFront, Plus, Edit2, Trash2, CheckCircle2, Wrench, 
  FileText, Fuel, DollarSign, AlertTriangle, AlertCircle,
  Calendar, CheckCircle, ShieldAlert, Car, MapPin, Search,
  Settings, ChevronRight, Fuel as FuelIcon, Info, Sparkles
} from 'lucide-react';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [instructors, setInstructors] = useState([]);
  
  // Selected Vehicle State
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [activeTab, setActiveTab] = useState('info'); // info, maintenance, fuel, finance
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState(null);

  // Forms
  const [vehicleForm, setVehicleForm] = useState({
    id: '', make: '', model: '', plateNumber: '', transmission: 'Manual', type: 'Light Vehicle', status: 'Active',
    color: '', year: '', chassisNumber: '', engineNumber: '', licenseCategory: 'B - Light Vehicle',
    revenueLicenseExpiry: '', insuranceExpiry: '', drivingSchoolLicenseExpiry: '', emissionTestExpiry: '',
    purchasePrice: 0, purchaseDate: '', currentMileage: 0, defaultInstructorId: ''
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    vehicleId: '', serviceDate: '', mileage: '', description: '', partsReplaced: '', cost: '', nextServiceMileage: '', nextServiceDate: ''
  });

  const [fuelForm, setFuelForm] = useState({
    vehicleId: '', date: '', volumeLiters: '', cost: '', odometerReading: ''
  });

  const loadData = async () => {
    try {
      const vRes = await window.api.getVehicles();
      setVehicles(vRes || []);
      
      const iRes = await window.api.getInstructors();
      setInstructors(iRes || []);

      if (selectedVehicleId) {
        await loadVehicleDetails(selectedVehicleId);
      }
    } catch (err) { console.error(err); }
  };

  const loadVehicleDetails = async (id) => {
    try {
      const mLogs = await window.api.getMaintenanceLogs(id);
      setMaintenanceLogs(mLogs || []);
      const fLogs = await window.api.getFuelLogs(id);
      setFuelLogs(fLogs || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedVehicleId) {
      loadVehicleDetails(selectedVehicleId);
    }
  }, [selectedVehicleId]);

  // Handlers for Vehicle Modal
  const openVehicleModal = async (vehicle = null) => {
    if (vehicle) {
      setVehicleForm({
        ...vehicle,
        purchasePrice: vehicle.purchasePrice || 0,
        currentMileage: vehicle.currentMileage || 0
      });
      setEditingVehicleId(vehicle.id);
    } else {
      const nextId = await window.api.getNextVehicleId();
      setVehicleForm({ 
        id: nextId, make: '', model: '', plateNumber: '', transmission: 'Manual', type: 'Light Vehicle', status: 'Active',
        color: '', year: '', chassisNumber: '', engineNumber: '', licenseCategory: 'B - Light Vehicle',
        revenueLicenseExpiry: '', insuranceExpiry: '', drivingSchoolLicenseExpiry: '', emissionTestExpiry: '',
        purchasePrice: 0, purchaseDate: '', currentMileage: 0, defaultInstructorId: ''
      });
      setEditingVehicleId(null);
    }
    setShowVehicleModal(true);
  };

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...vehicleForm, purchasePrice: parseFloat(vehicleForm.purchasePrice) || 0, currentMileage: parseFloat(vehicleForm.currentMileage) || 0 };
      const res = editingVehicleId 
        ? await window.api.updateVehicle(payload)
        : await window.api.addVehicle(payload);
      if (res.success) {
        setShowVehicleModal(false);
        loadData();
      } else {
        alert(res.message);
      }
    } catch (err) { alert(err.message); }
  };

  const deleteVehicle = async (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle? All related logs will remain orphaned.")) {
      await window.api.deleteVehicle(id);
      if (selectedVehicleId === id) setSelectedVehicleId(null);
      loadData();
    }
  };

  // Handlers for Maintenance Modal
  const openMaintenanceModal = () => {
    const v = vehicles.find(x => x.id === selectedVehicleId);
    setMaintenanceForm({
      vehicleId: selectedVehicleId, serviceDate: new Date().toISOString().split('T')[0],
      mileage: v?.currentMileage || '', description: '', partsReplaced: '', cost: '', 
      nextServiceMileage: (parseFloat(v?.currentMileage || 0) + 5000).toString(), nextServiceDate: ''
    });
    setShowMaintenanceModal(true);
  };

  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    const v = vehicles.find(x => x.id === selectedVehicleId);
    const mileageNum = parseFloat(maintenanceForm.mileage) || 0;
    
    // Odometer logical check
    if (mileageNum < (v?.currentMileage || 0)) {
      alert(`Validation Error: Service mileage (${mileageNum} km) cannot be less than the vehicle's current mileage (${v?.currentMileage || 0} km).`);
      return;
    }

    try {
      const payload = {
        ...maintenanceForm,
        mileage: mileageNum,
        cost: parseFloat(maintenanceForm.cost) || 0,
        nextServiceMileage: parseFloat(maintenanceForm.nextServiceMileage) || 0
      };
      const res = await window.api.addMaintenanceLog(payload);
      if (res.success) {
        setShowMaintenanceModal(false);
        loadData(); 
      } else alert(res.message);
    } catch (err) { alert(err.message); }
  };

  // Handlers for Fuel Modal
  const openFuelModal = () => {
    if (!selectedVehicleId) {
      return alert('Select a vehicle before logging fuel.');
    }
    const v = vehicles.find(x => x.id === selectedVehicleId);
    setFuelForm({
      vehicleId: selectedVehicleId, date: new Date().toISOString().split('T')[0],
      volumeLiters: '', cost: '', odometerReading: v?.currentMileage || ''
    });
    setShowFuelModal(true);
  };

  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    const v = vehicles.find(x => x.id === selectedVehicleId);
    const odometerNum = parseFloat(fuelForm.odometerReading) || 0;

    // Odometer logical check
    if (odometerNum < (v?.currentMileage || 0)) {
      alert(`Validation Error: Fuel odometer reading (${odometerNum} km) cannot be less than the vehicle's current mileage (${v?.currentMileage || 0} km).`);
      return;
    }

    try {
      const payload = {
        ...fuelForm,
        volumeLiters: parseFloat(fuelForm.volumeLiters) || 0,
        cost: parseFloat(fuelForm.cost) || 0,
        odometerReading: odometerNum
      };
      const res = await window.api.addFuelLog(payload);
      if (res.success) {
        setShowFuelModal(false);
        loadData(); 
      } else alert(res.message);
    } catch (err) { alert(err.message); }
  };

  // Helpers
  const getExpiryStatus = (dateStr) => {
    if (!dateStr) return 'unknown';
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = (d - now) / (1000 * 60 * 60 * 24);
    if (diffDays < 0) return 'expired';
    if (diffDays <= 30) return 'warning';
    return 'ok';
  };

  const getVehicleGlobalStatus = (vehicle) => {
    if (vehicle.status === 'Maintenance') return 'warning';
    if (vehicle.status === 'Disposed') return 'disposed';
    
    const docs = [vehicle.revenueLicenseExpiry, vehicle.insuranceExpiry, vehicle.drivingSchoolLicenseExpiry, vehicle.emissionTestExpiry];
    let hasWarning = false;
    for (let d of docs) {
      const s = getExpiryStatus(d);
      if (s === 'expired') return 'error';
      if (s === 'warning') hasWarning = true;
    }
    return hasWarning ? 'warning' : 'ok';
  };

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  // Financial and Fuel Efficiency calculations
  let currentBookValue = 0;
  let totalMaintenanceSpend = 0;
  let totalFuelSpend = 0;
  let fuelEfficiency = 0; 

  if (selectedVehicle) {
    totalMaintenanceSpend = maintenanceLogs.reduce((sum, log) => sum + (log.cost || 0), 0);
    totalFuelSpend = fuelLogs.reduce((sum, log) => sum + (log.cost || 0), 0);

    const purchasePrice = selectedVehicle.purchasePrice || 0;
    if (purchasePrice > 0 && selectedVehicle.purchaseDate) {
      const pDate = new Date(selectedVehicle.purchaseDate);
      const yearsDiff = (new Date() - pDate) / (1000 * 60 * 60 * 24 * 365);
      const depreciation = purchasePrice * 0.20 * Math.max(0, yearsDiff);
      currentBookValue = Math.max(0, purchasePrice - depreciation);
    }

    if (fuelLogs.length >= 2) {
      const sortedFuelLogs = [...fuelLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
      const firstLog = sortedFuelLogs[0];
      const lastLog = sortedFuelLogs[sortedFuelLogs.length - 1];
      const totalDist = (lastLog.odometerReading || 0) - (firstLog.odometerReading || 0);
      const totalVolume = sortedFuelLogs.slice(1).reduce((sum, log) => sum + (log.volumeLiters || 0), 0);
      if (totalDist > 0 && totalVolume > 0) {
        fuelEfficiency = totalDist / totalVolume;
      }
    }
  }

  // Next Service Progress Logic
  let nextServiceMileage = 0;
  let serviceProgressPercentage = 0;
  let serviceRemainingKm = 0;
  let lastServiceMileage = 0;

  if (selectedVehicle) {
    if (maintenanceLogs.length > 0) {
      const sortedMaint = [...maintenanceLogs].sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate));
      lastServiceMileage = sortedMaint[0].mileage || 0;
      nextServiceMileage = sortedMaint[0].nextServiceMileage || (lastServiceMileage + 5000);
    } else {
      lastServiceMileage = 0;
      nextServiceMileage = 5000; 
    }

    const interval = nextServiceMileage - lastServiceMileage;
    const currentDiff = (selectedVehicle.currentMileage || 0) - lastServiceMileage;
    serviceRemainingKm = Math.max(0, nextServiceMileage - (selectedVehicle.currentMileage || 0));

    if (interval > 0) {
      serviceProgressPercentage = Math.min(100, Math.max(0, (currentDiff / interval) * 100));
    }
  }

  const filteredVehicles = vehicles.filter(v => 
    v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] text-slate-800 overflow-hidden flex-1">
      
      {/* Premium Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center shrink-0 z-10 shadow-xs">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-slate-900">
            <div className="p-2 bg-[#1e3a5f]/5 text-[#1e3a5f] rounded-xl border border-[#1e3a5f]/10">
              <CarFront size={22} />
            </div>
            Fleet & Maintenance Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Manage vehicle records, compliance details, and service logs</p>
        </div>
        <button 
          onClick={() => openVehicleModal()} 
          className="bg-[#1e3a5f] hover:bg-[#152942] text-white px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all hover:-translate-y-0.5"
        >
          <Plus size={16} /> Add Vehicle
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Fleet List Sidebar */}
        <div className="w-[340px] bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-405" size={15} />
              <input 
                type="text" 
                placeholder="Search plate or vehicle..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs placeholder-slate-400 outline-none focus:border-[#1e3a5f] transition-all text-slate-850"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredVehicles.map(v => {
              const gStatus = getVehicleGlobalStatus(v);
              let statusClass = 'border-slate-200 hover:border-slate-300 bg-white';
              let statusDot = 'bg-slate-400';
              
              if (gStatus === 'ok') {
                statusClass = 'border-emerald-200 hover:border-emerald-350 bg-emerald-500/5';
                statusDot = 'bg-emerald-500';
              } else if (gStatus === 'error') {
                statusClass = 'border-rose-200 hover:border-rose-350 bg-rose-500/5';
                statusDot = 'bg-rose-500';
              } else if (gStatus === 'warning') {
                statusClass = 'border-amber-200 hover:border-amber-350 bg-amber-500/5';
                statusDot = 'bg-amber-500';
              } else if (gStatus === 'disposed') {
                statusClass = 'border-slate-200 opacity-60 bg-slate-50';
                statusDot = 'bg-slate-500';
              }

              const isSelected = selectedVehicleId === v.id;

              return (
                <div 
                  key={v.id} 
                  onClick={() => setSelectedVehicleId(v.id)}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between group ${isSelected ? 'bg-blue-50/70 border-[#1e3a5f] shadow-sm' : statusClass}`}
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${statusDot} shrink-0`}></span>
                      <span className="font-extrabold text-sm text-slate-900 tracking-wide">{v.plateNumber}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-500 truncate group-hover:text-slate-700 transition-colors">
                      {v.make} {v.model}
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <span className="inline-block text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider bg-slate-100 text-slate-650 border border-slate-200">
                      {v.transmission}
                    </span>
                    <div className="text-xs font-mono font-bold text-[#1e3a5f] mt-1.5">{v.currentMileage || 0} km</div>
                  </div>
                </div>
              );
            })}
            
            {filteredVehicles.length === 0 && (
              <div className="text-center p-8 text-slate-400 text-xs font-bold">No vehicles registered in fleet.</div>
            )}
          </div>
        </div>

        {/* Right Side: Vehicle Management Panel */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {selectedVehicle ? (
            <>
              <div className="bg-slate-50/50 p-6 border-b border-slate-200 shrink-0">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        {selectedVehicle.make} {selectedVehicle.model} 
                      </h2>
                      {/* Sri Lankan Plate Style Badge */}
                      <span className="px-3 py-1 rounded-md bg-amber-500 text-slate-900 text-xs border border-amber-600 font-extrabold tracking-widest font-mono select-none">
                        {selectedVehicle.plateNumber}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-5 mt-3 text-xs font-semibold text-slate-500">
                      <span className="flex items-center gap-1.5"><Car size={14} className="text-slate-400" /> {selectedVehicle.type}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5"><Settings size={14} className="text-slate-400" /> {selectedVehicle.transmission}</span>
                      <span>•</span>
                      <span className={`flex items-center gap-1.5 font-bold ${selectedVehicle.status === 'Active' ? 'text-emerald-600' : selectedVehicle.status === 'Maintenance' ? 'text-amber-600' : 'text-slate-500'}`}>
                        <AlertCircle size={14} /> Status: {selectedVehicle.status}
                      </span>
                      <span>•</span>
                      <span>Instructor: <span className="text-slate-800 font-bold">{instructors.find(i=>i.id===selectedVehicle.defaultInstructorId)?.name || 'Unassigned'}</span></span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openVehicleModal(selectedVehicle)} 
                      className="p-2.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-xl transition-all border border-slate-200"
                      title="Edit Profile"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => deleteVehicle(selectedVehicle.id)} 
                      className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all border border-rose-100"
                      title="Delete Profile"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 mt-6 border-b border-slate-200">
                  {[
                    { id: 'info', icon: FileText, label: 'Compliance & Profile' },
                    { id: 'maintenance', icon: Wrench, label: 'Maintenance & Service' },
                    { id: 'fuel', icon: Fuel, label: 'Fuel Analytics' },
                    { id: 'finance', icon: DollarSign, label: 'TCO & Financials' },
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all relative ${activeTab === tab.id ? 'text-[#1e3a5f]' : 'text-slate-405 hover:text-slate-800'}`}
                    >
                      <tab.icon size={15} /> {tab.label}
                      {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1e3a5f] rounded-t-full"></div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 overflow-y-auto p-6 bg-white">
                
                {/* ── Registry and Compliance ── */}
                {activeTab === 'info' && (
                  <div className="max-w-5xl space-y-6">
                    
                    {/* Compliance Alert Banners */}
                    {vehicles.length > 0 && (() => {
                      const expirations = [
                        { key: 'Revenue License', val: selectedVehicle.revenueLicenseExpiry },
                        { key: 'Insurance Policy', val: selectedVehicle.insuranceExpiry },
                        { key: 'Driving School Certificate', val: selectedVehicle.drivingSchoolLicenseExpiry },
                        { key: 'Emission Certificate', val: selectedVehicle.emissionTestExpiry }
                      ];
                      const expiredDocs = expirations.filter(e => getExpiryStatus(e.val) === 'expired');
                      const warningDocs = expirations.filter(e => getExpiryStatus(e.val) === 'warning');

                      return (
                        <>
                          {expiredDocs.map((doc, idx) => (
                            <div key={`expired-${idx}`} className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-semibold">
                              <ShieldAlert size={18} className="text-rose-500 shrink-0" />
                              <div>
                                <span className="font-extrabold text-rose-800 uppercase mr-1">Compliance Alert:</span>
                                The vehicle's <strong className="text-rose-900">{doc.key}</strong> is expired (Expiry: {doc.val || 'Not Set'}). Update documents to resume usage.
                              </div>
                            </div>
                          ))}
                          {warningDocs.map((doc, idx) => (
                            <div key={`warning-${idx}`} className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-700 text-xs font-semibold">
                              <AlertTriangle size={18} className="text-amber-500 shrink-0" />
                              <div>
                                <span className="font-extrabold text-amber-800 uppercase mr-1">Upcoming Expiration:</span>
                                The <strong className="text-amber-900">{doc.key}</strong> is expiring soon (Expiry: {doc.val || 'Not Set'}). Plan renewal shortly.
                              </div>
                            </div>
                          ))}
                        </>
                      );
                    })()}

                    <div className="grid grid-cols-2 gap-6">
                      
                      {/* Specifications */}
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Info size={14} className="text-[#1e3a5f]" /> General Specifications
                        </h3>
                        <div className="space-y-3.5 text-xs">
                          <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-500 font-medium">Color / Finish</span> <span className="font-semibold text-slate-800">{selectedVehicle.color || 'N/A'}</span></div>
                          <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-500 font-medium">Manufacture Year</span> <span className="font-semibold text-slate-800">{selectedVehicle.year || 'N/A'}</span></div>
                          <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-500 font-medium">Chassis Serial Number</span> <span className="font-mono font-semibold text-slate-800">{selectedVehicle.chassisNumber || 'N/A'}</span></div>
                          <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-500 font-medium">Engine Number</span> <span className="font-mono font-semibold text-slate-800">{selectedVehicle.engineNumber || 'N/A'}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500 font-medium">License Category Target</span> <span className="font-semibold text-slate-800">{selectedVehicle.licenseCategory || 'N/A'}</span></div>
                        </div>
                      </div>

                      {/* Documents Status Check */}
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <FileText size={14} className="text-emerald-600" /> Compliance Document Expiries
                        </h3>
                        <div className="space-y-3.5">
                          {[
                            { label: 'Revenue License', date: selectedVehicle.revenueLicenseExpiry },
                            { label: 'Insurance Policy', date: selectedVehicle.insuranceExpiry },
                            { label: 'Driving School Auth', date: selectedVehicle.drivingSchoolLicenseExpiry },
                            { label: 'Emission Test', date: selectedVehicle.emissionTestExpiry }
                          ].map((doc, idx) => {
                            const status = getExpiryStatus(doc.date);
                            let color = 'text-slate-800 border-slate-200 bg-white';
                            let indicator = <CheckCircle2 size={14} className="text-emerald-500" />;
                            
                            if (status === 'expired') { 
                              color = 'text-rose-700 border-rose-200 bg-rose-50'; 
                              indicator = <ShieldAlert size={14} className="text-rose-600" />; 
                            } else if (status === 'warning') { 
                              color = 'text-amber-700 border-amber-200 bg-amber-50'; 
                              indicator = <AlertTriangle size={14} className="text-amber-600" />; 
                            }

                            return (
                              <div key={idx} className={`p-3 border rounded-xl flex items-center justify-between transition-all ${color}`}>
                                <div className="flex items-center gap-2.5">
                                  {indicator}
                                  <span className="text-xs font-bold">{doc.label}</span>
                                </div>
                                <div className="text-xs font-mono font-bold">{doc.date || 'Not Configured'}</div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Maintenance Hub ── */}
                {activeTab === 'maintenance' && (
                  <div className="max-w-5xl space-y-6">
                    
                    {/* Progress Bar towards Service */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <div className="text-[10px] font-black text-slate-455 uppercase tracking-widest">Odometer Progress & Service Intervals</div>
                          <div className="text-xl font-black text-slate-900 mt-1">
                            {selectedVehicle.currentMileage || 0} km <span className="text-xs text-slate-500 font-semibold">total mileage</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-[#1e3a5f] block">Next Service Target</span>
                          <span className="text-sm font-extrabold text-slate-950 font-mono">{nextServiceMileage} km</span>
                        </div>
                      </div>

                      {/* Bar indicator */}
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden p-0.5 border border-slate-300">
                        <div 
                          className="bg-gradient-to-r from-blue-650 to-emerald-500 h-2 rounded-full transition-all duration-550"
                          style={{ width: `${serviceProgressPercentage}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between items-center mt-3 text-xs">
                        <span className="text-slate-500">Interval mileage: {nextServiceMileage - lastServiceMileage} km</span>
                        <span className={`font-bold ${serviceRemainingKm < 500 ? 'text-rose-600 animate-pulse' : 'text-slate-600'}`}>
                          {serviceRemainingKm} km remaining
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border border-slate-200">
                      <div className="flex items-center gap-3.5">
                        <div className="p-3 bg-blue-50 text-blue-650 rounded-xl">
                          <Wrench size={20} />
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Log Maintenance</div>
                          <p className="text-[11px] text-slate-400">Keep history records updated to ensure vehicle safety</p>
                        </div>
                      </div>
                      <button onClick={openMaintenanceModal} className="bg-[#1e3a5f] hover:bg-[#152942] text-white px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer">
                        Add Log Entry
                      </button>
                    </div>

                    {/* Service logs table */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-5 py-3.5 font-bold text-slate-500 uppercase">Date</th>
                            <th className="px-5 py-3.5 font-bold text-slate-500 uppercase">Odometer</th>
                            <th className="px-5 py-3.5 font-bold text-slate-500 uppercase">Description</th>
                            <th className="px-5 py-3.5 font-bold text-slate-500 uppercase text-right">Cost (LKR)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {maintenanceLogs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-5 py-3.5 font-bold text-slate-800">{log.serviceDate}</td>
                              <td className="px-5 py-3.5 font-mono text-[#1e3a5f] font-semibold">{log.mileage} km</td>
                              <td className="px-5 py-3.5 text-slate-650">
                                <div className="font-extrabold text-slate-905 text-xs">{log.description}</div>
                                {log.partsReplaced && <div className="text-[10px] text-slate-400 mt-1">Parts: {log.partsReplaced}</div>}
                                {log.nextServiceMileage && <div className="text-[10px] text-emerald-600 mt-0.5 font-mono font-semibold">Next target: {log.nextServiceMileage} km</div>}
                              </td>
                              <td className="px-5 py-3.5 font-bold text-slate-800 text-right">Rs {parseFloat(log.cost || 0).toLocaleString()}</td>
                            </tr>
                          ))}
                          {maintenanceLogs.length === 0 && (
                            <tr><td colSpan="4" className="px-5 py-8 text-center text-slate-450 font-bold">No maintenance logs found.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ── Fuel Analytics ── */}
                {activeTab === 'fuel' && (
                  <div className="max-w-5xl space-y-6">
                    
                    {/* Fuel Efficiency Analytics Card */}
                    <div className="grid grid-cols-3 gap-5">
                      
                      <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-105">
                        <div className="text-[10px] font-black text-blue-650 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                          <FuelIcon size={12} className="text-blue-500" /> Fuel Economy
                        </div>
                        <div className="text-2xl font-black text-slate-800">
                          {fuelEfficiency > 0 ? `${fuelEfficiency.toFixed(2)} km/L` : 'Calculating...'}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">Calculated dynamically based on odometer logs</p>
                      </div>

                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                        <div className="text-[10px] font-black text-slate-450 uppercase tracking-widest mb-1.5">Total Fuel Refilled</div>
                        <div className="text-2xl font-black text-amber-600">
                          {fuelLogs.reduce((sum,l)=>sum+(l.volumeLiters||0),0).toFixed(1)} <span className="text-xs text-slate-500 font-semibold">Liters</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">Cumulative refuel records</p>
                      </div>

                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                        <div className="text-[10px] font-black text-slate-455 uppercase tracking-widest mb-1.5">Fuel Expenses</div>
                        <div className="text-2xl font-black text-rose-650">
                          Rs {totalFuelSpend.toLocaleString()}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">Cumulative cost of refuels</p>
                      </div>

                    </div>

                    <div className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border border-slate-200">
                      <div className="flex items-center gap-3.5">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                          <FuelIcon size={20} />
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Log Fuel Purchase</div>
                          <p className="text-[11px] text-slate-400">Add fuel purchases to track efficiency and consumption rates</p>
                        </div>
                      </div>
                      <button onClick={openFuelModal} className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer">
                        Log Fuel Refill
                      </button>
                    </div>

                    {/* Fuel logs table */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-5 py-3.5 font-bold text-slate-500 uppercase">Date</th>
                            <th className="px-5 py-3.5 font-bold text-slate-500 uppercase">Odometer Reading</th>
                            <th className="px-5 py-3.5 font-bold text-slate-500 uppercase text-right">Volume</th>
                            <th className="px-5 py-3.5 font-bold text-slate-500 uppercase text-right">Cost (LKR)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {fuelLogs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-5 py-3.5 font-bold text-slate-700">{log.date}</td>
                              <td className="px-5 py-3.5 font-mono text-slate-550">{log.odometerReading} km</td>
                              <td className="px-5 py-3.5 font-bold text-slate-800 text-right">{parseFloat(log.volumeLiters || 0).toFixed(2)} L</td>
                              <td className="px-5 py-3.5 font-bold text-amber-605 text-right">Rs {parseFloat(log.cost || 0).toLocaleString()}</td>
                            </tr>
                          ))}
                          {fuelLogs.length === 0 && (
                            <tr><td colSpan="4" className="px-5 py-8 text-center text-slate-450 font-bold">No fuel receipts logged.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ── Financials & TCO ── */}
                {activeTab === 'finance' && (
                  <div className="max-w-5xl space-y-6">
                    
                    <div className="grid grid-cols-2 gap-6">
                      
                      {/* Estimated Book Value */}
                      <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-200 flex flex-col justify-between">
                        <div>
                          <div className="text-xs font-black text-blue-700 uppercase tracking-widest mb-1.5">Asset Book Value Estimation</div>
                          <div className="text-3xl font-black text-slate-900">
                            Rs {currentBookValue.toLocaleString(undefined, {maximumFractionDigits:0})}
                          </div>
                        </div>
                        <div className="mt-8 space-y-2 text-xs text-slate-500 font-medium">
                          <div>Purchase Date: <span className="text-slate-800 font-bold">{selectedVehicle.purchaseDate || 'N/A'}</span></div>
                          <div>Initial Price: <span className="text-slate-800 font-bold">Rs {parseFloat(selectedVehicle.purchasePrice || 0).toLocaleString()}</span></div>
                          <div className="text-[10px] text-slate-400">Note: Calculated using 20% annual straight-line depreciation formula.</div>
                        </div>
                      </div>

                      {/* Cost Summary list */}
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                        <h3 className="text-xs font-extrabold text-slate-505 uppercase tracking-widest">Expense Breakdown</h3>
                        
                        <div className="flex justify-between items-center py-2.5 border-b border-slate-200">
                          <span className="text-xs text-slate-500">Total Maintenance Spend</span>
                          <span className="text-sm font-extrabold text-rose-600">Rs {totalMaintenanceSpend.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-2.5 border-b border-slate-200">
                          <span className="text-xs text-slate-500">Total Fuel Spend</span>
                          <span className="text-sm font-extrabold text-amber-600">Rs {totalFuelSpend.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-2.5">
                          <span className="text-xs text-slate-800 font-bold">Total Cost of Ownership (TCO)</span>
                          <span className="text-base font-black text-emerald-600">Rs {(totalMaintenanceSpend + totalFuelSpend).toLocaleString()}</span>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-405">
              <Car size={64} className="mb-4 text-slate-300 stroke-[1.5]" />
              <h3 className="text-lg font-extrabold text-slate-400">No Vehicle Selected</h3>
              <p className="text-xs font-semibold mt-1.5 text-slate-400">Select a vehicle from the fleet panel on the left to examine detailed logs.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      
      {/* Vehicle Registry Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] text-slate-800 overflow-hidden animate-[modalIn_0.2s_ease-out]">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-black text-slate-900">{editingVehicleId ? 'Modify Fleet Record' : 'Register Fleet Asset'}</h2>
              <button onClick={() => setShowVehicleModal(false)} className="text-slate-400 hover:text-slate-800 transition-colors text-lg">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
              <form id="vehicleForm" onSubmit={handleVehicleSubmit} className="space-y-6">
                
                {/* Basic Details */}
                <div>
                  <h3 className="text-xs font-black text-[#1e3a5f] uppercase tracking-widest mb-3.5 pb-1 border-b border-slate-100">Basic Details</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1.5">Make</label>
                      <input required type="text" className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#1e3a5f]" value={vehicleForm.make} onChange={e => setVehicleForm({...vehicleForm, make: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1.5">Model</label>
                      <input required type="text" className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#1e3a5f]" value={vehicleForm.model} onChange={e => setVehicleForm({...vehicleForm, model: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1.5">Plate Number</label>
                      <input required type="text" className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#1e3a5f]" value={vehicleForm.plateNumber} onChange={e => setVehicleForm({...vehicleForm, plateNumber: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1.5">Type</label>
                      <select className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#1e3a5f] cursor-pointer" value={vehicleForm.type} onChange={e => setVehicleForm({...vehicleForm, type: e.target.value})}>
                        <option value="Light Vehicle">Light Vehicle (Car/Van)</option>
                        <option value="Heavy Vehicle">Heavy Vehicle</option>
                        <option value="Motorcycle">Motorcycle</option>
                        <option value="Three Wheeler">Three Wheeler</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1.5">Transmission</label>
                      <select className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#1e3a5f] cursor-pointer" value={vehicleForm.transmission} onChange={e => setVehicleForm({...vehicleForm, transmission: e.target.value})}>
                        <option value="Manual">Manual</option>
                        <option value="Auto">Auto</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1.5">Color</label>
                      <input type="text" className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#1e3a5f]" value={vehicleForm.color} onChange={e => setVehicleForm({...vehicleForm, color: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* Technical specs */}
                <div>
                  <h3 className="text-xs font-black text-[#1e3a5f] uppercase tracking-widest mb-3.5 pb-1 border-b border-slate-100">Technical Data</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1.5">Mfg Year</label>
                      <input type="number" className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#1e3a5f]" value={vehicleForm.year} onChange={e => setVehicleForm({...vehicleForm, year: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1.5">Chassis Number</label>
                      <input type="text" className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#1e3a5f]" value={vehicleForm.chassisNumber} onChange={e => setVehicleForm({...vehicleForm, chassisNumber: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1.5">Engine Number</label>
                      <input type="text" className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#1e3a5f]" value={vehicleForm.engineNumber} onChange={e => setVehicleForm({...vehicleForm, engineNumber: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1.5">License Classes Allowed</label>
                      <input type="text" placeholder="e.g. B, A, B1" className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#1e3a5f]" value={vehicleForm.licenseCategory} onChange={e => setVehicleForm({...vehicleForm, licenseCategory: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1.5">Default Trainer</label>
                      <select className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#1e3a5f] cursor-pointer" value={vehicleForm.defaultInstructorId} onChange={e => setVehicleForm({...vehicleForm, defaultInstructorId: e.target.value})}>
                        <option value="">-- Unassigned --</option>
                        {instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1.5">Asset Status</label>
                      <select className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#1e3a5f] cursor-pointer" value={vehicleForm.status} onChange={e => setVehicleForm({...vehicleForm, status: e.target.value})}>
                        <option value="Active">Active</option>
                        <option value="Maintenance">In Maintenance</option>
                        <option value="Disposed">Disposed / Sold</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Expiry dates */}
                <div>
                  <h3 className="text-xs font-black text-[#1e3a5f] uppercase tracking-widest mb-3.5 pb-1 border-b border-slate-100">Compliance Validity Dates</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1.5">Revenue License</label>
                      <input type="date" className="w-full px-2.5 py-1.5 border rounded-xl text-[10px] outline-none focus:border-[#1e3a5f]" value={vehicleForm.revenueLicenseExpiry} onChange={e => setVehicleForm({...vehicleForm, revenueLicenseExpiry: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1.5">Insurance</label>
                      <input type="date" className="w-full px-2.5 py-1.5 border rounded-xl text-[10px] outline-none focus:border-[#1e3a5f]" value={vehicleForm.insuranceExpiry} onChange={e => setVehicleForm({...vehicleForm, insuranceExpiry: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1.5">Driving School Auth</label>
                      <input type="date" className="w-full px-2.5 py-1.5 border rounded-xl text-[10px] outline-none focus:border-[#1e3a5f]" value={vehicleForm.drivingSchoolLicenseExpiry} onChange={e => setVehicleForm({...vehicleForm, drivingSchoolLicenseExpiry: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1.5">Emission Test</label>
                      <input type="date" className="w-full px-2.5 py-1.5 border rounded-xl text-[10px] outline-none focus:border-[#1e3a5f]" value={vehicleForm.emissionTestExpiry} onChange={e => setVehicleForm({...vehicleForm, emissionTestExpiry: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* Purchase specs */}
                <div>
                  <h3 className="text-xs font-black text-[#1e3a5f] uppercase tracking-widest mb-3.5 pb-1 border-b border-slate-100">Financials & Initial Odometer</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1.5">Purchase Date</label>
                      <input type="date" className="w-full px-2.5 py-1.5 border rounded-xl text-[10px] outline-none focus:border-[#1e3a5f]" value={vehicleForm.purchaseDate} onChange={e => setVehicleForm({...vehicleForm, purchaseDate: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1.5">Purchase Value (LKR)</label>
                      <input type="number" className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#1e3a5f]" value={vehicleForm.purchasePrice} onChange={e => setVehicleForm({...vehicleForm, purchasePrice: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1.5">Initial Odometer (km)</label>
                      <input type="number" className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#1e3a5f]" value={vehicleForm.currentMileage} onChange={e => setVehicleForm({...vehicleForm, currentMileage: e.target.value})} />
                    </div>
                  </div>
                </div>

              </form>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 shrink-0">
               <button type="button" onClick={() => setShowVehicleModal(false)} className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">Cancel</button>
               <button type="submit" form="vehicleForm" className="px-6 py-2.5 bg-[#1e3a5f] hover:bg-[#152942] text-white text-xs font-bold rounded-xl transition-all shadow-md">Save Record</button>
            </div>
          </div>
        </div>
      )}

      {/* Log Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md text-slate-800 overflow-hidden animate-[modalIn_0.2s_ease-out]">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2"><Wrench size={18} className="text-[#1e3a5f]"/> Log Service Entry</h2>
              <button onClick={() => setShowMaintenanceModal(false)} className="text-slate-400 hover:text-slate-800">✕</button>
            </div>
            
            <form onSubmit={handleMaintenanceSubmit} className="p-5 space-y-4 bg-white">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1.5">Service Date</label>
                  <input required type="date" className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#1e3a5f]" value={maintenanceForm.serviceDate} onChange={e => setMaintenanceForm({...maintenanceForm, serviceDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1.5">Odometer at Service (km)</label>
                  <input required type="number" className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#1e3a5f]" value={maintenanceForm.mileage} onChange={e => setMaintenanceForm({...maintenanceForm, mileage: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1.5">Service Description</label>
                <input required type="text" placeholder="e.g. Engine oil replacement" className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#1e3a5f]" value={maintenanceForm.description} onChange={e => setMaintenanceForm({...maintenanceForm, description: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1.5">Parts Replaced</label>
                <input type="text" placeholder="e.g. Air filter, spark plugs" className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#1e3a5f]" value={maintenanceForm.partsReplaced} onChange={e => setMaintenanceForm({...maintenanceForm, partsReplaced: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1.5">Total Cost (LKR)</label>
                <input required type="number" className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#1e3a5f]" value={maintenanceForm.cost} onChange={e => setMaintenanceForm({...maintenanceForm, cost: e.target.value})} />
              </div>
              
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1.5">Next Service (km target)</label>
                  <input type="number" className="w-full px-3 py-2 bg-white border border-slate-350 rounded-xl text-xs outline-none focus:border-[#1e3a5f]" value={maintenanceForm.nextServiceMileage} onChange={e => setMaintenanceForm({...maintenanceForm, nextServiceMileage: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1.5">Next Service Date</label>
                  <input type="date" className="w-full px-2.5 py-1.5 bg-white border border-slate-350 rounded-xl text-[10px] outline-none focus:border-[#1e3a5f]" value={maintenanceForm.nextServiceDate} onChange={e => setMaintenanceForm({...maintenanceForm, nextServiceDate: e.target.value})} />
                </div>
              </div>
              
              <div className="pt-3">
                <button type="submit" className="px-6 py-3 bg-[#1e3a5f] hover:bg-[#152942] text-white text-xs font-bold rounded-xl shadow-md w-full transition-all">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Fuel Modal */}
      {showFuelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-sm text-slate-800 overflow-hidden animate-[modalIn_0.2s_ease-out]">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2"><FuelIcon size={18} className="text-amber-500"/> Log Fuel Purchase</h2>
              <button onClick={() => setShowFuelModal(false)} className="text-slate-400 hover:text-slate-800">✕</button>
            </div>
            
            <form onSubmit={handleFuelSubmit} className="p-5 space-y-4 bg-white">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1.5">Purchase Date</label>
                <input required type="date" className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#1e3a5f]" value={fuelForm.date} onChange={e => setFuelForm({...fuelForm, date: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-550 uppercase mb-1.5">Volume (Liters)</label>
                <input required type="number" step="0.01" className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#1e3a5f]" value={fuelForm.volumeLiters} onChange={e => setFuelForm({...fuelForm, volumeLiters: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-550 uppercase mb-1.5">Total Cost (LKR)</label>
                <input required type="number" className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#1e3a5f]" value={fuelForm.cost} onChange={e => setFuelForm({...fuelForm, cost: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-550 uppercase mb-1.5">Odometer at Purchase (km)</label>
                <input required type="number" className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#1e3a5f]" value={fuelForm.odometerReading} onChange={e => setFuelForm({...fuelForm, odometerReading: e.target.value})} />
              </div>
              
              <div className="pt-3">
                <button type="submit" className="px-6 py-3 bg-amber-500 hover:bg-amber-450 text-slate-900 text-xs font-bold rounded-xl shadow-md w-full transition-all">Save Purchase Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Vehicles;
