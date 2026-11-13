// import React, { useEffect, useMemo, useState, useCallback } from "react";
// import { FaCalendarCheck } from "react-icons/fa";
// import "./Inquiry.css";
// import {
//   getInquiryCountForCards,
//   getInquiryCountByYear,
//   getAllInquiries,
// } from "../../services/inquiryService.js";

// /* =--=====================================================
//    INQUIRY DASHBOARD — connected to backend
// =====================================================---- */

// const Inquiry = () => {
//   const [cardCounts, setCardCounts] = useState({
//     today: 0, last7Days: 0, last30Days: 0, last365Days: 0, total: 0,
//   });
//   const [monthWise, setMonthWise] = useState([]);
//   const [statusData, setStatusData] = useState([]);
//   const [timeframe, setTimeframe] = useState("week");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [appliedStartDate, setAppliedStartDate] = useState("");
//   const [appliedEndDate, setAppliedEndDate] = useState("");
//   const [loading, setLoading] = useState(true);

//   const currentYear = new Date().getFullYear();

//   /* ---- fetch card counts ---- */ 
//   const fetchCards = useCallback(async () => {
//     try {
//       const data = await getInquiryCountForCards();
//       setCardCounts({
//         today: data.today || 0,
//         last7Days: data.last7Days || 0,
//         last30Days: data.last30Days || 0,
//         last365Days: data.last365Days || 0,
//         total: data.total || 0,
//       });
//     } catch (err) {
//       console.error("Failed to fetch inquiry counts", err);
//     }
//   }, []);

//   /* ---- fetch month-wise (for trend chart) ---- */
//   const fetchMonthWise = useCallback(async () => {
//     try {
//       const data = await getInquiryCountByYear(currentYear);
//       // data = [{ month: "JAN", inquiryCount: 5 }, ...]
//       setMonthWise(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("Failed to fetch month-wise counts", err);
//     }
//   }, [currentYear]);

//   /* ---- fetch status distribution ---- */
//   const fetchStatusData = useCallback(async () => {
//     try {
//       const res = await getAllInquiries({ page: 0, size: 1000 });
//       // res = { totalInquiries, statusWiseCount: { "New": 3, ... }, content: [...] }
//       const statusMap = res.statusWiseCount || {};
//       const statuses = ["New", "Interested", "Callback", "Not Interested", "Joined", "DND", "Ringing/Waiting"];
//       setStatusData(statuses.map((s) => ({ status: s, count: statusMap[s] || 0 })));
//     } catch (err) {
//       console.error("Failed to fetch status data", err);
//     }
//   }, []);

//   useEffect(() => {
//     const fetchAll = async () => {
//       setLoading(true);
//       await Promise.all([fetchCards(), fetchMonthWise(), fetchStatusData()]);
//       setLoading(false);
//     };
//     fetchAll();

//     const refresh = () => fetchAll();
//     window.addEventListener("hostel-inq-updated", refresh);
//     return () => window.removeEventListener("hostel-inq-updated", refresh);
//   }, [fetchCards, fetchMonthWise, fetchStatusData]);

//   /* ---- summary cards ---- */
//   const summaryCards = [
//     { label: "Today's", count: cardCounts.today, color: "yellow" },
//     { label: "7 Days", count: cardCounts.last7Days, color: "red" },
//     { label: "30 Days", count: cardCounts.last30Days, color: "blue" },
//     { label: "365 Days", count: cardCounts.last365Days, color: "green" },
//     { label: "Total", count: cardCounts.total, color: "purple" },
//   ];

//   /* ---- trend chart data from monthWise ---- */
//   const trendData = useMemo(() => {
//     if (timeframe === "year") {
//       return monthWise.map((item) => ({
//         date: item.month,
//         day: item.month,
//         count: Number(item.inquiryCount) || 0,
//       }));
//     }
//     // For other timeframes show the summary bars
//     return [
//       { date: "today", day: "Today", count: cardCounts.today },
//       { date: "7d", day: "7 Days", count: cardCounts.last7Days },
//       { date: "30d", day: "30 Days", count: cardCounts.last30Days },
//       { date: "365d", day: "365 Days", count: cardCounts.last365Days },
//       { date: "total", day: "Total", count: cardCounts.total },
//     ];
//   }, [timeframe, monthWise, cardCounts]);

//   const maxTrend = Math.max(...trendData.map((i) => i.count), 1);

//   const tfTrendData = [
//     { date: "today", day: "Today", count: cardCounts.today },
//     { date: "7d", day: "7 Days", count: cardCounts.last7Days },
//     { date: "30d", day: "30 Days", count: cardCounts.last30Days },
//     { date: "365d", day: "365 Days", count: cardCounts.last365Days },
//     { date: "total", day: "Total", count: cardCounts.total },
//   ];
//   const tfMax = Math.max(...tfTrendData.map((i) => i.count), 1);

//   const totalCount = cardCounts.total;

//   const graphTitle = {
//     day: "Today",
//     week: "Last 7 Days",
//     month: "Last 30 Days",
//     year: `${currentYear} Month-wise`,
//     custom:
//       appliedStartDate && appliedEndDate
//         ? `${appliedStartDate} to ${appliedEndDate}`
//         : "Select date range",
//   };

//   const changeTimeframe = (value) => {
//     setTimeframe(value);
//     if (value !== "custom") {
//       setAppliedStartDate("");
//       setAppliedEndDate("");
//     }
//   };

//   const applyCustomRange = () => {
//     if (!startDate || !endDate) {
//       alert("Please select both Start Date and End Date.");
//       return;
//     }
//     if (startDate > endDate) {
//       alert("Start date cannot be after end date.");
//       return;
//     }
//     setAppliedStartDate(startDate);
//     setAppliedEndDate(endDate);
//   };

//   if (loading) {
//     return (
//       <div style={{ padding: 32, textAlign: "center", color: "#64748b" }}>
//         Loading inquiry dashboard...
//       </div>
//     );
//   }

//   return (
//     <div className="inquiry-dashboard">
//       {/* ===================== SUMMARY CARDS ===================== */}
//       <div className="inquiry-summary">
//         {summaryCards.map((card) => (
//           <div key={card.label} className={`inq-card ${card.color}`}>
//             <div className="inq-card-content">
//               <span>{card.label}</span>
//               <div className="card-two-row">
//                 <small>Inquiries</small>
//                 <strong>{card.count}</strong>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* ===================== MAIN TREND ===================== */}
//       <div className="inquiry-analytics">
//         <div className="analytics-card trend-card">
//           <div className="analytics-header">
//             <div>
//               <h2>Inquiry Trend</h2>
//               <p>Inquiry activity — {graphTitle[timeframe]}</p>
//             </div>
//             <div className="timeframe-selector">
//               {["day", "week", "month", "year", "custom"].map((tf) => (
//                 <button
//                   key={tf}
//                   className={timeframe === tf ? "active" : ""}
//                   onClick={() => changeTimeframe(tf)}
//                 >
//                   {tf.charAt(0).toUpperCase() + tf.slice(1)}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {timeframe === "custom" && (
//             <div className="custom-date-panel">
//               <div className="date-field">
//                 <label>Start Date</label>
//                 <div className="date-input-wrap">
//                   <FaCalendarCheck />
//                   <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
//                 </div>
//               </div>
//               <div className="date-field">
//                 <label>End Date</label>
//                 <div className="date-input-wrap">
//                   <FaCalendarCheck />
//                   <input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} />
//                 </div>
//               </div>
//               <button className="apply-date-btn" onClick={applyCustomRange}>Apply</button>
//             </div>
//           )}

//           <div className="trend-chart">
//             <div className="trend-y-axis">
//               <span>{maxTrend}</span>
//               <span>{Math.ceil(maxTrend * 0.75)}</span>
//               <span>{Math.ceil(maxTrend * 0.5)}</span>
//               <span>{Math.ceil(maxTrend * 0.25)}</span>
//               <span>0</span>
//             </div>
//             <div className="trend-area">
//               <div className="trend-grid">
//                 {[1, 2, 3, 4, 5].map((n) => <span key={n}></span>)}
//               </div>
//               <div className={`trend-bars trend-${timeframe}`}>
//                 {trendData.map((item) => {
//                   const h = item.count === 0 ? 3 : Math.max((item.count / maxTrend) * 100, 8);
//                   return (
//                     <div className="trend-column" key={item.date}>
//                       <div className="trend-count">{item.count}</div>
//                       <div className="trend-bar-wrap">
//                         <div className="trend-bar" style={{ height: `${h}%` }} />
//                       </div>
//                       <span className="trend-day">{item.day}</span>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="inquiry-lower">
//         {/* ===================== TIMEFRAME CHART ===================== */}
//         <div className="analytics-card tf-card">
//           <div className="analytics-header">
//             <div>
//               <h2>Timeframe</h2>
//               <p>Inquiry Count</p>
//             </div>
//           </div>
//           <div className="trend-chart tf-chart">
//             <div className="trend-y-axis">
//               <span>{tfMax}</span>
//               <span>{Math.ceil(tfMax * 0.75)}</span>
//               <span>{Math.ceil(tfMax * 0.5)}</span>
//               <span>{Math.ceil(tfMax * 0.25)}</span>
//               <span>0</span>
//             </div>
//             <div className="trend-area">
//               <div className="trend-grid">
//                 {[1, 2, 3, 4, 5].map((n) => <span key={n}></span>)}
//               </div>
//               <div className="trend-bars tf-summary-bars">
//                 {tfTrendData.map((item) => {
//                   const h = item.count === 0 ? 3 : Math.max((item.count / tfMax) * 100, 8);
//                   return (
//                     <div className="trend-column" key={item.date}>
//                       <div className="trend-count">{item.count}</div>
//                       <div className="trend-bar-wrap">
//                         <div className="trend-bar" style={{ height: `${h}%` }} />
//                       </div>
//                       <span className="trend-day">{item.day}</span>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ===================== STATUS ===================== */}
//         <div className="analytics-card status-card">
//           <div className="analytics-header">
//             <div>
//               <h2>Inquiry Status</h2>
//               <p>Current inquiry distribution</p>
//             </div>
//           </div>
//           <div className="status-list">
//             {statusData.map((item) => {
//               const pct = totalCount ? Math.round((item.count / totalCount) * 100) : 0;
//               return (
//                 <div className="status-row" key={item.status}>
//                   <div className="status-info">
//                     <span>{item.status}</span>
//                     <strong>{item.count}</strong>
//                   </div>
//                   <div className="status-progress">
//                     <div className="status-progress-fill" style={{ width: `${pct}%` }} />
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Inquiry;




import React, { useEffect, useMemo, useState, useCallback } from "react";
import { FaCalendarCheck } from "react-icons/fa";
import "./Inquiry.css";
import {
  getInquiryCountForCards,
  getInquiryCountByYear,
  getAllInquiries,
} from "../../services/inquiryService.js";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const Inquiry = () => {
  const [cardCounts, setCardCounts] = useState({
    today: 0, last7Days: 0, last30Days: 0, last365Days: 0, total: 0,
  });
  const [monthWise, setMonthWise] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [allInquiries, setAllInquiries] = useState([]); // for day-wise aggregation
  const [timeframe, setTimeframe] = useState("month");  // default to month view
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  // Day-wise selectors
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-based
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth); // 0-11

  /* ---- fetch card counts ---- */
  const fetchCards = useCallback(async () => {
    try {
      const data = await getInquiryCountForCards();
      setCardCounts({
        today: data.today || 0,
        last7Days: data.last7Days || 0,
        last30Days: data.last30Days || 0,
        last365Days: data.last365Days || 0,
        total: data.total || 0,
      });
    } catch (err) {
      console.error("Failed to fetch inquiry counts", err);
    }
  }, []);

  /* ---- fetch month-wise (for year view) ---- */
  const fetchMonthWise = useCallback(async () => {
    try {
      const data = await getInquiryCountByYear(selectedYear);
      setMonthWise(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch month-wise counts", err);
    }
  }, [selectedYear]);

  /* ---- fetch all inquiries (for day-wise + status) ---- */
  const fetchAllInquiries = useCallback(async () => {
    try {
      const res = await getAllInquiries({ page: 0, size: 5000 });
      const list = res.content || res || [];
      setAllInquiries(Array.isArray(list) ? list : []);

      // status distribution
      const statusMap = res.statusWiseCount || {};
      const statuses = ["New", "Interested", "Callback", "Not Interested", "Joined", "DND", "Ringing/Waiting"];
      setStatusData(statuses.map((s) => ({ status: s, count: statusMap[s] || 0 })));
    } catch (err) {
      console.error("Failed to fetch inquiries", err);
    }
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([fetchCards(), fetchMonthWise(), fetchAllInquiries()]);
      setLoading(false);
    };
    fetchAll();

    const refresh = () => fetchAll();
    window.addEventListener("hostel-inq-updated", refresh);
    return () => window.removeEventListener("hostel-inq-updated", refresh);
  }, [fetchCards, fetchMonthWise, fetchAllInquiries]);

  /* ---- summary cards ---- */
  const summaryCards = [
    { label: "Today's", count: cardCounts.today, color: "yellow" },
    { label: "7 Days", count: cardCounts.last7Days, color: "red" },
    { label: "30 Days", count: cardCounts.last30Days, color: "blue" },
    { label: "365 Days", count: cardCounts.last365Days, color: "green" },
    { label: "Total", count: cardCounts.total, color: "purple" },
  ];

  /* ---- DAY-WISE data for selected month/year ---- */
  const dayWiseData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const counts = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      count: 0,
    }));

    allInquiries.forEach((inq) => {
      const dateStr = inq.inquiryDate || inq.createdAt || inq.date;
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (
        d.getFullYear() === selectedYear &&
        d.getMonth() === selectedMonth
      ) {
        const day = d.getDate();
        if (counts[day - 1]) counts[day - 1].count += 1;
      }
    });

    return counts;
  }, [allInquiries, selectedYear, selectedMonth]);

  /* ---- trend chart data ---- */
  const trendData = useMemo(() => {
    if (timeframe === "year") {
      return monthWise.map((item) => ({
        date: item.month,
        day: item.month,
        count: Number(item.inquiryCount) || 0,
      }));
    }

    if (timeframe === "month" || timeframe === "day") {
      // Day-wise bars for the selected month
      return dayWiseData.map((item) => ({
        date: item.day,
        day: String(item.day),
        count: item.count,
      }));
    }

    // week / custom / fallback → summary style
    return [
      { date: "today", day: "Today", count: cardCounts.today },
      { date: "7d", day: "7 Days", count: cardCounts.last7Days },
      { date: "30d", day: "30 Days", count: cardCounts.last30Days },
      { date: "365d", day: "365 Days", count: cardCounts.last365Days },
      { date: "total", day: "Total", count: cardCounts.total },
    ];
  }, [timeframe, monthWise, dayWiseData, cardCounts]);

  const maxTrend = Math.max(...trendData.map((i) => i.count), 1);

  const tfTrendData = [
    { date: "today", day: "Today", count: cardCounts.today },
    { date: "7d", day: "7 Days", count: cardCounts.last7Days },
    { date: "30d", day: "30 Days", count: cardCounts.last30Days },
    { date: "365d", day: "365 Days", count: cardCounts.last365Days },
    { date: "total", day: "Total", count: cardCounts.total },
  ];
  const tfMax = Math.max(...tfTrendData.map((i) => i.count), 1);

  const totalCount = cardCounts.total;

  const graphTitle = {
    day: `${MONTHS[selectedMonth]} ${selectedYear} – Daily`,
    week: "Last 7 Days",
    month: `${MONTHS[selectedMonth]} ${selectedYear} – Daily`,
    year: `${selectedYear} Month-wise`,
    custom:
      appliedStartDate && appliedEndDate
        ? `${appliedStartDate} to ${appliedEndDate}`
        : "Select date range",
  };

  const changeTimeframe = (value) => {
    setTimeframe(value);
    if (value !== "custom") {
      setAppliedStartDate("");
      setAppliedEndDate("");
    }
  };

  const applyCustomRange = () => {
    if (!startDate || !endDate) {
      alert("Please select both Start Date and End Date.");
      return;
    }
    if (startDate > endDate) {
      alert("Start date cannot be after end date.");
      return;
    }
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  };

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: "#64748b" }}>
        Loading inquiry dashboard...
      </div>
    );
  }

  return (
    <div className="inquiry-dashboard">
      {/* ===================== SUMMARY CARDS ===================== */}
      <div className="inquiry-summary">
        {summaryCards.map((card) => (
          <div key={card.label} className={`inq-card ${card.color}`}>
            <div className="inq-card-content">
              <span>{card.label}</span>
              <div className="card-two-row">
                <small>Inquiries</small>
                <strong>{card.count}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ===================== MAIN TREND ===================== */}
      <div className="inquiry-analytics">
        <div className="analytics-card trend-card">
          <div className="analytics-header">
            <div>
              <h2>
                {timeframe === "month" || timeframe === "day"
                  ? "Daily Inquiry Count"
                  : "Inquiry Trend"}
              </h2>
              <p>Inquiry activity — {graphTitle[timeframe]}</p>
            </div>

            <div className="header-controls">
              {/* Month / Year selectors – shown for day & month views */}
              {(timeframe === "month" || timeframe === "day") && (
                <div className="month-year-selectors">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="my-select"
                  >
                    {MONTHS.map((m, i) => (
                      <option key={m} value={i}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="my-select"
                  >
                    {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="timeframe-selector">
                {["day", "week", "month", "year", "custom"].map((tf) => (
                  <button
                    key={tf}
                    className={timeframe === tf ? "active" : ""}
                    onClick={() => changeTimeframe(tf)}
                  >
                    {tf.charAt(0).toUpperCase() + tf.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {timeframe === "custom" && (
            <div className="custom-date-panel">
              <div className="date-field">
                <label>Start Date</label>
                <div className="date-input-wrap">
                  <FaCalendarCheck />
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
              </div>
              <div className="date-field">
                <label>End Date</label>
                <div className="date-input-wrap">
                  <FaCalendarCheck />
                  <input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
              <button className="apply-date-btn" onClick={applyCustomRange}>Apply</button>
            </div>
          )}

          <div className="trend-chart">
            <div className="trend-y-axis">
              <span>{maxTrend}</span>
              <span>{Math.ceil(maxTrend * 0.75)}</span>
              <span>{Math.ceil(maxTrend * 0.5)}</span>
              <span>{Math.ceil(maxTrend * 0.25)}</span>
              <span>0</span>
            </div>
            <div className="trend-area">
              <div className="trend-grid">
                {[1, 2, 3, 4, 5].map((n) => <span key={n}></span>)}
              </div>
              <div className={`trend-bars trend-${timeframe}`}>
                {trendData.map((item) => {
                  const h = item.count === 0 ? 3 : Math.max((item.count / maxTrend) * 100, 8);
                  return (
                    <div className="trend-column" key={item.date}>
                      <div className="trend-count">{item.count || ""}</div>
                      <div className="trend-bar-wrap">
                        <div className="trend-bar" style={{ height: `${h}%` }} />
                      </div>
                      <span className="trend-day">{item.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== LOWER SECTION (unchanged) ===================== */}
      <div className="inquiry-lower">
        <div className="analytics-card tf-card">
          <div className="analytics-header">
            <div>
              <h2>Timeframe</h2>
              <p>Inquiry Count</p>
            </div>
          </div>
          <div className="trend-chart tf-chart">
            <div className="trend-y-axis">
              <span>{tfMax}</span>
              <span>{Math.ceil(tfMax * 0.75)}</span>
              <span>{Math.ceil(tfMax * 0.5)}</span>
              <span>{Math.ceil(tfMax * 0.25)}</span>
              <span>0</span>
            </div>
            <div className="trend-area">
              <div className="trend-grid">
                {[1, 2, 3, 4, 5].map((n) => <span key={n}></span>)}
              </div>
              <div className="trend-bars tf-summary-bars">
                {tfTrendData.map((item) => {
                  const h = item.count === 0 ? 3 : Math.max((item.count / tfMax) * 100, 8);
                  return (
                    <div className="trend-column" key={item.date}>
                      <div className="trend-count">{item.count}</div>
                      <div className="trend-bar-wrap">
                        <div className="trend-bar" style={{ height: `${h}%` }} />
                      </div>
                      <span className="trend-day">{item.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-card status-card">
          <div className="analytics-header">
            <div>
              <h2>Inquiry Status</h2>
              <p>Current inquiry distribution</p>
            </div>
          </div>
          <div className="status-list">
            {statusData.map((item) => {
              const pct = totalCount ? Math.round((item.count / totalCount) * 100) : 0;
              return (
                <div className="status-row" key={item.status}>
                  <div className="status-info">
                    <span>{item.status}</span>
                    <strong>{item.count}</strong>
                  </div>
                  <div className="status-progress">
                    <div className="status-progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inquiry;