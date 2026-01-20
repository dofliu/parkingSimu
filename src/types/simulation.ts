export type Vector2 = {
  x: number;
  y: number;
};

export type CarStatus =
  | 'queued'
  | 'entering'
  | 'parking'
  | 'parked'
  | 'exiting'
  | 'paying'
  | 'leaving'
  | 'gone';

export type Car = {
  id: string;
  plate: string;
  status: CarStatus;
  position: Vector2;
  target: Vector2;
  spotId?: string;
  sessionId?: string;
  parkedSince?: number;
  exitReadyAt?: number;
};

export type Spot = {
  id: string;
  label: string;
  position: Vector2;
  occupiedBy?: string;
};

export type Sensor = {
  id: string;
  label: string;
  type: 'entry' | 'exit' | 'spot';
  position: Vector2;
  active: boolean;
  faulty: boolean;
};

export type Gate = {
  id: string;
  label: string;
  type: 'entry' | 'exit';
  position: Vector2;
  state: 'open' | 'closed';
  faulty: boolean;
};

export type Session = {
  id: string;
  carId: string;
  spotId: string;
  entryTime: number;
  exitTime?: number;
  status: 'active' | 'completed';
};

export type Payment = {
  id: string;
  sessionId: string;
  amount: number;
  status: 'pending' | 'paid';
  paidAt?: number;
};

export type SimClock = {
  timeMs: number;
  tickMs: number;
  speed: number;
  running: boolean;
};

export type EventLog = {
  id: string;
  timeMs: number;
  level: 'info' | 'warning' | 'error';
  message: string;
};
