"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";

export default function SearchPage() {
  const router = useRouter();
  const [registrationId, setRegistrationId] = useState("");
  const [language, setLanguage] = useState("en");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationId.trim()) return;

    setIsSearching(true);
    // TODO: Connect to API backend
    setTimeout(() => {
      setIsSearching(false);
      router.push(`/result/${registrationId}`);
    }, 2000);
  };

  const howItWorks = [
    {
      step: 1,
      icon: "bi-keyboard",
      title: "Enter Registration ID",
      description: "Input the company registration number (13 digits)",
    },
    {
      step: 2,
      icon: "bi-search",
      title: "System Searches",
      description: "Our system queries DBD and cross-references ownership data",
    },
    {
      step: 3,
      icon: "bi-diagram-3",
      title: "Analysis Complete",
      description: "View ownership structure, shareholders, and UBO identification",
    },
  ];

  return (
    <div className="min-h-screen bg-lhb-bg">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Search"
          subtitle="Find company and beneficial ownership information"
          breadcrumbs={[{ label: "Search" }]}
        />

        {/* Hero Search Section */}
        <div className="lhb-card mb-8">
          <div className="lhb-card-body">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="max-w-2xl mx-auto">
                <label className="lhb-label text-center text-lg">
                  Company Registration ID
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <i className="bi bi-building"></i>
                  </span>
                  <input
                    type="text"
                    className="lhb-input pl-12 pr-32 py-4 text-lg"
                    placeholder="e.g., 0105546000123"
                    value={registrationId}
                    onChange={(e) => setRegistrationId(e.target.value)}
                    maxLength={13}
                    required
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <select
                      className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="th">Thai</option>
                    </select>
                    <button
                      type="submit"
                      disabled={isSearching || !registrationId.trim()}
                      className="lhb-btn-primary px-6 py-2 flex items-center gap-2"
                    >
                      {isSearching ? (
                        <>
                          <i className="bi bi-arrow-repeat animate-spin"></i>
                          Searching...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-search"></i>
                          Search
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Enter a 13-digit Thai company registration number
                </p>
              </div>

              {isSearching && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-50 rounded-lg">
                    <i className="bi bi-arrow-repeat animate-spin text-blue-600"></i>
                    <span className="text-blue-700 font-medium">
                      Searching for company data...
                    </span>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* How It Works */}
        <div className="lhb-card">
          <div className="lhb-card-header">
            <h3 className="font-semibold text-slate-800">How It Works</h3>
          </div>
          <div className="lhb-card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {howItWorks.map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <i className={`bi ${item.icon} text-2xl text-blue-600`}></i>
                  </div>
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-sm font-bold text-slate-600 mb-3">
                    {item.step}
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-500">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
