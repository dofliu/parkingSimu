import { useSimulationStore } from '../store/simulationStore';

type SettingsDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export const SettingsDrawer = ({ open, onClose }: SettingsDrawerProps) => {
  const { sensors, gates } = useSimulationStore((state) => ({
    sensors: state.sensors,
    gates: state.gates,
  }));

  return (
    <aside className={`settings-drawer ${open ? 'open' : ''}`}>
      <div className="settings-header">
        <h3>設備狀態</h3>
        <button onClick={onClose}>關閉</button>
      </div>
      <div className="settings-section">
        <h4>感測器</h4>
        {sensors.map((sensor) => (
          <div key={sensor.id} className="settings-item">
            <span>{sensor.label}</span>
            <span className={sensor.faulty ? 'status error' : 'status ok'}>
              {sensor.faulty ? '故障' : '正常'}
            </span>
          </div>
        ))}
      </div>
      <div className="settings-section">
        <h4>柵欄</h4>
        {gates.map((gate) => (
          <div key={gate.id} className="settings-item">
            <span>{gate.label}</span>
            <span className={gate.faulty ? 'status error' : 'status ok'}>
              {gate.faulty ? '故障' : gate.state === 'open' ? '開啟' : '關閉'}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
};
