import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, Shield, Users, Palette } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    appName: 'Base44 Board',
    adminEmail: 'admin@example.com',
    timezone: 'UTC',
    theme: 'light',
    notifications: true,
  });

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // In a real app, this would persist to the backend
    console.log('Settings saved:', settings);
  };

  const settingsSections = [
    {
      icon: Palette,
      title: 'General Settings',
      fields: [
        { label: 'Application Name', field: 'appName' },
        { label: 'Timezone', field: 'timezone' },
        { label: 'Theme', field: 'theme' },
      ]
    },
    {
      icon: Shield,
      title: 'Security',
      fields: [
        { label: 'Admin Email', field: 'adminEmail' },
      ]
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Enable or disable system notifications',
      action: 'notifications'
    }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage application preferences and configurations</p>
      </div>

      <div className="space-y-4">
        {settingsSections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <Card key={idx}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-primary" />
                  <div>
                    <CardTitle>{section.title}</CardTitle>
                    {section.description && <CardDescription>{section.description}</CardDescription>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.fields && section.fields.map((fieldConfig) => (
                  <div key={fieldConfig.field} className="space-y-2">
                    <Label>{fieldConfig.label}</Label>
                    <Input
                      value={settings[fieldConfig.field] || ''}
                      onChange={(e) => handleInputChange(fieldConfig.field, e.target.value)}
                      className="max-w-md"
                    />
                  </div>
                ))}

                {section.action === 'notifications' && (
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={(e) => handleInputChange('notifications', e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <Label className="cursor-pointer">Enable system notifications</Label>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
          Save Settings
        </Button>
        <Button variant="outline">Reset to Defaults</Button>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> Settings are currently stored locally. To persist changes to your backend, connect these settings to your database.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}