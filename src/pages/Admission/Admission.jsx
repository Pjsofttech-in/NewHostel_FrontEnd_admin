import React, { useEffect, useMemo, useState } from "react";
import "./Admission.css";
const ADM_KEY = "hostel-admissions";
const getAdmissions = () => {
  try {
    const data = JSON.parse(localStorage.getItem(ADM_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};
const Admission = () => {
  const [admissions, setAdmissions] = useState(getAdmissions);
  const [month, setMonth] = useState("August");
  const [year, setYear] = useState("2026");
  const [mode, setMode] = useState("admissions");
  const [tfMode, setTfMode] = useState("admissions");
  const [mwMode, setMwMode] = useState("admissions");
  const [mwYear, setMwYear] = useState("2026");
  /* ========================================= REFRESH DASHBOARD DATA ========================================= */
     useEffect(() => {
    const refresh = () => {
      setAdmissions(getAdmissions());
    };
    window.addEventListener("hostel-admission-updated", refresh);
    window.addEventListener("hostel-reg-updated", refresh);
    window.addEventListener("storage", refresh);
    refresh();
    return () => {
      window.removeEventListener("hostel-admission-updated", refresh);
      window.removeEventListener("hostel-reg-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  /* ========================================= DATE HELPERS ========================================= */
   const getDate =
    (row) => {
      const value =
        row.admissionDate || row.createdAt || row.date || row.stayFrom || "";
      if (!value) return null;
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return null;
      return d;
    };
  const getRevenue = (row) => {
    return (
      Number(row.grandTotal) ||
      Number(row.totalAmount) ||
      Number(row.amountPaid) ||
      0
    );
  };
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const daysDifference = (date) => {
    const d = startOfDay(date);
    return Math.floor((today - d) / (1000 * 60 * 60 * 24));
  };
  /* ========================================= SUMMARY ========================================= */ const summary =
    useMemo(() => {
      let todayAdmissions = 0;
      let todayRevenue = 0;
      let sevenAdmissions = 0;
      let sevenRevenue = 0;
      let thirtyAdmissions = 0;
      let thirtyRevenue = 0;
      let yearAdmissions = 0;
      let yearRevenue = 0;
      let totalAdmissions = admissions.length;
      let totalRevenue = 0;
      admissions.forEach((row) => {
        const date = getDate(row);
        const revenue = getRevenue(row);
        totalRevenue += revenue;
        if (!date) return;
        const diff = daysDifference(date);
        if (diff === 0) {
          todayAdmissions++;
          todayRevenue += revenue;
        }
        if (diff >= 0 && diff < 7) {
          sevenAdmissions++;
          sevenRevenue += revenue;
        }
        if (diff >= 0 && diff < 30) {
          thirtyAdmissions++;
          thirtyRevenue += revenue;
        }
        if (diff >= 0 && diff < 365) {
          yearAdmissions++;
          yearRevenue += revenue;
        }
      });
      return {
        today: { admissions: todayAdmissions, revenue: todayRevenue },
        seven: { admissions: sevenAdmissions, revenue: sevenRevenue },
        thirty: { admissions: thirtyAdmissions, revenue: thirtyRevenue },
        year: { admissions: yearAdmissions, revenue: yearRevenue },
        total: { admissions: totalAdmissions, revenue: totalRevenue },
      };
    }, [admissions, today]);
  /* ========================================= SUMMARY CARDS ========================================= */ const cards =
    [
      { title: "Today's", cls: "card-yellow", data: summary.today },
      { title: "7 Days", cls: "card-red", data: summary.seven },
      { title: "30 Days", cls: "card-blue", data: summary.thirty },
      { title: "365 Days", cls: "card-green", data: summary.year },
      { title: "Total", cls: "card-purple", data: summary.total },
    ];
  /* ========================================= MONTH DATA ========================================= */ const monthNumber =
    new Date(`${month} 1, ${year}`).getMonth();
  const selectedMonthAdmissions = useMemo(() => {
    return admissions.filter((row) => {
      const date = getDate(row);
      if (!date) return false;
      return (
        date.getFullYear() === Number(year) && date.getMonth() === monthNumber
      );
    });
  }, [admissions, monthNumber, year]);
  /* ========================================= DATE WISE DATA ========================================= */ const daysInMonth =
    new Date(Number(year), monthNumber + 1, 0).getDate();
  const dateWiseData = useMemo(() => {
    const result = Array.from({ length: daysInMonth }, (_, index) => ({
      day: index + 1,
      admissions: 0,
      revenue: 0,
    }));
    selectedMonthAdmissions.forEach((row) => {
      const date = getDate(row);
      if (!date) return;
      const day = date.getDate();
      if (result[day - 1]) {
        result[day - 1].admissions += 1;
        result[day - 1].revenue += getRevenue(row);
      }
    });
    return result;
  }, [selectedMonthAdmissions, daysInMonth]);
  /* ========================================= TIMEFRAME DATA ========================================= */ const timeframeData =
    useMemo(() => {
      const ranges = [
        { label: "Today", days: 1 },
        { label: "7 Days", days: 7 },
        { label: "30 Days", days: 30 },
        { label: "365 Days", days: 365 },
        { label: "Total", days: null },
      ];
      return ranges.map((range) => {
        let count = 0;
        let revenue = 0;
        admissions.forEach((row) => {
          const date = getDate(row);
          if (!date) return;
          const diff = daysDifference(date);
          if (range.days === null) {
            count++;
            revenue += getRevenue(row);
          } else if (diff >= 0 && diff < range.days) {
            count++;
            revenue += getRevenue(row);
          }
        });
        return { label: range.label, admissions: count, revenue };
      });
    }, [admissions, today]);
  /* ========================================= MONTH WISE DATA ========================================= */ const monthLabels =
    [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
  const monthWiseData = useMemo(() => {
    return monthLabels.map((label, index) => {
      let count = 0;
      let revenue = 0;
      admissions.forEach((row) => {
        const date = getDate(row);
        if (!date) return;
        if (
          date.getFullYear() === Number(mwYear) &&
          date.getMonth() === index
        ) {
          count++;
          revenue += getRevenue(row);
        }
      });
      return { label, admissions: count, revenue };
    });
  }, [admissions, mwYear]);
  /* ========================================= MAX VALUES FOR CHART ========================================= */ const dateMax =
    Math.max(
      1,
      ...dateWiseData.map((item) =>
        mode === "revenue" ? item.revenue : item.admissions,
      ),
    );
  const timeframeMax = Math.max(
    1,
    ...timeframeData.map((item) =>
      tfMode === "revenue" ? item.revenue : item.admissions,
    ),
  );
  const monthMax = Math.max(
    1,
    ...monthWiseData.map((item) =>
      mwMode === "revenue" ? item.revenue : item.admissions,
    ),
  );
  /* ========================================= MONTHS ========================================= */ const months =
    [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
  return (
    <div className="dashboard-wrapper admission-dashboard">
      {" "}
      {/* ========================================= SUMMARY CARDS ========================================= */}{" "}
      <div className="dashboard-cards">
        {" "}
        {cards.map((card) => (
          <div key={card.title} className={`dashboard-card ${card.cls}`}>
            {" "}
            <div className="card-title">{card.title}</div>{" "}
            <div className="card-bottom">
              {" "}
              <span>Admissions</span>{" "}
              <strong>{card.data.admissions}</strong>{" "}
            </div>{" "}
            <div className="card-bottom">
              {" "}
              <span>Revenue</span>{" "}
              <strong>
                {" "}
                ₹ {Number(card.data.revenue).toLocaleString("en-IN")}{" "}
              </strong>{" "}
            </div>{" "}
          </div>
        ))}{" "}
      </div>{" "}
      {/* ========================================= DATE WISE CHART ========================================= */}{" "}
      <div className="daily-inquiries">
        {" "}
        <div className="daily-header admission-chart-header">
          {" "}
          <div>
            {" "}
            <h2>Date Wise Admissions</h2>{" "}
            <p>
              {" "}
              {selectedMonthAdmissions.length} admissions found for {month}{" "}
              {year}{" "}
            </p>{" "}
          </div>{" "}
          <div className="chart-header-actions">
            {" "}
            <div className="date-filters">
              {" "}
              <div className="filter-group">
                {" "}
                <label>Month</label>{" "}
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                >
                  {" "}
                  {months.map((m) => (
                    <option key={m}>{m}</option>
                  ))}{" "}
                </select>{" "}
              </div>{" "}
              <div className="filter-group">
                {" "}
                <label>Year</label>{" "}
                <select value={year} onChange={(e) => setYear(e.target.value)}>
                  {" "}
                  <option>2024</option> <option>2025</option>{" "}
                  <option>2026</option> <option>2027</option>{" "}
                </select>{" "}
              </div>{" "}
            </div>{" "}
            <div className="mode-btns">
              {" "}
              <button
                type="button"
                className={
                  mode === "admissions" ? "mode-btn on" : "mode-btn off"
                }
                onClick={() => setMode("admissions")}
              >
                {" "}
                Admissions{" "}
              </button>{" "}
              <button
                type="button"
                className={
                  mode === "revenue" ? "mode-btn danger" : "mode-btn off"
                }
                onClick={() => setMode("revenue")}
              >
                {" "}
                Revenue{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="legend">
          {" "}
          <span className="legend-color"></span>{" "}
          <span>
            {" "}
            {mode === "revenue" ? "Revenue" : "Admissions Count"}{" "}
          </span>{" "}
        </div>{" "}
        <div className="real-chart">
          {" "}
          <div className="real-chart-y">
            {" "}
            <span>{dateMax}</span> <span>{Math.round(dateMax * 0.75)}</span>{" "}
            <span>{Math.round(dateMax * 0.5)}</span>{" "}
            <span>{Math.round(dateMax * 0.25)}</span> <span>0</span>{" "}
          </div>{" "}
          <div className="real-chart-area">
            {" "}
            <div className="real-grid">
              {" "}
              {[1, 2, 3, 4, 5].map((item) => (
                <span key={item}></span>
              ))}{" "}
            </div>{" "}
            <div className="bars date-bars">
              {" "}
              {dateWiseData.map((item) => {
                const value =
                  mode === "revenue" ? item.revenue : item.admissions;
                const height =
                  value === 0 ? 0 : Math.max(5, (value / dateMax) * 100);
                return (
                  <div className="bar-column" key={item.day}>
                    {" "}
                    <div className="bar-value">
                      {" "}
                      {value > 0 ? value : ""}{" "}
                    </div>{" "}
                    <div
                      className="chart-bar"
                      style={{ height: `${height}%` }}
                      title={`${item.day}: ${mode === "revenue" ? `₹${value}` : value}`}
                    ></div>{" "}
                    <span>{item.day}</span>{" "}
                  </div>
                );
              })}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* ========================================= TWO CHARTS ========================================= */}{" "}
      <div className="two-charts">
        {" "}
        {/* TIMEFRAME */}{" "}
        <div className="chart-panel">
          {" "}
          <h2 className="panel-title">Timeframe</h2>{" "}
          <div className="panel-toolbar">
            {" "}
            <h3> {tfMode === "revenue" ? "Revenue" : "Admissions"} </h3>{" "}
            <div className="mode-btns">
              {" "}
              <button
                type="button"
                className={
                  tfMode === "admissions" ? "mode-btn on" : "mode-btn off"
                }
                onClick={() => setTfMode("admissions")}
              >
                {" "}
                Admissions{" "}
              </button>{" "}
              <button
                type="button"
                className={
                  tfMode === "revenue" ? "mode-btn danger" : "mode-btn off"
                }
                onClick={() => setTfMode("revenue")}
              >
                {" "}
                Revenue{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
          <div className="legend">
            {" "}
            <span className="legend-color"></span>{" "}
            <span>
              {" "}
              {tfMode === "revenue" ? "Revenue" : "Admissions Count"}{" "}
            </span>{" "}
          </div>{" "}
          <div className="small-real-chart">
            {" "}
            <div className="small-y">
              {" "}
              <span>{timeframeMax}</span>{" "}
              <span>{Math.round(timeframeMax * 0.5)}</span> <span>0</span>{" "}
            </div>{" "}
            <div className="small-chart-area">
              {" "}
              <div className="small-grid">
                {" "}
                <span></span> <span></span> <span></span>{" "}
              </div>{" "}
              <div className="bars timeframe-bars">
                {" "}
                {timeframeData.map((item) => {
                  const value =
                    tfMode === "revenue" ? item.revenue : item.admissions;
                  const height =
                    value === 0 ? 0 : Math.max(5, (value / timeframeMax) * 100);
                  return (
                    <div className="bar-column" key={item.label}>
                      {" "}
                      <div className="bar-value">
                        {" "}
                        {value > 0 ? value : ""}{" "}
                      </div>{" "}
                      <div
                        className="chart-bar"
                        style={{ height: `${height}%` }}
                      ></div>{" "}
                      <span>{item.label}</span>{" "}
                    </div>
                  );
                })}{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* MONTH WISE */}{" "}
        <div className="chart-panel">
          {" "}
          <div className="panel-toolbar month-toolbar">
            {" "}
            <h3>
              {" "}
              {mwMode === "revenue"
                ? "Month Wise Revenue"
                : "Month Wise Admissions"}{" "}
            </h3>{" "}
            <div className="filter-group">
              {" "}
              <label>Year</label>{" "}
              <select
                value={mwYear}
                onChange={(e) => setMwYear(e.target.value)}
              >
                {" "}
                <option>2024</option> <option>2025</option>{" "}
                <option>2026</option> <option>2027</option>{" "}
              </select>{" "}
            </div>{" "}
            <div className="mode-btns">
              {" "}
              <button
                type="button"
                className={
                  mwMode === "admissions" ? "mode-btn on" : "mode-btn off"
                }
                onClick={() => setMwMode("admissions")}
              >
                {" "}
                Admissions{" "}
              </button>{" "}
              <button
                type="button"
                className={
                  mwMode === "revenue" ? "mode-btn danger" : "mode-btn off"
                }
                onClick={() => setMwMode("revenue")}
              >
                {" "}
                Revenue{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
          <div className="legend">
            {" "}
            <span className="legend-color"></span>{" "}
            <span>
              {" "}
              {mwMode === "revenue" ? "Revenue" : "Admissions Count"}{" "}
            </span>{" "}
          </div>{" "}
          <div className="small-real-chart">
            {" "}
            <div className="small-y">
              {" "}
              <span>{monthMax}</span> <span>{Math.round(monthMax * 0.5)}</span>{" "}
              <span>0</span>{" "}
            </div>{" "}
            <div className="small-chart-area">
              {" "}
              <div className="small-grid">
                {" "}
                <span></span> <span></span> <span></span>{" "}
              </div>{" "}
              <div className="bars month-bars">
                {" "}
                {monthWiseData.map((item) => {
                  const value =
                    mwMode === "revenue" ? item.revenue : item.admissions;
                  const height =
                    value === 0 ? 0 : Math.max(5, (value / monthMax) * 100);
                  return (
                    <div className="bar-column" key={item.label}>
                      {" "}
                      <div className="bar-value">
                        {" "}
                        {value > 0 ? value : ""}{" "}
                      </div>{" "}
                      <div
                        className="chart-bar"
                        style={{ height: `${height}%` }}
                      ></div>{" "}
                      <span>{item.label}</span>{" "}
                    </div>
                  );
                })}{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
export default Admission;
