import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./Admission.css";
import { getRegistrations } from "../../services/registrationService.js";

const Admission = () => {
  const [registrations, setRegistrations] = useState([]);
  const [summary, setSummary] = useState({ totalAmount: 0, deposit: 0, pending: 0, cancel: 0, refund: 0 });
  const [loading, setLoading] = useState(false);

  const [month, setMonth] = useState(new Date().toLocaleString("default", { month: "long" }));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [mode, setMode] = useState("admissions");
  const [tfMode, setTfMode] = useState("admissions");
  const [mwMode, setMwMode] = useState("admissions");
  const [mwYear, setMwYear] = useState(String(new Date().getFullYear()));

  const currentYear = new Date().getFullYear();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRegistrations({ page: 0, size: 1000 });
      const content = res.registrations?.content || res.content || [];
      setRegistrations(Array.isArray(content) ? content : []);
      if (res.summary) {
        setSummary({
          totalAmount: res.summary.totalAmount || 0,
          deposit: res.summary.depositCollected || res.summary.deposit || 0,
          pending: res.summary.pendingAmount || res.summary.pending || 0,
          cancel: res.summary.cancelAmount || res.summary.cancel || 0,
          refund: res.summary.refundAmount || res.summary.refund || 0,
        });
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchAll();
    const refresh = () => fetchAll();
    window.addEventListener("hostel-reg-updated", refresh);
    return () => window.removeEventListener("hostel-reg-updated", refresh);
  }, [fetchAll]);

  /* ---- helpers ---- */
  const getDate = (row) => {
    const v = row.admissionDate || row.stayFrom || "";
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  };

  const today = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  }, []);

  const daysDiff = (date) => {
    const d = new Date(date); d.setHours(0, 0, 0, 0);
    return Math.floor((today - d) / 86400000);
  };

  const getRevenue = (row) => Number(row.depositCollected) || 0;

  /* ---- summary cards ---- */
  const cards = useMemo(() => {
    let todayAdm = 0, todayRev = 0;
    let sevenAdm = 0, sevenRev = 0;
    let thirtyAdm = 0, thirtyRev = 0;
    let yearAdm = 0, yearRev = 0;
    const totalAdm = registrations.length;
    let totalRev = 0;
    registrations.forEach((r) => {
      const d = getDate(r); const rev = getRevenue(r); totalRev += rev;
      if (!d) return;
      const diff = daysDiff(d);
      if (diff === 0) { todayAdm++; todayRev += rev; }
      if (diff >= 0 && diff < 7) { sevenAdm++; sevenRev += rev; }
      if (diff >= 0 && diff < 30) { thirtyAdm++; thirtyRev += rev; }
      if (diff >= 0 && diff < 365) { yearAdm++; yearRev += rev; }
    });
    return [
      { title: "Today's", cls: "card-yellow", admissions: todayAdm, revenue: todayRev },
      { title: "7 Days",  cls: "card-red",    admissions: sevenAdm, revenue: sevenRev },
      { title: "30 Days", cls: "card-blue",   admissions: thirtyAdm, revenue: thirtyRev },
      { title: "365 Days",cls: "card-green",  admissions: yearAdm, revenue: yearRev },
      { title: "Total",   cls: "card-purple", admissions: totalAdm, revenue: totalRev },
    ];
  }, [registrations, today]);

  /* ---- date-wise chart ---- */
  const monthNumber = new Date(`${month} 1, ${year}`).getMonth();
  const daysInMonth = new Date(Number(year), monthNumber + 1, 0).getDate();

  const dateWiseData = useMemo(() => {
    const result = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, admissions: 0, revenue: 0 }));
    registrations.forEach((r) => {
      const d = getDate(r);
      if (!d || d.getFullYear() !== Number(year) || d.getMonth() !== monthNumber) return;
      const idx = d.getDate() - 1;
      if (result[idx]) { result[idx].admissions++; result[idx].revenue += getRevenue(r); }
    });
    return result;
  }, [registrations, monthNumber, year, daysInMonth]);

  /* ---- timeframe chart ---- */
  const timeframeData = useMemo(() => {
    const ranges = [
      { label: "Today", days: 1 }, { label: "7 Days", days: 7 },
      { label: "30 Days", days: 30 }, { label: "365 Days", days: 365 }, { label: "Total", days: null },
    ];
    return ranges.map(({ label, days }) => {
      let count = 0, revenue = 0;
      registrations.forEach((r) => {
        const d = getDate(r); if (!d) return;
        const diff = daysDiff(d);
        if (days === null || (diff >= 0 && diff < days)) { count++; revenue += getRevenue(r); }
      });
      return { label, admissions: count, revenue };
    });
  }, [registrations, today]);

  /* ---- month-wise chart ---- */
  const MONTH_LABELS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  const monthWiseData = useMemo(() => {
    return MONTH_LABELS.map((label, idx) => {
      let count = 0, revenue = 0;
      registrations.forEach((r) => {
        const d = getDate(r);
        if (!d || d.getFullYear() !== Number(mwYear) || d.getMonth() !== idx) return;
        count++; revenue += getRevenue(r);
      });
      return { label, admissions: count, revenue };
    });
  }, [registrations, mwYear]);

  const dateMax = Math.max(1, ...dateWiseData.map((i) => mode === "revenue" ? i.revenue : i.admissions));
  const tfMax   = Math.max(1, ...timeframeData.map((i) => tfMode === "revenue" ? i.revenue : i.admissions));
  const mwMax   = Math.max(1, ...monthWiseData.map((i) => mwMode === "revenue" ? i.revenue : i.admissions));

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  if (loading) return <div style={{ padding: 32, textAlign: "center", color: "#64748b" }}>Loading...</div>;

  return (
    <div className="dashboard-wrapper admission-dashboard">
      {/* CARDS */}
      <div className="dashboard-cards">
        {cards.map((card) => (
          <div key={card.title} className={`dashboard-card ${card.cls}`}>
            <div className="card-title">{card.title}</div>
            <div className="card-bottom"><span>Admissions</span><strong>{card.admissions}</strong></div>
            <div className="card-bottom"><span>Revenue</span><strong>₹ {Number(card.revenue).toLocaleString("en-IN")}</strong></div>
          </div>
        ))}
      </div>

      {/* DATE-WISE CHART */}
      <div className="daily-inquiries">
        <div className="daily-header admission-chart-header">
          <div>
            <h2>Date Wise Admissions</h2>
            <p>{dateWiseData.reduce((s, i) => s + i.admissions, 0)} admissions in {month} {year}</p>
          </div>
          <div className="chart-header-actions">
            <div className="date-filters">
              <div className="filter-group">
                <label>Month</label>
                <select value={month} onChange={(e) => setMonth(e.target.value)}>
                  {MONTHS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label>Year</label>
                <select value={year} onChange={(e) => setYear(e.target.value)}>
                  {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mode-btns">
              <button type="button" className={mode === "admissions" ? "mode-btn on" : "mode-btn off"} onClick={() => setMode("admissions")}>Admissions</button>
              <button type="button" className={mode === "revenue" ? "mode-btn danger" : "mode-btn off"} onClick={() => setMode("revenue")}>Revenue</button>
            </div>
          </div>
        </div>
        <div className="legend"><span className="legend-color"></span><span>{mode === "revenue" ? "Revenue" : "Admissions Count"}</span></div>
        <div className="real-chart">
          <div className="real-chart-y">
            <span>{dateMax}</span><span>{Math.round(dateMax * 0.75)}</span>
            <span>{Math.round(dateMax * 0.5)}</span><span>{Math.round(dateMax * 0.25)}</span><span>0</span>
          </div>
          <div className="real-chart-area">
            <div className="real-grid">{[1,2,3,4,5].map((i) => <span key={i}></span>)}</div>
            <div className="bars date-bars">
              {dateWiseData.map((item) => {
                const value = mode === "revenue" ? item.revenue : item.admissions;
                const height = value === 0 ? 0 : Math.max(5, (value / dateMax) * 100);
                return (
                  <div className="bar-column" key={item.day}>
                    <div className="bar-value">{value > 0 ? value : ""}</div>
                    <div className="chart-bar" style={{ height: `${height}%` }}
                      title={`${item.day}: ${mode === "revenue" ? `₹${value}` : value}`}></div>
                    <span>{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* TWO CHARTS */}
      <div className="two-charts">
        {/* TIMEFRAME */}
        <div className="chart-panel">
          <h2 className="panel-title">Timeframe</h2>
          <div className="panel-toolbar">
            <h3>{tfMode === "revenue" ? "Revenue" : "Admissions"}</h3>
            <div className="mode-btns">
              <button type="button" className={tfMode === "admissions" ? "mode-btn on" : "mode-btn off"} onClick={() => setTfMode("admissions")}>Admissions</button>
              <button type="button" className={tfMode === "revenue" ? "mode-btn danger" : "mode-btn off"} onClick={() => setTfMode("revenue")}>Revenue</button>
            </div>
          </div>
          <div className="legend"><span className="legend-color"></span><span>{tfMode === "revenue" ? "Revenue" : "Admissions Count"}</span></div>
          <div className="small-real-chart">
            <div className="small-y"><span>{tfMax}</span><span>{Math.round(tfMax * 0.5)}</span><span>0</span></div>
            <div className="small-chart-area">
              <div className="small-grid"><span></span><span></span><span></span></div>
              <div className="bars timeframe-bars">
                {timeframeData.map((item) => {
                  const value = tfMode === "revenue" ? item.revenue : item.admissions;
                  const height = value === 0 ? 0 : Math.max(5, (value / tfMax) * 100);
                  return (
                    <div className="bar-column" key={item.label}>
                      <div className="bar-value">{value > 0 ? value : ""}</div>
                      <div className="chart-bar" style={{ height: `${height}%` }}></div>
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* MONTH WISE */}
        <div className="chart-panel">
          <div className="panel-toolbar month-toolbar">
            <h3>{mwMode === "revenue" ? "Month Wise Revenue" : "Month Wise Admissions"}</h3>
            <div className="filter-group">
              <label>Year</label>
              <select value={mwYear} onChange={(e) => setMwYear(e.target.value)}>
                {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="mode-btns">
              <button type="button" className={mwMode === "admissions" ? "mode-btn on" : "mode-btn off"} onClick={() => setMwMode("admissions")}>Admissions</button>
              <button type="button" className={mwMode === "revenue" ? "mode-btn danger" : "mode-btn off"} onClick={() => setMwMode("revenue")}>Revenue</button>
            </div>
          </div>
          <div className="legend"><span className="legend-color"></span><span>{mwMode === "revenue" ? "Revenue" : "Admissions Count"}</span></div>
          <div className="small-real-chart">
            <div className="small-y"><span>{mwMax}</span><span>{Math.round(mwMax * 0.5)}</span><span>0</span></div>
            <div className="small-chart-area">
              <div className="small-grid"><span></span><span></span><span></span></div>
              <div className="bars month-bars">
                {monthWiseData.map((item) => {
                  const value = mwMode === "revenue" ? item.revenue : item.admissions;
                  const height = value === 0 ? 0 : Math.max(5, (value / mwMax) * 100);
                  return (
                    <div className="bar-column" key={item.label}>
                      <div className="bar-value">{value > 0 ? value : ""}</div>
                      <div className="chart-bar" style={{ height: `${height}%` }}></div>
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admission;
