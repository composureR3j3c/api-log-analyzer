import {
  Activity,
  Search,
  Upload,
  X,
} from "lucide-react";

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

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold">AI Incident Dashboard</h2>
          <p className={`${themeClasses.muted} mt-1`}>
            Monitor logs, detect anomalies, and analyze incidents.
          </p>
        </div>

        <div className="w-full md:w-[420px]">
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
              className={`w-full border rounded-2xl pl-11 ${
                hasSearch ? "pr-12" : "pr-4"
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
          className={`border rounded-3xl p-8 mb-8 ${themeClasses.panel} ${themeClasses.border}`}
        >
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-16 px-5 ${themeClasses.dashedBorder}`}
          >
            <Upload size={42} className="text-yellow-500 mb-4" />

            <h3 className="text-xl font-semibold mb-2">Upload Log Files</h3>

            <p className={`${themeClasses.muted} mb-6 text-center`}>
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
      />

      <div
        className={`mt-8 border rounded-3xl p-8 ${themeClasses.panel} ${themeClasses.border}`}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-yellow-500 p-2 rounded-xl">
            <Activity className="text-black" size={20} />
          </div>

          <h3 className="text-2xl font-semibold">AI Root Cause Analysis</h3>
        </div>
      </div>
    </>
  );
}

function LogsTable({
  logs,
  getBadgeColor,
  hasSearch,
  themeClasses,
  totalLogCount,
}) {
  return (
    <div
      className={`border rounded-3xl overflow-hidden ${themeClasses.panel} ${themeClasses.border}`}
    >
      <div className={`p-6 border-b ${themeClasses.border}`}>
        <h3 className="text-xl font-semibold">Recent AI Detected Incidents</h3>
      </div>

      <div className="overflow-auto">
        <table className="w-full">
          <thead className={`${themeClasses.tableHead} text-sm`}>
            <tr>
              <th className="text-left p-5">Severity</th>
              <th className="text-left p-5">Service</th>
              <th className="text-left p-5">Message</th>
              <th className="text-left p-5">Time</th>
            </tr>
          </thead>

          <tbody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className={`border-t transition ${themeClasses.rowBorder} ${themeClasses.rowHover}`}
                >
                  <td className="p-5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs border ${getBadgeColor(
                        log.level
                      )}`}
                    >
                      {log.level}
                    </span>
                  </td>

                  <td className="p-5">{log.service}</td>

                  <td className="p-5">{log.message}</td>

                  <td className={`p-5 ${themeClasses.muted}`}>{log.time}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className={`border-t p-8 text-center ${themeClasses.rowBorder} ${themeClasses.muted}`}
                >
                  {getEmptyLogMessage(hasSearch, totalLogCount)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getEmptyLogMessage(hasSearch, totalLogCount) {
  if (hasSearch) return "No logs match your search.";
  if (totalLogCount === 0) return "Upload a .log file to search its entries.";
  return "No logs available.";
}
