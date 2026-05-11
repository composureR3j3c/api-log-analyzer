import { ShieldAlert, ShieldCheck, UserX } from "lucide-react";

export default function SecurityPage({
  logs,
  files,
  getBadgeColor,
  themeClasses,
}) {
  const securityLogs = logs.filter(
    (log) =>
      log.level === "Security" ||
      /auth|login|denied|forbidden|unauthorized|attack|security/i.test(
        log.message
      )
  );
  const affectedServices = new Set(securityLogs.map((log) => log.service)).size;
  const failedAccessCount = securityLogs.filter((log) =>
    /failed|denied|forbidden|unauthorized|login/i.test(log.message)
  ).length;

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Security</h2>
        <p className={`${themeClasses.muted} mt-1`}>
          Track authentication failures, suspicious requests, and access alerts
          from uploaded logs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <MetricCard
          label="Security Events"
          value={securityLogs.length}
          icon={<ShieldAlert />}
          themeClasses={themeClasses}
        />
        <MetricCard
          label="Access Failures"
          value={failedAccessCount}
          icon={<UserX />}
          themeClasses={themeClasses}
        />
        <MetricCard
          label="Affected Services"
          value={affectedServices}
          icon={<ShieldCheck />}
          themeClasses={themeClasses}
        />
      </div>

      <div
        className={`border rounded-3xl overflow-hidden ${themeClasses.panel} ${themeClasses.border}`}
      >
        <div className={`p-6 border-b ${themeClasses.border}`}>
          <h3 className="text-xl font-semibold">Security Timeline</h3>
        </div>

        {securityLogs.length > 0 ? (
          <div className={`divide-y ${themeClasses.divider}`}>
            {securityLogs.map((log) => (
              <div key={log.id} className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs border ${getBadgeColor(
                        log.level
                      )}`}
                    >
                      {log.level}
                    </span>
                    <p className="mt-3 font-semibold">{log.message}</p>
                    <p className={`${themeClasses.muted} text-sm mt-1`}>
                      {log.service}
                    </p>
                  </div>

                  <p className={`${themeClasses.muted} text-sm`}>{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-lg font-semibold">No security alerts found</p>
            <p className={`${themeClasses.muted} mt-2`}>
              {files.length > 0
                ? "The active file has no matching authentication or access events."
                : "Upload a .log file to scan for security events."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function MetricCard({ label, value, icon, themeClasses }) {
  return (
    <div
      className={`border rounded-3xl p-6 ${themeClasses.panel} ${themeClasses.border}`}
    >
      <div className="bg-yellow-500/20 text-yellow-400 p-3 rounded-2xl w-fit mb-5">
        {icon}
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <p className={`${themeClasses.muted} mt-1`}>{label}</p>
    </div>
  );
}
