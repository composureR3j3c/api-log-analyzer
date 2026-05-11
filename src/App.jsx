// App.jsx
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Upload,
  Search,
  Activity,
  ShieldAlert,
  FileWarning,
  FolderOpen,
  Moon,
  Server,
  RefreshCw,
  Sun,
} from "lucide-react";

const mockLogs = [];
const storedFilesKey = "logmind.recentFiles";
const storedActiveFileKey = "logmind.activeFile";

export default function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [theme, setTheme] = useState("dark");
  const [search, setSearch] = useState("");
  const [recentFiles, setRecentFiles] = useState(readStoredRecentFiles);
  const [uploadedFile, setUploadedFile] = useState(readStoredActiveFileName);
  const [logs, setLogs] = useState(() => {
    const activeFileName = readStoredActiveFileName();
    const activeFile = readStoredRecentFiles().find(
      (file) => file.name === activeFileName
    );

    return activeFile?.logs || mockLogs;
  });
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const filteredLogs = logs.filter((log) =>
    [log.level, log.service, log.message, log.time]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const criticalCount = logs.filter((log) => log.level === "Critical").length;
  const securityCount = logs.filter((log) => log.level === "Security").length;
  const serviceCount = new Set(logs.map((log) => log.service)).size;
  const isDark = theme === "dark";
  const themeClasses = getThemeClasses(theme);

  useEffect(() => {
    try {
      localStorage.setItem(storedFilesKey, JSON.stringify(recentFiles));
    } catch {
      // Browser storage can fail in private mode or when quota is exhausted.
    }
  }, [recentFiles]);

  useEffect(() => {
    try {
      if (uploadedFile) {
        localStorage.setItem(storedActiveFileKey, uploadedFile);
      } else {
        localStorage.removeItem(storedActiveFileKey);
      }
    } catch {
      // Browser storage can fail in private mode or when quota is exhausted.
    }
  }, [uploadedFile]);

  const openFilePicker = () => {
    setUploadError("");
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".log")) {
      setUploadError("Please upload a .log file.");
      return;
    }

    try {
      const text = await file.text();
      const parsedLogs = parseLogFile(text);

      if (parsedLogs.length === 0) {
        setUploadError("No readable log entries were found in that file.");
        return;
      }

      setLogs(parsedLogs);
      setUploadedFile(file.name);
      setRecentFiles((files) => {
        const uploadedLogFile = {
          id: `${file.name}-${file.lastModified}-${Date.now()}`,
          name: file.name,
          size: file.size,
          uploadedAt: new Date().toLocaleString([], {
            dateStyle: "medium",
            timeStyle: "short",
          }),
          entryCount: parsedLogs.length,
          logs: parsedLogs,
        };

        return [
          uploadedLogFile,
          ...files.filter((recentFile) => recentFile.name !== file.name),
        ].slice(0, 12);
      });
      setUploadError("");
      setSearch("");
    } catch {
      setUploadError("Could not read that log file. Please try another one.");
    }
  };

  const handleInputChange = (event) => {
    handleFileUpload(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleFileUpload(event.dataTransfer.files?.[0]);
  };

  const openRecentFile = (file) => {
    setLogs(file.logs);
    setUploadedFile(file.name);
    setUploadError("");
    setSearch("");
    setActiveView("dashboard");
  };

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  const getBadgeColor = (level) => {
    switch (level) {
      case "Critical":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Warning":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "Security":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  return (
    <div className={`min-h-screen ${themeClasses.page}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".log"
        onChange={handleInputChange}
        className="hidden"
        aria-label="Upload .log file"
      />

      {/* Sidebar */}
      <div className="flex">
        <aside
          className={`w-72 border-r min-h-screen p-5 ${themeClasses.sidebar} ${themeClasses.border}`}
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-yellow-500 p-2 rounded-xl">
              <Activity className="text-black" />
            </div>

            <div>
              <h1 className="text-xl font-bold">LogMind AI</h1>
              <p className={`text-xs ${themeClasses.muted}`}>
                AI Powered Log Analyzer
              </p>
            </div>
          </div>

          <nav className="space-y-3">
            <SidebarItem
              icon={<Activity size={18} />}
              label="Dashboard"
              active={activeView === "dashboard"}
              onClick={() => setActiveView("dashboard")}
              themeClasses={themeClasses}
            />
            <SidebarItem
              icon={<FileWarning size={18} />}
              label="Incidents"
              themeClasses={themeClasses}
            />
            <SidebarItem
              icon={<FolderOpen size={18} />}
              label="Files"
              active={activeView === "files"}
              onClick={() => setActiveView("files")}
              themeClasses={themeClasses}
            />
            <SidebarItem
              icon={<ShieldAlert size={18} />}
              label="Security"
              themeClasses={themeClasses}
            />
            <SidebarItem
              icon={<Server size={18} />}
              label="Services"
              themeClasses={themeClasses}
            />
            <SidebarItem
              icon={<RefreshCw size={18} />}
              label="Streaming"
              themeClasses={themeClasses}
            />
          </nav>

          <div className="mt-10 space-y-3">
            <button
              type="button"
              onClick={openFilePicker}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-3 rounded-2xl transition"
            >
              + Upload Logs
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className={`w-full flex items-center justify-center gap-2 border px-4 py-3 rounded-2xl font-semibold transition ${themeClasses.border} ${themeClasses.subtleButton}`}
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-8">
          {activeView === "files" ? (
            <FilesView
              files={recentFiles}
              onOpenFile={openRecentFile}
              onUpload={openFilePicker}
              themeClasses={themeClasses}
            />
          ) : (
            <>
              {/* Top Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-3xl font-bold">
                    AI Incident Dashboard
                  </h2>
                  <p className={`${themeClasses.muted} mt-1`}>
                    Monitor logs, detect anomalies, and analyze incidents.
                  </p>
                </div>

                <div className="relative w-full md:w-[380px]">
                  <Search
                    className={`absolute left-4 top-3.5 ${themeClasses.muted}`}
                    size={18}
                  />

                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`w-full border rounded-2xl pl-11 pr-4 py-3 outline-none focus:border-yellow-500 ${themeClasses.input} ${themeClasses.border}`}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
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
              </div>

              {/* Upload Section */}
              <div
                className={`border rounded-3xl p-8 mb-8 ${themeClasses.panel} ${themeClasses.border}`}
              >
                <div
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-16 px-5 ${themeClasses.dashedBorder}`}
                >
                  <Upload size={42} className="text-yellow-500 mb-4" />

                  <h3 className="text-xl font-semibold mb-2">
                    Upload Log Files
                  </h3>

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

              {/* Logs Table */}
              <LogsTable
                logs={filteredLogs}
                getBadgeColor={getBadgeColor}
                themeClasses={themeClasses}
              />

              {/* AI Analysis Section */}
              <div
                className={`mt-8 border rounded-3xl p-8 ${themeClasses.panel} ${themeClasses.border}`}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="bg-yellow-500 p-2 rounded-xl">
                    <Activity className="text-black" size={20} />
                  </div>

                  <h3 className="text-2xl font-semibold">
                    AI Root Cause Analysis
                  </h3>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function parseLogFile(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 200)
    .map((line, index) => ({
      id: `uploaded-${index}-${line.slice(0, 16)}`,
      level: detectLevel(line),
      service: detectService(line),
      message: stripTimestamp(line),
      time: detectTime(line),
    }));
}

function detectLevel(line) {
  if (/fatal|critical|exception|error|failed|outofmemory/i.test(line)) {
    return "Critical";
  }

  if (/warn|timeout|retry|slow|degraded/i.test(line)) {
    return "Warning";
  }

  if (/auth|login|denied|forbidden|unauthorized|attack|security/i.test(line)) {
    return "Security";
  }

  return "Info";
}

function detectService(line) {
  const bracketedService = line.match(/\[([a-z][a-z0-9_-]{1,30})\]/i)?.[1];
  const namedService = line.match(
    /\b(?:service|app|component)=([a-z][a-z0-9_-]{1,30})\b/i
  )?.[1];

  return bracketedService || namedService || "Uploaded Log";
}

function detectTime(line) {
  return (
    line.match(/\b\d{1,2}:\d{2}(?::\d{2})?\s?(?:AM|PM)?\b/i)?.[0] || "Now"
  );
}

function stripTimestamp(line) {
  return line
    .replace(/^\d{4}-\d{2}-\d{2}[T\s]\d{1,2}:\d{2}:\d{2}(?:\.\d+)?Z?\s*/, "")
    .replace(/^\[?\d{1,2}:\d{2}(?::\d{2})?\]?\s*/, "");
}

function readStoredRecentFiles() {
  try {
    const storedFiles = JSON.parse(localStorage.getItem(storedFilesKey) || "[]");

    if (!Array.isArray(storedFiles)) return [];

    return storedFiles.filter(isStoredLogFile);
  } catch {
    return [];
  }
}

function readStoredActiveFileName() {
  try {
    return localStorage.getItem(storedActiveFileKey) || "";
  } catch {
    return "";
  }
}

function isStoredLogFile(file) {
  return (
    file &&
    typeof file.id === "string" &&
    typeof file.name === "string" &&
    typeof file.size === "number" &&
    typeof file.uploadedAt === "string" &&
    typeof file.entryCount === "number" &&
    Array.isArray(file.logs)
  );
}

function getThemeClasses(theme) {
  if (theme === "light") {
    return {
      page: "bg-[#f6f7fb] text-slate-950",
      sidebar: "bg-white",
      panel: "bg-white",
      panelAlt: "bg-slate-100",
      input: "bg-white text-slate-950 placeholder:text-slate-400",
      border: "border-slate-200",
      dashedBorder: "border-slate-300",
      muted: "text-slate-500",
      tableHead: "bg-slate-100 text-slate-500",
      divider: "divide-slate-200",
      rowBorder: "border-slate-100",
      rowHover: "hover:bg-slate-50",
      navIdle: "hover:bg-slate-100 text-slate-700",
      navActive: "bg-yellow-100 text-yellow-800",
      subtleButton: "bg-white hover:bg-slate-100 text-slate-800",
      emptyIcon: "text-slate-400",
    };
  }

  return {
    page: "bg-[#0b1020] text-white",
    sidebar: "bg-[#111827]",
    panel: "bg-[#111827]",
    panelAlt: "bg-[#151d31]",
    input: "bg-[#151d31] text-white placeholder:text-gray-400",
    border: "border-white/10",
    dashedBorder: "border-white/10",
    muted: "text-gray-400",
    tableHead: "bg-[#151d31] text-gray-400",
    divider: "divide-white/5",
    rowBorder: "border-white/5",
    rowHover: "hover:bg-white/5",
    navIdle: "hover:bg-white/5 text-white",
    navActive: "bg-yellow-500/15 text-yellow-300",
    subtleButton: "bg-white/5 hover:bg-white/10 text-white",
    emptyIcon: "text-gray-500",
  };
}

function LogsTable({ logs, getBadgeColor, themeClasses }) {
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
                  No logs match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilesView({ files, onOpenFile, onUpload, themeClasses }) {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold">Uploaded Files</h2>
          <p className={`${themeClasses.muted} mt-1`}>
            Browse recently uploaded .log files and reopen their parsed entries.
          </p>
        </div>

        <button
          type="button"
          onClick={onUpload}
          className="inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-3 rounded-2xl font-semibold transition"
        >
          <Upload size={18} />
          Upload File
        </button>
      </div>

      <div
        className={`border rounded-3xl overflow-hidden ${themeClasses.panel} ${themeClasses.border}`}
      >
        <div className={`p-6 border-b ${themeClasses.border}`}>
          <h3 className="text-xl font-semibold">Recent Uploads</h3>
        </div>

        {files.length > 0 ? (
          <div className={`divide-y ${themeClasses.divider}`}>
            {files.map((file) => (
              <button
                key={file.id}
                type="button"
                onClick={() => onOpenFile(file)}
                className={`w-full flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 text-left transition ${themeClasses.rowHover}`}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-yellow-500/20 text-yellow-400 p-3 rounded-2xl">
                    <FileWarning size={22} />
                  </div>

                  <div>
                    <p className="font-semibold">{file.name}</p>
                    <p className={`text-sm ${themeClasses.muted} mt-1`}>
                      {file.entryCount} entries parsed
                    </p>
                  </div>
                </div>

                <div className={`text-sm ${themeClasses.muted} md:text-right`}>
                  <p>{formatFileSize(file.size)}</p>
                  <p className="mt-1">{file.uploadedAt}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <FolderOpen
              className={`mx-auto mb-4 ${themeClasses.emptyIcon}`}
              size={42}
            />
            <p className="text-lg font-semibold">No uploaded files yet</p>
            <p className={`mt-2 ${themeClasses.muted}`}>
              Upload a .log file to see it listed here.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function SidebarItem({ icon, label, active = false, onClick, themeClasses }) {
  const classes = themeClasses || getThemeClasses("dark");

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition text-left ${
        active ? classes.navActive : classes.navIdle
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function StatCard({ title, value, icon, themeClasses }) {
  return (
    <div
      className={`border rounded-3xl p-6 ${themeClasses.panel} ${themeClasses.border}`}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="bg-yellow-500/20 text-yellow-400 p-3 rounded-2xl">
          {icon}
        </div>

        <span className="text-xs text-green-400">+12%</span>
      </div>

      <h3 className="text-3xl font-bold mb-1">{value}</h3>

      <p className={themeClasses.muted}>{title}</p>
    </div>
  );
}
