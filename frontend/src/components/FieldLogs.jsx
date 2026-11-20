import React, { useState } from 'react';
import { Disc3, Plus, Radio, Send, Skull } from 'lucide-react';
import { submitFieldSighting } from '../services/api';

export function FieldLogs({ sightings, hotspots, equipment, onSightingCreated }) {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    hunterName: '',
    bandOrCoven: '',
    location: hotspots[0]?.name || "St. Tysilio's Church (Church Island)",
    gearUsed: equipment[0]?.name || 'K-II "DOOMSPIKE" EMF METER',
    peakEmf: '34.6',
    soundtrack: '',
    report: '',
  });
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.hunterName.trim().length < 2 || form.report.trim().length < 10) {
      setError('Enter your hunter alias and at least 10 characters describing the encounter.');
      return;
    }
    setSubmitting(true);
    try {
      const created = await submitFieldSighting({
        ...form,
        peakEmf: Number(form.peakEmf) || 12.0,
      });
      onSightingCreated(created);
      setForm({
        ...form,
        hunterName: '',
        bandOrCoven: '',
        soundtrack: '',
        report: '',
      });
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Could not log sighting.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="field-logs" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-brass">
            // VERIFIED ANGLESEY ENCOUNTERS
          </p>
          <h2 className="mt-2 font-gothic text-3xl text-bone sm:text-4xl">
            METALHEAD HAUNTING FIELD LOGS
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-crimson/60 bg-crimson/15 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-crimson transition hover:bg-crimson hover:text-white md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>{showForm ? 'Close Log Form' : 'Log a Sighting'}</span>
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="forge-card mt-8 rounded-xl border-crimson/40 p-6"
        >
          <h3 className="font-display text-lg font-bold text-bone">
            SUBMIT LLANFAIRPWLLGWWYNGYLL FIELD REPORT
          </h3>
          {error && (
            <p className="mt-3 rounded border border-crimson/50 bg-crimson/10 px-3 py-2 font-mono text-xs text-crimson">
              {error}
            </p>
          )}
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block">
              <span className="font-mono text-[11px] uppercase text-bone/60">Hunter Name / Alias *</span>
              <input
                type="text"
                required
                value={form.hunterName}
                onChange={(e) => setForm({ ...form, hunterName: e.target.value })}
                placeholder="e.g. Dafydd 'Riffreaper' Jones"
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-sm text-bone focus:border-crimson focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="font-mono text-[11px] uppercase text-bone/60">Band / Coven</span>
              <input
                type="text"
                value={form.bandOrCoven}
                onChange={(e) => setForm({ ...form, bandOrCoven: e.target.value })}
                placeholder="e.g. Menai Doom Cult"
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-sm text-bone focus:border-crimson focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="font-mono text-[11px] uppercase text-bone/60">Peak EMF (mG)</span>
              <input
                type="number"
                step="0.1"
                min="0"
                max="999"
                value={form.peakEmf}
                onChange={(e) => setForm({ ...form, peakEmf: e.target.value })}
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2 font-mono text-sm text-crimson focus:border-crimson focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="font-mono text-[11px] uppercase text-bone/60">Haunted Location</span>
              <select
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="mt-1 w-full rounded-lg border border-white/15 bg-[#0c0d12] px-3 py-2 text-sm text-bone focus:border-crimson focus:outline-none"
              >
                {hotspots.map((h) => (
                  <option key={h.id} value={h.name}>
                    {h.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="font-mono text-[11px] uppercase text-bone/60">Gear Used</span>
              <select
                value={form.gearUsed}
                onChange={(e) => setForm({ ...form, gearUsed: e.target.value })}
                className="mt-1 w-full rounded-lg border border-white/15 bg-[#0c0d12] px-3 py-2 text-sm text-bone focus:border-crimson focus:outline-none"
              >
                {equipment.map((eq) => (
                  <option key={eq.slug} value={eq.name}>
                    {eq.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="font-mono text-[11px] uppercase text-bone/60">Hunt Soundtrack</span>
              <input
                type="text"
                value={form.soundtrack}
                onChange={(e) => setForm({ ...form, soundtrack: e.target.value })}
                placeholder="e.g. Sleep — Dopesmoker"
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-sm text-bone focus:border-crimson focus:outline-none"
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="font-mono text-[11px] uppercase text-bone/60">Encounter Report *</span>
            <textarea
              required
              rows={3}
              value={form.report}
              onChange={(e) => setForm({ ...form, report: e.target.value })}
              placeholder="Describe the cold spots, EVP voices, or shadow figures you captured..."
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-sm text-bone focus:border-crimson focus:outline-none"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-crimson px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#ff4260] disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{submitting ? 'Archiving to Forge...' : 'Publish Field Report'}</span>
          </button>
        </form>
      )}

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {sightings.map((log) => (
          <article key={log.id} className="forge-card flex flex-col justify-between rounded-xl p-6">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded bg-crimson/15 px-2.5 py-1 font-mono text-xs font-bold text-crimson">
                  <Radio className="h-3.5 w-3.5" />
                  PEAK {log.peakEmf} mG
                </span>
                <Skull className="h-4 w-4 text-bone/35" />
              </div>

              <h3 className="mt-4 font-display text-base font-bold text-bone">{log.location}</h3>
              <p className="mt-1 font-mono text-[11px] text-ecto">{log.gearUsed}</p>

              <p className="mt-3 text-sm leading-relaxed text-bone/80">“{log.report}”</p>
            </div>

            <div className="mt-5 border-t border-white/10 pt-3">
              <div className="font-mono text-xs font-semibold text-bone">{log.hunterName}</div>
              <div className="font-mono text-[11px] text-brass">{log.bandOrCoven}</div>
              {log.soundtrack && (
                <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[10px] text-bone/50">
                  <Disc3 className="h-3 w-3 text-crimson" />
                  <span className="truncate">{log.soundtrack}</span>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
