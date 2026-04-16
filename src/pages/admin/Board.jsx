import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Zap, Gavel, Home, Microscope, Plus } from 'lucide-react';

const boardMembers = [
  {
    id: 'base44',
    name: 'Base44 AI',
    role: 'Chief Product & Development Officer',
    app: 'Base44 Platform',
    expertise: ['Architecture', 'Development', 'Platform Design'],
    icon: Zap,
    color: 'bg-blue-500',
    status: 'active'
  },
  {
    id: 'casenarrative',
    name: 'CaseNarrative',
    role: 'Legal Analysis & Case Strategy Officer',
    app: 'CaseNarrative',
    expertise: ['Legal Strategy', 'Evidence', 'Compliance'],
    icon: Gavel,
    color: 'bg-amber-600',
    status: 'active'
  },
  {
    id: 'synergyflow',
    name: 'SynergyFlow',
    role: 'Chief Commercial & Revenue Officer',
    app: 'SynergyFlow Hub',
    expertise: ['Pricing', 'Sales', 'Growth'],
    icon: AlertCircle,
    color: 'bg-green-600',
    status: 'active'
  },
  {
    id: 'propertypro',
    name: 'PropertyPro',
    role: 'Head of Property Operations',
    app: 'PropertyPro',
    expertise: ['Operations', 'Workflows', 'Compliance'],
    icon: Home,
    color: 'bg-slate-600',
    status: 'inactive'
  },
  {
    id: 'zooscience',
    name: 'ZooScience',
    role: 'Head of Scientific Research',
    app: 'ZooScience',
    expertise: ['Research', 'Data Integrity', 'Science'],
    icon: Microscope,
    color: 'bg-purple-600',
    status: 'inactive'
  }
];

// Positions around a table (in degrees and distance from center)
const getPosition = (index, total) => {
  const angle = (index / total) * 360;
  const radius = 200;
  const x = Math.cos((angle - 90) * (Math.PI / 180)) * radius;
  const y = Math.sin((angle - 90) * (Math.PI / 180)) * radius;
  return { x, y, angle };
};

export default function Board() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewMeeting, setShowNewMeeting] = useState(false);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await base44.functions.invoke('boardMeetingOrchestrator', {
          action: 'list'
        });
        setMeetings(response.data?.meetings || []);
      } catch (err) {
        console.log('No meetings yet');
        setMeetings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  const activeBoardMembers = boardMembers.filter(m => m.status === 'active');
  const inactiveBoardMembers = boardMembers.filter(m => m.status === 'inactive');

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Boardroom</h1>
          <p className="text-muted-foreground">Synergy Software Board & Head Office</p>
        </div>
        <Button onClick={() => setShowNewMeeting(!showNewMeeting)} className="gap-2">
          <Plus className="w-4 h-4" /> Call Meeting
        </Button>
      </div>

      {/* New Meeting Form */}
      {showNewMeeting && <NewMeetingForm onClose={() => setShowNewMeeting(false)} />}

      {/* Board Room - Circular Table */}
      <Card>
        <CardHeader>
          <CardTitle>Board Members at the Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            {/* Table visualization */}
            <div className="relative w-full h-[500px] flex items-center justify-center">
              {/* Table oval */}
              <div className="absolute w-96 h-64 border-4 border-slate-300 rounded-full"></div>

              {/* Board members positioned around table */}
              {activeBoardMembers.map((member, index) => {
                const pos = getPosition(index, activeBoardMembers.length);
                const Icon = member.icon;
                return (
                  <div
                    key={member.id}
                    className="absolute flex flex-col items-center"
                    style={{
                      transform: `translate(${pos.x}px, ${pos.y}px)`,
                    }}
                  >
                    {/* Avatar circle */}
                    <div className={`${member.color} rounded-full w-16 h-16 flex items-center justify-center text-white mb-2 shadow-lg border-4 border-white`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    {/* Name badge */}
                    <div className="bg-white rounded-lg shadow-md p-2 text-center w-36">
                      <p className="text-xs font-semibold text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.role.split('&')[0].trim()}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-12 grid grid-cols-2 gap-4 w-full">
              {activeBoardMembers.map((member) => (
                <div key={member.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className={`${member.color} rounded-full w-8 h-8 flex items-center justify-center text-white flex-shrink-0`}>
                    <member.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {member.expertise.map((exp) => (
                        <Badge key={exp} variant="outline" className="text-xs">
                          {exp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inactive Members - Pending */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Board Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inactiveBoardMembers.map((member) => (
              <div key={member.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`${member.color} rounded-full w-12 h-12 flex items-center justify-center text-white flex-shrink-0 opacity-50`}>
                    <member.icon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{member.name}</p>
                    <Badge variant="outline" className="mt-1 bg-yellow-50 text-yellow-700 border-yellow-200">
                      Awaiting Confirmation
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{member.role}</p>
                <p className="text-xs text-muted-foreground">Status: Invitation sent</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Meetings */}
      <Card>
        <CardHeader>
          <CardTitle>Board Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading meetings...</div>
          ) : meetings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No board meetings yet. Click "Call Meeting" to start one.
            </div>
          ) : (
            <div className="space-y-3">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-foreground">{meeting.title}</h4>
                    <Badge variant={meeting.status === 'concluded' ? 'outline' : 'default'}>
                      {meeting.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Called by: {meeting.called_by}</p>
                  <div className="flex gap-2 flex-wrap">
                    {meeting.attendees?.map((attendee) => (
                      <Badge key={attendee} variant="secondary" className="text-xs">
                        {attendee}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// New Meeting Form Component
function NewMeetingForm({ onClose }) {
  const [topic, setTopic] = useState('');
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const [loading, setLoading] = useState(false);

  const availableAttendees = boardMembers.filter(m => m.status === 'active').map(m => m.name);

  const handleCreateMeeting = async () => {
    if (!topic.trim() || selectedAttendees.length === 0) {
      alert('Please enter a topic and select at least one attendee');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('boardMeetingOrchestrator', {
        action: 'create',
        topic,
        attendees: selectedAttendees
      });
      alert(`Board meeting called: ${response.data.meeting_id}`);
      setTopic('');
      setSelectedAttendees([]);
      onClose();
      // Refresh page or refetch meetings
      window.location.reload();
    } catch (err) {
      alert(`Error creating meeting: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendee = (name) => {
    setSelectedAttendees(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle>Call a Board Meeting</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-foreground block mb-2">Meeting Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Pricing Strategy for CaseNarrative"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground block mb-2">Select Attendees</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {availableAttendees.map((attendee) => (
              <button
                key={attendee}
                onClick={() => toggleAttendee(attendee)}
                className={`p-2 rounded-lg text-sm font-medium text-left transition ${
                  selectedAttendees.includes(attendee)
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-slate-300 text-foreground hover:bg-slate-50'
                }`}
              >
                ✓ {attendee}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleCreateMeeting}
            disabled={loading || !topic.trim() || selectedAttendees.length === 0}
            className="flex-1"
          >
            {loading ? 'Creating...' : 'Call Meeting'}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}