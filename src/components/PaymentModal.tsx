import { useMemo } from 'react';
import { useSimulationStore } from '../store/simulationStore';

export const PaymentModal = () => {
  const { payments, payLatest } = useSimulationStore((state) => ({
    payments: state.payments,
    payLatest: state.payLatest,
  }));

  const pendingPayment = useMemo(
    () => [...payments].reverse().find((payment) => payment.status === 'pending'),
    [payments],
  );

  if (!pendingPayment) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>付款確認</h3>
        <p>系統已完成計費，請完成付款以開啟出口柵欄。</p>
        <div className="payment-detail">
          <span>帳單編號</span>
          <strong>{pendingPayment.id}</strong>
        </div>
        <div className="payment-detail">
          <span>金額</span>
          <strong>NT$ {pendingPayment.amount}</strong>
        </div>
        <button onClick={payLatest} className="primary">
          立即付款
        </button>
      </div>
    </div>
  );
};
