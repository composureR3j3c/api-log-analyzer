import { Activity, RefreshCw } from "lucide-react";

export default function StreamingPage({
  logs,
  files,
  getBadgeColor,
  themeClasses,
}) {
  const streamLogs = [...logs].slice(-30).reverse();
  const currentFile = files[0]?.name || "No file selected";

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold">Streaming</h2>
          <p className={`${themeClasses.muted} mt-1`}>
            Replay the latest parsed entries from uploaded files in a live-style
            stream.
          </p>
        </div>

        <div
          className={`inline-flex items-center gap-2 border rounded-2xl px-4 py-3 ${themeClasses.panel} ${themeClasses.border}`}
        >
          <RefreshCw className="text-yellow-400" size={18} />
          <span className="text-sm font-semibold">{streamLogs.length} events</span>
        </div>
      </div>

      <div
        className={`border rounded-3xl overflow-hidden ${themeClasses.panel} ${themeClasses.border}`}
      >
        <div className={`p-6 border-b ${themeClasses.border}`}>
          <h3 className="text-xl font-semibold">Live Log Replay</h3>
          <p className={`${themeClasses.muted} mt-1 text-sm`}>
            Source: {currentFile}
          </p>
        </div>

        {streamLogs.length > 0 ? (
          <div className={`divide-y ${themeClasses.divider}`}>
            {streamLogs.map((log) => (
              <div
                key={log.id}
                className={`p-5 transition ${themeClasses.rowHover}`}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-3 md:w-40">
                    <Activity className="text-green-400" size={18} />
                    <span className={`${themeClasses.muted} text-sm`}>
                      {log.time}
                    </span>
                  </div>

                  <span
                    className={`w-fit px-3 py-1 rounded-full text-xs border ${getBadgeColor(
                      log.level
                    )}`}
                  >
                    {log.level}
                  </span>

                  <p className="font-semibold md:w-40 ">{log.service}</p>
                  <p className={`${themeClasses.muted} flex-1 word-break break-all`}>
                    {log.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-lg font-semibold">No stream data yet</p>
            <p className={`${themeClasses.muted} mt-2`}>
              Upload a .log file to replay parsed events here.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
