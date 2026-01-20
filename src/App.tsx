import { useEffect, useState } from 'react';
import { ControlBar } from './components/ControlBar';
import { EventLogPanel } from './components/EventLogPanel';
import { PaymentModal } from './components/PaymentModal';
import { SettingsDrawer } from './components/SettingsDrawer';
import { SimulationCanvas } from './components/SimulationCanvas';
import { StatusPanel } from './components/StatusPanel';
import { useSimulationStore } from './store/simulationStore';

export const App = () => {
  const tick = useSimulationStore((state) => state.tick);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      tick();
    }, 100);
    return () => clearInterval(interval);
  }, [tick]);

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>ParkingSim 停車場監控與收費互動式模擬</h1>
          <p>入口感測 → 車牌辨識 → 柵欄開啟 → 指派車位 → 停入 → 計費 → 付款 → 離場</p>
        </div>
      </header>
      <main className="layout">
        <StatusPanel />
        <SimulationCanvas />
        <EventLogPanel />
      </main>
      <ControlBar onOpenSettings={() => setSettingsOpen(true)} />
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <PaymentModal />
    </div>
  );
};
