import React, { useState, useMemo, useEffect } from 'react';
import { useAppState } from '../state';
import { ChevronLeft, ChevronRight, ExternalLink, Calendar, Search, SlidersHorizontal, Trash2 } from 'lucide-react';
import { JournalRun } from '../types';

export const DashboardHistory: React.FC = () => {
  const { runs, fetchRuns, runsPagination } = useAppState();

  // Filters state
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [triggerFilter, setTriggerFilter] = useState<'all' | 'scheduled' | 'manual'>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch real runs whenever page changes
  useEffect(() => {
    fetchRuns(currentPage);
  }, [currentPage]);
  const itemsPerPage = 8;

  // Memoized filtered runs
  const filteredRuns = useMemo(() => {
    return runs.filter((run) => {
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'success' && run.status === 'success') ||
        (statusFilter === 'failed' && run.status === 'failed');

      const matchTrigger =
        triggerFilter === 'all' ||
        (triggerFilter === 'scheduled' && run.trigger_type === 'scheduled') ||
        (triggerFilter === 'manual' && run.trigger_type === 'manual');

      return matchStatus && matchTrigger;
    });
  }, [runs, statusFilter, triggerFilter]);

  // Pagination calculators
  const totalPages = Math.max(1, Math.ceil(filteredRuns.length / itemsPerPage));
  const paginatedRuns = useMemo(() => {
    // Force reset page index if out of boundaries
    const safePage = currentPage > totalPages ? 1 : currentPage;
    const startIndex = (safePage - 1) * itemsPerPage;
    return filteredRuns.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRuns, currentPage, totalPages]);

  const offsetStart = (currentPage - 1) * itemsPerPage + 1;
  const offsetEnd = Math.min(currentPage * itemsPerPage, filteredRuns.length);

  return (
    <div className="flex flex-col gap-8 font-sans text-charcoal-text text-left selection:bg-sage-green selection:text-charcoal-text">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight mb-1 text-charcoal-text">
          Journal History
        </h1>
        <p className="text-sm text-ash-gray font-medium font-sans">
          A complete log of every daily compile DailyNotion has executed.
        </p>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-parchment rounded-xl p-4 border border-whisper-gray flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-ash-gray shrink-0" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-ash-gray">Filters:</span>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          {/* Status Select */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-ash-gray font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1); // reset index
              }}
              className="bg-canvas-white border border-cloud-gray rounded-md py-1 px-3 text-xs font-semibold text-charcoal-text focus:outline-none focus:border-sage-green cursor-pointer"
            >
              <option value="all">All statuses</option>
              <option value="success font-bold text-sage-green">Success only</option>
              <option value="failed text-red-500">Failed only</option>
            </select>
          </div>

          {/* Trigger filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-ash-gray font-medium">Trigger:</span>
            <select
              value={triggerFilter}
              onChange={(e) => {
                setTriggerFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-canvas-white border border-cloud-gray rounded-md py-1 px-3 text-xs font-semibold text-charcoal-text focus:outline-none focus:border-sage-green cursor-pointer"
            >
              <option value="all">All triggers</option>
              <option value="scheduled">Scheduled only</option>
              <option value="manual">Manual only</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Run Grid Table */}
      <div className="bg-canvas-white border border-whisper-gray rounded-2xl p-6 md:p-8 shadow-sm">
        {paginatedRuns.length === 0 ? (
          <div className="text-center py-16 flex flex-col gap-4 items-center">
            <Calendar size={36} className="text-cloud-gray animate-pulse" />
            <div>
              <p className="text-sm font-semibold text-charcoal-text">No matching records found.</p>
              <p className="text-xs text-cloud-gray mt-1">Try adjusting your filters or triggering a new compiles on dashboard.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-xs text-ash-gray leading-normal">
                <thead>
                  <tr className="border-b border-whisper-gray font-mono font-bold tracking-wider uppercase text-[10px] text-cloud-gray">
                    <th className="py-3 px-3">Date & Time</th>
                    <th className="py-3 px-3">Trigger Type</th>
                    <th className="py-3 px-3">Compilation Status</th>
                    <th className="py-3 px-3">Synced Counts</th>
                    <th className="py-3 px-3 text-right">Notion Destination</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRuns.map((run) => {
                    const runDate = new Date(run.run_at);
                    const dateTimeStr = runDate.toLocaleString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    });
                    const isSuccess = run.status === 'success';

                    return (
                      <React.Fragment key={run.id}>
                        {/* Primary Row */}
                        <tr className="border-b border-whisper-gray/40 hover:bg-parchment/20 transition-colors">
                          <td className="py-4.5 px-3 font-semibold text-charcoal-text whitespace-nowrap">
                            {dateTimeStr}
                          </td>
                          <td className="py-4.5 px-3 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                              run.trigger_type === 'scheduled'
                                ? 'bg-zenith-blue/20 text-charcoal-text'
                                : 'bg-parchment border border-whisper-gray text-ash-gray'
                            }`}>
                              {run.trigger_type}
                            </span>
                          </td>
                          <td className="py-4.5 px-3 whitespace-nowrap">
                            {isSuccess ? (
                              <span className="inline-flex items-center bg-sage-green/[0.24] text-charcoal-text text-[10px] font-bold uppercase font-mono px-2.5 py-0.5 rounded-full border border-sage-green/35 shadow-sm">
                                Success
                              </span>
                            ) : (
                              <span className="inline-flex items-center bg-red-100 text-red-600 text-[10px] font-bold uppercase font-mono px-2.5 py-0.5 rounded-full border border-red-200 shadow-sm font-semibold">
                                Failed
                              </span>
                            )}
                          </td>
                          <td className="py-4.5 px-3 font-medium text-charcoal-text whitespace-nowrap">
                            {isSuccess ? (
                              <span>{run.tasks_count} tasks · {run.notes_count} notes</span>
                            ) : (
                              <span className="text-cloud-gray">—</span>
                            )}
                          </td>
                          <td className="py-4.5 px-3 text-right whitespace-nowrap">
                            {isSuccess && run.notion_page_url ? (
                              <a
                                href={run.notion_page_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-charcoal-text font-bold hover:underline"
                              >
                                <span>Open Page</span>
                                <ExternalLink size={11} />
                              </a>
                            ) : (
                              <span className="text-cloud-gray">—</span>
                            )}
                          </td>
                        </tr>
                        {/* Nested Exception Row (Only shown if failed) */}
                        {!isSuccess && run.error_message && (
                          <tr className="bg-red-50/40 border-b border-whisper-gray/30">
                            <td colSpan={5} className="py-2.5 px-6 text-red-600 font-sans text-xs">
                              <span className="font-mono font-bold mr-2 uppercase tracking-wide text-[9px] bg-red-100 px-1.5 py-0.5 rounded border border-red-200">Error:</span>
                              {run.error_message}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer controllers */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-whisper-gray">
              <span className="text-xs text-ash-gray font-sans">
                Showing <strong className="text-charcoal-text">{offsetStart}-{offsetEnd}</strong> of <strong className="text-charcoal-text">{filteredRuns.length}</strong> journal runs
              </span>
              
              <div className="flex items-center gap-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="bg-canvas-white border border-whisper-gray rounded-md py-1.5 px-3 text-xs font-semibold text-charcoal-text flex items-center gap-1.5 hover:bg-parchment disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>
                
                <span className="text-xs font-medium font-sans">
                  Page <strong className="text-charcoal-text">{currentPage}</strong> of <strong className="text-charcoal-text">{totalPages}</strong>
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="bg-canvas-white border border-whisper-gray rounded-md py-1.5 px-3 text-xs font-semibold text-charcoal-text flex items-center gap-1.5 hover:bg-parchment disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default DashboardHistory;
