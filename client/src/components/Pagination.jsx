import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

const Pagination = ({totalUsers, currentPage, goToPage}) => {
    

    const totalPages = Math.ceil(totalUsers / 18);

    return (
        <div>
            <nav class="flex items-center gap-x-1" aria-label="Pagination">
                <button type="button" onClick={() => goToPage(currentPage - 1)} class="min-h-9.5 min-w-9.5 py-2 px-2.5 inline-flex justify-center items-center gap-x-1.5 text-sm rounded-lg text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none" aria-label="Previous">
                    <svg aria-hidden="true" class="hidden shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m15 18-6-6 6-6"></path>
                    </svg>
                    <span>Previous</span>
                </button>
                <div class="flex items-center gap-x-1">

                    {Array.from({ length: totalPages }, (_, i) => {
                        const pageNum = i + 1;
                        if (pageNum <= 4) {
                            return (
                                <button onClick={() => goToPage(pageNum)} type="button" class="min-h-9.5 min-w-9.5 flex justify-center items-center text-gray-800 hover:bg-gray-100 py-2 px-3 text-sm rounded-lg focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none" aria-current="page"> {pageNum} </button>
                            );
                        }
                        
                        if (pageNum == 5) {
                            return (
                                 <span class="group-hover:hidden text-xs">•••</span>
                            )                          
                        }
                        
                        if (pageNum == totalPages) {
                            return (
                                <button type="button" class="min-h-9.5 min-w-9.5 flex justify-center items-center text-gray-800 hover:bg-gray-100 py-2 px-3 text-sm rounded-lg focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none" aria-current="page"> {pageNum} </button>
                            )
                        }

                    })}
                </div>
                <button type="button" class="min-h-9.5 min-w-9.5 py-2 px-2.5 inline-flex justify-center items-center gap-x-1.5 text-sm rounded-lg text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none" aria-label="Next">
                    <span>Next</span>
                    <svg aria-hidden="true" class="hidden shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m9 18 6-6-6-6"></path>
                    </svg>
                </button>
                </nav>
        </div>
    )
}

export default Pagination;


