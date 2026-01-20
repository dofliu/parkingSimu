import { create } from 'zustand';
import {
  Car,
  EventLog,
  Gate,
  Payment,
  Sensor,
  Session,
  SimClock,
  Spot,
  Vector2,
} from '../types/simulation';
import { distance, moveTowards, randomPlate } from '../utils/sim';

const ENTRY_POINT: Vector2 = { x: 60, y: 200 };
const ENTRY_GATE: Vector2 = { x: 140, y: 200 };
const EXIT_GATE: Vector2 = { x: 660, y: 200 };
const EXIT_POINT: Vector2 = { x: 740, y: 200 };

const SPOT_ORIGIN: Vector2 = { x: 240, y: 80 };
const SPOT_GAP_X = 90;
const SPOT_GAP_Y = 90;

const MAX_LOGS = 120;
const PARK_DURATION_RANGE = [15000, 32000];
const MOVE_SPEED = 0.08;

const createSpots = (): Spot[] =>
  Array.from({ length: 8 }, (_, index) => {
    const row = Math.floor(index / 4);
    const col = index % 4;
    return {
      id: `spot-${index + 1}`,
      label: `P${index + 1}`,
      position: {
        x: SPOT_ORIGIN.x + col * SPOT_GAP_X,
        y: SPOT_ORIGIN.y + row * SPOT_GAP_Y,
      },
    };
  });

const createSensors = (): Sensor[] => [
  {
    id: 'sensor-entry',
    label: '入口感測器',
    type: 'entry',
    position: { x: ENTRY_GATE.x - 30, y: ENTRY_GATE.y - 40 },
    active: false,
    faulty: false,
  },
  {
    id: 'sensor-exit',
    label: '出口感測器',
    type: 'exit',
    position: { x: EXIT_GATE.x - 10, y: EXIT_GATE.y + 40 },
    active: false,
    faulty: false,
  },
];

const createGates = (): Gate[] => [
  {
    id: 'gate-entry',
    label: '入口柵欄',
    type: 'entry',
    position: ENTRY_GATE,
    state: 'closed',
    faulty: false,
  },
  {
    id: 'gate-exit',
    label: '出口柵欄',
    type: 'exit',
    position: EXIT_GATE,
    state: 'closed',
    faulty: false,
  },
];

const createClock = (): SimClock => ({
  timeMs: 0,
  tickMs: 100,
  speed: 1,
  running: false,
});

const makeLog = (message: string, level: EventLog['level'] = 'info', timeMs = 0): EventLog => ({
  id: `${timeMs}-${Math.random().toString(16).slice(2)}`,
  timeMs,
  level,
  message,
});

const createInitialState = () => ({
  clock: createClock(),
  cars: [] as Car[],
  spots: createSpots(),
  sensors: createSensors(),
  gates: createGates(),
  sessions: [] as Session[],
  payments: [] as Payment[],
  logs: [makeLog('系統已就緒。', 'info', 0)],
});

export type SimulationState = ReturnType<typeof createInitialState> & {
  tick: () => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  generateCar: () => void;
  injectFault: () => void;
  payLatest: () => void;
};

export const useSimulationStore = create<SimulationState>((set, get) => ({
  ...createInitialState(),
  tick: () => {
    const state = get();
    if (!state.clock.running) {
      return;
    }

    const now = state.clock.timeMs + state.clock.tickMs * state.clock.speed;
    const logs: EventLog[] = [];
    const sensors = state.sensors.map((sensor) => ({ ...sensor, active: false }));
    const gates = state.gates.map((gate) => ({ ...gate }));

    const updateLog = (message: string, level: EventLog['level'] = 'info') => {
      logs.push(makeLog(message, level, now));
    };

    const availableSpot = state.spots.find((spot) => !spot.occupiedBy);
    const entryGate = gates.find((gate) => gate.type === 'entry');
    const exitGate = gates.find((gate) => gate.type === 'exit');

    const cars = state.cars.map((car) => ({ ...car }));
    const spots = state.spots.map((spot) => ({ ...spot }));
    const sessions = state.sessions.map((session) => ({ ...session }));
    const payments = state.payments.map((payment) => ({ ...payment }));

    const findSpot = (spotId?: string) => spots.find((spot) => spot.id === spotId);

    cars.forEach((car) => {
      switch (car.status) {
        case 'queued': {
          if (availableSpot && entryGate && !entryGate.faulty) {
            entryGate.state = 'open';
            car.status = 'entering';
            car.target = ENTRY_GATE;
            car.spotId = availableSpot.id;
            updateLog(`車輛 ${car.plate} 進入入口隊列，準備入場。`);
          }
          break;
        }
        case 'entering': {
          const distanceToGate = distance(car.position, ENTRY_GATE);
          if (distanceToGate < 6) {
            const spot = findSpot(car.spotId);
            if (spot) {
              car.status = 'parking';
              car.target = spot.position;
              updateLog(`車輛 ${car.plate} 通過入口柵欄，前往 ${spot.label}。`);
            }
          }
          break;
        }
        case 'parking': {
          const spot = findSpot(car.spotId);
          if (spot && distance(car.position, spot.position) < 6) {
            car.status = 'parked';
            car.parkedSince = now;
            car.exitReadyAt =
              now +
              PARK_DURATION_RANGE[0] +
              Math.random() * (PARK_DURATION_RANGE[1] - PARK_DURATION_RANGE[0]);
            spot.occupiedBy = car.id;
            const session: Session = {
              id: `session-${car.id}`,
              carId: car.id,
              spotId: spot.id,
              entryTime: now,
              status: 'active',
            };
            car.sessionId = session.id;
            sessions.push(session);
            updateLog(`車輛 ${car.plate} 已停入 ${spot.label}。`);
          }
          break;
        }
        case 'parked': {
          if (car.exitReadyAt && now >= car.exitReadyAt) {
            car.status = 'exiting';
            car.target = EXIT_GATE;
            const spot = findSpot(car.spotId);
            if (spot) {
              spot.occupiedBy = undefined;
            }
            updateLog(`車輛 ${car.plate} 準備離場。`);
          }
          break;
        }
        case 'exiting': {
          if (distance(car.position, EXIT_GATE) < 6) {
            car.status = 'paying';
            const session = sessions.find((item) => item.id === car.sessionId);
            if (session && !payments.find((payment) => payment.sessionId === session.id)) {
              const durationMinutes = Math.ceil((now - session.entryTime) / 60000);
              const amount = Math.max(20, durationMinutes * 15);
              payments.push({
                id: `payment-${session.id}`,
                sessionId: session.id,
                amount,
                status: 'pending',
              });
              updateLog(`車輛 ${car.plate} 需繳費 NT$${amount}。`, 'warning');
            }
          }
          break;
        }
        case 'paying': {
          const payment = payments.find((item) => item.sessionId === car.sessionId);
          if (payment?.status === 'paid' && exitGate && !exitGate.faulty) {
            exitGate.state = 'open';
            car.status = 'leaving';
            car.target = EXIT_POINT;
            updateLog(`車輛 ${car.plate} 已付款，出口柵欄開啟。`);
          }
          break;
        }
        case 'leaving': {
          if (distance(car.position, EXIT_POINT) < 6) {
            car.status = 'gone';
            const session = sessions.find((item) => item.id === car.sessionId);
            if (session) {
              session.exitTime = now;
              session.status = 'completed';
            }
            updateLog(`車輛 ${car.plate} 已離場。`);
          }
          break;
        }
        default:
          break;
      }
    });

    cars.forEach((car) => {
      if (car.status === 'gone') {
        return;
      }
      car.position = moveTowards(
        car.position,
        car.target,
        MOVE_SPEED * state.clock.tickMs * state.clock.speed,
      );
    });

    const activeEntryCar = cars.find((car) =>
      ['entering', 'parking'].includes(car.status),
    );
    const activeExitCar = cars.find((car) => ['paying', 'leaving'].includes(car.status));

    const entrySensor = sensors.find((sensor) => sensor.type === 'entry');
    const exitSensor = sensors.find((sensor) => sensor.type === 'exit');

    if (entrySensor && activeEntryCar) {
      entrySensor.active = distance(activeEntryCar.position, ENTRY_GATE) < 20;
    }
    if (exitSensor && activeExitCar) {
      exitSensor.active = distance(activeExitCar.position, EXIT_GATE) < 20;
    }

    if (entryGate && !activeEntryCar && entryGate.state === 'open') {
      entryGate.state = 'closed';
    }

    if (exitGate && !activeExitCar && exitGate.state === 'open') {
      exitGate.state = 'closed';
    }

    const filteredCars = cars.filter((car) => car.status !== 'gone');
    const recentLogs = [...state.logs, ...logs].slice(-MAX_LOGS);

    set({
      clock: { ...state.clock, timeMs: now },
      cars: filteredCars,
      spots,
      sensors,
      gates,
      sessions,
      payments,
      logs: recentLogs,
    });
  },
  start: () => {
    set((state) => ({
      clock: { ...state.clock, running: true },
      logs: [...state.logs, makeLog('模擬開始。', 'info', state.clock.timeMs)].slice(-MAX_LOGS),
    }));
  },
  pause: () => {
    set((state) => ({
      clock: { ...state.clock, running: false },
      logs: [...state.logs, makeLog('模擬暫停。', 'warning', state.clock.timeMs)].slice(-MAX_LOGS),
    }));
  },
  reset: () => {
    set(() => ({
      ...createInitialState(),
    }));
  },
  setSpeed: (speed) => {
    set((state) => ({
      clock: { ...state.clock, speed },
      logs: [...state.logs, makeLog(`速度調整為 ${speed}x。`, 'info', state.clock.timeMs)].slice(
        -MAX_LOGS,
      ),
    }));
  },
  generateCar: () => {
    const state = get();
    const car: Car = {
      id: `car-${state.cars.length + 1}-${Math.random().toString(16).slice(2, 6)}`,
      plate: randomPlate(),
      status: 'queued',
      position: { ...ENTRY_POINT },
      target: { ...ENTRY_POINT },
    };
    set({
      cars: [...state.cars, car],
      logs: [...state.logs, makeLog(`新車輛 ${car.plate} 進入等待區。`, 'info', state.clock.timeMs)].slice(
        -MAX_LOGS,
      ),
    });
  },
  injectFault: () => {
    const state = get();
    const sensors = state.sensors.map((sensor) => ({ ...sensor }));
    const gates = state.gates.map((gate) => ({ ...gate }));
    const targetSensor = sensors[Math.floor(Math.random() * sensors.length)];
    const targetGate = gates[Math.floor(Math.random() * gates.length)];

    if (Math.random() > 0.5 && targetSensor) {
      targetSensor.faulty = true;
      setTimeout(() => {
        set((current) => ({
          sensors: current.sensors.map((sensor) =>
            sensor.id === targetSensor.id ? { ...sensor, faulty: false } : sensor,
          ),
        }));
      }, 5000);
      set({
        sensors,
        logs: [
          ...state.logs,
          makeLog(`感測器 ${targetSensor.label} 故障 5 秒。`, 'error', state.clock.timeMs),
        ].slice(-MAX_LOGS),
      });
      return;
    }

    if (targetGate) {
      targetGate.faulty = true;
      setTimeout(() => {
        set((current) => ({
          gates: current.gates.map((gate) =>
            gate.id === targetGate.id ? { ...gate, faulty: false } : gate,
          ),
        }));
      }, 5000);
      set({
        gates,
        logs: [
          ...state.logs,
          makeLog(`柵欄 ${targetGate.label} 故障 5 秒。`, 'error', state.clock.timeMs),
        ].slice(-MAX_LOGS),
      });
    }
  },
  payLatest: () => {
    set((state) => {
      const payment = [...state.payments].reverse().find((item) => item.status === 'pending');
      if (!payment) {
        return state;
      }
      const updatedPayments = state.payments.map((item) =>
        item.id === payment.id
          ? { ...item, status: 'paid', paidAt: state.clock.timeMs }
          : item,
      );
      return {
        payments: updatedPayments,
        logs: [...state.logs, makeLog(`付款完成：${payment.id}`, 'info', state.clock.timeMs)].slice(
          -MAX_LOGS,
        ),
      };
    });
  },
}));
