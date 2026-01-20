import { useSimulationStore } from '../store/simulationStore';
import { formatTime } from '../utils/sim';

export const EventLogPanel = () => {
  const logs = useSimulationStore((state) => state.logs);

  return (
    <section className="panel log-panel">
      <h2>事件 Log</h2>
      <div className="log-list">
        {logs.map((log) => (
          <div key={log.id} className={`log-item log-${log.level}`}>
            <span className="log-time">{formatTime(log.timeMs)}</span>
            <span className="log-message">{log.message}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
