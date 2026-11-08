"use client";

import { useState, useMemo } from "react";
import { updateManualTimeAction, saveVisualServersAction } from "@/app/actions/admin";
import { ChevronLeft, ChevronRight, Plus, Trash2, X, Server } from "lucide-react";
import Link from "next/link";

const JAKARTA = "Asia/Jakarta";

function jakartaDateKey(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: JAKARTA, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date(date));
  const get = (t) => parts.find((p) => p.type === t).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function addDays(key, n) {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function mondayOf(key) {
  const day = new Date(`${key}T00:00:00Z`).getUTCDay();
  return addDays(key, day === 0 ? -6 : 1 - day);
}

function fmtDay(key, withYear = false) {
  return new Date(`${key}T00:00:00Z`).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", timeZone: "UTC", ...(withYear ? { year: "numeric" } : {}),
  });
}

// Server bawaan MoxieRP (terhubung dengan riwayat & jam DB)
const MOXIE_SERVER = {
  id: "moxie",
  name: "MoxieRP",
  subtitle: "Data akumulasi jam absensi dari database",
  isDb: true,
  createdAt: 0, // Paling lama, otomatis di posisi terakhir
};

// Default server visual (7GloryRP dibuatkan di awal mulai dari 0)
const DEFAULT_VISUAL_SERVERS = [
  {
    id: "7glory",
    name: "7GloryRP",
    subtitle: "Mulai dari 0 jam (Visual)",
    createdAt: 1000, // Di depan MoxieRP
    manualHours: {},
  },
];

export default function HoursTableClient({
  officers = [],
  attendance = [],
  isAdmin = false,
  initialVisualServers = null,
}) {
  const [serverFilter, setServerFilter] = useState("all"); // "all" atau server.id
  const [weekStart, setWeekStart] = useState(() => mondayOf(jakartaDateKey(new Date())));

  // List server visual
  const [visualServers, setVisualServers] = useState(() => {
    if (initialVisualServers) {
      try {
        const parsed = typeof initialVisualServers === "string"
          ? JSON.parse(initialVisualServers)
          : initialVisualServers;
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Gagal parse initialVisualServers", e);
      }
    }
    return DEFAULT_VISUAL_SERVERS;
  });

  // Modal Tambah Server Visual
  const [showAddModal, setShowAddModal] = useState(false);
  const [newServerName, setNewServerName] = useState("");
  const [newServerSubtitle, setNewServerSubtitle] = useState("");
  const [isSavingServer, setIsSavingServer] = useState(false);

  // State Edit Waktu MoxieRP (Database)
  const [editingId, setEditingId] = useState(null);
  const [operation, setOperation] = useState("add"); // "add" | "sub"
  const [inputHours, setInputHours] = useState("");
  const [inputMinutes, setInputMinutes] = useState("");
  const [loadingDb, setLoadingDb] = useState(false);

  // State Edit Waktu Server Visual
  const [editingVisual, setEditingVisual] = useState(null); // { serverId, officerId } | null
  const [visualOp, setVisualOp] = useState("add");
  const [visualHours, setVisualHours] = useState("");
  const [visualMinutes, setVisualMinutes] = useState("");
  const [nowMs] = useState(() => Date.now());

  const weekEnd = addDays(weekStart, 6);

  // Helper untuk mendapatkan durasi menit (baik yang sudah checkout maupun yang sedang berjalan aktif)
  const getRecordMinutes = (r) => {
    if (r.duration_minutes !== null && r.duration_minutes !== undefined) {
      return Math.max(1, Math.round(Number(r.duration_minutes)));
    }
    // Jika sedang bertugas aktif (belum check-out), hitung durasi berjalan (minimal 1 menit)
    if (r.checked_in_at && !r.checked_out_at) {
      const elapsed = (nowMs - new Date(r.checked_in_at).getTime()) / 60000;
      return Math.max(1, Math.round(elapsed));
    }
    return 0;
  };

  // Helper untuk mencocokkan record absensi dengan server
  const isRecordForServer = (r, server) => {
    const note = r.note || "";
    const match = note.match(/^\[(.*?)\]/);
    const tag = match ? match[1].toLowerCase().trim() : null;

    if (server.isDb) {
      // MoxieRP: cocok jika tag 'moxierp' / 'moxie' atau tanpa tag server (record lama)
      return !tag || tag === "moxierp" || tag === "moxie";
    }
    // Server Visual: cocok jika tag sesuai nama server atau id
    if (!tag) return false;
    const sName = (server.name || "").toLowerCase().trim();
    const sId = (server.id || "").toLowerCase().trim();
    return tag === sName || tag === sId || sName.includes(tag) || tag.includes(sName);
  };

  // Hitung jam mingguan per personil per server
  const getWeeklyByOfficerForServer = (server) => {
    return attendance.reduce((acc, r) => {
      const k = jakartaDateKey(r.checked_in_at);
      if (k >= weekStart && k <= weekEnd && isRecordForServer(r, server)) {
        acc[r.officer_id] = (acc[r.officer_id] || 0) + getRecordMinutes(r);
      }
      return acc;
    }, {});
  };

  // Hitung akumulasi total jam sistem per personil per server
  const getTotalSystemForServer = (server, officerId, dbTotalMinutes) => {
    if (server.isDb) {
      return dbTotalMinutes;
    }
    return attendance.reduce((acc, r) => {
      if (String(r.officer_id) === String(officerId) && isRecordForServer(r, server)) {
        acc += getRecordMinutes(r);
      }
      return acc;
    }, 0);
  };

  const formatMins = (mins, isFull = false) => {
    const isNeg = mins < 0;
    const absMins = Math.abs(mins);
    const h = Math.floor(absMins / 60);
    const m = absMins % 60;
    if (isFull) {
      return `${isNeg ? "-" : ""}${h} Jam ${m} Menit`;
    }
    return `${isNeg ? "-" : ""}${h}j ${m}m`;
  };

  // Urutan: yang terbaru terlebih dahulu di paling ujung (depan), 7GloryRP paling depan dari MoxieRP
  const allServers = useMemo(() => {
    const combined = [...visualServers, MOXIE_SERVER];
    return combined.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [visualServers]);

  // Tambah Server Visual Baru oleh Admin
  const handleCreateServer = async (e) => {
    e.preventDefault();
    const trimmed = newServerName.trim();
    if (!trimmed) return;

    setIsSavingServer(true);
    const newServer = {
      id: "visual-" + Date.now(),
      name: trimmed,
      subtitle: newServerSubtitle.trim() || "Mulai dari 0 jam (Visual)",
      createdAt: Date.now(), // Timestamp terbaru agar langsung paling depan
      manualHours: {},
    };

    const updated = [newServer, ...visualServers];
    setVisualServers(updated);
    setNewServerName("");
    setNewServerSubtitle("");
    setShowAddModal(false);

    if (typeof window !== "undefined") {
      localStorage.setItem("cop_s_visual_servers", JSON.stringify(updated));
    }
    await saveVisualServersAction(JSON.stringify(updated)).catch(console.error);
    setIsSavingServer(false);
  };

  // Hapus Server Visual oleh Admin
  const handleDeleteServer = async (id, name) => {
    if (!confirm(`Hapus card visual server "${name}"? Data visual jam server ini akan dihapus.`)) {
      return;
    }
    const updated = visualServers.filter((s) => s.id !== id);
    setVisualServers(updated);
    if (serverFilter === id) {
      setServerFilter("all");
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("cop_s_visual_servers", JSON.stringify(updated));
    }
    await saveVisualServersAction(JSON.stringify(updated)).catch(console.error);
  };

  // Simpan jam visual (hanya di visual, tidak merubah DB)
  const handleSaveVisualTime = async (serverId, officerId) => {
    let delta = (parseInt(visualHours || 0, 10) * 60) + parseInt(visualMinutes || 0, 10);
    if (visualOp === "sub") delta = -delta;

    const target = visualServers.find((s) => s.id === serverId);
    const current = target?.manualHours?.[officerId] || 0;
    let newTotal = current + delta;
    if (newTotal < 0) newTotal = 0;

    const updated = visualServers.map((s) => {
      if (s.id === serverId) {
        return {
          ...s,
          manualHours: {
            ...(s.manualHours || {}),
            [officerId]: newTotal,
          },
        };
      }
      return s;
    });

    setVisualServers(updated);
    setEditingVisual(null);

    if (typeof window !== "undefined") {
      localStorage.setItem("cop_s_visual_servers", JSON.stringify(updated));
    }
    await saveVisualServersAction(JSON.stringify(updated)).catch(console.error);
  };

  // Simpan jam MoxieRP (ke database)
  const handleSaveDb = async (id, currentManualMinutes, systemMinutes) => {
    setLoadingDb(true);
    let delta = (parseInt(inputHours || 0, 10) * 60) + parseInt(inputMinutes || 0, 10);
    if (operation === "sub") delta = -delta;

    let newTotal = currentManualMinutes + delta;
    if (systemMinutes + newTotal < 0) {
      newTotal = -systemMinutes;
    }

    const isNeg = newTotal < 0;
    const absTotal = Math.abs(newTotal);
    const newH = (isNeg ? -1 : 1) * Math.floor(absTotal / 60);
    const newM = (isNeg ? -1 : 1) * (absTotal % 60);

    const res = await updateManualTimeAction(id, newH, newM);
    setLoadingDb(false);
    if (res?.error) {
      alert(res.error);
    } else {
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bar Navigasi Server & Tombol Tambah */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Server:</span>
          <div className="inline-flex flex-wrap rounded-lg bg-black/40 p-1 border border-line gap-1">
            {allServers.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setServerFilter(s.id)}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition-colors ${
                  serverFilter === s.id
                    ? "bg-crimson-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {s.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setServerFilter("all")}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition-colors ${
                serverFilter === "all"
                  ? "bg-crimson-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Semua Server
            </button>
          </div>
        </div>

        {/* Tombol Tambah Server untuk Admin */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary btn-sm flex items-center gap-1.5 font-mono text-xs"
          >
            <Plus className="size-4" /> Tambah Server Visual
          </button>
        )}
      </div>

      {/* Modal Tambah Server Visual */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-md border border-line bg-night p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-line">
              <h3 className="font-rajdhani text-lg font-bold text-white flex items-center gap-2">
                <Server className="size-5 text-crimson-400" /> Tambah Server Visual Baru
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setNewServerName("");
                  setNewServerSubtitle("");
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateServer} className="space-y-4 pt-4">
              <div>
                <label className="label">
                  Nama Server <span className="text-crimson-400">*</span>
                </label>
                <input
                  type="text"
                  className="field"
                  placeholder="Contoh: 7GloryRP, NexaRP, Garuda Prime"
                  value={newServerName}
                  onChange={(e) => setNewServerName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="label">Keterangan / Subtitle (Opsional)</label>
                <input
                  type="text"
                  className="field"
                  placeholder="Mulai dari 0 jam (Visual)"
                  value={newServerSubtitle}
                  onChange={(e) => setNewServerSubtitle(e.target.value)}
                />
              </div>

              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-300 leading-relaxed">
                Server visual ini akan otomatis menampilkan personil mulai dari 0 jam (Sistem: 0, Manual: 0, Total: 0) dan tidak mengubah ataupun mempengaruhi database riwayat absensi.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewServerName("");
                    setNewServerSubtitle("");
                  }}
                  className="btn btn-ghost btn-sm text-slate-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={!newServerName.trim() || isSavingServer}
                >
                  {isSavingServer ? "Menyimpan..." : "Buat Server"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Render Card Server (Urutan terbaru paling depan) */}
      {allServers
        .filter((s) => serverFilter === "all" || serverFilter === s.id)
        .map((server) => {
          // --- KASUS SERVER DATABASE (MoxieRP) ---
          if (server.isDb) {
            return (
              <div key={server.id} className="card p-6 border border-line" id={`total-${server.id}`}>
                <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="font-rajdhani text-xl font-bold text-white">{server.name}</h2>
                      <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-crimson-500/10 border border-crimson-500/20 text-crimson-400">
                        Total Jam Personil
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{server.subtitle}</p>
                  </div>

                  <div className="flex items-center gap-2 bg-white/[0.02] border border-line rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setWeekStart((w) => addDays(w, -7))}
                      className="p-1 hover:text-white text-slate-400 transition-colors"
                      title="Minggu sebelumnya"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <span className="font-mono text-xs text-slate-300 px-1">
                      {fmtDay(weekStart)} - {fmtDay(weekEnd, true)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setWeekStart((w) => addDays(w, 7))}
                      className="p-1 hover:text-white text-slate-400 transition-colors"
                      title="Minggu berikutnya"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                    <div className="h-4 w-px bg-line" />
                    <button
                      type="button"
                      onClick={() => setWeekStart(mondayOf(jakartaDateKey(new Date())))}
                      className="px-1 text-[10px] font-mono uppercase tracking-wider text-crimson-400 hover:text-crimson-300"
                    >
                      Minggu Ini
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-line bg-black/20 text-slate-400">
                        <th className="p-3 font-semibold">Callsign</th>
                        <th className="p-3 font-semibold">Nama</th>
                        <th className="p-3 font-semibold">Jam Absensi (Sistem)</th>
                        <th className="p-3 font-semibold">Jam Manual (Input)</th>
                        <th className="p-3 font-semibold">Total Keseluruhan</th>
                        {isAdmin && <th className="p-3 font-semibold text-right">Aksi</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const weeklyMoxie = getWeeklyByOfficerForServer(server);
                        return officers.map((o) => {
                          const systemMinutes = weeklyMoxie[o.id] || 0;
                          const totalSystemMinutes = getTotalSystemForServer(
                            server,
                            o.id,
                            parseInt(o.attendance_minutes || 0, 10)
                          );
                          const manualMin = parseInt(o.manual_minutes || 0, 10);
                          const totalMins = totalSystemMinutes + manualMin;

                          const systemDisplay = formatMins(systemMinutes);
                          const manDisplay = formatMins(manualMin);
                          const totalDisplay = formatMins(totalMins, true);

                          return (
                            <tr key={o.id} className="border-b border-line/50 hover:bg-white/5">
                              <td className="p-3 font-mono text-crimson-400">{o.callsign}</td>
                              <td className="p-3 text-slate-300">{o.full_name}</td>
                              <td className="p-3 text-slate-400">{systemDisplay}</td>
                              <td className="p-3">
                              {editingId === o.id ? (
                                <div className="flex items-center gap-2">
                                  <select
                                    className="field py-1 px-2 h-11 w-14 bg-black/40 text-center cursor-pointer"
                                    value={operation}
                                    onChange={(e) => setOperation(e.target.value)}
                                    disabled={loadingDb}
                                  >
                                    <option value="add">+</option>
                                    <option value="sub">-</option>
                                  </select>
                                  <input
                                    type="number"
                                    className="field py-1 px-2 h-11 w-16 text-center"
                                    value={inputHours}
                                    onChange={(e) => setInputHours(e.target.value)}
                                    disabled={loadingDb}
                                    placeholder="Jam"
                                  />
                                  <span className="text-slate-500">j</span>
                                  <input
                                    type="number"
                                    className="field py-1 px-2 h-11 w-16 text-center"
                                    value={inputMinutes}
                                    onChange={(e) => setInputMinutes(e.target.value)}
                                    disabled={loadingDb}
                                    placeholder="Menit"
                                  />
                                  <span className="text-slate-500">m</span>
                                </div>
                              ) : (
                                <span className="text-slate-300">{manDisplay}</span>
                              )}
                            </td>
                            <td className="p-3 font-bold text-emerald-400">{totalDisplay}</td>
                            {isAdmin && (
                              <td className="p-3 text-right">
                                {editingId === o.id ? (
                                  <div className="flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setEditingId(null)}
                                      className="btn btn-ghost btn-sm text-slate-400"
                                      disabled={loadingDb}
                                    >
                                      Batal
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveDb(o.id, manualMin, totalSystemMinutes)}
                                      className="btn btn-primary btn-sm"
                                      disabled={loadingDb}
                                    >
                                      {loadingDb ? "..." : "Simpan"}
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex justify-end gap-3 items-center">
                                    <Link
                                      href={`/admin/attendance/${o.id}`}
                                      className="text-xs text-emerald-400 hover:text-emerald-300 underline"
                                    >
                                      Detail Absensi
                                    </Link>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingId(o.id);
                                        setOperation("add");
                                        setInputHours("");
                                        setInputMinutes("");
                                      }}
                                      className="text-xs text-crimson-400 hover:text-crimson-300 underline"
                                    >
                                      Kalkulasi Waktu
                                    </button>
                                  </div>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                  </table>
                </div>
              </div>
            );
          }

          // --- KASUS SERVER VISUAL (7GloryRP & Server Buatan Admin, Mulai dari 0) ---
          return (
            <div key={server.id} className="card p-6 border border-line" id={`total-${server.id}`}>
              <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="font-rajdhani text-xl font-bold text-white">{server.name}</h2>
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      Total Jam Personil
                    </span>
                    {/* Tombol Hapus Server Visual (Hanya untuk Admin) */}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDeleteServer(server.id, server.name)}
                        className="p-1 text-slate-500 hover:text-crimson-400 hover:bg-crimson-500/10 rounded transition-colors"
                        title={`Hapus Server ${server.name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{server.subtitle}</p>
                </div>

                <div className="flex items-center gap-2 bg-white/[0.02] border border-line rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setWeekStart((w) => addDays(w, -7))}
                    className="p-1 hover:text-white text-slate-400 transition-colors"
                    title="Minggu sebelumnya"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <span className="font-mono text-xs text-slate-300 px-1">
                    {fmtDay(weekStart)} - {fmtDay(weekEnd, true)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setWeekStart((w) => addDays(w, 7))}
                    className="p-1 hover:text-white text-slate-400 transition-colors"
                    title="Minggu berikutnya"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                  <div className="h-4 w-px bg-line" />
                  <button
                    type="button"
                    onClick={() => setWeekStart(mondayOf(jakartaDateKey(new Date())))}
                    className="px-1 text-[10px] font-mono uppercase tracking-wider text-crimson-400 hover:text-crimson-300"
                  >
                    Minggu Ini
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-line bg-black/20 text-slate-400">
                      <th className="p-3 font-semibold">Callsign</th>
                      <th className="p-3 font-semibold">Nama</th>
                      <th className="p-3 font-semibold">Jam Absensi (Sistem)</th>
                      <th className="p-3 font-semibold">Jam Manual (Input)</th>
                      <th className="p-3 font-semibold">Total Keseluruhan</th>
                      {isAdmin && <th className="p-3 font-semibold text-right">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const weeklyVisual = getWeeklyByOfficerForServer(server);
                      return officers.map((o) => {
                        const systemMinutes = weeklyVisual[o.id] || 0;
                        const visualManualMins = server.manualHours?.[o.id] || 0;
                        const totalMins = getTotalSystemForServer(server, o.id, 0) + visualManualMins;

                        const isRowEditing =
                          editingVisual?.serverId === server.id &&
                          editingVisual?.officerId === o.id;

                        const systemDisplay = formatMins(systemMinutes);
                        const manualDisplay = formatMins(visualManualMins);
                        const totalDisplay = formatMins(totalMins, true);

                        return (
                          <tr key={o.id} className="border-b border-line/50 hover:bg-white/5">
                            <td className="p-3 font-mono text-crimson-400">{o.callsign}</td>
                            <td className="p-3 text-slate-300">{o.full_name}</td>
                            <td className="p-3 text-slate-400">{systemDisplay}</td>
                            <td className="p-3">
                            {isRowEditing ? (
                              <div className="flex items-center gap-2">
                                <select
                                  className="field py-1 px-2 h-11 w-14 bg-black/40 text-center cursor-pointer"
                                  value={visualOp}
                                  onChange={(e) => setVisualOp(e.target.value)}
                                >
                                  <option value="add">+</option>
                                  <option value="sub">-</option>
                                </select>
                                <input
                                  type="number"
                                  className="field py-1 px-2 h-11 w-16 text-center"
                                  value={visualHours}
                                  onChange={(e) => setVisualHours(e.target.value)}
                                  placeholder="Jam"
                                />
                                <span className="text-slate-500">j</span>
                                <input
                                  type="number"
                                  className="field py-1 px-2 h-11 w-16 text-center"
                                  value={visualMinutes}
                                  onChange={(e) => setVisualMinutes(e.target.value)}
                                  placeholder="Menit"
                                />
                                <span className="text-slate-500">m</span>
                              </div>
                            ) : (
                              <span className="text-slate-300">{manualDisplay}</span>
                            )}
                          </td>
                          <td className="p-3 font-bold text-emerald-400">{totalDisplay}</td>
                          {isAdmin && (
                            <td className="p-3 text-right">
                              {isRowEditing ? (
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditingVisual(null)}
                                    className="btn btn-ghost btn-sm text-slate-400"
                                  >
                                    Batal
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveVisualTime(server.id, o.id)}
                                    className="btn btn-primary btn-sm"
                                  >
                                    Simpan
                                  </button>
                                </div>
                              ) : (
                                <div className="flex justify-end gap-3 items-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingVisual({ serverId: server.id, officerId: o.id });
                                      setVisualOp("add");
                                      setVisualHours("");
                                      setVisualMinutes("");
                                    }}
                                    className="text-xs text-crimson-400 hover:text-crimson-300 underline"
                                  >
                                    Kalkulasi Waktu
                                  </button>
                                </div>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    });
                  })()}
                </tbody>
                </table>
              </div>
            </div>
          );
        })}
    </div>
  );
}
