import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  BarChart3,
} from 'lucide-react';

const PACKAGE_FEES = { Standard: 50000, Premium: 75000, Express: 60000 };

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
  new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(value || 0);

const getStatusFromBalance = (paid, totalFee, registeredDate) => {
  if (paid >= totalFee) return 'Paid';
  if (paid > 0) {
    if (registeredDate) {
      const days = Math.floor((Date.now() - new Date(registeredDate).getTime()) / (1000 * 60 * 60 * 24));
      if (days > 30) return 'Overdue';
    }
    return 'Partially Paid';
  }
  if (registeredDate) {
    const days = Math.floor((Date.now() - new Date(registeredDate).getTime()) / (1000 * 60 * 60 * 24));
    if (days > 30) return 'Overdue';
  }
  return 'Pending';
};

const emptyForm = () => ({
  candidateId: '',
  totalFee: 50000,
  amountPaying: 0,
  paymentStage: 'First Payment',
  method: 'Cash',
  date: new Date().toISOString().slice(0, 10),
  refNo: '',
  remarks: '',
});

const Payments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [payments, setPayments] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [balances, setBalances] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, todayCollection: 0, pendingAmount: 0, paidCandidates: 0 });
  const [filterText, setFilterText] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [selectedBalanceId, setSelectedBalanceId] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [reportType, setReportType] = useState('daily');
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));
  const [reportData, setReportData] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [paymentList, candidateList, balanceList, paymentStats] = await Promise.all([
        window.api.getPayments(),
        window.api.getCandidates(),
        window.api.getPaymentBalances(),
        window.api.getPaymentStats(),
      ]);
      setPayments(paymentList);
      setCandidates(candidateList);
      setBalances(balanceList);
      setStats(paymentStats);
      setSelectedBalanceId((current) => current || balanceList[0]?.candidateId || '');
    } catch (err) {
      console.error('Failed to load payments', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadReport = useCallback(async () => {
    try {
      const payload = reportType === 'monthly'
        ? { type: 'monthly', month: reportMonth }
        : reportType === 'outstanding'
          ? { type: 'outstanding' }
          : { type: 'daily', date: reportDate };
      const result = await window.api.getPaymentReports(payload);
      if (result.success) setReportData({ data: result.data, total: result.total });
    } catch (err) {
      console.error('Failed to load payment report', err);
    }
  }, [reportType, reportDate, reportMonth]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { loadReport(); }, [loadReport]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'add' && !loading && candidates.length > 0) {
      handleOpenAdd();
      navigate('/payments', { replace: true });
    }
  }, [location, loading, candidates, navigate]);

  const paymentsWithStatus = useMemo(() => {
    const paidByCandidate = {};
    payments.forEach((p) => {
      paidByCandidate[p.candidateId] = (paidByCandidate[p.candidateId] || 0) + p.amount;
    });
    return payments.map((payment) => {
      const totalPaid = paidByCandidate[payment.candidateId] || 0;
      const status = getStatusFromBalance(totalPaid, payment.totalFee, payment.registeredDate);
      return { ...payment, totalPaid, dueAmount: Math.max(0, payment.totalFee - totalPaid), status };
    });
  }, [payments]);

  const filteredPayments = useMemo(() => {
    return paymentsWithStatus.filter((payment) => {
      const matchesText = [payment.candidateName, payment.receiptNo, payment.referenceNumber, payment.paymentMethod]
        .join(' ')
        .toLowerCase()
        .includes(filterText.toLowerCase());
      const matchesDate = filterDate ? payment.paymentDate === filterDate : true;
      return matchesText && matchesDate;
    });
  }, [paymentsWithStatus, filterText, filterDate]);

  const selectedBalance = useMemo(() => {
    return balances.find((b) => b.candidateId === selectedBalanceId) || balances[0] || null;
  }, [balances, selectedBalanceId]);

  const suggestStage = (candidateId) => {
    const count = payments.filter((p) => p.candidateId === candidateId).length;
    return ['First Payment', 'Second Payment', 'Final Payment'][count] || 'Final Payment';
  };

  const getCandidateFee = (candidateId) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    const existing = payments.find((p) => p.candidateId === candidateId);
    if (existing) return existing.totalFee;
    return PACKAGE_FEES[candidate?.trainingPackage] || 50000;
  };

  const handleOpenAdd = async () => {
    const firstCandidate = candidates[0];
    const candidateId = firstCandidate?.id || '';
    const receiptNo = await window.api.getNextReceiptNumber();
    setEditingPayment(null);
    setForm({
      ...emptyForm(),
      candidateId,
      totalFee: getCandidateFee(candidateId),
      paymentStage: suggestStage(candidateId),
      receiptNo,
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (payment) => {
    setEditingPayment(payment);
    setForm({
      candidateId: payment.candidateId,
      totalFee: payment.totalFee,
      amountPaying: payment.amount,
      paymentStage: payment.paymentStage,
      method: payment.paymentMethod,
      date: payment.paymentDate,
      refNo: payment.referenceNumber || '',
      remarks: payment.remarks || '',
      receiptNo: payment.receiptNo,
    });
    setShowAddModal(true);
  };

  const handleCandidateChange = (candidateId) => {
    setForm((prev) => ({
      ...prev,
      candidateId,
      totalFee: getCandidateFee(candidateId),
      paymentStage: suggestStage(candidateId),
    }));
  };

  const selectedCandidateBalance = useMemo(() => {
    const candidate = candidates.find((c) => c.id === form.candidateId);
    const paid = payments
      .filter((p) => p.candidateId === form.candidateId && (!editingPayment || p.id !== editingPayment.id))
      .reduce((sum, p) => sum + p.amount, 0);
    const totalFee = Number(form.totalFee || 50000);
    const due = Math.max(0, totalFee - paid - (editingPayment ? 0 : Number(form.amountPaying || 0)));
    return {
      name: candidate?.name || 'Unknown',
      totalFee,
      paid,
      due: Math.max(0, totalFee - paid),
      status: getStatusFromBalance(paid, totalFee, candidate?.registeredDate),
      licenseClass: candidate?.licenseClass || '',
      transmissionPref: candidate?.transmissionPref || '',
      trainingPackage: candidate?.trainingPackage || '',
    };
  }, [form, payments, candidates, editingPayment]);

  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!form.candidateId || !form.amountPaying) return;

    const payload = {
      receiptNo: form.receiptNo || (await window.api.getNextReceiptNumber()),
      candidateId: form.candidateId,
      paymentDate: form.date,
      amount: Number(form.amountPaying),
      totalFee: Number(form.totalFee),
      paymentMethod: form.method,
      referenceNumber: form.refNo,
      remarks: form.remarks,
      paymentStage: form.paymentStage,
    };

    const result = editingPayment
      ? await window.api.updatePayment({ ...payload, id: editingPayment.id })
      : await window.api.addPayment(payload);

    if (result.success) {
      setShowAddModal(false);
      setEditingPayment(null);
      await loadData();
      await loadReport();
    } else {
      alert(result.message || 'Failed to save payment');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment record?')) return;
    const result = await window.api.deletePayment(id);
    if (result.success) {
      await loadData();
      await loadReport();
    } else {
      alert(result.message || 'Failed to delete payment');
    }
  };

  const handleViewReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowReceiptModal(true);
  };

  const handlePrintReceipt = () => window.print();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        Loading payment data...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payment Management</h1>
          <p className="text-sm text-slate-600 mt-1">
            Record payments, track balances, generate receipts and monitor outstanding collections.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a5f] px-5 py-3 text-white shadow-sm transition hover:bg-[#152a45]"
        >
          <Plus size={16} /> Add Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-sm font-medium mb-3">
            <span>Total Revenue</span>
            <DollarSign size={18} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">{formatCurrency(stats.totalRevenue)}</h2>
          <p className="text-xs text-slate-500 mt-2">All recorded collections</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-sm font-medium mb-3">
            <span>Today&apos;s Collection</span>
            <CalendarDays size={18} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">{formatCurrency(stats.todayCollection)}</h2>
          <p className="text-xs text-slate-500 mt-2">Payments received today</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-sm font-medium mb-3">
            <span>Pending Amount</span>
            <AlertTriangle size={18} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">{formatCurrency(stats.pendingAmount)}</h2>
          <p className="text-xs text-slate-500 mt-2">Outstanding balances from candidates</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-sm font-medium mb-3">
            <span>Fully Paid Candidates</span>
            <CheckCircle2 size={18} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">{stats.paidCandidates}</h2>
          <p className="text-xs text-slate-500 mt-2">Candidates with completed fee payments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Payment Table */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Payment History</h2>
              <p className="text-sm text-slate-500">Search by candidate, receipt no, or date.</p>
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
                      <td className="px-4 py-4">{payment.paymentMethod}</td>
                      <td className="px-4 py-4">{payment.paymentDate}</td>
                      <td className="px-4 py-4">{statusBadge(payment.status)}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleViewReceipt(payment)}
                            title="View Receipt"
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-100"
                          >
                            <FileText size={14} />
                          </button>
                          <button
                            onClick={() => { handleViewReceipt(payment); setTimeout(handlePrintReceipt, 300); }}
                            title="Print Receipt"
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-100"
                          >
                            <Printer size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(payment)}
                            title="Edit Payment"
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-100"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(payment.id)}
                            title="Delete Payment"
                            className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700 hover:bg-rose-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
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

        {/* Balance Tracking */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <CreditCard size={22} className="text-[#1e3a5f]" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Balance Tracking</h2>
              <p className="text-sm text-slate-500">Fee progress and due balances per candidate.</p>
            </div>
          </div>

          <select
            value={selectedBalanceId}
            onChange={(e) => setSelectedBalanceId(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm mb-4 outline-none focus:border-[#1e3a5f]"
          >
            {balances.map((b) => (
              <option key={b.candidateId} value={b.candidateId}>{b.candidateName}</option>
            ))}
          </select>

          {selectedBalance && (
            <div className="space-y-4 text-sm text-slate-700">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-slate-500">Total Course Fee</div>
                <div className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(selectedBalance.totalFee)}</div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-slate-500">Total Paid</div>
                <div className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(selectedBalance.totalPaid)}</div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-slate-500">Remaining Balance</div>
                <div className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(selectedBalance.remaining)}</div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-slate-500">Payment Status</div>
                <div className="mt-2">{statusBadge(selectedBalance.status)}</div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-slate-500">Next Installment</div>
                <div className="mt-2 flex items-center gap-2 text-slate-900">
                  <Clock3 size={16} />
                  <span>{selectedBalance.nextStage} — {formatCurrency(selectedBalance.dueAmount)} due</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Reports */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <BarChart3 size={22} className="text-[#1e3a5f]" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Payment Reports</h2>
              <p className="text-sm text-slate-500">Daily collection, monthly income, and outstanding balances.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {['daily', 'monthly', 'outstanding'].map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold capitalize transition ${
                  reportType === type
                    ? 'bg-[#1e3a5f] text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {type === 'daily' ? 'Daily Collection' : type === 'monthly' ? 'Monthly Income' : 'Outstanding Balance'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-5">
          {reportType === 'daily' && (
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
            />
          )}
          {reportType === 'monthly' && (
            <input
              type="month"
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
            />
          )}
          <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800">
            Total: {formatCurrency(reportData.total)}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                {reportType === 'outstanding' ? (
                  <>
                    <th className="px-4 py-3 font-semibold">Candidate</th>
                    <th className="px-4 py-3 font-semibold">Course Fee</th>
                    <th className="px-4 py-3 font-semibold">Paid</th>
                    <th className="px-4 py-3 font-semibold">Outstanding</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3 font-semibold">Receipt No</th>
                    <th className="px-4 py-3 font-semibold">Candidate</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Method</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reportData.data.length ? (
                reportData.data.map((row, idx) => (
                  <tr key={row.id || row.candidateId || idx} className="hover:bg-slate-50">
                    {reportType === 'outstanding' ? (
                      <>
                        <td className="px-4 py-3">{row.candidateName}</td>
                        <td className="px-4 py-3">{formatCurrency(row.totalFee)}</td>
                        <td className="px-4 py-3">{formatCurrency(row.totalPaid)}</td>
                        <td className="px-4 py-3 font-semibold text-rose-700">{formatCurrency(row.remaining)}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3">{row.receiptNo}</td>
                        <td className="px-4 py-3">{row.candidateName}</td>
                        <td className="px-4 py-3">{formatCurrency(row.amount)}</td>
                        <td className="px-4 py-3">{row.paymentMethod}</td>
                        <td className="px-4 py-3">{row.paymentDate}</td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-500">No records for this report.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) { setShowAddModal(false); setEditingPayment(null); } }}>
          <div className="w-full max-w-3xl overflow-hidden rounded-[32px] bg-white shadow-2xl my-auto max-h-[95vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 p-6 shrink-0">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {editingPayment ? 'Edit Payment' : 'Record New Payment'}
                </h3>
                <p className="text-sm text-slate-500">
                  {editingPayment ? 'Update payment details.' : 'Enter payment details and generate a receipt.'}
                </p>
              </div>
              <button onClick={() => { setShowAddModal(false); setEditingPayment(null); }} className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition" title="Close">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleSavePayment} className="space-y-6 p-6 overflow-y-auto flex-1">
              <div className="grid gap-4 lg:grid-cols-2">
                {!editingPayment && (
                  <label className="space-y-2 text-sm text-slate-700">
                    Receipt No
                    <input
                      type="text"
                      readOnly
                      value={form.receiptNo || ''}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm"
                    />
                  </label>
                )}
                <label className="space-y-2 text-sm text-slate-700">
                  Candidate
                  <select
                    value={form.candidateId}
                    onChange={(e) => handleCandidateChange(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
                  >
                    {candidates.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
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
                    required
                    min="1"
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
                  <span className="font-semibold text-slate-800">{selectedCandidateBalance.name}</span>
                </div>

                {/* License Package Details */}
                {selectedCandidateBalance.licenseClass && (
                  <div className="mt-3 rounded-2xl bg-white border border-slate-200 p-3 shadow-sm">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-2">License Package Details</p>
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-[11px] uppercase tracking-[0.1em] text-slate-400 mr-1">Classes:</span>
                      {selectedCandidateBalance.licenseClass.split(',').filter(Boolean).map((cls) => (
                        <span key={cls} className="inline-flex items-center gap-1 rounded-lg bg-[#1e3a5f]/10 px-2.5 py-1 text-xs font-bold text-[#1e3a5f]">
                          {cls.trim()}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs">
                      {selectedCandidateBalance.transmissionPref && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">Transmission:</span>
                          <span className="font-semibold text-slate-700">{selectedCandidateBalance.transmissionPref}</span>
                        </div>
                      )}
                      {selectedCandidateBalance.trainingPackage && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">Package:</span>
                          <span className="inline-flex items-center rounded-lg bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                            {selectedCandidateBalance.trainingPackage}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Full Package Fee:</span>
                        <span className="inline-flex items-center rounded-lg bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                          {formatCurrency(selectedCandidateBalance.totalFee)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

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
                    <p className="mt-2">{statusBadge(selectedCandidateBalance.status)}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingPayment(null); }}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-[#1e3a5f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#152a45]"
                >
                  {editingPayment ? 'Update Payment' : 'Save Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 print-modal">
          <div className="w-full max-w-2xl overflow-hidden rounded-[32px] bg-white shadow-2xl print-receipt">
            <div className="flex items-center justify-between border-b border-slate-200 p-6 print:hidden">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Payment Receipt</h3>
                <p className="text-sm text-slate-500">Review or print this receipt.</p>
              </div>
              <button onClick={() => setShowReceiptModal(false)} className="text-slate-400 hover:text-slate-700">Close</button>
            </div>
            <div className="p-6">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-[#1e3a5f]">LankaDrive</h2>
                <p className="text-sm text-slate-500">Driving School — Payment Receipt</p>
              </div>
              <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Receipt No</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedPayment.receiptNo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Date</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedPayment.paymentDate}</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Candidate</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{selectedPayment.candidateName}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Method</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{selectedPayment.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Reference</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{selectedPayment.referenceNumber || '—'}</p>
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

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end print:hidden">
                <button
                  onClick={handlePrintReceipt}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1e3a5f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#152a45]"
                >
                  <Printer size={16} /> Print Receipt
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
