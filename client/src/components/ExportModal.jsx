import React, { useState } from 'react';
import axios from 'axios';
import { useModal } from '../context/ModalContext';

const ExportModal = ({ isOpen, onClose, selectedIds, students, onExportComplete }) => {
  const [loading, setLoading] = useState(false);
  const { showModal } = useModal();

  if (!isOpen) return null;

  const selectedStudents = students.filter(s => selectedIds.includes(s._id));

  const handleStartExport = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/admin/export-data', { studentIds: selectedIds });
      onExportComplete(res.data);
      onClose();
    } catch (err) {
      console.error('Export error:', err);
      showModal({
        title: 'Export Failed',
        message: 'Could not prepare the academic data for the selected candidates. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand-maroon/20 backdrop-blur-xl animate-in fade-in duration-500"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative bg-white/90 backdrop-blur-md w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white overflow-hidden animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="p-8 bg-gradient-to-br from-brand-maroon to-[#631a42] text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black tracking-tight mb-1">Export Data Desk</h2>
              <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Prepare Academic Documentation</p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <i className="ph-x-bold text-xl"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">You have selected {selectedIds.length} candidates</h3>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-200">
              {selectedStudents.map(student => (
                <div key={student._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                   <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-brand-maroon font-black text-xs">
                     {student.name?.[0]}
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-900 truncate">{student.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 font-mono">{student.regNumber || 'No Reg'}</p>
                   </div>
                   <i className="ph-check-circle-fill text-green-500 text-lg"></i>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex gap-4 items-start mb-10">
            <i className="ph-info-fill text-amber-500 text-2xl mt-1"></i>
            <div className="flex-1">
               <h4 className="text-xs font-black text-amber-900 uppercase tracking-wide">Ready for Print</h4>
               <p className="text-[10px] font-medium text-amber-700/80 leading-relaxed mt-1">
                 The system will generate a professional audit report for each selected student. Ensure your browser allows pop-ups/print windows.
               </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest transition-all active:scale-95"
            >
              Cancel
            </button>
            <button 
              onClick={handleStartExport}
              disabled={loading}
              className="flex-[2] py-4 rounded-2xl bg-brand-maroon hover:bg-[#631a42] text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-brand-maroon/20 shadow-inner flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Preparing...</span>
                </>
              ) : (
                <>
                  <i className="ph-printer-bold text-lg"></i>
                  <span>Initialize Export</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
