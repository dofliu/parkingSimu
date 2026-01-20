import { useMemo } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { formatTime } from '../utils/sim';

export const StatusPanel = () => {
  const { spots, cars, payments, clock } = useSimulationStore((state) => ({
    spots: state.spots,
    cars: state.cars,
    payments: state.payments,
    clock: state.clock,
  }));

  const metrics = useMemo(() => {
    const totalSpots = spots.length;
    const occupied = spots.filter((spot) => spot.occupiedBy).length;
    const revenue = payments
      .filter((payment) => payment.status === 'paid')
      .reduce((sum, payment) => sum + payment.amount, 0);
    const pending = payments.filter((payment) => payment.status === 'pending').length;
    return {
      totalSpots,
      occupied,
      available: totalSpots - occupied,
      carsInside: cars.filter((car) => ['parked', 'parking', 'exiting', 'paying'].includes(car.status))
        .length,
      revenue,
      pending,
    };
  }, [spots, cars, payments]);

  return (
    <section className="panel">
      <h2>即時狀態</h2>
      <div className="panel-block">
        <div className="metric">
          <span className="label">模擬時間</span>
          <span className="value">{formatTime(clock.timeMs)}</span>
        </div>
        <div className="metric">
          <span className="label">剩餘車位</span>
          <span className="value">{metrics.available}</span>
        </div>
        <div className="metric">
          <span className="label">場內車輛</span>
          <span className="value">{metrics.carsInside}</span>
        </div>
        <div className="metric">
          <span className="label">今日營收</span>
          <span className="value">NT$ {metrics.revenue}</span>
        </div>
        <div className="metric">
          <span className="label">待付款筆數</span>
          <span className="value">{metrics.pending}</span>
        </div>
      </div>
    </section>
  );
};
