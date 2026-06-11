import React, { useEffect, useMemo, useState } from 'react';
import {
  CreditCard,
  Search,
  Plus,
  FileText,
  Printer,
  Edit3,
  Trash2,
  CalendarDays,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  ChevronDown,
} from 'lucide-react';

const defaultStudents = [
  { id: 'DS-2025-001', name: 'Kasun Perera' },
  { id: 'DS-2025-002', name: 'Nimali Silva' },
  { id: 'DS-2025-003', name: 'Ruwan Kumara' },
  { id: 'DS-2025-004', name: 'Samanthi Fernando' },
  { id: 'DS-2025-005', name: 'Chaminda Peiris' },
];

const defaultPayments = [
  {
    id: 'PAY-001',
    receiptNo: 'REC-1001',
    candidateId: 'DS-2025-001',
    amount: 15000,
    totalFee: 50000,
    paymentStage: 'First Payment',
    method: 'Cash',
    date: '2025-01-10',
    refNo: 'REF-1001',
    remarks: 'Initial registration fee',
  },
  {
    id: 'PAY-002',
    receiptNo: 'REC-1002',
    candidateId: 'DS-2025-002',
    amount: 25000,
    totalFee: 50000,
    paymentStage: 'Second Payment',
    method: 'Bank Transfer',
    date: '2025-01-12',
    refNo: 'REF-87654321',
    remarks: 'Midterm installment',
  },
  {
    id: 'PAY-003',
    receiptNo: 'REC-1003',
    candidateId: 'DS-2025-003',
    amount: 50000,
    totalFee: 50000,
    paymentStage: 'Final Payment',
    method: 'Online',
    date: '2025-01-05',
    refNo: 'ONL-123456',
    remarks: 'Full fee payment',
  },
];

const statusBadge = (status) => {
  const styles = {
    Paid: 'bg-emerald-100 text-emerald-800',
    'Partially Paid': 'bg-amber-100 text-amber-800',
    Pending: 'bg-slate-100 text-slate-800',
    Overdue: 'bg-rose-100 text-rose-800',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${styles[status] || styles.Pending}`}>
      {status}
    </span>
  );
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(value);

const getStatusFromBalance = (paid, totalFee) => {
  if (paid >= totalFee) return 'Paid';
  if (paid > 0) return 'Partially Paid';
  return 'Pending';
};

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [form, setForm] = useState({
    candidateId: '',
    totalFee: 50000,
    amountPaying: 0,
    paymentStage: 'First Payment',
    method: 'Cash',
    date: new Date().toISOString().slice(0, 10),
    refNo: '',
    remarks: '',
  });

  useEffect(() => {
    const storedStudents = JSON.parse(localStorage.getItem('students') || 'null');
    const storedPayments = JSON.parse(localStorage.getItem('payments') || 'null');

    const loadedStudents = storedStudents || defaultStudents;
    const loadedPayments = (storedPayments || defaultPayments).map((item, index) => ({
      ...item,
      totalFee: item.totalFee ?? 50000,
      receiptNo: item.receiptNo || `REC-${1001 + index}`,
      refNo: item.refNo || item.referenceNumber || `REF-${1000 + index}`,
      date: item.date || new Date().toISOString().slice(0, 10),
    }));

    setStudents(loadedStudents);
    setPayments(loadedPayments);
    if (!storedStudents) {
      localStorage.setItem('students', JSON.stringify(defaultStudents));
    }
    if (!storedPayments) {
      localStorage.setItem('payments', JSON.stringify(loadedPayments));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('payments', JSON.stringify(payments));
  }, [payments]);

  const paymentsWithCandidate = useMemo(() => {
    return payments.map((payment) => {
      const student = students.find((item) => item.id === payment.candidateId);
      const name = student?.name || 'Unknown Candidate';
      const installments = payments
        .filter((p) => p.candidateId === payment.candidateId)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      const totalPaid = installments.reduce((sum, item) => sum + item.amount, 0);
      const dueAmount = Math.max(0, payment.totalFee - totalPaid);
      const status = getStatusFromBalance(totalPaid, payment.totalFee);
      return { ...payment, candidateName: name, totalPaid, dueAmount, status };
    });
  }, [payments, students]);

  const aggregatedByCandidate = useMemo(() => {
    const map = {};
    payments.forEach((payment) => {
      const existing = map[payment.candidateId] || { totalPaid: 0, totalFee: payment.totalFee, candidateId: payment.candidateId };
      existing.totalPaid += payment.amount;
      existing.totalFee = payment.totalFee;
      map[payment.candidateId] = existing;
    });
    return Object.values(map).map((item) => ({
      ...item,
      status: getStatusFromBalance(item.totalPaid, item.totalFee),
      candidateName: students.find((s) => s.id === item.candidateId)?.name || 'Unknown',
      dueAmount: Math.max(0, item.totalFee - item.totalPaid),
    }));
  }, [payments, students]);

  const filteredPayments = useMemo(() => {
    return paymentsWithCandidate.filter((payment) => {
      const matchesText = [payment.candidateName, payment.receiptNo, payment.refNo, payment.method]
        .join(' ')
        .toLowerCase()
        .includes(filterText.toLowerCase());
      const matchesDate = filterDate ? payment.date === filterDate : true;
      return matchesText && matchesDate;
    });
  }, [paymentsWithCandidate, filterText, filterDate]);

  const totalRevenue = useMemo(() => payments.reduce((sum, item) => sum + item.amount, 0), [payments]);
  const todayCollection = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return payments
      .filter((payment) => payment.date === today)
      .reduce((sum, item) => sum + item.amount, 0);
  }, [payments]);
  const pendingAmount = useMemo(() => {
    return aggregatedByCandidate.reduce((sum, item) => sum + item.dueAmount, 0);
  }, [aggregatedByCandidate]);
  const paidCandidates = useMemo(() => aggregatedByCandidate.filter((item) => item.status === 'Paid').length, [aggregatedByCandidate]);

  const nextReceiptNo = () => {
    const nextNumber = payments.length + 1001;
    return `REC-${nextNumber}`;
  };

  const handleOpenAdd = () => {
    setForm({
      candidateId: students[0]?.id || '',
      totalFee: 50000,
      amountPaying: 0,
      paymentStage: 'First Payment',
      method: 'Cash',
      date: new Date().toISOString().slice(0, 10),
      refNo: '',
      remarks: '',
    });
    setShowAddModal(true);
  };

  const handleSavePayment = (e) => {
    e.preventDefault();
    if (!form.candidateId) return;
    const receiptNo = nextReceiptNo();
    const newPayment = {
      id: `PAY-${(payments.length + 1).toString().padStart(3, '0')}`,
      receiptNo,
      candidateId: form.candidateId,
      amount: Number(form.amountPaying),
      totalFee: Number(form.totalFee),
      paymentStage: form.paymentStage,
      method: form.method,
      date: form.date,
      refNo: form.refNo,
      remarks: form.remarks,
    };
    setPayments((current) => [newPayment, ...current]);
    setShowAddModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this payment record?')) {
      setPayments((current) => current.filter((item) => item.id !== id));
    }
  };

  const handleViewReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowReceiptModal(true);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const selectedCandidateBalance = useMemo(() => {
    const candidate = students.find((item) => item.id === form.candidateId);
    const paymentsForCandidate = payments.filter((payment) => payment.candidateId === form.candidateId);
    const paid = paymentsForCandidate.reduce((sum, item) => sum + item.amount, 0);
    const totalFee = Number(form.totalFee || 50000);
    return {
      name: candidate?.name || 'Unknown',
      totalFee,
      paid,
      due: Math.max(0, totalFee - paid),
      status: getStatusFromBalance(paid, totalFee),
    };
  }, [form.candidateId, form.totalFee, payments, students]);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payment Management</h1>
          <p className="text-sm text-slate-600 mt-1">Record payments, track balances, generate receipts and monitor outstanding collections.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a5f] px-5 py-3 text-white shadow-sm transition hover:bg-[#152a45]"
        >
          <Plus size={16} /> Add Payment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-sm font-medium mb-3">
            <span>Total Revenue</span>
            <DollarSign size={18} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</h2>
          <p className="text-xs text-slate-500 mt-2">All recorded collections</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-sm font-medium mb-3">
            <span>Today's Collection</span>
            <CalendarDays size={18} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">{formatCurrency(todayCollection)}</h2>
          <p className="text-xs text-slate-500 mt-2">Payments received today</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-sm font-medium mb-3">
            <span>Pending Amount</span>
            <AlertTriangle size={18} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">{formatCurrency(pendingAmount)}</h2>
          <p className="text-xs text-slate-500 mt-2">Outstanding balances from candidates</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-sm font-medium mb-3">
            <span>Fully Paid Candidates</span>
            <CheckCircle2 size={18} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">{paidCandidates}</h2>
          <p className="text-xs text-slate-500 mt-2">Candidates with completed fee payments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Payment History</h2>
              <p className="text-sm text-slate-500">Search payments by candidate, receipt no or payment date.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search candidate or receipt..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
                />
              </div>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full sm:w-40 rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-700 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-4 font-semibold uppercase tracking-wide">Receipt No</th>
                  <th className="px-4 py-4 font-semibold uppercase tracking-wide">Candidate</th>
                  <th className="px-4 py-4 font-semibold uppercase tracking-wide">Amount</th>
                  <th className="px-4 py-4 font-semibold uppercase tracking-wide">Method</th>
                  <th className="px-4 py-4 font-semibold uppercase tracking-wide">Date</th>
                  <th className="px-4 py-4 font-semibold uppercase tracking-wide">Status</th>
                  <th className="px-4 py-4 font-semibold uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {filteredPayments.length ? (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 font-medium text-slate-900">{payment.receiptNo}</td>
                      <td className="px-4 py-4">{payment.candidateName}</td>
                      <td className="px-4 py-4">{formatCurrency(payment.amount)}</td>
                      <td className="px-4 py-4">{payment.method}</td>
                      <td className="px-4 py-4">{payment.date}</td>
                      <td className="px-4 py-4">{statusBadge(payment.status)}</td>
                      <td className="px-4 py-4 space-x-2">
                        <button
                          onClick={() => handleViewReceipt(payment)}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-100"
                        >
                          <FileText size={14} /> View
                        </button>
                        <button
                          onClick={() => handleDelete(payment.id)}
                          className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700 hover:bg-rose-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-slate-500">
                      No payment records match the filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <CreditCard size={22} className="text-[#1e3a5f]" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Balance Tracking</h2>
              <p className="text-sm text-slate-500">Quick view of candidate fee progress and due balances.</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-700">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex justify-between text-slate-500">Total Course Fee</div>
              <div className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(50000)}</div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex justify-between text-slate-500">Total Paid</div>
              <div className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(totalRevenue)}</div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex justify-between text-slate-500">Remaining Balance</div>
              <div className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(pendingAmount)}</div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex justify-between text-slate-500">Payment Status</div>
              <div className="mt-2 flex items-center gap-2 text-slate-900">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <span>{paidCandidates} fully paid</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-[32px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Record New Payment</h3>
                <p className="text-sm text-slate-500">Enter payment details and generate a receipt instantly.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">Close</button>
            </div>
            <form onSubmit={handleSavePayment} className="space-y-6 p-6">
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-700">
                  Candidate
                  <select
                    value={form.candidateId}
                    onChange={(e) => setForm((prev) => ({ ...prev, candidateId: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
                  >
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Total Course Fee
                  <input
                    type="number"
                    value={form.totalFee}
                    onChange={(e) => setForm((prev) => ({ ...prev, totalFee: Number(e.target.value) }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Amount Paying
                  <input
                    type="number"
                    value={form.amountPaying}
                    onChange={(e) => setForm((prev) => ({ ...prev, amountPaying: Number(e.target.value) }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Payment Method
                  <select
                    value={form.method}
                    onChange={(e) => setForm((prev) => ({ ...prev, method: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
                  >
                    <option>Cash</option>
                    <option>Bank Transfer</option>
                    <option>Online</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Reference No
                  <input
                    type="text"
                    value={form.refNo}
                    onChange={(e) => setForm((prev) => ({ ...prev, refNo: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Payment Date
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Installment Stage
                  <select
                    value={form.paymentStage}
                    onChange={(e) => setForm((prev) => ({ ...prev, paymentStage: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
                  >
                    <option>First Payment</option>
                    <option>Second Payment</option>
                    <option>Final Payment</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-700 lg:col-span-2">
                  Notes
                  <textarea
                    rows="3"
                    value={form.remarks}
                    onChange={(e) => setForm((prev) => ({ ...prev, remarks: e.target.value }))}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
                  />
                </label>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Candidate</span>
                  <span>{selectedCandidateBalance.name}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  <div className="rounded-3xl bg-white p-3 shadow-sm">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Already Paid</p>
                    <p className="text-lg font-semibold text-slate-900">{formatCurrency(selectedCandidateBalance.paid)}</p>
                  </div>
                  <div className="rounded-3xl bg-white p-3 shadow-sm">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Remaining Due</p>
                    <p className="text-lg font-semibold text-slate-900">{formatCurrency(selectedCandidateBalance.due)}</p>
                  </div>
                  <div className="rounded-3xl bg-white p-3 shadow-sm">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Status</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{selectedCandidateBalance.status}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-[#1e3a5f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#152a45]"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReceiptModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-[32px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Payment Receipt</h3>
                <p className="text-sm text-slate-500">Review, print or reprint the receipt for this payment.</p>
              </div>
              <button onClick={() => setShowReceiptModal(false)} className="text-slate-400 hover:text-slate-700">Close</button>
            </div>
            <div className="p-6">
              <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Receipt No</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedPayment.receiptNo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Date</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedPayment.date}</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Candidate</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{selectedPayment.candidateName}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Method</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{selectedPayment.method}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Reference</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{selectedPayment.refNo}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Payment Stage</p>
                  <p className="mt-3 text-lg font-semibold text-slate-900">{selectedPayment.paymentStage}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Amount Paid</p>
                  <p className="mt-3 text-lg font-semibold text-slate-900">{formatCurrency(selectedPayment.amount)}</p>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Notes</p>
                <p className="mt-3 text-sm text-slate-700">{selectedPayment.remarks || 'No notes available.'}</p>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={handlePrintReceipt}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1e3a5f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#152a45]"
                >
                  <Printer size={16} /> Print Receipt
                </button>
                <button
                  onClick={() => {
                    if (selectedPayment) {
                      setSelectedPayment({ ...selectedPayment, receiptNo: nextReceiptNo() });
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <ChevronDown size={16} /> Reprint
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
