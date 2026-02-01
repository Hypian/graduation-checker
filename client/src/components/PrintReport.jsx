import React from 'react';

const PrintReport = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="print-report-container bg-white text-slate-900 font-serif">
      <style>{`
        @media screen {
          .print-report-container { display: none !important; }
        }
        @media print {
          body { 
            background: white !important; 
            margin: 0 !important; 
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
          }

          .print-report-container { 
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .report-page { 
            page-break-after: always;
            padding: 1.5cm !important;
            box-sizing: border-box;
            width: 100%;
          }
          .report-page:last-child { page-break-after: auto; }
          
          table { 
            width: 100% !important; 
            border-collapse: collapse !important; 
            table-layout: fixed !important;
          }
          thead { display: table-header-group; }
          tr { page-break-inside: avoid; }
          
          .no-break { page-break-inside: avoid; }
          
          @page {
             margin: 0;
             size: auto;
          }
        }
      `}</style>

      {data.map((item, index) => {
        const { student, records } = item;
        const ms = student.milestones || {};
        const mandatoryDocs = ['Financial Clearance', 'Library Clearance', 'Transcript', 'Academic Internship', 'Project Defense'];
        
        // Sorting records for cleaner look
        const sortedRecords = [...records].sort((a, b) => (a.courseId || '').localeCompare(b.courseId || ''));

        let docScore = 0;
        mandatoryDocs.forEach(k => { if (ms[k]?.status === 'verified') docScore++; });
        const percent = Math.round(((records.length + docScore) / (59 + 5)) * 100);
        const gpa = records.length > 0 
          ? (records.reduce((sum, r) => sum + r.grade, 0) / records.length).toFixed(2) 
          : "0.00";

        return (
          <div key={student._id} className="report-page mb-12">
            {/* Letterhead */}
            <div className="text-center border-b-2 border-slate-900 pb-2 mb-6 no-break">
              <h1 className="text-xl font-black uppercase tracking-tighter mb-0.5">Degreefi University Registry</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Official Graduation Eligibility & Academic Audit</p>
              <div className="mt-3 flex justify-between text-[8px] font-mono font-bold uppercase">
                <span>Ref: REG/${new Date().getFullYear()}/${student.regNumber?.replace(/\//g, '-') || 'TMP'}</span>
                <span>Date: {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {/* Student Profile Block */}
            <div className="flex justify-between gap-10 mb-6 no-break">
              <div className="w-1/2 space-y-2">
                <h2 className="text-[11px] font-black border-b border-slate-200 pb-1 uppercase tracking-wide font-sans">1. Candidate Identity</h2>
                <div className="grid grid-cols-[80px_1fr] text-[10px] gap-y-0.5">
                  <span className="font-bold text-slate-500">Student Name:</span>
                  <span className="font-black text-slate-900">{student.name}</span>
                  
                  <span className="font-bold text-slate-500">Reg Number:</span>
                  <span className="font-black font-mono">{student.regNumber || 'N/A'}</span>
                  
                  <span className="font-bold text-slate-500">Faculty/Prog:</span>
                  <span className="font-black">BBICT (Hons)</span>
                  
                  <span className="font-bold text-slate-500">Official Email:</span>
                  <span className="font-black">{student.email}</span>
                </div>
              </div>

              <div className="w-1/2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <h2 className="text-[11px] font-black border-b border-slate-200 pb-1 uppercase tracking-wide mb-2 font-sans">2. Audit Statistics</h2>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold">Total Progress:</span>
                    <span className="font-black text-brand-maroon">{percent}%</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold">Cumulative GPA:</span>
                    <span className="font-black">{gpa}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold">Clearance Status:</span>
                    <span className={`font-black uppercase ${percent >= 100 ? 'text-green-600' : 'text-red-500'}`}>
                      {percent >= 100 ? 'QUALIFIED' : 'PROVISIONAL'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Clearances Table */}
            <div className="mb-6 no-break">
              <h2 className="text-[11px] font-black border-b border-slate-200 pb-1 uppercase tracking-wide mb-2 font-sans">3. Departmental Clearances</h2>
              <table className="w-full text-[9px] border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th style={{ width: '40%' }} className="border border-slate-300 p-1.5 text-left">Requirement</th>
                    <th style={{ width: '25%' }} className="border border-slate-300 p-1.5 text-center">Verification</th>
                    <th style={{ width: '35%' }} className="border border-slate-300 p-1.5 text-left">Approval Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mandatoryDocs.map(key => (
                    <tr key={key}>
                      <td className="border border-slate-300 p-1.5 font-bold">{key}</td>
                      <td className={`border border-slate-300 p-1.5 font-black uppercase text-center ${ms[key]?.status === 'verified' ? 'text-green-600' : 'text-slate-400'}`}>
                        {ms[key]?.status === 'verified' ? 'CLEAR' : 'PENDING'}
                      </td>
                      <td className="border border-slate-300 p-1.5 font-mono">
                        {ms[key]?.uploadDate ? new Date(ms[key].uploadDate).toLocaleDateString() : '---'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Course Records Table */}
            <div className="mb-10">
              <h2 className="text-[11px] font-black border-b border-slate-200 pb-1 uppercase tracking-wide mb-2 font-sans">4. Detailed Academic Record</h2>
              <table className="w-full text-[9px] border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th style={{ width: '15%' }} className="border border-slate-300 p-1.5 text-left">Code</th>
                    <th style={{ width: '75%' }} className="border border-slate-300 p-1.5 text-left">Subject Description</th>
                    <th style={{ width: '10%' }} className="border border-slate-300 p-1.5 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRecords.map(record => (
                    <tr key={record._id}>
                      <td className="border border-slate-300 p-1.5 font-mono font-bold">{record.courseId || '---'}</td>
                      <td className="border border-slate-300 p-1.5 leading-tight">{record.courseName}</td>
                      <td className="border border-slate-300 p-1.5 text-center font-black">{record.grade.toFixed(1)}</td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr>
                      <td colSpan="3" className="border border-slate-300 p-4 text-center italic text-slate-400 font-sans">No units found in the official registry</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Signature Section */}
            <div className="mt-8 no-break">
              <div className="flex justify-between items-start gap-12 mb-8">
                <div className="text-center w-full">
                  <div className="border-b border-slate-900 mb-1.5 h-8 w-44 mx-auto"></div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-900 font-sans">University Registrar</p>
                </div>
                
                <div className="text-center w-full">
                  <div className="border-b border-slate-900 mb-1.5 h-8 w-44 mx-auto"></div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-900 font-sans">Head of Department (HOD)</p>
                </div>
              </div>
              
              <div className="flex justify-between items-end italic text-[7px] text-slate-400 font-sans">
                <div className="space-y-0.5">
                  <p>System Auth ID: {student._id.toUpperCase()}</p>
                  <p>Certified Document — Only valid if sealed by the Registry.</p>
                </div>
                <div className="border border-slate-900 px-3 py-1 font-black uppercase tracking-[0.2em] text-[8px] text-slate-900">
                  Registry Archive Copy
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PrintReport;
