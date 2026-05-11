import { AlertTriangle, FileWarning, ShieldAlert } from "lucide-react";

export default function IncidentsPage({
  logs,
  files,
  getBadgeColor,
  themeClasses,
}) {
  const incidentLogs = logs.filter((log) => log.level !== "Info");
  const criticalCount = incidentLogs.filter(
    (log) => log.level === "Critical"
  ).length;
  const warningCount = incidentLogs.filter((log) => log.level === "Warning")
    .length;
  const securityCount = incidentLogs.filter((log) => log.level === "Security")
    .length;

  return (
    <>
      <PageHeader
        title="Incidents"
        description="Review detected incidents from the active uploaded log file."
        themeClasses={themeClasses}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <SummaryCard
          label="Critical"
          value={criticalCount}
          icon={<AlertTriangle />}
          tone="text-red-400"
          themeClasses={themeClasses}
        />
        <SummaryCard
          label="Warnings"
          value={warningCount}
          icon={<FileWarning />}
          tone="text-yellow-400"
          themeClasses={themeClasses}
        />
        <SummaryCard
          label="Security"
          value={securityCount}
          icon={<ShieldAlert />}
          tone="text-purple-400"
          themeClasses={themeClasses}
        />
      </div>

      <div
        className={`border rounded-3xl overflow-hidden ${themeClasses.panel} ${themeClasses.border}`}
      >
        <div className={`p-6 border-b ${themeClasses.border}`}>
          <h3 className="text-xl font-semibold">Incident Queue</h3>
          <p className={`${themeClasses.muted} mt-1 text-sm`}>
            Active file entries excluding informational logs.
          </p>
        </div>

        {incidentLogs.length > 0 ? (
          <div className={`divide-y ${themeClasses.divider}`}>
            {incidentLogs.map((log) => (
              <div
                key={log.id}
                className={`p-5 transition ${themeClasses.rowHover}`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs border ${getBadgeColor(
                        log.level
                      )}`}
                    >
                      {log.level}
                    </span>
                    <p className="mt-3 font-semibold">{log.message}</p>
                    <p className={`${themeClasses.muted} mt-1 text-sm`}>
                      {log.service}
                    </p>
                  </div>

                  <div className={`${themeClasses.muted} text-sm md:text-right`}>
                    <p>{log.time}</p>
                    <p className="mt-1">Priority {getPriority(log.level)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No incidents detected"
            message={getEmptyMessage(files)}
            themeClasses={themeClasses}
          />
        )}
      </div>
    </>
  );
}

function PageHeader({ title, description, themeClasses }) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold">{title}</h2>
      <p className={`${themeClasses.muted} mt-1`}>{description}</p>
    </div>
  );
}

function SummaryCard({ label, value, icon, tone, themeClasses }) {
  return (
    <div
      className={`border rounded-3xl p-6 ${themeClasses.panel} ${themeClasses.border}`}
    >
      <div className={`mb-5 bg-yellow-500/20 p-3 rounded-2xl w-fit ${tone}`}>
        {icon}
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <p className={`${themeClasses.muted} mt-1`}>{label}</p>
    </div>
  );
}

function EmptyState({ title, message, themeClasses }) {
  return (
    <div className="p-10 text-center">
      <p className="text-lg font-semibold">{title}</p>
      <p className={`${themeClasses.muted} mt-2`}>{message}</p>
    </div>
  );
}

function getPriority(level) {
  if (level === "Critical") return "P1";
  if (level === "Security") return "P2";
  return "P3";
}

function getEmptyMessage(files) {
  return files.length > 0
    ? "Open a file with errors, warnings, or security events to populate this queue."
    : "Upload a .log file to populate this queue.";
}
