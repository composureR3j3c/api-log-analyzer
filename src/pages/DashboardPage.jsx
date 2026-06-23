import {
  Activity,
  Search,
  Upload,
  X,
} from "lucide-react";
import { useState } from "react";
import { LogsTable } from "./components/LogsTable";
import Modal from "./components/Modal";
import LiveLogs from "./LiveLogsPanel";

export default function DashboardPage({
  filteredLogs,
  getBadgeColor,
  handleDrop,
  openFilePicker,
  search,
  setSearch,
  themeClasses,
  totalLogCount,
  uploadedFile,
  uploadError,
}) {
  const hasSearch = search.trim().length > 0;
  const [selectedLog, setSelectedLog] = useState(null);

  return (
    <>
      <div className="flex flex-col gap-4 mb-8">
        {selectedLog && (
          <Modal onClose={() => setSelectedLog(null)} themeClasses={themeClasses}>
            <h3 className="text-xl font-semibold text-gray-800">Log Details</h3>
            <div className="mt-2 mb-4">
              <p>
                <strong className={`dark? text-gray-100 : text-gray-700`}>Severity:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded-full text-xs border ${getBadgeColor(
                    selectedLog.level
                  )}`}
                >
                  {selectedLog.level}
                </span>
              </p>
              <p className="text-gray-600">{selectedLog.message}</p>
            </div>
            <p className={`text-sm ${themeClasses.muted}`}>
              Detected at: {selectedLog.time}
            </p>
          </Modal>
        )}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">AI Incident Dashboard</h2>
          <p className={`${themeClasses.muted} mt-1 text-sm md:text-base`}>
            Monitor logs, detect anomalies, and analyze incidents.
          </p>
        </div>

        <div className="h-96 overflow-y-auto border rounded p-2">

          <LiveLogs />

        </div>

        <div className="w-full">
          <div className="relative">
            <Search
              className={`absolute left-4 top-3.5 ${themeClasses.muted}`}
              size={18}
            />

            <input
              type="text"
              placeholder="Search severity, service, message, or time..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className={`w-full border rounded-2xl pl-11 ${hasSearch ? "pr-12" : "pr-4"
                } py-3 outline-none focus:border-yellow-500 ${themeClasses.input} ${themeClasses.border}`}
              aria-label="Search logs"
            />

            {hasSearch && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className={`absolute right-3 top-2.5 rounded-xl p-1.5 transition ${themeClasses.navIdle}`}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <p className={`${themeClasses.muted} mt-2 text-sm`}>
            {hasSearch
              ? `${filteredLogs.length} of ${totalLogCount} logs matched`
              : `${totalLogCount} logs available`}
          </p>
        </div>
      </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <StatCard
          title="Critical Errors"
          value={criticalCount}
          icon={<AlertTriangle />}
          themeClasses={themeClasses}
        />

        <StatCard
          title="Security Alerts"
          value={securityCount}
          icon={<ShieldAlert />}
          themeClasses={themeClasses}
        />

        <StatCard
          title="Services Monitored"
          value={serviceCount}
          icon={<Server />}
          themeClasses={themeClasses}
        />
      </div> */}

      {!hasSearch && (
        <div
          className={`border rounded-3xl p-4 md:p-8 mb-8 ${themeClasses.panel} ${themeClasses.border}`}
        >
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-8 md:py-16 px-5 ${themeClasses.dashedBorder}`}
          >
            <Upload size={42} className="text-yellow-500 mb-4 md:size-12" />

            <h3 className="text-lg md:text-xl font-semibold mb-2">Upload Log Files</h3>

            <p className={`${themeClasses.muted} mb-6 text-center text-sm md:text-base`}>
              Drag and drop a .log file or upload manually
            </p>

            <button
              type="button"
              onClick={openFilePicker}
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-2xl font-semibold transition"
            >
              Select File
            </button>

            {uploadedFile && (
              <p className="mt-4 text-sm text-green-400">
                Loaded {uploadedFile}
              </p>
            )}

            {uploadError && (
              <p className="mt-4 text-sm text-red-400">{uploadError}</p>
            )}
          </div>
        </div>
      )}

      <LogsTable
        logs={filteredLogs}
        getBadgeColor={getBadgeColor}
        hasSearch={hasSearch}
        themeClasses={themeClasses}
        totalLogCount={totalLogCount}
        setSelectedLog={setSelectedLog}
      />

      <div
        className={`mt-8 border rounded-3xl p-4 md:p-8 ${themeClasses.panel} ${themeClasses.border}`}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-yellow-500 p-2 rounded-xl">
            <Activity className="text-black" size={18} />
          </div>

          <h3 className="text-xl md:text-2xl font-semibold">AI Root Cause Analysis</h3>
        </div>
      </div>
    </>
  );
}


