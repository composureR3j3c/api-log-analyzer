import { AlertTriangle, Server } from "lucide-react";

export default function ServicesPage({ logs, files, themeClasses }) {
  const services = summarizeServices(logs);

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Services</h2>
        <p className={`${themeClasses.muted} mt-1`}>
          Browse monitored services and operational health signals from the
          active uploaded file.
        </p>
      </div>

      <div
        className={`border rounded-3xl overflow-hidden ${themeClasses.panel} ${themeClasses.border}`}
      >
        <div className={`p-6 border-b ${themeClasses.border}`}>
          <h3 className="text-xl font-semibold">Service Health</h3>
          <p className={`${themeClasses.muted} mt-1 text-sm`}>
            Grouped by detected service or component name.
          </p>
        </div>

        {services.length > 0 ? (
          <div className={`divide-y ${themeClasses.divider}`}>
            {services.map((service) => (
              <div
                key={service.name}
                className={`p-5 transition ${themeClasses.rowHover}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-yellow-500/20 text-yellow-400 p-3 rounded-2xl">
                      <Server size={22} />
                    </div>
                    <div>
                      <p className="font-semibold">{service.name}</p>
                      <p className={`${themeClasses.muted} text-sm mt-1`}>
                        {service.total} entries, last seen {service.lastSeen}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm text-center">
                    <ServicePill label="Critical" value={service.critical} />
                    <ServicePill label="Warning" value={service.warning} />
                    <ServicePill label="Security" value={service.security} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <AlertTriangle
              className={`mx-auto mb-4 ${themeClasses.emptyIcon}`}
              size={42}
            />
            <p className="text-lg font-semibold">No service data yet</p>
            <p className={`${themeClasses.muted} mt-2`}>
              {files.length > 0
                ? "Open an uploaded file to summarize its services."
                : "Upload a .log file to summarize monitored services."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function summarizeServices(logs) {
  const serviceMap = new Map();

  logs.forEach((log) => {
    const current = serviceMap.get(log.service) || {
      name: log.service,
      total: 0,
      critical: 0,
      warning: 0,
      security: 0,
      lastSeen: log.time,
    };

    current.total += 1;
    current.lastSeen = log.time;

    if (log.level === "Critical") current.critical += 1;
    if (log.level === "Warning") current.warning += 1;
    if (log.level === "Security") current.security += 1;

    serviceMap.set(log.service, current);
  });

  return [...serviceMap.values()].sort(
    (left, right) =>
      right.critical - left.critical ||
      right.warning - left.warning ||
      right.security - left.security ||
      right.total - left.total
  );
}

function ServicePill({ label, value }) {
  return (
    <div className="min-w-20 rounded-2xl bg-yellow-500/10 px-3 py-2">
      <p className="font-semibold">{value}</p>
      <p className="text-xs text-yellow-500">{label}</p>
    </div>
  );
}
