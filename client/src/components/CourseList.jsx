import { useState, useEffect } from 'react'
import axios from 'axios'

const CourseList = ({ userRecords, availableCourses }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {availableCourses.map((course, index) => {
        const record = userRecords.find(r => r.courseId === course.code)
        const isCompleted = !!record

        return (
          <div 
            key={course._id}
            className={`p-5 rounded-3xl border-2 transition-all ${
              isCompleted 
              ? 'bg-green-50/50 border-green-100 ring-4 ring-green-100/50' 
              : 'bg-white border-slate-100 hover:border-brand-maroon/20'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-maroon/5 text-brand-maroon flex items-center justify-center font-black text-xs">
                {index + 1}
              </div>
              {isCompleted ? (
                <i className="ph-check-circle-fill text-green-500 text-2xl"></i>
              ) : (
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
              )}
            </div>
            <h4 className="font-bold text-gray-900 line-clamp-2 leading-tight h-10">{course.name}</h4>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{course.code}</span>
              {isCompleted && (
                <span className="px-3 py-1 bg-green-500 text-white text-[10px] font-black rounded-lg">GRADE: {record.grade}</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default CourseList
