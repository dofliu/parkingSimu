import { useSimulationStore } from '../store/simulationStore';

const SPEEDS = [1, 2, 5, 10];

type ControlBarProps = {
  onOpenSettings: () => void;
};

export const ControlBar = ({ onOpenSettings }: ControlBarProps) => {
  const { clock, start, pause, reset, setSpeed, generateCar, injectFault } =
    useSimulationStore((state) => ({
      clock: state.clock,
      start: state.start,
      pause: state.pause,
      reset: state.reset,
      setSpeed: state.setSpeed,
      generateCar: state.generateCar,
      injectFault: state.injectFault,
    }));

  return (
    <section className="control-bar">
      <div className="control-group">
        <button onClick={clock.running ? pause : start} className="primary">
          {clock.running ? '暫停' : '開始'}
        </button>
        {SPEEDS.map((speed) => (
          <button
            key={speed}
            onClick={() => setSpeed(speed)}
            className={clock.speed === speed ? 'active' : ''}
          >
            {speed}x
          </button>
        ))}
      </div>
      <div className="control-group">
        <button onClick={reset}>重置</button>
        <button onClick={generateCar}>生成車</button>
        <button onClick={injectFault}>注入故障</button>
        <button onClick={onOpenSettings}>設定</button>
      </div>
    </section>
  );
};
