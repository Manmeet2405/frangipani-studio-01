"use client";

import React, { useState, useEffect, useRef } from "react";

export const DateRangePicker = ({
  start,
  end,
  onChange,
  required = false,
  showErrors = false,
}) => {
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState("start");
  const [offset, setOffset] = useState(0);
  const containerRef = useRef(null);

  const TODAY = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (iso) => {
    if (!iso) return null;
    const [y, m, d] = iso.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const toIso = (d) => {
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
  };

  const handlePickDay = (iso) => {
    let nextStart = start;
    let nextEnd = end;

    if (!nextStart || (nextStart && nextEnd)) {
      nextStart = iso;
      nextEnd = null;
      setFocus("end");
    } else if (iso < nextStart) {
      nextStart = iso;
      nextEnd = null;
      setFocus("end");
    } else {
      nextEnd = iso;
      setFocus("start");
      setOpen(false);
    }

    if (onChange) {
      onChange(nextStart, nextEnd);
    }
  };

  // Calendar month calculation
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const year = base.getFullYear();
  const month = base.getMonth();
  const leadDays = (base.getDay() + 6) % 7; // Monday start
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < leadDays; i++) {
    days.push({ label: "", isBlank: true });
  }

  for (let n = 1; n <= daysInMonth; n++) {
    const iso = toIso(new Date(year, month, n));
    const isPast = iso < TODAY;
    const isEdge = iso === start || iso === end;
    const isInRange = start && end && iso > start && iso < end;
    const isToday = iso === TODAY;

    let cls = "day";
    if (isPast) cls += " is-past";
    if (isEdge) cls += " is-edge";
    if (isInRange) cls += " is-range";
    if (isToday) cls += " is-today";

    days.push({
      label: String(n),
      iso,
      cls,
      isPast,
      isEdge,
      isInRange,
      disabled: isPast,
    });
  }

  const nDays =
    start && end
      ? Math.round((new Date(end) - new Date(start)) / 86400000) + 1
      : 0;

  const startErr = showErrors && !start;
  const endErr = showErrors && !end;

  return (
    <div className="dr" ref={containerRef} style={{ fontFamily: "var(--sans)", color: "#050505", width: "100%" }}>
      <div className="dr-fields">
        <div className={`field ${startErr ? "is-invalid" : ""}`}>
          <span className="label" id="dr-start-l">
            Start date{required ? " *" : ""}
          </span>
          <button
            type="button"
            className={`datefield ${open && focus === "start" ? "is-open" : ""}`}
            aria-labelledby="dr-start-l"
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => {
              setOpen(true);
              setFocus("start");
            }}
          >
            <span className={start ? "" : "ph"}>{formatDate(start) || "Pick date"}</span>
            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3.5" y="5" width="17" height="15.5" rx="1.5"></rect>
              <path d="M3.5 10h17M8 3v4M16 3v4"></path>
            </svg>
          </button>
          {startErr && (
            <p className="field-error">
              <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 4 2.8 19.5h18.4Z"></path>
                <path d="M12 10v4M12 17v.01"></path>
              </svg>
              Choose a start date.
            </p>
          )}
        </div>

        <div className={`field ${endErr ? "is-invalid" : ""}`}>
          <span className="label" id="dr-end-l">
            End date{required ? " *" : ""}
          </span>
          <button
            type="button"
            className={`datefield ${open && focus === "end" ? "is-open" : ""}`}
            aria-labelledby="dr-end-l"
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => {
              setOpen(true);
              setFocus(start ? "end" : "start");
            }}
          >
            <span className={end ? "" : "ph"}>{formatDate(end) || "Pick date"}</span>
            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3.5" y="5" width="17" height="15.5" rx="1.5"></rect>
              <path d="M3.5 10h17M8 3v4M16 3v4"></path>
            </svg>
          </button>
          {endErr && (
            <p className="field-error">
              <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 4 2.8 19.5h18.4Z"></path>
                <path d="M12 10v4M12 17v.01"></path>
              </svg>
              Choose an end date.
            </p>
          )}
        </div>
      </div>

      {open && (
        <div className="cal" role="dialog" aria-label="Choose rental dates">
          <div className="cal-head">
            <button
              type="button"
              className="icon-btn"
              aria-label="Previous month"
              disabled={offset <= 0}
              onClick={() => setOffset((o) => Math.max(0, o - 1))}
            >
              <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m15 6-6 6 6 6"></path>
              </svg>
            </button>
            <p className="cal-month" aria-live="polite">
              {base.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
            </p>
            <button
              type="button"
              className="icon-btn"
              aria-label="Next month"
              onClick={() => setOffset((o) => o + 1)}
            >
              <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m9 6 6 6-6 6"></path>
              </svg>
            </button>
          </div>

          <div className="cal-grid">
            <span className="cal-dow">Mo</span>
            <span className="cal-dow">Tu</span>
            <span className="cal-dow">We</span>
            <span className="cal-dow">Th</span>
            <span className="cal-dow">Fr</span>
            <span className="cal-dow">Sa</span>
            <span className="cal-dow">Su</span>

            {days.map((d, index) => {
              if (d.isBlank) {
                return <span key={`blank-${index}`} className="day is-blank" aria-hidden="true" />;
              }
              return (
                <button
                  key={d.iso}
                  type="button"
                  className={d.cls}
                  aria-label={formatDate(d.iso) + (d.isPast ? ", unavailable" : "")}
                  aria-pressed={d.isEdge}
                  disabled={d.disabled}
                  onClick={() => handlePickDay(d.iso)}
                >
                  {d.label}
                </button>
              );
            })}
          </div>

          <div className="cal-foot">
            <p className="small">
              {!start
                ? "Select a start date"
                : !end
                ? "Now select an end date"
                : `${nDays} ${nDays === 1 ? "day" : "days"} selected`}
            </p>
            <button
              type="button"
              className="tlink"
              onClick={() => {
                if (onChange) onChange(null, null);
                setFocus("start");
              }}
            >
              <span>Clear</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setOpen(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
