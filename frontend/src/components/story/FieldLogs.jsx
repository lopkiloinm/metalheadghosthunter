import React, { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { Reveal } from '../ui/Reveal';
import { Button } from '../ui/Button';
import { FieldLogForm } from './FieldLogForm';
import { FieldLogCard } from './FieldLogCard';

export function FieldLogs({ sightings, hotspots, equipment, pin, onRequestMapPin, onSightingCreated }) {
  const [showForm, setShowForm] = useState(false);
  const [freshId, setFreshId] = useState(null);

  useEffect(() => {
    if (pin) setShowForm(true);
  }, [pin]);

  function handleCreated(sighting) {
    setFreshId(sighting.id);
    setShowForm(false);
    onSightingCreated(sighting);
  }

  return (
    <section id="field-logs" data-testid="field-logs-section" className="shell scroll-mt-24 py-24 lg:py-32">
      <SectionHeader
        chapter="VI"
        overline="Field Logs"
        title="What the hunters heard"
        aside={
          <Button variant={showForm ? 'secondary' : 'primary'} data-testid="field-log-toggle-button" aria-expanded={showForm} onClick={() => setShowForm((s) => !s)}>
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? 'Close form' : 'Log a sighting'}
          </Button>
        }
      >
        <p>Verified encounters from renters across Anglesey. Back from a raid? Add yours to the top of the ledger.</p>
      </SectionHeader>

      {showForm && <FieldLogForm hotspots={hotspots} equipment={equipment} pin={pin} onRequestMapPin={onRequestMapPin} onCreated={handleCreated} />}

      <div data-testid="field-log-list" className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {sightings.map((log, i) => (
          <Reveal key={log.id} delay={(i % 3) * 100}>
            <FieldLogCard log={log} fresh={log.id === freshId} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
