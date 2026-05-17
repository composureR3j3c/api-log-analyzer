import {
  BrainCircuit,
  CircleAlert,
  GitBranch,
  Lightbulb,
  Radar,
  Sparkles,
} from "lucide-react";

export default function IncidentAiSummary({ logs, files, themeClasses }) {
  const summary = buildIncidentSummary(logs, files);

  return (
    <section
      className={`border rounded-3xl p-6 mb-8 ${themeClasses.panel} ${themeClasses.border}`}
      aria-labelledby="incident-ai-summary-title"
    >
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="bg-yellow-500 p-3 rounded-2xl text-black shadow-lg shadow-yellow-500/10">
            <BrainCircuit size={24} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 id="incident-ai-summary-title" className="text-xl font-semibold">
                AI Incident Analyst
              </h3>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${summary.badgeClass}`}
              >
                <Sparkles size={13} />
                {summary.assessment}
              </span>
            </div>

            <p className="mt-3 max-w-3xl text-lg font-semibold leading-7">
              {summary.headline}
            </p>
            <p className={`${themeClasses.muted} mt-2 max-w-3xl`}>
              {summary.reasoning}
            </p>
          </div>
        </div>

        <div className={`rounded-2xl p-4 min-w-full lg:min-w-[280px] ${themeClasses.panelAlt}`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className={`${themeClasses.muted} text-xs uppercase tracking-wide`}>
                Confidence
              </p>
              <p className="mt-1 text-3xl font-bold">{summary.confidence}%</p>
            </div>
            <div className="h-14 w-14 rounded-full border-4 border-yellow-500/70 flex items-center justify-center text-sm font-bold text-yellow-500">
              AI
            </div>
          </div>
          <div className={`mt-4 h-2 rounded-full overflow-hidden ${themeClasses.panel}`}>
            <div
              className="h-full rounded-full bg-yellow-500"
              style={{ width: `${summary.confidence}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4 mt-6">
        <div className={`rounded-2xl p-5 ${themeClasses.panelAlt}`}>
          <div className="flex items-center gap-2 text-yellow-500">
            <Lightbulb size={18} />
            <p className="text-sm font-semibold uppercase tracking-wide">
              Suspected cause
            </p>
          </div>
          <p className="mt-3 font-semibold">{summary.suspectedCause}</p>
          <p className={`${themeClasses.muted} mt-2 text-sm`}>
            {summary.causeDetail}
          </p>
        </div>

        <div className={`rounded-2xl p-5 ${themeClasses.panelAlt}`}>
          <div className="flex items-center gap-2 text-yellow-500">
            <Radar size={18} />
            <p className="text-sm font-semibold uppercase tracking-wide">
              Signals detected
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {summary.signals.map((signal) => (
              <span
                key={signal}
                className={`rounded-full border px-3 py-1 text-sm ${themeClasses.border}`}
              >
                {signal}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        {summary.actions.map((action) => (
          <ActionCard key={action.label} action={action} themeClasses={themeClasses} />
        ))}
      </div>
    </section>
  );
}

function ActionCard({ action, themeClasses }) {
  return (
    <div className={`rounded-2xl p-4 ${themeClasses.panelAlt}`}>
      <div className="flex items-center gap-2">
        <div className={`rounded-xl p-2 ${action.iconClass}`}>
          {action.icon}
        </div>
        <p className="text-sm font-semibold">{action.label}</p>
      </div>
      <p className={`${themeClasses.muted} mt-3 text-sm`}>
        {action.value}
      </p>
    </div>
  );
}

function buildIncidentSummary(logs, files) {
  const incidentLogs = logs.filter((log) => log.level !== "Info");
  const criticalCount = countByLevel(incidentLogs, "Critical");
  const warningCount = countByLevel(incidentLogs, "Warning");
  const securityCount = countByLevel(incidentLogs, "Security");
  const affectedServices = new Set(incidentLogs.map((log) => log.service)).size;
  const topService = getTopService(incidentLogs);
  const assessment = getAssessment(criticalCount, securityCount, warningCount);

  if (incidentLogs.length === 0) {
    return {
      assessment: "No active risk",
      badgeClass: "bg-green-500/15 text-green-400 border-green-500/30",
      confidence: files.length > 0 ? 84 : 0,
      headline:
        files.length > 0
          ? "The active log file looks stable."
          : "AI analysis is waiting for incident data.",
      reasoning:
        files.length > 0
          ? "No critical, warning, or security patterns were detected after filtering the active file."
          : "Upload a log file to generate a causal readout and prioritized response path.",
      suspectedCause: "No incident pattern detected",
      causeDetail:
        files.length > 0
          ? "The model did not find enough evidence to infer an operational or security cause."
          : "There are no log entries available for pattern analysis yet.",
      signals: files.length > 0 ? ["Clean incident queue", "No active severity"] : ["No active file"],
      actions: [
        {
          label: "Next step",
          value: files.length > 0 ? "Keep monitoring this source." : "Upload a .log file.",
          icon: <GitBranch size={16} />,
          iconClass: "bg-green-500/15 text-green-400",
        },
        {
          label: "Focus area",
          value: "No service requires immediate investigation.",
          icon: <Radar size={16} />,
          iconClass: "bg-yellow-500/15 text-yellow-400",
        },
        {
          label: "Escalation",
          value: "No escalation recommended.",
          icon: <CircleAlert size={16} />,
          iconClass: "bg-slate-500/15 text-slate-400",
        },
      ],
    };
  }

  const diagnosis = getDiagnosis({
    affectedServices,
    criticalCount,
    incidentLogs,
    securityCount,
    topService,
    warningCount,
  });

  return {
    assessment,
    badgeClass: getRiskBadgeClass(assessment),
    confidence: getConfidence(incidentLogs, criticalCount, securityCount),
    headline: diagnosis.headline,
    reasoning: diagnosis.reasoning,
    suspectedCause: diagnosis.suspectedCause,
    causeDetail: diagnosis.causeDetail,
    signals: diagnosis.signals,
    actions: [
      {
        label: "Investigate first",
        value: getRecommendedAction(criticalCount, securityCount),
        icon: <GitBranch size={16} />,
        iconClass: "bg-yellow-500/15 text-yellow-400",
      },
      {
        label: "Correlate with",
        value: `${topService} deploys, dependencies, and recent traffic changes.`,
        icon: <Radar size={16} />,
        iconClass: "bg-purple-500/15 text-purple-300",
      },
      {
        label: "Escalation",
        value: getEscalationAdvice(criticalCount, securityCount, warningCount),
        icon: <CircleAlert size={16} />,
        iconClass: "bg-red-500/15 text-red-400",
      },
    ],
  };
}

function countByLevel(logs, level) {
  return logs.filter((log) => log.level === level).length;
}

function getTopService(logs) {
  if (logs.length === 0) return "None";

  const serviceCounts = logs.reduce((counts, log) => {
    counts.set(log.service, (counts.get(log.service) || 0) + 1);
    return counts;
  }, new Map());

  return [...serviceCounts.entries()].sort(
    (left, right) => right[1] - left[1] || left[0].localeCompare(right[0])
  )[0][0];
}

function getAssessment(criticalCount, securityCount, warningCount) {
  if (criticalCount > 0 && securityCount > 0) return "Compound incident";
  if (criticalCount > 0) return "High risk";
  if (securityCount > 0) return "Security review";
  if (warningCount > 0) return "Needs attention";
  return "No active risk";
}

function getRiskBadgeClass(assessment) {
  if (assessment === "Compound incident" || assessment === "High risk") {
    return "bg-red-500/15 text-red-400 border-red-500/30";
  }

  if (assessment === "Security review") {
    return "bg-purple-500/15 text-purple-300 border-purple-500/30";
  }

  return "bg-yellow-500/15 text-yellow-300 border-yellow-500/30";
}

function getDiagnosis({
  affectedServices,
  criticalCount,
  incidentLogs,
  securityCount,
  topService,
  warningCount,
}) {
  const incidentCount = incidentLogs.length;
  const repeatedService = incidentLogs.filter((log) => log.service === topService).length;
  const messages = incidentLogs.map((log) => log.message).join(" ").toLowerCase();
  const hasTimeoutPattern = /timeout|retry|slow|degraded/.test(messages);
  const hasAuthPattern = /auth|login|denied|forbidden|unauthorized/.test(messages);
  const hasFailurePattern = /fatal|critical|exception|error|failed|outofmemory/.test(messages);

  if (criticalCount > 0 && securityCount > 0) {
    return {
      headline: "Critical failures and security events are appearing together.",
      reasoning: `${topService} is the strongest cluster, with ${repeatedService} of ${incidentCount} incident entries. The overlap suggests an outage path that may also affect access or authentication flows.`,
      suspectedCause: "Service failure with security-side effects",
      causeDetail: `AI is weighting ${criticalCount} critical and ${securityCount} security events across ${affectedServices} services.`,
      signals: getSignals({
        affectedServices,
        criticalCount,
        hasAuthPattern,
        hasFailurePattern,
        hasTimeoutPattern,
        repeatedService,
        securityCount,
        topService,
        warningCount,
      }),
    };
  }

  if (criticalCount > 0) {
    return {
      headline: `${topService} is likely driving the current incident.`,
      reasoning: `${criticalCount} critical entries point to a failure path rather than background noise. AI is prioritizing this service because it appears most often in the active incident queue.`,
      suspectedCause: hasFailurePattern
        ? "Runtime or dependency failure"
        : "Service instability",
      causeDetail: `The model found repeated high-severity evidence in ${topService}, spanning ${affectedServices} affected services.`,
      signals: getSignals({
        affectedServices,
        criticalCount,
        hasAuthPattern,
        hasFailurePattern,
        hasTimeoutPattern,
        repeatedService,
        securityCount,
        topService,
        warningCount,
      }),
    };
  }

  if (securityCount > 0) {
    return {
      headline: "The strongest pattern is suspicious access activity.",
      reasoning: `${securityCount} security entries were detected, with ${topService} as the leading source. AI is treating authentication and access language as the primary incident signal.`,
      suspectedCause: hasAuthPattern
        ? "Authentication or authorization anomaly"
        : "Security-sensitive service activity",
      causeDetail: `The model found security language across ${affectedServices} services and ranked ${topService} as the most relevant source.`,
      signals: getSignals({
        affectedServices,
        criticalCount,
        hasAuthPattern,
        hasFailurePattern,
        hasTimeoutPattern,
        repeatedService,
        securityCount,
        topService,
        warningCount,
      }),
    };
  }

  return {
    headline: "The incident looks like early service degradation.",
    reasoning: `${warningCount} warning entries were found before critical severity appeared. AI is treating this as a watch-list incident unless the same service continues to repeat.`,
    suspectedCause: hasTimeoutPattern
      ? "Latency, timeout, or retry buildup"
      : "Operational degradation",
    causeDetail: `${topService} has the highest warning concentration among ${affectedServices} affected services.`,
    signals: getSignals({
      affectedServices,
      criticalCount,
      hasAuthPattern,
      hasFailurePattern,
      hasTimeoutPattern,
      repeatedService,
      securityCount,
      topService,
      warningCount,
    }),
  };
}

function getRecommendedAction(criticalCount, securityCount) {
  if (criticalCount > 0) return "Start with critical failures and recent service errors.";
  if (securityCount > 0) return "Review access failures and suspicious authentication events.";
  return "Watch warning trends and confirm service stability.";
}

function getConfidence(logs, criticalCount, securityCount) {
  const serviceCount = new Set(logs.map((log) => log.service)).size;
  const severityBoost = criticalCount > 0 || securityCount > 0 ? 18 : 8;
  const sampleBoost = Math.min(logs.length * 4, 24);
  const scopePenalty = Math.min(serviceCount * 3, 12);

  return Math.max(52, Math.min(96, 58 + severityBoost + sampleBoost - scopePenalty));
}

function getSignals({
  affectedServices,
  criticalCount,
  hasAuthPattern,
  hasFailurePattern,
  hasTimeoutPattern,
  repeatedService,
  securityCount,
  topService,
  warningCount,
}) {
  const signals = [
    `${topService} cluster`,
    `${affectedServices} affected ${affectedServices === 1 ? "service" : "services"}`,
  ];

  if (criticalCount > 0) signals.push(`${criticalCount} critical`);
  if (securityCount > 0) signals.push(`${securityCount} security`);
  if (warningCount > 0) signals.push(`${warningCount} warning`);
  if (repeatedService > 1) signals.push(`${repeatedService} repeated source events`);
  if (hasFailurePattern) signals.push("Failure language");
  if (hasAuthPattern) signals.push("Access language");
  if (hasTimeoutPattern) signals.push("Timeout or retry pattern");

  return signals.slice(0, 6);
}

function getEscalationAdvice(criticalCount, securityCount, warningCount) {
  if (criticalCount > 0 && securityCount > 0) {
    return "Escalate to service owner and security reviewer.";
  }

  if (criticalCount > 0) return "Escalate to the owning service team.";
  if (securityCount > 0) return "Escalate if access failures continue.";
  if (warningCount > 3) return "Escalate if warnings keep repeating.";
  return "No escalation unless the pattern grows.";
}
