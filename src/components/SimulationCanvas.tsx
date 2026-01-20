import { useSimulationStore } from '../store/simulationStore';

export const SimulationCanvas = () => {
  const { spots, cars, sensors, gates } = useSimulationStore((state) => ({
    spots: state.spots,
    cars: state.cars,
    sensors: state.sensors,
    gates: state.gates,
  }));

  return (
    <section className="canvas-wrapper">
      <svg viewBox="0 0 800 400" className="parking-canvas">
        <rect x="20" y="40" width="760" height="320" rx="16" className="lot" />
        <rect x="20" y="180" width="760" height="40" className="lane" />
        <text x="40" y="70" className="label">入口</text>
        <text x="700" y="70" className="label">出口</text>

        {spots.map((spot) => (
          <g key={spot.id}>
            <rect
              x={spot.position.x - 30}
              y={spot.position.y - 20}
              width="60"
              height="40"
              rx="6"
              className={spot.occupiedBy ? 'spot occupied' : 'spot'}
            />
            <text x={spot.position.x} y={spot.position.y + 5} className="spot-label">
              {spot.label}
            </text>
          </g>
        ))}

        {gates.map((gate) => (
          <g key={gate.id}>
            <rect
              x={gate.position.x - 14}
              y={gate.position.y - 34}
              width="28"
              height="68"
              rx="4"
              className={`gate ${gate.state} ${gate.faulty ? 'faulty' : ''}`}
            />
            <rect
              x={gate.position.x - 4}
              y={gate.position.y - 50}
              width="8"
              height="16"
              className="gate-pole"
            />
          </g>
        ))}

        {sensors.map((sensor) => (
          <g key={sensor.id}>
            <circle
              cx={sensor.position.x}
              cy={sensor.position.y}
              r="10"
              className={`sensor ${sensor.active ? 'active' : ''} ${sensor.faulty ? 'faulty' : ''}`}
            />
            <text x={sensor.position.x} y={sensor.position.y + 26} className="sensor-label">
              {sensor.label}
            </text>
          </g>
        ))}

        {cars.map((car) => (
          <g
            key={car.id}
            className={`car car-${car.status}`}
            style={{
              transform: `translate(${car.position.x}px, ${car.position.y}px)`,
            }}
          >
            <rect x="-16" y="-8" width="32" height="16" rx="4" className="car-body" />
            <rect x="-12" y="-6" width="24" height="12" rx="3" className="car-window" />
            <text x="0" y="-14" className="car-label">{car.plate}</text>
          </g>
        ))}
      </svg>
    </section>
  );
};
