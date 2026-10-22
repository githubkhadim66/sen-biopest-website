'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import type { Note } from '@/lib/admin';

interface NotesPanelProps {
  notes: Note[];
  onAdd: (content: string) => Promise<void>;
}

/** Internal follow-up notes on a request, with its own input state per request */
export function NotesPanel({ notes, onAdd }: NotesPanelProps) {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    const content = text.trim();
    if (!content || saving) return;
    setSaving(true);
    try {
      await onAdd(content);
      setText('');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Notes internes ({notes.length})</p>
      {notes.length > 0 && (
        <div className="space-y-2 mb-3">
          {notes.map((note) => (
            <div key={note.id} className="bg-white border border-gray-200 rounded p-2 text-sm">
              <p className="whitespace-pre-wrap">{note.content}</p>
              <p className="text-xs text-gray-400 mt-1">
                {note.author.firstName} {note.author.lastName} · {formatDate(note.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Ajouter une note..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <Button size="sm" onClick={submit} loading={saving} disabled={!text.trim()} aria-label="Ajouter la note">
          <MessageSquare className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
