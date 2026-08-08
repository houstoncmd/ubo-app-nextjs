"use client";

export default function Footer() {
  return (
    <footer className="lhb-footer-enterprise">
      <div className="container-fluid px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>
            &copy; 2026 LH Bank. Ultimate Beneficial Ownership Analysis System v1.0
          </span>
          <span className="flex items-center gap-2">
            <i className="bi bi-pencil-ruler" />
            Designed by Digital and Automation Department
            <span className="mx-1">|</span>
            <span className="status-dot online" />
            All Systems Operational
          </span>
        </div>
      </div>
    </footer>
  );
}
