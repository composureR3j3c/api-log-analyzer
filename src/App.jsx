// App.jsx
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ShieldAlert,
  FileWarning,
  FolderOpen,
  Moon,
  Server,
  RefreshCw,
  Sun,
} from "lucide-react";
import AiChatWidget from "./components/AiChatWidget";
import DashboardPage from "./pages/DashboardPage";
import FilesPage from "./pages/FilesPage";
import IncidentsPage from "./pages/IncidentsPage";
import SecurityPage from "./pages/SecurityPage";
import ServicesPage from "./pages/ServicesPage";
import StreamingPage from "./pages/StreamingPage";

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

  const searchQuery = search.trim().toLowerCase();
  const filteredLogs = searchQuery
    ? logs.filter((log) =>
        [log.level, log.service, log.message, log.time]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery)
      )
    : logs;

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
        setUploadError("No warning, critical, or security entries were found.");
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
    setLogs(excludeInfoLogs(file.logs));
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

  const renderActivePage = () => {
    switch (activeView) {
      case "incidents":
        return (
          <IncidentsPage
            logs={logs}
            files={recentFiles}
            getBadgeColor={getBadgeColor}
            themeClasses={themeClasses}
          />
        );
      case "files":
        return (
          <FilesPage
            files={recentFiles}
            onOpenFile={openRecentFile}
            onUpload={openFilePicker}
            themeClasses={themeClasses}
          />
        );
      case "security":
        return (
          <SecurityPage
            logs={logs}
            files={recentFiles}
            getBadgeColor={getBadgeColor}
            themeClasses={themeClasses}
          />
        );
      case "services":
        return (
          <ServicesPage
            logs={logs}
            files={recentFiles}
            themeClasses={themeClasses}
          />
        );
      case "streaming":
        return (
          <StreamingPage
            logs={logs}
            files={recentFiles}
            getBadgeColor={getBadgeColor}
            themeClasses={themeClasses}
          />
        );
      default:
        return (
          <DashboardPage
            criticalCount={criticalCount}
            filteredLogs={filteredLogs}
            getBadgeColor={getBadgeColor}
            handleDrop={handleDrop}
            openFilePicker={openFilePicker}
            search={search}
            securityCount={securityCount}
            serviceCount={serviceCount}
            setSearch={setSearch}
            themeClasses={themeClasses}
            totalLogCount={logs.length}
            uploadedFile={uploadedFile}
            uploadError={uploadError}
          />
        );
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
              active={activeView === "incidents"}
              onClick={() => setActiveView("incidents")}
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
              active={activeView === "security"}
              onClick={() => setActiveView("security")}
              themeClasses={themeClasses}
            />
            <SidebarItem
              icon={<Server size={18} />}
              label="Services"
              active={activeView === "services"}
              onClick={() => setActiveView("services")}
              themeClasses={themeClasses}
            />
            <SidebarItem
              icon={<RefreshCw size={18} />}
              label="Streaming"
              active={activeView === "streaming"}
              onClick={() => setActiveView("streaming")}
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

        <main className="flex-1 p-8">{renderActivePage()}</main>
      </div>

      <AiChatWidget
        activeView={activeView}
        logs={logs}
        themeClasses={themeClasses}
        uploadedFile={uploadedFile}
      />
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
    }))
    .filter((log) => log.level !== "Info");
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

    return storedFiles.filter(isStoredLogFile).map((file) => {
      const logs = excludeInfoLogs(file.logs);

      return {
        ...file,
        entryCount: logs.length,
        logs,
      };
    });
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

function excludeInfoLogs(logs) {
  return logs.filter((log) => log.level !== "Info");
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
