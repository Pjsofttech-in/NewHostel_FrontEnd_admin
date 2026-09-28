import React, { useEffect, useMemo, useState } from "react";
import { FaCalendarCheck } from "react-icons/fa";
import "./Inquiry.css";

const INQUIRY_KEY = "hostel-inquiries";

const loadInquiries = () => {
  try {
    const data = JSON.parse(localStorage.getItem(INQUIRY_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const getDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getInquiryDate = (item) => item?.date || "";

const isInLastDays = (item, days) => {
  if (!getInquiryDate(item)) return false;

  const today = new Date();

  today.setHours(23, 59, 59, 999);

  const start = new Date(today);

  start.setDate(today.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const d = new Date(`${getInquiryDate(item)}T00:00:00`);

  return d >= start && d <= today;
};

const buildTrendSeries = (inquiries, range) => {
  const today = new Date();

  const countForDays = (days) => {
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));

    return inquiries.filter((item) => {
      const d = new Date(item.date || item.createdAt || item.inquiryDate);
      if (Number.isNaN(d.getTime())) return false;
      d.setHours(0, 0, 0, 0);
      return d >= start && d <= today;
    }).length;
  };

  if (range === "day") {
    return [{ date: "today", day: "Today", count: countForDays(1) }];
  }

  if (range === "week") {
    return [{ date: "7-days", day: "7 Days", count: countForDays(7) }];
  }

  if (range === "month") {
    return [{ date: "30-days", day: "30 Days", count: countForDays(30) }];
  }

  if (range === "year") {
    return [{ date: "365-days", day: "365 Days", count: countForDays(365) }];
  }

  if (range === "total") {
    return [{ date: "total", day: "Total", count: inquiries.length }];
  }

  return [];
};

const Inquiry = () => {
  const [inquiries, setInquiries] = useState(loadInquiries);

  /* Main Inquiry Trend */
  const [timeframe, setTimeframe] = useState("week");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

  /* Timeframe Graph */

  useEffect(() => {
    const refresh = () => {
      setInquiries(loadInquiries());
    };

    refresh();

    window.addEventListener("hostel-inq-updated", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("hostel-inq-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  /* =========================================================
     SUMMARY CARDS
  ========================================================= */

  const todayCount = useMemo(
    () => inquiries.filter((i) => getInquiryDate(i) === getDateString()).length,
    [inquiries],
  );

  const sevenCount = useMemo(
    () => inquiries.filter((i) => isInLastDays(i, 7)).length,
    [inquiries],
  );

  const thirtyCount = useMemo(
    () => inquiries.filter((i) => isInLastDays(i, 30)).length,
    [inquiries],
  );

  const yearCount = useMemo(
    () => inquiries.filter((i) => isInLastDays(i, 365)).length,
    [inquiries],
  );

  const totalCount = inquiries.length;

  const todayJoined = useMemo(
    () =>
      inquiries.filter(
        (i) => getInquiryDate(i) === getDateString() && i.status === "Joined",
      ).length,
    [inquiries],
  );

  const sevenJoined = useMemo(
    () =>
      inquiries.filter((i) => isInLastDays(i, 7) && i.status === "Joined")
        .length,
    [inquiries],
  );

  const thirtyJoined = useMemo(
    () =>
      inquiries.filter((i) => isInLastDays(i, 30) && i.status === "Joined")
        .length,
    [inquiries],
  );

  const yearJoined = useMemo(
    () =>
      inquiries.filter((i) => isInLastDays(i, 365) && i.status === "Joined")
        .length,
    [inquiries],
  );

  const totalJoined = useMemo(
    () => inquiries.filter((i) => i.status === "Joined").length,
    [inquiries],
  );

  const summaryCards = [
    {
      label: "Today's",
      count: todayCount,
      joined: todayJoined,
      color: "yellow",
    },
    {
      label: "7 Days",
      count: sevenCount,
      joined: sevenJoined,
      color: "red",
    },
    {
      label: "30 Days",
      count: thirtyCount,
      joined: thirtyJoined,
      color: "blue",
    },
    {
      label: "365 Days",
      count: yearCount,
      joined: yearJoined,
      color: "green",
    },
    {
      label: "Total",
      count: totalCount,
      joined: totalJoined,
      color: "purple",
    },
  ];

  /* =========================================================
     MAIN INQUIRY TREND
  ========================================================= */

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

  const trendData = useMemo(() => {
    const today = new Date();

    /* DAY - 24 HOURS */
    if (timeframe === "day") {
      const result = [];

      for (let i = 23; i >= 0; i--) {
        const hourDate = new Date(today);

        hourDate.setHours(today.getHours() - i, 0, 0, 0);

        const dateString = getDateString(hourDate);

        const count = inquiries.filter(
          (item) => getInquiryDate(item) === dateString,
        ).length;

        const hr = hourDate.getHours();
        const hourLabel = hr % 12 === 0 ? 12 : hr % 12;
        const period = hr < 12 ? "AM" : "PM";

        result.push({
          date: `${dateString}-${hr}`,
          day: `${hourLabel} ${period}`,
          count,
        });
      }

      return result;
    }

    /* WEEK */
    if (timeframe === "week") {
      const result = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);

        date.setDate(today.getDate() - i);

        const dateString = getDateString(date);

        const count = inquiries.filter(
          (item) => getInquiryDate(item) === dateString,
        ).length;

        result.push({
          date: dateString,
          day: date.toLocaleDateString("en-US", {
            weekday: "short",
          }),
          count,
        });
      }

      return result;
    }

    /* MONTH */
    if (timeframe === "month") {
      const result = [];

      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);

        date.setDate(today.getDate() - i);

        const dateString = getDateString(date);

        const count = inquiries.filter(
          (item) => getInquiryDate(item) === dateString,
        ).length;

        result.push({
          date: dateString,
          day: String(date.getDate()),
          count,
        });
      }

      return result;
    }

    /* YEAR */
    if (timeframe === "year") {
      const result = [];

      for (let i = 11; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);

        const year = date.getFullYear();
        const month = date.getMonth();

        const count = inquiries.filter((item) => {
          if (!getInquiryDate(item)) return false;

          const inquiryDate = new Date(`${getInquiryDate(item)}T00:00:00`);

          return (
            inquiryDate.getFullYear() === year &&
            inquiryDate.getMonth() === month
          );
        }).length;

        result.push({
          date: `${year}-${month}`,
          day: date.toLocaleDateString("en-US", {
            month: "short",
          }),
          count,
        });
      }

      return result;
    }

    /* CUSTOM */
    if (timeframe === "custom") {
      if (!appliedStartDate || !appliedEndDate) {
        return [];
      }

      const start = new Date(`${appliedStartDate}T00:00:00`);
      const end = new Date(`${appliedEndDate}T00:00:00`);

      const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

      const result = [];

      for (let i = 0; i < diff; i++) {
        const date = new Date(start);

        date.setDate(start.getDate() + i);

        const dateString = getDateString(date);

        const count = inquiries.filter(
          (item) => getInquiryDate(item) === dateString,
        ).length;

        result.push({
          date: dateString,
          day: date.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
          }),
          count,
        });
      }

      return result;
    }

    return [];
  }, [inquiries, timeframe, appliedStartDate, appliedEndDate]);

  const maxTrend = Math.max(...trendData.map((item) => item.count), 1);

  const selectedRangeTotal = useMemo(() => {
    if (timeframe !== "custom") return null;

    if (!appliedStartDate || !appliedEndDate) {
      return null;
    }

    return inquiries.filter((item) => {
      const d = getInquiryDate(item);

      return d >= appliedStartDate && d <= appliedEndDate;
    }).length;
  }, [inquiries, timeframe, appliedStartDate, appliedEndDate]);

  /* =========================================================
     STATUS
  ========================================================= */

  const statusData = useMemo(() => {
    const statuses = [
      "New",
      "Interested",
      "Callback",
      "Not Interested",
      "Joined",
      "DND",
      "Ringing/Waiting",
    ];

    return statuses.map((status) => ({
      status,
      count: inquiries.filter((item) => (item.status || "New") === status)
        .length,
    }));
  }, [inquiries]);

  const graphTitle = {
    day: "Today",
    week: "Last 7 Days",
    month: "Last 30 Days",
    year: "Last 12 Months",
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

  /* =========================================================
     TIMEFRAME GRAPH
  ========================================================= */

  const tfTrendData = useMemo(() => {
    return [
      {
        date: "today",
        day: "Today",
        count: buildTrendSeries(inquiries, "day")[0]?.count || 0,
      },
      {
        date: "7-days",
        day: "7 Days",
        count: buildTrendSeries(inquiries, "week")[0]?.count || 0,
      },
      {
        date: "30-days",
        day: "30 Days",
        count: buildTrendSeries(inquiries, "month")[0]?.count || 0,
      },
      {
        date: "365-days",
        day: "365 Days",
        count: buildTrendSeries(inquiries, "year")[0]?.count || 0,
      },
      { date: "total", day: "Total", count: inquiries.length },
    ];
  }, [inquiries]);

  const tfMax = Math.max(...tfTrendData.map((item) => item.count), 1);

  return (
    <div className="inquiry-dashboard">
      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="inquiry-summary">
        {summaryCards.map((card) => (
          <div key={card.label} className={`inq-card ${card.color}`}>
            <div className="inq-card-content">
              <span>{card.label}</span>

              <div className="card-two-row">
                <small>Inquiries</small>
                <strong>{card.count}</strong>
              </div>

              <div className="card-two-row">
                <small>Joined</small>
                <strong>{card.joined}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* =====================================================
          MAIN INQUIRY TREND
      ===================================================== */}

      <div className="inquiry-analytics">
        <div className="analytics-card trend-card">
          <div className="analytics-header">
            <div>
              <h2>Inquiry Trend</h2>

              <p>Inquiry activity — {graphTitle[timeframe]}</p>

              {timeframe === "custom" && selectedRangeTotal !== null && (
                <strong className="selected-range-total">
                  {selectedRangeTotal} inquiries
                </strong>
              )}
            </div>

            <div className="timeframe-selector">
              <button
                className={timeframe === "day" ? "active" : ""}
                onClick={() => changeTimeframe("day")}
              >
                Day
              </button>

              <button
                className={timeframe === "week" ? "active" : ""}
                onClick={() => changeTimeframe("week")}
              >
                Week
              </button>

              <button
                className={timeframe === "month" ? "active" : ""}
                onClick={() => changeTimeframe("month")}
              >
                Month
              </button>

              <button
                className={timeframe === "year" ? "active" : ""}
                onClick={() => changeTimeframe("year")}
              >
                Year
              </button>

              <button
                className={timeframe === "custom" ? "active" : ""}
                onClick={() => changeTimeframe("custom")}
              >
                Custom
              </button>
            </div>
          </div>

          {/* CUSTOM DATE */}

          {timeframe === "custom" && (
            <div className="custom-date-panel">
              <div className="date-field">
                <label>Start Date</label>

                <div className="date-input-wrap">
                  <FaCalendarCheck />

                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="date-field">
                <label>End Date</label>

                <div className="date-input-wrap">
                  <FaCalendarCheck />

                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <button className="apply-date-btn" onClick={applyCustomRange}>
                Apply
              </button>
            </div>
          )}

          {/* MAIN TREND CHART */}

          <div
            className={`trend-chart ${
              timeframe === "day" ? "main-day-chart" : ""
            }`}
          >
            {timeframe === "custom" && trendData.length === 0 ? (
              <div className="empty-chart">
                <FaCalendarCheck />

                <span>Select start and end date to view inquiry trend</span>
              </div>
            ) : (
              <>
                <div className="trend-y-axis">
                  <span>{maxTrend}</span>

                  <span>{Math.ceil(maxTrend * 0.75)}</span>

                  <span>{Math.ceil(maxTrend * 0.5)}</span>

                  <span>{Math.ceil(maxTrend * 0.25)}</span>

                  <span>0</span>
                </div>

                <div className="trend-area">
                  <div className="trend-grid">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>

                  <div className={`trend-bars trend-${timeframe}`}>
                    {trendData.map((item) => {
                      const h =
                        item.count === 0
                          ? 3
                          : Math.max((item.count / maxTrend) * 100, 8);

                      return (
                        <div className="trend-column" key={item.date}>
                          <div className="trend-count">{item.count}</div>

                          <div className="trend-bar-wrap">
                            <div
                              className="trend-bar"
                              style={{
                                height: `${h}%`,
                              }}
                            />
                          </div>

                          <span className="trend-day">{item.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="inquiry-lower">
        {/* ================= TIMEFRAME GRAPH ================= */}

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
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="trend-bars tf-summary-bars">
                {tfTrendData.map((item) => {
                  const h =
                    item.count === 0
                      ? 3
                      : Math.max((item.count / tfMax) * 100, 8);

                  return (
                    <div className="trend-column" key={item.date}>
                      <div className="trend-count">{item.count}</div>

                      <div className="trend-bar-wrap">
                        <div
                          className="trend-bar"
                          style={{
                            height: `${h}%`,
                          }}
                        />
                      </div>

                      <span className="trend-day">{item.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ================= INQUIRY STATUS ================= */}

        <div className="analytics-card status-card">
          <div className="analytics-header">
            <div>
              <h2>Inquiry Status</h2>

              <p>Current inquiry distribution</p>
            </div>
          </div>

          <div className="status-list">
            {statusData.map((item) => {
              const pct = totalCount
                ? Math.round((item.count / totalCount) * 100)
                : 0;

              return (
                <div className="status-row" key={item.status}>
                  <div className="status-info">
                    <span>{item.status}</span>

                    <strong>{item.count}</strong>
                  </div>

                  <div className="status-progress">
                    <div
                      className="status-progress-fill"
                      style={{
                        width: `${pct}%`,
                      }}
                    />
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
